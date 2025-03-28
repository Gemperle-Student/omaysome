require("dotenv").config();
const express = require("express");
const { connectToMongoDB } = require("./database");
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());

// Log the build path
const buildPath = path.join(__dirname, '../client/build');
console.log('Using build path:', buildPath);

// Check if build directory exists
try {
  if (fs.existsSync(buildPath)) {
    console.log('✅ Build directory exists');
  } else {
    console.error('❌ Build directory does not exist:', buildPath);
  }
} catch (err) {
  console.error('Error checking build directory:', err);
}

// Use the client/build directory for static files instead
app.use(express.static(buildPath));

app.get("/", (req, res) => {
  const indexPath = path.join(buildPath, 'index.html');
  
  // Check if index.html exists
  try {
    if (fs.existsSync(indexPath)) {
      console.log('✅ index.html exists');
      res.sendFile(indexPath);
    } else {
      console.error('❌ index.html does not exist:', indexPath);
      res.status(404).send('index.html not found');
    }
  } catch (err) {
    console.error('Error checking index.html:', err);
    res.status(500).send('Server error checking index.html');
  }
});

const router = require("./routes");
app.use("/api", router);

// Catch-all route to serve the React app for any other route
app.get("*", (req, res) => {
  const indexPath = path.join(buildPath, 'index.html');
  
  try {
    if (fs.existsSync(indexPath)) {
      console.log('✅ Serving index.html for path:', req.path);
      res.sendFile(indexPath);
    } else {
      console.error('❌ index.html does not exist:', indexPath);
      res.status(404).send('index.html not found');
    }
  } catch (err) {
    console.error('Error serving index.html:', err);
    res.status(500).send('Server error');
  }
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