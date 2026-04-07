import axios from 'axios';

// On récupère l'URL de base depuis les variables d'environnement
const apiBaseURL = import.meta.env.VITE_API_URL;

// Debug : Affiche l'URL utilisée dans la console du navigateur (à retirer après le test)
console.log("Tentative de connexion à l'API via :", apiBaseURL);

const instance = axios.create({
    // Si VITE_API_URL existe, on ajoute /api, sinon on utilise le local par défaut
    baseURL: apiBaseURL ? `${apiBaseURL}/api` : 'http://127.0.0.1:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    // Très important pour les cookies/sessions Laravel Sanctum
    withCredentials: true 
});

// Intercepteur pour le Token
instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default instance;