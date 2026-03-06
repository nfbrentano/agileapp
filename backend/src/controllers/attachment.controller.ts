import { Request, Response } from 'express';
import multer from 'multer';
import { uploadFile, deleteFile, getAttachmentsByCard } from '../services/attachment.service';

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
});

export const uploadMiddleware = upload.single('file');

export const handleUpload = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Nenhum arquivo enviado' });
        }

        const { cardId } = req.body;
        const userId = (req as any).user.id;

        // Check if card exists and user has access (simplified for MVP)
        // ...

        const attachment = await uploadFile(req.file, cardId, userId);
        res.status(201).json(attachment);
    } catch (error) {
        console.error('Erro no upload:', error);
        res.status(500).json({ error: 'Erro ao fazer upload do arquivo' });
    }
};

export const handleDelete = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await deleteFile(id as string);
        res.status(204).send();
    } catch (error) {
        console.error('Erro ao deletar:', error);
        res.status(500).json({ error: 'Erro ao deletar anexo' });
    }
};

export const handleGetByCard = async (req: Request, res: Response) => {
    try {
        const { cardId } = req.params;
        const attachments = await getAttachmentsByCard(cardId as string);
        res.json(attachments);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar anexos' });
    }
};
