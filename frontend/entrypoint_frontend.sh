#!/bin/bash

if [ "$DEBUG" = "true" ]; then
    echo "Running Vite in development mode..."
    npm run dev --host >> /logs/log_react.log 2>&1
else
    echo "Running Vite in production mode..."
    npx serve -s dist >> /logs/log_react.log 2>&1
fi