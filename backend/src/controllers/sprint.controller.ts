import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { createNotification } from '../services/notification.service';
import { WebhookService, WebhookEvent } from '../services/webhook.service';
import { NotificationType } from '@prisma/client';

export const createSprint = async (req: Request, res: Response) => {
    const { teamId, name, goal, startDate, endDate } = req.body;

    try {
        const sprint = await prisma.sprint.create({
            data: {
                teamId: teamId as string,
                name: name as string,
                goal: goal as string,
                startDate: startDate ? new Date(startDate as string) : null,
                endDate: endDate ? new Date(endDate as string) : null,
                status: 'PLANNING',
            },
        });

        res.status(201).json(sprint);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar sprint' });
    }
};

export const startSprint = async (req: Request, res: Response) => {
    const { sprintId } = req.params;

    try {
        // Basic rule: only one active sprint per team
        const sprint = await prisma.sprint.findUnique({ where: { id: sprintId as string } });
        if (!sprint) return res.status(404).json({ error: 'Sprint não encontrada' });

        await prisma.sprint.updateMany({
            where: { teamId: sprint.teamId, status: 'ACTIVE' },
            data: { status: 'CLOSED' },
        });

        const updatedSprint = await prisma.sprint.update({
            where: { id: sprintId as string },
            data: { status: 'ACTIVE' },
            include: { team: { include: { members: true } } }
        });

        // Notify team
        for (const member of updatedSprint.team.members) {
            await createNotification({
                userId: member.userId,
                type: NotificationType.SPRINT_STARTED,
                message: `A sprint "${updatedSprint.name}" foi iniciada!`,
                link: `/teams/${updatedSprint.teamId}/board`
            });
        }

        // Dispatch Webhook
        const actorId = (req as any).user?.id;
        WebhookService.dispatch(updatedSprint.teamId, WebhookEvent.SPRINT_STARTED, actorId, {
            sprintId: updatedSprint.id,
            name: updatedSprint.name
        });

        res.json(updatedSprint);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao iniciar sprint' });
    }
};

export const addCardToSprint = async (req: Request, res: Response) => {
    const { sprintId, cardId } = req.params;

    try {
        const sprintCard = await prisma.sprintCard.create({
            data: {
                sprintId: sprintId as string,
                cardId: cardId as string
            },
        });
        res.json(sprintCard);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao adicionar card à sprint' });
    }
};

export const closeSprint = async (req: Request, res: Response) => {
    const { sprintId } = req.params;

    try {
        const sprint = await prisma.sprint.findUnique({
            where: { id: sprintId as string },
            include: {
                team: {
                    include: {
                        columns: { orderBy: { order: 'asc' } }
                    }
                },
                cards: {
                    include: {
                        card: {
                            include: {
                                column: true,
                                columnHistory: true
                            }
                        }
                    }
                }
            }
        });

        if (!sprint) return res.status(404).json({ error: 'Sprint não encontrada' });
        if (sprint.status === 'CLOSED') return res.status(400).json({ error: 'Sprint já está fechada' });

        const doneColumn = sprint.team.columns[sprint.team.columns.length - 1];
        const backlogColumn = sprint.team.columns[0];

        if (!doneColumn || !backlogColumn) {
            return res.status(400).json({ error: 'Configuração de colunas do time inválida' });
        }

        const sprintCards = sprint.cards.map(sc => sc.card);
        const completedCards = sprintCards.filter(c => c.columnId === doneColumn.id);
        const incompleteCards = sprintCards.filter(c => c.columnId !== doneColumn.id);

        // Calculate KPIs
        const velocity = completedCards.reduce((sum, c) => sum + (c.points || 0), 0);
        const totalPoints = sprintCards.reduce((sum, c) => sum + (c.points || 0), 0);
        const completionRate = totalPoints > 0 ? (velocity / totalPoints) * 100 : 0;

        // Added Mid Sprint
        const addedMidSprint = sprint.cards.filter(sc =>
            sprint.startDate && sc.createdAt > sprint.startDate
        ).length;

        // Avg Cycle Time (simplified: time from first column move to Done)
        let totalCycleTime = 0;
        let cardsWithCycleTime = 0;

        completedCards.forEach(card => {
            const history = [...card.columnHistory].sort((a, b) => a.enteredAt.getTime() - b.enteredAt.getTime());
            if (history.length > 1) {
                const start = history[0]?.enteredAt;
                const end = history[history.length - 1]?.enteredAt;
                if (start && end) {
                    totalCycleTime += (end.getTime() - start.getTime());
                    cardsWithCycleTime++;
                }
            }
        });

        const avgCycleTime = cardsWithCycleTime > 0
            ? (totalCycleTime / cardsWithCycleTime) / (1000 * 60 * 60 * 24) // Convert to days
            : null;

        // CREATE REPORT
        await prisma.sprintReport.create({
            data: {
                sprintId: sprint.id,
                velocity,
                completionRate,
                completedCards: completedCards.length,
                incompleteCards: incompleteCards.length,
                addedMidSprint,
                avgCycleTime
            }
        });

        // MOVE INCOMPLETE CARDS TO BACKLOG
        for (const card of incompleteCards) {
            await prisma.card.update({
                where: { id: card.id },
                data: { columnId: backlogColumn.id }
            });
        }

        // CLOSE SPRINT
        const closedSprint = await prisma.sprint.update({
            where: { id: sprintId as string },
            data: { status: 'CLOSED' }
        });

        const actorId = (req as any).user?.id;

        // Dispatch Webhook
        WebhookService.dispatch(sprint.teamId, WebhookEvent.SPRINT_CLOSED, actorId, {
            sprintId: sprint.id,
            name: sprint.name,
            report: { velocity, completionRate }
        });

        res.json({ message: 'Sprint fechada com sucesso', sprint: closedSprint });
    } catch (error) {
        console.error('Erro ao fechar sprint:', error);
        res.status(500).json({ error: 'Erro ao fechar sprint' });
    }
};
