import React, { useState, useEffect } from 'react';
import { Bell, Check, ExternalLink, Inbox, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { notificationService, type Notification } from '../services/notificationService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const NotificationsPage: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        setIsLoading(true);
        try {
            const data = await notificationService.getNotifications(50);
            setNotifications(data);
        } catch (err) {
            console.error('Erro ao carregar notificações');
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarkAsRead = async (id: string) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (err) {
            console.error('Erro ao marcar como lida');
        }
    };

    const filteredNotifications = filter === 'ALL'
        ? notifications
        : notifications.filter(n => !n.read);

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 p-6">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                            <ArrowLeft size={24} />
                        </Link>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Bell className="text-primary-500" /> Central de Notificações
                        </h1>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-900/50 p-1 rounded-xl border border-white/5">
                        <button
                            onClick={() => setFilter('ALL')}
                            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${filter === 'ALL' ? 'bg-primary-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Todas
                        </button>
                        <button
                            onClick={() => setFilter('UNREAD')}
                            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${filter === 'UNREAD' ? 'bg-primary-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Não lidas
                        </button>
                    </div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                    {isLoading ? (
                        <div className="p-20 flex justify-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary-500" />
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="p-20 text-center space-y-4">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                                <Inbox size={32} className="text-slate-600" />
                            </div>
                            <p className="text-slate-500 font-medium">Você está em dia! Nenhuma notificação encontrada.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {filteredNotifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`p-6 hover:bg-white/5 transition-all group flex items-start gap-4 ${!notification.read ? 'bg-primary-500/5' : ''}`}
                                >
                                    <div className={`mt-1 p-2 rounded-xl ${notification.read ? 'bg-white/5 text-slate-500' : 'bg-primary-500/20 text-primary-400'}`}>
                                        <Bell size={18} />
                                    </div>

                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <p className={`text-sm ${!notification.read ? 'text-white font-bold' : 'text-slate-400'}`}>
                                                {notification.message}
                                            </p>
                                            <span className="text-xs text-slate-500 whitespace-nowrap">
                                                {format(new Date(notification.createdAt), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-4 pt-2">
                                            {notification.link && (
                                                <Link
                                                    to={notification.link}
                                                    className="text-xs font-bold text-primary-400 hover:text-white flex items-center gap-1 transition-colors"
                                                >
                                                    <ExternalLink size={14} /> Acessar conteúdo
                                                </Link>
                                            )}
                                            {!notification.read && (
                                                <button
                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                    className="text-xs font-bold text-green-400 hover:text-white flex items-center gap-1 transition-colors"
                                                >
                                                    <Check size={14} /> Marcar como lida
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationsPage;
