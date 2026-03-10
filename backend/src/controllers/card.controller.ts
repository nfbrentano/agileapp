import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { createNotification } from '../services/notification.service';
import { checkBlockers } from '../services/dependency.service';
import { WebhookService, WebhookEvent } from '../services/webhook.service';
import { NotificationType } from '@prisma/client';
import { createActivity } from './activity.controller';

export const createCard = async (req: Request, res: Response) => {
    const {
        teamId, columnId, title, details, requirements,
        acceptanceCriteria, outOfScope, testSuggestions,
        url, priority, dueDate, tags, parentId
    } = req.body;

    try {
        // Get the last order to append at the end
        const lastCard = await prisma.card.findFirst({
            where: { columnId: columnId as string },
            orderBy: { order: 'desc' },
        });

        const newOrder = lastCard ? lastCard.order + 1 : 0;

        const card = await prisma.card.create({
            data: {
                title: title as string,
                details: details as string,
                requirements: requirements as string,
                acceptanceCriteria: acceptanceCriteria as string,
                outOfScope: outOfScope as string,
                testSuggestions: testSuggestions as string,
                url: url as string,
                priority: (priority as any) || 'MEDIUM',
                dueDate: dueDate ? new Date(dueDate as string) : null,
                tags: (tags as string[]) || [],
                order: newOrder,
                teamId: teamId as string,
                columnId: columnId as string,
                parentId: (parentId as string) || null,
            },
        });

        // Initialize history
        await prisma.cardColumnHistory.create({
            data: {
                cardId: card.id,
                columnId: columnId as string,
                enteredAt: new Date()
            }
        });

        // Dispatch Webhook
        const actorId = (req as any).user?.id;
        WebhookService.dispatch(teamId as string, WebhookEvent.CARD_CREATED, actorId, card);

        // Create activity
        if (actorId) {
            await createActivity({
                type: 'CARD_CREATED',
                userId: actorId,
                teamId: teamId as string,
                cardId: card.id,
                description: `created card "${card.title}"`
            });
        }

        res.status(201).json(card);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar card' });
    }
};

export const moveCard = async (req: Request, res: Response) => {
    const { cardId } = req.params;
    const { columnId, order, ignoreWipLimit, ignoreBlockers, ignoreSubtasks } = req.body;

    try {
        // Fetch destination column info (to get doneColumnId and team columns)
        const targetColumn = await prisma.column.findUnique({
            where: { id: columnId as string },
            include: { team: { include: { columns: { orderBy: { order: 'desc' } } } } }
        });

        if (!targetColumn || !targetColumn.team) {
            return res.status(404).json({ error: 'Coluna ou time não encontrado' });
        }

        const columns = targetColumn.team.columns;
        if (!columns || columns.length === 0) {
            return res.status(404).json({ error: 'Configuração do board incompleta' });
        }

        const lastColumn = columns[columns.length - 1];
        if (!lastColumn) return res.status(404).json({ error: 'Coluna final não encontrada' });

        const doneColumnId = lastColumn.id;

        // Validation 1: Blockers
        const activeBlockers = await checkBlockers(cardId as string);
        if (activeBlockers.length > 0 && !ignoreBlockers) {
            return res.status(409).json({
                error: 'Este card está bloqueado por outras tarefas pendentes.',
                blockers: activeBlockers.map(b => ({ id: b.id, title: b.title }))
            });
        }

        // Validation 2: Sub-tasks (Only if moving to Done)
        if (columnId === doneColumnId && !ignoreSubtasks) {
            const unfinishedSubtasks = await prisma.card.findMany({
                where: {
                    parentId: cardId as string,
                    columnId: { not: doneColumnId }
                }
            });

            if (unfinishedSubtasks.length > 0) {
                return res.status(409).json({
                    error: 'Este card possui sub-tasks pendentes que precisam ser concluídas antes dele.',
                    subtasks: unfinishedSubtasks.map((s: any) => ({ id: s.id, title: s.title }))
                });
            }
        }

        // Validation 3: WIP Limit
        const columnWithCount = await prisma.column.findUnique({
            where: { id: columnId as string },
            include: { _count: { select: { cards: true } } }
        });

        if (!columnWithCount) {
            return res.status(404).json({ error: 'Coluna não encontrada' });
        }

        // Check if current column is the same as destination (ordering within same column)
        const currentCard = await prisma.card.findUnique({
            where: { id: cardId as string },
            select: { columnId: true }
        });

        const isMovingToNewColumn = currentCard && currentCard.columnId !== columnId;

        if (isMovingToNewColumn && columnWithCount.wipLimit && columnWithCount._count.cards >= columnWithCount.wipLimit && !ignoreWipLimit) {
            return res.status(409).json({
                error: `Limite de WIP atingido na coluna "${columnWithCount.name}".`,
                limit: columnWithCount.wipLimit,
                currentCount: columnWithCount._count.cards
            });
        }

        // Dispatch WIP_LIMIT_REACHED even if ignored (so it matches the intent of monitoring bottlenecks)
        if (isMovingToNewColumn && columnWithCount.wipLimit && columnWithCount._count.cards >= columnWithCount.wipLimit) {
            const actorId = (req as any).user?.id;
            WebhookService.dispatch(targetColumn.teamId, WebhookEvent.WIP_LIMIT_REACHED, actorId, {
                columnId: columnId,
                columnName: targetColumn.name,
                limit: columnWithCount.wipLimit,
                currentCount: columnWithCount._count.cards
            });
        }

        // Perform move and history update in a transaction
        const card = await prisma.$transaction(async (tx) => {
            if (isMovingToNewColumn) {
                // Close previous history
                await tx.cardColumnHistory.updateMany({
                    where: {
                        cardId: cardId as string,
                        leftAt: null
                    },
                    data: {
                        leftAt: new Date()
                    }
                });

                // Create new history
                await tx.cardColumnHistory.create({
                    data: {
                        cardId: cardId as string,
                        columnId: columnId as string,
                        enteredAt: new Date()
                    }
                });
            }

            return await tx.card.update({
                where: { id: cardId as string },
                data: {
                    columnId: columnId as string,
                    order: order as number
                },
                include: { team: { include: { members: true } } }
            });
        });

        // Notify other team members
        const performersId = (req as any).user?.id;
        if (performersId) {
            for (const member of card.team.members) {
                if (member.userId !== performersId) {
                    await createNotification({
                        userId: member.userId,
                        type: NotificationType.CARD_MOVED,
                        message: `O card "${card.title}" foi movido.`,
                        link: `/teams/${card.teamId}/board`
                    });
                }
            }
        }

        // Dispatch Webhook
        WebhookService.dispatch(card.teamId, WebhookEvent.CARD_MOVED, performersId, {
            cardId: card.id,
            title: card.title,
            fromColumnId: currentCard?.columnId,
            toColumnId: columnId
        });

        // Dispatch CARD_COMPLETED if moved to Done
        if (columnId === doneColumnId) {
            WebhookService.dispatch(card.teamId, WebhookEvent.CARD_COMPLETED, performersId, card);
        }

        // Create activity for card move
        if (performersId && isMovingToNewColumn) {
            const fromColumn = await prisma.column.findUnique({ where: { id: currentCard?.columnId } });
            const toColumn = await prisma.column.findUnique({ where: { id: columnId as string } });
            
            await createActivity({
                type: 'CARD_MOVED',
                userId: performersId,
                teamId: card.teamId,
                cardId: card.id,
                description: `moved "${card.title}" to ${toColumn?.name || 'another column'}`,
                metadata: { fromColumn: fromColumn?.name, toColumn: toColumn?.name }
            });
        }

        res.json(card);
    } catch (error) {
        console.error('Erro ao mover card:', error);
        res.status(500).json({ error: 'Erro ao mover card' });
    }
};

export const assignCard = async (req: Request, res: Response) => {
    const { cardId } = req.params;
    const { assigneeId } = req.body;

    try {
        const card = await prisma.card.update({
            where: { id: cardId as string },
            data: { assigneeId: assigneeId as string },
        });

        if (assigneeId) {
            await createNotification({
                userId: assigneeId as string,
                type: NotificationType.CARD_ASSIGNED,
                message: `Você foi atribuído ao card "${card.title}".`,
                link: `/teams/${card.teamId}/board`
            });
        }

        // Dispatch Webhook
        const actorId = (req as any).user?.id;
        WebhookService.dispatch(card.teamId, WebhookEvent.CARD_ASSIGNED, actorId, {
            cardId: card.id,
            title: card.title,
            assigneeId
        });

        res.json(card);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atribuir card' });
    }
};

export const getCardDetails = async (req: Request, res: Response) => {
    const { cardId } = req.params;

    try {
        const card = await prisma.card.findUnique({
            where: { id: cardId as string },
            include: {
                comments: {
                    include: { user: true },
                    orderBy: { createdAt: 'desc' },
                },
                checklists: true,
                subTasks: true,
                parent: true,
                columnHistory: {
                    include: { column: true },
                    orderBy: { enteredAt: 'asc' }
                }
            },
        });

        if (!card) return res.status(404).json({ error: 'Card não encontrado' });

        res.json(card);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar detalhes do card' });
    }
};

export const deleteCard = async (req: Request, res: Response) => {
    const { cardId } = req.params;

    try {
        const card = await prisma.card.findUnique({
            where: { id: cardId as string }
        });

        if (!card) return res.status(404).json({ error: 'Card não encontrado' });

        await prisma.card.delete({ where: { id: cardId as string } });

        // Dispatch Webhook
        const actorId = (req as any).user?.id;
        WebhookService.dispatch(card.teamId, WebhookEvent.CARD_DELETED, actorId, {
            cardId: card.id,
            title: card.title
        });

        // Create activity
        if (actorId) {
            await createActivity({
                type: 'CARD_DELETED',
                userId: actorId,
                teamId: card.teamId,
                description: `deleted card "${card.title}"`
            });
        }

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Erro ao excluir card' });
    }
};
