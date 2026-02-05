#!/bin/bash

# This script sets up the development workspace for the fishing platform project.

# Install necessary dependencies for the mobile app
cd apps/mobile
npm install

# Install necessary dependencies for the web app
cd ../web
npm install

# Install necessary dependencies for the API
cd ../api
npm install

# Install necessary dependencies for the UI package
cd ../../packages/ui
npm install

# Install necessary dependencies for the services package
cd ../services
npm install

# Install necessary dependencies for the trophy feature
cd ../../features/trophy
npm install

# Return to the root directory
cd ../../

echo "Workspace setup complete!"