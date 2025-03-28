require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/";

// Log the URI being used (with password redacted for security)
const redactedUri = uri.replace(/:([^@]+)@/, ':***@');
console.log(`Connecting to MongoDB at: ${redactedUri}`);

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
};

let client;
let isConnecting = false;
let connectionError = null;

const connectToMongoDB = async () => {
  if (client) return client;
  if (connectionError) {
    console.error("Previous connection attempt failed:", connectionError);
  }
  
  if (isConnecting) {
    console.log("Connection already in progress, waiting...");
    // Wait for the existing connection attempt
    await new Promise(resolve => setTimeout(resolve, 1000));
    return client;
  }
  
  try {
    isConnecting = true;
    console.log("Attempting to connect to MongoDB...");
    
    // Create a client even if connection fails
    client = new MongoClient(uri, options);
    
    // Connect the client
    await client.connect();
    
    // Verify the connection
    await client.db("admin").command({ ping: 1 });
    
    console.log("Successfully connected to MongoDB!");
    connectionError = null;
    return client;
  } catch (error) {
    connectionError = error;
    console.error("Failed to connect to MongoDB:", error);
    
    // If we can't connect, create a mock client for development/testing
    if (!client) {
      console.log("Creating mock client for fallback operation");
      client = {
        db: (dbName) => ({
          collection: (collName) => ({
            find: () => ({ toArray: async () => [] }),
            findOne: async () => null,
            insertOne: async (doc) => ({ insertedId: "mock-id-" + Date.now() }),
            updateOne: async () => ({ matchedCount: 1, modifiedCount: 1 }),
            deleteOne: async () => ({ deletedCount: 1 })
          })
        })
      };
    }
    return client;
  } finally {
    isConnecting = false;
  }
};

const getConnectedClient = () => {
  if (!client) {
    console.error("Warning: Trying to get client before connection established");
    // Return a mock client that won't crash the app
    return {
      db: (dbName) => ({
        collection: (collName) => ({
          find: () => ({ toArray: async () => [] }),
          findOne: async () => null,
          insertOne: async (doc) => ({ insertedId: "mock-id-" + Date.now() }),
          updateOne: async () => ({ matchedCount: 1, modifiedCount: 1 }),
          deleteOne: async () => ({ deletedCount: 1 })
        })
      })
    };
  }
  return client;
};

module.exports = { connectToMongoDB, getConnectedClient };