import React, { useState } from 'react';
import { X, Type, Layout, Settings, Target, Plus } from 'lucide-react';
import api from '../services/api';

interface TeamModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (team: any) => void;
}

const TeamModal: React.FC<TeamModalProps> = ({ isOpen, onClose, onSuccess }) => {
    if (!isOpen) return null;
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [mode, setMode] = useState<'KANBAN' | 'SCRUM'>('KANBAN');
    const [color, setColor] = useState('#3b82f6');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const colors = [
        '#3b82f6', // blue
        '#10b981', // emerald
        '#f59e0b', // amber
        '#ef4444', // red
        '#8b5cf6', // violet
        '#ec4899', // pink
        '#06b6d4', // cyan
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await api.post('/teams', {
                name,
                description,
                mode,
                color
            });
            onSuccess(response.data);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Erro ao criar time');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-500/20 rounded-lg">
                            <Plus size={20} className="text-primary-400" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Novo Time</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-4 rounded-xl">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Nome do Projeto</label>
                        <div className="relative group">
                            <Type size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-400 transition-colors" />
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ex: App de Delivery"
                                className="w-full bg-slate-800/50 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary-500 focus:bg-slate-800 transition-all font-medium"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Descrição</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Descreva o propósito deste time..."
                            rows={3}
                            className="w-full bg-slate-800/50 border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-primary-500 focus:bg-slate-800 transition-all font-medium resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Metodologia</label>
                            <div className="flex bg-slate-800/50 p-1 rounded-xl border border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setMode('KANBAN')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'KANBAN' ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    <Layout size={16} /> Kanban
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMode('SCRUM')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'SCRUM' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    <Settings size={16} /> Scrum
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Cor Identificadora</label>
                            <div className="flex flex-wrap gap-2 pt-1">
                                {colors.map(c => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setColor(c)}
                                        className={`w-6 h-6 rounded-full transition-all hover:scale-125 ${color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : ''
                                            }`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-[2] px-6 py-3 rounded-2xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold transition-all shadow-lg shadow-primary-500/20 active:scale-95 flex items-center justify-center gap-2"
                        >
                            {isLoading ? 'Criando...' : (
                                <>
                                    <Target size={18} />
                                    Criar Time Agora
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TeamModal;
