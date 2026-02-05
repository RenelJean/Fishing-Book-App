#!/bin/bash

# This script sets up the development environment for the Fishing Platform project.

# Navigate to the mobile app directory and install dependencies
cd apps/mobile
npm install

# Navigate to the web app directory and install dependencies
cd ../web
npm install

# Navigate to the API directory and install dependencies
cd ../api
npm install

# Navigate to the UI package directory and install dependencies
cd ../../packages/ui
npm install

# Navigate to the services package directory and install dependencies
cd ../services
npm install

# Navigate to the trophy feature directory and install dependencies
cd ../../features/trophy
npm install

# Return to the root directory
cd ../../

# Start the development servers for mobile and web apps
npm run start --workspace=apps/mobile &
npm run start --workspace=apps/web &

# Start the API server
npm run start --workspace=apps/api &

# Wait for all background processes to finish
wait

echo "Development environment is set up and running!"