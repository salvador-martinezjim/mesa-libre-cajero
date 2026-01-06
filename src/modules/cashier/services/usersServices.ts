import api from '../../../api/axiosInstance';

export const changePasswordService = async (actual: string, nueva: string, confirmacion: string) => {
    try {
        // En tu Swagger se ve que el body requiere estos nombres exactos en español
        const payload = {
            "contraseñaActual": actual,
            "contraseñaNueva": nueva,
            "confirmacionContraseñaNueva": confirmacion
        };

        const response = await api.post('/users/me/update-password', payload);
        return response.data;
    } catch (error) {
        console.error("Error cambiando contraseña:", error);
        throw error;
    }
};