import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Componentes
import { TakeoutView } from '../components/TakeoutView';
import { ProfileModal } from '../components/ProfileModal'; 
import { NotificationsModal } from '../components/NotificationsModal';
import { PaymentModal } from '../components/PaymentModal'; 
import { getUserFromToken } from '../../../utils/jwtUtils';
import { useAuth } from '../context/AuthContext'; 

// Servicios
import { getPendingOrdersService, type PendingOrder } from '../services/ordersService'; 

// --- Tipos ---
type TableStatus = 'available' | 'occupied';
type ViewMode = 'tables' | 'takeout';

interface Table {
  id: number;
  name: string;
  location: string;
}

// Datos fijos de tus mesas
const FIXED_TABLES: Table[] = [
  { id: 1, name: 'Mesa 1', location: 'Lobby' },
  { id: 2, name: 'Mesa 2', location: 'Lobby' },
  { id: 3, name: 'Mesa 3', location: 'Patio' },
  { id: 4, name: 'Mesa 4', location: 'Patio' },
  { id: 5, name: 'Mesa 5', location: 'Nueva Zona' },
  { id: 6, name: 'Mesa 6', location: 'Nueva Zona' },
  { id: 7, name: 'Mesa 7', location: 'Lobby' }, 
  { id: 8, name: 'Mesa 8', location: 'Terraza' },
  { id: 9, name: 'Mesa 9', location: 'Terraza' },
  { id: 10, name: 'Mesa 10', location: 'Terraza' },
  { id: 20, name: 'Mesa 20', location: 'Ejemplo Back' }, 
];

const FILTER_CATEGORIES = ['Todas', 'Lobby', 'Nueva Zona', 'Patio', 'Terraza'];

// Iconos (Sin cambios)
const SearchIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>);
const LogoutIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>);
const PeopleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#666"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>);
const TableIcon = ({ color }: {color: string}) => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h18v18H3zM9 3v18M15 3v18M3 9h18M3 15h18"/></svg>);
const BagIcon = ({ color }: {color: string}) => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>);
const WarningIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#FF9F43" strokeWidth="2"/><path d="M12 8V12" stroke="#FF9F43" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="16" r="1" fill="#FF9F43"/></svg>);
const CloseIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);
const BellIconHeader = () => (<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>);

export const TablesPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [selectedOrderToPay, setSelectedOrderToPay] = useState<PendingOrder | null>(null);

  // Estados de interfaz
  const [viewMode, setViewMode] = useState<ViewMode>('tables'); 
  const [activeCategory, setActiveCategory] = useState('Todas');
  
  // --- NUEVO: Estado para el filtro de status ---
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'occupied'>('all');

  const [searchTerm, setSearchTerm] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const [user, setUser] = useState({
    name: 'Cargando...',
    role: '',
    email: '',
    avatarUrl: 'https://img.freepik.com/vector-premium/perfil-avatar-hombre-icono-redondo_24640-14044.jpg'
  });

  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    const storedUserEmail = localStorage.getItem('userEmail');
    if (storedUserData) {
      try {
        const parsedData = JSON.parse(storedUserData);
        setUser({
          name: `${parsedData.nombre} ${parsedData.apellidoPaterno || ''}`,
          role: parsedData.tipo || 'Empleado',
          email: storedUserEmail || 'Sin correo',
          avatarUrl: parsedData.fotoUrl || 'https://img.freepik.com/vector-premium/perfil-avatar-hombre-icono-redondo_24640-14044.jpg'
        });
      } catch (e) { console.error(e); }
    }
  }, []);

  const fetchOrders = async () => {
    try {
        const data = await getPendingOrdersService();
        setPendingOrders(data);
    } catch (error) {
        console.error("Error cargando mesas:", error);
    }
  };

  useEffect(() => {
    if (viewMode === 'tables') fetchOrders();
    const interval = setInterval(() => {
        if (viewMode === 'tables') fetchOrders();
    }, 15000);
    return () => clearInterval(interval);
  }, [viewMode]);

  const getTableStatus = (tableId: number): { status: TableStatus, order?: PendingOrder } => {
    const order = pendingOrders.find(o => o.mesasIds && o.mesasIds.includes(tableId));
    if (order) return { status: 'occupied', order };
    return { status: 'available' };
  };

  const handleTableClick = (tableId: number, statusData: { status: TableStatus, order?: PendingOrder }) => {
    if (statusData.status === 'occupied' && statusData.order) {
        setSelectedOrderToPay(statusData.order);
    } else {
        navigate('/menu'); 
    }
  };

  const handlePaymentConfirmed = (method: string) => {
    alert(`Cobro registrado con ${method}.`);
    setSelectedOrderToPay(null);
    fetchOrders(); 
  };

  // --- LÓGICA DE FILTRADO MEJORADA ---
  const filteredTables = FIXED_TABLES.filter(table => {
    // 1. Calculamos el estado actual de la mesa (en tiempo real)
    const { status } = getTableStatus(table.id);

    // 2. Filtro por Estado (Nuevo)
    const matchesStatus = 
        statusFilter === 'all' || 
        status === statusFilter;

    // 3. Filtro por Buscador
    const matchesSearch = table.name.toLowerCase().includes(searchTerm.toLowerCase());

    // 4. Filtro por Ubicación (Categoría)
    const matchesCategory = activeCategory === 'Todas' || table.location === activeCategory;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div style={styles.pageContainer}>
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} user={user} />
      <NotificationsModal isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />

      {/* Modal de Pago para Mesas */}
      {selectedOrderToPay && (
        <PaymentModal
            isOpen={!!selectedOrderToPay}
            onClose={() => setSelectedOrderToPay(null)}
            onBack={() => setSelectedOrderToPay(null)}
            onConfirm={handlePaymentConfirmed}
            // Datos básicos
            total={selectedOrderToPay.pagos[0]?.total || 0} 
            customerName={selectedOrderToPay.detallesOrden?.comensal || "Cliente Mesa"}
            customerPhone=""
            items={selectedOrderToPay.detallesOrden?.orderDetailDTOs || []} 
            orderId={selectedOrderToPay.id}
            
            // Datos del mesero
            waiterName={selectedOrderToPay.pagos[0]?.mesero?.nombre} 
            receivedByWaiter={selectedOrderToPay.pagos[0]?.efectivoRecibidoMesero}
            orderDate={selectedOrderToPay.pagos[0]?.fechaHoraEntregaEfectivo}
        />
      )}

      {isLogoutModalOpen && (
          <div style={styles.modalOverlay}>
              <div style={styles.logoutModalContent}>
                  <div style={styles.logoutModalHeader}>
                      <div style={styles.logoutTitleContainer}>
                          <div style={styles.warningIconWrapper}><WarningIcon /></div>
                          <h3 style={styles.logoutTitle}>Cerrar Sesión</h3>
                      </div>
                      <button style={styles.closeModalButton} onClick={() => setIsLogoutModalOpen(false)}><CloseIcon /></button>
                  </div>
                  <div style={styles.logoutModalBody}>
                      <p style={styles.logoutQuestion}>¿Estás seguro que quieres cerrar sesión?</p>
                      <p style={styles.logoutDescription}>Tendrás que ingresar tus credenciales nuevamente.</p>
                  </div>
                  <div style={styles.logoutModalFooter}>
                      <button style={styles.cancelButton} onClick={() => setIsLogoutModalOpen(false)}>Cancelar</button>
                      <button style={styles.confirmButton} onClick={() => { setIsLogoutModalOpen(false); logout(); }}>Sí, cerrar sesión</button>
                  </div>
              </div>
          </div>
      )}

      <header style={styles.header}>
        <div style={{...styles.userInfo, cursor: 'pointer'}} onClick={() => setIsProfileOpen(true)}>
          <img src={user.avatarUrl} alt="User Avatar" style={styles.mainAvatar} />
          <div>
            <h2 style={styles.userName}>{user.name}</h2>
            <p style={styles.userRole}>{user.role}</p>
          </div>
        </div>
        <div style={styles.headerActions}>
          <div style={styles.modeSwitchContainer}>
            <div style={{...styles.switchOption, backgroundColor: viewMode === 'tables' ? '#fff' : 'transparent', boxShadow: viewMode === 'tables' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none'}} onClick={() => setViewMode('tables')}>
                <TableIcon color={viewMode === 'tables' ? '#FF9F43' : '#999'} />
                <span style={{...styles.switchText, color: viewMode === 'tables' ? '#333' : '#999'}}>Mesas</span>
            </div>
            <div style={{...styles.switchOption, backgroundColor: viewMode === 'takeout' ? '#fff' : 'transparent', boxShadow: viewMode === 'takeout' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none'}} onClick={() => setViewMode('takeout')}>
                 <BagIcon color={viewMode === 'takeout' ? '#FF9F43' : '#999'} />
                 <span style={{...styles.switchText, color: viewMode === 'takeout' ? '#333' : '#999'}}>Llevar</span>
            </div>
          </div>
          <button style={styles.iconButton} title="Notificaciones" onClick={() => setIsNotificationsOpen(true)}><BellIconHeader /></button>
          <button style={styles.iconButton} title="Cerrar Sesión" onClick={() => setIsLogoutModalOpen(true)}><LogoutIcon /></button>
        </div>
      </header>

      {viewMode === 'tables' ? (
        <>
            <div style={styles.controlsContainer}>
                <div style={styles.leftControlsGroup}>
                    <div style={styles.searchContainer}>
                        <div style={styles.searchIconWrapper}><SearchIcon /></div>
                        <input type="text" placeholder="Buscar mesa..." style={styles.searchInput} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>

                    {/* --- NUEVO: Botones de filtro de Estado --- */}
                    <div style={styles.statusFilterContainer}>
                        <button 
                            style={{
                                ...styles.statusFilterBtn, 
                                backgroundColor: statusFilter === 'all' ? '#333' : '#eee',
                                color: statusFilter === 'all' ? '#fff' : '#666'
                            }}
                            onClick={() => setStatusFilter('all')}
                        >
                            Todas
                        </button>
                        <button 
                            style={{
                                ...styles.statusFilterBtn, 
                                backgroundColor: statusFilter === 'available' ? '#1E8E3E' : '#eee',
                                color: statusFilter === 'available' ? '#fff' : '#666'
                            }}
                            onClick={() => setStatusFilter('available')}
                        >
                            Disponibles
                        </button>
                        <button 
                            style={{
                                ...styles.statusFilterBtn, 
                                backgroundColor: statusFilter === 'occupied' ? '#FF9F43' : '#eee',
                                color: statusFilter === 'occupied' ? '#fff' : '#666'
                            }}
                            onClick={() => setStatusFilter('occupied')}
                        >
                            Ocupadas
                        </button>
                    </div>
                    {/* ------------------------------------------ */}

                </div>
                
                <div style={styles.categoriesContainer}>
                {FILTER_CATEGORIES.map(category => (
                    <button key={category} style={{...styles.categoryPill, backgroundColor: activeCategory === category ? '#FF9F43' : '#FFFFFF', color: activeCategory === category ? '#FFFFFF' : '#666666', border: activeCategory === category ? 'none' : '1px solid #E0E0E0'}} onClick={() => setActiveCategory(category)}>
                    {category}
                    </button>
                ))}
                </div>
            </div>

            <div style={styles.tablesGrid}>
                {filteredTables.map(table => {
                    const { status, order } = getTableStatus(table.id);
                    
                    const isOccupied = status === 'occupied';
                    const borderColor = isOccupied ? '#FF9F43' : '#D1E7DD';
                    const statusLabel = isOccupied ? 'OCUPADA / POR PAGAR' : 'DISPONIBLE';
                    const statusBg = isOccupied ? '#FFF5EB' : '#E6F4EA';
                    const statusColor = isOccupied ? '#FF9F43' : '#1E8E3E';

                    return (
                    <div 
                        key={table.id} 
                        style={{...styles.tableCard, border: `2px solid ${borderColor}`}} 
                        onClick={() => handleTableClick(table.id, { status, order })}
                    >
                        <div style={styles.cardHeader}>
                            <h3 style={styles.tableName}>{table.name}</h3>
                            <span style={{...styles.statusBadge, backgroundColor: statusBg, color: statusColor}}>
                                {statusLabel}
                            </span>
                        </div>
                        <p style={styles.tableLocation}>{table.location}</p>
                        <div style={styles.peopleCountPill}>
                            <PeopleIcon />
                            <span style={styles.peopleCountText}>
                                {isOccupied ? `Orden #${order?.id}` : '0 personas'}
                            </span>
                        </div>
                        <div style={styles.cardFooter}>
                            {isOccupied && order ? (
                                <div style={{width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <span style={{fontSize: '14px', color: '#666'}}>Total:</span>
                                    <span style={{fontSize: '18px', fontWeight: '800', color: '#333'}}>
                                        ${order.pagos[0]?.total.toFixed(2)}
                                    </span>
                                </div>
                            ) : (
                                <span style={styles.waiterLabelEmpty}>Lista para usar</span>
                            )}
                        </div>
                    </div>
                    )
                })}
            </div>
        </>
      ) : (
        <TakeoutView />
      )}
    </div>
  );
};

// --- Estilos ---
const styles: { [key: string]: React.CSSProperties } = {
  pageContainer: { backgroundColor: '#F8F9FA', minHeight: '100vh', width: '100%', maxWidth: '100vw', padding: '40px 60px', boxSizing: 'border-box', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', width: '100%' },
  userInfo: { display: 'flex', alignItems: 'center', transition: 'opacity 0.2s' },
  mainAvatar: { width: '64px', height: '64px', borderRadius: '50%', marginRight: '20px', border: '3px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', objectFit: 'cover' },
  userName: { margin: 0, fontSize: '24px', fontWeight: '700', color: '#333' },
  userRole: { margin: 0, fontSize: '16px', color: '#999' },
  headerActions: { display: 'flex', alignItems: 'center', gap: '25px' },
  iconButton: { background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '8px' },
  modeSwitchContainer: { display: 'flex', backgroundColor: '#E9ECEF', padding: '4px', borderRadius: '12px', gap: '4px' },
  switchOption: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.3s ease', userSelect: 'none' },
  switchText: { fontSize: '14px', fontWeight: '600' },
  
  // Controls
  controlsContainer: { display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', marginBottom: '35px', gap: '20px', flexWrap: 'wrap' },
  leftControlsGroup: { display: 'flex', alignItems: 'center', gap: '20px', flex: 1, minWidth: '400px' },
  
  searchContainer: { flex: 1, position: 'relative', display: 'flex', alignItems: 'center', maxWidth: '350px' },
  searchIconWrapper: { position: 'absolute', left: '20px', display: 'flex', pointerEvents: 'none' },
  searchInput: { width: '100%', height: '65px', padding: '0 20px 0 50px', borderRadius: '12px', border: '1px solid #eee', backgroundColor: '#FFFFFF', fontSize: '16px', color: '#333333', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', outline: 'none', boxSizing: 'border-box' },

  // --- Estilos para filtro de status (NUEVOS) ---
  statusFilterContainer: { display: 'flex', gap: '5px', backgroundColor: '#e0e0e0', padding: '5px', borderRadius: '12px' },
  statusFilterBtn: { border: 'none', padding: '12px 15px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.2s' },

  categoriesContainer: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  categoryPill: { padding: '10px 20px', borderRadius: '25px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 2px 5px rgba(0,0,0,0.02)', transition: 'all 0.2s' },
  
  tablesGrid: { display: 'grid', width: '100%', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' },
  tableCard: { backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '30px', boxShadow: '0 8px 20px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  tableName: { margin: 0, fontSize: '24px', fontWeight: '800', color: '#333' },
  statusBadge: { padding: '8px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' },
  tableLocation: { margin: '0 0 25px 0', fontSize: '16px', color: '#999', fontWeight: '500' },
  peopleCountPill: { display: 'inline-flex', alignItems: 'center', backgroundColor: '#F5F6FA', padding: '10px 16px', borderRadius: '12px', marginBottom: '35px', alignSelf: 'flex-start' },
  peopleCountText: { marginLeft: '10px', fontSize: '16px', fontWeight: '600', color: '#666' },
  cardFooter: { marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0f0f0', paddingTop: '20px', minHeight: '40px' },
  waiterLabelEmpty: { fontSize: '14px', color: '#ccc', fontStyle: 'italic' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  logoutModalContent: { backgroundColor: '#fff', borderRadius: '16px', padding: '30px', width: '500px', maxWidth: '90%', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' },
  logoutModalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  logoutTitleContainer: { display: 'flex', alignItems: 'center', gap: '12px' },
  warningIconWrapper: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#FFF5EB', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  logoutTitle: { margin: 0, fontSize: '20px', fontWeight: '700', color: '#333' },
  closeModalButton: { background: 'none', border: 'none', cursor: 'pointer', padding: '5px' },
  logoutModalBody: { marginBottom: '30px' },
  logoutQuestion: { fontSize: '18px', fontWeight: '500', color: '#444', marginBottom: '10px' },
  logoutDescription: { fontSize: '14px', color: '#666', lineHeight: '1.5', margin: 0 },
  logoutModalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '15px' },
  cancelButton: { padding: '12px 24px', borderRadius: '8px', border: '1px solid #E0E0E0', backgroundColor: '#fff', color: '#333', fontSize: '15px', fontWeight: '600', cursor: 'pointer', transition: 'background-color 0.2s' },
  confirmButton: { padding: '12px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#FF9F43', color: '#fff', fontSize: '15px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 10px rgba(255, 159, 67, 0.2)' },
};