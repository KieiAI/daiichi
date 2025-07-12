#!/bin/bash
set -e

echo "Starting application..."

# データベース接続の待機
echo "Waiting for database..."
while ! nc -z $DATABASE_HOST $DATABASE_PORT; do
  echo "Database is not ready - sleeping"
  sleep 2
done
echo "Database is ready!"

# マイグレーションの実行
echo "Running database migrations..."
poetry run alembic upgrade head

# アプリケーションの起動
echo "Starting FastAPI application..."
exec poetry run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload