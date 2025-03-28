require("dotenv").config();
const express = require("express");
const { connectToMongoDB } = require("./database");
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());

// Determine if we're in production (Render) or local development
const isProduction = process.env.NODE_ENV === 'production';

// Set the correct build path based on environment
let buildPath;
if (isProduction) {
  // In production on Render - use the exact path
  buildPath = '/opt/render/project/src/client/build';
  console.log(`Using production build path: ${buildPath}`);
} else {
  // Local development
  buildPath = path.join(__dirname, '../client/build');
  console.log(`Using development build path: ${buildPath}`);
}

// Use the client/build directory for static files
app.use(express.static(buildPath));

const router = require("./routes");
app.use("/api", router);

// Catch-all route to serve the React app for any other route
app.get("*", (req, res) => {
  const indexPath = path.join(buildPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error(`Error sending index.html: ${err.message}`);
      res.status(500).send(`Server error: ${err.message}`);
    }
  });
});

const port = process.env.PORT || 3000;

const startServer = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await connectToMongoDB();
        console.log('MongoDB connected successfully');
        
        app.listen(port, () => {
            console.log(`Server is listening on http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
    }
};

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

startServer();