import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, ArrowRight, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/authService';
import AuthLayout from '../components/auth/AuthLayout';
import AuthHeader from '../components/auth/AuthHeader';
import AuthInput from '../components/auth/AuthInput';

const RegisterPage: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            return setError('As senhas não coincidem');
        }

        setIsLoading(true);
        try {
            await authService.register(name, email, password);
            setIsSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Erro ao criar conta');
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <AuthLayout>
                <div className="text-center py-4">
                    <div className="w-20 h-20 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                        <CheckCircle2 size={40} className="text-primary-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Conta Criada!</h1>
                    <p className="text-slate-400 mb-8 font-medium">Sua conta foi criada com sucesso. Redirecionando para o login...</p>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-primary-500 h-full animate-progress" />
                    </div>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout>
            <AuthHeader
                icon={ArrowRight}
                title="Criar Conta"
                subtitle="Junte-se a times ágeis de alta performance."
                iconClassName="bg-primary-600 shadow-primary-500/20 rotate-3"
            />

            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-4 rounded-xl animate-in fade-in slide-in-from-top-2">
                        {error}
                    </div>
                )}

                <AuthInput
                    label="Nome Completo"
                    icon={UserIcon}
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: João Silva"
                />

                <AuthInput
                    label="E-mail"
                    icon={Mail}
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                />

                <AuthInput
                    label="Senha"
                    icon={Lock}
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                />

                <AuthInput
                    label="Confirmar Senha"
                    icon={Lock}
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                />

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary-500/20 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2 group"
                >
                    {isLoading ? 'Criando conta...' : (
                        <>
                            Registrar Agora <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>

            <p className="text-center text-slate-400 mt-8 text-sm">
                Já tem uma conta? <Link to="/login" className="text-primary-400 font-bold hover:underline">Entre aqui</Link>
            </p>
        </AuthLayout>
    );
};

export default RegisterPage;

