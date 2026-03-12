# API Routes

This directory defines the entry points for the AgileApp REST API. Routes are organized by entity and mostly correspond to a specific controller.

## Global Security Pattern

Most routes require a valid JSON Web Token (JWT) to be accessed.

- **Private Routes**: Use the `authenticateJWT` middleware. These routes expect an `Authorization: Bearer <token>` header.
- **Public Routes**: Includes authentication flows like `/api/auth/login`, `/api/auth/register`, and password recovery endpoints.

Example of a protected route module:
```typescript
const router = Router();
router.use(authenticateJWT); // All routes below this line require authentication
router.post('/', createCard);
```

## Route Map

The API is prefixed with `/api` in the main `app.ts`.

| Module | Base Path | Description |
| :--- | :--- | :--- |
| `auth` | `/api/auth` | Login, registration, OAuth, and password recovery. |
| `teams` | `/api/teams` | Team management and workspace operations. |
| `boards` | `/api/boards` | Kanban board structure and configuration. |
| `cards` | `/api/cards` | Task lifecycle, movement, and subtasks. |
| `sprints` | `/api/sprints` | Sprint planning and reporting. |
| `notifications` | `/api/notifications` | User alerts and unread counts. |
| `metrics` | `/api/metrics` | Project performance data. |
| `webhooks` | `/api/webhooks` | External integration management. |
| `reports` | `/api/reports` | Shareable sprint summaries. |
| `activities` | `/api/activities` | Audit and history logs. |

## Developer Guidelines for AI

1. **Standard Methods**: 
   - `GET`: For retrieval.
   - `POST`: For creation.
   - `PATCH`/`PUT`: For partial or full updates.
   - `DELETE`: For removal.
2. **Path Parameters**: Use descriptive names like `:cardId` or `:teamId` instead of generic `:id` when multiple entities are involved in a request.
3. **Consistency**: When adding new routes, always check if the corresponding controller and service are ready to handle the request according to the established patterns (see `controllers/README.md`).
4. **Middleware Order**: Ensure `authenticateJWT` is applied before the request reaches the controller unless the route should be public.
