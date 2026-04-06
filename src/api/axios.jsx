import axios from 'axios';

const instance = axios.create({
    // Cette ligne détecte l'URL de Railway en production ou utilise localhost par défaut
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
});

// Ajoute automatiquement le token s'il existe dans le localStorage
instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default instance;