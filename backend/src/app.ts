import express from 'express';
import cors from 'cors';
import passport from 'passport';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import notificationRoutes from './routes/notification.routes';
import attachmentRoutes from './routes/attachment.routes';
import dependencyRoutes from './routes/dependency.routes';
import teamRoutes from './routes/team.routes';
import boardRoutes from './routes/board.routes';
import cardRoutes from './routes/card.routes';
import sprintRoutes from './routes/sprint.routes';
import metricsRoutes from './routes/metrics.routes';
import webhookRoutes from './routes/webhook.routes';
import reportRoutes from './routes/report.routes';
import activityRoutes from './routes/activity.routes';
import { setupRecurrenceJob } from './services/recurrence.service';
import { startJobs as startStagnationJobs } from './jobs/stagnation.job';

dotenv.config();

const app = express();

// Initialize recurring cards job
setupRecurrenceJob();
startStagnationJobs();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/attachments', attachmentRoutes);
app.use('/api/dependencies', dependencyRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/sprints', sprintRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/activities', activityRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;
