import React from 'react';
import { useDrag } from 'react-dnd';
import { MoreVertical, MessageSquare, CheckSquare, Lock, Repeat } from 'lucide-react';

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
    const progressText = subTasksCount > 0 ? `${completedSubTasks}/${subTasksCount}` : '';
    const progressPercentage = subTasksCount > 0 ? (completedSubTasks / subTasksCount) * 100 : 0;

    return (
        <div
            ref={drag as any}
            onClick={onClick}
            className={`bg-slate-800 hover:bg-slate-700 p-4 rounded-xl border border-white/5 shadow-lg cursor-pointer group transition-all ${isDragging ? 'opacity-40 grayscale scale-95' : 'hover:scale-[1.02]'
                }`}
        >
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    {isBlocked && <Lock size={12} className="text-red-500 animate-pulse" />}
                    {isStagnated && (
                        <div className="bg-amber-500/20 p-1 rounded-md text-amber-500 border border-amber-500/30 animate-pulse" title="Card estagnado: está nesta coluna há mais tempo que a média.">
                            <span role="img" aria-label="stagnated" className="text-[12px]">🐢</span>
                        </div>
                    )}
                    {card.recurrence && <Repeat size={12} className="text-primary-400" />}
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary-400">Task-{card.id.slice(0, 4)}</span>
                </div>
                <button className="text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical size={14} />
                </button>
            </div>

            <div className="flex items-center gap-2 mb-2">
                <h4 className="text-sm font-semibold leading-snug text-slate-100 flex-1">{card.title}</h4>
                {card.points > 0 && (
                    <div className="flex items-center justify-center bg-slate-900 border border-white/10 px-1.5 py-0.5 rounded text-[10px] font-black text-slate-400">
                        {card.points}
                    </div>
                )}
            </div>

            {subTasksCount > 0 && (
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[9px] font-bold text-slate-500 uppercase">Progresso</span>
                        <span className="text-[9px] font-bold text-primary-400">{progressText}</span>
                    </div>
                    <div className="h-1.5 bg-slate-900/50 rounded-full overflow-hidden border border-white/5">
                        <div
                            className="h-full bg-primary-500 transition-all duration-500 ease-out"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>
            )}

            {card.tags && card.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                    {card.tags.map((tag: string) => (
                        <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-primary-500/10 text-primary-400 font-bold border border-primary-500/10">
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/5">
                <div className="flex gap-3 text-slate-500">
                    <div className="flex items-center gap-1">
                        <MessageSquare size={12} />
                        <span className="text-[10px]">2</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <CheckSquare size={12} />
                        <span className="text-[10px]">3/5</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${card.priority === 'CRITICAL' ? 'bg-red-500/10 text-red-500' :
                        card.priority === 'HIGH' ? 'bg-orange-500/10 text-orange-500' :
                            'bg-slate-700/50 text-slate-400'
                        }`}>
                        {card.priority}
                    </div>
                    <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold border border-slate-600 text-slate-300">
                        {card.assigneeInitial || 'NB'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DraggableCard;
