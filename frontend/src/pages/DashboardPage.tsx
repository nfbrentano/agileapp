import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Users, Layout, Rocket, Target, ArrowRight } from 'lucide-react';
import api from '../services/api';
import TeamModal from '../components/TeamModal';

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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    const fetchTeams = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/teams');
            setTeams(response.data);
        } catch (error) {
            console.error('Erro ao buscar times', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTeams();
    }, []);

    const handleCreateSuccess = (newTeam: any) => {
        setIsModalOpen(false);
        navigate(`/teams/${newTeam.id}`);
    };

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-5xl font-black text-white tracking-tighter">
                        Seus <span className="text-primary-500">Projetos</span>
                    </h1>
                    <p className="text-slate-400 text-lg font-medium">
                        Você tem {teams.length} {teams.length === 1 ? 'time ativo' : 'times ativos'} no momento.
                    </p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="group flex items-center gap-3 bg-primary-600 hover:bg-primary-700 px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-primary-500/20 active:scale-95"
                >
                    <Plus size={22} className="group-hover:rotate-90 transition-transform" />
                    Novo Time
                </button>
            </header>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-slate-800/30 rounded-3xl animate-pulse border border-white/5" />
                    ))}
                </div>
            ) : teams.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-6 bg-slate-800/20 border border-dashed border-white/10 rounded-[3rem] text-center">
                    <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mb-6 text-slate-500">
                        <Rocket size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-3">Tudo pronto para começar?</h2>
                    <p className="text-slate-400 max-w-md mb-10 text-lg">
                        Crie seu primeiro ambiente de trabalho para começar a gerenciar suas atividades com agilidade.
                    </p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-3 bg-white text-slate-950 px-10 py-5 rounded-2xl font-black hover:bg-primary-400 hover:text-white transition-all shadow-2xl"
                    >
                        Criar Novo Ambiente
                        <ArrowRight size={20} />
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {teams.map(team => (
                        <Link
                            key={team.id}
                            to={`/teams/${team.id}`}
                            className="group relative bg-slate-800/40 border border-white/5 p-8 rounded-[2.5rem] hover:bg-slate-800/60 transition-all hover:border-primary-500/30 hover:-translate-y-2"
                        >
                            <div className="absolute top-8 right-8 w-3 h-3 rounded-full blur-[2px]" style={{ backgroundColor: team.color || '#3b82f6' }} />

                            <div className="flex justify-between items-start mb-6">
                                <div className="p-4 rounded-2xl bg-slate-700/30 group-hover:bg-primary-500/20 transition-all">
                                    <Users size={28} className="group-hover:text-primary-400 transition-colors" />
                                </div>
                                <span className={`text-[10px] font-black tracking-widest px-3 py-1 rounded-lg ${team.mode === 'KANBAN' ? 'bg-orange-500/10 text-orange-400' : 'bg-blue-500/10 text-blue-400'
                                    }`}>
                                    {team.mode}
                                </span>
                            </div>

                            <h2 className="text-2xl font-bold mb-2 group-hover:text-primary-400 transition-colors">{team.name}</h2>
                            <p className="text-slate-500 text-sm mb-8 line-clamp-2 font-medium leading-relaxed">
                                {team.description || 'Nenhuma descrição fornecida para este projeto.'}
                            </p>

                            <div className="flex items-center gap-6 pt-6 border-t border-white/5 text-xs font-bold text-slate-500 uppercase tracking-tight">
                                <div className="flex items-center gap-2 group-hover:text-slate-300">
                                    <Layout size={16} className="text-slate-600" />
                                    <span>Board Ativo</span>
                                </div>
                                <div className="flex items-center gap-2 group-hover:text-slate-300">
                                    <Target size={16} className="text-slate-600" />
                                    <span>{team.mode === 'KANBAN' ? 'Fluxo Contínuo' : 'Sprints'}</span>
                                </div>
                            </div>
                        </Link>
                    ))}

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex flex-col items-center justify-center gap-4 bg-slate-800/10 border-2 border-dashed border-white/5 p-8 rounded-[2.5rem] hover:border-primary-500/40 hover:bg-slate-800/30 transition-all text-slate-500 hover:text-primary-400 group"
                    >
                        <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Plus size={32} />
                        </div>
                        <span className="font-bold text-lg">Adicionar Ambiente</span>
                    </button>
                </div>
            )}

            {isModalOpen && (
                <TeamModal
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={handleCreateSuccess}
                />
            )}
        </div>
    );
};

export default DashboardPage;
