import { MongoClient } from "mongodb";

const CORS_HEADERS = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Headers":
		"Content-Type,X-Amz-Date,Authorization,X-Amz-Security-Token,traceparent,tracestate",
	"Access-Control-Allow-Methods": "OPTIONS,POST,GET,PATCH,DELETE",
};

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || "Tinumind";
const collectionName = process.env.NOTES_COLLECTION_NAME || "Notes";

let cachedClient = null;

async function connectToDatabase() {
	if (cachedClient?.topology?.isConnected?.()) {
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
	if (event.httpMethod === "OPTIONS") {
		return {
			statusCode: 200,
			headers: CORS_HEADERS,
			body: "",
		};
	}

	const client = await connectToDatabase();
	const db = client.db(dbName);
	const collection = db.collection(collectionName);
	const method = event.httpMethod;
	const userId = event.queryStringParameters?.userId;

	if (!userId) {
		return {
			statusCode: 400,
			headers: CORS_HEADERS,
			body: JSON.stringify({ error: "Missing userId in query parameters" }),
		};
	}

	try {
		switch (method) {
			case "GET": {
				const notes = await collection.find({ userId }).toArray();
				return {
					statusCode: 200,
					headers: CORS_HEADERS,
					body: JSON.stringify(notes),
				};
			}

			case "POST": {
				const note = JSON.parse(event.body);
				note.userId = userId;
				note.createdAt = new Date();
				note.updatedAt = new Date();
				note.isDeleted = false;

				const result = await collection.insertOne(note);
				return {
					statusCode: 201,
					headers: CORS_HEADERS,
					body: JSON.stringify({ insertedId: result.insertedId }),
				};
			}

			case "PATCH": {
				const { id, ...updates } = JSON.parse(event.body);
				if (!id) {
					return {
						statusCode: 400,
						headers: CORS_HEADERS,
						body: JSON.stringify({ error: "Missing note id" }),
					};
				}

				updates.updatedAt = new Date();

				const result = await collection.updateOne(
					{ id, userId }
,
					{ $set: updates }
				);

				return {
					statusCode: 200,
					headers: CORS_HEADERS,
					body: JSON.stringify({ matchedCount: result.matchedCount }),
				};
			}

			case "DELETE": {
				const { id } = JSON.parse(event.body);
				if (!id) {
					return {
						statusCode: 400,
						headers: CORS_HEADERS,
						body: JSON.stringify({ error: "Missing note id" }),
					};
				}

				const result = await collection.deleteOne({
					id,
					userId,
				});

				return {
					statusCode: 200,
					headers: CORS_HEADERS,
					body: JSON.stringify({ deletedCount: result.deletedCount }),
				};
			}

			default:
				return {
					statusCode: 405,
					headers: CORS_HEADERS,
					body: JSON.stringify({ error: "Method Not Allowed" }),
				};
		}
	} catch (err) {
		console.error("Lambda Error:", err);
		return {
			statusCode: 500,
			headers: CORS_HEADERS,
			body: JSON.stringify({ error: "Internal Server Error" }),
		};
	}
};
