import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/authService';
import { motion } from 'framer-motion';

const ResetPasswordPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            setError('Link de recuperação inválido ou inexistente.');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!token) {
            setError('Token inválido. Solicite um novo link de recuperação.');
            return;
        }

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        setIsLoading(true);
        setError('');
        setSuccess(false);

        try {
            await authService.resetPassword(token, password);
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Erro ao redefinir a senha. O link pode ter expirado.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex bg-slate-50 items-center justify-center p-4">
                 <div className="w-full max-w-md bg-white rounded-[2rem] shadow-xl p-8 text-center space-y-6">
                    <div className="text-red-500 text-xl font-bold">Invalid Reset Link</div>
                    <p className="text-slate-500">We couldn't find a valid reset token. Please request a new password reset link.</p>
                    <Link to="/forgot-password" className="inline-block bg-[#0ea5e9] text-white font-bold py-3 px-6 rounded-xl hover:bg-sky-600 transition-colors">
                        Request New Link
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex bg-slate-50 items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 p-8 lg:p-12 relative overflow-hidden"
            >
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-full h-32 bg-gradient-to-bl from-emerald-400 to-sky-600 opacity-10 blur-3xl rounded-full translate-y-[-50%]"></div>

                <div className="relative z-10">
                    <div className="flex justify-center mb-8">
                        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center shadow-inner">
                            <Lock className="w-8 h-8 text-emerald-500" />
                        </div>
                    </div>

                    <div className="text-center space-y-3 mb-10">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Set new password</h1>
                        <p className="text-slate-500 text-base">
                            Your new password must be different to previously used passwords.
                        </p>
                    </div>

                    {success ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center space-y-6"
                        >
                            <div className="flex justify-center mb-4">
                                <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">Password reset</h2>
                            <p className="text-slate-500">
                                Your password has been successfully reset. Redirecting to login...
                            </p>
                            <Link
                                to="/login"
                                className="block w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-900/20 transition-all active:scale-[0.98]"
                            >
                                Continue to log in
                            </Link>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-50 text-red-500 text-sm p-4 rounded-xl border border-red-100">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all outline-none text-slate-900 placeholder:text-slate-400"
                                        placeholder="••••••••"
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                <p className="text-xs text-slate-500 ml-2">Must be at least 6 characters</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Confirm New Password</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all outline-none text-slate-900 placeholder:text-slate-400"
                                        placeholder="••••••••"
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !password || !confirmPassword || password !== confirmPassword}
                                className="w-full bg-[#0ea5e9] hover:bg-sky-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg shadow-sky-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
                            >
                                {isLoading ? 'Resetting password...' : 'Reset password'}
                            </button>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPasswordPage;
