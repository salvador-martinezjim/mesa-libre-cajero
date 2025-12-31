// src/context/OrdersContext.tsx
import React, { createContext, useContext, useState, type ReactNode } from 'react';

export interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

// 1. Movemos la interfaz aquí para que sea global
export interface OrderData {
  id: string;
  customerName: string;
  customerPhone: string;
  itemCount: number;
  total: number;
  status: 'Pendiente' | 'Preparando' | 'Listo';
  isPaid: boolean;
  date: Date;
  items: OrderItem[];
}

// 2. Definimos qué datos tendrá nuestro contexto
interface OrdersContextType {
  orders: OrderData[];
  addOrder: (order: OrderData) => void;
  markOrderAsPaid: (orderId: string) => void;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

// 3. Creamos el Proveedor (El componente que envolverá tu App)
export const OrdersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<OrderData[]>([]);

  // Función para agregar pedido
  const addOrder = (newOrder: OrderData) => {
    setOrders(prev => [newOrder, ...prev]);
  };

  // Función para marcar como pagado
  const markOrderAsPaid = (orderId: string) => {
    setOrders(prevOrders => prevOrders.map(order => {
      if (order.id === orderId) {
        return { ...order, isPaid: true, status: 'Listo' };
      }
      return order;
    }));
  };

  return (
    <OrdersContext.Provider value={{ orders, addOrder, markOrderAsPaid }}>
      {children}
    </OrdersContext.Provider>
  );
};

// 4. Hook personalizado para usarlo fácil
export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders debe usarse dentro de un OrdersProvider');
  }
  return context;
};