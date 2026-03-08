import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AuthHeaderProps {
    icon: LucideIcon;
    title: string;
    subtitle: string;
    iconClassName?: string;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({ icon: Icon, title, subtitle, iconClassName = "bg-primary-600 shadow-primary-500/20" }) => {
    return (
        <div className="text-center mb-10">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transition-transform hover:scale-110 duration-300 ${iconClassName}`}>
                <Icon size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{title}</h1>
            <p className="text-slate-400 mt-2 font-medium">{subtitle}</p>
        </div>
    );
};

export default AuthHeader;
