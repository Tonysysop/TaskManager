import { MongoClient } from "mongodb";

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PATCH,DELETE',
};

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || "Tinumind";
const collectionName = process.env.FEEDBACK_COLLECTION_NAME || "Feedback";

let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient?.topology?.isConnected()) {
    return cachedClient;
  }

  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await client.connect();
  cachedClient = client;
  return client;
}

export const handler = async (event) => {
  const client = await connectToDatabase();
  const db = client.db(dbName);
  const collection = db.collection(collectionName);
  const method = event.httpMethod;

  try {
    if (method === "GET") {
      const userId = event.queryStringParameters?.userId;
      const userGroup = event.queryStringParameters?.userGroup;

      if (!userId) {
        return {
          headers: CORS_HEADERS,
          statusCode: 400,
          body: JSON.stringify({ error: "Missing userId query parameter" }),
        };
      }

      let query;

      // If user is in the admin group, return all feedback
      if (userGroup === "Tinumind-admin") {
        query = {}; // No filter – return all
      } else {
        // Regular user: public + own private feedback
        query = {
          $or: [
            { visibility: 'public' },
            { userId: userId, visibility: 'private' }
          ]
        };
      }

      const feedbacks = await collection.find(query).sort({ createdAt: -1 }).toArray();

      return {
        headers: CORS_HEADERS,
        statusCode: 200,
        body: JSON.stringify(feedbacks),
      };
    }

    if (method === "POST") {
      const body = JSON.parse(event.body);
      const { email, feedback, name, type, userId, visibility } = body;

      if (!email || !feedback || !name || !type || !userId || !visibility) {
        return {
          headers: CORS_HEADERS,
          statusCode: 400,
          body: JSON.stringify({ error: "Missing required feedback fields" }),
        };
      }

      if (!['public', 'private'].includes(visibility)) {
        return {
          headers: CORS_HEADERS,
          statusCode: 400,
          body: JSON.stringify({ error: "Invalid visibility value" }),
        };
      }

      const newFeedback = {
        email,
        feedback,
        name,
        feedbackType: type,
        userId,
        visibility,
        createdAt: new Date().toISOString(),
      };

      const result = await collection.insertOne(newFeedback);

      return {
        headers: CORS_HEADERS,
        statusCode: 201,
        body: JSON.stringify({ 
          message: "Feedback saved", 
          id: result.insertedId,
          feedback: newFeedback
        }),
      };
    }

    return {
      headers: CORS_HEADERS,
      statusCode: 405,
      body: JSON.stringify({ error: `Method ${method} not allowed` }),
    };
  } catch (error) {
    console.error("Error in Lambda:", error);
    return {
      headers: CORS_HEADERS,
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
