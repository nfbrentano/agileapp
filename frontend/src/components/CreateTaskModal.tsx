import React, { useState } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import api from '../services/api';

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    teamId: string;
    columns: any[];
    onSuccess: () => void;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose, teamId, columns, onSuccess }) => {
    const [title, setTitle] = useState('');
    const [details, setDetails] = useState('');
    const [columnId, setColumnId] = useState('');
    const [priority, setPriority] = useState('MEDIUM');
    const [tags, setTags] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Set default column when columns are available
    React.useEffect(() => {
        if (columns.length > 0 && !columnId) {
            setColumnId(columns[0].id);
        }
    }, [columns, columnId]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            setError('Title is required');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const tagArray = tags.split(',').map(t => t.trim()).filter(t => t);
            
            await api.post('/cards', {
                teamId,
                columnId,
                title: title.trim(),
                details: details.trim(),
                priority,
                tags: tagArray
            });

            // Reset form
            setTitle('');
            setDetails('');
            setTags('');
            setPriority('MEDIUM');
            
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to create task');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h2 className="text-xl font-black text-slate-900">Create New Task</h2>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-xl">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    {/* Title */}
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700">Title *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter task title..."
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all"
                            autoFocus
                        />
                    </div>

                    {/* Column */}
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700">Column</label>
                        <select
                            value={columnId}
                            onChange={(e) => setColumnId(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all"
                        >
                            {columns.map((col) => (
                                <option key={col.id} value={col.id}>
                                    {col.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Priority */}
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700">Priority</label>
                        <div className="flex gap-2">
                            {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setPriority(p)}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                                        priority === p
                                            ? p === 'CRITICAL'
                                                ? 'bg-red-500 text-white'
                                                : p === 'HIGH'
                                                ? 'bg-orange-500 text-white'
                                                : p === 'MEDIUM'
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-slate-500 text-white'
                                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700">Description</label>
                        <textarea
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            placeholder="Add task description..."
                            rows={3}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all resize-none"
                        />
                    </div>

                    {/* Tags */}
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700">Tags</label>
                        <input
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="bug, feature, urgent (comma separated)"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !title.trim()}
                            className="flex-1 px-6 py-3 bg-[#0ea5e9] text-white rounded-xl font-bold text-sm hover:bg-sky-600 transition-all shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="animate-pulse">Creating...</span>
                            ) : (
                                <>
                                    <Plus size={18} />
                                    Create Task
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTaskModal;
