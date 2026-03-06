import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/authService';

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await authService.forgotPassword(email);
            setIsSuccess(true);
        } catch (err: any) {
            setError('Ocorreu um erro ao processar sua solicitação.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl">
                <Link to="/login" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors mb-8">
                    <ArrowLeft size={16} /> Voltar ao login
                </Link>

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white">Recuperar Senha</h1>
                    <p className="text-slate-400 mt-2">Enviaremos um link de redefinição para o seu e-mail.</p>
                </div>

                {isSuccess ? (
                    <div className="bg-primary-500/10 border border-primary-500/20 rounded-2xl p-6 text-center">
                        <CheckCircle2 size={32} className="text-primary-400 mx-auto mb-4" />
                        <h3 className="text-white font-bold mb-2">E-mail Enviado!</h3>
                        <p className="text-slate-400 text-sm">Se o e-mail estiver cadastrado, você receberá instruções em instantes.</p>
                        <Link to="/login" className="block w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl mt-6 transition-all">
                            Ir para o Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-4 rounded-xl">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300 ml-1">E-mail Cadastrado</label>
                            <div className="relative group">
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-400 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    className="w-full bg-slate-800/50 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary-500 focus:bg-slate-800 transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            {isLoading ? 'Processando...' : (
                                <>
                                    Enviar Link <Send size={18} />
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
