import React, { createContext, useContext, useState, type ReactNode } from 'react';

// Definimos qué datos tendrá nuestro contexto
interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// El Proveedor que envolverá la app
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Inicializamos el estado revisando si YA existe un token guardado (para cuando recargas la página)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('token');
  });

  const login = (token: string) => {
    localStorage.setItem('token', token); // Guardamos en disco
    setIsAuthenticated(true);             // Avisamos a React (¡ESTO ES LO QUE FALTABA!)
  };

  const logout = () => {
    localStorage.removeItem('token');     // Borramos de disco
    setIsAuthenticated(false);            // Avisamos a React
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar el contexto fácilmente
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};