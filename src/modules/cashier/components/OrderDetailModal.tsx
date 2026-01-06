import React from 'react';

// Interfaces
interface OrderProduct {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface OrderDetail {
  id: string; 
  customerName: string;
  date: Date | string;
  total: number;
  status: string;
  // Puede venir como 'paymentMethod' (frontend) o dentro de 'pago.tipoPago' (backend)
  paymentMethod?: string; 
  pago?: {
      tipoPago: string;
  };
  items: OrderProduct[];
}

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderDetail | null; 
}

// --- Iconos ---
const CloseIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const ReceiptIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF9F43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const UserIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const CalendarIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const CashIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E8E3E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>;
const CardIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>;

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  // --- LÓGICA DE DETECCIÓN DE PAGO ---
  // Intentamos leer el método de pago de varios lugares posibles
  const rawPaymentMethod = order.paymentMethod || (order.pago && order.pago.tipoPago) || "Desconocido";
  
  // Normalizamos a minúsculas para comparar
  const isCash = rawPaymentMethod.toLowerCase().includes('efectivo') || rawPaymentMethod.toLowerCase().includes('cash');
  const isCard = rawPaymentMethod.toLowerCase().includes('tarjeta') || rawPaymentMethod.toLowerCase().includes('card');

  // Definimos el texto final bonito
  const paymentLabel = isCash ? 'Efectivo' : (isCard ? 'Tarjeta' : rawPaymentMethod);

  const formattedDate = new Date(order.date).toLocaleString('es-MX', {
    day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerTitleRow}>
            <div style={styles.iconWrapper}><ReceiptIcon /></div>
            <div>
                <h2 style={styles.title}>Orden #{order.id}</h2>
                <span style={styles.statusBadge}>{order.status}</span>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn}><CloseIcon /></button>
        </div>

        <div style={styles.content}>
            
            {/* Info del Cliente y Fecha */}
            <div style={styles.infoSection}>
                <div style={styles.infoRow}>
                    <UserIcon />
                    <span style={styles.infoText}><strong>Cliente:</strong> {order.customerName}</span>
                </div>
                <div style={styles.infoRow}>
                    <CalendarIcon />
                    <span style={styles.infoText}>{formattedDate}</span>
                </div>
                
                {/* --- SECCIÓN DE PAGO CORREGIDA --- */}
                <div style={styles.infoRow}>
                    {isCash ? <CashIcon /> : <CardIcon />}
                    <span style={{
                        ...styles.infoText, 
                        color: isCash ? '#1E8E3E' : '#2196F3', // Verde para efectivo, Azul para tarjeta
                        fontWeight: '700'
                    }}>
                        Pago con {paymentLabel}
                    </span>
                </div>
            </div>

            {/* Lista de Productos */}
            <div style={styles.productsContainer}>
                <h3 style={styles.sectionTitle}>Detalle de Productos</h3>
                <div style={styles.tableHeader}>
                    <span style={{flex: 2}}>Producto</span>
                    <span style={{flex: 1, textAlign: 'center'}}>Cant.</span>
                    <span style={{flex: 1, textAlign: 'right'}}>Precio</span>
                    <span style={{flex: 1, textAlign: 'right'}}>Total</span>
                </div>
                
                <div style={styles.itemsList}>
                    {order.items && order.items.map((item, index) => (
                        <div key={index} style={styles.itemRow}>
                            <span style={{flex: 2, fontWeight: '500', color: '#333'}}>{item.name}</span>
                            <span style={{flex: 1, textAlign: 'center', color: '#666'}}>x{item.quantity}</span>
                            <span style={{flex: 1, textAlign: 'right', color: '#666'}}>${item.price.toFixed(2)}</span>
                            <span style={{flex: 1, textAlign: 'right', fontWeight: '700', color: '#333'}}>
                                ${(item.price * item.quantity).toFixed(2)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Total Final */}
            <div style={styles.footer}>
                <div style={styles.totalRow}>
                    <span>Total Pagado:</span>
                    <span style={styles.totalAmount}>${order.total.toFixed(2)}</span>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

// --- Estilos ---
const styles: { [key: string]: React.CSSProperties } = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 4000, backdropFilter: 'blur(2px)' },
  modal: { backgroundColor: '#fff', width: '90%', maxWidth: '500px', borderRadius: '16px', boxShadow: '0 15px 40px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'fadeIn 0.2s ease-out' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 25px', borderBottom: '1px solid #eee', backgroundColor: '#fff' },
  headerTitleRow: { display: 'flex', alignItems: 'center', gap: '15px' },
  iconWrapper: { backgroundColor: '#FFF5EB', padding: '10px', borderRadius: '12px', display: 'flex' },
  title: { fontSize: '20px', fontWeight: '800', margin: '0 0 4px 0', color: '#1a2a3a' },
  statusBadge: { fontSize: '12px', padding: '4px 8px', backgroundColor: '#E6F4EA', color: '#1E8E3E', borderRadius: '6px', fontWeight: '700', textTransform: 'uppercase' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#999' },
  
  content: { padding: '25px', overflowY: 'auto', maxHeight: '70vh' },
  
  infoSection: { backgroundColor: '#F8F9FA', padding: '15px', borderRadius: '12px', marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '10px' },
  infoRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  infoText: { fontSize: '14px', color: '#444' },

  sectionTitle: { fontSize: '16px', fontWeight: '700', color: '#333', marginBottom: '15px' },
  productsContainer: { marginBottom: '20px' },
  tableHeader: { display: 'flex', fontSize: '13px', fontWeight: '600', color: '#999', paddingBottom: '10px', borderBottom: '1px solid #eee', marginBottom: '10px' },
  itemsList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  itemRow: { display: 'flex', fontSize: '14px' },

  footer: { borderTop: '2px dashed #eee', paddingTop: '20px', marginTop: '10px' },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '18px', fontWeight: '800', color: '#1a2a3a' },
  totalAmount: { fontSize: '24px', color: '#FF9F43' }
};