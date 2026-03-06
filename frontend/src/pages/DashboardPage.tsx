import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, Layout, Clock, User } from 'lucide-react';
import api from '../services/api';
import NotificationBadge from '../components/NotificationBadge';

interface Team {
    id: string;
    name: string;
    description: string;
    mode: 'KANBAN' | 'SCRUM';
    color: string;
}

const DashboardPage: React.FC = () => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const response = await api.get('/teams');
                setTeams(response.data);
            } catch (error) {
                console.error('Erro ao buscar times', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTeams();
    }, []);

    return (
        <div className="min-h-screen bg-[#0f172a] text-white p-8">
            <header className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-4xl font-bold mb-2">Seus Projetos</h1>
                    <p className="text-slate-400">Gerencie seus times e fluxos de trabalho ágeis.</p>
                </div>
                <div className="flex items-center gap-4">
                    <NotificationBadge />
                    <Link to="/profile" className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                        <User size={20} />
                    </Link>
                    <button className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary-500/20">
                        <Plus size={20} />
                        Novo Time
                    </button>
                </div>
            </header>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-slate-800/50 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teams.map(team => (
                        <Link
                            key={team.id}
                            to={`/teams/${team.id}`}
                            className="group bg-slate-800/50 border border-white/5 p-6 rounded-2xl hover:bg-slate-800 transition-all hover:border-primary-500/30 hover:shadow-2xl shadow-primary-500/10"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 rounded-xl bg-slate-700/50 group-hover:bg-primary-500/20 transition-all">
                                    <Users size={24} className="group-hover:text-primary-400" />
                                </div>
                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${team.mode === 'KANBAN' ? 'bg-orange-500/10 text-orange-400' : 'bg-blue-500/10 text-blue-400'
                                    }`}>
                                    {team.mode}
                                </span>
                            </div>
                            <h2 className="text-xl font-bold mb-1 group-hover:text-primary-400 transition-colors">{team.name}</h2>
                            <p className="text-slate-400 text-sm mb-6 line-clamp-2">{team.description || 'Sem descrição.'}</p>

                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                <div className="flex items-center gap-1">
                                    <Layout size={14} />
                                    <span>5 colunas</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock size={14} />
                                    <span>Atualizado hoje</span>
                                </div>
                            </div>
                        </Link>
                    ))}

                    <button className="flex flex-col items-center justify-center gap-3 bg-slate-800/20 border-2 border-dashed border-white/5 p-6 rounded-2xl hover:border-primary-500/50 hover:bg-slate-800/40 transition-all text-slate-500 hover:text-primary-400">
                        <Plus size={32} />
                        <span className="font-semibold">Criar novo ambiente</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
