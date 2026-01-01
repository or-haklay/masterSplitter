#!/bin/bash
echo "Checking if MongoDB is installed..."

if command -v mongod &> /dev/null; then
    echo "✅ MongoDB is already installed"
    mongod --version
else
    echo "❌ MongoDB not found. Installing..."
    # Ubuntu/Debian
    wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
    sudo apt-get update
    sudo apt-get install -y mongodb-org
    sudo systemctl start mongod
    sudo systemctl enable mongod
    echo "✅ MongoDB installed successfully"
fi

# Create database for Master Splitter
echo "Creating master_splitter database..."
mongosh --eval "use master_splitter; db.createCollection('users'); print('Database ready');"

echo "✅ MongoDB check completed"

