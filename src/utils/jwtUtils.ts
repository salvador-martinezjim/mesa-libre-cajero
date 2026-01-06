export interface UserToken {
  unique_name?: string; // A veces viene como 'unique_name'
  email?: string;
  role?: string;
  // Otros campos posibles dependiendo de tu backend (sub, exp, etc.)
}

export const getUserFromToken = (): { name: string; role: string; email: string } | null => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    // 1. Separamos el token en sus 3 partes y tomamos la segunda (Payload)
    const base64Url = token.split('.')[1];
    
    // 2. Corregimos formato base64
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // 3. Decodificamos
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const decoded = JSON.parse(jsonPayload);
    console.log("🔓 Datos del Token:", decoded); // Mira la consola para ver qué nombres usa tu back

    // 4. Retornamos los datos mapeados (Ajusta si tu back usa otros nombres como 'sub' o 'nameid')
    return {
        name: decoded.unique_name || decoded.name || decoded.sub || 'Usuario',
        role: decoded.role || decoded.actort || 'Empleado',
        email: decoded.email || 'Sin correo'
    };

  } catch (error) {
    console.error("Error al leer el token", error);
    return null;
  }
};