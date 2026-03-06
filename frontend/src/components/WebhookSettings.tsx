import React, { useState, useEffect } from 'react';
import {
    Globe, Plus, Trash2, CheckCircle, XCircle, Clock,
    AlertCircle, Shield, Activity,
    Key, RefreshCw, ExternalLink, Copy, Check, Info
} from 'lucide-react';
import type { Webhook, WebhookDelivery } from '../services/webhookService';
import webhookService from '../services/webhookService';

interface WebhookSettingsProps {
    teamId: string;
}

const WebhookSettings: React.FC<WebhookSettingsProps> = ({ teamId }) => {
    const [webhooks, setWebhooks] = useState<Webhook[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [newUrl, setNewUrl] = useState('');
    const [newSecret, setNewSecret] = useState('');
    const [selectedEvents, setSelectedEvents] = useState<string[]>(['CARD_CREATED', 'CARD_MOVED']);
    const [activeLogs, setActiveLogs] = useState<string | null>(null);
    const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const availableEvents = [
        { id: 'CARD_CREATED', label: 'Card Created', desc: 'When a new card is added to the board' },
        { id: 'CARD_MOVED', label: 'Card Moved', desc: 'When a card changes columns' },
        { id: 'CARD_ASSIGNED', label: 'Card Assigned', desc: 'When a team member is assigned to a card' },
        { id: 'CARD_COMPLETED', label: 'Card Completed', desc: 'When a card reaches the final column' },
        { id: 'CARD_DELETED', label: 'Card Deleted', desc: 'When a card is removed from the board' },
        { id: 'COMMENT_ADDED', label: 'Comment Added', desc: 'When a new comment is posted on a card' },
        { id: 'SPRINT_STARTED', label: 'Sprint Started', desc: 'When a new sprint begins' },
        { id: 'SPRINT_CLOSED', label: 'Sprint Closed', desc: 'When a sprint is completed' },
        { id: 'MEMBER_ADDED', label: 'Member Added', desc: 'When a new member joins the team' },
        { id: 'WIP_LIMIT_REACHED', label: 'WIP Limit Reached', desc: 'When a column exceeds its WIP capacity' },
        { id: 'CARD_STAGNATED', label: 'Card Stagnated', desc: 'When a card stays in a column for too long' }
    ];

    useEffect(() => {
        loadWebhooks();
    }, [teamId]);

    const loadWebhooks = async () => {
        setIsLoading(true);
        try {
            const data = await webhookService.listWebhooks(teamId);
            setWebhooks(data);
        } catch (err) {
            console.error('Error loading webhooks', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await webhookService.createWebhook(teamId, {
                url: newUrl,
                secret: newSecret || undefined,
                events: selectedEvents,
                active: true
            });
            setNewUrl('');
            setNewSecret('');
            setShowForm(false);
            loadWebhooks();
        } catch (err) {
            alert('Error creating webhook');
        }
    };

    const handleToggle = async (webhook: Webhook) => {
        try {
            await webhookService.updateWebhook(webhook.id, { active: !webhook.active });
            loadWebhooks();
        } catch (err) {
            alert('Error toggling status');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this webhook?')) return;
        try {
            await webhookService.deleteWebhook(id);
            loadWebhooks();
        } catch (err) {
            alert('Error deleting webhook');
        }
    };

    const handleTest = async (id: string) => {
        try {
            await webhookService.testWebhook(id);
            alert('Test event dispatched!');
            if (activeLogs === id) loadDeliveries(id);
        } catch (err) {
            alert('Test failed');
        }
    };

    const loadDeliveries = async (webhookId: string) => {
        if (activeLogs === webhookId) {
            setActiveLogs(null);
            return;
        }
        try {
            const data = await webhookService.listDeliveries(webhookId);
            setDeliveries(data);
            setActiveLogs(webhookId);
        } catch (err) {
            console.error('Error loading deliveries', err);
        }
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const generateSecret = () => {
        const secret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        setNewSecret(secret);
    };

    return (
        <div className="space-y-8 animate-in mt-2 fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
                        <div className="p-2 bg-primary-500/10 rounded-xl">
                            <Globe className="text-primary-400" size={24} />
                        </div>
                        Webhooks Outbound
                    </h2>
                    <p className="text-slate-400 mt-2 max-w-xl">
                        Send real-time notifications to external services like Discord, Slack, or internal APIs when activities happen in your board.
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-primary-900/20 active:scale-95 whitespace-nowrap"
                >
                    <Plus size={20} />
                    Add Webhook
                </button>
            </div>

            {/* Creation Form */}
            {showForm && (
                <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-8 backdrop-blur-sm shadow-2xl animate-in zoom-in-95 duration-300">
                    <form onSubmit={handleCreate} className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Target URL</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-400 transition-colors">
                                            <Globe size={18} />
                                        </div>
                                        <input
                                            type="url"
                                            required
                                            value={newUrl}
                                            onChange={e => setNewUrl(e.target.value)}
                                            placeholder="https://your-api.com/webhook"
                                            className="w-full bg-slate-950 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-primary-500/50 transition-all placeholder:text-slate-700"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center justify-between">
                                        Signing Secret (Optional)
                                        <button
                                            type="button"
                                            onClick={generateSecret}
                                            className="text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1 normal-case tracking-normal"
                                        >
                                            <RefreshCw size={12} /> Auto-generate
                                        </button>
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-400 transition-colors">
                                            <Key size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            value={newSecret}
                                            onChange={e => setNewSecret(e.target.value)}
                                            placeholder="Enter or generate a secret"
                                            className="w-full bg-slate-950 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-primary-500/50 transition-all placeholder:text-slate-700"
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1">
                                        <Shield size={10} /> Used to sign payloads with HMAC-SHA256 for security.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Event Subscriptions</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                                    {availableEvents.map(event => (
                                        <label
                                            key={event.id}
                                            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedEvents.includes(event.id)
                                                    ? 'bg-primary-500/10 border-primary-500/30 text-white'
                                                    : 'bg-slate-950/50 border-white/5 text-slate-400 hover:border-white/10'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                className="mt-1 accent-primary-500"
                                                checked={selectedEvents.includes(event.id)}
                                                onChange={e => {
                                                    if (e.target.checked) setSelectedEvents([...selectedEvents, event.id]);
                                                    else setSelectedEvents(selectedEvents.filter(x => x !== event.id));
                                                }}
                                            />
                                            <div className="min-w-0">
                                                <div className="text-xs font-bold">{event.label}</div>
                                                <div className="text-[10px] text-slate-500 truncate">{event.desc}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 border-t border-white/5 pt-8">
                            <button
                                type="submit"
                                className="flex-1 bg-primary-600 hover:bg-primary-500 text-white py-4 rounded-2xl font-bold transition-all shadow-lg active:scale-[0.98]"
                            >
                                Save Configuration
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-10 bg-slate-800 hover:bg-slate-700 text-slate-300 py-4 rounded-2xl font-bold transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Webhooks List */}
            <div className={`space-y-4 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                {webhooks.length === 0 && !showForm && (
                    <div className="bg-slate-900/20 border-2 border-dashed border-white/5 rounded-[2rem] py-20 text-center">
                        <div className="relative inline-block">
                            <Globe size={64} className="text-slate-800 mx-auto" />
                            <div className="absolute -bottom-2 -right-2 p-2 bg-slate-900 rounded-full border border-white/5">
                                <AlertCircle size={20} className="text-slate-600" />
                            </div>
                        </div>
                        <h3 className="text-slate-400 font-bold mt-6">No Webhooks Yet</h3>
                        <p className="text-slate-600 text-sm mt-1 max-w-sm mx-auto">
                            Add your first integration to start receiving real-time board updates in your favorite tools.
                        </p>
                    </div>
                )}

                {webhooks.map(webhook => (
                    <div
                        key={webhook.id}
                        className="group bg-slate-900/40 border border-white/5 rounded-3xl overflow-hidden hover:border-white/10 transition-all"
                    >
                        <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div className="flex items-start gap-5 flex-1 min-w-0">
                                <div className={`mt-1.5 w-3 h-3 rounded-full shrink-0 ${webhook.active ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]' : 'bg-slate-700'}`} />
                                <div className="space-y-3 flex-1 min-w-0">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-bold text-white truncate text-lg">{webhook.url}</h3>
                                        <button
                                            onClick={() => copyToClipboard(webhook.url, `url-${webhook.id}`)}
                                            className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            {copiedId === `url-${webhook.id}` ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {webhook.events.map(ev => (
                                            <span
                                                key={ev}
                                                className="text-[10px] bg-slate-950 text-slate-400 px-2.5 py-1 rounded-full border border-white/5 font-medium"
                                            >
                                                {ev.replace('_', ' ')}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-6 text-[11px]">
                                        <div className="flex items-center gap-1.5 text-slate-500">
                                            <Clock size={12} />
                                            Added {new Date(webhook.createdAt).toLocaleDateString()}
                                        </div>
                                        {webhook.secret && (
                                            <div className="flex items-center gap-1.5 text-slate-500">
                                                <Shield size={12} className="text-primary-500" />
                                                Signed with HMAC
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1.5 text-slate-500">
                                            <Activity size={12} />
                                            {webhook._count?.deliveries || 0} deliveries
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 self-end lg:self-center">
                                <button
                                    onClick={() => loadDeliveries(webhook.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeLogs === webhook.id
                                            ? 'bg-primary-500 text-white shadow-lg shadow-primary-900/20'
                                            : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                                        }`}
                                >
                                    <Activity size={16} /> History
                                </button>
                                <button
                                    onClick={() => handleTest(webhook.id)}
                                    className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-sky-400 rounded-xl transition-all"
                                    title="Send Test Notification"
                                >
                                    <ExternalLink size={18} />
                                </button>
                                <button
                                    onClick={() => handleToggle(webhook)}
                                    className={`p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all ${webhook.active ? 'text-emerald-500' : 'text-slate-600'}`}
                                    title={webhook.active ? 'Deactivate Webhook' : 'Activate Webhook'}
                                >
                                    <Shield size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(webhook.id)}
                                    className="p-3 bg-slate-800 hover:bg-red-500/10 text-slate-600 hover:text-red-500 rounded-xl transition-all"
                                    title="Delete Webhook"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Recent Deliveries Panel */}
                        {activeLogs === webhook.id && (
                            <div className="bg-black/30 border-t border-white/5 p-8 space-y-4 animate-in slide-in-from-top-4 duration-300">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Clock size={14} className="text-primary-400" /> Recent Delivery Logs
                                    </h4>
                                    <button
                                        onClick={() => loadDeliveries(webhook.id)}
                                        className="text-[10px] text-primary-400 hover:underline"
                                    >
                                        Refresh Logs
                                    </button>
                                </div>

                                <div className="space-y-2 overflow-hidden">
                                    {deliveries.length === 0 && (
                                        <div className="py-10 text-center bg-slate-950/20 rounded-2xl border border-dashed border-white/5">
                                            <p className="text-slate-600 text-xs italic">No delivery attempts recorded for this webhook.</p>
                                        </div>
                                    )}
                                    <div className="grid gap-2">
                                        {deliveries.map(delivery => (
                                            <div
                                                key={delivery.id}
                                                className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-950/40 p-4 rounded-2xl border border-white/5 group/row hover:border-white/10 transition-all gap-4"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`shrink-0 p-2 rounded-lg ${delivery.success ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                                                        {delivery.success
                                                            ? <CheckCircle size={16} className="text-emerald-500" />
                                                            : <XCircle size={16} className="text-red-500" />
                                                        }
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-bold text-slate-200">{delivery.event}</span>
                                                            {delivery.attemptCount > 1 && (
                                                                <span className="text-[9px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/20">
                                                                    Attempt #{delivery.attemptCount}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-[10px] text-slate-500 mt-0.5">
                                                            {new Date(delivery.deliveredAt).toLocaleString()} • {delivery.duration}ms
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className="hidden sm:block text-right">
                                                        <div className={`text-[10px] font-mono px-2 py-0.5 rounded ${delivery.statusCode && delivery.statusCode < 300
                                                                ? 'bg-emerald-500/10 text-emerald-400'
                                                                : 'bg-red-500/10 text-red-400'
                                                            }`}>
                                                            {delivery.statusCode || 'FAILED'}
                                                        </div>
                                                        {!delivery.success && delivery.error && (
                                                            <p className="text-[9px] text-red-500/70 mt-1 max-w-[150px] truncate" title={delivery.error}>
                                                                {delivery.error}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <button
                                                        className="text-slate-600 hover:text-white transition-colors"
                                                        onClick={() => alert(JSON.stringify(delivery.payload, null, 2))}
                                                        title="View Payload Data"
                                                    >
                                                        <Info size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WebhookSettings;
