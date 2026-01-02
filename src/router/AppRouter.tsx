import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from '../modules/cashier/context/AuthContext';

// Páginas
import { LoginPage } from '../modules/cashier/pages/LoginPage';
import { TablesPage } from '../modules/cashier/pages/TablesPage';
import { ChangePasswordPage } from '../modules/cashier/pages/ChangePasswordPage';

// --- GUARD 1: Protege rutas privadas ---
const RequireAuth = () => {
  const { isAuthenticated } = useAuth(); // Leemos del estado reactivo
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

// --- GUARD 2: Protege rutas públicas ---
const PublicRoute = () => {
  const { isAuthenticated } = useAuth(); // Leemos del estado reactivo
  if (isAuthenticated) {
    return <Navigate to="/mesas" replace />;
  }
  return <Outlet />;
};

export const AppRouter: React.FC = () => {
  return (
    // Envolvemos TODO en el AuthProvider para que funcione
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          
          {/* Rutas Públicas (Login) */}
          <Route element={<PublicRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
          </Route>

          {/* Rutas Privadas (Mesas, etc.) */}
          <Route element={<RequireAuth />}>
              <Route path="/mesas" element={<TablesPage />} />
              <Route path="/change-password" element={<ChangePasswordPage />} />
          </Route>

          {/* Ruta 404 */}
          <Route path="*" element={
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
              <h1>404 - No encontrada</h1>
              <button onClick={() => window.history.back()}>Regresar</button>
            </div>
          } />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};