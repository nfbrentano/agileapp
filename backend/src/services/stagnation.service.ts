import prisma from '../config/prisma';
import { differenceInHours, subDays } from 'date-fns';
import { createNotification } from './notification.service';
import { WebhookService, WebhookEvent } from './webhook.service';
import { NotificationType } from '@prisma/client';

/**
 * Calculates the average time cards spent in each column for a team.
 * Uses the last 30 completed entries per column to be responsive to recent changes.
 */
export const calculateColumnAverages = async (teamId: string) => {
    const columns = await prisma.column.findMany({
        where: { teamId },
    });

    for (const column of columns) {
        const history = await prisma.cardColumnHistory.findMany({
            where: {
                columnId: column.id,
                leftAt: { not: null },
                card: { ignoreInMetrics: false }
            },
            orderBy: { leftAt: 'desc' },
            take: 30
        });

        if (history.length === 0) continue;

        const totalHours = history.reduce((acc, entry) => {
            return acc + differenceInHours(entry.leftAt!, entry.enteredAt);
        }, 0);

        const avgTime = totalHours / history.length;

        await prisma.columnMetrics.upsert({
            where: { columnId: column.id },
            update: { avgTime, updatedAt: new Date() },
            create: { columnId: column.id, avgTime, updatedAt: new Date() }
        });
    }
};

/**
 * Scans all active cards for a team and flags them as stagnated if they stay 
 * longer than the (average * factor) in their current column.
 */
export const checkStagnatedCards = async () => {
    const teams = await prisma.team.findMany({
        include: {
            columns: {
                include: { metrics: true }
            }
        }
    });

    for (const team of teams) {
        const factor = team.stagnationFactor;
        const activeCards = await prisma.card.findMany({
            where: {
                teamId: team.id,
                column: { order: { gt: 0 } }, // Ignore first column (backlog/todo)
                // Also ignore last column (done)
                NOT: {
                    column: { order: team.columns.length - 1 }
                }
            },
            include: { column: { include: { metrics: true } } }
        });

        for (const card of activeCards) {
            const avgTime = card.column.metrics?.avgTime;
            if (!avgTime || avgTime === 0) continue;

            // Find current column entrance from history
            const latestHistory = await prisma.cardColumnHistory.findFirst({
                where: { cardId: card.id, columnId: card.columnId, leftAt: null },
                orderBy: { enteredAt: 'desc' }
            });

            if (!latestHistory) continue;

            const hoursInColumn = differenceInHours(new Date(), latestHistory.enteredAt);
            const limit = avgTime * factor;

            if (hoursInColumn > limit && !card.stagnated) {
                // Mark as stagnated
                await prisma.card.update({
                    where: { id: card.id },
                    data: { stagnated: true, stagnatedAt: new Date() }
                });

                // Notify assignee
                if (card.assigneeId) {
                    await createNotification({
                        userId: card.assigneeId,
                        type: 'CARD_MOVED', // Using available enum type, maybe add CARD_STAGNATED later
                        message: `O card "${card.title}" está estagnado na coluna ${card.column.name} há mais de ${hoursInColumn}h (limite: ${Math.round(limit)}h).`,
                        link: `/boards/${team.id}?cardId=${card.id}`
                    });
                }
            } else if (hoursInColumn <= limit && card.stagnated) {
                // Clear stagnation if it somehow happened (e.g. factor changed or manual override)
                await prisma.card.update({
                    where: { id: card.id },
                    data: { stagnated: false, stagnatedAt: null }
                });
                // Dispatch Webhook
                WebhookService.dispatch(team.id, WebhookEvent.CARD_STAGNATED, undefined, {
                    cardId: card.id,
                    title: card.title,
                    columnName: card.column.name,
                    timeInColumn: hoursInColumn,
                    averageTime: avgTime
                });
            }
        }
    }
};
