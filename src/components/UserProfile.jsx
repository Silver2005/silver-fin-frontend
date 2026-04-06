import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserProfile = () => {
    const [user, setUser] = useState({ name: '', email: '' });
    const [formData, setFormData] = useState({ name: '', email: '', password: '', password_confirmation: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await axios.get('http://127.0.0.1:8000/api/user', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(res.data);
            setFormData({ ...formData, name: res.data.name, email: res.data.email });
        } catch (err) {
            console.error("Erreur chargement profil", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        try {
            const res = await axios.put('http://127.0.0.1:8000/api/user', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(res.data.user);
            setIsEditing(false);
            setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
            setFormData(prev => ({ ...prev, password: '', password_confirmation: '' }));
            setTimeout(() => setMessage({ type: '', text: '' }), 4000);
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Erreur lors de la mise à jour";
            setMessage({ type: 'error', text: errorMsg });
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-black text-slate-400 text-[10px] uppercase tracking-[0.3em]">Chargement Silver Fin</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-reveal pb-20">
            
            {/* EN-TÊTE PREMIUM - CARTE D'IDENTITÉ */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute -right-10 -top-10 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"></div>
                
                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-3xl font-black shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    
                    <div className="text-center md:text-left flex-grow">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-2 block">Membre Vérifié</span>
                        <h2 className="text-4xl font-black tracking-tighter mb-1">{user.name}</h2>
                        <p className="text-slate-400 font-medium">{user.email}</p>
                    </div>

                    {!isEditing && (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="bg-white/10 hover:bg-white text-white hover:text-slate-900 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-white/10"
                        >
                            Modifier le profil
                        </button>
                    )}
                </div>
            </div>

            {/* MESSAGES D'ALERTE */}
            {message.text && (
                <div className={`p-5 rounded-2xl text-sm font-bold animate-fadeIn border ${
                    message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-rose-50 text-rose-800 border-rose-100'
                }`}>
                    {message.type === 'success' ? '✅ ' : '🚨 '} {message.text}
                </div>
            )}

            {/* CONTENU PRINCIPAL */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-1">
                    <div className="sticky top-24 space-y-4">
                        <div className="h-1 w-12 bg-blue-600"></div>
                        <h3 className="text-2xl font-black tracking-tighter text-slate-900 uppercase">Informations</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Gérez vos accès et vos informations de sécurité. Laissez les champs de mot de passe vides si vous ne souhaitez pas les modifier.
                        </p>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 md:p-10 shadow-sm">
                        {isEditing ? (
                            <form onSubmit={handleUpdate} className="space-y-8">
                                <div className="space-y-6">
                                    {/* NOM */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nom complet</label>
                                        <input 
                                            type="text" 
                                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-600/20 outline-none font-bold text-slate-800 transition-all"
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            required
                                        />
                                    </div>

                                    {/* EMAIL */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Adresse Email</label>
                                        <input 
                                            type="email" 
                                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-600/20 outline-none font-bold text-slate-800 transition-all"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            required
                                        />
                                    </div>

                                    {/* SÉCURITÉ */}
                                    <div className="pt-6 border-t border-slate-50 space-y-4">
                                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Sécurité du compte</span>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input 
                                                type="password" 
                                                placeholder="Nouveau mot de passe"
                                                className="p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-medium focus:bg-white transition-all"
                                                value={formData.password}
                                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                            />
                                            <input 
                                                type="password" 
                                                placeholder="Confirmer"
                                                className="p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-medium focus:bg-white transition-all"
                                                value={formData.password_confirmation}
                                                onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button 
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-100 text-slate-400 hover:bg-slate-50 transition-all"
                                    >
                                        Annuler
                                    </button>
                                    <button 
                                        type="submit"
                                        className="flex-1 p-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 shadow-xl shadow-blue-200 transition-all"
                                    >
                                        Sauvegarder
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nom utilisateur</p>
                                        <p className="text-xl font-bold text-slate-900">{user.name}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</p>
                                        <p className="text-xl font-bold text-slate-900">{user.email}</p>
                                    </div>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                    <p className="text-slate-400 text-xs font-medium text-center">
                                        Vos données sont chiffrées et sécurisées par le protocole Silver Fin.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;