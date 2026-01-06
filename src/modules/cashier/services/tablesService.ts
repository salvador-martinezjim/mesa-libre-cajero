import api from '../../../api/axiosInstance';

export const getTablesService = async () => {
    try {
        // CORRECCIÓN: Quitamos el '/api' manual.
        // Axios ya pone el primero, y el Proxy se encarga de dirigirlo.
        const response = await api.get('/tables'); 
        return response.data;
    } catch (error) {
        console.error("Error al obtener mesas:", error);
        throw error;
    }
};