import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'tinumindDB';
const collectionName = process.env.COLLECTION_NAME || 'Tasks';

let cachedClient2 = null;
let cachedDb2 = null;

async function connectToDatabaseGet() {
  if (cachedDb2) return cachedDb2;
  if (!uri) throw new Error('Missing MONGODB_URI');
  const client = new MongoClient(uri, {
    serverApi: { version: '1', strict: true, deprecationErrors: true }
  });
  await client.connect();
  const db = client.db(dbName);
  cachedClient2 = client;
  cachedDb2 = db;
  return db;
}

// ✅ CORS headers you need to include in ALL responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // or specify origin like 'http://localhost:5173'
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
};

export async function handler(event) {
  try {
    // Retrieve userSub from query parameters
    const { userId } = event.queryStringParameters;
    
    if (!userId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Missing userId parameter' }),
      };
    }

    // Connect to the database
    const db = await connectToDatabaseGet();
    
    // Fetch tasks for the specific user
    const tasks = await db.collection(collectionName).find({ userId }).toArray();

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(tasks),
    };
  } catch (err) {
    console.error('DB error', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'DB error' }) };
  }
}
