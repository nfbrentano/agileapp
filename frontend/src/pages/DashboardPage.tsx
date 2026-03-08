import React, { useState, useEffect } from 'react';
import {
    Users,
    Zap,
    BarChart3,
    Clock,
    Plus,
    Filter,
    MoreVertical,
    TrendingUp,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import api from '../services/api';
import TeamModal from '../components/TeamModal';
import { motion } from 'framer-motion';

interface Team {
    id: string;
    name: string;
    description: string;
    methodology: 'SCRUM' | 'KANBAN';
    color: string;
}

const DashboardPage: React.FC = () => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        try {
            const response = await api.get('/teams');
            setTeams(response.data);
        } catch (error) {
            console.error('Erro ao carregar times', error);
        } finally {
            setIsLoading(false);
        }
    };

    const metrics = [
        { label: 'Total Projects', value: '12', icon: BarChart3, color: 'text-blue-500', bg: 'bg-blue-50', change: '+2.5%', trend: 'up' },
        { label: 'Active Sprints', value: '4', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50', change: 'Stable', trend: 'neutral' },
        { label: 'Team Velocity', value: '48', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50', change: '+12%', trend: 'up' },
        { label: 'Cycle Time', value: '3.2d', icon: Clock, color: 'text-purple-500', bg: 'bg-purple-50', change: '-0.5d', trend: 'up' },
    ];

    return (
        <div className="space-y-10">
            {/* Header */}
            <header className="flex justify-between items-end">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Enterprise Overview</h1>
                    <p className="text-slate-500 font-medium">Manage and track your team's performance globally.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2">
                        <Filter size={18} />
                        Filter
                    </button>
                    <button
                        onClick={() => setIsTeamModalOpen(true)}
                        className="px-4 py-2.5 bg-[#0ea5e9] text-white rounded-xl font-bold text-sm hover:bg-sky-600 transition-all shadow-lg shadow-sky-500/20 flex items-center gap-2"
                    >
                        <Plus size={18} />
                        New Project
                    </button>
                </div>
            </header>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((metric, index) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        key={metric.label}
                        className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow group cursor-default"
                    >
                        <div className="flex justify-between items-start">
                            <div className={`p-3 rounded-2xl ${metric.bg} ${metric.color} group-hover:scale-110 transition-transform`}>
                                <metric.icon size={24} />
                            </div>
                            <span className={`text-[10px] font-black px-2 py-1 rounded-full ${metric.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'
                                }`}>
                                {metric.change}
                            </span>
                        </div>
                        <div className="mt-4">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{metric.label}</p>
                            <h3 className="text-3xl font-black text-slate-900 mt-1">{metric.value}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Projects List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center px-2">
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Active Projects</h2>
                        <button className="text-[#0ea5e9] text-sm font-bold hover:underline">View all</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {teams.map((team, index) => (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                key={team.id}
                                className="p-5 bg-white border border-slate-100 rounded-3xl hover:border-sky-200 transition-all group cursor-pointer"
                                onClick={() => window.location.href = `/teams/${team.id}`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg" style={{ backgroundColor: team.color || '#0ea5e9', boxShadow: `0 8px 16px -4px ${team.color}40` }}>
                                        {team.name.charAt(0)}
                                    </div>
                                    <button className="text-slate-300 hover:text-slate-600"><MoreVertical size={18} /></button>
                                </div>
                                <div className="mt-4 space-y-1">
                                    <h4 className="font-black text-slate-900 truncate group-hover:text-[#0ea5e9] transition-colors">{team.name}</h4>
                                    <p className="text-slate-400 text-sm line-clamp-1">{team.description || 'No description provided.'}</p>
                                </div>
                                <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-50">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                                                <img src={`https://i.pravatar.cc/150?u=${team.id}${i}`} alt="Avatar" className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                        <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                            +4
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                        <CheckCircle2 size={12} className="text-emerald-500" />
                                        12/15 Tasks
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        {!isLoading && teams.length === 0 && (
                            <div className="col-span-2 p-12 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200 space-y-4">
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                                    <AlertCircle size={32} className="text-slate-300" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-black text-slate-900">No projects found</h3>
                                    <p className="text-slate-400 text-sm">Create your first team to start managing projects.</p>
                                </div>
                                <button onClick={() => setIsTeamModalOpen(true)} className="px-6 py-3 bg-[#0ea5e9] text-white rounded-xl font-bold hover:bg-sky-600 transition-all">
                                    Get Started
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="space-y-6">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight px-2">Recent Activity</h2>
                    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm divide-y divide-slate-50">
                        {[
                            { user: 'Liam Wilson', action: 'moved Task #102 to', target: 'Done', time: '2m ago' },
                            { user: 'Emma Stone', action: 'commented on', target: 'UX Bug', time: '15m ago' },
                            { user: 'AgileApp', action: 'auto-archived sprint', target: 'V1.2', time: '1h ago' },
                        ].map((item, i) => (
                            <div key={i} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-100 shrink-0 overflow-hidden">
                                    <img src={`https://i.pravatar.cc/150?u=${i}`} alt="User" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-slate-900">
                                        {item.user} <span className="text-slate-400 font-medium">{item.action}</span> <span className="text-[#0ea5e9]">{item.target}</span>
                                    </p>
                                    <span className="text-[10px] font-bold text-slate-300 uppercase">{item.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <TeamModal
                isOpen={isTeamModalOpen}
                onClose={() => setIsTeamModalOpen(false)}
                onSuccess={fetchTeams}
            />
        </div>
    );
};

export default DashboardPage;
