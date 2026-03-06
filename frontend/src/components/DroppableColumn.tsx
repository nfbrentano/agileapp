import { Plus, Settings } from 'lucide-react';
import DraggableCard from './DraggableCard';
import { useDrop } from 'react-dnd';
import React from 'react';

interface ColumnProps {
    column: any;
    onMoveCard: (cardId: string, toColumnId: string, ignoreWipLimit?: boolean, ignoreBlockers?: boolean, ignoreSubtasks?: boolean) => void;
    onCardClick: (card: any) => void;
    onEditWip: () => void;
    doneColumnId: string;
}

const DroppableColumn: React.FC<ColumnProps> = ({ column, onMoveCard, onCardClick, onEditWip, doneColumnId }) => {
    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'CARD',
        drop: (item: { id: string }) => onMoveCard(item.id, column.id),
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }), [column.id, onMoveCard]);

    return (
        <div
            ref={drop as any}
            className={`w-80 flex flex-col bg-slate-900/40 rounded-2xl border transition-all ${isOver ? 'border-primary-500/50 bg-slate-800/40 ring-4 ring-primary-500/5' : 'border-white/5'
                } backdrop-blur-sm`}
        >
            <div className="p-4 flex justify-between items-center bg-white/5 rounded-t-2xl border-b border-white/5">
                <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]" />
                    <h3 className="font-bold text-slate-200 tracking-tight">{column.name}</h3>
                    <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/5">
                        {column.cards?.length || 0}
                    </span>
                    {column.cards?.some((c: any) => c.stagnated) && (
                        <div className="flex items-center gap-1 bg-amber-500/10 text-amber-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/20">
                            <span>🐢</span>
                            {column.cards?.filter((c: any) => c.stagnated).length}
                        </div>
                    )}
                </div>

                {column.wipLimit && (
                    <div className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${(column.cards?.length || 0) >= column.wipLimit ? 'bg-red-500/20 text-red-500 animate-pulse' :
                        (column.cards?.length || 0) >= column.wipLimit * 0.8 ? 'bg-amber-500/20 text-amber-500' :
                            'bg-white/5 text-slate-500'
                        }`}>
                        WIP: {column.cards?.length || 0}/{column.wipLimit}
                    </div>
                )}

                <div className="flex items-center gap-1">
                    <button
                        onClick={onEditWip}
                        className="p-1.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                        title="Configurar WIP Limit"
                    >
                        <Settings size={16} />
                    </button>
                    <button className="p-1.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                        <Plus size={18} />
                    </button>
                </div>
            </div>

            <div className="flex-1 p-3 overflow-y-auto space-y-4 min-h-[200px]">
                {column.cards?.map((card: any) => (
                    <DraggableCard
                        key={card.id}
                        card={card}
                        onClick={() => onCardClick(card)}
                        doneColumnId={doneColumnId}
                    />
                ))}

                {column.cards?.length === 0 && !isOver && (
                    <div className="h-32 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-white/5 rounded-xl">
                        <span className="text-xs font-medium">Sem cards aqui</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DroppableColumn;
