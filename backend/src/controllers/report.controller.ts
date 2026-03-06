import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getSprintReport = async (req: Request, res: Response) => {
    const { idOrToken } = req.params;

    try {
        // Try to find by ID first, then by token
        const report = await prisma.sprintReport.findFirst({
            where: {
                OR: [
                    { id: idOrToken as string },
                    { shareToken: idOrToken as string }
                ]
            },
            include: {
                sprint: {
                    include: {
                        team: true
                    }
                }
            }
        });

        if (!report) {
            return res.status(404).json({ error: 'Relatório não encontrado' });
        }

        res.json(report);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar relatório' });
    }
};

export const getTeamReports = async (req: Request, res: Response) => {
    const { teamId } = req.params;

    try {
        const reports = await prisma.sprintReport.findMany({
            where: {
                sprint: { teamId: teamId as string }
            },
            include: {
                sprint: true
            },
            orderBy: { generatedAt: 'desc' }
        });

        res.json(reports);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar relatórios do time' });
    }
};
