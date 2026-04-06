import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler
);

const DashboardSummary = ({ onGoToAdd }) => {
    const [summary, setSummary] = useState({
        total_revenu: 0,
        total_depense: 0,
        solde: 0,
        ratio_depense: 0,
        recent_transactions: [],
        chartData: { labels: [], values: [] },
        sante_financiere: {
            alerte: false,
            titre: "Analyse",
            conseil: "Chargement des données...",
            color: "bg-slate-50 border-slate-100 text-slate-600"
        }
    });

    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await axios.get('http://127.0.0.1:8000/api/transactions/summary', {
                headers: { Authorization: `Bearer ${token}` }
            });

            const { revenues, expenses, recent_transactions } = response.data;
            const rev = parseFloat(revenues) || 0;
            const exp = parseFloat(expenses) || 0;
            const solde = rev - exp;
            const ratio = rev > 0 ? Math.round((exp / rev) * 100) : 0;

            // Logique de Conseil Intelligent
            let sante = {
                alerte: false,
                titre: "Gestion Saine",
                conseil: "Votre santé financière est excellente. C'est le moment idéal pour planifier vos futurs projets.",
                color: "bg-emerald-50 border-emerald-100 text-emerald-700"
            };

            if (solde < 0) {
                sante = {
                    alerte: true,
                    titre: "Alerte Déficit",
                    conseil: "Attention, votre solde est négatif. Réduisez vos dépenses non-essentielles immédiatement.",
                    color: "bg-rose-50 border-rose-100 text-rose-700"
                };
            } else if (ratio > 75) {
                sante = {
                    alerte: true,
                    titre: "Zone de Vigilance",
                    conseil: "Vos dépenses absorbent plus de 75% de vos revenus. Restez vigilant sur vos prochaines transactions.",
                    color: "bg-amber-50 border-amber-100 text-amber-700"
                };
            }

            const sortedTrans = [...(recent_transactions || [])].reverse();
            let currentBalance = 0;
            const historyLabels = sortedTrans.map(t => 
                new Date(t.transaction_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
            );
            const historyValues = sortedTrans.map(t => {
                currentBalance += t.type === 'revenu' ? parseFloat(t.amount) : -parseFloat(t.amount);
                return currentBalance;
            });

            setSummary({
                total_revenu: rev,
                total_depense: exp,
                solde: solde,
                ratio_depense: ratio,
                recent_transactions: recent_transactions || [],
                chartData: { labels: historyLabels, values: historyValues },
                sante_financiere: sante
            });
        } catch (error) {
            console.error("Erreur API:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Supprimer cette opération ?")) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://127.0.0.1:8000/api/transactions/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch (error) {
            alert("Erreur lors de la suppression");
        }
    };

    const doughnutData = {
        labels: ['Revenus', 'Dépenses'],
        datasets: [{
            data: [summary.total_revenu, summary.total_depense],
            backgroundColor: ['#10b981', '#ef4444'],
            borderWidth: 0,
            borderRadius: 5,
            cutout: '75%'
        }]
    };

    const lineData = {
        labels: summary.chartData.labels,
        datasets: [{
            label: 'Solde',
            data: summary.chartData.values,
            fill: true,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.05)',
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#3b82f6'
        }]
    };

    if (loading) return (
        <div className="p-20 text-center font-black text-slate-300 animate-pulse uppercase tracking-[0.3em]">
            Silver Fin...
        </div>
    );

    return (
        <div className="space-y-8 animate-fadeIn">
            
            {/* HEADER - Épuré et Professionnel */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
                        Dashboard <span className="text-blue-600">SILVER</span>
                    </h2>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Gestion de Trésorerie & Analyse</p>
                </div>
                
                <button 
                    onClick={onGoToAdd}
                    className="w-full sm:w-auto bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95"
                >
                    + Nouvelle Opération
                </button>
            </header>
            
            {/* RÉSUMÉ DES SOLDES */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                    <p className="text-[10px] text-gray-400 uppercase font-black mb-2 tracking-widest">Total Revenus</p>
                    <p className="text-2xl font-black text-emerald-600">{summary.total_revenu.toLocaleString()} F</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                    <p className="text-[10px] text-gray-400 uppercase font-black mb-2 tracking-widest">Total Dépenses</p>
                    <p className="text-2xl font-black text-rose-600">{summary.total_depense.toLocaleString()} F</p>
                </div>
                <div className="bg-blue-600 p-6 rounded-[2rem] shadow-xl shadow-blue-100 text-white">
                    <p className="text-[10px] uppercase font-black mb-2 opacity-80 tracking-widest">Solde Actuel</p>
                    <p className="text-2xl font-black">{summary.solde.toLocaleString()} F</p>
                </div>
            </div>

            {/* GRAPHIQUES */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase mb-6 tracking-widest">Répartition Flux</h3>
                    <div className="w-full h-48">
                        <Doughnut data={doughnutData} options={{ plugins: { legend: { display: false } } }} />
                    </div>
                    <div className="mt-6 flex flex-col w-full gap-2">
                        <div className="flex justify-between items-center text-[10px] font-black bg-emerald-50 text-emerald-700 p-3 rounded-2xl">
                            <span>REVENUS</span>
                            <span>{summary.total_revenu.toLocaleString()} F</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-black bg-rose-50 text-rose-700 p-3 rounded-2xl">
                            <span>DÉPENSES</span>
                            <span>{summary.total_depense.toLocaleString()} F</span>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase mb-6 tracking-widest">Évolution du Solde</h3>
                    <div className="h-56">
                        <Line 
                            data={lineData} 
                            options={{ 
                                maintainAspectRatio: false, 
                                scales: { x: { grid: { display: false } }, y: { display: false } }, 
                                plugins: { legend: { display: false } } 
                            }} 
                        />
                    </div>
                </div>
            </div>

            {/* CONSEIL ET HISTORIQUE */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
                <div className={`p-8 rounded-[2.5rem] border-2 flex flex-col justify-between transition-all duration-500 ${summary.sante_financiere.color}`}>
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl">{summary.sante_financiere.alerte ? '⚠️' : '💡'}</span>
                            <h3 className="font-black uppercase text-[10px] tracking-[0.2em]">{summary.sante_financiere.titre}</h3>
                        </div>
                        <p className="text-sm font-bold leading-relaxed italic">
                            "{summary.sante_financiere.conseil}"
                        </p>
                    </div>
                    <div className="mt-8 space-y-3">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                            <span>Taux de consommation</span>
                            <span className={summary.sante_financiere.alerte ? 'text-rose-600' : 'text-emerald-600'}>
                                {summary.ratio_depense}%
                            </span>
                        </div>
                        <div className="h-3 bg-white rounded-full overflow-hidden shadow-inner">
                            <div 
                                style={{ width: `${Math.min(summary.ratio_depense, 100)}%` }}
                                className={`h-full transition-all duration-[1500ms] ease-out ${summary.ratio_depense > 75 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex justify-between items-center text-slate-800">
                        <h3 className="font-black uppercase text-[10px] tracking-widest">Dernières Activités</h3>
                        <span className="text-[9px] font-bold text-gray-300 uppercase">Historique</span>
                    </div>
                    <div className="divide-y divide-gray-50 max-h-[300px] overflow-y-auto custom-scrollbar">
                        {summary.recent_transactions.length > 0 ? (
                            summary.recent_transactions.map((t) => (
                                <div key={t.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-all group">
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black ${t.type === 'revenu' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                            {t.type === 'revenu' ? '↑' : '↓'}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-800 text-xs uppercase tracking-tighter">{t.description || "Opération"}</p>
                                            <p className="text-[9px] text-gray-400 font-bold uppercase">{new Date(t.transaction_date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`font-black text-xs ${t.type === 'revenu' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {t.type === 'revenu' ? '+' : '-'} {parseFloat(t.amount).toLocaleString()} F
                                        </span>
                                        <button onClick={() => handleDelete(t.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-rose-500 transition-all">🗑️</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="p-10 text-center text-[10px] font-bold text-gray-300 uppercase">Aucune activité récente</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardSummary;