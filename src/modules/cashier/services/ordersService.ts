import api from '../../../api/axiosInstance';

// --- INTERFACES ---
export interface OrderDetailDTO {
    productoId: number;
    cantidad: number;
    complementosIds: number[];
    exclusionProductoIds: number[];
    comentario: string;
}

export interface PendingOrder {
    id: number;
    mesasIds: number[];
    numeroOrden: number;
    pagos: {
        id: number;
        total: number;
        estado: string;
        tipo: string;
        efectivoRecibidoMesero?: number;
        fechaHoraEntregaEfectivo?: string;
        cambio?: number;
        mesero?: { 
            id: number;
            nombre: string 
        };
    }[];
    detallesOrden?: {
        orderDetailDTOs: any[];
        comensal?: string;
    };
}

// --- SERVICIOS ---

export const getPendingOrdersService = async (): Promise<PendingOrder[]> => {
    try {
        const response = await api.get<PendingOrder[]>('/orders?status=PendienteDePago');
        const ordenesReales = response.data.filter(orden => {
            const pago = orden.pagos?.[0]; 
            if (!pago) return true; 
            const estaRealmenteCerrada = ['Pagado', 'Cerrado', 'Completo', 'PAID'].includes(pago.estado);
            return !estaRealmenteCerrada; 
        });
        return ordenesReales;
    } catch (error) {
        console.error("Error obteniendo órdenes pendientes:", error);
        throw error;
    }
};

export const getOrderDetailsListService = async (id: number): Promise<any[]> => {
    try {
        const response = await api.get<any[]>(`/orders/details/${id}`);
        return response.data;
    } catch (error) {
        console.warn(`No se pudieron cargar detalles para orden ${id}.`);
        return []; 
    }
};

// ==============================================================
// 1. CREAR ORDEN (POST) - CORREGIDO: NUMEROS EN LUGAR DE TEXTO
// ==============================================================
export const createOrderService = async (
    customerName: string, 
    cartItems: any[], 
    total: number, 
    paymentMethod: 'cash' | 'card',
    amountReceived?: number,
    orderNote?: string // <--- NUEVO PARÁMETRO (Opcional)
) => {
    try {
        const validItems = cartItems.filter(item => item.id && Number(item.id) !== 0);

        if (validItems.length === 0) {
            throw new Error("El carrito contiene productos inválidos. Recarga la página.");
        }

        // --- AQUÍ ESTÁ LA MAGIA PARA COCINA ---
        // Asignamos la nota general al campo 'comentario' de cada producto
        // para asegurar que se vea en la comanda sin cambiar el backend.
        const detalles: OrderDetailDTO[] = validItems.map(item => ({
            productoId: Number(item.id),
            cantidad: Number(item.quantity || 1),
            complementosIds: [],
            exclusionProductoIds: [],
            // Si hay nota, la ponemos aquí. Si no, va vacío.
            comentario: orderNote || "" 
        }));

        // --- ENUMS NUMÉRICOS ---
        const ESTADO_PENDIENTE = 0;
        const ESTADO_PAGADO = 1;

        const payload = {
            tipoOrden: "Llevar",
            mesasIds: [], 
            comensales: 1,
            detallesOrden: {
                comensal: customerName || "Cliente Mostrador",
                orderDetailDTOs: detalles
            },
            pago: {
                tipoPago: paymentMethod === 'cash' ? "Efectivo" : "Tarjeta",
                tarjeta: {
                    estado: paymentMethod === 'card' ? ESTADO_PAGADO : ESTADO_PENDIENTE
                },
                efectivo: {
                    recibido: paymentMethod === 'cash' ? amountReceived : 0
                }
            }
        };

        console.log("📤 POST Create Order con Nota:", JSON.stringify(payload, null, 2));

        const response = await api.post('/orders', payload);
        return response.data;

    } catch (error) {
        console.error("Error creando la orden:", error);
        throw error;
    }
};

// ==============================================================
// 2. PAGAR ORDEN (PATCH) - CORREGIDO PARA EVITAR ERROR DE DECODIFICACIÓN
// ==============================================================
export const payOrderService = async (
    orderId: number, 
    paymentId: number, 
    paymentMethod: 'cash' | 'card',
    amountReceived?: number
) => {
    try {
        const ESTADO_PAGADO = 1; 
        
        const payload: any = {
            estadoPago: ESTADO_PAGADO,
            tipo: paymentMethod === 'cash' ? "Efectivo" : "Tarjeta"
        };

        if (paymentMethod === 'cash') {
            // 👇 AQUÍ ESTABA EL ERROR. AGREGAMOS Number() PARA BLINDARLO
            payload.efectivo = { 
                recibido: Number(amountReceived), 
                cambio: 0 
            };
        } else {
            payload.tarjeta = { 
                estado: "Pagado" 
            };
        }

        console.log(`📤 PATCH Pago Mesa (ID: ${paymentId}):`, JSON.stringify(payload, null, 2));

        // Verificamos que los IDs sean números también
        const cleanOrderId = Number(orderId);
        const cleanPaymentId = Number(paymentId);

        const response = await api.patch(`/orders/${cleanOrderId}/payments/${cleanPaymentId}`, payload);
        return response.data;

    } catch (error: any) {
        console.error("Error pagando la orden:", error);
        if (error.response && error.response.data) {
             // Esto te ayuda a ver qué dice el backend si vuelve a fallar
             console.log("🔥 Detalle error backend:", error.response.data);
             // alert("Error del servidor: " + JSON.stringify(error.response.data)); 
        }
        throw error;
    }
};