import { MongoClient } from 'mongodb';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,traceparent,tracestate',
  'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PATCH,DELETE',
};

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) return cachedDb;

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME || 'TinumindDB';

  if (!uri) throw new Error('Missing MONGODB_URI');

  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  cachedDb = client.db(dbName);
  return cachedDb;
}

export async function handler(event) {
  const { httpMethod } = event;

  if (httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  const db = await connectToDatabase();
  const collection = db.collection(process.env.TAG_COLLECTION_NAME || 'Tags');

  switch (httpMethod) {
    case 'POST':
      return handlePost(event, collection);
    case 'GET':
      return handleGet(event, collection);
    case 'PATCH':
      return handlePatch(event, collection);
    case 'DELETE':
      return handleDelete(event, collection);
    default:
      return {
        statusCode: 405,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Method Not Allowed' }),
      };
  }
}

async function handlePost(event, collection) {
  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Invalid JSON body' }),
    };
  }

  const { tagId, name, color, userId } = body;

  if (!tagId || !name || !color || !userId) {
    return {
      statusCode: 422,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Missing required fields: tagId, name, color, userId' }),
    };
  }

  const existing = await collection.findOne({ name, userId });
  if (existing) {
    return {
      statusCode: 409,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Tag name already exists for this user' }),
    };
  }

  const newTag = {
    tagId,
    name,
    color,
    userId,
    createdAt: new Date(),
  };

  await collection.insertOne(newTag);
  return {
    statusCode: 201,
    headers: corsHeaders,
    body: JSON.stringify({ message: 'Tag created', tag: newTag }),
  };
}

async function handleGet(event, collection) {
  const { userId } = event.queryStringParameters || {};

  if (!userId) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Missing userId parameter' }),
    };
  }

  const tags = await collection.find({ userId }).toArray();

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify(tags),
  };
}

async function handlePatch(event, collection) {
  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Invalid JSON body' }),
    };
  }

  const { tagId, userId, name, color } = body;

  if (!tagId || !userId || !name || !color) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'tagId, userId, name, and color are required' }),
    };
  }

  const existing = await collection.findOne({ name, userId, tagId: { $ne: tagId } });
  if (existing) {
    return {
      statusCode: 409,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Another tag with this name already exists for this user' }),
    };
  }

  const result = await collection.updateOne(
    { tagId, userId },
    { $set: { name, color } }
  );

  if (result.matchedCount === 0) {
    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Tag not found or not authorized' }),
    };
  }

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({ message: 'Tag updated' }),
  };
}

async function handleDelete(event, collection) {
  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Invalid JSON body' }),
    };
  }

  const { tagId, userId } = body;

  if (!tagId || !userId) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'tagId and userId are required' }),
    };
  }

  const result = await collection.deleteOne({ tagId, userId });

  if (result.deletedCount === 0) {
    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Tag not found or not authorized' }),
    };
  }

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({ message: 'Tag deleted' }),
  };
}
