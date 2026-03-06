import { Router } from 'express';
import passport from 'passport';
import { generateToken } from '../config/passport';
import {
    register, login, logout, refresh,
    forgotPassword, resetPassword,
    unlinkGoogle, unlinkApple
} from '../controllers/auth.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

// Email/Password
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
    '/google/callback',
    passport.authenticate('google', { session: false }),
    (req, res) => {
        const user: any = req.user;
        const token = generateToken(user);
        res.redirect(`${process.env.VITE_FRONTEND_URL || 'http://localhost:3000'}/login?token=${token}`);
    }
);

// Account Linking/Unlinking
router.delete('/unlink/google', authenticateJWT, unlinkGoogle);
router.delete('/unlink/apple', authenticateJWT, unlinkApple);

// Self Profile
router.get('/me', authenticateJWT, (req, res) => {
    const user = (req as any).user;
    res.json({
        ...user,
        hasPassword: !!user.passwordHash
    });
});

export default router;
