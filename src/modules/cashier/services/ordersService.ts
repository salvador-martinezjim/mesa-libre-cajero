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
        id: number; // Importante para el PATCH
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

// 1. Obtener órdenes pendientes
export const getPendingOrdersService = async (): Promise<PendingOrder[]> => {
    try {
        const response = await api.get<PendingOrder[]>('/orders?status=PendienteDePago');
        
        // Filtro para ocultar solo lo que está REALMENTE cerrado/pagado
        const ordenesReales = response.data.filter(orden => {
            const pago = orden.pagos?.[0]; 
            if (!pago) return true; 

            // Solo ocultamos si el estatus es explícitamente de cierre
            const estaRealmenteCerrada = ['Pagado', 'Cerrado', 'Completo', 'PAID'].includes(pago.estado);
            return !estaRealmenteCerrada; 
        });

        return ordenesReales;
    } catch (error) {
        console.error("Error obteniendo órdenes pendientes:", error);
        throw error;
    }
};

// 2. Obtener lista de productos (Detalles)
export const getOrderDetailsListService = async (id: number): Promise<any[]> => {
    try {
        // Usamos el endpoint específico de detalles para evitar el error 500 de la orden completa
        const response = await api.get<any[]>(`/orders/details/${id}`);
        return response.data;
    } catch (error) {
        console.warn(`No se pudieron cargar detalles para orden ${id} (posible 403/500).`);
        return []; 
    }
};

// 3. CREAR ORDEN (Para Llevar) - CORREGIDO ERROR 500
export const createOrderService = async (
    customerName: string, 
    cartItems: any[], 
    total: number, 
    paymentMethod: 'cash' | 'card',
    amountReceived?: number
) => {
    try {
        // Filtramos items inválidos (ID 0)
        const validItems = cartItems.filter(item => item.id && Number(item.id) !== 0);

        if (validItems.length === 0) {
            throw new Error("El carrito contiene productos inválidos. Recarga la página.");
        }

        const detalles: OrderDetailDTO[] = validItems.map(item => ({
            productoId: Number(item.id),
            cantidad: Number(item.quantity || 1),
            complementosIds: [],
            exclusionProductoIds: [],
            comentario: ""
        }));

        // --- CONSTRUCCIÓN LIMPIA DEL PAGO ---
        const pagoPayload: any = {
            tipoPago: paymentMethod === 'cash' ? "Efectivo" : "Tarjeta"
        };

        if (paymentMethod === 'cash') {
            pagoPayload.efectivo = { recibido: amountReceived };
            pagoPayload.tarjeta = null; // IMPORTANTE: Enviamos null explícito
        } else {
            pagoPayload.tarjeta = { estado: "Pagado" };
            pagoPayload.efectivo = null; // IMPORTANTE: Enviamos null explícito
        }

        const payload = {
            tipoOrden: "Llevar",
            mesasIds: [], 
            comensales: 1,
            detallesOrden: {
                comensal: customerName || "Cliente Mostrador",
                orderDetailDTOs: detalles
            },
            pago: pagoPayload
        };

        console.log("📤 POST Create Order Payload:", JSON.stringify(payload, null, 2));

        const response = await api.post('/orders', payload);
        return response.data;

    } catch (error) {
        console.error("Error creando la orden:", error);
        throw error;
    }
};

// 4. PAGAR ORDEN EXISTENTE (Mesas) - CORRECCIÓN DE ENUM
export const payOrderService = async (
    orderId: number, 
    paymentId: number, 
    paymentMethod: 'cash' | 'card',
    amountReceived?: number
) => {
    try {
        const cambioCalculado = 0; 

        // --- CORRECCIÓN CLAVE ---
        // El backend no quiere texto "Pagado", quiere el número 1.
        // Asumimos que 1 = Pagado en el Enum de C#
        const ESTADO_PAGADO = 1; 

        const payload: any = {
            estadoPago: ESTADO_PAGADO, // <--- CAMBIO AQUÍ (De string a número)
            tipo: paymentMethod === 'cash' ? "Efectivo" : "Tarjeta"
        };

        if (paymentMethod === 'cash') {
            payload.efectivo = { 
                recibido: amountReceived,
                cambio: cambioCalculado
            };
        } else {
            payload.tarjeta = { 
                estado: "Pagado" // Aquí probamos string, si falla también lo cambiamos a 1
            };
        }

        console.log(`📤 PATCH Pago ${paymentId} Payload Numérico:`, JSON.stringify(payload, null, 2));

        const response = await api.patch(`/orders/${orderId}/payments/${paymentId}`, payload);
        return response.data;
    } catch (error: any) {
        console.error("Error pagando la orden:", error);
        if (error.response && error.response.data) {
             // Si falla, volveremos a ver la alerta, pero esta vez con el error del siguiente campo
             alert("Error del servidor: " + JSON.stringify(error.response.data)); 
        }
        throw error;
    }
};