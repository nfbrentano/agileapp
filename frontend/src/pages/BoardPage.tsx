import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Plus, Layout as LayoutIcon, Users, BarChart2, Filter } from 'lucide-react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DroppableColumn from '../components/DroppableColumn';
import CardModal from '../components/CardModal';
import NotificationBadge from '../components/NotificationBadge';
import MetricsDashboard from '../components/MetricsDashboard';
import WebhookSettings from '../components/WebhookSettings';
import WorkloadView from '../components/WorkloadView';
import api from '../services/api';

interface Team {
    id: string;
    name: string;
    mode: 'KANBAN' | 'SCRUM';
    columns: any[];
    sprints: any[];
}

const BoardPage: React.FC = () => {
    const { teamId } = useParams();
    const navigate = useNavigate();
    const [team, setTeam] = useState<Team | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCard, setSelectedCard] = useState<any | null>(null);
    const [view, setView] = useState<'BOARD' | 'METRICS' | 'SETTINGS' | 'WORKLOAD'>('BOARD');
    const [showOnlyStagnated, setShowOnlyStagnated] = useState(false);

    const fetchBoard = useCallback(async () => {
        try {
            const response = await api.get(`/boards/${teamId}`);
            setTeam(response.data);
        } catch (error) {
            console.error('Erro ao buscar board', error);
        } finally {
            setIsLoading(false);
        }
    }, [teamId]);

    useEffect(() => {
        fetchBoard();
    }, [fetchBoard]);

    const handleMoveCard = async (cardId: string, toColumnId: string, ignoreWipLimit: boolean = false, ignoreBlockers: boolean = false, ignoreSubtasks: boolean = false) => {
        if (!team) return;
        try {
            await api.patch(`/cards/${cardId}/move`, { columnId: toColumnId, ignoreWipLimit, ignoreBlockers, ignoreSubtasks });
            fetchBoard();
        } catch (error: any) {
            if (error.response?.status === 409) {
                const { error: message, blockers, subtasks } = error.response.data;
                if (blockers && window.confirm(`${message}\n\nIgnorar bloqueio?`)) {
                    handleMoveCard(cardId, toColumnId, ignoreWipLimit, true, ignoreSubtasks);
                } else if (subtasks && window.confirm(`${message}\n\nIgnorar sub-tasks?`)) {
                    handleMoveCard(cardId, toColumnId, ignoreWipLimit, ignoreBlockers, true);
                } else if (window.confirm(`${message}\n\nIgnorar limite WIP?`)) {
                    handleMoveCard(cardId, toColumnId, true, ignoreBlockers, ignoreSubtasks);
                } else {
                    fetchBoard();
                }
            } else {
                fetchBoard();
            }
        }
    };

    if (isLoading) return <div className="h-screen bg-white animate-pulse" />;
    if (!team) return <div className="p-8 text-center text-slate-500 font-bold">Board não encontrado.</div>;

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="h-full flex flex-col space-y-8">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-[#0ea5e9] bg-sky-50 px-2 py-0.5 rounded-full uppercase tracking-widest">{team.mode} mode</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sprint Active</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">{team.name}</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex bg-white border border-slate-200 p-1 rounded-xl">
                            {[
                                { id: 'BOARD', icon: LayoutIcon, label: 'Board' },
                                { id: 'WORKLOAD', icon: Users, label: 'Workload' },
                                { id: 'METRICS', icon: BarChart2, label: 'Insights' }
                            ].map((v) => (
                                <button
                                    key={v.id}
                                    onClick={() => setView(v.id as any)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === v.id ? 'bg-[#f0f9ff] text-[#0ea5e9]' : 'text-slate-500 hover:text-slate-900'}`}
                                >
                                    <v.icon size={16} />
                                    {v.label}
                                </button>
                            ))}
                        </div>
                        <button className="px-5 py-2.5 bg-[#0ea5e9] text-white rounded-xl font-bold text-sm hover:bg-sky-600 transition-all shadow-lg shadow-sky-500/20 flex items-center gap-2">
                            <Plus size={18} />
                            Create Task
                        </button>
                    </div>
                </header>

                {/* Toolbar */}
                {view === 'BOARD' && (
                    <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm w-64 focus:ring-2 focus:ring-sky-500/20 outline-none" placeholder="Search tasks..." />
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-all">
                                <Filter size={16} /> Filter
                            </button>
                            <div className="h-6 w-[1px] bg-slate-100" />
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden"><img src={`https://i.pravatar.cc/150?u=${i}`} alt="User" /></div>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowOnlyStagnated(!showOnlyStagnated)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${showOnlyStagnated ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                            >
                                🐢 Stagnated
                            </button>
                            <NotificationBadge />
                        </div>
                    </div>
                )}

                <main className="flex-1 overflow-hidden">
                    {view === 'BOARD' ? (
                        <div className="h-[calc(100vh-280px)] overflow-x-auto pb-4 custom-scrollbar">
                            <div className="flex gap-6 h-full min-w-max">
                                {team.columns.map(column => (
                                    <DroppableColumn
                                        key={column.id}
                                        column={showOnlyStagnated ? { ...column, cards: column.cards.filter((c: any) => c.stagnated) } : column}
                                        onMoveCard={handleMoveCard}
                                        onCardClick={setSelectedCard}
                                        doneColumnId={team.columns[team.columns.length - 1].id}
                                        onEditWip={async () => {
                                            const newLimit = window.prompt(`WIP Limit for "${column.name}":`, column.wipLimit?.toString() || '');
                                            if (newLimit !== null) {
                                                try {
                                                    await api.patch(`/columns/${column.id}`, { wipLimit: newLimit === '' ? null : parseInt(newLimit) });
                                                    fetchBoard();
                                                } catch (err) {
                                                    alert('Error.');
                                                }
                                            }
                                        }}
                                    />
                                ))}

                                <button className="w-80 h-16 flex items-center justify-center gap-3 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all font-bold">
                                    <Plus size={24} />
                                    Add Column
                                </button>
                            </div>
                        </div>
                    ) : view === 'METRICS' ? (
                        <MetricsDashboard teamId={team.id} />
                    ) : view === 'WORKLOAD' ? (
                        <WorkloadView teamId={team.id} onMoveCard={handleMoveCard} onCardClick={setSelectedCard} />
                    ) : (
                        <WebhookSettings teamId={team.id} />
                    )}
                </main>

                {selectedCard && (
                    <CardModal
                        card={selectedCard}
                        onClose={() => setSelectedCard(null)}
                        onUpdate={() => fetchBoard()}
                    />
                )}
            </div>
        </DndProvider>
    );
};

export default BoardPage;
