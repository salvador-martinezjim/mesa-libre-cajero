import React from 'react';
import { AppRouter } from './router/AppRouter';
// 1. IMPORTAMOS EL PROVIDER
// Asegúrate que esta ruta coincida con donde guardaste el archivo OrdersContext.tsx
import { OrdersProvider } from './modules/cashier/context/OrdersContext'; 

import './index.css'; // Tus estilos globales

const App: React.FC = () => {
  return (
    // 2. ENVOLVEMOS EL ROUTER CON EL PROVEEDOR
    <OrdersProvider>
      <AppRouter />
    </OrdersProvider>
  );
};

export default App;