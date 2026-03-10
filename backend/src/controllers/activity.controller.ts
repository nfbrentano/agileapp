import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getMyActivities = async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const limit = parseInt(req.query.limit as string) || 20;

    try {
        // Get teams where user is a member
        const userTeams = await prisma.teamMember.findMany({
            where: { userId },
            select: { teamId: true }
        });
        const teamIds = userTeams.map(t => t.teamId);

        // Get recent activities from those teams
        const activities = await prisma.activity.findMany({
            where: {
                teamId: { in: teamIds }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                },
                team: {
                    select: {
                        id: true,
                        name: true,
                        color: true
                    }
                },
                card: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit
        });

        res.json(activities);
    } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({ error: 'Failed to fetch activities' });
    }
};

export const getTeamActivities = async (req: Request, res: Response) => {
    const { teamId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    try {
        const activities = await prisma.activity.findMany({
            where: { teamId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                },
                card: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit
        });

        res.json(activities);
    } catch (error) {
        console.error('Error fetching team activities:', error);
        res.status(500).json({ error: 'Failed to fetch team activities' });
    }
};

// Helper function to create activity (used by other controllers)
export const createActivity = async (data: {
    type: 'CARD_MOVED' | 'CARD_CREATED' | 'CARD_UPDATED' | 'CARD_DELETED' | 
          'COMMENT_ADDED' | 'SPRINT_STARTED' | 'SPRINT_ENDED' | 'SPRINT_ARCHIVED' |
          'TEAM_JOINED' | 'TEAM_LEFT';
    userId: string;
    teamId: string;
    cardId?: string;
    description: string;
    metadata?: any;
}) => {
    try {
        const activity = await prisma.activity.create({
            data: {
                type: data.type,
                userId: data.userId,
                teamId: data.teamId,
                cardId: data.cardId,
                description: data.description,
                metadata: data.metadata || null
            }
        });
        return activity;
    } catch (error) {
        console.error('Error creating activity:', error);
        return null;
    }
};
