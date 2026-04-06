import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Utilisation de useCallback pour stabiliser la fonction
    const fetchAdminStats = useCallback(async () => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            setError("Session expirée. Veuillez vous reconnecter.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null); // Réinitialise l'erreur avant de tenter l'appel
            
            const res = await axios.get('http://127.0.0.1:8000/api/admin/stats', {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            setStats(res.data);
        } catch (err) {
            console.error("Erreur Admin API:", err);
            // On récupère le message d'erreur du backend s'il existe
            const message = err.response?.data?.message || "Connexion au serveur impossible.";
            setError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAdminStats();
    }, [fetchAdminStats]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Synchronisation sécurisée...</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="max-w-md mx-auto mt-10">
                <div className="bg-red-50 border border-red-100 p-8 rounded-[2.5rem] text-center shadow-sm">
                    <div className="text-4xl mb-4">🛡️</div>
                    <h3 className="text-red-900 font-black uppercase tracking-tight mb-2">Erreur d'accès</h3>
                    <p className="text-red-600/70 text-sm font-bold mb-6 leading-relaxed">{error}</p>
                    <button 
                        onClick={fetchAdminStats}
                        className="bg-red-600 text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-700 transition-all active:scale-95"
                    >
                        Réessayer la connexion
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-reveal pb-10">
            {/* HEADER ADMIN */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter uppercase leading-none">
                        Console <span className="text-blue-600">Admin</span>
                    </h2>
                    <div className="flex items-center mt-2 space-x-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                            Système : <span className="text-slate-900">{stats.system_status}</span>
                        </p>
                    </div>
                </div>
                <button 
                    onClick={fetchAdminStats}
                    className="group bg-white border border-slate-200 p-4 rounded-2xl hover:border-blue-600 transition-all shadow-sm active:scale-90"
                    title="Rafraîchir les données"
                >
                    <span className="block group-hover:rotate-180 transition-transform duration-500">🔄</span>
                </button>
            </div>

            {/* GRILLE DE STATS PRINCIPALES */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Utilisateurs" value={stats.total_users} icon="👥" color="bg-blue-50 text-blue-600" />
                <StatCard title="Transactions" value={stats.total_transactions} icon="📝" color="bg-purple-50 text-purple-600" />
                <StatCard title="Dettes" value={stats.total_debts} icon="⏳" color="bg-orange-50 text-orange-600" />
                <StatCard title="Volume Global" value={`${Number(stats.total_volume).toLocaleString()} FCFA`} icon="💰" color="bg-emerald-50 text-emerald-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LISTE DES DERNIERS INSCRITS */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-black uppercase text-[10px] tracking-[0.2em] text-slate-400 font-sans">Dernières inscriptions</h3>
                        <span className="bg-slate-50 text-slate-400 text-[9px] px-3 py-1 rounded-full font-bold uppercase">Live</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-separate border-spacing-y-2">
                            <thead>
                                <tr className="text-slate-400 text-[9px] uppercase tracking-[0.15em]">
                                    <th className="pb-4 font-black pl-2">Utilisateur</th>
                                    <th className="pb-4 font-black">Coordonnées</th>
                                    <th className="pb-4 font-black text-right pr-2">Date d'arrivée</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recent_users.map((u, i) => (
                                    <tr key={i} className="group hover:bg-slate-50 transition-colors">
                                        <td className="py-4 pl-2 font-black text-slate-900 text-sm">{u.name}</td>
                                        <td className="py-4 text-slate-500 text-xs font-medium">{u.email}</td>
                                        <td className="py-4 text-right pr-2 text-slate-400 text-[11px] font-bold">
                                            {new Date(u.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ÉTAT TECHNIQUE DU SERVEUR */}
                <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-slate-200">
                    <h3 className="font-black uppercase text-[10px] tracking-[0.2em] mb-10 text-slate-500">Infrastructure</h3>
                    <div className="space-y-6">
                        <div className="flex justify-between items-center border-b border-white/5 pb-4">
                            <span className="text-slate-500 text-[10px] font-black uppercase">Heure Locale</span>
                            <span className="text-xs font-mono font-bold">{stats.server_time.split(' ')[1]}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-white/5 pb-4">
                            <span className="text-slate-500 text-[10px] font-black uppercase">ID Administrateur</span>
                            <span className="text-[10px] font-mono text-blue-400 truncate ml-4">{stats.admin_identity}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-white/5 pb-4">
                            <span className="text-slate-500 text-[10px] font-black uppercase">Version API</span>
                            <span className="text-[10px] font-bold bg-white/5 px-2 py-1 rounded">v1.3.0-stable</span>
                        </div>
                        
                        <div className="mt-12 p-6 bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl shadow-inner shadow-blue-400/20">
                            <div className="text-center">
                                <p className="text-[9px] text-blue-100 font-black uppercase tracking-widest mb-1">Protection Active</p>
                                <p className="text-xs text-white font-medium leading-relaxed">
                                    Toutes les données sont chiffrées de bout en bout via AES-256.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, color }) => (
    <div className="group bg-white p-6 rounded-[2.2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center text-2xl mb-5 shadow-sm group-hover:scale-110 transition-transform`}>
            {icon}
        </div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">{title}</p>
        <p className="text-2xl font-black text-slate-900 mt-1 tracking-tight">{value}</p>
    </div>
);

export default AdminDashboard;