import React, { useEffect, useState } from 'react';
// IMPORTATION CRITIQUE : Utilise ton instance configurée
import api from '../api/axios'; 

const Reports = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAll = async () => {
        try {
            // Utilisation de l'instance 'api' : l'URL de Render et le Token sont gérés automatiquement
            const response = await api.get('/transactions/');
            
            // Tri par date (plus récent au plus ancien)
            const sorted = response.data.sort((a, b) => 
                new Date(b.transaction_date) - new Date(a.transaction_date)
            );
            setTransactions(sorted);
        } catch (error) {
            console.error("Erreur lors de la récupération des rapports:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    // --- LOGIQUE DES CONSEILS INTELLIGENTS ---
    const getSmartAdvice = () => {
        if (transactions.length === 0) return null;

        const totalRev = transactions.reduce((acc, t) => t.type === 'revenu' ? acc + parseFloat(t.amount || 0) : acc, 0);
        const totalExp = transactions.reduce((acc, t) => t.type === 'depense' ? acc + parseFloat(t.amount || 0) : acc, 0);
        const balance = totalRev - totalExp;
        const ratio = totalRev > 0 ? (totalExp / totalRev) * 100 : 0;

        if (balance < 0) {
            return {
                title: "Alerte Déficit",
                message: "Attention, vos dépenses dépassent vos revenus. Identifiez vos sorties non-essentielles pour stabiliser votre budget.",
                color: "text-rose-600 bg-rose-50 border-rose-100"
            };
        }
        if (ratio > 80) {
            return {
                title: "Zone de Vigilance",
                message: `Vous utilisez ${ratio.toFixed(0)}% de vos revenus. C'est élevé ! Pensez à constituer une épargne de sécurité.`,
                color: "text-amber-600 bg-amber-50 border-amber-100"
            };
        }
        return {
            title: "Gestion Optimale",
            message: "Félicitations ! Votre santé financière est excellente. C'est le moment idéal pour planifier de nouveaux projets.",
            color: "text-emerald-600 bg-emerald-50 border-emerald-100"
        };
    };

    const advice = getSmartAdvice();
    const handlePrint = () => window.print();

    // Calcul de la balance finale pour le footer du tableau
    const finalBalance = transactions.reduce((acc, t) => 
        t.type === 'revenu' ? acc + parseFloat(t.amount || 0) : acc - parseFloat(t.amount || 0), 0
    );

    if (loading) return <div className="p-20 text-center font-black text-gray-300 animate-pulse uppercase tracking-widest">Analyse des finances...</div>;

    return (
        <div className="space-y-6 animate-fadeIn font-sans">
            
            {/* ACTIONS - MASQUÉES À L'IMPRESSION */}
            <div className="flex justify-end print:hidden">
                <button 
                    onClick={handlePrint}
                    className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95"
                >
                    Exporter le relevé (PDF)
                </button>
            </div>

            {/* ZONE DE RAPPORT */}
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 print:shadow-none print:border-none print:p-0">
                
                {/* EN-TÊTE DU RAPPORT */}
                <div className="flex justify-between items-end border-b-4 border-slate-900 pb-6 mb-8">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">
                            SILVER <span className="text-blue-600">FIN</span>
                        </h1>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-2">
                            Système de Gestion Financière • {new Date().getFullYear()}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase text-slate-900">Relevé Intégral</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase italic">Édité le {new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                {/* BLOC CONSEILS INTELLIGENTS */}
                {advice && (
                    <div className={`p-6 rounded-3xl border mb-10 print:hidden ${advice.color} transition-all duration-500 shadow-sm`}>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-xl">💡</span>
                            <h3 className="font-black uppercase text-[10px] tracking-widest">{advice.title}</h3>
                        </div>
                        <p className="text-xs font-bold leading-relaxed">{advice.message}</p>
                    </div>
                )}

                {/* TABLEAU DES TRANSACTIONS */}
                <div className="min-h-[400px]">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50 print:bg-gray-100">
                                <th className="py-4 px-4 text-left text-[10px] font-black uppercase text-slate-600 border border-slate-200">Date</th>
                                <th className="py-4 px-4 text-left text-[10px] font-black uppercase text-slate-600 border border-slate-200">Désignation</th>
                                <th className="py-4 px-4 text-left text-[10px] font-black uppercase text-slate-600 border border-slate-200">Flux</th>
                                <th className="py-4 px-4 text-right text-[10px] font-black uppercase text-slate-600 border border-slate-200">Montant</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {transactions.length > 0 ? transactions.map((t) => (
                                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="py-4 px-4 text-[11px] font-bold text-slate-500 border-x border-slate-50 print:border-slate-100">
                                        {new Date(t.transaction_date).toLocaleDateString()}
                                    </td>
                                    <td className="py-4 px-4 text-xs font-black text-slate-800 uppercase tracking-tight border-x border-slate-50 print:border-slate-100">
                                        {t.description || "Opération diverse"}
                                    </td>
                                    <td className="py-4 px-4 border-x border-slate-50 print:border-slate-100">
                                        <span className={`text-[9px] font-black px-2 py-1 rounded border ${t.type === 'revenu' ? 'border-emerald-200 text-emerald-600' : 'border-rose-200 text-rose-600'}`}>
                                            {t.type.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className={`py-4 px-4 text-xs font-black text-right border-x border-slate-50 print:border-slate-100 ${t.type === 'revenu' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {t.type === 'revenu' ? '+' : '-'} {parseFloat(t.amount).toLocaleString()} F
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="py-20 text-center text-[10px] font-black text-slate-300 uppercase italic">
                                        Aucune transaction enregistrée
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot>
                            <tr className="bg-slate-900 text-white">
                                <td colSpan="3" className="py-4 px-4 text-[10px] font-black uppercase text-right tracking-widest">Balance Finale</td>
                                <td className="py-4 px-4 text-sm font-black text-right">
                                    {finalBalance.toLocaleString()} F
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* BAS DE PAGE DU RAPPORT */}
                <div className="mt-16 pt-8 flex justify-between items-center opacity-50">
                    <p className="text-[9px] font-black uppercase tracking-widest">Silver Fin &copy; 2026</p>
                    <div className="w-32 border-t-2 border-slate-900 pt-2 text-center">
                        <p className="text-[8px] font-black uppercase">Visa Système</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;