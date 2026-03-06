import cron from 'node-cron';
import prisma from '../config/prisma';
import { Prisma } from '@prisma/client';
import { differenceInDays, differenceInWeeks, differenceInMonths, addDays, addWeeks, addMonths, startOfDay, isAfter } from 'date-fns';

export const setupRecurrenceJob = () => {
    // Run every day at 00:01
    cron.schedule('1 0 * * *', async () => {
        console.log('[Recurrence] Checking for recurring cards to clone...');
        await processRecurringCards();
    });
};

export const processRecurringCards = async () => {
    const today = startOfDay(new Date());

    try {
        const recurringCards = await prisma.card.findMany({
            where: {
                recurrence: { not: Prisma.JsonNull }
            }
        });

        for (const card of recurringCards) {
            const recurrence = card.recurrence as any;
            if (!recurrence || !recurrence.frequency) continue;

            const lastDate = card.lastOccurrence ? new Date(card.lastOccurrence) : new Date(card.createdAt);
            let shouldClone = false;

            const interval = recurrence.interval || 1;

            if (recurrence.frequency === 'DAILY') {
                if (differenceInDays(today, lastDate) >= interval) shouldClone = true;
            } else if (recurrence.frequency === 'WEEKLY') {
                if (differenceInWeeks(today, lastDate) >= interval) shouldClone = true;
            } else if (recurrence.frequency === 'MONTHLY') {
                if (differenceInMonths(today, lastDate) >= interval) shouldClone = true;
            }

            // Check endDate
            if (recurrence.endDate && isAfter(today, new Date(recurrence.endDate))) {
                shouldClone = false;
                // Optional: clear recurrence if over
                await prisma.card.update({
                    where: { id: card.id },
                    data: { recurrence: Prisma.JsonNull }
                });
                continue;
            }

            if (shouldClone) {
                await cloneCard(card.id);
            }
        }
    } catch (error) {
        console.error('[Recurrence] Error processing recurring cards:', error);
    }
};

export const cloneCard = async (cardId: string) => {
    const originalCard = await prisma.card.findUnique({
        where: { id: cardId },
        include: { team: { include: { columns: { orderBy: { order: 'asc' } } } } }
    });

    if (!originalCard) return;

    // We clone to the first column (Backlog/To Do)
    const columns = originalCard.team.columns;
    if (!columns || columns.length === 0) return;

    const firstColumn = columns[0];
    if (!firstColumn) return;

    // Get last order in that column
    const lastCard = await prisma.card.findFirst({
        where: { columnId: firstColumn.id },
        orderBy: { order: 'desc' }
    });
    const newOrder = lastCard ? lastCard.order + 1 : 0;

    try {
        await prisma.$transaction(async (tx) => {
            // Create cloned card
            const newCard = await tx.card.create({
                data: {
                    title: originalCard.title,
                    details: originalCard.details,
                    requirements: originalCard.requirements,
                    acceptanceCriteria: originalCard.acceptanceCriteria,
                    outOfScope: originalCard.outOfScope,
                    testSuggestions: originalCard.testSuggestions,
                    url: originalCard.url,
                    priority: originalCard.priority,
                    teamId: originalCard.teamId,
                    columnId: firstColumn.id,
                    order: newOrder,
                    assigneeId: originalCard.assigneeId,
                    tags: originalCard.tags as string[],
                }
            });

            // Initialize history for the cloned card
            await tx.cardColumnHistory.create({
                data: {
                    cardId: newCard.id,
                    columnId: firstColumn.id,
                    enteredAt: new Date()
                }
            });

            // Update original card lastOccurrence
            await tx.card.update({
                where: { id: cardId },
                data: { lastOccurrence: new Date() }
            });
        });
        console.log(`[Recurrence] Cloned card "${originalCard.title}" successfully.`);
    } catch (err) {
        console.error(`[Recurrence] Error cloning card ${cardId}:`, err);
    }
};
