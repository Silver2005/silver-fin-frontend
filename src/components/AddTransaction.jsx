import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Ajout de la prop onTransactionAdded
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

    // 1. Charger les catégories (Ton code existant est parfait)
    useEffect(() => {
        const fetchCategories = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const res = await axios.get('http://127.0.0.1:8000/api/categories', {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });
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
        const token = localStorage.getItem('token');

        if (!formData.category_id) {
            alert("⚠️ Veuillez choisir une catégorie.");
            return;
        }

        try {
            await axios.post('http://127.0.0.1:8000/api/transactions', formData, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            
            alert("✅ Opération enregistrée !");

            // --- ÉTAPE CRUCIALE POUR LE DASHBOARD ---
            if (onTransactionAdded) {
                onTransactionAdded(); // On dit au Dashboard de se rafraîchir
            }
            // ----------------------------------------
            
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
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            {/* ... Tout le reste de ton JSX (formulaire, boutons, etc.) reste identique ... */}
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <span className="bg-blue-500 w-2 h-6 rounded-full mr-2"></span>
                Nouvelle Opération
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        type="button"
                        onClick={() => setFormData({...formData, type: 'revenu', category_id: ''})}
                        className={`p-3 rounded-xl font-bold border-2 transition-all ${formData.type === 'revenu' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
                    >
                        💰 Entrée
                    </button>
                    <button 
                        type="button"
                        onClick={() => setFormData({...formData, type: 'depense', category_id: ''})}
                        className={`p-3 rounded-xl font-bold border-2 transition-all ${formData.type === 'depense' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
                    >
                        🛒 Sortie
                    </button>
                </div>

                {/* SÉLECTEUR DE CATÉGORIE */}
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Catégorie</label>
                    <select 
                        className="w-full p-3 mt-1 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        value={formData.category_id}
                        onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                        required
                    >
                        <option value="">-- Choisir --</option>
                        {categories
                            .filter(c => c.type === formData.type)
                            .map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))
                        }
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <input 
                        type="number" 
                        placeholder="Montant"
                        className="p-3 border border-gray-200 rounded-xl outline-none"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        required
                    />
                    <input 
                        type="date" 
                        className="p-3 border border-gray-200 rounded-xl outline-none"
                        value={formData.transaction_date}
                        onChange={(e) => setFormData({...formData, transaction_date: e.target.value})}
                        required
                    />
                </div>

                <input 
                    type="text" 
                    placeholder="Désignation" 
                    className="w-full p-3 border border-gray-200 rounded-xl outline-none"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                />

                <button 
                    type="submit" 
                    className="w-full bg-slate-900 text-white p-4 rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg active:scale-95"
                >
                    ENREGISTRER
                </button>
            </form>
        </div>
    );
};

export default AddTransaction;