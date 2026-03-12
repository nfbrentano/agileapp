# Prisma & Database Schema

This directory contains the database structure and configuration for the AgileApp backend.

## Core Architecture

The system is built around a hierarchical structure:
`User` -> `Team` -> `Column` -> `Card`

### Key Models & Relationships

- **User**: The root entity. Connects to `Team` via `TeamMember` (explicit many-to-many).
- **Team**: The primary workspace. Contains `Members`, `Columns`, `Sprints`, and `Cards`.
- **Column**: Belongs to a `Team`. Contains `Cards`. Has a `ColumnMetrics` one-to-one relation for performance tracking.
- **Card (Task)**: The central unit of work.
    - **Self-Relation**: `parent` and `subTasks` (one-to-many) for task nesting.
    - **Dependencies**: `blockedBy` and `blocking` via the `CardDependency` join table (handles blocking relationships).
    - **History**: Tracked in `CardColumnHistory` for lead/cycle time calculations.
    - **Extensions**: Has `Comments`, `Checklists`, and `Attachments`.
- **Sprint**: Manages time-boxed work within a `Team`. Linked to cards via `SprintCard`. Each closed sprint can have a `SprintReport`.
- **Activity**: Audit trail of events (`CARD_MOVED`, `COMMENT_ADDED`, etc.) linked to `User`, `Team`, and optionally a `Card`.

### Essential Enums

| Enum | Values |
| :--- | :--- |
| `TeamMode` | `KANBAN`, `SCRUM` |
| `Role` | `ADMIN`, `MEMBER`, `VIEWER` |
| `Priority` | `CRITICAL`, `HIGH`, `MEDIUM`, `LOW` |
| `SprintStatus`| `PLANNING`, `ACTIVE`, `CLOSED` |
| `ActivityType`| Comprehensive list of system events for logging and webhooks. |

### Design Patterns for AI Models

1. **Card Recurrence**: Stored as a `Json` field in `Card`. Format: `{ frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY', interval: number, endDate?: Date }`.
2. **Soft Deletions/History**: We use `CardColumnHistory` to track movement between columns. When a card enters a column, `enteredAt` is set. When it leaves, `leftAt` is updated.
3. **Cascading**:
    - Deleting a `Team` cascades to `Activity`, `Webhook`, etc.
    - Deleting a `Card` cascades to `Attachment`, `CardDependency`, etc.
    - `Activity` linked to a card uses `SetNull` on card deletion to preserve audit history.

## Common Query Pitfalls

- **Team Access**: Always verify access via the `TeamMember` table before performing operations on a `Team` or its children.
- **Filtering Metrics**: Some cards may have `ignoreInMetrics: true`, which should be excluded from velocity or cycle time calculations.
- **Indexes**: Use established indexes on `[teamId, createdAt]` for performance when fetching logs or cards for large teams.
