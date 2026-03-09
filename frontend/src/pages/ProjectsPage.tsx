import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Plus,
    Filter,
    Grid3X3,
    List,
    MoreVertical,
    CheckCircle2,
    Clock,
    ArrowRight,
    ChevronLeft,
    ChevronRight
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
    createdAt: string;
    members: { id: string; role: string }[];
    _count?: {
        cards: number;
        members: number;
    };
}

const ProjectsPage: React.FC = () => {
    const navigate = useNavigate();
    const [teams, setTeams] = useState<Team[]>([]);
    const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [methodologyFilter, setMethodologyFilter] = useState<'ALL' | 'SCRUM' | 'KANBAN'>('ALL');
    const [sortBy, setSortBy] = useState<'name' | 'date' | 'cards'>('date');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    useEffect(() => {
        fetchTeams();
    }, []);

    useEffect(() => {
        filterAndSortTeams();
    }, [teams, searchQuery, methodologyFilter, sortBy]);

    const fetchTeams = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/teams');
            setTeams(response.data);
        } catch (error) {
            console.error('Erro ao carregar times', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filterAndSortTeams = () => {
        let result = [...teams];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(team =>
                team.name.toLowerCase().includes(query) ||
                (team.description && team.description.toLowerCase().includes(query))
            );
        }

        // Methodology filter
        if (methodologyFilter !== 'ALL') {
            result = result.filter(team => team.methodology === methodologyFilter);
        }

        // Sorting
        result.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'date':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'cards':
                    return (b._count?.cards || 0) - (a._count?.cards || 0);
                default:
                    return 0;
            }
        });

        setFilteredTeams(result);
        setCurrentPage(1);
    };

    const totalPages = Math.ceil(filteredTeams.length / itemsPerPage);
    const paginatedTeams = filteredTeams.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const getMethodologyBadge = (methodology: string) => {
        const styles = {
            SCRUM: 'bg-amber-50 text-amber-600 border-amber-200',
            KANBAN: 'bg-blue-50 text-blue-600 border-blue-200'
        };
        return (
            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${styles[methodology as keyof typeof styles] || 'bg-slate-50 text-slate-600'}`}>
                {methodology}
            </span>
        );
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">All Projects</h1>
                    <p className="text-slate-500 font-medium mt-1">
                        {filteredTeams.length} project{filteredTeams.length !== 1 ? 's' : ''} found
                    </p>
                </div>
                <button
                    onClick={() => setIsTeamModalOpen(true)}
                    className="px-4 py-2.5 bg-[#0ea5e9] text-white rounded-xl font-bold text-sm hover:bg-sky-600 transition-all shadow-lg shadow-sky-500/20 flex items-center gap-2"
                >
                    <Plus size={18} />
                    New Project
                </button>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                {/* Search */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all outline-none text-sm"
                    />
                </div>

                {/* Methodology Filter */}
                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-slate-400" />
                    <select
                        value={methodologyFilter}
                        onChange={(e) => setMethodologyFilter(e.target.value as any)}
                        className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                    >
                        <option value="ALL">All Methodologies</option>
                        <option value="SCRUM">Scrum</option>
                        <option value="KANBAN">Kanban</option>
                    </select>
                </div>

                {/* Sort */}
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                >
                    <option value="date">Sort by Date</option>
                    <option value="name">Sort by Name</option>
                    <option value="cards">Sort by Cards</option>
                </select>

                {/* View Mode Toggle */}
                <div className="flex bg-slate-100 rounded-xl p-1">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-sky-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <Grid3X3 size={18} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-sky-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <List size={18} />
                    </button>
                </div>
            </div>

            {/* Projects Grid/List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filteredTeams.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm mb-4">
                        <Search size={32} className="text-slate-300" />
                    </div>
                    <h3 className="font-black text-slate-900 text-lg">No projects found</h3>
                    <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filters</p>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {paginatedTeams.map((team, index) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            key={team.id}
                            className="group bg-white border border-slate-100 rounded-2xl p-5 hover:border-sky-200 hover:shadow-lg transition-all cursor-pointer"
                            onClick={() => navigate(`/teams/${team.id}`)}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg"
                                    style={{ backgroundColor: team.color || '#0ea5e9' }}
                                >
                                    {team.name.charAt(0)}
                                </div>
                                <div className="flex items-center gap-2">
                                    {getMethodologyBadge(team.methodology)}
                                    <button
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-slate-300 hover:text-slate-600 p-1"
                                    >
                                        <MoreVertical size={18} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="font-bold text-slate-900 truncate group-hover:text-sky-600 transition-colors">
                                {team.name}
                            </h3>
                            <p className="text-slate-400 text-sm line-clamp-2 mt-1 min-h-[2.5rem]">
                                {team.description || 'No description provided.'}
                            </p>

                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                                <div className="flex items-center gap-3 text-xs text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <CheckCircle2 size={14} className="text-emerald-500" />
                                        {team._count?.cards || 0} cards
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock size={14} />
                                        {team.members?.length || 0} members
                                    </span>
                                </div>
                                <ArrowRight size={16} className="text-slate-300 group-hover:text-sky-500 transition-colors" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
                    {paginatedTeams.map((team, index) => (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            key={team.id}
                            className="flex items-center gap-4 p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer group"
                            onClick={() => navigate(`/teams/${team.id}`)}
                        >
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shadow-md shrink-0"
                                style={{ backgroundColor: team.color || '#0ea5e9' }}
                            >
                                {team.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-slate-900 truncate group-hover:text-sky-600 transition-colors">
                                    {team.name}
                                </h4>
                                <p className="text-slate-400 text-sm truncate">{team.description || 'No description'}</p>
                            </div>
                            <div className="hidden sm:block">
                                {getMethodologyBadge(team.methodology)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-400">
                                <span className="flex items-center gap-1">
                                    <CheckCircle2 size={14} className="text-emerald-500" />
                                    {team._count?.cards || 0}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock size={14} />
                                    {team.members?.length || 0}
                                </span>
                            </div>
                            <ArrowRight size={16} className="text-slate-300 group-hover:text-sky-500 transition-colors" />
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <span className="text-sm font-medium text-slate-600">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            )}

            <TeamModal
                isOpen={isTeamModalOpen}
                onClose={() => setIsTeamModalOpen(false)}
                onSuccess={fetchTeams}
            />
        </div>
    );
};

export default ProjectsPage;
