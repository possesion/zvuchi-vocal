#!/bin/bash

# Database backup script for PostgreSQL
# Usage: ./scripts/backup-db.sh
# Runs pg_dump inside the db container and saves the result to /root/web/zvuchi-vocal/backups/

set -e

BACKUP_DIR="/root/web/zvuchi-vocal/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/zvuchi_vocal_$TIMESTAMP.sql"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Dump PostgreSQL database from Docker container
docker compose -f /root/web/zvuchi-vocal/docker-compose.yml \
  exec -T db pg_dump -U zvuchi zvuchi_vocal > "$BACKUP_FILE"

echo "Database backed up to: $BACKUP_FILE"

# Keep only last 7 days of backups
find "$BACKUP_DIR" -name "zvuchi_vocal_*.sql" -type f -mtime +7 -delete

echo "Old backups cleaned up (keeping last 7 days)"
