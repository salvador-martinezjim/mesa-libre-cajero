import axios from 'axios';

const api = axios.create({
    baseURL: '/api', 
    headers: {
        'Content-Type': 'application/json',
    }
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        
        // --- DIAGNÓSTICO: VER SI EL TOKEN EXISTE ---
        if (token) {
            console.log("🔑 Enviando petición con Token:", token.substring(0, 10) + "...");
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            console.warn("⚠️ ¡ALERTA! Se está enviando una petición SIN TOKEN.");
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;