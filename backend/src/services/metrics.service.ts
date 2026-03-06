import prisma from '../config/prisma';
import { differenceInHours, startOfDay, subDays } from 'date-fns';

export interface MetricsFilters {
    assigneeId?: string | undefined;
    tags?: string[] | undefined;
    startDate?: Date | undefined;
    endDate?: Date | undefined;
}

export const getTeamMetrics = async (teamId: string, days: number = 30, filters: MetricsFilters = {}) => {
    const periodStartDate = filters.startDate || subDays(new Date(), days);
    const periodEndDate = filters.endDate || new Date();

    // Get all columns for this team
    const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: { columns: { orderBy: { order: 'asc' } } }
    });

    if (!team) return null;

    const columns = team.columns;
    if (!columns || columns.length < 2) return null;

    const firstColumnId = columns[0]!.id;
    const lastColumnId = columns[columns.length - 1]!.id;

    // Build Where Clause
    const whereClause: any = {
        teamId,
        columnId: lastColumnId,
        ignoreInMetrics: false,
        columnHistory: {
            some: {
                columnId: lastColumnId,
                enteredAt: {
                    gte: periodStartDate,
                    lte: periodEndDate
                }
            }
        }
    };

    if (filters.assigneeId) {
        whereClause.assigneeId = filters.assigneeId;
    }

    if (filters.tags && filters.tags.length > 0) {
        whereClause.tags = { hasSome: filters.tags };
    }

    // Fetch cards completed within the period with filters
    const completedCards = await prisma.card.findMany({
        where: whereClause,
        include: {
            columnHistory: true
        }
    });

    const metricsData = completedCards.map(card => {
        const history = [...card.columnHistory].sort((a, b) => a.enteredAt.getTime() - b.enteredAt.getTime());

        const createdAt = card.createdAt;
        const completedAt = history.find(h => h.columnId === lastColumnId)?.enteredAt || new Date();

        // Lead Time: From creation to completion (in hours)
        const leadTime = differenceInHours(completedAt, createdAt);

        // Cycle Time: From the moment it left the first column until it reached the last one
        const movedToInProgressAt = history.find(h => h.columnId !== firstColumnId)?.enteredAt || createdAt;
        const cycleTime = differenceInHours(completedAt, movedToInProgressAt);

        return {
            cardId: card.id,
            title: card.title,
            leadTime,
            cycleTime,
            completedAt
        };
    });

    if (metricsData.length === 0) {
        return {
            metricsData: [],
            kpis: { avgLead: 0, avgCycle: 0, p85Cycle: 0, count: 0 },
            filters: { ...filters, days }
        };
    }

    // Calculate KPIs
    const avgLead = metricsData.reduce((acc, curr) => acc + curr.leadTime, 0) / metricsData.length;
    const avgCycle = metricsData.reduce((acc, curr) => acc + curr.cycleTime, 0) / metricsData.length;

    // Percentile 85 for Cycle Time
    const sortedCycleTimes = [...metricsData].sort((a, b) => a.cycleTime - b.cycleTime);
    const p85Index = Math.floor(sortedCycleTimes.length * 0.85);
    const p85Cycle = sortedCycleTimes[p85Index]?.cycleTime || avgCycle;

    return {
        metricsData,
        kpis: {
            avgLead: Math.round(avgLead * 10) / 10,
            avgCycle: Math.round(avgCycle * 10) / 10,
            p85Cycle: Math.round(p85Cycle * 10) / 10,
            count: metricsData.length
        },
        filters: { ...filters, days }
    };
};
