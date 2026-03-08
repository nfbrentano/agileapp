import React, { useState, useEffect } from 'react';
import { Settings, User, Mail, Shield, Chrome, Apple, ArrowLeft, LogOut, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import type { UserProfile } from '../services/authService';

const ProfilePage: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await authService.getProfile();
            setProfile(data);
        } catch (err) {
            setError('Erro ao carregar perfil.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUnlink = async (provider: 'google' | 'apple') => {
        if (!profile) return;
        setError('');
        setSuccess('');

        try {
            if (provider === 'google') await authService.unlinkGoogle();
            else await authService.unlinkApple();

            setSuccess(`Conta ${provider === 'google' ? 'Google' : 'Apple'} desvinculada.`);
            loadProfile();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Erro ao desvincular conta.');
        }
    };

    if (isLoading) return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-500" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-10">
                    <Link to="/" className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-3xl font-bold text-white">Configurações de Conta</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar */}
                    <div className="space-y-2">
                        <button className="w-full flex items-center gap-3 px-4 py-3 bg-primary-600 text-white rounded-xl shadow-lg shadow-primary-500/20 font-semibold">
                            <User size={20} /> Perfil
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl text-slate-400 transition-all font-semibold">
                            <Shield size={20} /> Segurança
                        </button>
                        <div className="pt-4 border-t border-white/5">
                            <button
                                onClick={() => authService.logout().then(() => window.location.href = '/login')}
                                className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/5 rounded-xl transition-all font-semibold"
                            >
                                <LogOut size={20} /> Sair da Conta
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-sm">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-4 rounded-2xl text-sm">
                                {success}
                            </div>
                        )}

                        <section className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 space-y-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Settings size={20} className="text-primary-400" /> Informações Pessoais
                            </h2>

                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nome</label>
                                    <p className="text-lg text-white font-semibold">{profile?.name}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">E-mail</label>
                                    <div className="flex items-center gap-2 text-lg text-white font-semibold">
                                        <Mail size={18} className="text-slate-500" />
                                        {profile?.email}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 space-y-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Chrome size={20} className="text-primary-400" /> Contas Conectadas
                            </h2>
                            <p className="text-sm text-slate-400">Gerencie seus métodos de login social.</p>

                            <div className="space-y-4">
                                {/* Google */}
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
                                            <Chrome size={20} className={profile?.googleId ? 'text-blue-400' : 'text-slate-600'} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">Google</p>
                                            <p className="text-xs text-slate-500">{profile?.googleId ? 'Conectado' : 'Não vinculado'}</p>
                                        </div>
                                    </div>
                                    {profile?.googleId ? (
                                        <button
                                            onClick={() => handleUnlink('google')}
                                            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                                            title="Desvincular Google"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    ) : (
                                        <button className="text-xs font-bold text-primary-400 hover:text-white transition-colors">Conectar</button>
                                    )}
                                </div>

                                {/* Apple */}
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
                                            <Apple size={20} className={profile?.appleId ? 'text-white' : 'text-slate-600'} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">Apple ID</p>
                                            <p className="text-xs text-slate-500">{profile?.appleId ? 'Conectado' : 'Não vinculado'}</p>
                                        </div>
                                    </div>
                                    {profile?.appleId ? (
                                        <button
                                            onClick={() => handleUnlink('apple')}
                                            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                                            title="Desvincular Apple"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    ) : (
                                        <button className="text-xs font-bold text-primary-400 hover:text-white transition-colors">Conectar</button>
                                    )}
                                </div>
                            </div>

                            {!profile?.hasPassword && (
                                <div className="mt-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                                    <p className="text-xs text-indigo-400 leading-relaxed font-medium">
                                        <Shield size={14} className="inline mr-1" />
                                        <strong>Dica de Segurança:</strong> Você ainda não possui uma senha definida. Recomendamos cadastrar uma para garantir acesso caso desvincule suas contas sociais.
                                    </p>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
