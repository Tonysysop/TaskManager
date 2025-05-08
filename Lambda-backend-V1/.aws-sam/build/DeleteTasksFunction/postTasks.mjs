// index.js
import { MongoClient } from 'mongodb';

let cachedClient = null;
let cachedDb = null;

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'tinumindDB';
const collectionName = process.env.COLLECTION_NAME || 'Tasks';

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }
  if (!uri) {
    throw new Error('Missing MONGODB_URI environment variable');
  }
  const client = new MongoClient(uri, {
    serverApi: { version: '1', strict: true, deprecationErrors: true }
  });
  await client.connect();
  const db = client.db(dbName);
  cachedClient = client;
  cachedDb = db;
  return { client, db };
}

// ✅ CORS headers you need to include in ALL responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // or specify origin like 'http://localhost:5173'
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
};

export async function handler(event) {
  // ✅ Handle OPTIONS preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (err) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Invalid JSON body' })
    };
  }

  // Validate required fields
  if (!body.id || !body.task || !body.status) {
    return {
      statusCode: 422,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Missing required task fields (id, task, status)' })
    };
  }

  try {
    const { db } = await connectToDatabase();
    const filter = { id: body.id };
    const update = {
      $set: {
        userId: body.userId,
        task: body.task,
        description: body.description || '',
        status: body.status,
        priority: body.priority || 'Normal',
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        tags: body.tags || [],
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    };
    const options = { upsert: true };

    const result = await db
      .collection(collectionName)
      .updateOne(filter, update, options);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        message: result.upsertedCount ? 'Created new task' : 'Updated task',
        taskId: body.id
      })
    };
  } catch (err) {
    console.error('MongoDB error:', err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Failed to save task' })
    };
  }
}
