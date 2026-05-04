#!/bin/sh
set -e

echo "=== Starting Laravel Application ==="

# Create storage directories if they don't exist
mkdir -p storage/framework/{sessions,views,cache}
mkdir -p storage/logs
mkdir -p bootstrap/cache
chmod -R 775 storage bootstrap/cache

# Generate .env from environment variables if not exists
if [ ! -f .env ]; then
    echo "Creating .env from environment..."
    env | grep -E '^(APP_|DB_|LOG_|CACHE_|SESSION_|SANCTUM_|BROADCAST_|FILESYSTEM_|QUEUE_|MAIL_|REVERB_|VITE_)' > .env 2>/dev/null || true
fi

# Cache config for production
php artisan config:clear 2>/dev/null || true

# Run migrations
echo "Running migrations..."
php artisan migrate --force 2>&1 || echo "Migration warning (may be OK if already migrated)"

echo "Starting server on port ${PORT:-8080}..."
php artisan serve --host=0.0.0.0 --port="${PORT:-8080}"
