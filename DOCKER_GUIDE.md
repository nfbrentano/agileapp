# Docker & Infrastructure Guide

This setup allows running the entire AgileApp stack (Backend, Frontend, Database, and Object Storage) using Docker Containers.

## Architecture Diagram

- `web`: Vite/React Frontend (Port 3000)
- `api`: Node.js/Express Backend (Port 3001)
- `db`: PostgreSQL 16 Database (Port 5432)
- `minio`: S3-compatible storage for attachments (Port 9000/9001)
- `createbuckets`: One-off container to initialize Minio buckets.

## Service Breakdown

### 1. Database (`db`)
- **Image**: `postgres:16`
- **Persistence**: Data is saved in the `pgdata` volume.
- **Access**: Accessible internally within the docker network as `db:5432`.

### 2. Backend API (`api`)
- **Build**: Uses `Dockerfile` in `/backend`.
- **Logic**: Executes `prisma generate` before starting the dev server.
- **Wait Logic**: Automatically waits for the `db` and `minio` to be ready.

### 3. Frontend Web (`web`)
- **Build**: Uses `Dockerfile` in `/frontend`.
- **Logic**: Built using `npm run build` and served via `serve`.
- **Connection**: Communicates with the API using `VITE_API_URL`.

### 4. Storage (`minio`)
- **Service**: Provides an S3 API for file uploads.
- **Console**: Accessible at `http://localhost:9001` (User: `minioadmin`, Pass: `minioadmin`).
- **Initialization**: The `createbuckets` service runs a script to create the `agileapp-attachments` bucket automatically.

## Common Operations

### Start the environment
```bash
docker-compose up -d
```

### Rebuild after code changes
```bash
docker-compose up -d --build
```

### View Logs
```bash
docker-compose logs -f [api|web|db]
```

### Database Management
To run Prisma migrations manually inside the container:
```bash
docker-compose exec api npx prisma migrate dev
```

## Volumes & Persistence
- `pgdata`: Keeps your tasks, users, and board configurations safe even if containers are deleted.
- `minio_data`: Persists all uploaded files and attachments.
