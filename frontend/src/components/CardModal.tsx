import {
    X, Clock, Tag, Link as LinkIcon, AlertCircle, CheckCircle2,
    List, Trash2, Plus, Lock, Layout as LayoutIcon, Repeat, BarChart2,
    Edit3, Save
} from 'lucide-react';
import { attachmentService, type Attachment } from '../services/attachmentService';
import { dependencyService, type CardDependency } from '../services/dependencyService';
import FileUploader from './FileUploader';
import React, { useState } from 'react';
import api from '../services/api';

interface CardModalProps {
    card: any;
    onClose: () => void;
    onUpdate: (updatedCard?: any) => void;
}

const CardModal: React.FC<CardModalProps> = ({ card, onClose, onUpdate }) => {
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [dependencies, setDependencies] = useState<{ blockedBy: CardDependency[], blocking: CardDependency[] }>({ blockedBy: [], blocking: [] });
    
    // Edit mode state
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editData, setEditData] = useState({
        title: card.title || '',
        details: card.details || '',
        requirements: card.requirements || '',
        outOfScope: card.outOfScope || '',
        priority: card.priority || 'MEDIUM',
        tags: card.tags?.join(', ') || '',
        dueDate: card.dueDate ? new Date(card.dueDate).toISOString().split('T')[0] : '',
        url: card.url || ''
    });

    React.useEffect(() => {
        fetchAttachments();
        fetchDependencies();
    }, [card.id]);

    const fetchDependencies = async () => {
        try {
            const data = await dependencyService.getDependencies(card.id);
            setDependencies(data);
        } catch (err) {
            console.error('Erro ao buscar dependências');
        }
    };

    const fetchAttachments = async () => {
        try {
            const data = await attachmentService.getAttachments(card.id);
            setAttachments(data);
        } catch (err) {
            console.error('Erro ao buscar anexos');
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const tagArray = editData.tags.split(',').map(t => t.trim()).filter(t => t);
            await api.patch(`/cards/${card.id}`, {
                title: editData.title,
                details: editData.details,
                requirements: editData.requirements,
                outOfScope: editData.outOfScope,
                priority: editData.priority,
                tags: tagArray,
                dueDate: editData.dueDate || null,
                url: editData.url
            });
            onUpdate();
            setIsEditing(false);
        } catch (err) {
            alert('Erro ao salvar alterações');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setEditData({
            title: card.title || '',
            details: card.details || '',
            requirements: card.requirements || '',
            outOfScope: card.outOfScope || '',
            priority: card.priority || 'MEDIUM',
            tags: card.tags?.join(', ') || '',
            dueDate: card.dueDate ? new Date(card.dueDate).toISOString().split('T')[0] : '',
            url: card.url || ''
        });
        setIsEditing(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#1e293b] w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex justify-between items-start bg-slate-800/50">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs font-bold text-primary-400 uppercase tracking-widest">Atividade #{card.id.slice(0, 6)}</span>
                            {isEditing ? (
                                <select
                                    value={editData.priority}
                                    onChange={(e) => setEditData({...editData, priority: e.target.value})}
                                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-white border border-white/10 outline-none"
                                >
                                    <option value="LOW">LOW</option>
                                    <option value="MEDIUM">MEDIUM</option>
                                    <option value="HIGH">HIGH</option>
                                    <option value="CRITICAL">CRITICAL</option>
                                </select>
                            ) : (
                                <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${card.priority === 'CRITICAL' ? 'bg-red-500/10 text-red-500' : 'bg-slate-700/50 text-slate-400'
                                    }`}>
                                    {card.priority}
                                </div>
                            )}
                        </div>
                        {isEditing ? (
                            <input
                                type="text"
                                value={editData.title}
                                onChange={(e) => setEditData({...editData, title: e.target.value})}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-xl font-bold text-white leading-tight outline-none focus:border-primary-500"
                                placeholder="Task title..."
                            />
                        ) : (
                            <h2 className="text-2xl font-bold text-white leading-tight">{card.title}</h2>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="p-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-full transition-colors"
                                    title="Save"
                                >
                                    <Save size={20} />
                                </button>
                                <button
                                    onClick={handleCancel}
                                    disabled={isSaving}
                                    className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-full transition-colors"
                                    title="Cancel"
                                >
                                    <X size={20} />
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-2 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white rounded-full transition-colors"
                                title="Edit"
                            >
                                <Edit3 size={20} />
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                            <X size={24} className="text-slate-400" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Main Content */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                        <section>
                            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">
                                <List size={16} /> Detalhes da Atividade
                            </h3>
                            {isEditing ? (
                                <textarea
                                    value={editData.details}
                                    onChange={(e) => setEditData({...editData, details: e.target.value})}
                                    placeholder="Add task description..."
                                    rows={5}
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-4 py-3 text-slate-300 text-sm leading-relaxed outline-none focus:border-primary-500 resize-none"
                                />
                            ) : (
                                <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                                    {card.details || 'Nenhuma descrição detalhada fornecida.'}
                                </div>
                            )}
                        </section>

                        <div className="grid grid-cols-2 gap-8">
                            <section>
                                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">
                                    <CheckCircle2 size={16} /> Requisitos
                                </h3>
                                {isEditing ? (
                                    <textarea
                                        value={editData.requirements}
                                        onChange={(e) => setEditData({...editData, requirements: e.target.value})}
                                        placeholder="Add requirements (one per line)..."
                                        rows={5}
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-4 py-3 text-slate-300 text-sm leading-relaxed outline-none focus:border-primary-500 resize-none"
                                    />
                                ) : (
                                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 text-slate-300 text-sm">
                                        <ul className="list-disc list-inside space-y-2">
                                            {card.requirements ? card.requirements.split('\n').map((line: string, i: number) => (
                                                <li key={i}>{line}</li>
                                            )) : <li>Nenhum requisito listado.</li>}
                                        </ul>
                                    </div>
                                )}
                            </section>

                            <section>
                                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">
                                    <AlertCircle size={16} /> O que NÃO inclui
                                </h3>
                                {isEditing ? (
                                    <textarea
                                        value={editData.outOfScope}
                                        onChange={(e) => setEditData({...editData, outOfScope: e.target.value})}
                                        placeholder="Define what is out of scope..."
                                        rows={5}
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-4 py-3 text-slate-300 text-sm leading-relaxed outline-none focus:border-primary-500 resize-none"
                                    />
                                ) : (
                                    <div className="bg-red-500/5 p-6 rounded-2xl border border-red-500/10 text-slate-300 text-sm italic">
                                        {card.outOfScope || 'Não definido.'}
                                    </div>
                                )}
                            </section>
                        </div>

                        <section>
                            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">
                                <Tag size={16} /> Critérios de Aceitação
                            </h3>
                            <div className="space-y-3 mb-8">
                                {card.checklists?.map((item: any) => (
                                    <div key={item.id} className="flex items-center gap-3 bg-slate-800/30 p-4 rounded-xl border border-white/5 group">
                                        <input type="checkbox" checked={item.done} className="w-5 h-5 rounded border-white/10 bg-slate-700 text-primary-500 focus:ring-primary-500/20 transition-all" />
                                        <span className={`text-sm ${item.done ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{item.label}</span>
                                    </div>
                                ))}
                                <button className="flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors text-sm font-bold px-4 py-2">
                                    <Plus size={16} /> Adicionar Critério
                                </button>
                            </div>
                        </section>

                        <section>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-wider">
                                    <List size={16} /> Sub-tasks
                                </h3>
                                <button
                                    onClick={async () => {
                                        const title = window.prompt('Título da sub-task:');
                                        if (title) {
                                            try {
                                                await api.post('/cards', {
                                                    title,
                                                    teamId: card.teamId,
                                                    columnId: card.columnId, // Same column as parent initially
                                                    parentId: card.id
                                                });
                                                onUpdate(card); // Refresh parent
                                            } catch (err) {
                                                alert('Erro ao criar sub-task');
                                            }
                                        }
                                    }}
                                    className="flex items-center gap-1.5 text-xs font-bold text-primary-400 hover:text-primary-300 transition-colors"
                                >
                                    <Plus size={14} /> Add sub-task
                                </button>
                            </div>
                            <div className="space-y-2">
                                {card.subTasks?.map((st: any) => (
                                    <div key={st.id} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl border border-white/5 group hover:border-white/10 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${st.done ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-slate-600'}`} />
                                            <span className={`text-sm ${st.done ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{st.title}</span>
                                        </div>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-colors">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {(!card.subTasks || card.subTasks.length === 0) && (
                                    <div className="p-6 text-center border-2 border-dashed border-white/5 rounded-2xl text-slate-600 text-xs italic">
                                        Nenhuma sub-task cadastrada.
                                    </div>
                                )}
                            </div>
                        </section>

                        <section>
                            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-300 mb-6">
                                <BarChart2 size={16} className="text-emerald-400" />
                                Histórico de Movimentação
                            </h3>
                            <div className="space-y-4">
                                {card.columnHistory?.map((entry: any, idx: number) => {
                                    const entered = new Date(entry.enteredAt);
                                    const left = entry.leftAt ? new Date(entry.leftAt) : new Date();
                                    const durationMs = left.getTime() - entered.getTime();
                                    const days = Math.floor(durationMs / (1000 * 60 * 60 * 24));
                                    const hours = Math.floor((durationMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

                                    return (
                                        <div key={entry.id} className="relative pl-8 pb-4 last:pb-0 group">
                                            {idx < (card.columnHistory.length - 1) && (
                                                <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-slate-800 group-hover:bg-primary-500/30 transition-colors" />
                                            )}
                                            <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 transition-all ${entry.leftAt ? 'bg-slate-900 border-slate-700' : 'bg-primary-500/20 border-primary-500 shadow-[0_0_15px_rgba(59,130,246,0.3)] animate-pulse'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${entry.leftAt ? 'bg-slate-500' : 'bg-primary-500'}`} />
                                            </div>
                                            <div className="flex flex-col">
                                                <div className="flex items-center justify-between">
                                                    <span className={`text-xs font-bold ${entry.leftAt ? 'text-slate-400' : 'text-primary-400'}`}>
                                                        {entry.column?.name || 'Coluna Desconhecida'}
                                                    </span>
                                                    <span className="text-[10px] font-medium text-slate-500">
                                                        {entered.toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-slate-600 mt-1">
                                                    {entry.leftAt ? `Permaneceu por ${days}d ${hours}h` : 'Ativo nesta coluna'}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                                {(!card.columnHistory || card.columnHistory.length === 0) && (
                                    <div className="p-4 text-center text-xs text-slate-600 italic">
                                        Nenhum histórico registrado.
                                    </div>
                                )}
                            </div>
                        </section>

                        <section>
                            <FileUploader
                                cardId={card.id}
                                attachments={attachments}
                                onUpdate={fetchAttachments}
                            />
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="w-80 bg-slate-800/30 border-l border-white/5 p-6 space-y-8">
                        <div className="space-y-6">
                            {card.parent && (
                                <div>
                                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Card Pai</span>
                                    <div className="flex items-center gap-3 p-3 bg-primary-500/5 rounded-xl border border-primary-500/10 text-primary-400">
                                        <LayoutIcon size={14} />
                                        <span className="text-xs font-semibold truncate">{card.parent.title}</span>
                                    </div>
                                </div>
                            )}

                            <div>
                                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Responsável</span>
                                <div className="flex items-center gap-3 p-3 bg-slate-900/40 rounded-xl border border-white/5">
                                    <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center font-bold text-xs shadow-lg">NB</div>
                                    <span className="text-sm font-semibold text-slate-200">Natanael B.</span>
                                </div>
                            </div>

                            <div>
                                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Data de Entrega</span>
                                {isEditing ? (
                                    <input
                                        type="date"
                                        value={editData.dueDate}
                                        onChange={(e) => setEditData({...editData, dueDate: e.target.value})}
                                        className="w-full bg-slate-900/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-300 outline-none focus:border-primary-500"
                                    />
                                ) : (
                                    <div className="flex items-center gap-3 p-3 bg-slate-900/40 rounded-xl border border-white/5 text-slate-300">
                                        <Clock size={16} className="text-slate-500" />
                                        <span className="text-sm font-medium">{card.dueDate ? new Date(card.dueDate).toLocaleDateString() : 'A definir'}</span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 text-primary-400 flex items-center gap-2">
                                    <Repeat size={12} /> Recorrência
                                </span>
                                <div className="space-y-3">
                                    <button
                                        onClick={async () => {
                                            const active = !!card.recurrence;
                                            try {
                                                if (active) {
                                                    await api.patch(`/cards/${card.id}`, { recurrence: null });
                                                } else {
                                                    await api.patch(`/cards/${card.id}`, {
                                                        recurrence: { frequency: 'WEEKLY', interval: 1 }
                                                    });
                                                }
                                                onUpdate();
                                            } catch (err) {
                                                alert('Erro ao atualizar recorrência');
                                            }
                                        }}
                                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${card.recurrence ? 'bg-primary-500/10 border-primary-500/30 text-primary-400' : 'bg-slate-900/40 border-white/5 text-slate-500 hover:border-white/10'}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Repeat size={14} />
                                            <span className="text-xs font-semibold">{card.recurrence ? 'Ativa' : 'Desativada'}</span>
                                        </div>
                                        <div className={`w-10 h-5 rounded-full relative transition-colors ${card.recurrence ? 'bg-primary-500' : 'bg-slate-700'}`}>
                                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all ${card.recurrence ? 'right-1' : 'left-1'}`} />
                                        </div>
                                    </button>

                                    {card.recurrence && (
                                        <div className="grid grid-cols-2 gap-2">
                                            <select
                                                value={card.recurrence.frequency}
                                                onChange={async (e) => {
                                                    try {
                                                        await api.patch(`/cards/${card.id}`, {
                                                            recurrence: { ...card.recurrence, frequency: e.target.value }
                                                        });
                                                        onUpdate();
                                                    } catch (err) { alert('Erro ao mudar frequência'); }
                                                }}
                                                className="bg-slate-900/60 border border-white/5 rounded-lg px-2 py-1.5 text-[10px] font-bold text-slate-300 outline-none hover:border-white/20 transition-all cursor-pointer"
                                            >
                                                <option value="DAILY">Diária</option>
                                                <option value="WEEKLY">Semanal</option>
                                                <option value="MONTHLY">Mensal</option>
                                            </select>
                                            <input
                                                type="number"
                                                min="1"
                                                value={card.recurrence.interval || 1}
                                                onChange={async (e) => {
                                                    try {
                                                        const interval = parseInt(e.target.value);
                                                        if (interval > 0) {
                                                            await api.patch(`/cards/${card.id}`, {
                                                                recurrence: { ...card.recurrence, interval }
                                                            });
                                                            onUpdate(card);
                                                        }
                                                    } catch (err) { alert('Erro ao mudar intervalo'); }
                                                }}
                                                className="bg-slate-900/60 border border-white/5 rounded-lg px-2 py-1.5 text-[10px] font-bold text-slate-300 outline-none hover:border-white/20 transition-all"
                                                placeholder="Int."
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Labels</span>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editData.tags}
                                        onChange={(e) => setEditData({...editData, tags: e.target.value})}
                                        placeholder="bug, feature, urgent (comma separated)"
                                        className="w-full bg-slate-900/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-300 outline-none focus:border-primary-500"
                                    />
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {card.tags?.map((tag: string) => (
                                            <span key={tag} className="px-3 py-1 bg-primary-500/10 text-primary-400 rounded-lg text-[10px] font-bold border border-primary-500/20">{tag}</span>
                                        ))}
                                        <button className="p-1 text-slate-600 hover:text-white transition-colors">
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div>
                                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Links Úteis</span>
                                {isEditing ? (
                                    <input
                                        type="url"
                                        value={editData.url}
                                        onChange={(e) => setEditData({...editData, url: e.target.value})}
                                        placeholder="https://..."
                                        className="w-full bg-slate-900/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-300 outline-none focus:border-primary-500"
                                    />
                                ) : (
                                    <a href={card.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-3 bg-slate-900/40 rounded-xl border border-white/5 text-primary-400 hover:bg-primary-500/5 transition-all truncate text-sm">
                                        <LinkIcon size={14} />
                                        {card.url || 'Nenhum link associado'}
                                    </a>
                                )}
                            </div>

                            <div className="pt-4 border-t border-white/5">
                                <span className="block text-[10px] font-bold text-red-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Lock size={12} /> Bloqueado por
                                </span>
                                <div className="space-y-2">
                                    {dependencies.blockedBy.map(dep => (
                                        <div key={dep.id} className="flex items-center justify-between p-2.5 bg-red-500/5 border border-red-500/10 rounded-xl group">
                                            <span className="text-xs text-slate-300 truncate font-medium">{dep.blocker?.title}</span>
                                            <button
                                                onClick={async () => {
                                                    await dependencyService.removeDependency(dep.id);
                                                    fetchDependencies();
                                                }}
                                                className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    {dependencies.blockedBy.length === 0 && <span className="text-[10px] text-slate-600 italic">Nenhum bloqueador</span>}
                                    <button
                                        onClick={() => {
                                            const blockerId = window.prompt('Digite o ID do card bloqueador (MVP):');
                                            if (blockerId) dependencyService.addDependency(blockerId, card.id).then(fetchDependencies);
                                        }}
                                        className="w-full flex items-center justify-center gap-1 p-2 text-[10px] font-bold text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all border border-dashed border-white/10 mt-2"
                                    >
                                        <Plus size={10} /> Adicionar Bloqueador
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/5">
                                <span className="block text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-3">Bloqueia</span>
                                <div className="space-y-2">
                                    {dependencies.blocking.map(dep => (
                                        <div key={dep.id} className="flex items-center justify-between p-2.5 bg-amber-500/5 border border-amber-500/10 rounded-xl group">
                                            <span className="text-xs text-slate-300 truncate font-medium">{dep.blocked?.title}</span>
                                            <button
                                                onClick={async () => {
                                                    await dependencyService.removeDependency(dep.id);
                                                    fetchDependencies();
                                                }}
                                                className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    {dependencies.blocking.length === 0 && <span className="text-[10px] text-slate-600 italic">Não bloqueia nenhum card</span>}
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-white/5 space-y-3">
                            <button className="w-full flex items-center gap-3 px-4 py-3 bg-slate-900/40 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all text-slate-400 text-sm font-semibold">
                                <Trash2 size={16} />
                                Arquivar Atividade
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CardModal;
