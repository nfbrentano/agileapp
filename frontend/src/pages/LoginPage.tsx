import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { authService } from '../services/authService';
import { motion } from 'framer-motion';

const LoginPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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

    console.log('Rendering LoginPage');
    return (
        <div className="min-h-screen flex bg-white justify-center items-center">
            {/* Form Container */}
            <div className="w-full max-w-md p-8 lg:p-12 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
                <div className="space-y-12">
                    <div className="flex items-center gap-3 justify-center">
                        <div className="w-10 h-10 bg-[#0ea5e9] rounded-lg flex items-center justify-center shadow-lg shadow-sky-500/20">
                            <svg className="w-6 h-6 text-white text-3xl font-bold fill-white" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M4 6.5C4 5.11929 5.11929 4 6.5 4H17.5C18.8807 4 20 5.11929 20 6.5V17.5C20 18.8807 18.8807 20 17.5 20H6.5C5.11929 20 4 18.8807 4 17.5V6.5Z" />
                                <rect x="7" y="7" width="4" height="4" rx="1" fill="#0ea5e9" stroke="white" strokeWidth="1" />
                                <rect x="13" y="13" width="4" height="4" rx="1" fill="#0ea5e9" stroke="white" strokeWidth="1" />
                            </svg>
                        </div>
                        <span className="text-2xl font-bold text-slate-900 tracking-tight">AgileApp</span>
                    </div>

                    <div className="space-y-4 text-center">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Welcome back</h1>
                        <p className="text-slate-500 text-lg">Log in to manage your agile projects efficiently</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => handleOAuth('google')}
                            className="flex items-center justify-center gap-2 py-3 px-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all font-semibold text-slate-700"
                        >
                            <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" className="w-5 h-5 object-contain" />
                            Google
                        </button>
                        <button
                            onClick={() => handleOAuth('apple')}
                            className="flex items-center justify-center gap-2 py-3 px-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all font-semibold text-slate-700"
                        >
                            <svg className="w-5 h-5 text-slate-900" viewBox="0 0 24 24" fill="currentColor"><path d="M17.057 10.78c.045 2.303 1.954 3.064 1.988 3.08-.016.05-.31 1.059-1.025 2.11-.617.893-1.258 1.782-2.222 1.8-1.01.018-1.332-.613-2.486-.613-1.153 0-1.513.6-2.467.633-.953.033-1.688-.934-2.308-1.826-1.27-1.83-2.23-5.17-1.015-7.27.604-1.04 1.674-1.7 2.825-1.717 1.15-.015 2.05.78 2.748.78.697 0 1.764-.95 2.89-.834.473.018 1.803.189 2.657 1.442-.068.043-1.587.925-1.571 2.76M14.73 6.13c-.47-.565-.78-1.353-.694-2.14.675.027 1.488.45 1.972 1.015.433.504.812 1.306.708 2.079-.753.059-1.516-.39-1.986-.954" /></svg>
                            Apple
                        </button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-medium tracking-wider">Or continue with email</span></div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-500 text-sm p-4 rounded-xl border border-red-100">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Email address</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-4 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all outline-none text-slate-900 placeholder:text-slate-300"
                                    placeholder="name@company.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-bold text-slate-700">Password</label>
                                <Link to="/forgot-password" className="text-sm text-sky-500 hover:text-sky-600 font-bold transition-colors">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-4 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all outline-none text-slate-900 placeholder:text-slate-300"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 ml-1">
                            <input type="checkbox" id="keep-logged" className="w-5 h-5 rounded border-slate-300 text-sky-500 focus:ring-sky-500" />
                            <label htmlFor="keep-logged" className="text-sm text-slate-500 font-medium">Keep me logged in</label>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#0ea5e9] hover:bg-sky-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg shadow-sky-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
                        >
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>

                    <p className="text-center text-slate-500 text-sm font-medium">
                        Don't have an account? <Link to="/register" className="text-sky-500 font-bold hover:underline">Start your 14-day free trial</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

