import { Plus, MoreHorizontal, Settings2 } from 'lucide-react';
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
            className={`w-[340px] flex flex-col bg-slate-50/50 rounded-[32px] border transition-all duration-300 ${isOver ? 'border-[#0ea5e9] bg-[#f0f9ff]/50 ring-[12px] ring-sky-500/5' : 'border-slate-100'}`}
        >
            <div className="p-5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-6 bg-[#0ea5e9] rounded-full shadow-[0_0_12px_rgba(14,165,233,0.3)]" />
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <h3 className="font-black text-slate-900 tracking-tight text-sm uppercase">{column.name}</h3>
                            <span className="bg-slate-200 text-slate-600 text-[10px] font-black px-2 py-0.5 rounded-full">
                                {column.cards?.length || 0}
                            </span>
                        </div>
                        {column.wipLimit && (
                            <span className={`text-[10px] font-bold mt-0.5 ${(column.cards?.length || 0) >= column.wipLimit ? 'text-rose-500' : 'text-slate-400'}`}>
                                WIP Limit: {column.wipLimit}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button onClick={onEditWip} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100">
                        <Settings2 size={16} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100">
                        <Plus size={18} />
                    </button>
                </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4 min-h-[200px] custom-scrollbar">
                {column.cards?.map((card: any) => (
                    <DraggableCard
                        key={card.id}
                        card={card}
                        onClick={() => onCardClick(card)}
                        doneColumnId={doneColumnId}
                    />
                ))}

                {column.cards?.length === 0 && (
                    <div className="h-40 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 rounded-[24px] bg-white/30 backdrop-blur-sm">
                        <Plus size={24} className="mb-2 opacity-20" />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Drop items here</span>
                    </div>
                )}
            </div>

            <div className="p-4 pt-0">
                <button className="w-full py-3 bg-white/50 hover:bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-600 transition-all text-[11px] font-black uppercase tracking-widest shadow-sm">
                    Add New Card
                </button>
            </div>
        </div>
    );
};

export default DroppableColumn;
