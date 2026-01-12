import React, { useState, useEffect } from 'react';

// --- ICONOS ---
const CashIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>);
const CardIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>);
const ArrowLeftIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>);

// --- INTERFACES ---
interface OrderItem {
    name: string;
    quantity: number;
    price: number;
    id: number;
}

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onBack: () => void;
    onConfirm: (method: string) => void;
    total: number;
    clientLabelText?: string;
    customerName?: string;
    items?: OrderItem[]; // Lista de productos (Crucial para Takeout)
    orderId?: number;
    waiterName?: string;
    receivedByWaiter?: number;
    paymentMethod?: string; // Método pre-definido (Crucial para Mesa)
    isTakeout?: boolean;    // <--- LA BANDERA MAESTRA
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
    isOpen,
    onClose,
    onBack,
    onConfirm,
    total,
    clientLabelText = "CLIENTE",
    customerName = "Cliente General",
    items = [],
    orderId,
    waiterName,
    receivedByWaiter = 0,
    paymentMethod = "Efectivo",
    isTakeout = false // ⚠️ POR DEFECTO ES MESA (FALSE)
}) => {
    
    // LÓGICA DE INICIO:
    // Si es Takeout -> Inicia siempre en 'Efectivo' pero permite cambiar.
    // Si es Mesa    -> Inicia en lo que diga 'paymentMethod' (ej. Tarjeta) y se bloquea.
    const [selectedMethod, setSelectedMethod] = useState<string>(isTakeout ? 'Efectivo' : paymentMethod);
    
    // Verificamos si la selección actual es efectivo
    const isCash = selectedMethod === 'Efectivo';

    // Estado para calcular cambio
    const [amountReceived, setAmountReceived] = useState<string>('');
    const change = amountReceived ? parseFloat(amountReceived) - total : 0;

    // Efecto para resetear cuando se abre el modal
    useEffect(() => {
        if (isOpen) {
            setAmountReceived('');
            // Reiniciamos la lógica de selección al abrir
            setSelectedMethod(isTakeout ? 'Efectivo' : paymentMethod);
        }
    }, [isOpen, paymentMethod, isTakeout]);

    if (!isOpen) return null;

    return (
        <div style={styles.overlay}>
            <div style={styles.container}>
                {/* HEADER */}
                <div style={styles.header}>
                    <button onClick={onBack} style={styles.backButton}>
                        <ArrowLeftIcon /> <span style={{marginLeft: 5}}>Volver</span>
                    </button>
                    {/* El título cambia según la bandera */}
                    <h2 style={styles.title}>{isTakeout ? 'Cobrar Para Llevar' : 'Confirmar Pago Mesa'}</h2>
                    <div style={{width: 80}}></div> 
                </div>

                <div style={styles.content}>
                    {/* --- COLUMNA IZQUIERDA (INFORMACIÓN) --- */}
                    <div style={styles.leftColumn}>
                        <div style={styles.infoGroup}>
                            <p style={styles.label}>{clientLabelText}</p>
                            <h3 style={styles.customerName}>👤 {customerName}</h3>
                        </div>

                        {/* AQUÍ ESTÁ LA MAGIA DUAL */}
                        {isTakeout ? (
                            // CASO A: PARA LLEVAR (Muestra lista de productos)
                            <div style={styles.productsListContainer}>
                                <p style={styles.label}>RESUMEN DE ORDEN</p>
                                {items.length > 0 ? (
                                    <div style={styles.productsList}>
                                        {items.map((item, idx) => (
                                            <div key={idx} style={styles.productRow}>
                                                <span style={styles.prodQty}>{item.quantity}x</span>
                                                <span style={styles.prodName}>{item.name}</span>
                                                <span style={styles.prodPrice}>${(item.price * item.quantity).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{color: '#999', fontStyle: 'italic', fontSize: '14px'}}>
                                        No hay productos cargados en esta vista.
                                    </p>
                                )}
                            </div>
                        ) : (
                            // CASO B: MESA (Muestra tarjeta del mesero)
                            <div style={styles.waiterCard}>
                                <p style={{margin: '0 0 5px 0', fontSize: '13px', color: '#666'}}>
                                    👤 Atendió: <b>{waiterName || 'Mesero'}</b>
                                </p>
                                <p style={{margin: '0', fontSize: '13px', color: '#1E8E3E', fontWeight: '600'}}>
                                    💲 Recibido por mesero: ${receivedByWaiter?.toFixed(2)}
                                </p>
                                {orderId && <p style={{marginTop: 10, fontSize: 12, color: '#999'}}>Orden #{orderId}</p>}
                            </div>
                        )}

                        <div style={styles.divider}></div>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto'}}>
                            <h3 style={styles.totalLabel}>Total a Pagar:</h3>
                            <h3 style={styles.totalAmount}>${total.toFixed(2)}</h3>
                        </div>
                    </div>

                    {/* --- COLUMNA DERECHA (PAGO) --- */}
                    <div style={styles.rightColumn}>
                        <h4 style={styles.sectionTitle}>Método de Pago</h4>
                        
                        {isTakeout ? (
                            // CASO A: PARA LLEVAR (Botones seleccionables)
                            <div style={styles.methodSelectionRow}>
                                <button 
                                    style={{...styles.methodSelectBtn, ...(selectedMethod === 'Efectivo' ? styles.methodActive : {})}}
                                    onClick={() => setSelectedMethod('Efectivo')}
                                >
                                    <CashIcon /> <span>Efectivo</span>
                                </button>
                                <button 
                                    style={{...styles.methodSelectBtn, ...(selectedMethod === 'Tarjeta' ? styles.methodActive : {})}}
                                    onClick={() => setSelectedMethod('Tarjeta')}
                                >
                                    <CardIcon /> <span>Tarjeta</span>
                                </button>
                            </div>
                        ) : (
                            // CASO B: MESA (Tarjeta bloqueada informativa)
                            <div style={{...styles.methodCardLocked, borderColor: isCash ? '#FF9F43' : '#333', backgroundColor: isCash ? '#FFF5EB' : '#F8F9FA'}}>
                                <div style={{color: isCash ? '#FF9F43' : '#333'}}>{isCash ? <CashIcon /> : <CardIcon />}</div>
                                <span style={{...styles.methodTextLocked, color: isCash ? '#FF9F43' : '#333'}}>
                                    {paymentMethod} (Definido por Mesero)
                                </span>
                            </div>
                        )}

                        {/* INPUT DE CAMBIO (Solo visible si es Efectivo) */}
                        {isCash ? (
                            <div style={styles.cashSection}>
                                <label style={styles.inputLabel}>Dinero recibido:</label>
                                <div style={styles.inputWrapper}>
                                    <span style={styles.currencySymbol}>$</span>
                                    <input 
                                        type="number" 
                                        value={amountReceived}
                                        onChange={(e) => setAmountReceived(e.target.value)}
                                        placeholder="0.00"
                                        style={styles.input}
                                        autoFocus
                                    />
                                </div>
                                <div style={styles.changeRow}>
                                    <span style={styles.changeLabel}>Cambio:</span>
                                    <span style={{...styles.changeAmount, color: change < 0 ? '#dc3545' : '#1E8E3E'}}>
                                        ${change >= 0 ? change.toFixed(2) : '0.00'}
                                    </span>
                                </div>
                            </div>
                        ) : (
                             <div style={styles.cardMessage}>
                                <p>✅ Procesar cobro con <b>Tarjeta</b>.</p>
                            </div>
                        )}

                        <button 
                            style={styles.confirmButton}
                            onClick={() => onConfirm(selectedMethod)}
                            disabled={isCash && change < 0}
                        >
                            Cobrar ${total.toFixed(2)}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- ESTILOS ---
const styles: { [key: string]: React.CSSProperties } = {
    overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, backdropFilter: 'blur(5px)' },
    container: { backgroundColor: '#fff', borderRadius: '20px', width: '900px', maxWidth: '95%', height: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden' },
    header: { padding: '20px 30px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', zIndex: 10 },
    title: { margin: 0, fontSize: '20px', fontWeight: '800', color: '#111' },
    backButton: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#666', display: 'flex', alignItems: 'center' },
    content: { display: 'flex', flex: 1, overflow: 'hidden' },
    
    // IZQUIERDA
    leftColumn: { flex: 1, padding: '40px', backgroundColor: '#FAFAFA', borderRight: '1px solid #eee', display: 'flex', flexDirection: 'column', overflowY: 'auto' },
    infoGroup: { marginBottom: '20px' },
    label: { fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: '700' },
    customerName: { margin: 0, fontSize: '22px', color: '#333' },
    
    waiterCard: { backgroundColor: '#fff', padding: '15px', borderRadius: '12px', border: '1px solid #e0e0e0', marginBottom: 'auto' },
    
    // Lista de productos (Takeout)
    productsListContainer: { flex: 1, overflowY: 'auto', marginBottom: '20px', paddingRight: '5px' },
    productsList: { display: 'flex', flexDirection: 'column', gap: '8px' },
    productRow: { display: 'flex', justifyContent: 'space-between', fontSize: '14px', borderBottom: '1px dashed #e0e0e0', paddingBottom: '8px' },
    prodQty: { fontWeight: '700', color: '#FF9F43', width: '30px' },
    prodName: { flex: 1, color: '#444' },
    prodPrice: { fontWeight: '600', color: '#333' },

    divider: { height: '1px', backgroundColor: '#e0e0e0', margin: '20px 0' },
    totalLabel: { fontSize: '18px', fontWeight: '700', color: '#333' },
    totalAmount: { fontSize: '28px', fontWeight: '800', color: '#FF9F43' },

    // DERECHA
    rightColumn: { flex: 1.2, padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', backgroundColor: '#fff' },
    sectionTitle: { margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', color: '#333' },

    // Selectores Takeout
    methodSelectionRow: { display: 'flex', gap: '15px', marginBottom: '30px' },
    methodSelectBtn: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '15px', border: '1px solid #ddd', borderRadius: '12px', backgroundColor: '#fff', cursor: 'pointer', color: '#666', gap: '10px', transition: 'all 0.2s' },
    methodActive: { borderColor: '#FF9F43', backgroundColor: '#FFF5EB', color: '#FF9F43', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(255,159,67,0.2)' },

    // Tarjeta Bloqueada (Mesa)
    methodCardLocked: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '25px', borderRadius: '16px', border: '2px solid', marginBottom: '30px', width: '100%', boxSizing: 'border-box', cursor: 'default' },
    methodTextLocked: { marginTop: '10px', fontWeight: '700', fontSize: '16px' },

    // Inputs Efectivo
    cashSection: { backgroundColor: '#F8F9FA', padding: '20px', borderRadius: '12px', border: '1px solid #eee', marginBottom: '20px' },
    inputLabel: { display: 'block', marginBottom: '10px', color: '#666', fontSize: '14px' },
    inputWrapper: { display: 'flex', alignItems: 'center', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px', padding: '0 15px', marginBottom: '15px' },
    currencySymbol: { fontSize: '20px', color: '#999', marginRight: '10px' },
    input: { width: '100%', border: 'none', fontSize: '24px', fontWeight: '600', color: '#333', padding: '10px 0', outline: 'none' },
    changeRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '15px', borderTop: '1px dashed #ddd' },
    changeLabel: { fontWeight: '600', color: '#333' },
    changeAmount: { fontSize: '20px', fontWeight: '800' },

    cardMessage: { textAlign: 'center', padding: '20px', backgroundColor: '#F0F7FF', borderRadius: '12px', color: '#0056b3', marginBottom: '20px' },

    confirmButton: { width: '100%', padding: '18px', backgroundColor: '#FF9F43', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '18px', fontWeight: '700', cursor: 'pointer', marginTop: 'auto', boxShadow: '0 4px 15px rgba(255, 159, 67, 0.3)', transition: 'transform 0.1s' },
};