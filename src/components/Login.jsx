import React, { useState } from 'react';
// IMPORTATION CRITIQUE : On utilise ton instance configurée dans src/api/axios.js
import api from '../api/axios'; 

const Login = ({ setToken, setUser, togglePage }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        
        // Initialisation
        setError(''); 
        setIsLoading(true);

        try {
            // MODIFICATION : On appelle '/login'. 
            // Ton instance 'api' ajoutera automatiquement l'URL de Render ou de localhost.
            const response = await api.post('/login', {
                email,
                password
            });

            // DEBUG : Vérification de la structure en console
            console.log("Réponse Backend :", response.data);

            // 1. Stockage persistant du token
            localStorage.setItem('token', response.data.token);
            
            // 2. Mise à jour de l'état utilisateur
            if (response.data.user) {
                setUser(response.data.user);
            }
            
            // 3. Déclenchement du changement d'interface dans App.js
            setToken(response.data.token);

        } catch (err) {
            console.error("Erreur login:", err);
            
            // Gestion d'erreur améliorée
            let message = "Impossible de contacter le serveur.";
            if (err.response) {
                // Le serveur a répondu avec un code d'erreur (401, 422, etc.)
                message = err.response.data.message || "Email ou mot de passe incorrect.";
            } else if (err.request) {
                // La requête a été envoyée mais pas de réponse (Problème de connexion/CORS)
                message = "Le serveur ne répond pas. Vérifie ta connexion ou les réglages CORS.";
            }
            
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900 px-4 font-sans selection:bg-blue-100">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-slate-100 animate-fadeIn">
                
                {/* Logo Section */}
                <div className="flex justify-center mb-6">
                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black italic text-2xl shadow-xl shadow-blue-200">
                        S
                    </div>
                </div>
                
                <h2 className="text-3xl font-black text-center mb-2 text-slate-900 tracking-tighter uppercase">
                    SILVER <span className="text-blue-600">FIN</span>
                </h2>
                <p className="text-center text-slate-400 text-[9px] font-black mb-8 uppercase tracking-[0.3em]">Système de Gestion Financière</p>
                
                {error && (
                    <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl mb-6 text-center font-bold text-[10px] uppercase tracking-wider border border-rose-100 animate-bounce">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identifiant Email</label>
                        <input 
                            type="email" 
                            disabled={isLoading}
                            className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all font-bold text-slate-900 disabled:opacity-50"
                            placeholder="nom@entreprise.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="relative space-y-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mot de passe</label>
                        <input 
                            type={showPassword ? "text" : "password"} 
                            disabled={isLoading}
                            className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all font-bold text-slate-900 disabled:opacity-50"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-[38px] text-lg opacity-30 hover:opacity-100 transition-opacity"
                        >
                            {showPassword ? "🙈" : "👁️"}
                        </button>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className={`w-full p-5 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 text-[10px] mt-4 flex items-center justify-center gap-3
                            ${isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-blue-600 text-white'}`}
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Authentification...
                            </>
                        ) : (
                            "Accéder au tableau de bord"
                        )}
                    </button>
                </form>

                <div className="mt-10 text-center pt-6 border-t border-slate-50">
                    <button 
                        onClick={togglePage} 
                        disabled={isLoading}
                        className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors disabled:opacity-50"
                    >
                        Nouveau ici ? <span className="text-blue-600">Créer un compte</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;