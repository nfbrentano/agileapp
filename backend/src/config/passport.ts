import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from './prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID || 'placeholder',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder',
            callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value;
                if (!email) {
                    return done(new Error('No email found'));
                }

                // 1. Tentar encontrar pelo googleId
                let user = await prisma.user.findUnique({
                    where: { googleId: profile.id },
                });

                if (!user) {
                    // 2. Se não encontrar, tentar pelo e-mail para fazer o merge
                    user = await prisma.user.findUnique({
                        where: { email: email },
                    });

                    if (user) {
                        // Vincular googleId ao usuário existente (Merge)
                        user = await prisma.user.update({
                            where: { id: user.id },
                            data: { googleId: profile.id },
                        });
                    } else {
                        // 3. Se ainda não existir, criar novo usuário
                        user = await prisma.user.create({
                            data: {
                                name: profile.displayName,
                                email: email,
                                avatar: profile.photos?.[0]?.value || null,
                                googleId: profile.id,
                            },
                        });
                    }
                }

                return done(null, user);
            } catch (error) {
                return done(error as Error);
            }
        }
    )
);

export const generateToken = (user: any) => {
    return jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
};
