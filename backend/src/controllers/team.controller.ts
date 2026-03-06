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
