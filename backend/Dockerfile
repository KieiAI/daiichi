FROM python:3.12-slim

ENV POETRY_VERSION=1.8.2
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# システムの依存関係をインストール
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir "poetry==$POETRY_VERSION"

WORKDIR /app

COPY pyproject.toml poetry.lock* ./

RUN poetry config virtualenvs.create false \
  && poetry install --no-interaction --no-ansi

# アプリケーションコードをコピー
COPY ./app ./app
COPY ./alembic ./alembic
COPY ./alembic.ini ./alembic.ini

# entrypoint.shをコピーして実行権限を付与
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# ヘルスチェックを追加
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

EXPOSE 8000

ENTRYPOINT ["./entrypoint.sh"]