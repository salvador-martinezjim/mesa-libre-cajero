import React, { useState, useEffect } from 'react';
// Importamos AMBOS servicios
import { createOrderService, payOrderService } from '../services/ordersService';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onConfirm: (method: string) => void;
  total: number;
  customerName: string;
  customerPhone: string;
  items: any[];
  
  // Props opcionales
  waiterName?: string;
  receivedByWaiter?: number;
  orderDate?: string;
  orderId?: number; 
  paymentId?: number; // <--- NUEVO: ID del pago específico para el PATCH
}

// ... (ICONOS SE MANTIENEN IGUAL) ...
const ArrowLeft = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
const CashIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>;
const CardIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>;
const ReceiptIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const UserIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const WaiterIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>;
const CalendarIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const MoneyHandIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1E8E3E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;

export const PaymentModal: React.FC<PaymentModalProps> = ({ 
    isOpen, onClose, onBack, onConfirm, total, customerName, items, 
    waiterName, receivedByWaiter, orderDate, orderId, paymentId // <--- AGREGADO paymentId
}) => {
  
  const [method, setMethod] = useState<'cash' | 'card'>('cash');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cashReceivedStr, setCashReceivedStr] = useState('');
  const [change, setChange] = useState(0);

  const formattedDate = orderDate ? new Date(orderDate).toLocaleString('es-MX', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  }) : '';

  useEffect(() => {
    if (isOpen) {
        setCashReceivedStr('');
        setChange(0);
        setErrorMsg(null);
        setMethod('cash');
    }
  }, [isOpen, total]);

  useEffect(() => {
    if (method === 'cash' && cashReceivedStr) {
        const received = parseFloat(cashReceivedStr);
        if (!isNaN(received)) setChange(received - total);
        else setChange(0);
    } else {
        setChange(0);
    }
  }, [cashReceivedStr, total, method]);

  const handleConfirmPayment = async () => {
    setErrorMsg(null);
    let finalCashAmount = 0;
    
    if (method === 'cash') {
        finalCashAmount = parseFloat(cashReceivedStr);
        if (isNaN(finalCashAmount) || finalCashAmount < total) {
            setErrorMsg("❌ El monto recibido es menor al total.");
            return;
        }
    }

    setLoading(true);

    try {
        // --- LÓGICA BILINGÜE ACTUALIZADA ---
        // Verificamos si tenemos TANTO orderId COMO paymentId (Mesa existente)
        if (orderId && paymentId) {
            // CASO A: Mesa existente (Usamos PATCH con paymentId)
            console.log(`Actualizando pago ${paymentId} de orden ${orderId}...`);
            await payOrderService(orderId, paymentId, method, finalCashAmount);
        } else {
            // CASO B: Nuevo pedido para llevar (Creamos orden - POST)
            console.log("Creando nueva orden...");
            await createOrderService(customerName, items, total, method, finalCashAmount);
        }
        
        alert(`✅ ¡Cobro exitoso!\n\n${method === 'cash' ? `Cambio a devolver: $${change.toFixed(2)}` : ''}`);
        onConfirm(method === 'cash' ? 'Efectivo' : 'Tarjeta'); 

    } catch (error: any) {
        console.error("Error en pago:", error);
        if (error.response && error.response.data && error.response.data.message) {
            setErrorMsg(`Error: ${error.response.data.message}`);
        } else {
            setErrorMsg("Ocurrió un error al procesar el pedido.");
        }
    } finally {
        setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <button onClick={onBack} style={styles.backBtn} disabled={loading}>
            <ArrowLeft />
            <span style={{marginLeft: 5, fontWeight: 600}}>Volver</span>
          </button>
          <h2 style={styles.title}>Confirmar Pago</h2>
          <div style={{width: 60}}></div> 
        </div>

        <div style={styles.bodyContent}>
            {/* Resumen (Izquierda) */}
            <div style={styles.summaryColumn}>
                <div style={styles.customerInfo}>
                    <div style={styles.infoRow}>
                        <UserIcon />
                        <span style={styles.customerName}>{customerName || "Cliente Mostrador"}</span>
                    </div>
                </div>

                {/* Info del Mesero */}
                {waiterName && (
                    <div style={styles.waiterInfoBox}>
                        <div style={styles.waiterRow}>
                            <WaiterIcon />
                            <span>Atendió: <strong>{waiterName}</strong></span>
                        </div>
                        {orderDate && (
                            <div style={styles.waiterRow}>
                                <CalendarIcon />
                                <span>{formattedDate}</span>
                            </div>
                        )}
                        {receivedByWaiter !== undefined && (
                            <div style={styles.waiterRow}>
                                <MoneyHandIcon />
                                <span>Recibido por mesero: <strong style={{color: '#1E8E3E'}}>${receivedByWaiter.toFixed(2)}</strong></span>
                            </div>
                        )}
                    </div>
                )}

                <div style={styles.orderLabel}>
                    <ReceiptIcon />
                    <span>Resumen </span>
                </div>
                <div style={styles.itemsList}>
                    {items.map((item, index) => (
                        <div key={index} style={styles.itemRow}>
                            <div style={styles.itemQuantity}>{item.quantity || 1}x</div>
                            <div style={styles.itemDetails}>
                                <span style={styles.itemName}>{item.name || item.productoId}</span>
                                <span style={styles.itemPrice}>
                                    ${item.price ? (item.price * (item.quantity || 1)).toFixed(2) : '-'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
                <div style={styles.totalSection}>
                    <div style={styles.totalRow}>
                        <span>Total a Pagar:</span>
                        <span style={styles.totalAmount}>${total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Pago (Derecha) */}
            <div style={styles.paymentColumn}>
                <h3 style={styles.sectionTitle}>Método de Pago</h3>
                {errorMsg && <div style={styles.errorBox}>{errorMsg}</div>}

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
                        <div style={{...styles.iconBox, color: method === 'cash' ? '#FF9F43' : '#333'}}>
                            <CashIcon />
                        </div>
                        <span style={{...styles.methodName, color: method === 'cash' ? '#FF9F43' : '#333'}}>
                            Efectivo
                        </span>
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
                        <div style={{...styles.iconBox, color: method === 'card' ? '#FF9F43' : '#333'}}>
                            <CardIcon />
                        </div>
                        <span style={{...styles.methodName, color: method === 'card' ? '#FF9F43' : '#333'}}>
                            Tarjeta
                        </span>
                    </button>
                </div>

                {method === 'cash' && (
                    <div style={styles.cashInputSection}>
                        <label style={styles.cashLabel}>Dinero recibido en Caja:</label>
                        <div style={styles.inputWrapper}>
                            <span style={styles.currencySymbol}>$</span>
                            <input 
                                type="number" 
                                placeholder="0.00" 
                                style={styles.cashInput}
                                value={cashReceivedStr}
                                onChange={(e) => setCashReceivedStr(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div style={{...styles.changeRow, color: change < 0 ? '#FF4C4C' : '#1E8E3E'}}>
                            <span>Cambio:</span>
                            <span style={styles.changeAmount}>
                                {change < 0 ? 'Falta dinero' : `$${change.toFixed(2)}`}
                            </span>
                        </div>
                    </div>
                )}

                <div style={styles.paymentActions}>
                    <button 
                        style={{
                            ...styles.confirmBtn,
                            opacity: (loading || (method === 'cash' && change < 0)) ? 0.5 : 1,
                            cursor: (loading || (method === 'cash' && change < 0)) ? 'not-allowed' : 'pointer'
                        }} 
                        onClick={handleConfirmPayment}
                        disabled={loading || (method === 'cash' && change < 0)}
                    >
                        {loading ? 'Procesando...' : `Cobrar $${total.toFixed(2)}`}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

// Estilos (Se mantienen igual que en la versión anterior)
const styles: { [key: string]: React.CSSProperties } = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, backdropFilter: 'blur(3px)' },
  modal: { backgroundColor: '#fff', width: '90%', maxWidth: '850px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', maxHeight: '90vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 25px', borderBottom: '1px solid #eee', backgroundColor: '#fff' },
  backBtn: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#666', padding: 0 },
  title: { fontSize: '20px', fontWeight: '800', margin: 0, color: '#1a2a3a' },
  bodyContent: { display: 'flex', flex: 1, overflow: 'hidden', flexDirection: 'row' },
  summaryColumn: { flex: 1, padding: '25px', borderRight: '1px solid #eee', backgroundColor: '#F8F9FA', display: 'flex', flexDirection: 'column', overflowY: 'auto' },
  customerInfo: { marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #eee' },
  infoRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px', color: '#333' },
  customerName: { fontWeight: '700', fontSize: '16px' },
  waiterInfoBox: { backgroundColor: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #e0e0e0', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' },
  waiterRow: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#555' },
  orderLabel: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#666', marginTop: '5px', marginBottom: '10px' },
  itemsList: { flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', overflowY: 'auto' },
  itemRow: { display: 'flex', alignItems: 'flex-start', padding: '10px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee' },
  itemQuantity: { backgroundColor: '#E9ECEF', padding: '4px 8px', borderRadius: '6px', fontSize: '13px', fontWeight: '700', color: '#444', marginRight: '12px' },
  itemDetails: { flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  itemName: { fontSize: '14px', fontWeight: '500', color: '#333' },
  itemPrice: { fontSize: '14px', fontWeight: '700', color: '#1a2a3a' },
  totalSection: { marginTop: 'auto', paddingTop: '20px', borderTop: '2px dashed #ddd' },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '18px', fontWeight: '800', color: '#1a2a3a' },
  totalAmount: { fontSize: '24px', color: '#FF9F43' },
  paymentColumn: { flex: 0.8, padding: '30px', display: 'flex', flexDirection: 'column', backgroundColor: '#fff' },
  sectionTitle: { margin: '0 0 20px 0', fontSize: '16px', fontWeight: '700', color: '#333' },
  methodsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' },
  methodCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', borderRadius: '12px', border: '2px solid #eee', cursor: 'pointer', transition: 'all 0.2s', height: '110px' },
  iconBox: { marginBottom: '10px', transform: 'scale(1.2)' },
  methodName: { fontWeight: '700', fontSize: '15px' },
  cashInputSection: { backgroundColor: '#F8F9FA', padding: '15px', borderRadius: '12px', marginBottom: '10px', border: '1px solid #E0E0E0' },
  cashLabel: { display: 'block', fontSize: '14px', fontWeight: '600', color: '#666', marginBottom: '8px' },
  inputWrapper: { display: 'flex', alignItems: 'center', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px', padding: '5px 10px' },
  currencySymbol: { fontSize: '18px', fontWeight: '600', color: '#999', marginRight: '5px' },
  cashInput: { 
    border: 'none', 
    fontSize: '20px', 
    fontWeight: '700', 
    width: '100%', 
    outline: 'none', 
    color: '#000000', 
    backgroundColor: '#ffffff',
    colorScheme: 'light'
  },
  changeRow: { display: 'flex', justifyContent: 'space-between', marginTop: '15px', fontSize: '16px', fontWeight: '700', paddingTop: '10px', borderTop: '1px dashed #ccc' },
  changeAmount: { fontSize: '20px' },
  errorBox: { backgroundColor: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center', border: '1px solid #ef9a9a' },
  paymentActions: { marginTop: 'auto' },
  confirmBtn: { width: '100%', padding: '18px', backgroundColor: '#FF9F43', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '18px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 15px rgba(255, 159, 67, 0.4)', transition: 'all 0.2s' }
};