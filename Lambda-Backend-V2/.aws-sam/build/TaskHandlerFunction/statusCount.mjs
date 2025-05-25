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
  cachedDb = client.db(process.env.DB_NAME || 'TinumindDB');
  
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
    const tasksCollection = db.collection(process.env.COLLECTION_NAME || 'Tasks');

    console.log(`Fetching task stats for userId: ${userId}`);

    // 1. Get counts for each status using aggregate
    const statusCountsPipeline = [
      { $match: { userId: userId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ];
    const statusResults = await tasksCollection.aggregate(statusCountsPipeline).toArray();

    const stats = {
      Planned: 0,
      InProgress: 0,
      Completed: 0,
      late: 0 // Initialize late count
    };

    statusResults.forEach(item => {
      if (!item._id) return; // Skip if _id is null or undefined
      const statusKey = item._id.toLowerCase();
      if (statusKey === 'planned') stats.Planned = item.count;
      else if (statusKey === 'in progress' || statusKey === 'in-progress') stats.InProgress += item.count; // Use += and ensure it's initialized to 0
      else if (statusKey === 'completed') stats.Completed = item.count;
    });

    // 2. Get count of late tasks
    const now = new Date();
    console.log('Current Time (Now):', now);

    const nonLateableStatuses = ['Completed']; 

    const lateTasksCount = await tasksCollection.countDocuments({
      userId: userId,
      status: { $nin: nonLateableStatuses },
      dueDate: { 
        $lt: now,
        $ne: null
      } 
    });
    
    console.log('Late Tasks Count:', lateTasksCount);

    stats.late = lateTasksCount; // Assign the calculated count

    console.log(`Stats for userId ${userId}:`, stats);

    return {
      statusCode: 200,
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
