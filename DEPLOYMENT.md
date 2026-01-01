# Deployment Guide - Master Splitter on AWS Lightsail

This guide will walk you through deploying Master Splitter on an existing AWS Lightsail server alongside your other applications (like חיותוש).

## Prerequisites

- Existing Lightsail instance ($10+ plan with 2GB+ RAM recommended)
- Node.js, PM2, and Nginx already installed
- Domain or subdomain for Master Splitter (e.g., `mastersplitter.example.com`)
- SSH access to your server
- Git repository with your code

## Server Specifications

- **Recommended**: $10/month plan (2GB RAM, 1 vCPU)
- **OS**: Ubuntu 22.04 LTS
- **Pre-installed**: Node.js 18+, PM2, Nginx
- **Space needed**: ~500MB for application + dependencies

## Deployment Steps

### 1. SSH into Your Lightsail Server

```bash
ssh -i YourLightsailKey.pem ubuntu@YOUR_LIGHTSAIL_IP
```

### 2. Check MongoDB Installation

```bash
# Check if MongoDB is installed
mongod --version

# If not installed, run the setup script:
cd /home/ubuntu
# Clone your repo first (step 3), then:
bash masterSplitter/scripts/check-mongodb.sh
```

### 3. Clone the Repository

```bash
cd /home/ubuntu
git clone https://github.com/youruser/masterSplitter.git
cd masterSplitter
```

### 4. Configure Backend Environment

```bash
cd backend
cp .env.example .env
nano .env  # or use vim/vi
```

Edit the `.env` file with your production values:

```env
MONGO_URI=mongodb://localhost:27017/master_splitter
JWT_SECRET=GENERATE_A_STRONG_RANDOM_32_CHAR_STRING_HERE
OPENAI_API_KEY=sk-proj-your-actual-openai-key
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://mastersplitter.yourdomain.com
```

**Important**: 
- Generate a strong JWT_SECRET: `openssl rand -base64 32`
- If port 5000 is already used by חיותוש, use 5001 and update accordingly

### 5. Configure Frontend Environment

```bash
cd ../frontend
cp .env.example .env
nano .env
```

```env
VITE_BACKEND_URL=https://mastersplitter.yourdomain.com
```

### 6. Install Dependencies and Build

```bash
# Backend
cd ~/masterSplitter/backend
npm install --production

# Frontend
cd ../frontend
npm install
npm run build
```

The frontend build will create a `dist/` folder with optimized static files.

### 7. Start Application with PM2

```bash
cd ~/masterSplitter
pm2 start ecosystem.config.js
pm2 save
```

Verify it's running:

```bash
pm2 list
# You should see both your apps: hayotush and master-splitter-backend

pm2 logs master-splitter-backend --lines 50
```

### 8. Configure Nginx

```bash
# Copy the nginx configuration
sudo cp ~/masterSplitter/nginx/mastersplitter.conf /etc/nginx/sites-available/

# Edit the configuration to set your actual domain
sudo nano /etc/nginx/sites-available/mastersplitter.conf
# Change 'mastersplitter.example.com' to your actual subdomain

# Enable the site
sudo ln -s /etc/nginx/sites-available/mastersplitter.conf /etc/nginx/sites-enabled/

# Test nginx configuration
sudo nginx -t

# If OK, reload nginx
sudo systemctl reload nginx
```

### 9. Configure DNS

In your domain registrar (GoDaddy, Namecheap, etc.), add an A record:

```
Type: A
Name: mastersplitter (or your chosen subdomain)
Value: YOUR_LIGHTSAIL_STATIC_IP
TTL: 3600
```

Wait 5-15 minutes for DNS propagation.

### 10. Setup SSL Certificate

```bash
# Install certbot if not already installed
sudo apt-get install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d mastersplitter.yourdomain.com

# Follow the prompts - choose redirect HTTP to HTTPS
```

Certbot will automatically:
- Generate SSL certificates
- Update your nginx config
- Setup auto-renewal

### 11. Configure Firewall (Lightsail Console)

In the Lightsail web console, configure the firewall:

- ✅ SSH (22) - Your IP only (for security)
- ✅ HTTP (80) - All IPs
- ✅ HTTPS (443) - All IPs
- ❌ Custom (5000) - **Remove this** - not needed (Nginx proxies)
- ❌ Custom (3000) - **Remove this** - not needed

### 12. Test Your Deployment

Visit your application:

```bash
# Test health endpoint
curl https://mastersplitter.yourdomain.com/health

# Check PM2 status
pm2 list

# View logs
pm2 logs master-splitter-backend

# Monitor resources
pm2 monit
```

In your browser:
1. Go to `https://mastersplitter.yourdomain.com`
2. Register a new user
3. Create or join an apartment
4. Connect WhatsApp (scan QR code)
5. Test expense detection by sending a message

## Post-Deployment Checklist

- [ ] Application loads at https://mastersplitter.yourdomain.com
- [ ] SSL certificate is active (green padlock)
- [ ] User registration works
- [ ] User login works
- [ ] WhatsApp QR code loads
- [ ] Expense creation works
- [ ] MongoDB is storing data: `mongosh master_splitter --eval "db.users.countDocuments()"`
- [ ] PM2 auto-restart enabled: `pm2 startup` already configured
- [ ] Logs are being written: `ls -lh logs/`

## Ongoing Maintenance

### Updating the Application

Use the deploy script:

```bash
cd ~/masterSplitter
bash scripts/deploy.sh
```

This will:
1. Pull latest code from git
2. Install dependencies
3. Build frontend
4. Restart PM2
5. Verify health check

### MongoDB Backups

Setup automated daily backups:

```bash
# Test the backup script
bash ~/masterSplitter/scripts/backup-mongo.sh

# Add to crontab for daily backups at 2 AM
crontab -e

# Add this line:
0 2 * * * /home/ubuntu/masterSplitter/scripts/backup-mongo.sh >> /home/ubuntu/backups/backup.log 2>&1
```

### Monitoring

```bash
# View all apps
pm2 list

# View Master Splitter logs
pm2 logs master-splitter-backend

# View live resource usage
pm2 monit

# Check MongoDB status
sudo systemctl status mongod

# Check Nginx status
sudo systemctl status nginx

# Check disk space
df -h

# Check memory usage
free -h
```

### Log Management

```bash
# View recent logs
pm2 logs master-splitter-backend --lines 100

# Clear old logs
pm2 flush

# Nginx logs
sudo tail -f /var/log/nginx/mastersplitter-access.log
sudo tail -f /var/log/nginx/mastersplitter-error.log
```

## Resource Management (2GB RAM Server)

With two applications on the same server:

| Service | RAM Usage |
|---------|-----------|
| חיותוש | ~300-400MB |
| Master Splitter | ~400-500MB |
| MongoDB | ~200-300MB |
| Nginx | ~50MB |
| **Total** | **~1-1.5GB** |

### If You Run Out of Memory

1. **Monitor usage**: `pm2 monit` or `htop`
2. **Upgrade instance**: Go to Lightsail console → Upgrade to $20 plan (4GB RAM)
3. **Optimize**: Reduce PM2 max_memory_restart in `ecosystem.config.js`
4. **External DB**: Move MongoDB to managed database ($15/month extra)

## Troubleshooting

### Port 5000 Already in Use

```bash
# Check what's using port 5000
sudo lsof -i :5000

# If it's חיותוש, change Master Splitter to port 5001:
# 1. Edit backend/.env: PORT=5001
# 2. Edit nginx/mastersplitter.conf: proxy_pass http://localhost:5001;
# 3. Restart both:
pm2 restart master-splitter-backend
sudo systemctl reload nginx
```

### MongoDB Connection Failed

```bash
# Check MongoDB is running
sudo systemctl status mongod

# Start if stopped
sudo systemctl start mongod

# Check logs
sudo tail -f /var/log/mongodb/mongod.log
```

### Nginx 502 Bad Gateway

```bash
# Check backend is running
pm2 list
pm2 logs master-splitter-backend

# Restart backend
pm2 restart master-splitter-backend

# Check nginx error log
sudo tail -f /var/log/nginx/mastersplitter-error.log
```

### SSL Certificate Issues

```bash
# Renew certificate manually
sudo certbot renew

# Test auto-renewal
sudo certbot renew --dry-run
```

### WhatsApp Session Lost

```bash
# Check database has session data
mongosh master_splitter --eval "db.whatsappsessions.countDocuments()"

# Restart backend to reinitialize sessions
pm2 restart master-splitter-backend

# Generate new QR code from frontend
```

## Security Best Practices

1. **Firewall**: Only allow SSH from your IP
2. **Updates**: Regularly update packages: `sudo apt update && sudo apt upgrade`
3. **Secrets**: Never commit `.env` files to git
4. **Backups**: Keep 7 days of MongoDB backups
5. **Monitoring**: Setup alerts for high CPU/memory usage
6. **SSL**: Ensure auto-renewal is working: `sudo certbot renew --dry-run`

## Rollback Procedure

If deployment fails:

```bash
cd ~/masterSplitter
git log --oneline -5  # See recent commits
git reset --hard COMMIT_HASH  # Rollback to previous version
bash scripts/deploy.sh  # Redeploy
```

## Support & Contact

- **GitHub Issues**: [Report bugs](https://github.com/youruser/masterSplitter/issues)
- **Logs Location**: `~/masterSplitter/logs/`
- **PM2 Logs**: `pm2 logs master-splitter-backend`

---

**Last Updated**: January 2026

