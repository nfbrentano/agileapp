import React from 'react';
import { useDrag } from 'react-dnd';
import { MoreHorizontal, MessageSquare, CheckSquare, Lock, Repeat, Calendar } from 'lucide-react';

interface CardProps {
    card: any;
    onClick: () => void;
    doneColumnId: string;
}

const DraggableCard: React.FC<CardProps> = ({ card, onClick, doneColumnId }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'CARD',
        item: { id: card.id, columnId: card.columnId },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

    const isBlocked = card.blockedBy && card.blockedBy.length > 0;
    const isStagnated = card.stagnated;

    // Progress calculation for sub-tasks
    const subTasksCount = card.subTasks?.length || 0;
    const completedSubTasks = card.subTasks?.filter((st: any) => st.columnId === doneColumnId).length || 0;
    const progressPercentage = subTasksCount > 0 ? (completedSubTasks / subTasksCount) * 100 : 0;

    return (
        <div
            ref={drag as any}
            onClick={onClick}
            className={`group relative bg-white border border-slate-100 p-5 rounded-[24px] shadow-sm hover:shadow-xl hover:shadow-sky-500/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer ${isDragging ? 'opacity-20 grayscale border-dashed border-sky-300' : ''
                }`}
        >
            {/* Stagnated/Blocked Indicator Bubble */}
            {(isBlocked || isStagnated) && (
                <div className="absolute -top-2 -left-2 flex gap-1 z-10">
                    {isBlocked && (
                        <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20 animate-pulse border-2 border-white">
                            <Lock size={12} strokeWidth={3} />
                        </div>
                    )}
                    {isStagnated && (
                        <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-white shadow-lg shadow-amber-400/20 border-2 border-white" title="Stagnated Task">
                            <span className="text-xs">🐢</span>
                        </div>
                    )}
                </div>
            )}

            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                    <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${card.priority === 'CRITICAL' ? 'bg-rose-50 text-rose-600' :
                            card.priority === 'HIGH' ? 'bg-amber-50 text-amber-600' :
                                'bg-slate-50 text-slate-500'
                        }`}>
                        {card.priority}
                    </div>
                    <span className="text-[10px] font-black text-slate-300 tracking-widest">#{card.id.slice(0, 4)}</span>
                </div>
                <button className="text-slate-300 hover:text-slate-900 transition-colors">
                    <MoreHorizontal size={16} />
                </button>
            </div>

            <h4 className="text-[15px] font-black text-slate-900 leading-tight mb-4 group-hover:text-[#0ea5e9] transition-colors">
                {card.title}
            </h4>

            {subTasksCount > 0 && (
                <div className="mb-4">
                    <div className="h-1 bg-slate-50 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-1000 ${progressPercentage === 100 ? 'bg-emerald-500' : 'bg-[#0ea5e9]'}`}
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>
            )}

            <div className="flex flex-wrap gap-1.5 mb-5">
                {card.tags?.map((tag: string) => (
                    <span key={tag} className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-sky-50 text-sky-600 border border-sky-100/50">
                        {tag}
                    </span>
                ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex items-center gap-4 text-slate-400">
                    <div className="flex items-center gap-1.5 hover:text-[#0ea5e9] transition-colors">
                        <MessageSquare size={13} strokeWidth={2.5} />
                        <span className="text-[11px] font-black uppercase tracking-tight">2</span>
                    </div>
                    {subTasksCount > 0 && (
                        <div className="flex items-center gap-1.5 hover:text-emerald-500 transition-colors">
                            <CheckSquare size={13} strokeWidth={2.5} />
                            <span className="text-[11px] font-black uppercase tracking-tight">{completedSubTasks}/{subTasksCount}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-[10px] bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-[10px] font-black text-slate-600 hover:scale-110 transition-transform">
                        {card.assigneeInitial || 'NB'}
                    </div>
                </div>
            </div>

            {/* Premium hover effect gradient */}
            <div className="absolute inset-0 rounded-[24px] bg-gradient-to-br from-sky-500/5 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500" />
        </div>
    );
};

export default DraggableCard;
