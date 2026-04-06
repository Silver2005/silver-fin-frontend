import React, { useState } from 'react';
import axios from 'axios';

const Register = ({ setToken, togglePage }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: ''
    });
    const [error, setError] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(''); // On vide l'erreur précédente
        
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/register', formData);
            localStorage.setItem('token', response.data.token);
            setToken(response.data.token);
        } catch (err) {
            // --- DIAGNOSTIC INTELLIGENT ---
            if (err.response && err.response.data.errors) {
                // On récupère le premier message d'erreur précis de Laravel
                const messages = Object.values(err.response.data.errors).flat();
                setError(messages[0]); 
            } else if (err.response && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError("Le serveur Laravel ne répond pas. Vérifie 'php artisan serve'");
            }
            console.error("Détail technique de l'erreur:", err.response?.data);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-silver-primary px-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 uppercase tracking-tight">
                    Créer un compte <span className="text-silver-accent">SILVER</span>
                </h2>
                
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 mb-4 rounded shadow-sm text-xs font-bold animate-pulse">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="group">
                        <input 
                            type="text" placeholder="Nom complet ou Entreprise"
                            className="w-full p-3 border-2 border-gray-100 rounded-xl outline-none focus:border-silver-accent transition-all"
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                        />
                    </div>
                    <div className="group">
                        <input 
                            type="email" placeholder="Email professionnel"
                            className="w-full p-3 border-2 border-gray-100 rounded-xl outline-none focus:border-silver-accent transition-all"
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required
                        />
                    </div>
                    <div className="group">
                        <input 
                            type="password" placeholder="Mot de passe"
                            className="w-full p-3 border-2 border-gray-100 rounded-xl outline-none focus:border-silver-accent transition-all"
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            required
                        />
                    </div>
                    <div className="group">
                        <input 
                            type="password" placeholder="Confirmer le mot de passe"
                            className="w-full p-3 border-2 border-gray-100 rounded-xl outline-none focus:border-silver-accent transition-all"
                            onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})}
                            required
                        />
                    </div>
                    
                    <button type="submit" className="w-full bg-silver-accent text-white p-4 rounded-xl font-bold shadow-lg hover:bg-emerald-600 active:scale-95 transition-all">
                        S'inscrire gratuitement
                    </button>
                </form>

                <p className="text-center mt-6 text-sm text-gray-500">
                    Déjà un compte ?  
                    <button onClick={togglePage} className="text-silver-primary font-bold ml-1 hover:text-silver-accent transition-colors underline decoration-silver-accent">
                        Se connecter
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Register;