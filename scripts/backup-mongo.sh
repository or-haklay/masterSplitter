#!/bin/bash
# MongoDB Backup Script for Master Splitter
BACKUP_DIR="/home/ubuntu/backups/mongodb"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "🗄️ Starting MongoDB backup..."

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Backup the master_splitter database
mongodump --db=master_splitter --out=$BACKUP_DIR/$TIMESTAMP

if [ $? -eq 0 ]; then
    echo "✅ Backup completed: $BACKUP_DIR/$TIMESTAMP"
    
    # Keep only last 7 days of backups
    find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} + 2>/dev/null
    echo "🧹 Old backups cleaned (kept last 7 days)"
else
    echo "❌ Backup failed"
    exit 1
fi

