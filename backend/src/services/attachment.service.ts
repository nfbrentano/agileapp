import s3Client, { bucketName } from '../config/s3';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import prisma from '../config/prisma';
import { v4 as uuidv4 } from 'uuid';

export const uploadFile = async (file: Express.Multer.File, cardId: string, userId: string) => {
    const fileExtension = file.originalname.split('.').pop();
    const key = `attachments/${uuidv4()}.${fileExtension}`;

    await s3Client.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
    }));

    // In a real S3 production environment, the URL would be different.
    // For Minio local, we can construct it if accessible or use a proxy.
    // For now, let's store the relative path or a public-accessible URL if endpoint is provided.
    const url = process.env.S3_ENDPOINT
        ? `${process.env.S3_ENDPOINT}/${bucketName}/${key}`
        : `/${bucketName}/${key}`;

    return await prisma.attachment.create({
        data: {
            filename: file.originalname,
            url,
            size: file.size,
            mimeType: file.mimetype,
            cardId,
            uploadedBy: userId,
        },
    });
};

export const deleteFile = async (attachmentId: string) => {
    const attachment = await prisma.attachment.findUnique({
        where: { id: attachmentId },
    });

    if (!attachment) return;

    // Extract key from URL (simple implementation for this MVP)
    const key = attachment.url.split(`${bucketName}/`)[1];

    await s3Client.send(new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
    }));

    await prisma.attachment.delete({
        where: { id: attachmentId },
    });
};

export const getAttachmentsByCard = async (cardId: string) => {
    return await prisma.attachment.findMany({
        where: { cardId },
        include: { user: { select: { name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
    });
};
