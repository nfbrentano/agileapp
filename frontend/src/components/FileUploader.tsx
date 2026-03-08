import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Paperclip, X, FileText, ImageIcon, Download, Trash2, Loader2 } from 'lucide-react';
import { attachmentService } from '../services/attachmentService';
import type { Attachment } from '../services/attachmentService';

interface FileUploaderProps {
    cardId: string;
    attachments: Attachment[];
    onUpdate: () => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ cardId, attachments, onUpdate }) => {
    const [isUploading, setIsUploading] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        setIsUploading(true);
        try {
            for (const file of acceptedFiles) {
                await attachmentService.uploadFile(cardId, file);
            }
            onUpdate();
        } catch (error) {
            console.error('Erro no upload:', error);
            alert('Erro ao fazer upload de um ou mais arquivos.');
        } finally {
            setIsUploading(false);
        }
    }, [cardId, onUpdate]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxSize: 10 * 1024 * 1024, // 10MB
    });

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja remover este anexo?')) return;
        try {
            await attachmentService.deleteAttachment(id);
            onUpdate();
        } catch (error) {
            console.error('Erro ao deletar:', error);
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const isImage = (mime: string) => mime.startsWith('image/');

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-bold flex items-center gap-2 text-slate-400">
                <Paperclip size={16} /> Anexos
            </h3>

            {/* Dropzone */}
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-2xl p-6 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${isDragActive ? 'border-primary-500 bg-primary-500/10' : 'border-white/5 hover:border-white/10 bg-white/5'
                    }`}
            >
                <input {...getInputProps()} />
                {isUploading ? (
                    <Loader2 className="animate-spin text-primary-500" size={24} />
                ) : (
                    <Paperclip className="text-slate-500" size={24} />
                )}
                <p className="text-xs text-slate-500 font-medium text-center">
                    {isDragActive ? 'Solte para enviar' : 'Arraste arquivos ou clique para selecionar'}
                </p>
                <p className="text-[10px] text-slate-600">Máximo 10MB/arquivo</p>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {attachments.map(file => (
                    <div
                        key={file.id}
                        className="group relative bg-slate-900/50 border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-all"
                    >
                        <div className="flex items-center gap-3 p-3">
                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden">
                                {isImage(file.mimeType) ? (
                                    <img src={file.url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <FileText className="text-slate-500" size={20} />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-200 truncate">{file.filename}</p>
                                <p className="text-[10px] text-slate-500">{formatSize(file.size)}</p>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <a
                                    href={file.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 hover:text-primary-400 transition-colors"
                                >
                                    <Download size={14} />
                                </a>
                                <button
                                    onClick={() => handleDelete(file.id)}
                                    className="p-1.5 hover:text-red-400 transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FileUploader;
