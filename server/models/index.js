const { getConnectedClient } = require("../database");

const getCollection = async () => {
  try {
    const client = getConnectedClient();
    if (!client) {
      console.error("No MongoDB client available");
      throw new Error("Database connection not available");
    }
    
    const collection = client.db("todosdb").collection("todos");
    return collection;
  } catch (error) {
    console.error("Error getting collection:", error);
    throw error;
  }
};

module.exports = { getCollection };