#!/bin/bash

# Get the directory where this script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Change to the project directory
cd "$DIR"

# Display welcome message
echo "Starting Invoice App..."
echo "Opening browser in 5 seconds..."

# Run the npm start command to launch both servers
npm run start

# Note: This window will remain open while the servers are running.
# Close this window to shut down the servers. 