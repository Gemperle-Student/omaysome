const express = require("express");
const path = require('path');
const fs = require('fs');

const app = express();

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

// Use the client/build directory for static files
app.use(express.static(buildPath));

app.get("*", (req, res) => {
  const indexPath = path.join(buildPath, 'index.html');
  
  // Check if index.html exists
  try {
    if (fs.existsSync(indexPath)) {
      console.log('✅ Serving index.html for path:', req.path);
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

const port = 5000;

app.listen(port, () => {
  console.log(`Test server is listening on http://localhost:${port}`);
}); 