import React, { useState } from 'react';
// IMPORTATION CRITIQUE : On utilise ton instance configurée dans src/api/axios.js
import api from '../api/axios'; 

const Register = ({ setToken, togglePage }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(''); 
        setIsLoading(true);
        
        try {
            // MODIFICATION : On utilise 'api.post' avec une route relative.
            // L'URL de Render (ou locale) est gérée automatiquement par l'instance.
            const response = await api.post('/register', formData);
            
            localStorage.setItem('token', response.data.token);
            setToken(response.data.token);
        } catch (err) {
            console.error("Détail technique de l'erreur:", err.response?.data);
            
            // --- DIAGNOSTIC INTELLIGENT ---
            if (err.response && err.response.data.errors) {
                // Erreurs de validation Laravel (ex: email déjà pris)
                const messages = Object.values(err.response.data.errors).flat();
                setError(messages[0]); 
            } else if (err.response && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                // Erreur de connexion (CORS ou serveur éteint)
                setError("Impossible de contacter le serveur. Vérifie ta connexion ou les réglages API.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900 px-4 font-sans">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-slate-100">
                <h2 className="text-2xl font-black text-center mb-6 text-slate-900 uppercase tracking-tighter">
                    Créer un compte <span className="text-blue-600">SILVER</span>
                </h2>
                
                {error && (
                    <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-600 p-3 mb-4 rounded shadow-sm text-[10px] font-bold uppercase tracking-wider animate-pulse">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="group">
                        <input 
                            type="text" 
                            placeholder="Nom complet ou Entreprise"
                            disabled={isLoading}
                            className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all font-bold text-slate-900 disabled:opacity-50"
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                        />
                    </div>
                    <div className="group">
                        <input 
                            type="email" 
                            placeholder="Email professionnel"
                            disabled={isLoading}
                            className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all font-bold text-slate-900 disabled:opacity-50"
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required
                        />
                    </div>
                    <div className="group">
                        <input 
                            type="password" 
                            placeholder="Mot de passe"
                            disabled={isLoading}
                            className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all font-bold text-slate-900 disabled:opacity-50"
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            required
                        />
                    </div>
                    <div className="group">
                        <input 
                            type="password" 
                            placeholder="Confirmer le mot de passe"
                            disabled={isLoading}
                            className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all font-bold text-slate-900 disabled:opacity-50"
                            onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})}
                            required
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className={`w-full p-5 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 text-[10px] flex items-center justify-center gap-3
                            ${isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-blue-600 text-white'}`}
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Création du compte...
                            </>
                        ) : (
                            "S'inscrire gratuitement"
                        )}
                    </button>
                </form>

                <p className="text-center mt-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Déjà un compte ?  
                    <button 
                        onClick={togglePage} 
                        disabled={isLoading}
                        className="text-blue-600 font-black ml-1 hover:underline transition-colors disabled:opacity-50"
                    >
                        Se connecter
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Register;