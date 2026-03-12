# Services

Services in AgileApp contain the core business logic and side effects that go beyond simple CRUD operations. They are called by controllers or background jobs to maintain system integrity.

## Architecture & Integration

- **Data Layer**: Services interact heavily with the `Prisma` client to perform complex queries and transactions.
- **Cross-Service Coordination**: Services often call each other (e.g., `stagnation.service` calls `notification.service`).
- **Side Effects**: This layer is responsible for external communications (Email, Webhooks) and internal state changes (Metrics calculation).

## Service Catalog

| Service | Responsibility | Key Features |
| :--- | :--- | :--- |
| `webhook.service.ts` | External event delivery. | HMAC signatures, exponential backoff, delivery logs. |
| `stagnation.service.ts` | Bottleneck detection. | Calculation of column averages, flagging inactive tasks. |
| `dependency.service.ts` | Task relationship logic. | Validation of blockers before card movement. |
| `notification.service.ts` | User-facing alerts. | Creation of in-app notification records. |
| `recurrence.service.ts` | Task repetition. | Automated cloning of cards based on Cron-like logic. |
| `metrics.service.ts` | Performance insights. | Aggregating data for cycle time and velocity charts. |
| `email.service.ts` | Outbound communication. | Sending password reset and system alert emails. |
| `attachment.service.ts` | File management logic. | Integration with S3 and handling database file metadata. |

## Implementation Patterns

### Webhook Dispatching
We follow a "Fire and Forget" pattern for webhooks to avoid blocking the main execution thread.
```typescript
WebhookService.dispatch(teamId, WebhookEvent.CARD_MOVED, actorId, data);
```

### Complex Validations
Logic that requires checking multiple tables (like task dependencies) should reside in a service method that returns a boolean or a list of violations, which the controller then uses to decide the HTTP response.

## Developer Tips for AI
- **System Actor**: Background jobs often use a hardcoded "system" actor in services like `WebhookService` to distinguish automated actions from user ones.
- **Metrics Exclusion**: When calculating averages, always check `card.ignoreInMetrics` to ensure accurate reports.
- **Transactional Integrity**: If a service method modifies multiple tables, ensure it's called within a `$transaction` context either in the service itself or passed from the controller.
