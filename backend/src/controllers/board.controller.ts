import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getBoard = async (req: Request, res: Response) => {
    const { teamId } = req.params;

    try {
        const board = await prisma.team.findUnique({
            where: { id: teamId as string },
            include: {
                columns: {
                    orderBy: { order: 'asc' },
                    include: {
                        cards: {
                            orderBy: { order: 'asc' },
                            include: {
                                blockedBy: {
                                    include: {
                                        blocker: {
                                            select: {
                                                id: true,
                                                title: true,
                                                columnId: true
                                            }
                                        }
                                    }
                                },
                                subTasks: {
                                    select: {
                                        id: true,
                                        columnId: true
                                    }
                                }
                            }
                        },
                    },
                },
                sprints: {
                    where: { status: 'ACTIVE' },
                    include: {
                        cards: {
                            include: {
                                card: true,
                            },
                        },
                    },
                },
            },
        });

        if (!board) return res.status(404).json({ error: 'Board não encontrado' });

        res.json(board);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar board' });
    }
};

export const updateColumn = async (req: Request, res: Response) => {
    const { columnId } = req.params;
    const { name, color, wipLimit, order } = req.body;

    try {
        const column = await prisma.column.update({
            where: { id: columnId as string },
            data: { name, color, wipLimit, order },
        });

        res.json(column);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar coluna' });
    }
};
