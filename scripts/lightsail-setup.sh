#!/bin/bash
# Lightsail Server Setup Script for Master Splitter
# Run this once when setting up a new Lightsail instance

set -e

echo "🚀 Setting up Lightsail server for Master Splitter..."

# Update system
echo "📦 Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Node.js 20 (LTS) if not already installed
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "✅ Node.js already installed: $(node -v)"
fi

# Install PM2 globally if not already installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    sudo npm install -g pm2
    pm2 startup systemd -u ubuntu --hp /home/ubuntu
else
    echo "✅ PM2 already installed"
fi

# Install MongoDB if not already installed
if ! command -v mongod &> /dev/null; then
    echo "📦 Installing MongoDB 6.0..."
    wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
    sudo apt-get update
    sudo apt-get install -y mongodb-org
    sudo systemctl start mongod
    sudo systemctl enable mongod
    echo "✅ MongoDB installed and started"
else
    echo "✅ MongoDB already installed"
fi

# Install Nginx if not already installed
if ! command -v nginx &> /dev/null; then
    echo "📦 Installing Nginx..."
    sudo apt-get install -y nginx
    sudo systemctl enable nginx
else
    echo "✅ Nginx already installed"
fi

# Install Certbot for SSL
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing Certbot..."
    sudo apt-get install -y certbot python3-certbot-nginx
else
    echo "✅ Certbot already installed"
fi

# Configure firewall
echo "🔒 Configuring firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Create backup directory
echo "📁 Creating backup directory..."
mkdir -p /home/ubuntu/backups/mongodb

# Create logs directory for PM2
echo "📁 Creating logs directory..."
mkdir -p /home/ubuntu/masterSplitter/logs

echo ""
echo "✅ Server setup completed!"
echo ""
echo "Next steps:"
echo "1. Clone your repository: git clone https://github.com/youruser/masterSplitter.git"
echo "2. Configure .env files in backend/ and frontend/"
echo "3. Copy nginx config: sudo cp nginx/mastersplitter.conf /etc/nginx/sites-available/"
echo "4. Enable nginx site: sudo ln -s /etc/nginx/sites-available/mastersplitter.conf /etc/nginx/sites-enabled/"
echo "5. Test nginx: sudo nginx -t"
echo "6. Setup SSL: sudo certbot --nginx -d yourdomain.com"
echo "7. Run deploy script: bash scripts/deploy.sh"

