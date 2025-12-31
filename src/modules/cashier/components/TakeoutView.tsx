import React, { useState, useMemo } from 'react';
import { NewOrderModal } from './NewOrderModal';
import { PaymentModal } from './PaymentModal'; 
// Importamos los datos y funciones desde el Contexto Global
import { useOrders, type OrderData } from '../context/OrdersContext.tsx';

// --- Iconos ---
const PhoneIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>;
const ClockIconSmall = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const BagIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;

const FILTER_TABS = ['Todos', 'Pendientes', 'Preparando', 'Listos'];

export const TakeoutView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- USO DEL CONTEXTO (GLOBAL) ---
  const { orders, addOrder, markOrderAsPaid } = useOrders();

  // Estado para la orden que se va a pagar (local)
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);

  // --- LÓGICA DE FILTRADO ---
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // 1. Filtro por Tabs (Estado)
      // Ajustamos nombres singulares/plurales
      if (activeTab !== 'Todos') {
        const statusMap: {[key: string]: string} = {
            'Pendientes': 'Pendiente',
            'Preparando': 'Preparando',
            'Listos': 'Listo'
        };
        if (order.status !== statusMap[activeTab]) return false;
      }

      // 2. Filtro por Buscador (Nombre, ID o Teléfono)
      if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        return (
            order.customerName.toLowerCase().includes(lowerSearch) ||
            order.id.includes(lowerSearch) ||
            order.customerPhone.includes(lowerSearch)
        );
      }
      return true;
    });
  }, [orders, activeTab, searchTerm]);


  // --- MANEJADORES DE EVENTOS ---

  // 1. Agregar nueva orden (Usando función del Contexto)
  const handleNewOrderCreated = (newOrder: OrderData) => {
    addOrder(newOrder); // <--- Corrección: Usamos addOrder del contexto
    setIsModalOpen(false);
  };

  // 2. Click en tarjeta
  const handleCardClick = (order: OrderData) => {
    if (!order.isPaid) {
      setSelectedOrder(order);
    }
  };

  // 3. Confirmación de pago (Usando función del Contexto)
  const handlePaymentSuccessForExistingOrder = () => {
    if (!selectedOrder) return;
    markOrderAsPaid(selectedOrder.id); // <--- Corrección: Usamos markOrderAsPaid del contexto
    setSelectedOrder(null);
  };

  return (
    <div style={styles.container}>
      
      {/* Modal para CREAR pedidos */}
      <NewOrderModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onOrderCreated={handleNewOrderCreated} 
      />
      
      {/* Barra Superior */}
      <div style={styles.topBar}>
        <div style={styles.searchContainer}>
          <div style={styles.searchIconWrapper}><SearchIcon /></div>
          <input 
            type="text" 
            placeholder="Buscar por nombre, teléfono o número de pedido..." 
            style={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={styles.tabsContainer}>
          {FILTER_TABS.map(tab => (
            <button
              key={tab}
              style={{
                ...styles.tab,
                backgroundColor: activeTab === tab ? '#FF9F43' : '#FFFFFF',
                color: activeTab === tab ? '#FFFFFF' : '#333333',
                fontWeight: activeTab === tab ? '600' : '500',
              }}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido Central */}
      <div style={styles.contentArea}>
        {filteredOrders.length === 0 ? (
          <div style={styles.emptyState}>
            <h3 style={styles.emptyText}>
                {orders.length === 0 ? "Sin pedidos por el momento" : "No hay pedidos con este filtro"}
            </h3>
          </div>
        ) : (
          <div style={styles.ordersGrid}>
            {filteredOrders.map((order) => (
               <div 
                 key={order.id} 
                 style={{
                   ...styles.orderCard,
                   cursor: !order.isPaid ? 'pointer' : 'default',
                   opacity: order.isPaid ? 0.8 : 1
                 }}
                 onClick={() => handleCardClick(order)}
               >
                  <div style={styles.cardHeader}>
                      <span style={styles.orderId}>Pedido #{order.id}</span>
                      <span style={{
                          ...styles.statusBadge, 
                          backgroundColor: order.status === 'Listo' ? '#E8F5E9' : '#E3F2FD', 
                          color: order.status === 'Listo' ? '#2E7D32' : '#2196F3'
                      }}>
                          {order.status}
                      </span>
                  </div>

                  <h4 style={styles.customerName}>{order.customerName || "Cliente Mostrador"}</h4>
                  
                  <div style={styles.infoRow}>
                      <PhoneIcon />
                      <span>{order.customerPhone || "--"}</span>
                  </div>
                  <div style={styles.infoRow}>
                      <ClockIconSmall />
                      <span>15 min</span>
                  </div>
                  <div style={styles.infoRow}>
                      <BagIcon />
                      <span>{order.itemCount} productos</span>
                  </div>

                  <div style={styles.cardDivider}></div>
                  
                  <div style={styles.cardFooter}>
                      <div style={styles.paymentStatus}>
                           {order.isPaid ? (
                               <span style={{color: '#28C76F', fontSize: '12px', fontWeight: '700'}}>• PAGADO</span>
                           ) : (
                               <span style={{color: '#FF9F43', fontSize: '12px', fontWeight: '700'}}>• PENDIENTE PAGO</span>
                           )}
                      </div>
                      <div style={styles.totalPrice}>
                          ${order.total.toFixed(2)}
                      </div>
                  </div>
               </div>
            ))}
          </div>
        )}
      </div>

      <button style={styles.fab} onClick={() => setIsModalOpen(true)}>
        <PlusIcon />
        <span style={styles.fabText}>Nuevo Pedido</span>
      </button>

      {/* MODAL DE PAGO */}
      {selectedOrder && (
        <PaymentModal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onBack={() => setSelectedOrder(null)}
          onConfirm={handlePaymentSuccessForExistingOrder}
          total={selectedOrder.total}
          customerName={selectedOrder.customerName}
          customerPhone={selectedOrder.customerPhone}
          items={selectedOrder.items || []}
        />
      )}

    </div>
  );
};

// --- Estilos ---
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 140px)', 
    position: 'relative',
    padding: '0 40px'
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '30px',
    marginBottom: '40px',
  },
  searchContainer: {
    flex: 1, 
    position: 'relative',
    maxWidth: '600px', 
  },
  searchIconWrapper: {
    position: 'absolute',
    left: '20px',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
  },
  searchInput: {
    width: '100%',
    padding: '16px 20px 16px 50px',
    borderRadius: '12px', 
    border: '1px solid #E0E0E0', 
    backgroundColor: '#FFFFFF',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
    color: '#555',
  },
  tabsContainer: {
    display: 'flex',
    gap: '10px',
  },
  tab: {
    padding: '12px 20px',
    borderRadius: '10px', 
    border: 'none',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)', 
  },
  contentArea: {
    flex: 1,
    overflowY: 'auto', 
    paddingBottom: '100px'
  },
  emptyState: {
    textAlign: 'center',
    marginTop: '100px',
    display: 'flex',
    justifyContent: 'center'
  },
  emptyText: {
    fontSize: '18px',
    color: '#999999', 
    fontWeight: '600',
  },
  fab: {
    position: 'fixed', 
    bottom: '40px',
    right: '60px',
    backgroundColor: '#FF9F43', 
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '15px 30px',
    fontSize: '16px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 4px 15px rgba(255, 159, 67, 0.4)', 
    cursor: 'pointer',
    zIndex: 100
  },
  fabText: {
    marginTop: '1px', 
  },
  ordersGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '20px',
      alignItems: 'start'
  },
  orderCard: {
      backgroundColor: '#fff',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
      border: '1px solid #f0f0f0',
      transition: 'transform 0.2s',
      cursor: 'pointer' 
  },
  cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '15px'
  },
  orderId: {
      fontSize: '13px',
      color: '#888',
      fontWeight: '500'
  },
  statusBadge: {
      fontSize: '12px',
      padding: '4px 10px',
      borderRadius: '20px',
      fontWeight: '600'
  },
  customerName: {
      margin: '0 0 15px 0',
      fontSize: '18px',
      color: '#1a2a3a',
      fontWeight: '700'
  },
  infoRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '8px',
      color: '#666',
      fontSize: '14px'
  },
  cardDivider: {
      height: '1px',
      backgroundColor: '#eee',
      margin: '15px 0'
  },
  cardFooter: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
  },
  totalPrice: {
      fontSize: '20px',
      fontWeight: '800',
      color: '#1a2a3a'
  },
  paymentStatus: {
      display: 'flex',
      alignItems: 'center'
  }
};
     