#!/bin/bash

# Exit on error
set -e

# Log
echo "Starting build process..."

# Install dependencies for server
echo "Installing server dependencies..."
cd server
npm install

# Go back to root and install client dependencies
echo "Installing client dependencies..."
cd ../client
npm install

# Build the client
echo "Building client..."
npm run build

# Go back to root
cd ..

echo "Build process completed." 