import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { authService } from '../services/authService';
import { motion } from 'framer-motion';

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess(false);

        try {
            await authService.forgotPassword(email);
            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Erro ao processar solicitação. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-50 items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 p-8 lg:p-12 relative overflow-hidden"
            >
                {/* Decorative Background */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-sky-400 to-sky-600 opacity-10 blur-3xl rounded-full translate-y-[-50%]"></div>

                <div className="relative z-10">
                    <div className="flex justify-center mb-8">
                        <div className="w-16 h-16 bg-sky-100 rounded-2xl flex items-center justify-center shadow-inner">
                            <Mail className="w-8 h-8 text-sky-500" />
                        </div>
                    </div>

                    <div className="text-center space-y-3 mb-10">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Forgot password?</h1>
                        <p className="text-slate-500 text-base">
                            No worries, we'll send you reset instructions.
                        </p>
                    </div>

                    {success ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center space-y-6"
                        >
                            <div className="bg-emerald-50 text-emerald-600 text-sm p-4 rounded-xl border border-emerald-100 font-medium">
                                We've sent an email to <strong>{email}</strong> with a link to reset your password.
                            </div>
                            <Link
                                to="/login"
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-900/20 transition-all active:scale-[0.98] flex items-center justify-center"
                            >
                                Take me back to login
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
                                <label className="text-sm font-bold text-slate-700 ml-1">Email address</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all outline-none text-slate-900 placeholder:text-slate-400"
                                    placeholder="name@company.com"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !email}
                                className="w-full bg-[#0ea5e9] hover:bg-sky-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg shadow-sky-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
                            >
                                {isLoading ? 'Sending instructions...' : 'Reset password'}
                            </button>
                        </form>
                    )}

                    {!success && (
                        <div className="mt-8 text-center">
                            <Link to="/login" className="inline-flex items-center justify-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
                                <ArrowLeft size={16} />
                                Back to log in
                            </Link>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPasswordPage;
