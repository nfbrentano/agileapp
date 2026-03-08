import React, { useEffect, useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';
import { metricsService, type TeamMetrics } from '../services/metricsService';
import { TrendingUp, Clock, Target, BarChart2, Filter, X, User as UserIcon, Tag as TagIcon, ChevronDown } from 'lucide-react';
import api from '../services/api';

interface MetricsDashboardProps {
    teamId: string;
}

const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ teamId }) => {
    const [metrics, setMetrics] = useState<TeamMetrics | null>(null);
    const [days, setDays] = useState(30);
    const [loading, setLoading] = useState(true);
    const [teamMembers, setTeamMembers] = useState<any[]>([]);
    const [selectedAssignee, setSelectedAssignee] = useState<string>('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
    const [showTagDropdown, setShowTagDropdown] = useState(false);

    useEffect(() => {
        fetchMetrics();
    }, [teamId, days, selectedAssignee, selectedTags]);

    useEffect(() => {
        fetchFilterData();
    }, [teamId]);

    const fetchFilterData = async () => {
        try {
            const { data } = await api.get(`/boards/${teamId}`);
            setTeamMembers(data.members || []);
            const tags = new Set<string>();
            data.columns?.forEach((col: any) => {
                col.cards?.forEach((card: any) => {
                    card.tags?.forEach((t: string) => tags.add(t));
                });
            });
            setAvailableTags(Array.from(tags));
        } catch (err) {
            console.error('Error fetching filter data');
        }
    };

    const fetchMetrics = async () => {
        setLoading(true);
        try {
            const data = await metricsService.getTeamMetrics(teamId, days, {
                assigneeId: selectedAssignee || undefined,
                tags: selectedTags.length > 0 ? selectedTags : undefined
            });
            setMetrics(data);
        } catch (err) {
            console.error('Error fetching metrics');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !metrics) {
        return <div className="p-8 text-slate-500 animate-pulse">Carregando métricas...</div>;
    }

    const chartData = metrics?.metricsData.map(d => ({
        ...d,
        date: new Date(d.completedAt).toLocaleDateString(),
        leadDays: Math.round((d.leadTime / 24) * 10) / 10,
        cycleDays: Math.round((d.cycleTime / 24) * 10) / 10,
    })) || [];

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 bg-slate-950/20">
            {/* Header & Filters */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">Métricas de Performance</h2>
                        <p className="text-slate-400 text-sm">Acompanhe a velocidade e eficiência das entregas do time.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-900/50 p-1 rounded-xl border border-white/5">
                        {[7, 30, 90].map(d => (
                            <button
                                key={d}
                                onClick={() => setDays(d)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${days === d ? 'bg-primary-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                Last {d}d
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 bg-slate-900/40 p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2 text-slate-500 mr-2">
                        <Filter size={16} />
                        <span className="text-xs font-bold uppercase tracking-widest">Filtros</span>
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${selectedAssignee ? 'bg-primary-500/10 border-primary-500/30 text-primary-400' : 'bg-slate-900 border-white/5 text-slate-400'}`}
                        >
                            <UserIcon size={14} />
                            {selectedAssignee ? (teamMembers.find(m => m.userId === selectedAssignee)?.user?.name || 'Responsável') : 'Todos Responsáveis'}
                            <ChevronDown size={14} className={`transition-transform ${showAssigneeDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        {showAssigneeDropdown && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowAssigneeDropdown(false)} />
                                <div className="absolute top-full left-0 mt-2 w-56 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-50 py-2 overflow-hidden animate-in fade-in zoom-in-95 origin-top">
                                    <button
                                        onClick={() => { setSelectedAssignee(''); setShowAssigneeDropdown(false); }}
                                        className="w-full text-left px-4 py-2 text-xs hover:bg-white/5 transition-colors"
                                    >
                                        Todos Responsáveis
                                    </button>
                                    {teamMembers.map(m => (
                                        <button
                                            key={m.userId}
                                            onClick={() => { setSelectedAssignee(m.userId); setShowAssigneeDropdown(false); }}
                                            className="w-full text-left px-4 py-2 text-xs hover:bg-white/5 transition-colors"
                                        >
                                            {m.user?.name}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900/40 p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-all group">
                    <div className="flex items-start justify-between">
                        <div className="p-3 bg-primary-500/10 rounded-2xl text-primary-400 group-hover:scale-110 transition-transform">
                            <Clock size={24} />
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Avg Cycle Time</p>
                        <h3 className="text-3xl font-bold text-white mt-1">{metrics?.avgCycleTime.toFixed(1)}h</h3>
                    </div>
                </div>
                <div className="bg-slate-900/40 p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-all group">
                    <div className="flex items-start justify-between">
                        <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 group-hover:scale-110 transition-transform">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Avg Lead Time</p>
                        <h3 className="text-3xl font-bold text-white mt-1">{metrics?.avgLeadTime.toFixed(1)}h</h3>
                    </div>
                </div>
                <div className="bg-slate-900/40 p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-all group">
                    <div className="flex items-start justify-between">
                        <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-400 group-hover:scale-110 transition-transform">
                            <Target size={24} />
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Median Lead Time</p>
                        <h3 className="text-3xl font-bold text-white mt-1">{metrics?.medianLeadTime.toFixed(1)}h</h3>
                    </div>
                </div>

            </div>

            {/* Scatter Plot */}
            <div className="bg-slate-900/40 p-8 rounded-3xl border border-white/5 min-h-[450px]">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <BarChart2 size={20} className="text-primary-400" />
                        Gráfico de Dispersão (Lead Time)
                    </h3>
                </div>
                <div className="h-[350px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis
                                dataKey="date"
                                name="Data Conclusão"
                                stroke="#64748b"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                dataKey="leadTime"
                                name="Lead Time (h)"
                                stroke="#64748b"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                            />
                            <ZAxis type="number" range={[60, 60]} />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return (
                                            <div className="bg-slate-900 border border-white/10 p-4 rounded-xl shadow-2xl">
                                                <p className="text-xs font-bold text-white mb-2">{data.title}</p>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] text-slate-400">Finalizado: <span className="text-slate-200">{data.date}</span></p>
                                                    <p className="text-[10px] text-slate-400">Cycle Time: <span className="text-emerald-400 font-bold">{data.cycleTime}h</span></p>
                                                    <p className="text-[10px] text-slate-400">Lead Time: <span className="text-primary-400 font-bold">{data.leadTime}h</span></p>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Scatter name="Cards" data={chartData} fill="#3b82f6" shape="circle" />
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default MetricsDashboard;
