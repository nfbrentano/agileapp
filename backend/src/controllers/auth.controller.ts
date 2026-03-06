import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/prisma';
import { sendResetPasswordEmail } from '../services/email.service';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';

const generateAccessToken = (userId: string) => {
    return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
};

export const register = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Usuário já existe' });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
            },
        });

        res.status(201).json({ message: 'Usuário criado com sucesso', userId: user.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao registrar usuário' });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        const accessToken = generateAccessToken(user.id);
        const refreshToken = uuidv4();

        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
            },
        });

        res.json({ accessToken, refreshToken, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao fazer login' });
    }
};

export const logout = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    try {
        await prisma.refreshToken.update({
            where: { token: refreshToken },
            data: { revoked: true },
        });
        res.json({ message: 'Logout realizado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao fazer logout' });
    }
};

export const refresh = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    try {
        const rt = await prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true },
        });

        if (!rt || rt.revoked || rt.expiresAt < new Date()) {
            return res.status(401).json({ error: 'Refresh token inválido ou expirado' });
        }

        const accessToken = generateAccessToken(rt.userId);
        res.json({ accessToken });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao renovar token' });
    }
};

export const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.json({ message: 'Se o e-mail existir, um link de recuperação será enviado.' });
        }

        const resetToken = uuidv4();
        await prisma.passwordResetToken.create({
            data: {
                token: resetToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hora
            },
        });

        await sendResetPasswordEmail(email, resetToken);

        res.json({ message: 'Se o e-mail existir, um link de recuperação será enviado.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao processar solicitação' });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    try {
        const resetTokenRecord = await prisma.passwordResetToken.findUnique({
            where: { token },
            include: { user: true },
        });

        if (!resetTokenRecord || resetTokenRecord.used || resetTokenRecord.expiresAt < new Date()) {
            return res.status(400).json({ error: 'Token de recuperação inválido ou expirado' });
        }

        const passwordHash = await bcrypt.hash(newPassword, 12);

        await prisma.$transaction([
            prisma.user.update({
                where: { id: resetTokenRecord.userId },
                data: { passwordHash },
            }),
            prisma.passwordResetToken.update({
                where: { id: resetTokenRecord.id },
                data: { used: true },
            }),
        ]);

        res.json({ message: 'Senha atualizada com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar senha' });
    }
};

export const unlinkGoogle = async (req: Request, res: Response) => {
    const userId = (req as any).user.id;

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

        // Segurança: Só desvincular se tiver senha ou outro provedor (Apple neste caso)
        if (!user.passwordHash && !user.appleId) {
            return res.status(400).json({ error: 'Você não pode desvincular o Google sem antes definir uma senha.' });
        }

        await prisma.user.update({
            where: { id: userId },
            data: { googleId: null },
        });

        res.json({ message: 'Conta Google desvinculada com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao desvincular conta' });
    }
};

export const unlinkApple = async (req: Request, res: Response) => {
    const userId = (req as any).user.id;

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

        if (!user.passwordHash && !user.googleId) {
            return res.status(400).json({ error: 'Você não pode desvincular a Apple sem antes definir uma senha.' });
        }

        await prisma.user.update({
            where: { id: userId },
            data: { appleId: null },
        });

        res.json({ message: 'Conta Apple desvinculada com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao desvincular conta' });
    }
};
