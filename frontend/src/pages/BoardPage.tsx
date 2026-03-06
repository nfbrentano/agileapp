import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, ChevronLeft, Layout as LayoutIcon, Users, BarChart2, Settings, CheckSquare } from 'lucide-react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DroppableColumn from '../components/DroppableColumn';
import CardModal from '../components/CardModal';
import NotificationBadge from '../components/NotificationBadge';
import MetricsDashboard from '../components/MetricsDashboard';
import WebhookSettings from '../components/WebhookSettings';
import WorkloadView from '../components/WorkloadView';
import { User } from 'lucide-react';
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

        // Optimistic update
        if (!ignoreWipLimit && !ignoreBlockers && !ignoreSubtasks) {
            const sourceColumn = team.columns.find(col => col.cards.some((c: any) => c.id === cardId));
            if (!sourceColumn || sourceColumn.id === toColumnId) return;

            const card = sourceColumn.cards.find((c: any) => c.id === cardId);

            const newColumns = team.columns.map(col => {
                if (col.id === sourceColumn.id) {
                    return { ...col, cards: col.cards.filter((c: any) => c.id !== cardId) };
                }
                if (col.id === toColumnId) {
                    return { ...col, cards: [...col.cards, { ...card, columnId: toColumnId }] };
                }
                return col;
            });

            setTeam({ ...team, columns: newColumns });
        }

        try {
            await api.patch(`/cards/${cardId}/move`, { columnId: toColumnId, ignoreWipLimit, ignoreBlockers, ignoreSubtasks });
            fetchBoard();
        } catch (error: any) {
            if (error.response?.status === 409) {
                const { error: message, blockers, subtasks } = error.response.data;

                if (blockers) {
                    const blockersList = blockers.map((b: any) => `- ${b.title}`).join('\n');
                    if (window.confirm(`${message}\n\nCards Bloqueadores:\n${blockersList}\n\nDeseja ignorar o bloqueio e mover mesmo assim?`)) {
                        handleMoveCard(cardId, toColumnId, ignoreWipLimit, true, ignoreSubtasks);
                    } else {
                        fetchBoard();
                    }
                } else if (subtasks) {
                    const subtasksList = subtasks.map((s: any) => `- ${s.title}`).join('\n');
                    if (window.confirm(`${message}\n\nSub-tasks Pendentes:\n${subtasksList}\n\nDeseja concluir o card pai mesmo assim?`)) {
                        handleMoveCard(cardId, toColumnId, ignoreWipLimit, ignoreBlockers, true);
                    } else {
                        fetchBoard();
                    }
                } else if (window.confirm(`${message}\n\nDeseja ignorar o limite (Admin)?`)) {
                    handleMoveCard(cardId, toColumnId, true, ignoreBlockers, ignoreSubtasks);
                } else {
                    fetchBoard();
                }
            } else {
                console.error('Erro ao mover card no servidor', error);
                fetchBoard();
            }
        }
    };

    if (isLoading) return <div className="h-screen bg-[#0f172a] animate-pulse" />;
    if (!team) return <div>Board não encontrado.</div>;

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="h-screen bg-[#0f172a] text-white flex flex-col">
                <header className="p-4 border-b border-white/5 flex justify-between items-center bg-[#1e293b]/50 backdrop-blur-md z-10">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="p-2 hover:bg-white/5 rounded-lg transition-colors group">
                            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{team.mode} MODE</span>
                            <h1 className="text-xl font-bold tracking-tight">{team.name}</h1>
                        </div>
                        <div className="h-8 w-[1px] bg-white/10 mx-2" />
                        <nav className="flex gap-1 text-sm font-medium">
                            <button
                                onClick={() => setView('BOARD')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${view === 'BOARD' ? 'text-primary-400 bg-primary-400/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <LayoutIcon size={16} /> Board
                            </button>
                            <button
                                onClick={() => setView('WORKLOAD' as any)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${view === ('WORKLOAD' as any) ? 'text-primary-400 bg-primary-400/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <Users size={16} /> Workload
                            </button>
                            <button
                                onClick={() => setView('METRICS')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${view === 'METRICS' ? 'text-primary-400 bg-primary-400/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <BarChart2 size={16} /> Métricas
                            </button>
                            <button
                                onClick={() => setView('SETTINGS')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${view === 'SETTINGS' ? 'text-primary-400 bg-primary-400/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <Settings size={16} /> Settings
                            </button>
                        </nav>
                    </div>

                    <div className="flex items-center gap-3">
                        {view === 'BOARD' && (
                            <div className="relative group">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Pesquisar cards..."
                                    className="bg-slate-900/50 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary-500/50 focus:bg-slate-900 transition-all w-64"
                                />
                            </div>
                        )}
                        {view === 'BOARD' && (
                            <button
                                onClick={() => setShowOnlyStagnated(!showOnlyStagnated)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${showOnlyStagnated ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-slate-800/50 border-white/5 text-slate-400 hover:text-white'}`}
                            >
                                <span className={showOnlyStagnated ? 'animate-bounce' : ''}>🐢</span>
                                Estagnados
                            </button>
                        )}
                        <button className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary-500/10 hover:shadow-primary-600/20 active:scale-95">
                            <Plus size={18} />
                            Criar Atividade
                        </button>
                        <div className="h-8 w-[1px] bg-white/10 mx-1" />
                        <NotificationBadge />
                        {team.mode === 'SCRUM' && team.sprints?.[0] && (
                            <button
                                onClick={async () => {
                                    if (window.confirm(`Deseja fechar a sprint "${team.sprints[0].name}"? \nIsso irá gerar o relatório e mover os cards pendentes para o backlog.`)) {
                                        try {
                                            const { data } = await api.post(`/sprints/${team.sprints[0].id}/close`);
                                            // Redirecionar para o relatório (precisamos do ID do relatório)
                                            // Como o backend retorna { message, sprint }, vamos buscar o relatório gerado
                                            const reportRes = await api.get(`/reports/team/${team.id}`);
                                            if (reportRes.data.length > 0) {
                                                navigate(`/reports/${reportRes.data[0].id}`);
                                            } else {
                                                fetchBoard();
                                            }
                                        } catch (err) {
                                            alert('Erro ao fechar sprint');
                                        }
                                    }
                                }}
                                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border border-white/5"
                            >
                                <CheckSquare size={18} className="text-green-500" />
                                Fechar Sprint
                            </button>
                        )}
                        <Link to="/profile" className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                            <User size={20} />
                        </Link>
                    </div>
                </header>

                <main className="flex-1 overflow-hidden flex flex-col">
                    {view === 'BOARD' ? (
                        <div className="flex-1 overflow-x-auto p-8 bg-[radial-gradient(#1e293b_1px,transparent_1.5px)] bg-[size:32px_32px]">
                            <div className="flex gap-8 h-full min-w-max">
                                {team.columns.map(column => (
                                    <DroppableColumn
                                        key={column.id}
                                        column={showOnlyStagnated ? { ...column, cards: column.cards.filter((c: any) => c.stagnated) } : column}
                                        onMoveCard={handleMoveCard}
                                        onCardClick={setSelectedCard}
                                        doneColumnId={team.columns[team.columns.length - 1].id}
                                        onEditWip={async () => {
                                            const newLimit = window.prompt(`Definir limite de WIP para "${column.name}":`, column.wipLimit?.toString() || '');
                                            if (newLimit !== null) {
                                                try {
                                                    await api.patch(`/columns/${column.id}`, { wipLimit: newLimit === '' ? null : parseInt(newLimit) });
                                                    fetchBoard();
                                                } catch (err) {
                                                    alert('Erro ao atualizar limite.');
                                                }
                                            }
                                        }}
                                    />
                                ))}

                                <button className="w-80 h-16 flex items-center justify-center gap-3 bg-slate-800/10 border-2 border-dashed border-white/10 rounded-2xl text-slate-500 hover:bg-slate-800/20 hover:text-white hover:border-white/20 transition-all font-semibold">
                                    <Plus size={24} />
                                    Adicionar Coluna
                                </button>
                            </div>
                        </div>
                    ) : view === 'METRICS' ? (
                        <MetricsDashboard teamId={team.id} />
                    ) : view === 'WORKLOAD' ? (
                        <WorkloadView
                            teamId={team.id}
                            onMoveCard={handleMoveCard}
                            onCardClick={setSelectedCard}
                        />
                    ) : (
                        <div className="flex-1 overflow-y-auto p-8 bg-[#0f172a]">
                            <div className="max-w-4xl mx-auto">
                                <WebhookSettings teamId={team.id} />
                            </div>
                        </div>
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
