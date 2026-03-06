import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getTeamWorkload = async (req: Request, res: Response) => {
    const { id: teamId } = req.params;

    try {
        const teamData = await prisma.team.findUnique({
            where: { id: teamId as string },
            include: {
                members: { include: { user: true } },
                columns: { orderBy: { order: 'asc' } }
            }
        });

        if (!teamData) return res.status(404).json({ error: 'Time não encontrado' });

        const team = teamData as any;

        // Logic based on Team Mode
        let activeCards: any[] = [];
        if (team.mode === 'SCRUM') {
            const activeSprint = await prisma.sprint.findFirst({
                where: { teamId: teamId as string, status: 'ACTIVE' }
            });

            if (activeSprint) {
                activeCards = await prisma.card.findMany({
                    where: {
                        teamId: teamId as string,
                        sprintCards: { some: { sprintId: activeSprint.id } }
                    },
                    include: { column: true }
                });
            }
        } else {
            // KANBAN: All columns except the last one (Done)
            const doneColumn = team.columns[team.columns.length - 1];
            activeCards = await prisma.card.findMany({
                where: {
                    teamId: teamId as string,
                    columnId: { not: doneColumn?.id }
                },
                include: { column: true }
            });
        }

        // Group cards by assignee
        const workload = team.members.map((member: any) => {
            const memberCards = activeCards.filter(card => card.assigneeId === member.userId);
            const highPriorityCount = memberCards.filter(c => c.priority === 'HIGH' || c.priority === 'CRITICAL').length;
            const overdueCount = memberCards.filter(c => c.dueDate && new Date(c.dueDate) < new Date()).length;

            return {
                memberId: member.id,
                userId: member.userId,
                name: member.user.name,
                avatar: member.user.avatar,
                cards: memberCards,
                stats: {
                    total: memberCards.length,
                    highPriority: highPriorityCount,
                    overdue: overdueCount,
                    isOverloaded: memberCards.length > (team.workloadLimit || 5)
                }
            };
        });

        // Add "Unassigned" group if there are cards without owner
        const unassignedCards = activeCards.filter(card => !card.assigneeId);
        if (unassignedCards.length > 0) {
            workload.push({
                memberId: 'unassigned',
                userId: null,
                name: 'Não atribuídos',
                avatar: null,
                cards: unassignedCards,
                stats: {
                    total: unassignedCards.length,
                    highPriority: unassignedCards.filter(c => c.priority === 'HIGH' || c.priority === 'CRITICAL').length,
                    overdue: unassignedCards.filter(c => c.dueDate && new Date(c.dueDate) < new Date()).length,
                    isOverloaded: false
                }
            } as any);
        }

        res.json({
            workloadLimit: team.workloadLimit,
            members: workload
        });
    } catch (error) {
        console.error('Erro ao buscar workload:', error);
        res.status(500).json({ error: 'Erro ao processar carga de trabalho' });
    }
};
