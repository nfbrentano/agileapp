# Controllers

Controllers in AgileApp are the entry points for the application's business logic, handling HTTP requests and orchestrating responses.

## General Implementation Patterns

All controllers follow a consistent structure to ensure reliability and maintainability.

### Request Handling
- **Signatures**: Standard Express middleware signatures: `(req: Request, res: Response)`.
- **Validation**: Incoming data from `req.body` or `req.params` is validated for existence and business rule compliance (e.g., WIP limits in `moveCard`).
- **Authentication**: User context is usually available via `(req as any).user` thanks to `auth.middleware.ts`.

### Persistence & Logic
- **Prisma**: Simple CRUD is often performed directly using the `prisma` client.
- **Services**: Complex logic (notifications, email, dependencies, webhooks) is delegated to specialized services in `../services`.
- **Transactions**: Operations involving multiple table updates (like moving a card and updating its history) must use `prisma.$transaction` for atomicity.

### Status Codes & Errors
- `200 OK`: Successful retrieval or update.
- `201 Created`: Successful creation (e.g., `createCard`).
- `204 No Content`: Successful deletion (e.g., `deleteCard`).
- `400 Bad Request`: Input validation errors.
- `401 Unauthorized`: Authentication failures.
- `404 Not Found`: Resource does not exist.
- `409 Conflict`: Business rule violation (e.g., WIP limit reached, blockers present).
- `500 Internal Server Error`: Generic catch-all for unexpected exceptions.

### Post-Operation Side Effects
After successful data mutations, controllers are responsible for:
1. **Notifications**: Alerting users via `notification.service`.
2. **Activity Logs**: Creating audit trails using `createActivity`.
3. **Webhooks**: Dispatching events to external systems via `WebhookService.dispatch`.

## Controller Map

| Controller | Responsibility |
| :--- | :--- |
| `auth.controller.ts` | JWT management, registration, and password recovery. |
| `card.controller.ts` | Task lifecycle, movement logic (blockers, subtasks, WIP). |
| `team.controller.ts` | Member management and workspace settings. |
| `dashboard.controller.ts` | Data aggregation for charts and metrics. |
| `sprint.controller.ts` | Sprint planning, execution, and status transitions. |
| `activity.controller.ts` | Centralized activity logging logic. |
| `report.controller.ts` | Exporting sprint data and generating shareable tokens. |

## Developer Tips for AI
- **Always check for Blockers**: Before moving a card to a "Done" state, verify if it has active `blockedBy` relationships.
- **WIP Limits**: Respect `column.wipLimit` during `moveCard` unless an override is specified.
- **Card Order**: When creating or moving cards, ensure the `order` property is correctly calculated to maintain board integrity.
