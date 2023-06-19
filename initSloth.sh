#!/bin/bash

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Installing Node.js..."

    # Install Node.js using package manager (apt, yum, etc.)
    # Replace the package manager command with the appropriate one for your system

    # For Debian/Ubuntu
    #sudo apt update
    #sudo apt install -y nodejs

    echo "NVM not found. Installing NVM..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    echo "NVM installed successfully."

    # Load NVM
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
    
    # Install the latest version of Node.js
    echo "Installing the latest version of Node.js..."
    nvm install node
    
    # Verify Node.js installation
    echo "Node.js version:"
    node --version

    # For CentOS/RHEL
    
    # sudo yum install -y nodejs

    echo "Node.js installed successfully."
else
    echo "Node.js is already installed."
fi

#Download Slow Query Logging Script


curl -LO https://raw.githubusercontent.com/rohangarg680/rg_code_snippets/main/slowQueryLogging.js

current_path=$(pwd)

node_path=$(which node)
# Define the cron job command
cron_command="cd $current_path && $node_path slowQueryLogging.js" 

# Add the cron job to the crontab
{ crontab -l; echo "* * * * * $cron_command "; } | crontab -

echo "Cron job added successfully."
