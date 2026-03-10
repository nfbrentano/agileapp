import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getDashboardStats = async (req: Request, res: Response) => {
    const userId = (req as any).user.id;

    try {
        // Get user's teams
        const teams = await prisma.team.findMany({
            where: { members: { some: { userId } } },
            include: {
                columns: true,
                members: { include: { user: true } },
                _count: {
                    select: {
                        cards: true
                    }
                }
            }
        });

        // Get recent activities across all user's teams
        const activities = await prisma.activity.findMany({
            where: {
                OR: [
                    { userId },
                    { teamId: { in: teams.map(t => t.id) } }
                ]
            },
            include: {
                user: { select: { name: true, avatar: true } },
                team: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        // Get cards assigned to user across all teams
        const userCards = await prisma.card.findMany({
            where: {
                assigneeId: userId,
                teamId: { in: teams.map(t => t.id) }
            },
            include: { column: true, team: true },
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        // Get team statistics
        const teamStats = teams.map(team => ({
            id: team.id,
            name: team.name,
            color: team.color,
            methodology: team.methodology,
            memberCount: team.members.length,
            cardCount: team._count.cards,
            // Count cards by status (based on column position)
            activeCards: team._count.cards, // Simplified - would need column logic
            completedCards: 0 // Simplified - would need "Done" column logic
        }));

        // Calculate overall stats
        const totalCards = teamStats.reduce((sum, team) => sum + team.cardCount, 0);
        const totalTeams = teams.length;
        const totalMembers = new Set(teams.flatMap(t => t.members.map(m => m.userId))).size;

        res.json({
            stats: {
                totalCards,
                totalTeams,
                totalMembers,
                userCardsCount: userCards.length
            },
            teams: teamStats,
            recentActivities: activities.map(activity => ({
                id: activity.id,
                type: activity.type,
                description: activity.description,
                metadata: activity.metadata,
                createdAt: activity.createdAt,
                user: activity.user,
                team: activity.team
            })),
            myCards: userCards.map(card => ({
                id: card.id,
                title: card.title,
                priority: card.priority,
                dueDate: card.dueDate,
                teamName: card.team.name,
                columnName: card.column.name,
                createdAt: card.createdAt
            }))
        });
    } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
        res.status(500).json({ error: 'Erro ao carregar dashboard' });
    }
};

export const getQuickActions = async (req: Request, res: Response) => {
    const userId = (req as any).user.id;

    try {
        // Get teams where user can create cards
        const teams = await prisma.team.findMany({
            where: { 
                members: { 
                    some: { 
                        userId,
                        role: { in: ['ADMIN', 'MEMBER'] }
                    } 
                } 
            },
            select: {
                id: true,
                name: true,
                color: true
            }
        });

        // Get recent sprints user is involved in
        const recentSprints = await prisma.sprint.findMany({
            where: {
                team: { members: { some: { userId } } },
                status: { in: ['ACTIVE', 'PLANNING'] }
            },
            include: {
                team: { select: { name: true } },
                _count: {
                    select: { sprintCards: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 3
        });

        res.json({
            teams,
            recentSprints: recentSprints.map(sprint => ({
                id: sprint.id,
                name: sprint.name,
                status: sprint.status,
                teamName: sprint.team.name,
                cardCount: sprint._count.sprintCards,
                startDate: sprint.startDate,
                endDate: sprint.endDate
            }))
        });
    } catch (error) {
        console.error('Erro ao buscar quick actions:', error);
        res.status(500).json({ error: 'Erro ao carregar ações rápidas' });
    }
};
