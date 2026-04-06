import React, { useState, useEffect } from 'react';
import api from '../api/axios'; // On utilise l'instance centralisée

const AddTransaction = ({ onTransactionAdded }) => { 
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        amount: '',
        type: 'revenu',
        description: '',
        category_id: '',
        transaction_date: new Date().toISOString().split('T')[0]
    });

    // 1. Charger les catégories via l'instance API
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // L'URL est simplifiée, le token est ajouté par l'intercepteur
                const res = await api.get('/categories');
                const dataReceived = Array.isArray(res.data) ? res.data : (res.data.data || []);
                setCategories(dataReceived);
            } catch (err) {
                console.error("Erreur API catégories :", err.response?.data || err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    // 2. Envoyer les données
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.category_id) {
            alert("⚠️ Veuillez choisir une catégorie.");
            return;
        }

        try {
            // Appel simplifié à l'API
            await api.post('/transactions', formData);
            
            alert("✅ Opération enregistrée !");

            // Rafraîchissement du Dashboard
            if (onTransactionAdded) {
                onTransactionAdded(); 
            }
            
            // Réinitialisation du formulaire
            setFormData({
                amount: '',
                type: formData.type, 
                description: '',
                category_id: '',
                transaction_date: new Date().toISOString().split('T')[0]
            });

        } catch (err) {
            const errorMsg = err.response?.data?.message || "Erreur de validation";
            alert("❌ " + errorMsg);
        }
    };

    return (
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center uppercase tracking-tight">
                <span className="bg-blue-600 w-2 h-6 rounded-full mr-3"></span>
                Nouvelle Opération
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* SÉLECTEUR DE TYPE */}
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        type="button"
                        onClick={() => setFormData({...formData, type: 'revenu', category_id: ''})}
                        className={`p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest border-2 transition-all ${formData.type === 'revenu' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-slate-50 border-transparent text-slate-400'}`}
                    >
                        💰 Entrée
                    </button>
                    <button 
                        type="button"
                        onClick={() => setFormData({...formData, type: 'depense', category_id: ''})}
                        className={`p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest border-2 transition-all ${formData.type === 'depense' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-slate-50 border-transparent text-slate-400'}`}
                    >
                        🛒 Sortie
                    </button>
                </div>

                {/* SÉLECTEUR DE CATÉGORIE */}
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Catégorie</label>
                    <select 
                        className="w-full p-4 mt-2 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none bg-slate-50 font-bold text-slate-700 appearance-none"
                        value={formData.category_id}
                        onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                        required
                    >
                        <option value="">-- Sélectionner --</option>
                        {categories
                            .filter(c => c.type === formData.type)
                            .map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))
                        }
                    </select>
                </div>

                {/* MONTANT ET DATE */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Montant</label>
                        <input 
                            type="number" 
                            placeholder="0.00"
                            className="w-full p-4 mt-2 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-bold"
                            value={formData.amount}
                            onChange={(e) => setFormData({...formData, amount: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                        <input 
                            type="date" 
                            className="w-full p-4 mt-2 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-bold"
                            value={formData.transaction_date}
                            onChange={(e) => setFormData({...formData, transaction_date: e.target.value})}
                            required
                        />
                    </div>
                </div>

                {/* DESCRIPTION */}
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Désignation</label>
                    <input 
                        type="text" 
                        placeholder="Ex: Salaire, Loyer..." 
                        className="w-full p-4 mt-2 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-bold"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] hover:bg-blue-600 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                >
                    {loading ? 'Chargement...' : 'Enregistrer l\'opération'}
                </button>
            </form>
        </div>
    );
};

export default AddTransaction;