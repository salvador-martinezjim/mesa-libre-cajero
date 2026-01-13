import axios from 'axios';

// 1. Crear la instancia de Axios
const api = axios.create({
    // Asegúrate de que este puerto sea correcto (3000, 4000, etc.)
    baseURL: 'http://localhost:5173/api', 
});

// 2. INTERCEPTOR DE SOLICITUD
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 3. INTERCEPTOR DE RESPUESTA MODIFICADO
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // CASO 1: Error 401 -> Token vencido o inválido. (AQUÍ SÍ SACAMOS AL USUARIO)
        if (error.response && error.response.status === 401) {
            console.warn('⚠️ Token vencido. Redirigiendo al login...');
            
            if (window.location.pathname !== '/login') {
                localStorage.removeItem('token');
                localStorage.removeItem('userData');
                window.location.href = '/'; 
            }
        } 
        // CASO 2: Error 403 -> No tienes permiso para esto, PERO tu sesión sigue viva.
        else if (error.response && error.response.status === 403) {
            console.error('⛔ Acceso denegado a este recurso (403). No tienes permisos.');
            // Opcional: Puedes lanzar una alerta visual aquí si quieres
            // alert("No tienes permisos para realizar esta acción.");
        }

        return Promise.reject(error);
    }
);

export default api;