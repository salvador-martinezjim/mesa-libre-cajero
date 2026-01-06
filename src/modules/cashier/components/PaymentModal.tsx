import React, { useState } from 'react';
// Importamos el servicio nuevo
import { createOrderService } from '../services/ordersService';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onConfirm: () => void; // Esto limpia el carrito en el padre
  total: number;
  customerName: string;
  customerPhone: string;
  items: any[];
}

// Iconos
const ArrowLeft = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
const CashIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>;
const CardIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>;

export const PaymentModal: React.FC<PaymentModalProps> = ({ 
    isOpen, onClose, onBack, onConfirm, total, customerName, items 
}) => {
  
  const [method, setMethod] = useState<'cash' | 'card'>('cash');
  const [loading, setLoading] = useState(false); // Estado de carga
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirmPayment = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
        // 1. Llamamos al backend
        await createOrderService(customerName, items, total, method);
        
        // 2. Si todo sale bien, avisamos y cerramos
        alert("✅ ¡Orden enviada a cocina correctamente!");
        onConfirm(); // Esto limpia el carrito en NewOrderModal

    } catch (error: any) {
        console.error(error);
        // Si el back manda un mensaje de error legible, lo mostramos
        if (error.response && error.response.data && error.response.data.message) {
            setErrorMsg(`Error: ${error.response.data.message}`);
        } else {
            setErrorMsg("Ocurrió un error al procesar el pedido.");
        }
    } finally {
        setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        
        {/* Header */}
        <div style={styles.header}>
          <button onClick={onBack} style={styles.backBtn} disabled={loading}>
            <ArrowLeft />
          </button>
          <h2 style={styles.title}>Método de Pago</h2>
          <div style={{width: 24}}></div> 
        </div>

        {/* Mensaje de Error */}
        {errorMsg && (
            <div style={{backgroundColor: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '8px', marginBottom: '15px', textAlign: 'center'}}>
                {errorMsg}
            </div>
        )}

        <div style={styles.content}>
          <div style={styles.totalContainer}>
            <span style={styles.totalLabel}>Total a Pagar</span>
            <span style={styles.totalAmount}>${total.toFixed(2)}</span>
          </div>

          <div style={styles.methodsGrid}>
            <button 
              style={{
                ...styles.methodCard,
                borderColor: method === 'cash' ? '#FF9F43' : '#eee',
                backgroundColor: method === 'cash' ? '#FFF5EB' : '#fff'
              }}
              onClick={() => setMethod('cash')}
              disabled={loading}
            >
              <div style={{...styles.iconBox, color: method === 'cash' ? '#FF9F43' : '#666'}}>
                <CashIcon />
              </div>
              <span style={styles.methodName}>Efectivo</span>
            </button>

            <button 
              style={{
                ...styles.methodCard,
                borderColor: method === 'card' ? '#FF9F43' : '#eee',
                backgroundColor: method === 'card' ? '#FFF5EB' : '#fff'
              }}
              onClick={() => setMethod('card')}
              disabled={loading}
            >
              <div style={{...styles.iconBox, color: method === 'card' ? '#FF9F43' : '#666'}}>
                <CardIcon />
              </div>
              <span style={styles.methodName}>Tarjeta</span>
            </button>
          </div>
        </div>

        <div style={styles.footer}>
          <button 
            style={{
                ...styles.confirmBtn,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
            }} 
            onClick={handleConfirmPayment}
            disabled={loading}
          >
            {loading ? 'Procesando...' : `Cobrar $${total.toFixed(2)}`}
          </button>
        </div>

      </div>
    </div>
  );
};

// --- Estilos ---
const styles: { [key: string]: React.CSSProperties } = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 },
  modal: { backgroundColor: '#fff', width: '90%', maxWidth: '400px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid #eee' },
  backBtn: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex' },
  title: { fontSize: '18px', fontWeight: '700', margin: 0 },
  content: { padding: '25px' },
  totalContainer: { textAlign: 'center', marginBottom: '30px' },
  totalLabel: { display: 'block', fontSize: '14px', color: '#666', marginBottom: '5px' },
  totalAmount: { fontSize: '36px', fontWeight: '800', color: '#333' },
  methodsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  methodCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', borderRadius: '12px', border: '2px solid #eee', cursor: 'pointer', transition: 'all 0.2s' },
  iconBox: { marginBottom: '10px' },
  methodName: { fontWeight: '600', fontSize: '14px' },
  footer: { padding: '20px', borderTop: '1px solid #eee' },
  confirmBtn: { width: '100%', padding: '16px', backgroundColor: '#FF9F43', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700' }
};