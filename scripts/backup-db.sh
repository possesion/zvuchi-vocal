#!/bin/bash

# Database backup script for SQLite
# Usage: ./scripts/backup-db.sh

set -e

DB_PATH="/root/web/zvuchi-vocal/data/wiki.db"
BACKUP_DIR="/root/web/zvuchi-vocal/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/wiki_$TIMESTAMP.db"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create backup
cp "$DB_PATH" "$BACKUP_FILE"

echo "Database backed up to: $BACKUP_FILE"

# Keep only last 7 backups
find "$BACKUP_DIR" -name "wiki_*.db" -type f -mtime +7 -delete

echo "Old backups cleaned up (keeping last 7 days)"
