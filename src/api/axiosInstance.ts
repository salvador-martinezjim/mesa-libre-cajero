import axios from 'axios';

const api = axios.create({
    // CAMBIO IMPORTANTE: Ahora apuntamos a nuestro proxy local "/api"
    baseURL: '/api', 
    headers: {
        'Content-Type': 'application/json',
    }
});

export default api;