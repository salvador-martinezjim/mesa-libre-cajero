import api from '../../../api/axiosInstance';

// --- CORRECCIÓN AQUÍ: Definimos la estructura completa que manda tu backend ---
export interface LoginResponse {
    accessToken: string;
    infoUsuario: {
        nombre: string;
        apellidoPaterno: string;
        tipo: string;     // Ej: "Cajero"
        fotoUrl: string;
        estado: string;   // Ej: "Activo"
    };
}

export const loginService = async (correo: string, contrasenia: string): Promise<LoginResponse> => {
    try {
        const response = await api.post<LoginResponse>('/login', { 
            correo, 
            contraseña: contrasenia 
        });
        
        return response.data;
    } catch (error) {
        console.error("Error en loginService:", error);
        throw error;
    }
};

export const forgotPasswordService = async (email: string) => {
    const clientUri = 'http://137.184.191.81/reset-password.html';
    try {
        const response = await api.post('/password/forgot', { 
            email: email,
            clientUri: clientUri
        });
        return response.data;
    } catch (error) {
        console.error("Error en forgotPasswordService:", error);
        throw error;
    }
};