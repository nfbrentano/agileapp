import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
    Layout,
    Users,
    User,
    Bell,
    Settings,
    LogOut,
    Plus,
    ChevronRight,
    Hexagon
} from 'lucide-react';
import api from '../services/api';
import { authService } from '../services/authService';

interface Team {
    id: string;
    name: string;
    color: string;
}

const Sidebar: React.FC = () => {
    const [teams, setTeams] = useState<Team[]>([]);

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const response = await api.get('/teams');
                setTeams(response.data.slice(0, 5)); // Show top 5
            } catch (error) {
                console.error('Erro ao buscar times na sidebar', error);
            }
        };
        fetchTeams();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('agile_auth_token');
        window.location.href = '/login';
    };

    return (
        <aside className="w-72 h-screen bg-[#0f172a] border-r border-white/5 flex flex-col fixed left-0 top-0 z-50">
            <div className="p-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                    <Hexagon className="text-white fill-white/20" size={24} />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                    AgileApp
                </span>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto custom-scrollbar">
                <div className="space-y-1">
                    <span className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Geral</span>
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${isActive ? 'bg-primary-500/10 text-primary-400' : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`
                        }
                    >
                        <Layout size={20} />
                        <span className="font-medium">Dashboard</span>
                        <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </NavLink>
                    <NavLink
                        to="/notifications"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${isActive ? 'bg-primary-500/10 text-primary-400' : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`
                        }
                    >
                        <Bell size={20} />
                        <span className="font-medium">Notificações</span>
                    </NavLink>
                </div>

                <div className="space-y-1">
                    <div className="px-3 flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Seus Times</span>
                        <button className="text-primary-400 hover:text-primary-300">
                            <Plus size={14} />
                        </button>
                    </div>
                    {teams.map(team => (
                        <NavLink
                            key={team.id}
                            to={`/teams/${team.id}`}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${isActive ? 'bg-primary-500/10 text-primary-400' : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`
                            }
                        >
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: team.color || '#3b82f6' }} />
                            <span className="font-medium truncate">{team.name}</span>
                        </NavLink>
                    ))}
                    {teams.length === 0 && (
                        <p className="px-3 text-xs text-slate-600 italic">Nenhum time ainda.</p>
                    )}
                </div>

                <div className="space-y-1">
                    <span className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sua Conta</span>
                    <NavLink
                        to="/profile"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${isActive ? 'bg-primary-500/10 text-primary-400' : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`
                        }
                    >
                        <User size={20} />
                        <span className="font-medium">Meu Perfil</span>
                    </NavLink>
                    <NavLink
                        to="/settings"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${isActive ? 'bg-primary-500/10 text-primary-400' : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`
                        }
                    >
                        <Settings size={20} />
                        <span className="font-medium">Configurações</span>
                    </NavLink>
                </div>
            </nav>

            <div className="p-4 border-t border-white/5">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-400/5 transition-all font-medium"
                >
                    <LogOut size={20} />
                    Sair da Conta
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
