import React, { useState, useMemo, useEffect } from 'react';
import { PaymentModal } from './PaymentModal';
import { type OrderData } from '../context/OrdersContext';

// Servicios
import { getCategoriesService } from '../services/categoriesService';
import { getProductsAndCategoriesService } from '../services/productsService';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string; 
  image: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: (order: OrderData) => void; 
}

const PLACEHOLDER_IMG = 'https://via.placeholder.com/150?text=Sin+Imagen';

// Iconos (Sin cambios)
const CloseIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const TrashIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF4C4C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const PlusSmall = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const MinusSmall = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const CheckIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;

export const NewOrderModal: React.FC<NewOrderModalProps> = ({ isOpen, onClose, onOrderCreated }) => {
  const [customerName, setCustomerName] = useState('');
  
  const [categories, setCategories] = useState<string[]>(['Todas']);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCustomerName('');
      setCart([]);
      setActiveCategory('Todas');
      setShowPaymentModal(false);
      setIsLoading(true);
      
      const fetchData = async () => {
        try {
            // Pedimos TODO al mismo tiempo
            const [categoriesData, productsData] = await Promise.all([
                getCategoriesService(),
                getProductsAndCategoriesService()
            ]);

            // 1. MAPA MAESTRO DE CATEGORÍAS (ID -> Nombre)
            // Usamos categoriesData (/categories) porque es la lista COMPLETA y real
            const masterCategoryMap: Record<number, string> = {};
            const tabsList: string[] = [];

            if (Array.isArray(categoriesData)) {
                categoriesData.forEach((cat: any) => {
                    // Guardamos: ID 6 -> "Sopas"
                    masterCategoryMap[cat.id] = cat.nombre; 
                    tabsList.push(cat.nombre);
                });
            }

            // Configuramos las pestañas
            const uniqueTabs = Array.from(new Set(tabsList));
            setCategories(['Todas', ...uniqueTabs]);

            // 2. PROCESAR PRODUCTOS
            // Ahora asignamos el nombre de la categoría al producto usando el Mapa Maestro
            if (productsData.productos && Array.isArray(productsData.productos)) {
                const mappedProducts: Product[] = productsData.productos.map((p: any) => ({
                    id: p.id,
                    name: p.nombre,
                    price: p.precio,
                    // AQUÍ ESTABA EL ERROR ANTES:
                    // Ahora buscamos el categoryId (ej: 6) en el mapa maestro que creamos arriba
                    category: masterCategoryMap[p.categoryId] || 'Otros', 
                    image: p.imagen || PLACEHOLDER_IMG
                }));
                
                setProducts(mappedProducts);
            }

        } catch (error) {
            console.error("❌ Error cargando datos:", error);
        } finally {
            setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [isOpen]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'Todas') return products;
    // Ahora sí coincidirán perfectamente "Sopas" === "Sopas"
    return products.filter(p => p.category === activeCategory);
  }, [activeCategory, products]);

  const total = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }, [cart]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handlePayNow = () => {
    if (cart.length > 0) setShowPaymentModal(true);
  };

  const createOrderObject = (paid: boolean): OrderData => {
    return {
        id: `00${Math.floor(Math.random() * 1000)}`,
        customerName: customerName,
        customerPhone: '', 
        itemCount: cart.reduce((acc, item) => acc + item.quantity, 0),
        total: total,
        status: 'Pendiente', 
        isPaid: paid, 
        date: new Date(),
        items: cart
    };
  };

  const handlePaymentSuccess = () => {
    const newOrder = createOrderObject(true); 
    onOrderCreated(newOrder); 
    setShowPaymentModal(false); 
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modalContainer}>
        <div style={styles.header}>
          <h2 style={styles.title}>Nuevo Pedido</h2>
          <button onClick={onClose} style={styles.closeButton}>
            <span style={{marginRight: '5px'}}>Cancelar</span> 
            <CloseIcon />
          </button>
        </div>

        <div style={styles.scrollContent}>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Datos del Cliente</h3>
            <div style={styles.formRow}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Nombre</label>
                <input 
                  type="text" 
                  placeholder="Nombre del cliente" 
                  style={styles.input} 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div style={styles.categoriesRow}>
            {isLoading ? (
                <span style={{fontSize:'14px', color:'#888', padding:'10px'}}>Cargando menú...</span>
            ) : (
                categories.map((cat, index) => (
                <button
                    key={index}
                    style={{
                    ...styles.categoryTab,
                    backgroundColor: activeCategory === cat ? '#FF9F43' : '#FFFFFF',
                    color: activeCategory === cat ? '#FFFFFF' : '#333',
                    border: activeCategory === cat ? 'none' : '1px solid #eee'
                    }}
                    onClick={() => setActiveCategory(cat)}
                >
                    {cat}
                </button>
                ))
            )}
          </div>

          <div style={styles.productsGrid}>
            {filteredProducts.map(product => (
              <div 
                key={product.id} 
                style={styles.productCard}
                onClick={() => addToCart(product)}
              >
                <img 
                    src={product.image} 
                    alt={product.name} 
                    style={styles.productImage} 
                    onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMG; }}
                />
                <div style={styles.productInfo}>
                  <h4 style={styles.productName}>{product.name}</h4>
                  <span style={styles.productPrice}>${product.price.toFixed(2)}</span>
                </div>
              </div>
            ))}
            
            {!isLoading && filteredProducts.length === 0 && (
                <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '30px', color: '#999'}}>
                    <p>No hay productos en <strong>"{activeCategory}"</strong>.</p>
                </div>
            )}
          </div>

          <div style={styles.summarySection}>
            <h3 style={styles.sectionTitle}>Resumen del Pedido</h3>
            
            {cart.length === 0 ? (
                <p style={{color: '#999', fontStyle: 'italic', marginBottom: '20px', textAlign: 'center'}}>
                    Selecciona productos para agregar al carrito.
                </p>
            ) : (
                <div style={styles.cartList}>
                {cart.map(item => (
                    <div key={item.id} style={styles.cartItem}>
                    <div style={{flex: 1}}>
                        <span style={styles.cartItemName}>{item.name}</span>
                        <div style={styles.cartItemPrice}>${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                    <div style={styles.quantityControls}>
                        <button style={styles.qtyBtn} onClick={() => updateQuantity(item.id, -1)}><MinusSmall /></button>
                        <span style={styles.qtyText}>{item.quantity}</span>
                        <button style={styles.qtyBtn} onClick={() => updateQuantity(item.id, 1)}><PlusSmall /></button>
                    </div>
                    <button style={styles.deleteBtn} onClick={() => removeFromCart(item.id)}>
                        <TrashIcon />
                    </button>
                    </div>
                ))}
                </div>
            )}
            <div style={styles.divider}></div>
            <div style={styles.totalRow}>
                <span>Subtotal:</span>
                <span>${total.toFixed(2)}</span>
            </div>
            <div style={styles.totalRowLarge}>
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
            </div>
            <div style={styles.actionsFooter}>
                <button 
                    style={{
                        ...styles.actionButton,
                        backgroundColor: '#FF9F43', 
                        opacity: cart.length === 0 ? 0.5 : 1,
                        cursor: cart.length === 0 ? 'not-allowed' : 'pointer'
                    }}
                    disabled={cart.length === 0}
                    onClick={handlePayNow}
                >
                    <CheckIcon />
                    <span style={{marginLeft: '8px'}}>Pagar</span>
                </button>
            </div>
          </div>
        </div>
      </div>
      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={onClose} 
        onBack={() => setShowPaymentModal(false)}
        onConfirm={handlePaymentSuccess}
        total={total}
        customerName={customerName}
        customerPhone={''} 
        items={cart}
      />
    </div>
  );
};

// Estilos (sin cambios)
const styles: { [key: string]: React.CSSProperties } = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, backdropFilter: 'blur(2px)' },
  modalContainer: { backgroundColor: '#F8F9FA', width: '90%', maxWidth: '650px', height: '90vh', borderRadius: '16px', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', overflow: 'hidden' },
  header: { padding: '20px 25px', backgroundColor: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' },
  title: { margin: 0, fontSize: '22px', fontWeight: '800', color: '#1a2a3a' },
  closeButton: { background: 'none', border: 'none', display: 'flex', alignItems: 'center', color: '#666', fontSize: '16px', cursor: 'pointer' },
  scrollContent: { flex: 1, overflowY: 'auto', padding: '25px' },
  section: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' },
  sectionTitle: { margin: '0 0 15px 0', fontSize: '16px', fontWeight: '700', color: '#1a2a3a' },
  formRow: { display: 'flex', width: '100%' },
  inputGroup: { flex: 1, display: 'flex', flexDirection: 'column' },
  label: { fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#333' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', outline: 'none', backgroundColor: '#FFFFFF', color: '#000000', fontWeight: '500' },
  categoriesRow: { display: 'flex', gap: '10px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '5px' },
  categoryTab: { padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' },
  productsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '15px', marginBottom: '25px' },
  productCard: { backgroundColor: '#fff', borderRadius: '12px', padding: '10px', cursor: 'pointer', transition: 'transform 0.1s', boxShadow: '0 2px 5px rgba(0,0,0,0.02)', border: '1px solid transparent', display: 'flex', flexDirection: 'column' },
  productImage: { width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' },
  productInfo: { textAlign: 'left' },
  productName: { margin: '0 0 5px 0', fontSize: '14px', fontWeight: '600', color: '#1a2a3a', lineHeight: '1.2' },
  productPrice: { fontSize: '15px', fontWeight: '800', color: '#FF9F43' },
  summarySection: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' },
  cartList: { marginBottom: '20px' },
  cartItem: { display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f5f5f5' },
  cartItemName: { fontSize: '14px', fontWeight: '600', color: '#333', display: 'block' },
  cartItemPrice: { fontSize: '13px', color: '#888' },
  quantityControls: { display: 'flex', alignItems: 'center', marginRight: '15px', backgroundColor: '#F3F4F6', borderRadius: '8px', padding: '2px' },
  qtyBtn: { background: 'none', border: 'none', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#333' },
  qtyText: { fontSize: '15px', fontWeight: '700', color: '#000000', minWidth: '24px', textAlign: 'center', margin: '0 2px' },
  deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '5px' },
  divider: { height: '1px', backgroundColor: '#eee', margin: '15px 0' },
  totalRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px', color: '#666' },
  totalRowLarge: { display: 'flex', justifyContent: 'space-between', marginBottom: '25px', fontSize: '18px', fontWeight: '800', color: '#1a2a3a' },
  actionsFooter: { display: 'flex', gap: '15px', marginTop: '10px' },
  actionButton: { flex: 1, padding: '16px', borderRadius: '12px', border: 'none', fontSize: '15px', fontWeight: '700', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'opacity 0.2s', color: '#ffffff' }
};