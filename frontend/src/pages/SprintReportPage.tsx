import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ChevronLeft, Download, Share2, TrendingUp,
    CheckCircle, XCircle, Clock, Plus, BarChart2
} from 'lucide-react';
import api from '../services/api';

interface SprintReport {
    id: string;
    velocity: number;
    completionRate: number;
    completedCards: number;
    incompleteCards: number;
    addedMidSprint: number;
    avgCycleTime: number | null;
    shareToken: string;
    generatedAt: string;
    sprint: {
        name: string;
        goal: string;
        teamId: string;
        team: {
            name: string;
        }
    }
}

const SprintReportPage: React.FC = () => {
    const { reportId } = useParams();
    const [report, setReport] = useState<SprintReport | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const { data } = await api.get(`/reports/${reportId}`);
                setReport(data);
            } catch (error) {
                console.error('Erro ao buscar relatório', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchReport();
    }, [reportId]);

    const handleCopyLink = () => {
        if (!report) return;
        const url = `${window.location.origin}/reports/share/${report.shareToken}`;
        navigator.clipboard.writeText(url);
        alert('Link copiado para a área de transferência!');
    };

    if (isLoading) return <div className="h-screen bg-[#0f172a] flex items-center justify-center text-slate-500">Gerando relatório...</div>;
    if (!report) return <div className="h-screen bg-[#0f172a] flex items-center justify-center text-white">Relatório não encontrado.</div>;

    return (
        <div className="min-h-screen bg-[#0f172a] text-white p-8">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <header className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link to={`/teams/${report.sprint.teamId}/board`} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                            <ChevronLeft size={20} />
                        </Link>
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{report.sprint.team.name}</p>
                            <h1 className="text-2xl font-black">Report: {report.sprint.name}</h1>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleCopyLink}
                            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                        >
                            <Share2 size={16} /> Share Link
                        </button>
                        <button
                            onClick={() => window.print()}
                            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                        >
                            <Download size={16} /> Export PDF
                        </button>
                    </div>
                </header>

                {/* Summary Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-slate-900/50 border border-white/5 p-6 rounded-3xl">
                        <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 mb-4">
                            <TrendingUp size={20} />
                        </div>
                        <p className="text-sm text-slate-500 font-bold uppercase">Velocity</p>
                        <h3 className="text-3xl font-black mt-1">{report.velocity} <span className="text-sm font-normal text-slate-500">pts</span></h3>
                    </div>

                    <div className="bg-slate-900/50 border border-white/5 p-6 rounded-3xl">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4">
                            <BarChart2 size={20} />
                        </div>
                        <p className="text-sm text-slate-500 font-bold uppercase">Completion</p>
                        <h3 className="text-3xl font-black mt-1">{report.completionRate.toFixed(1)}%</h3>
                    </div>

                    <div className="bg-slate-900/50 border border-white/5 p-6 rounded-3xl">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4">
                            <Plus size={20} />
                        </div>
                        <p className="text-sm text-slate-500 font-bold uppercase">Added Mid-Sprint</p>
                        <h3 className="text-3xl font-black mt-1">{report.addedMidSprint}</h3>
                    </div>

                    <div className="bg-slate-900/50 border border-white/5 p-6 rounded-3xl">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4">
                            <Clock size={20} />
                        </div>
                        <p className="text-sm text-slate-500 font-bold uppercase">Avg Cycle Time</p>
                        <h3 className="text-3xl font-black mt-1">{report.avgCycleTime ? `${report.avgCycleTime.toFixed(1)}d` : '-'}</h3>
                    </div>
                </div>

                {/* Detailed Sections */}
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-slate-900/50 border border-white/5 p-8 rounded-3xl h-fit">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <CheckCircle className="text-green-500" size={20} />
                            Completed Tasks
                        </h3>
                        <div className="text-4xl font-black mb-2">{report.completedCards}</div>
                        <p className="text-slate-500 text-sm">Tasks successfully moved to the "Done" column before sprint end.</p>
                    </div>

                    <div className="bg-slate-900/50 border border-white/5 p-8 rounded-3xl h-fit">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <XCircle className="text-red-500" size={20} />
                            Incomplete Tasks
                        </h3>
                        <div className="text-4xl font-black mb-2">{report.incompleteCards}</div>
                        <p className="text-slate-500 text-sm">Tasks that were not finished and have been moved back to the backlog.</p>
                    </div>
                </div>

                {/* Print Styles */}
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @media print {
                        body { background: white !important; color: black !important; }
                        .bg-slate-900\\/50 { background: white !important; border: 1px solid #eee !important; }
                        button, a { display: none !important; }
                        h1, h3, p { color: black !important; }
                    }
                `}} />
            </div>
        </div>
    );
};

export default SprintReportPage;
