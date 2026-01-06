import api from '../../../api/axiosInstance';

export const getCategoriesService = async () => {
    try {
        // Petición GET al endpoint /categories
        const response = await api.get('/categories');
        return response.data;
    } catch (error) {
        console.error("Error al obtener categorías:", error);
        throw error;
    }
};