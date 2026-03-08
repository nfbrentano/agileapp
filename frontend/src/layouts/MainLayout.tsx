import React from 'react';
import Sidebar from '../components/Sidebar';

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-[#0f172a] flex">
            <Sidebar />
            <main className="flex-1 ml-72 min-h-screen relative overflow-y-auto">
                {/* Decorative background elements that persist across pages */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                    <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary-500/5 blur-[120px] rounded-full" />
                    <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-indigo-500/5 blur-[120px] rounded-full" />
                </div>

                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
