import React from 'react';
import { Chrome, Apple } from 'lucide-react';

interface SocialLoginProps {
    onGoogleLogin: () => void;
    onAppleLogin: () => void;
}

const SocialLogin: React.FC<SocialLoginProps> = ({ onGoogleLogin, onAppleLogin }) => {
    return (
        <div className="space-y-6">
            <div className="relative my-8 text-center">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                </div>
                <span className="relative px-4 bg-[#111c31] text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                    Ou continue com
                </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <button
                    type="button"
                    onClick={onGoogleLogin}
                    className="flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/5 py-3 rounded-xl transition-all text-sm font-semibold text-slate-200 active:scale-95 group"
                >
                    <Chrome size={18} className="group-hover:text-primary-400 transition-colors" />
                    Google
                </button>
                <button
                    type="button"
                    onClick={onAppleLogin}
                    disabled
                    className="flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/5 py-3 rounded-xl transition-all text-sm font-semibold text-slate-200 opacity-50 cursor-not-allowed group"
                >
                    <Apple size={18} className="group-hover:text-slate-400 transition-colors" />
                    Apple
                </button>
            </div>
        </div>
    );
};

export default SocialLogin;
