import cron from 'node-cron';
import * as stagnationService from '../services/stagnation.service';
import prisma from '../config/prisma';

// Run stagnation detection every hour
cron.schedule('0 * * * *', async () => {
    console.log('[Job] Checking for stagnated cards...');
    try {
        await stagnationService.checkStagnatedCards();
    } catch (err) {
        console.error('[Job] Error in stagnation check:', err);
    }
});

// Calculate column averages every day at midnight
cron.schedule('0 0 * * *', async () => {
    console.log('[Job] Calculating column averages for all teams...');
    try {
        const teams = await prisma.team.findMany({ select: { id: true } });
        for (const team of teams) {
            await stagnationService.calculateColumnAverages(team.id);
        }
    } catch (err) {
        console.error('[Job] Error calculating column averages:', err);
    }
});

export const startJobs = () => {
    console.log('Cron jobs initiated.');
};
