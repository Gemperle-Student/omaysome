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
  buildPath = '/opt/render/project/src/client/build';
} else {
  buildPath = path.join(__dirname, '../client/build');
}
console.log(`Using build path: ${buildPath}`);

// Create fallback HTML if index.html doesn't exist in production
if (isProduction) {
  try {
    const indexPath = path.join(buildPath, 'index.html');
    if (!fs.existsSync(buildPath)) {
      console.log('Creating build directory because it doesn\'t exist');
      fs.mkdirSync(buildPath, { recursive: true });
    }
    
    if (!fs.existsSync(indexPath)) {
      console.log('Creating fallback index.html');
      const fallbackHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Todo App</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background-color: #f5f5f5;
            }
            h1 { color: #333; }
            .container {
              background: white;
              padding: 2rem;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              text-align: center;
            }
            .api-link {
              margin-top: 1rem;
              color: #0066ff;
              text-decoration: none;
            }
            .api-link:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Todo App</h1>
            <p>Welcome to the Todo App! The API is running at:</p>
            <a class="api-link" href="/api/todos">/api/todos</a>
          </div>
        </body>
        </html>
      `;
      fs.writeFileSync(indexPath, fallbackHtml);
      console.log('Fallback index.html created successfully');
    }
  } catch (err) {
    console.error('Error creating fallback files:', err);
  }
}

// Use the build directory for static files
app.use(express.static(buildPath));

const router = require("./routes");
app.use("/api", router);

// Catch-all route to serve index.html
app.get("*", (req, res) => {
  const indexPath = path.join(buildPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error(`Error sending index.html: ${err.message}`);
      // Send a plain text response if file can't be served
      res.status(200).send(`
        Todo App is running! 
        The API is available at /api/todos.
        Error serving index.html: ${err.message}
      `);
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