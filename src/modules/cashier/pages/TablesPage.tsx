import React, { useState, useEffect, useRef } from 'react'; 
import { useNavigate } from 'react-router-dom';

// Componentes
import { TakeoutView } from '../components/TakeoutView';
import { ProfileModal } from '../components/ProfileModal'; 
import { NotificationsModal } from '../components/NotificationsModal';
import { PaymentModal } from '../components/PaymentModal'; 
import { useAuth } from '../context/AuthContext'; 

// Servicios
import { getPendingOrdersService, getOrderDetailsListService, type PendingOrder } from '../services/ordersService';

// --- Tipos Existentes ---
type TableStatus = 'available' | 'occupied';
type ViewMode = 'tables' | 'takeout';

interface Table {
  id: number;
  name: string;
  location: string;
  status?: TableStatus;
  order?: PendingOrder;
}

// --- TIPOS PARA EL SOCKET ---
interface SocketEvent {
    eventType: string;
    data: SocketPaymentData;
}

interface SocketPaymentData {
    OrdenId: number;
    NumeroOrden: number;
    MesasIds: number[];
    Id: number; // PaymentId
    Total: number;
    Tipo: string;
    Estado: string;
    EfectivoRecibidoMesero?: number;
    FechaHoraEntregaEfectivo: string;
    Cambio?: number;
    Mesero: {
        Id: number;
        Nombre: string;
    };
}

// --- GENERADOR AUTOMÁTICO DE MESAS ---
const FIXED_TABLES: Table[] = Array.from({ length: 50 }, (_, index) => {
  const id = index + 1;
  let location = 'Salón General';
  if (id <= 10) location = 'Lobby';
  else if (id <= 20) location = 'Patio';
  else if (id <= 30) location = 'Terraza';
  else if (id <= 40) location = 'Nueva Zona';
  else location = 'Salón Extra'; 
  return { id, name: `Mesa ${id}`, location };
});

const FILTER_CATEGORIES = ['Todas', 'Lobby', 'Nueva Zona', 'Patio', 'Terraza'];

// --- ICONOS ---
const SearchIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>);
const LogoutIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>);
const PeopleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#666"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>);
const TableIcon = ({ color }: {color: string}) => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h18v18H3zM9 3v18M15 3v18M3 9h18M3 15h18"/></svg>);
const BagIcon = ({ color }: {color: string}) => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>);
const WarningIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#FF9F43" strokeWidth="2"/><path d="M12 8V12" stroke="#FF9F43" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="16" r="1" fill="#FF9F43"/></svg>);
const CloseIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);
const BellIconHeader = () => (<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>);
const ArrowLeftIcon = () => (<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>);
const ArrowRightIcon = () => (<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>);

export const TablesPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [selectedOrderToPay, setSelectedOrderToPay] = useState<PendingOrder | null>(null);

  // Estados de interfaz
  const [viewMode, setViewMode] = useState<ViewMode>('tables'); 
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'occupied'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // --- Estado para Paginación ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; 

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Estado para el Toast de notificación
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [user, setUser] = useState({
    name: 'Cargando...',
    role: '',
    email: '',
    avatarUrl: 'https://img.freepik.com/vector-premium/perfil-avatar-hombre-icono-redondo_24640-14044.jpg'
  });

  // Referencia para el WebSocket
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    const storedUserEmail = localStorage.getItem('userEmail');
    
    if (storedUserData) {
      try {
        const parsedData = JSON.parse(storedUserData);
        const currentEmail = storedUserEmail || parsedData.email || 'sin-correo';
        const localCustomAvatar = localStorage.getItem(`avatar_${currentEmail}`);
        const finalAvatar = localCustomAvatar || parsedData.fotoUrl || 'https://img.freepik.com/vector-premium/perfil-avatar-hombre-icono-redondo_24640-14044.jpg';

        setUser({
          name: `${parsedData.nombre} ${parsedData.apellidoPaterno || ''}`,
          role: parsedData.tipo || 'Empleado',
          email: currentEmail,
          avatarUrl: finalAvatar
        });
      } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, activeCategory]);

  const fetchOrders = async () => {
    try {
        const data = await getPendingOrdersService();
        setPendingOrders(data);
    } catch (error) {
        console.error("Error cargando mesas:", error);
    }
  };

  // =========================================================
  // === 🔌 WEBSOCKETS INTEGRATION (REAL-TIME) 🔌 ===
  // =========================================================
  useEffect(() => {
    if (!ws.current) {
        const token = localStorage.getItem('token');
        
        if (!token) {
            console.warn("⚠️ No hay token, no se puede conectar al socket.");
        } else {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const socketUrl = `${protocol}//${window.location.host}/ws/orders?token=${token}`;
            
            console.log("🔌 Conectando socket a:", socketUrl);

            ws.current = new WebSocket(socketUrl);

            ws.current.onopen = () => {
                console.log('🟢 [SOCKET] Conectado al servidor de pedidos');
            };

            ws.current.onmessage = (event) => {
                try {
                    const message: SocketEvent = JSON.parse(event.data);
                    const type = message.eventType || (message as any).EventType;

                    if (type === 'NUEVO_PAGO_PENDIENTE_APROBACION') {
                        console.log('🔔 [SOCKET] Nuevo pago recibido:', message.data);
                        
                        const socketData = message.data;
                        
                        const newOrderFromSocket: PendingOrder = {
                            id: socketData.OrdenId,
                            mesasIds: socketData.MesasIds,
                            numeroOrden: socketData.NumeroOrden,
                            pagos: [{
                                id: socketData.Id,
                                total: socketData.Total,
                                estado: socketData.Estado,
                                tipo: socketData.Tipo,
                                efectivoRecibidoMesero: socketData.EfectivoRecibidoMesero,
                                fechaHoraEntregaEfectivo: socketData.FechaHoraEntregaEfectivo,
                                cambio: socketData.Cambio,
                                mesero: {
                                    id: socketData.Mesero.Id,
                                    nombre: socketData.Mesero.Nombre
                                }
                            }],
                            detallesOrden: {
                                comensal: `Mesa ${socketData.MesasIds[0] || '?'}`,
                                orderDetailDTOs: []
                            }
                        };

                        setPendingOrders(prev => {
                            const exists = prev.find(o => o.id === newOrderFromSocket.id);
                            if (exists) return prev; 
                            return [...prev, newOrderFromSocket];
                        });

                        setToastMsg(`🔔 ¡Nueva solicitud de pago! Mesa ${socketData.MesasIds[0] || '?'}`);
                        setTimeout(() => setToastMsg(null), 4000);
                    }

                } catch (error) {
                    console.error("Error procesando mensaje socket:", error);
                }
            };

            ws.current.onclose = () => console.log('🔴 [SOCKET] Desconectado');
            ws.current.onerror = (error) => console.error('⚠️ [SOCKET] Error:', error);
        }
    }

    return () => {
        if (ws.current) {
            ws.current.close();
            ws.current = null;
        }
    };
  }, []);

  useEffect(() => {
    if (viewMode === 'tables') fetchOrders();
    const interval = setInterval(() => {
        if (viewMode === 'tables') fetchOrders();
    }, 30000);
    return () => clearInterval(interval);
  }, [viewMode]);

  const handleAvatarUpdate = (newUrl: string) => {
      setUser(prevUser => ({
          ...prevUser,
          avatarUrl: newUrl
      }));
  };

  const handleTableClick = async (tableId: number, statusData: { status: TableStatus, order?: PendingOrder }) => {
    if (statusData.status === 'occupied' && statusData.order) {
        try {
            const baseOrder = statusData.order;
            const productsList = await getOrderDetailsListService(baseOrder.id);
            
            const fullOrder: PendingOrder = {
                ...baseOrder,
                detallesOrden: {
                    comensal: baseOrder.detallesOrden?.comensal || "Cliente",
                    orderDetailDTOs: productsList || []
                }
            };
            setSelectedOrderToPay(fullOrder);

        } catch (error) {
            console.warn("⚠️ No se pudieron cargar detalles. Usando modo respaldo.");
            const totalOrden = statusData.order?.pagos[0]?.total || 0;
            const dummyOrder: PendingOrder = {
                ...statusData.order!, 
                detallesOrden: {
                    comensal: statusData.order?.detallesOrden?.comensal || "Cliente Mesa",
                    orderDetailDTOs: [
                        {
                            name: "Consumo de Alimentos y Bebidas", 
                            quantity: 1,
                            price: totalOrden,
                            id: 0
                        }
                    ]
                }
            };
            setSelectedOrderToPay(dummyOrder);
        }
    } else {
        navigate('/menu'); 
    }
  };

  const handlePaymentConfirmed = (method: string) => {
    setSelectedOrderToPay(null);
    fetchOrders(); 
  };

  const tablesWithStatus = FIXED_TABLES.map(table => {
    const order = pendingOrders.find(o => o.mesasIds && o.mesasIds.includes(table.id));
    const status: TableStatus = order ? 'occupied' : 'available';
    return { ...table, status, order };
  });

  const filteredTables = tablesWithStatus.filter(table => {
    if (statusFilter === 'available' && table.status !== 'available') return false;
    if (statusFilter === 'occupied' && table.status !== 'occupied') return false;
    const matchesSearch = table.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'Todas' || table.location === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTables = filteredTables.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTables.length / itemsPerPage);

  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  return (
    <div style={styles.pageContainer}>
      
      {toastMsg && (
          <div style={styles.toastNotification}>
              {toastMsg}
          </div>
      )}

      <ProfileModal 
          isOpen={isProfileOpen} 
          onClose={() => setIsProfileOpen(false)} 
          user={user} 
          onAvatarUpdate={handleAvatarUpdate} 
      />
      <NotificationsModal isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />

      {/* MODAL DE PAGO PARA MESAS - CONFIGURACIÓN ESTRICTA */}
      {selectedOrderToPay && (
        (() => {
            const tableId = selectedOrderToPay.mesasIds?.[0];
            const tableObj = FIXED_TABLES.find(t => t.id === tableId);
            const displayName = tableObj ? tableObj.name : (selectedOrderToPay.detallesOrden?.comensal || "Cliente Mesa");

            return (
                <PaymentModal
                    isOpen={!!selectedOrderToPay}
                    onClose={() => setSelectedOrderToPay(null)}
                    onBack={() => setSelectedOrderToPay(null)}
                    onConfirm={handlePaymentConfirmed}
                    
                    // DATOS GENERALES
                    total={selectedOrderToPay.pagos[0]?.total || 0} 
                    orderId={selectedOrderToPay.id}
                    
                    // DATOS ESPECÍFICOS DE MESA
                    clientLabelText="UBICACIÓN" 
                    customerName={displayName} 
                    waiterName={selectedOrderToPay.pagos[0]?.mesero?.nombre} 
                    receivedByWaiter={selectedOrderToPay.pagos[0]?.efectivoRecibidoMesero}
                    
                    // EL MÉTODO VIENE FORZADO POR EL MESERO
                    paymentMethod={selectedOrderToPay.pagos[0]?.tipo || "Efectivo"}
                    
                    // ⚠️ BANDERA MAESTRA: FALSE (ES MESA) ⚠️
                    // Al ser false, el modal sabe que debe mostrar al mesero y bloquear el pago
                    isTakeout={false}
                />
            );
        })()
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

                    <div style={styles.statusFilterContainer}>
                        <button style={{...styles.statusFilterBtn, backgroundColor: statusFilter === 'all' ? '#333' : '#eee', color: statusFilter === 'all' ? '#fff' : '#666'}} onClick={() => setStatusFilter('all')}>Todas</button>
                        <button style={{...styles.statusFilterBtn, backgroundColor: statusFilter === 'available' ? '#1E8E3E' : '#eee', color: statusFilter === 'available' ? '#fff' : '#666'}} onClick={() => setStatusFilter('available')}>Disponibles</button>
                        <button style={{...styles.statusFilterBtn, backgroundColor: statusFilter === 'occupied' ? '#FF9F43' : '#eee', color: statusFilter === 'occupied' ? '#fff' : '#666'}} onClick={() => setStatusFilter('occupied')}>Ocupadas</button>
                    </div>
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
                {currentTables.map(table => {
                    const currentStatus = table.status || 'available';
                    const isOccupied = currentStatus === 'occupied';
                    
                    const borderColor = isOccupied ? '#FF9F43' : '#D1E7DD';
                    const statusLabel = isOccupied ? 'OCUPADA / POR PAGAR' : 'DISPONIBLE';
                    const statusBg = isOccupied ? '#FFF5EB' : '#E6F4EA';
                    const statusColor = isOccupied ? '#FF9F43' : '#1E8E3E';

                    return (
                    <div 
                        key={table.id} 
                        style={{...styles.tableCard, border: `2px solid ${borderColor}`}} 
                        onClick={() => handleTableClick(table.id, { status: currentStatus, order: table.order })}
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
                                {isOccupied ? `Orden #${table.order?.id}` : '0 personas'}
                            </span>
                        </div>
                        <div style={styles.cardFooter}>
                            {isOccupied && table.order ? (
                                <div style={{width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <span style={{fontSize: '14px', color: '#666'}}>Total:</span>
                                    <span style={{fontSize: '18px', fontWeight: '800', color: '#333'}}>
                                        ${table.order.pagos[0]?.total.toFixed(2)}
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

            {filteredTables.length > 0 && (
                <div style={styles.paginationContainer}>
                    <button 
                        style={{...styles.pageBtn, opacity: currentPage === 1 ? 0.3 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer'}} 
                        onClick={goToPrevPage} 
                        disabled={currentPage === 1}
                    >
                        <ArrowLeftIcon />
                    </button>
                    
                    <span style={styles.pageInfo}>
                        Página <b>{currentPage}</b> de <b>{totalPages}</b>
                    </span>

                    <button 
                        style={{...styles.pageBtn, opacity: currentPage === totalPages ? 0.3 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'}} 
                        onClick={goToNextPage} 
                        disabled={currentPage === totalPages}
                    >
                        <ArrowRightIcon />
                    </button>
                </div>
            )}
        </>
      ) : (
        <TakeoutView />
      )}
    </div>
  );
};

// --- Estilos ---
const styles: { [key: string]: React.CSSProperties } = {
  pageContainer: { backgroundColor: '#F8F9FA', minHeight: '100vh', width: '100%', maxWidth: '100vw', padding: '40px 60px', boxSizing: 'border-box', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', paddingBottom: '60px' },
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
  
  controlsContainer: { display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', marginBottom: '35px', gap: '20px', flexWrap: 'wrap' },
  leftControlsGroup: { display: 'flex', alignItems: 'center', gap: '20px', flex: 1, minWidth: '400px' },
  
  searchContainer: { flex: 1, position: 'relative', display: 'flex', alignItems: 'center', maxWidth: '350px' },
  searchIconWrapper: { position: 'absolute', left: '20px', display: 'flex', pointerEvents: 'none' },
  searchInput: { width: '100%', height: '65px', padding: '0 20px 0 50px', borderRadius: '12px', border: '1px solid #eee', backgroundColor: '#FFFFFF', fontSize: '16px', color: '#333333', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', outline: 'none', boxSizing: 'border-box' },

  statusFilterContainer: { display: 'flex', gap: '5px', backgroundColor: '#e0e0e0', padding: '5px', borderRadius: '12px' },
  statusFilterBtn: { border: 'none', padding: '12px 15px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.2s' },

  categoriesContainer: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  categoryPill: { padding: '10px 20px', borderRadius: '25px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 2px 5px rgba(0,0,0,0.02)', transition: 'all 0.2s' },
  
  tablesGrid: { display: 'grid', width: '100%', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' },
  tableCard: { backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '30px', boxShadow: '0 8px 20px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  tableName: { margin: '0', fontSize: '24px', fontWeight: '800', color: '#333' },
  statusBadge: { padding: '8px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' },
  tableLocation: { margin: '0 0 25px 0', fontSize: '16px', color: '#999', fontWeight: '500' },
  peopleCountPill: { display: 'inline-flex', alignItems: 'center', backgroundColor: '#F5F6FA', padding: '10px 16px', borderRadius: '12px', marginBottom: '35px', alignSelf: 'flex-start' },
  peopleCountText: { marginLeft: '10px', fontSize: '16px', fontWeight: '600', color: '#666' },
  cardFooter: { marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0f0f0', paddingTop: '20px', minHeight: '40px' },
  waiterLabelEmpty: { fontSize: '14px', color: '#ccc', fontStyle: 'italic' },
  
  paginationContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '15px', gap: '15px', padding: '10px 0' },
  pageBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '50px', height: '50px', border: 'none', backgroundColor: 'transparent', color: '#FF9F43', cursor: 'pointer', transition: 'transform 0.2s, opacity 0.2s', padding: 0 },
  pageInfo: { fontSize: '16px', color: '#555', fontWeight: '500' },

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

  // Estilo para el Toast
  toastNotification: {
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      backgroundColor: '#333',
      color: '#fff',
      padding: '15px 25px',
      borderRadius: '8px',
      boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
      zIndex: 5000,
      fontSize: '16px',
      fontWeight: '600',
      animation: 'fadeIn 0.5s ease'
  }
};