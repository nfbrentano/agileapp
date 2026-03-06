import { Request, Response } from 'express';
import * as metricsService from '../services/metrics.service';

import prisma from '../config/prisma';

export const getTeamMetrics = async (req: Request, res: Response) => {
    const { teamId } = req.params as { teamId: string };
    const { days, assigneeId, tags, startDate, endDate } = req.query;

    try {
        const daysToProcess = typeof days === 'string' ? parseInt(days) : 30;

        const filters = {
            assigneeId: assigneeId as string,
            tags: typeof tags === 'string' ? tags.split(',') : undefined,
            startDate: startDate ? new Date(startDate as string) : undefined,
            endDate: endDate ? new Date(endDate as string) : undefined,
        };

        const metrics = await metricsService.getTeamMetrics(teamId, daysToProcess, filters);
        if (!metrics) return res.status(404).json({ error: 'Time não encontrado ou sem colunas suficientes' });

        res.json(metrics);
    } catch (error) {
        console.error('Erro ao buscar métricas:', error);
        res.status(500).json({ error: 'Erro ao processar métricas do time' });
    }
};

export const getColumnAverages = async (req: Request, res: Response) => {
    const { teamId } = req.params;

    try {
        const averages = await prisma.columnMetrics.findMany({
            where: { column: { teamId: teamId as string } },
            include: { column: true }
        });
        res.json(averages);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar médias por coluna' });
    }
};
