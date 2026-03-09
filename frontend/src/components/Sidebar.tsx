import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Settings,
    ListTodo,
    PieChart,
    Zap,
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
    const user = authService.getUser() || { name: 'Alex Morgan', role: 'Product Manager' };

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const response = await api.get('/teams');
                setTeams(response.data.slice(0, 5));
            } catch (error) {
                console.error('Erro ao buscar times na sidebar', error);
            }
        };
        fetchTeams();
    }, []);

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Users, label: 'Projects', path: '/projects' },
        { icon: Users, label: 'Team', path: '/team' },
        { icon: Users, label: 'Profile', path: '/profile' },
    ];

    const workspaceItems = [
        { icon: ListTodo, label: 'Board', path: '/board' }, // This usually needs a teamId, but showing for layout
        { icon: Zap, label: 'Sprints', path: '/sprints' },
        { icon: PieChart, label: 'Reports', path: '/reports' },
        { icon: Zap, label: 'Automation', path: '/automation' },
    ];

    return (
        <aside className="w-64 h-screen bg-[#f8fafc] border-r border-slate-200 flex flex-col fixed left-0 top-0 z-50">
            {/* Logo */}
            <div className="p-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-[#0ea5e9] rounded-lg flex items-center justify-center shadow-lg shadow-sky-500/20">
                    <svg className="w-6 h-6 text-white fill-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M4 6.5C4 5.11929 5.11929 4 6.5 4H17.5C18.8807 4 20 5.11929 20 6.5V17.5C20 18.8807 18.8807 20 17.5 20H6.5C5.11929 20 4 18.8807 4 17.5V6.5Z" />
                        <rect x="7" y="7" width="4" height="4" rx="1" fill="#0ea5e9" stroke="white" strokeWidth="1" />
                        <rect x="13" y="13" width="4" height="4" rx="1" fill="#0ea5e9" stroke="white" strokeWidth="1" />
                    </svg>
                </div>
                <span className="text-xl font-bold text-slate-900 tracking-tight">AgileApp</span>
            </div>

            <div className="flex-1 px-4 py-4 space-y-8 overflow-y-auto custom-scrollbar">
                {/* Main Nav */}
                <nav className="space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.label}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${isActive
                                    ? 'bg-[#e0f2fe] text-[#0ea5e9]'
                                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                                }`
                            }
                        >
                            <item.icon size={20} className="text-slate-400 group-hover:text-slate-600" />
                            <span className="font-semibold text-sm">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Workspace Section */}
                <div className="space-y-1">
                    <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Workspace</span>
                    {workspaceItems.map((item) => (
                        <NavLink
                            key={item.label}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${isActive
                                    ? 'bg-[#e0f2fe] text-[#0ea5e9]'
                                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                                }`
                            }
                        >
                            <item.icon size={20} className="text-slate-400 group-hover:text-slate-600" />
                            <span className="font-semibold text-sm">{item.label}</span>
                        </NavLink>
                    ))}
                </div>

                {/* Bottom Links */}
                <div className="space-y-1">
                    <NavLink
                        to="/settings"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${isActive
                                ? 'bg-[#e0f2fe] text-[#0ea5e9]'
                                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                            }`
                        }
                    >
                        <Settings size={20} className="text-slate-400 group-hover:text-slate-600" />
                        <span className="font-semibold text-sm">Settings</span>
                    </NavLink>
                </div>
            </div>

            {/* User Profile Footer */}
            <div className="p-4 border-t border-slate-100 bg-white">
                <div className="flex items-center gap-3 p-2">
                    <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                        <img src={`https://ui-avatars.com/api/?name=${user.name || 'User'}&background=random`} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{user.name || 'Alex Morgan'}</p>
                        <p className="text-[10px] font-medium text-slate-400 truncate">{user.role || 'Pro Plan'}</p>
                    </div>
                    <button className="text-slate-400 hover:text-slate-600">
                        <Settings size={18} />
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
