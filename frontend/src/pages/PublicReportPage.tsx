import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { TrendingUp, BarChart2, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';

// Simplified version for public stakeholders
const PublicReportPage: React.FC = () => {
    const { token } = useParams();
    const [report, setReport] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/api/reports/${token}`);
                setReport(response.data);
            } catch (error) {
                console.error('Erro ao buscar relatório', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchReport();
    }, [token]);

    if (isLoading) return <div className="h-screen bg-white flex items-center justify-center text-slate-400">Loading agile report...</div>;
    if (!report) return <div className="h-screen bg-white flex items-center justify-center text-slate-800 font-bold">Report not found or expired.</div>;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <header className="border-b border-slate-200 pb-8 flex justify-between items-end">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{report.sprint.team.name} • Agile Report</p>
                        <h1 className="text-3xl font-black text-slate-900">Sprint Summary: {report.sprint.name}</h1>
                        <p className="text-slate-500 mt-1">Goal: {report.sprint.goal || 'Continuous delivery of value.'}</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <TrendingUp className="text-green-600 mb-2" size={18} />
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Velocity</p>
                        <p className="text-2xl font-black">{report.velocity} pts</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <BarChart2 className="text-blue-600 mb-2" size={18} />
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Completion</p>
                        <p className="text-2xl font-black">{report.completionRate.toFixed(1)}%</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <Plus className="text-purple-600 mb-2" size={18} />
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Stability</p>
                        <p className="text-2xl font-black">{report.addedMidSprint} added</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <Clock className="text-amber-600 mb-2" size={18} />
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Avg Cycle</p>
                        <p className="text-2xl font-black">{report.avgCycleTime ? `${report.avgCycleTime.toFixed(1)}d` : '-'}</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-2 mb-4">
                            <CheckCircle className="text-green-500" size={16} />
                            <span className="font-bold">Completed Tasks</span>
                        </div>
                        <div className="text-3xl font-black">{report.completedCards}</div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-2 mb-4">
                            <XCircle className="text-red-500" size={16} />
                            <span className="font-bold">Incomplete Tasks</span>
                        </div>
                        <div className="text-3xl font-black">{report.incompleteCards}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicReportPage;
