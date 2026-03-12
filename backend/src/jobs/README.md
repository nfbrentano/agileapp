# Background Jobs

This directory contains logic for background tasks and scheduled processes that run independently of user requests.

## Infrastructure

We use `node-cron` for scheduling tasks. Jobs are initialized in `src/app.ts` during server startup.

## Job Catalog

### Stagnation Detection
- **File**: `stagnation.job.ts`
- **Schedule**: Every Hour (`0 * * * *`)
- **Responsibility**: Scans all active task cards across all teams. If a card has been in a column for longer than the team's `stagnationFactor` * `avgTime` for that column, it marks the card as `stagnated: true`.

### Team Metrics Calculation
- **File**: `stagnation.job.ts`
- **Schedule**: Every day at Midnight (`0 0 * * *`)
- **Responsibility**: Iterates through all teams to calculate the average time tasks spend in each column. This data is critical for the Stagnation Detection job and for the Metrics Dashboard.

### Recurring Tasks (Distributed)
- **Note**: While the scheduling logic is initiated in `src/app.ts` via `setupRecurrenceJob()`, the core logic resides in `src/services/recurrence.service.ts`.
- **Responsibility**: Checks for cards with `recurrence` definitions and creates new occurrences based on the specified frequency (Daily, Weekly, Monthly).

## Best Practices for Jobs
- **Error Handling**: All job logic MUST be wrapped in `try/catch` blocks to prevent a single failure from crashing the background runner.
- **Logging**: Use descriptive logs prefixed with `[Job]` to distinguish job output from standard request logs.
- **Resource Management**: For heavy jobs spanning many teams/cards, consider using batching to avoid excessive memory or database connection usage.
