import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.sendStatus(401);
        }

        jwt.verify(token, JWT_SECRET, async (err: any, payload: any) => {
            if (err) {
                return res.sendStatus(403);
            }

            const user = await prisma.user.findUnique({
                where: { id: payload.id },
            });

            if (!user) {
                return res.sendStatus(401);
            }

            (req as any).user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};
