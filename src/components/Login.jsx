import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ setToken, setUser, togglePage }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(''); 
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/login', {
                email,
                password
            });

            // DEBUG : Vérifie ici si 'role' apparaît bien dans la console (F12)
            console.log("Réponse Backend :", response.data);

            // 1. Stockage du token
            localStorage.setItem('token', response.data.token);
            
            // 2. Mise à jour de l'utilisateur (AVANT le token pour préparer la redirection)
            if (response.data.user) {
                setUser(response.data.user);
            }
            
            // 3. Déclenchement du changement d'interface dans App.js
            setToken(response.data.token);

        } catch (err) {
            console.error("Erreur login:", err);
            setError("Email ou mot de passe incorrect.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900 px-4 font-sans">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-slate-100">
                {/* Logo Section */}
                <div className="flex justify-center mb-6">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black italic text-xl shadow-lg shadow-blue-200 animate-pulse">
                        S
                    </div>
                </div>
                
                <h2 className="text-3xl font-black text-center mb-2 text-slate-900 tracking-tighter uppercase">
                    SILVER <span className="text-blue-600">FIN</span>
                </h2>
                <p className="text-center text-slate-400 text-xs font-bold mb-8 uppercase tracking-widest">Accès Sécurisé</p>
                
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-center font-bold text-[10px] uppercase tracking-wider border border-red-100 animate-shake">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Professionnel</label>
                        <input 
                            type="email" 
                            className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all font-bold text-slate-900"
                            placeholder="votre@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="relative">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Mot de passe</label>
                        <input 
                            type={showPassword ? "text" : "password"} 
                            className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all font-bold text-slate-900"
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

                    <button type="submit" className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all active:scale-95 text-xs mt-4">
                        Entrer dans le système
                    </button>
                </form>

                <div className="mt-8 text-center pt-6 border-t border-slate-50">
                    <button 
                        onClick={togglePage} 
                        className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors"
                    >
                        Pas encore de compte ? S'inscrire
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;