import prisma from '../config/prisma';
import axios from 'axios';
import crypto from 'crypto';

export enum WebhookEvent {
    CARD_CREATED = 'CARD_CREATED',
    CARD_MOVED = 'CARD_MOVED',
    CARD_ASSIGNED = 'CARD_ASSIGNED',
    CARD_COMPLETED = 'CARD_COMPLETED',
    CARD_DELETED = 'CARD_DELETED',
    COMMENT_ADDED = 'COMMENT_ADDED',
    SPRINT_STARTED = 'SPRINT_STARTED',
    SPRINT_CLOSED = 'SPRINT_CLOSED',
    MEMBER_ADDED = 'MEMBER_ADDED',
    WIP_LIMIT_REACHED = 'WIP_LIMIT_REACHED',
    CARD_STAGNATED = 'CARD_STAGNATED',
    TEST_EVENT = 'TEST_EVENT'
}

export interface WebhookPayload {
    event: WebhookEvent;
    teamId: string;
    timestamp: string;
    actor: {
        id: string;
        name: string;
        email: string;
    };
    data: any;
}

export class WebhookService {
    /**
     * Dispatches a webhook event to all active webhooks for a team.
     */
    static async dispatch(teamId: string, event: WebhookEvent, actorId: string | undefined, data: any) {
        const webhooks = await prisma.webhook.findMany({
            where: {
                teamId,
                active: true,
                events: {
                    array_contains: event
                }
            }
        });

        if (webhooks.length === 0) return;

        // Fetch actor details
        let actorData = { id: 'system', name: 'System', email: 'system@agileapp.com' };
        if (actorId) {
            const user = await prisma.user.findUnique({ where: { id: actorId } });
            if (user) {
                actorData = {
                    id: user.id,
                    name: user.name || 'Unknown',
                    email: user.email
                };
            }
        }

        const payload: WebhookPayload = {
            event,
            teamId,
            timestamp: new Date().toISOString(),
            actor: actorData,
            data
        };

        // Fire and forget
        webhooks.forEach(webhook => {
            this.sendWebhook(webhook, payload).catch(err => {
                console.error(`Failed to send webhook ${webhook.id}:`, err);
            });
        });
    }

    /**
     * Internal method to send a single webhook with signature and retry logic.
     */
    private static async sendWebhook(webhook: any, payload: WebhookPayload, attempt = 1) {
        const startTime = Date.now();
        const payloadString = JSON.stringify(payload);

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'X-Webhook-Event': payload.event,
        };

        // Sign payload if secret is configured
        if (webhook.secret) {
            const signature = crypto
                .createHmac('sha256', webhook.secret)
                .update(payloadString)
                .digest('hex');
            headers['X-Webhook-Signature'] = `sha256=${signature}`;
        }

        try {
            const response = await axios.post(webhook.url, payloadString, {
                headers,
                timeout: 10000 // 10s timeout
            });

            const duration = Date.now() - startTime;

            // Log successful delivery
            await prisma.webhookLog.create({
                data: {
                    webhookId: webhook.id,
                    event: payload.event,
                    payload: payload as any,
                    responseStatus: response.status,
                    success: true,
                    duration
                }
            });

            // If it was failing before, we could reset its status here if we had a status field
        } catch (error: any) {
            const duration = Date.now() - startTime;
            const statusCode = error.response?.status;
            const errorMessage = error.message;

            // Log failed delivery
            await prisma.webhookLog.create({
                data: {
                    webhookId: webhook.id,
                    event: payload.event,
                    payload: payload as any,
                    responseStatus: statusCode || null,
                    success: false,
                    duration,
                    error: errorMessage
                }
            });

            // Exponential backoff retry (Attempt 1, 2, 3)
            if (attempt < 3) {
                const delays = [30000, 300000]; // 30s, 5m
                const nextDelay = delays[attempt - 1] || 30000;

                setTimeout(() => {
                    this.sendWebhook(webhook, payload, attempt + 1);
                }, nextDelay);
            } else {
                // Persistent failure: deactivate or mark as failing
                // For now, let's keep it simple and just mark as failing in logs
                // In a real app, we'd notify the admin
                console.warn(`Webhook ${webhook.id} reached max retries and failed.`);
            }
        }
    }

    /**
     * For manual testing an existing webhook
     */
    static async testWebhook(webhookId: string) {
        const webhook = await prisma.webhook.findUnique({
            where: { id: webhookId }
        });

        if (!webhook) throw new Error('Webhook not found');

        const testPayload: WebhookPayload = {
            event: WebhookEvent.TEST_EVENT,
            teamId: webhook.teamId,
            timestamp: new Date().toISOString(),
            actor: {
                id: 'system',
                name: 'System Bot',
                email: 'system@agileapp.com'
            },
            data: {
                message: 'This is a test notification from AgileApp',
                webhookId: webhook.id
            }
        };

        return this.sendWebhook(webhook, testPayload);
    }
}
