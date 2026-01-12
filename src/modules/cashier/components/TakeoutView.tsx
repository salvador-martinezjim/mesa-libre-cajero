import React, { useState, useMemo } from 'react';
import { NewOrderModal } from './NewOrderModal';
import { PaymentModal } from './PaymentModal'; 
import { OrderDetailModal } from './OrderDetailModal';
import { useOrders, type OrderData } from '../context/OrdersContext';

// --- Iconos ---
const ClockIconSmall = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const BagIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;

const FILTER_TABS = ['Todos', 'Pendientes', 'Preparando', 'Listos'];

export const TakeoutView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);

  // Contexto Global
  const { orders, addOrder, markOrderAsPaid } = useOrders();

  // Estados para Modales
  const [paymentOrder, setPaymentOrder] = useState<OrderData | null>(null);
  const [detailOrder, setDetailOrder] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Filtros
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      if (activeTab !== 'Todos') {
        const statusMap: {[key: string]: string} = {
            'Pendientes': 'Pendiente',
            'Preparando': 'Preparando',
            'Listos': 'Listo'
        };
        if (order.status !== statusMap[activeTab]) return false;
      }
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

  const handleNewOrderCreated = (newOrder: OrderData) => {
    addOrder(newOrder); 
    setIsNewOrderModalOpen(false);
  };

  const handleCardClick = (order: OrderData) => {
    if (!order.isPaid) {
      setPaymentOrder(order);
    } else {
      setDetailOrder(order);
      setIsDetailOpen(true);
    }
  };

  const handlePaymentSuccess = (method: string) => { 
    if (!paymentOrder) return;
    markOrderAsPaid(paymentOrder.id); 
    setPaymentOrder(null);
  };

  return (
    <div style={styles.container}>
      
      {/* 1. Modal Nuevo Pedido */}
      <NewOrderModal 
        isOpen={isNewOrderModalOpen} 
        onClose={() => setIsNewOrderModalOpen(false)} 
        onOrderCreated={handleNewOrderCreated} 
      />

      {/* 2. Modal de Pago CONFIGURADO PARA LLEVAR */}
      {paymentOrder && (
        <PaymentModal
          isOpen={!!paymentOrder}
          onClose={() => setPaymentOrder(null)}
          onBack={() => setPaymentOrder(null)}
          onConfirm={(method) => handlePaymentSuccess(method)} 
          
          // DATOS GENERALES
          total={paymentOrder.total}
          orderId={Number(paymentOrder.id)}
          
          // DATOS ESPECÍFICOS PARA LLEVAR
          clientLabelText="CLIENTE" // Texto correcto
          customerName={paymentOrder.customerName || "Cliente Mostrador"}          
          items={paymentOrder.items || []} // Lista de productos
          
          // LA BANDERA MAESTRA (ACTIVA MODO FLEXIBLE)
          isTakeout={true} 
        />
      )}

      {/* 3. Modal de Detalle */}
      <OrderDetailModal 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
        order={detailOrder} 
      />
      
      {/* Barra Superior */}
      <div style={styles.topBar}>
        <div style={styles.searchContainer}>
          <div style={styles.searchIconWrapper}><SearchIcon /></div>
          <input 
            type="text" 
            placeholder="Buscar por nombre, teléfono..." 
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
                color: activeTab === tab ? '#FFFFFF' : '#666666',
                border: activeTab === tab ? 'none' : '1px solid #E0E0E0'
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
                   opacity: order.isPaid ? 0.85 : 1
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
                               <span style={{color: '#FF9F43', fontSize: '12px', fontWeight: '700'}}>• COBRAR</span>
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

      <button style={styles.fab} onClick={() => setIsNewOrderModalOpen(true)}>
        <PlusIcon />
        <span style={styles.fabText}>Nuevo Pedido</span>
      </button>

    </div>
  );
};

// ESTILOS (Mismos que ya tenías)
const styles: { [key: string]: React.CSSProperties } = {
  container: { display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)', position: 'relative', padding: '0 40px' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '30px', marginBottom: '35px', width: '100%', flexWrap: 'wrap' },
  searchContainer: { flex: 1, position: 'relative', display: 'flex', alignItems: 'center', maxWidth: '600px' },
  searchIconWrapper: { position: 'absolute', left: '20px', display: 'flex', pointerEvents: 'none' },
  searchInput: { width: '100%', height: '65px', padding: '0 20px 0 50px', borderRadius: '12px', border: '1px solid #eee', backgroundColor: '#FFFFFF', fontSize: '16px', color: '#333333', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', outline: 'none', boxSizing: 'border-box' },
  tabsContainer: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  tab: { padding: '10px 20px', borderRadius: '25px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 2px 5px rgba(0,0,0,0.02)', transition: 'all 0.2s' },
  contentArea: { flex: 1, overflowY: 'auto', paddingBottom: '100px' },
  emptyState: { textAlign: 'center', marginTop: '100px', display: 'flex', justifyContent: 'center' },
  emptyText: { fontSize: '18px', color: '#999999', fontWeight: '600' },
  fab: { position: 'fixed', bottom: '40px', right: '60px', backgroundColor: '#FF9F43', color: 'white', border: 'none', borderRadius: '12px', padding: '15px 30px', fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 15px rgba(255, 159, 67, 0.4)', cursor: 'pointer', zIndex: 100 },
  fabText: { marginTop: '1px' },
  ordersGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', alignItems: 'start' },
  orderCard: { backgroundColor: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0', transition: 'transform 0.2s', cursor: 'pointer' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '15px' },
  orderId: { fontSize: '13px', color: '#888', fontWeight: '500' },
  statusBadge: { fontSize: '12px', padding: '4px 10px', borderRadius: '20px', fontWeight: '600' },
  customerName: { margin: '0 0 15px 0', fontSize: '18px', color: '#1a2a3a', fontWeight: '700' },
  infoRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', color: '#666', fontSize: '14px' },
  cardDivider: { height: '1px', backgroundColor: '#eee', margin: '15px 0' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  totalPrice: { fontSize: '20px', fontWeight: '800', color: '#1a2a3a' },
  paymentStatus: { display: 'flex', alignItems: 'center' }
};