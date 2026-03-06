import React, { useState, useEffect } from 'react';
import {
    Users, AlertCircle, User as UserIcon
} from 'lucide-react';
import api from '../services/api';
import DraggableCard from './DraggableCard';

interface MemberWorkload {
    memberId: string;
    userId: string | null;
    name: string;
    avatar: string | null;
    cards: any[];
    stats: {
        total: number;
        highPriority: number;
        overdue: number;
        isOverloaded: boolean;
    };
}

const WorkloadView: React.FC<{ teamId: string, onMoveCard: any, onCardClick: any }> = ({ teamId, onMoveCard, onCardClick }) => {
    const [workloadData, setWorkloadData] = useState<{ workloadLimit: number, members: MemberWorkload[] } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchWorkload();
    }, [teamId]);

    const fetchWorkload = async () => {
        try {
            const { data } = await api.get(`/teams/${teamId}/workload`);
            setWorkloadData(data);
        } catch (err) {
            console.error('Erro ao buscar workload');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className="p-8 animate-pulse text-slate-500">Calculando carga de trabalho...</div>;
    if (!workloadData) return <div className="p-8">Não foi possível carregar os dados.</div>;

    return (
        <div className="space-y-8 p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <Users className="text-primary-400" size={28} />
                        Workload Distribution
                    </h2>
                    <p className="text-slate-500 mt-1">Carga de trabalho ativa por membro do time (Limite: {workloadData.workloadLimit} cards).</p>
                </div>
            </div>

            <div className="grid gap-6">
                {workloadData.members.map((member) => (
                    <div
                        key={member.memberId}
                        className={`bg-slate-900/40 border rounded-3xl overflow-hidden transition-all duration-300 ${member.stats.isOverloaded ? 'border-red-500/30' : 'border-white/5'}`}
                    >
                        <div className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
                            {/* Member Profile & Stats */}
                            <div className="w-full md:w-64 flex flex-col gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-primary-400 border border-white/5">
                                        {member.userId ? <UserIcon size={24} /> : <Users size={24} className="text-slate-600" />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-200">{member.name}</h3>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                            {member.userId === 'unassigned' ? 'Aguardando dono' : 'Team Member'}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    <div className="bg-black/20 p-2 rounded-xl border border-white/5 text-center">
                                        <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase">Total</p>
                                        <p className={`text-lg font-black ${member.stats.isOverloaded ? 'text-red-400' : 'text-slate-200'}`}>
                                            {member.stats.total}
                                        </p>
                                    </div>
                                    <div className="bg-black/20 p-2 rounded-xl border border-white/5 text-center">
                                        <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase">Prio</p>
                                        <p className={`text-lg font-black ${member.stats.highPriority > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                                            {member.stats.highPriority}
                                        </p>
                                    </div>
                                    <div className="bg-black/20 p-2 rounded-xl border border-white/5 text-center">
                                        <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase">Atraso</p>
                                        <p className={`text-lg font-black ${member.stats.overdue > 0 ? 'text-red-500' : 'text-slate-400'}`}>
                                            {member.stats.overdue}
                                        </p>
                                    </div>
                                </div>

                                {member.stats.isOverloaded && (
                                    <div className="flex items-center gap-2 text-red-500 bg-red-500/10 px-3 py-2 rounded-xl border border-red-500/20">
                                        <AlertCircle size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Sobrecarga Detectada</span>
                                    </div>
                                )}
                            </div>

                            {/* Cards Swimlane */}
                            <div className="flex-1 min-h-[140px] bg-black/20 rounded-2xl p-4 border border-white/5 overflow-x-auto">
                                <div className="flex gap-4 h-full min-w-max">
                                    {member.cards.length === 0 ? (
                                        <div className="flex-1 flex items-center justify-center text-slate-600 italic text-sm px-8">
                                            Sem tarefas ativas no momento
                                        </div>
                                    ) : (
                                        member.cards.map((card: any) => (
                                            <div key={card.id} className="w-72 shrink-0">
                                                <DraggableCard
                                                    card={card}
                                                    onClick={() => onCardClick(card)}
                                                    doneColumnId={null as any}
                                                />
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WorkloadView;
