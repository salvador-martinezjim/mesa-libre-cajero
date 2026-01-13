import React from 'react';

// --- Iconos (Sin cambios) ---
const CloseIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const ReceiptIcon = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FF9F43" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const UserIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const CalendarIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const CreditCardIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>;
const CashIconSmall = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1E8E3E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/></svg>;

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any; 
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  // --- LÓGICA CORREGIDA SEGÚN SWAGGER ---
  const getPaymentMethodDisplay = (orderData: any) => {
    // Buscamos el método en todas las estructuras posibles:
    let method = 
        orderData.pago?.tipoPago ||        // 1. Estructura Swagger POST (image_f48a75.png)
        orderData.paymentMethod ||         // 2. Estado local frontend
        orderData.pagos?.[0]?.tipo ||      // 3. Estructura de Mesas (GET)
        "Desconocido";

    // Convertimos a minúsculas para comparar seguro
    const lowerMethod = String(method).toLowerCase();

    if (lowerMethod.includes('efectivo') || lowerMethod.includes('cash')) {
        return { text: 'Pago en Efectivo', icon: <CashIconSmall />, color: '#1E8E3E' };
    }
    if (lowerMethod.includes('tarjeta') || lowerMethod.includes('card')) {
        return { text: 'Pago con Tarjeta', icon: <CreditCardIcon />, color: '#2196F3' };
    }
    
    // Si no coincide, mostramos lo que venga
    return { text: `Pago: ${method}`, icon: <CreditCardIcon />, color: '#666' };
  };

  const paymentInfo = getPaymentMethodDisplay(order);

  const formatDate = (dateString: string | Date) => {
      try {
          const date = new Date(dateString);
          return date.toLocaleDateString('es-MX', { 
              day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' 
          });
      } catch (e) {
          return "Fecha no disponible";
      }
  };

  // Obtener items (soporta ambas estructuras)
  const items = order.items || order.detallesOrden?.orderDetailDTOs || [];

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        
        {/* Header */}
        <div style={styles.header}>
            <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                <div style={styles.iconBox}>
                    <ReceiptIcon />
                </div>
                <div>
                    <h2 style={styles.title}>Orden #{order.id}</h2>
                    <span style={styles.statusBadge}>{order.status || 'Completado'}</span>
                </div>
            </div>
            <button onClick={onClose} style={styles.closeButton}>
                <CloseIcon />
            </button>
        </div>

        <div style={styles.content}>
            
            {/* Info Card */}
            <div style={styles.infoCard}>
                <div style={styles.infoRow}>
                    <UserIcon /> 
                    <span style={{fontWeight: '600', color: '#333'}}>Cliente:</span> 
                    <span>{order.customerName || order.detallesOrden?.comensal || "Cliente General"}</span>
                </div>
                <div style={styles.infoRow}>
                    <CalendarIcon />
                    <span style={{fontWeight: '600', color: '#333'}}>Fecha:</span>
                    <span>{formatDate(order.date || order.pagos?.[0]?.fechaHoraEntregaEfectivo || new Date())}</span>
                </div>
                <div style={styles.infoRow}>
                    {paymentInfo.icon}
                    <span style={{fontWeight: '600', color: paymentInfo.color}}>
                        {paymentInfo.text}
                    </span>
                </div>
            </div>

            {/* Productos */}
            <h3 style={styles.sectionTitle}>Detalle de Productos</h3>
            
            <div style={styles.tableHeader}>
                <span style={{flex: 2}}>Producto</span>
                <span style={{flex: 1, textAlign: 'center'}}>Cant.</span>
                <span style={{flex: 1, textAlign: 'right'}}>Precio</span>
                <span style={{flex: 1, textAlign: 'right'}}>Total</span>
            </div>

            <div style={styles.productsList}>
                {items.map((item: any, idx: number) => {
                    const price = item.price || (item.total / item.cantidad) || 0;
                    const qty = item.quantity || item.cantidad || 0;
                    return (
                        <div key={idx} style={styles.productRow}>
                            <span style={{flex: 2, fontWeight: '500', color: '#333'}}>
                                {item.name || item.productoNombre || "Producto"}
                            </span>
                            <span style={{flex: 1, textAlign: 'center', color: '#666'}}>x{qty}</span>
                            <span style={{flex: 1, textAlign: 'right', color: '#666'}}>${price.toFixed(2)}</span>
                            <span style={{flex: 1, textAlign: 'right', fontWeight: '700', color: '#333'}}>
                                ${(price * qty).toFixed(2)}
                            </span>
                        </div>
                    );
                })}
            </div>

            <div style={styles.divider}></div>

            {/* Total */}
            <div style={styles.totalRow}>
                <span style={styles.totalLabel}>Total Pagado:</span>
                <span style={styles.totalAmount}>${(order.total || 0).toFixed(2)}</span>
            </div>

        </div>
      </div>
    </div>
  );
};

// --- Estilos ---
const styles: { [key: string]: React.CSSProperties } = {
  overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, backdropFilter: 'blur(3px)' },
  container: { backgroundColor: '#fff', borderRadius: '20px', width: '500px', maxWidth: '90%', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', overflow: 'hidden' },
  header: { padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f0f0f0' },
  iconBox: { width: '50px', height: '50px', backgroundColor: '#FFF5EB', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  title: { margin: 0, fontSize: '20px', fontWeight: '800', color: '#1a2a3a', lineHeight: '1' },
  statusBadge: { display: 'inline-block', marginTop: '5px', padding: '4px 10px', backgroundColor: '#E8F5E9', color: '#2E7D32', borderRadius: '6px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' },
  closeButton: { background: 'none', border: 'none', cursor: 'pointer', padding: '5px' },
  content: { padding: '25px', overflowY: 'auto' },
  infoCard: { backgroundColor: '#F9FAFB', padding: '15px', borderRadius: '12px', marginBottom: '25px', border: '1px solid #eee' },
  infoRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', fontSize: '14px', color: '#555' },
  sectionTitle: { margin: '0 0 15px 0', fontSize: '15px', fontWeight: '700', color: '#333' },
  tableHeader: { display: 'flex', fontSize: '12px', color: '#999', fontWeight: '600', textTransform: 'uppercase', paddingBottom: '10px', borderBottom: '1px solid #eee' },
  productsList: { marginTop: '10px' },
  productRow: { display: 'flex', padding: '12px 0', borderBottom: '1px dashed #eee', fontSize: '14px' },
  divider: { height: '1px', backgroundColor: '#eee', margin: '20px 0' },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: '18px', fontWeight: '800', color: '#1a2a3a' },
  totalAmount: { fontSize: '24px', fontWeight: '800', color: '#FF9F43' }
};