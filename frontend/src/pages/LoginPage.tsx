import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, LogIn, Github, Chrome, Apple, ArrowRight } from 'lucide-react';
import { authService } from '../services/authService';

const LoginPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            localStorage.setItem('agile_auth_token', token);
            navigate('/');
        }
    }, [searchParams, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await authService.login(email, password);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.error || 'E-mail ou senha incorretos');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOAuth = (provider: string) => {
        window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/${provider}`;
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
            {/* Background Decor */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary-500/10 blur-[120px] rounded-full" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-md w-full bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl relative z-10">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/20">
                        <LogIn size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Bem-vindo</h1>
                    <p className="text-slate-400 mt-2">Acesse sua conta para gerenciar seus times.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-4 rounded-xl animate-in fade-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-300 ml-1">E-mail</label>
                        <div className="relative group">
                            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-400 transition-colors" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                                className="w-full bg-slate-800/50 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary-500 focus:bg-slate-800 transition-all font-medium"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-sm font-semibold text-slate-300">Senha</label>
                            <Link to="/forgot-password" size="sm" className="text-xs text-primary-400 hover:text-primary-300 font-bold">
                                Esqueceu a senha?
                            </Link>
                        </div>
                        <div className="relative group">
                            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-400 transition-colors" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-slate-800/50 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary-500 focus:bg-slate-800 transition-all font-medium"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        {isLoading ? 'Entrando...' : (
                            <>
                                Entrar <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="relative my-8 text-center">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/5"></div>
                    </div>
                    <span className="relative px-4 bg-[#111c31] text-xs font-bold text-slate-500 uppercase tracking-widest">Ou continue com</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => handleOAuth('google')}
                        className="flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/5 py-3 rounded-xl transition-all text-sm font-semibold text-slate-200"
                    >
                        <Chrome size={18} />
                        Google
                    </button>
                    <button
                        onClick={() => handleOAuth('apple')}
                        disabled
                        className="flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/5 py-3 rounded-xl transition-all text-sm font-semibold text-slate-200 opacity-50 cursor-not-allowed"
                    >
                        <Apple size={18} />
                        Apple
                    </button>
                </div>

                <p className="text-center text-slate-400 mt-8 text-sm">
                    Não tem uma conta? <Link to="/register" className="text-primary-400 font-bold hover:underline">Registre-se gratuitamente</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
