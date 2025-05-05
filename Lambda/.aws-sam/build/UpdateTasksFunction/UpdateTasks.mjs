// updateTask.mjs
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'tinumindDB';
const collectionName = process.env.COLLECTION_NAME || 'Tasks';

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  if (!uri) throw new Error('Missing MONGODB_URI');
  const client = new MongoClient(uri, {
    serverApi: { version: '1', strict: true, deprecationErrors: true },
  });
  await client.connect();
  cachedClient = client;
  cachedDb = client.db(dbName);
  return cachedDb;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'OPTIONS,POST,PATCH',
};

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  if (event.httpMethod !== 'PATCH') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const db = await connectToDatabase();
    const { taskId, userId, newStatus } = JSON.parse(event.body);

    if (!taskId || !userId || !newStatus) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'taskId, userId, and newStatus are required' }),
      };
    }

    const result = await db.collection(collectionName).updateOne(
      { id: taskId, userId },
      { $set: { status: newStatus } }
    );

    if (result.matchedCount === 0) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Task not found or not authorized' }),
      };
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Task status updated' }),
    };
  } catch (err) {
    console.error('Update error:', err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Server error' }),
    };
  }
}