const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb"); // Import ObjectId
const { getCollection } = require("./models/index");

// GET /todos
router.get("/todos", async (req, res) => {
    try {
        const collection = await getCollection();
        const todos = await collection.find({}).toArray();
        res.status(200).json(todos);
    } catch (error) {
        console.error("Error fetching todos:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// POST /todos
router.post("/todos", async (req, res) => {
    try {
        const collection = await getCollection();
        const { todo } = req.body;

        if (!todo) {
            return res.status(400).json({ error: "Todo is required" });
        }

        const newTodo = await collection.insertOne({ todo, status: false });
        res.status(201).json({ todo, status: false, _id: newTodo.insertedId });
    } catch (error) {
        console.error("Error creating todo:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// DELETE /todos/:id
router.delete("/todos/:id", async (req, res) => {
    try {
        const collection = await getCollection();
        const _id = new ObjectId(req.params.id);

        const deletedTodo = await collection.deleteOne({ _id });
        if (deletedTodo.deletedCount === 0) {
            return res.status(404).json({ error: "Todo not found" });
        }

        res.status(200).json(deletedTodo);
    } catch (error) {
        console.error("Error deleting todo:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// PUT /todos/:id
router.put("/todos/:id", async (req, res) => {
    try {
        const collection = await getCollection();
        const _id = new ObjectId(req.params.id);
        const { status } = req.body;

        const updatedTodo = await collection.updateOne({ _id }, { $set: { status: !status } });
        if (updatedTodo.matchedCount === 0) {
            return res.status(404).json({ error: "Todo not found" });
        }

        res.status(200).json(updatedTodo);
    } catch (error) {
        console.error("Error updating todo:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Export the router
module.exports = router;