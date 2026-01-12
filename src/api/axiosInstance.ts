import axios from 'axios';

// 1. Crear la instancia de Axios
const api = axios.create({
    // Asegúrate que esta URL sea la correcta de tu backend
    baseURL: 'http://localhost:5173/api', 
});

// 2. INTERCEPTOR DE SOLICITUD (REQUEST)
// Este ya lo tenías: Pone el token en cada envío
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 3. INTERCEPTOR DE RESPUESTA (RESPONSE) - ¡AQUÍ ESTÁ LA MAGIA! 🎩
// Este vigila si el servidor nos rechaza
api.interceptors.response.use(
    (response) => {
        // Si todo sale bien, dejamos pasar la respuesta
        return response;
    },
    (error) => {
        // Si hay error, revisamos si es un 401 (No autorizado / Token vencido)
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.warn('⚠️ Sesión expirada o token inválido. Redirigiendo al login...');
            
            // A) Borramos los datos viejos para limpiar la casa
            //localStorage.removeItem('token');
            //localStorage.removeItem('userData');
            //localStorage.removeItem('userEmail');            
            //window.location.href = '/'; 

            
        }
        
        // Si es otro error (ej. 500 o 400), lo dejamos pasar para que lo maneje el componente
        return Promise.reject(error);
    }
);

export default api;