import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon: LucideIcon;
    rightElement?: React.ReactNode;
}

const AuthInput: React.FC<AuthInputProps> = ({ label, icon: Icon, rightElement, className, ...props }) => {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-semibold text-slate-300">{label}</label>
                {rightElement}
            </div>
            <div className="relative group">
                <Icon
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-400 transition-colors"
                />
                <input
                    {...props}
                    className={`w-full bg-slate-800/50 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500 focus:bg-slate-800 transition-all font-medium ${className}`}
                />
            </div>
        </div>
    );
};

export default AuthInput;
