import React, { useState, useEffect } from 'react';
// Importamos el tipo OrderItem del contexto para usarlo aquí
import { type OrderItem } from '../context/OrdersContext';

// --- Props Actualizados ---
interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onConfirm: () => void;
  total: number;
  customerName: string;
  customerPhone: string;
  items: OrderItem[]; // <--- Recibimos la lista completa
}

// --- Iconos (Los mismos de antes) ---
const CloseIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const CashIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>;
const CardIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>;
const CheckIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF9F43" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const ArrowLeft = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;

export const PaymentModal: React.FC<PaymentModalProps> = ({ 
  isOpen, onClose, onBack, onConfirm, total, customerName, customerPhone, items 
}) => {
  
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [amountReceived, setAmountReceived] = useState('');
  const [change, setChange] = useState(0);

  useEffect(() => {
    const received = parseFloat(amountReceived);
    if (!isNaN(received) && received >= total) {
      setChange(received - total);
    } else {
      setChange(0);
    }
  }, [amountReceived, total]);

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modalContainer}>
        
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>Procesar Pago</h2>
          <button onClick={onClose} style={styles.closeButton}>
            <CloseIcon />
          </button>
        </div>

        <div style={styles.content}>
            
            {/* Detalles del Pedido */}
            <div style={styles.detailsCard}>
                <div style={styles.cardHeaderInfo}>
                    <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Cliente:</span>
                        <span style={styles.detailValue}>{customerName || 'Cliente General'}</span>
                    </div>
                    <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Teléfono:</span>
                        <span style={styles.detailValue}>{customerPhone || '--'}</span>
                    </div>
                </div>

                <div style={styles.divider}></div>

                {/* --- LISTA DE PRODUCTOS (SCROLLABLE) --- */}
                <div style={styles.productsList}>
                    <span style={styles.detailLabel}>Productos:</span>
                    {items.map((item, index) => (
                        <div key={index} style={styles.productItemRow}>
                            <div style={styles.productNameGroup}>
                                <span style={styles.qtyBadge}>{item.quantity}x</span>
                                <span style={styles.productName}>{item.name}</span>
                            </div>
                            <span style={styles.productPrice}>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                </div>

                <div style={styles.divider}></div>

                <div style={styles.totalRow}>
                    <span style={styles.totalLabel}>Total a pagar:</span>
                    <span style={styles.totalValue}>${total.toFixed(2)}</span>
                </div>
            </div>

            {/* Método de Pago */}
            <div style={styles.paymentSection}>
                <h3 style={styles.sectionTitle}>Método de Pago</h3>
                
                <div style={styles.methodsContainer}>
                    <div 
                        style={{
                            ...styles.methodOption,
                            borderColor: paymentMethod === 'cash' ? '#FF9F43' : '#ddd',
                            backgroundColor: paymentMethod === 'cash' ? '#FFF5EB' : '#fff',
                            color: paymentMethod === 'cash' ? '#FF9F43' : '#666'
                        }}
                        onClick={() => setPaymentMethod('cash')}
                    >
                        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                            <CashIcon />
                            <span style={{fontWeight: '600'}}>Efectivo</span>
                        </div>
                        {paymentMethod === 'cash' && <CheckIcon />}
                    </div>

                    <div 
                        style={{
                            ...styles.methodOption,
                            borderColor: paymentMethod === 'card' ? '#FF9F43' : '#ddd',
                            backgroundColor: paymentMethod === 'card' ? '#FFF5EB' : '#fff',
                            color: paymentMethod === 'card' ? '#FF9F43' : '#666'
                        }}
                        onClick={() => setPaymentMethod('card')}
                    >
                         <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                            <CardIcon />
                            <span style={{fontWeight: '600'}}>Tarjeta</span>
                        </div>
                        {paymentMethod === 'card' && <CheckIcon />}
                    </div>
                </div>

                {/* Input Efectivo + Cambio */}
                {paymentMethod === 'cash' && (
                    <div style={styles.cashInputContainer}>
                        <label style={styles.inputLabel}>Monto Recibido</label>
                        <input 
                            type="number" 
                            placeholder="0.00" 
                            style={styles.input}
                            value={amountReceived}
                            onChange={(e) => setAmountReceived(e.target.value)}
                        />
                        
                        {/* --- ZONA DE CAMBIO CORREGIDA --- */}
                        {parseFloat(amountReceived) >= total && (
                             <div style={styles.changeDisplay}>
                                <span style={styles.changeLabel}>Su Cambio:</span>
                                <span style={styles.changeValue}>${change.toFixed(2)}</span>
                             </div>
                        )}
                    </div>
                )}
            </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
             <button style={styles.backButton} onClick={onBack}>
                <ArrowLeft />
                <span style={{marginLeft: '5px'}}>Regresar</span>
            </button>

            <button style={styles.confirmButton} onClick={onConfirm}>
                Confirmar Pago
            </button>
        </div>

      </div>
    </div>
  );
};

// --- Estilos Actualizados ---
const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)', // Un poco más oscuro
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3000,
    backdropFilter: 'blur(3px)'
  },
  modalContainer: {
    backgroundColor: '#F8F9FA',
    width: '90%',
    maxWidth: '480px', 
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    maxHeight: '90vh', // Para evitar que se salga de la pantalla
    overflow: 'hidden'
  },
  header: {
    padding: '15px 25px',
    backgroundColor: '#fff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #eee'
  },
  title: {
    margin: 0, fontSize: '18px', fontWeight: '800', color: '#1a2a3a'
  },
  closeButton: {
    background: 'none', border: 'none', cursor: 'pointer', color: '#666'
  },
  content: {
      padding: '20px',
      overflowY: 'auto', // Scroll solo en el contenido si es muy largo
  },
  detailsCard: {
      backgroundColor: '#fff',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      marginBottom: '20px'
  },
  cardHeaderInfo: {
      marginBottom: '10px'
  },
  detailRow: {
      display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '13px'
  },
  detailLabel: {
      color: '#888', fontWeight: '500'
  },
  detailValue: {
      fontWeight: '600', color: '#333'
  },
  // Lista de Productos
  productsList: {
      margin: '15px 0',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
  },
  productItemRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '13px'
  },
  productNameGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
  },
  qtyBadge: {
      backgroundColor: '#f0f0f0',
      padding: '2px 6px',
      borderRadius: '4px',
      fontWeight: '700',
      fontSize: '11px',
      color: '#333'
  },
  productName: {
      color: '#1a2a3a',
      fontWeight: '500'
  },
  productPrice: {
      color: '#666',
      fontWeight: '600'
  },
  divider: {
      height: '1px', backgroundColor: '#eee', margin: '15px 0'
  },
  totalRow: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  },
  totalLabel: {
      fontSize: '16px', fontWeight: '700', color: '#1a2a3a'
  },
  totalValue: {
      fontSize: '22px', fontWeight: '800', color: '#FF9F43'
  },
  paymentSection: {
      marginTop: '5px'
  },
  sectionTitle: {
      fontSize: '14px', fontWeight: '700', color: '#333', marginBottom: '10px'
  },
  methodsContainer: {
      display: 'flex', flexDirection: 'column', gap: '10px'
  },
  methodOption: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px', borderRadius: '10px', borderWidth: '1px', borderStyle: 'solid',
      cursor: 'pointer', transition: 'all 0.2s'
  },
  cashInputContainer: {
      marginTop: '15px',
      backgroundColor: '#fff',
      padding: '15px',
      borderRadius: '10px',
      border: '1px solid #eee'
  },
  inputLabel: {
      fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '8px', display: 'block'
  },
  input: {
      width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd',
      fontSize: '18px', outline: 'none', boxSizing: 'border-box', fontWeight: '600'
  },
  // Estilos del Cambio
  changeDisplay: {
      marginTop: '15px',
      paddingTop: '15px',
      borderTop: '1px dashed #ddd',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
  },
  changeLabel: {
      fontSize: '14px',
      color: '#666',
      fontWeight: '600'
  },
  changeValue: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#28C76F' // Verde éxito
  },
  footer: {
      padding: '20px 25px', backgroundColor: '#fff', borderTop: '1px solid #eee',
      display: 'flex', gap: '15px'
  },
  backButton: {
      flex: 1, padding: '14px', borderRadius: '10px', border: '1px solid #ddd',
      backgroundColor: '#fff', color: '#666', fontSize: '14px', fontWeight: '600',
      cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center'
  },
  confirmButton: {
      flex: 2, padding: '14px', borderRadius: '10px', border: 'none',
      backgroundColor: '#FF9F43', color: '#fff', fontSize: '16px', fontWeight: '700',
      cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center'
  }
};