import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const createTeam = async (req: Request, res: Response) => {
    const { name, description, mode, color } = req.body;
    const userId = (req as any).user.id;

    try {
        const team = await prisma.team.create({
            data: {
                name,
                description,
                mode: mode || 'KANBAN',
                color,
                members: {
                    create: {
                        userId,
                        role: 'ADMIN',
                    },
                },
                columns: {
                    createMany: {
                        data: [
                            { name: 'Backlog', order: 0 },
                            { name: 'A Fazer', order: 1 },
                            { name: 'Em Progresso', order: 2 },
                            { name: 'Em Revisão', order: 3 },
                            { name: 'Concluído', order: 4 },
                        ],
                    },
                },
            },
            include: {
                columns: true,
                members: true,
            },
        });

        res.status(201).json(team);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar time' });
    }
};

export const getMyTeams = async (req: Request, res: Response) => {
    const userId = (req as any).user.id;

    try {
        const teams = await prisma.team.findMany({
            where: {
                members: {
                    some: { userId },
                },
            },
            include: {
                members: true,
            },
        });

        res.json(teams);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar times' });
    }
};

export const getTeamById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const team = await prisma.team.findUnique({
            where: { id }
        });
        if (!team) return res.status(404).json({ error: 'Team not found' });
        res.json(team);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch team' });
    }
};

export const updateTeam = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description, mode, color } = req.body;
    try {
        const team = await prisma.team.update({
            where: { id },
            data: { name, description, mode, color }
        });
        res.json(team);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update team' });
    }
};

export const deleteTeam = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.team.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete team' });
    }
};

export const getTeamMembers = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const members = await prisma.teamMember.findMany({
            where: { teamId: id },
            include: { user: true }
        });
        // Map to match frontend Member interface
        const formattedMembers = members.map(m => ({
            id: m.userId,
            name: m.user.name,
            email: m.user.email,
            avatar: m.user.avatar,
            role: m.role,
            joinedAt: m.user.createdAt
        }));
        res.json(formattedMembers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch members' });
    }
};

export const addTeamMember = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { email } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const member = await prisma.teamMember.create({
            data: {
                teamId: id,
                userId: user.id,
                role: 'MEMBER'
            }
        });
        res.json(member);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add member' });
    }
};

export const removeTeamMember = async (req: Request, res: Response) => {
    const { id, memberId } = req.params;
    try {
        await prisma.teamMember.delete({
            where: {
                userId_teamId: { userId: memberId, teamId: id }
            }
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove member' });
    }
};

export const getTeamSprints = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const sprints = await prisma.sprint.findMany({
            where: { teamId: id },
            orderBy: { createdAt: 'desc' }
        });
        
        // Ensure returning stats if possible, or just raw sprints if report isn't populated
        const formatted = sprints.map(s => ({
            id: s.id,
            name: s.name,
            startDate: s.startDate,
            endDate: s.endDate,
            status: s.status,
            velocity: 0,
            completedPoints: 0,
            totalPoints: 0
        }));
        res.json(formatted);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch sprints' });
    }
};

export const getTeamStats = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const totalCards = await prisma.card.count({ where: { teamId: id } });
        const completedCards = await prisma.card.count({ 
            where: { 
                teamId: id, 
                column: { name: 'Concluído' } // approximation
            } 
        });
        const activeSprints = await prisma.sprint.count({
            where: { teamId: id, status: 'ACTIVE' }
        });

        res.json({
            totalCards,
            completedCards,
            activeSprints,
            velocity: 0,
            avgCycleTime: 0
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};
