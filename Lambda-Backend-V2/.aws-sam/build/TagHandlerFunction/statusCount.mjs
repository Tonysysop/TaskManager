import { MongoClient } from 'mongodb';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PATCH,DELETE',
};

let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) return cachedDb;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Missing MONGODB_URI');

  const client = new MongoClient(uri, {
    serverApi: { version: '1', strict: true, deprecationErrors: true },
  });

  await client.connect();
  cachedDb = client.db(process.env.DB_NAME || 'tinumindDB');
  
  return cachedDb;
}

export async function handler(event) {
  // Log the event for debugging
  console.log('Received event:', JSON.stringify(event, null, 2));

  // Handle GET request
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405, // Method Not Allowed
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  // Extract query parameters (e.g., userId)
  const userId = event.queryStringParameters && event.queryStringParameters.userId;

  if (!userId) {
    return {
      statusCode: 400, // Bad Request
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: 'Missing or invalid userId parameter' }),
    };
  }

  try {
    const db = await connectToDatabase();
    const tasksCollection = db.collection('Tasks'); // Get your tasks collection by name

    console.log(`Fetching task stats for userId: ${userId}`);

    // 1. Get counts for each status using aggregate
    const statusCountsPipeline = [
      { $match: { userId: userId } }, // Match documents for the given user
      {
        $group: {
          _id: "$status", // Group by status
          count: { $sum: 1 } // Count the tasks for each status
        }
      }
    ];
    const statusResultsCursor = tasksCollection.aggregate(statusCountsPipeline);
    const statusResults = await statusResultsCursor.toArray(); // Convert cursor to array

    const stats = {
      Planned: 0,
      InProgress: 0, // Will be mapped from "In-Progress"
      Completed: 0,
      late: 0
    };

    // Normalize status names and map counts to stats object
    statusResults.forEach(item => {
      if (item._id === 'Planned') stats.Planned = item.count;
      else if (item._id === 'In Progress' || item._id === 'In-Progress') stats.InProgress = item.count;
      else if (item._id === 'Completed') stats.Completed = item.count;
    });

    // 2. Get count of late tasks
    const now = new Date();
    console.log('Current Time (Now):', now);

    const lateTasksCount = await tasksCollection.countDocuments({
      userId: userId,
      status: { $ne: 'Completed' },
      dueDate: { $lt: now }
    });

console.log('Late Tasks Count:', lateTasksCount);


    console.log(`Stats for userId ${userId}:`, stats);

    return {
      statusCode: 200, // OK
      headers: CORS_HEADERS,
      body: JSON.stringify(stats),
    };

  } catch (error) {
    console.error('Error processing request:', error);
    return {
      statusCode: 500, // Internal Server Error
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: 'Failed to retrieve task statistics.', error: error.message }),
    };
  }
};
