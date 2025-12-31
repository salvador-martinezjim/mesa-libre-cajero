import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Es mejor importar sin la extensión .tsx al final
import { LoginPage } from '../modules/cashier/pages/LoginPage';
import { TablesPage } from '../modules/cashier/pages/TablesPage';
import { ChangePasswordPage } from '../modules/cashier/pages/ChangePasswordPage';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. CORRECCIÓN: La raíz "/" debe mandar al Login primero */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* 2. Ruta del Login */}
        <Route path="/login" element={<LoginPage />} />

        {/* 3. Ruta de Mesas (Esta es la que vale, "/mesas") */}
        <Route path="/mesas" element={<TablesPage />} />
        
        <Route path="/change-password" element={<ChangePasswordPage />} />

        {/* 4. Ruta 404 */}
        <Route path="*" element={
          <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
            <h1 style={{ color: '#c1c1c1ff' }}>404 - Página no encontrada</h1>
            <p style={{ color: '#828181ff', fontSize: '18px' }}>Parece que te perdiste en la cocina.</p>
            
            <button 
                onClick={() => window.history.back()} 
                style={{ 
                    marginTop: '20px', 
                    padding: '10px 20px', 
                    backgroundColor: '#FF8108', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '8px',
                    cursor: 'pointer'
                }}
            >
                Regresar
            </button>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
};