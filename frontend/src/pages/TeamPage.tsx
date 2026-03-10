import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Users,
    Settings,
    Layout,
    BarChart3,
    Edit3,
    Save,
    X,
    Plus,
    Trash2,
    Crown,
    User,
    Mail,
    Palette,
    FileText,
    Layers,
    Zap,
    TrendingUp,
    Clock,
    CheckCircle2,
    AlertCircle,
    MoreVertical,
    Copy,
    Check
} from 'lucide-react';
import api from '../services/api';
import { motion } from 'framer-motion';

type Tab = 'OVERVIEW' | 'MEMBERS' | 'SETTINGS' | 'ANALYTICS';

interface Member {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    role: 'ADMIN' | 'MEMBER';
    joinedAt: string;
}

interface Sprint {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: 'PLANNING' | 'ACTIVE' | 'COMPLETED';
    velocity: number;
    completedPoints: number;
    totalPoints: number;
}

interface TeamStats {
    totalCards: number;
    completedCards: number;
    activeSprints: number;
    velocity: number;
    avgCycleTime: number;
}

const TeamPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<Tab>('OVERVIEW');
    const [team, setTeam] = useState<any>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [sprints, setSprints] = useState<Sprint[]>([]);
    const [stats, setStats] = useState<TeamStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    
    // Edit mode state
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        name: '',
        description: '',
        color: '#0ea5e9',
        methodology: 'SCRUM' as 'SCRUM' | 'KANBAN'
    });

    // Invite member state
    const [inviteEmail, setInviteEmail] = useState('');
    const [isInviting, setIsInviting] = useState(false);

    useEffect(() => {
        if (id) {
            fetchTeamData();
        }
    }, [id]);

    const fetchTeamData = async () => {
        setIsLoading(true);
        try {
            const [teamRes, membersRes, sprintsRes, statsRes] = await Promise.all([
                api.get(`/teams/${id}`),
                api.get(`/teams/${id}/members`),
                api.get(`/teams/${id}/sprints`),
                api.get(`/teams/${id}/stats`)
            ]);

            setTeam(teamRes.data);
            setMembers(membersRes.data);
            setSprints(sprintsRes.data);
            setStats(statsRes.data);
            
            setEditData({
                name: teamRes.data.name,
                description: teamRes.data.description || '',
                color: teamRes.data.color || '#0ea5e9',
                methodology: teamRes.data.methodology || 'SCRUM'
            });
        } catch (err) {
            setError('Failed to load team data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        setIsSaving(true);
        try {
            await api.patch(`/teams/${id}`, editData);
            setTeam({ ...team, ...editData });
            setIsEditing(false);
        } catch (err) {
            setError('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    const handleInviteMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail.trim()) return;
        
        setIsInviting(true);
        try {
            await api.post(`/teams/${id}/members`, { email: inviteEmail });
            setInviteEmail('');
            fetchTeamData();
        } catch (err) {
            setError('Failed to invite member');
        } finally {
            setIsInviting(false);
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        if (!confirm('Are you sure you want to remove this member?')) return;
        
        try {
            await api.delete(`/teams/${id}/members/${memberId}`);
            fetchTeamData();
        } catch (err) {
            setError('Failed to remove member');
        }
    };

    const handleDeleteTeam = async () => {
        if (!confirm('Are you sure you want to delete this team? This action cannot be undone.')) return;
        
        try {
            await api.delete(`/teams/${id}`);
            navigate('/dashboard');
        } catch (err) {
            setError('Failed to delete team');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-pulse text-slate-400">Loading...</div>
            </div>
        );
    }

    if (!team) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-red-500">Team not found</div>
            </div>
        );
    }

    const tabs = [
        { id: 'OVERVIEW' as Tab, label: 'Overview', icon: Layout },
        { id: 'MEMBERS' as Tab, label: 'Members', icon: Users },
        { id: 'ANALYTICS' as Tab, label: 'Analytics', icon: BarChart3 },
        { id: 'SETTINGS' as Tab, label: 'Settings', icon: Settings }
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/dashboard"
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={20} className="text-slate-500" />
                        </Link>
                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: team.color }}
                                >
                                    <Layers size={20} className="text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-black text-slate-900">{team.name}</h1>
                                    <p className="text-sm text-slate-500">{team.methodology} • {members.length} members</p>
                                </div>
                            </div>
                        </div>
                        <Link
                            to={`/board/${id}`}
                            className="px-4 py-2 bg-[#0ea5e9] text-white rounded-xl font-bold text-sm hover:bg-sky-600 transition-all flex items-center gap-2"
                        >
                            <Layout size={18} />
                            Open Board
                        </Link>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex gap-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 font-bold text-sm transition-all border-b-2 ${
                                    activeTab === tab.id
                                        ? 'border-[#0ea5e9] text-[#0ea5e9]'
                                        : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center gap-2">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                {/* OVERVIEW Tab */}
                {activeTab === 'OVERVIEW' && (
                    <div className="space-y-6">
                        {/* Stats Cards */}
                        {stats && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-blue-50 rounded-lg">
                                            <Layers size={20} className="text-blue-500" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-500">Total Cards</span>
                                    </div>
                                    <p className="text-3xl font-black text-slate-900">{stats.totalCards}</p>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-green-50 rounded-lg">
                                            <CheckCircle2 size={20} className="text-green-500" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-500">Completed</span>
                                    </div>
                                    <p className="text-3xl font-black text-slate-900">{stats.completedCards}</p>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-amber-50 rounded-lg">
                                            <Zap size={20} className="text-amber-500" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-500">Active Sprints</span>
                                    </div>
                                    <p className="text-3xl font-black text-slate-900">{stats.activeSprints}</p>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-purple-50 rounded-lg">
                                            <TrendingUp size={20} className="text-purple-500" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-500">Velocity</span>
                                    </div>
                                    <p className="text-3xl font-black text-slate-900">{stats.velocity}</p>
                                </motion.div>
                            </div>
                        )}

                        {/* Recent Sprints */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-slate-900">Recent Sprints</h2>
                                <Link
                                    to={`/board/${id}?view=sprints`}
                                    className="text-sm font-medium text-[#0ea5e9] hover:text-sky-600"
                                >
                                    View all
                                </Link>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {sprints.slice(0, 5).map((sprint) => (
                                    <div key={sprint.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${
                                                sprint.status === 'ACTIVE' ? 'bg-green-500' :
                                                sprint.status === 'COMPLETED' ? 'bg-blue-500' : 'bg-amber-500'
                                            }`} />
                                            <div>
                                                <p className="font-bold text-slate-900">{sprint.name}</p>
                                                <p className="text-sm text-slate-500">
                                                    {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-slate-900">{sprint.completedPoints}/{sprint.totalPoints} pts</p>
                                            <p className="text-sm text-slate-500">{Math.round((sprint.completedPoints / sprint.totalPoints) * 100) || 0}% complete</p>
                                        </div>
                                    </div>
                                ))}
                                {sprints.length === 0 && (
                                    <div className="p-8 text-center text-slate-400">
                                        No sprints yet
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Team Info */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">About</h2>
                            <p className="text-slate-600 leading-relaxed">{team.description || 'No description provided.'}</p>
                            <div className="mt-4 flex gap-4 text-sm">
                                <span className="text-slate-500">Methodology: <span className="font-medium text-slate-900">{team.methodology}</span></span>
                                <span className="text-slate-500">Created: <span className="font-medium text-slate-900">{new Date(team.createdAt).toLocaleDateString()}</span></span>
                            </div>
                        </div>
                    </div>
                )}

                {/* MEMBERS Tab */}
                {activeTab === 'MEMBERS' && (
                    <div className="space-y-6">
                        {/* Invite Form */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">Invite Member</h2>
                            <form onSubmit={handleInviteMember} className="flex gap-3">
                                <div className="flex-1 relative">
                                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="email"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        placeholder="Enter email address..."
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isInviting || !inviteEmail.trim()}
                                    className="px-6 py-3 bg-[#0ea5e9] text-white rounded-xl font-bold text-sm hover:bg-sky-600 transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isInviting ? 'Inviting...' : <><Plus size={18} /> Invite</>}
                                </button>
                            </form>
                        </div>

                        {/* Members List */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100">
                                <h2 className="text-lg font-bold text-slate-900">Team Members ({members.length})</h2>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {members.map((member) => (
                                    <div key={member.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white font-bold">
                                                {member.avatar ? (
                                                    <img src={member.avatar} alt={member.name} className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    member.name.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 flex items-center gap-2">
                                                    {member.name}
                                                    {member.role === 'ADMIN' && (
                                                        <Crown size={14} className="text-amber-500" />
                                                    )}
                                                </p>
                                                <p className="text-sm text-slate-500">{member.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                member.role === 'ADMIN' 
                                                    ? 'bg-amber-100 text-amber-700' 
                                                    : 'bg-slate-100 text-slate-600'
                                            }`}>
                                                {member.role}
                                            </span>
                                            <button
                                                onClick={() => handleRemoveMember(member.id)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                title="Remove member"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {members.length === 0 && (
                                    <div className="p-8 text-center text-slate-400">
                                        No members yet
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ANALYTICS Tab */}
                {activeTab === 'ANALYTICS' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
                            <BarChart3 size={48} className="mx-auto text-slate-300 mb-4" />
                            <h2 className="text-xl font-bold text-slate-900 mb-2">Analytics Coming Soon</h2>
                            <p className="text-slate-500">Detailed team analytics and reports will be available here.</p>
                        </div>
                    </div>
                )}

                {/* SETTINGS Tab */}
                {activeTab === 'SETTINGS' && (
                    <div className="space-y-6">
                        {/* General Settings */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-slate-900">General Settings</h2>
                                {!isEditing ? (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium text-sm hover:bg-slate-200 transition-all"
                                    >
                                        <Edit3 size={16} />
                                        Edit
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium text-sm hover:bg-slate-200 transition-all"
                                        >
                                            <X size={16} />
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveSettings}
                                            disabled={isSaving}
                                            className="flex items-center gap-2 px-4 py-2 bg-[#0ea5e9] text-white rounded-lg font-medium text-sm hover:bg-sky-600 transition-all disabled:opacity-50"
                                        >
                                            <Save size={16} />
                                            {isSaving ? 'Saving...' : 'Save'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Team Name</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editData.name}
                                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                                        />
                                    ) : (
                                        <p className="text-slate-900 font-medium">{team.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                                    {isEditing ? (
                                        <textarea
                                            value={editData.description}
                                            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                            rows={3}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none resize-none"
                                        />
                                    ) : (
                                        <p className="text-slate-600">{team.description || 'No description'}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Color</label>
                                        {isEditing ? (
                                            <div className="flex gap-2">
                                                {['#0ea5e9', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899'].map((color) => (
                                                    <button
                                                        key={color}
                                                        type="button"
                                                        onClick={() => setEditData({ ...editData, color })}
                                                        className={`w-8 h-8 rounded-lg transition-all ${editData.color === color ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`}
                                                        style={{ backgroundColor: color }}
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-6 h-6 rounded-lg"
                                                    style={{ backgroundColor: team.color }}
                                                />
                                                <span className="text-slate-600 text-sm">{team.color}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Methodology</label>
                                        {isEditing ? (
                                            <select
                                                value={editData.methodology}
                                                onChange={(e) => setEditData({ ...editData, methodology: e.target.value as 'SCRUM' | 'KANBAN' })}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                                            >
                                                <option value="SCRUM">Scrum</option>
                                                <option value="KANBAN">Kanban</option>
                                            </select>
                                        ) : (
                                            <p className="text-slate-900 font-medium">{team.methodology}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6">
                            <h2 className="text-lg font-bold text-red-600 mb-4">Danger Zone</h2>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-slate-900">Delete Team</p>
                                    <p className="text-sm text-slate-500">Once deleted, this team cannot be recovered. All data will be permanently removed.</p>
                                </div>
                                <button
                                    onClick={handleDeleteTeam}
                                    className="px-4 py-2 bg-red-100 text-red-600 rounded-lg font-bold text-sm hover:bg-red-200 transition-all flex items-center gap-2"
                                >
                                    <Trash2 size={16} />
                                    Delete Team
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeamPage;
