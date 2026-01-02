import api from '../../../api/axiosInstance';

// CORRECCIÓN: Cambiamos 'token' por 'accessToken'
interface LoginResponse {
    accessToken: string; 
    usuario?: {
        nombre: string;
        rol: string;
    }
}

export const loginService = async (correo: string, contrasenia: string) => {
    try {
        const response = await api.post<LoginResponse>('/login', { 
            correo: correo,
            contraseña: contrasenia
        });
        
        // Si el login es exitoso, guardamos el token
        // CORRECCIÓN: Usamos response.data.accessToken
        if (response.data.accessToken) {
            localStorage.setItem('token', response.data.accessToken);
        }

        return response.data;
    } catch (error) {
        console.error("Error en loginService:", error);
        throw error;
    }
};