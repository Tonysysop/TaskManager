// handler.js
import { MongoClient } from 'mongodb';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
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
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  const db = await connectToDatabase();
  const tasks = db.collection(process.env.COLLECTION_NAME || 'Tasks');

  try {
    switch (event.httpMethod) {
      case 'GET':
        return await handleGet(event, tasks);
      case 'POST':
        return await handlePost(event, tasks);
      case 'PATCH':
        return await handlePatch(event, tasks);
      case 'DELETE':
        return await handleDelete(event, tasks);
      default:
        return { statusCode: 405, headers: CORS_HEADERS, body: 'Method Not Allowed' };
    }
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}

// GET /tasks?userId=…
async function handleGet(event, tasks) {
  const userId = event.queryStringParameters?.userId;
  if (!userId) {
    return { statusCode: 400, headers: CORS_HEADERS, body: 'Missing userId' };
  }
  const all = await tasks.find({ userId }).toArray();
  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify(all),
  };
}

// POST only creates; fails if that id already exists
async function handlePost(event, tasks) {
  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers: CORS_HEADERS, body: 'Invalid JSON' };
  }

  const { id, userId, task, status } = body;
  if (!id || !userId || !task || !status) {
    return {
      statusCode: 422,
      headers: CORS_HEADERS,
      body: 'Missing required fields: id, userId, task, status',
    };
  }

  // Prevent overwriting an existing task
  const exists = await tasks.findOne({ id, userId });
  if (exists) {
    return {
      statusCode: 409,
      headers: CORS_HEADERS,
      body: 'Task with that id already exists',
    };
  }

  // Normalize and insert
  const doc = {
    ...body,
    dueDate: body.dueDate ? new Date(body.dueDate) : null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await tasks.insertOne(doc);

  return {
    statusCode: 201,
    headers: CORS_HEADERS,
    body: JSON.stringify({ message: 'Created new task', taskId: id }),
  };
}

// PATCH does a partial update of exactly the fields you send
async function handlePatch(event, tasks) {
  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers: CORS_HEADERS, body: 'Invalid JSON' };
  }

  const { id, userId, ...updates } = body;
  if (!id || !userId) {
    return {
      statusCode: 422,
      headers: CORS_HEADERS,
      body: 'Missing required fields: id, userId',
    };
  }

  // Convert any date strings
  if (updates.dueDate) {
    updates.dueDate = new Date(updates.dueDate);
  }

  const setFields = {
    ...updates,
    updatedAt: new Date(),
  };

  const result = await tasks.updateOne(
    { id, userId },
    { $set: setFields }
  );

  if (result.matchedCount === 0) {
    return {
      statusCode: 404,
      headers: CORS_HEADERS,
      body: 'Task not found or not authorized',
    };
  }

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({ message: 'Task updated', taskId: id }),
  };
}

// DELETE { taskId, userId }
async function handleDelete(event, tasks) {
  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers: CORS_HEADERS, body: 'Invalid JSON' };
  }

  const { taskId, userId } = body;
  if (!taskId || !userId) {
    return { statusCode: 422, headers: CORS_HEADERS, body: 'Missing taskId or userId' };
  }

  const res = await tasks.deleteOne({ id: taskId, userId });
  if (res.deletedCount === 0) {
    return { statusCode: 404, headers: CORS_HEADERS, body: 'Not found or unauthorized' };
  }
  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({ message: 'Deleted' }),
  };
}
























// // handler.js or index.js (merged function with DB connection inside)
// import { MongoClient } from 'mongodb';

// const corsHeaders = {
//   'Access-Control-Allow-Origin': '*',
//   'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
//   'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PATCH,DELETE',
// };

// let cachedClient = null;
// let cachedDb = null;

// // Function to connect to MongoDB
// async function connectToDatabase() {
//   if (cachedDb) return cachedDb;
  
//   const uri = process.env.MONGODB_URI;
//   const dbName = process.env.DB_NAME || 'tinumindDB';
  
//   if (!uri) throw new Error('Missing MONGODB_URI');
  
//   const client = new MongoClient(uri, {
//     serverApi: { version: '1', strict: true, deprecationErrors: true },
//   });
  
//   await client.connect();
//   cachedClient = client;
//   cachedDb = client.db(dbName);
  
//   return cachedDb;
// }

// export async function handler(event) {
//   const { httpMethod } = event;

//   if (httpMethod === 'OPTIONS') {
//     return {
//       statusCode: 200,
//       headers: corsHeaders,
//       body: '',
//     };
//   }

//   // Connect to the database once per Lambda invocation
//   const db = await connectToDatabase();
//   const collection = db.collection(process.env.COLLECTION_NAME || 'Tasks');

//   switch (httpMethod) {
//     case 'POST':
//       return handlePost(event, collection);
//     case 'GET':
//       return handleGet(event, collection);
//     case 'PATCH':
//       return handlePatch(event, collection);
//     case 'DELETE':
//       return handleDelete(event, collection);
//     default:
//       return {
//         statusCode: 405,
//         headers: corsHeaders,
//         body: JSON.stringify({ error: 'Method Not Allowed' }),
//       };
//   }
// }

// async function handlePost(event, collection) {
//   let body;
//   try {
//     body = JSON.parse(event.body);
//   } catch (err) {
//     return {
//       statusCode: 400,
//       headers: corsHeaders,
//       body: JSON.stringify({ error: 'Invalid JSON body' }),
//     };
//   }

//   if (!body.id || !body.task || !body.status) {
//     return {
//       statusCode: 422,
//       headers: corsHeaders,
//       body: JSON.stringify({ error: 'Missing required task fields (id, task, status)' }),
//     };
//   }

//   const filter = { id: body.id };
//   const update = {
//     $set: {
//       userId: body.userId,
//       task: body.task,
//       description: body.description || '',
//       checklist: body.checklist || [],
//       status: body.status,
//       priority: body.priority || 'Normal',
//       dueDate: body.dueDate ? new Date(body.dueDate) : null,
//       tags: body.tags || [],
//       showDescriptionOnCard: body.showDescriptionOnCard, // Added preference for showDescriptionOnCard
//       showChecklistOnCard: body.showChecklistOnCard, 
//       updatedAt: new Date(),
//     },
//     $setOnInsert: {
//       createdAt: new Date(),
//     },
//   };
//   const options = { upsert: true };

//   const result = await collection.updateOne(filter, update, options);

//   return {
//     statusCode: 200,
//     headers: corsHeaders,
//     body: JSON.stringify({
//       message: result.upsertedCount ? 'Created new task' : 'Updated task',
//       taskId: body.id,
//     }),
//   };
// }

// async function handleGet(event, collection) {
//   const { userId } = event.queryStringParameters;

//   if (!userId) {
//     return {
//       statusCode: 400,
//       headers: corsHeaders,
//       body: JSON.stringify({ error: 'Missing userId parameter' }),
//     };
//   }

//   const tasks = await collection.find({ userId }).toArray();

//   return {
//     statusCode: 200,
//     headers: corsHeaders,
//     body: JSON.stringify(tasks),
//   };
// }

// async function handlePatch(event, collection) {
//   let body;
//   try {
//     body = JSON.parse(event.body);
//   } catch (err) {
//     return {
//       statusCode: 400,
//       headers: corsHeaders,
//       body: JSON.stringify({ error: 'Invalid JSON body' }),
//     };
//   }

//   const { taskId, userId, newStatus } = body;

//   if (!taskId || !userId || !newStatus) {
//     return {
//       statusCode: 400,
//       headers: corsHeaders,
//       body: JSON.stringify({ error: 'taskId, userId, and newStatus are required' }),
//     };
//   }

//   const result = await collection.updateOne(
//     { id: taskId, userId },
//     { $set: { status: newStatus } }
//   );

//   if (result.matchedCount === 0) {
//     return {
//       statusCode: 404,
//       headers: corsHeaders,
//       body: JSON.stringify({ error: 'Task not found or not authorized' }),
//     };
//   }

//   return {
//     statusCode: 200,
//     headers: corsHeaders,
//     body: JSON.stringify({ message: 'Task status updated' }),
//   };
// }

// async function handleDelete(event, collection) {
//   let body;
//   try {
//     body = JSON.parse(event.body);
//   } catch (err) {
//     return {
//       statusCode: 400,
//       headers: corsHeaders,
//       body: JSON.stringify({ error: 'Invalid JSON body' }),
//     };
//   }

//   const { taskId, userId } = body;

//   if (!taskId || !userId) {
//     return {
//       statusCode: 400,
//       headers: corsHeaders,
//       body: JSON.stringify({ error: 'taskId and userId are required' }),
//     };
//   }

//   const result = await collection.deleteOne({ id: taskId, userId });

//   if (result.deletedCount === 0) {
//     return {
//       statusCode: 404,
//       headers: corsHeaders,
//       body: JSON.stringify({ error: 'Task not found or not authorized' }),
//     };
//   }

//   return {
//     statusCode: 200,
//     headers: corsHeaders,
//     body: JSON.stringify({ message: 'Task deleted' }),
//   };
// }
