# Environment Variables Guide

This document provides a detailed explanation of all environment variables used in AgileApp to ensure correct configuration for both AI models and human developers.

## 1. Database Configuration
| Variable | Description | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | The connection string for PostgreSQL. Includes user, password, host, port, and DB name. | `postgresql://app:secret@db:5432/agileapp?schema=public` |

## 2. Server & Security
| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | The port the backend server listens on. | `3001` |
| `JWT_SECRET` | Secret key for signing JSON Web Tokens. Use a long, random string. | `y0ur_super_secret_jwt_key` |
| `JWT_EXPIRES_IN` | Validity duration for access tokens. | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Validity duration for refresh tokens. | `7d` |

## 3. Social Authentication (OAuth)
### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create credentials for "OAuth 2.0 Client ID".
3. Set Authorized redirect URIs to `http://localhost:3001/api/auth/google/callback`.

| Variable | Example |
| :--- | :--- |
| `GOOGLE_CLIENT_ID` | `12345-abcde.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-random_secret` |
| `GOOGLE_CALLBACK_URL` | `http://localhost:3001/api/auth/google/callback` |

### Apple OAuth
Requires a paid Apple Developer account.
| Variable | Description |
| :--- | :--- |
| `APPLE_CLIENT_ID` | Your Service ID. |
| `APPLE_TEAM_ID` | 10-character Team ID. |
| `APPLE_KEY_ID` | 10-character Key ID for the downloaded `.p8` file. |
| `APPLE_PRIVATE_KEY` | Content of the `.p8` file. |

## 4. Storage (S3 / Minio)
Used for task attachments. In development, we use Minio.

| Variable | Description | Minio Example |
| :--- | :--- | :--- |
| `S3_ENDPOINT` | The URL of the storage server. | `http://minio:9000` |
| `S3_ACCESS_KEY` | Storage login/access key. | `minioadmin` |
| `S3_SECRET_KEY` | Storage password/secret key. | `minioadmin` |
| `S3_BUCKET` | Name of the bucket to store files. | `agileapp-attachments` |
| `S3_REGION` | AWS Region (or `us-east-1` for Minio). | `us-east-1` |
| `S3_USE_PATH_STYLE`| Must be `"true"` for Minio. | `"true"` |

## 5. Email (SMTP)
Required for password recovery notifications.

| Variable | Example |
| :--- | :--- |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | `your-email@gmail.com` |
| `SMTP_PASS` | `your-app-specific-password` |
| `SMTP_FROM` | `AgileApp <noreply@agileapp.com>` |

## 6. Frontend Configuration
Used by Vite during build/dev.

| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | The base URL of the backend API. | `http://localhost:3001` |
| `VITE_FRONTEND_URL` | The URL where the frontend is hosted. | `http://localhost:3000` |
