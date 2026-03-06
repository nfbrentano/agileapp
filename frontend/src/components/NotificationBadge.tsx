import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, ExternalLink, Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';
import { notificationService, type Notification } from '../services/notificationService';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const NotificationBadge: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        loadNotifications();
        const interval = setInterval(loadNotifications, 30000); // 30s auto-refresh
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadNotifications = async () => {
        try {
            const data = await notificationService.getNotifications(10);
            setNotifications(data);
        } catch (err) {
            console.error('Erro ao carregar notificações');
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

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error('Erro ao marcar todas como lidas');
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary-500 text-[10px] font-bold text-white flex items-center justify-center rounded-full border-2 border-[#0f172a]">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                        <h3 className="font-bold text-sm text-white flex items-center gap-2">
                            <Bell size={14} className="text-primary-400" /> Notificações
                        </h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-[11px] text-primary-400 hover:text-primary-300 font-bold"
                            >
                                Ler todas
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-10 text-center space-y-3">
                                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                                    <Inbox size={24} className="text-slate-600" />
                                </div>
                                <p className="text-xs text-slate-500">Nenhuma notificação por aqui.</p>
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors relative group ${!notification.read ? 'bg-primary-500/5' : ''}`}
                                >
                                    {!notification.read && (
                                        <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-500 rounded-full" />
                                    )}
                                    <div className="flex gap-3">
                                        <div className="flex-1 space-y-1">
                                            <p className={`text-xs leading-relaxed ${!notification.read ? 'text-white font-medium' : 'text-slate-400'}`}>
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] text-slate-500">
                                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: ptBR })}
                                                </span>
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {notification.link && (
                                                        <Link
                                                            to={notification.link}
                                                            onClick={() => setIsOpen(false)}
                                                            className="text-primary-400 hover:text-white"
                                                        >
                                                            <ExternalLink size={12} />
                                                        </Link>
                                                    )}
                                                    {!notification.read && (
                                                        <button
                                                            onClick={() => handleMarkAsRead(notification.id)}
                                                            className="text-green-400 hover:text-white"
                                                        >
                                                            <Check size={12} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <Link
                        to="/notifications"
                        onClick={() => setIsOpen(false)}
                        className="block p-3 text-center text-[11px] font-bold text-slate-500 hover:text-white hover:bg-white/5 border-t border-white/5"
                    >
                        Ver histórico completo
                    </Link>
                </div>
            )}
        </div>
    );
};

export default NotificationBadge;
