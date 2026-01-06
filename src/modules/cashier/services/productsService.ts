import api from '../../../api/axiosInstance';

// Definimos la estructura exacta que vimos en tu captura
interface ProductResponse {
    subcategorias: {
        categoriaId: number;
        nombre: string;
    }[];
    productos: {
        id: number;
        nombre: string;
        categoryId: number; // Esto conecta con subcategorias
        precio: number;
        estado: string;
        imagen: string | null;
        descripcion: string | null;
    }[];
}

export const getProductsAndCategoriesService = async () => {
    try {
        // Petición GET al endpoint /products
        const response = await api.get<ProductResponse>('/products');
        return response.data;
    } catch (error) {
        console.error("Error al obtener productos:", error);
        throw error;
    }
};