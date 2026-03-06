import prisma from '../config/prisma';

export const addDependency = async (blockerId: string, blockedId: string) => {
    if (blockerId === blockedId) {
        throw new Error('Um card não pode bloquear a si mesmo');
    }

    return await prisma.cardDependency.create({
        data: {
            blockerId,
            blockedId
        }
    });
};

export const removeDependency = async (id: string) => {
    return await prisma.cardDependency.delete({
        where: { id }
    });
};

export const getCardDependencies = async (cardId: string) => {
    const blockedBy = await prisma.cardDependency.findMany({
        where: { blockedId: cardId },
        include: { blocker: true }
    });

    const blocking = await prisma.cardDependency.findMany({
        where: { blockerId: cardId },
        include: { blocked: true }
    });

    return { blockedBy, blocking };
};

export const checkBlockers = async (cardId: string) => {
    // A card is blocked if it has blockers that are not in the "DONE" column
    // For this, we need to know what "DONE" means. Usually the last column or named "Concluído"
    // Let's find dependencies where cardId is the blockedId and the blocker's column is NOT the last one in the team.

    const dependencies = await prisma.cardDependency.findMany({
        where: { blockedId: cardId },
        include: {
            blocker: {
                include: {
                    column: true
                }
            }
        }
    });

    // Strategy: a blocker is active if it's not in a column marked as 'Concluído' or if it's not the last column.
    // Simplifying: let's assume columns have an order, and the highest order is 'done'.
    // Or better, we'll check if the blocker is in a column that is NOT the last one of that team.

    const activeBlockers = [];

    for (const dep of dependencies) {
        const teamColumns = await prisma.column.findMany({
            where: { teamId: dep.blocker.teamId },
            orderBy: { order: 'desc' }
        });

        const doneColumnId = teamColumns[0]?.id;

        if (dep.blocker.columnId !== doneColumnId) {
            activeBlockers.push(dep.blocker);
        }
    }

    return activeBlockers;
};
