import api from './api';

export interface Attachment {
    id: string;
    filename: string;
    url: string;
    size: number;
    mimeType: string;
    cardId: string;
    uploadedBy: string;
    user: {
        name: string;
        avatar?: string;
    };
    createdAt: string;
}

export const attachmentService = {
    async getAttachments(cardId: string): Promise<Attachment[]> {
        const response = await api.get<Attachment[]>(`/attachments/card/${cardId}`);
        return response.data;
    },

    async uploadFile(cardId: string, file: File): Promise<Attachment> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('cardId', cardId);

        const response = await api.post<Attachment>('/attachments/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    async deleteAttachment(id: string): Promise<void> {
        await api.delete(`/attachments/${id}`);
    },
};
