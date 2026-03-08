import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import { authService } from '../services/authService';
import AuthLayout from '../components/auth/AuthLayout';
import AuthHeader from '../components/auth/AuthHeader';
import AuthInput from '../components/auth/AuthInput';
import SocialLogin from '../components/auth/SocialLogin';

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
        <AuthLayout>
            <AuthHeader
                icon={LogIn}
                title="Bem-vindo"
                subtitle="Acesse sua conta para gerenciar seus times."
            />

            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-4 rounded-xl animate-in fade-in slide-in-from-top-2">
                        {error}
                    </div>
                )}

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
                    rightElement={
                        <Link to="/forgot-password" weights="bold" className="text-xs text-primary-400 hover:text-primary-300 font-bold transition-colors">
                            Esqueceu a senha?
                        </Link>
                    }
                />

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group mt-2"
                >
                    {isLoading ? 'Entrando...' : (
                        <>
                            Entrar <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>

            <SocialLogin
                onGoogleLogin={() => handleOAuth('google')}
                onAppleLogin={() => handleOAuth('apple')}
            />

            <p className="text-center text-slate-400 mt-8 text-sm">
                Não tem uma conta? <Link to="/register" className="text-primary-400 font-bold hover:underline">Registre-se gratuitamente</Link>
            </p>
        </AuthLayout>
    );
};

export default LoginPage;

