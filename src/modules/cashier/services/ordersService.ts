import api from '../../../api/axiosInstance';

// Interfaces
interface OrderDetailDTO {
    productoId: number;
    cantidad: number;
    complementosIds: number[];
    exclusionProductoIds: number[];
    comentario: string;
}

interface CreateOrderPayload {
    tipoOrden: string;
    mesasIds: number[];
    comensales: number;
    detallesOrden: {
        comensal: string;
        orderDetailDTOs: OrderDetailDTO[];
    };
    pago: {
        tipoPago: string;
        tarjeta: { estado: string; };
        efectivo: { recibido: number; };
    };
}

// --- NUEVA INTERFAZ PARA GET /orders ---
export interface PendingOrder {
    id: number;
    mesasIds: number[];
    numeroOrden: number;
    pagos: {
        total: number;
        estado: string;
        tipo: string;
        // Agregamos los campos que faltaban:
        efectivoRecibidoMesero?: number;       // <--- NUEVO
        fechaHoraEntregaEfectivo?: string;     // <--- NUEVO
        cambio?: number;                       // <--- NUEVO (ya que estamos, agregamos este también)
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

export const getPendingOrdersService = async (): Promise<PendingOrder[]> => {
    try {
        const response = await api.get<PendingOrder[]>('/orders?status=PendienteDePago');
        
        // --- FILTRO DE SEGURIDAD REFORZADO ---
        const ordenesReales = response.data.filter(orden => {
            // Buscamos si hay ALGUNA evidencia de que ya se pagó
            const pago = orden.pagos?.[0]; // Tomamos el primer pago
            
            if (!pago) return true; // Si no hay info de pago, asumimos pendiente

            // CRITERIOS DE EXCLUSIÓN (Si cumple alguno, NO la mostramos)
            const estatusPagado = ['Pagado', 'Cerrado', 'Completo', 'PAID'].includes(pago.estado);
            const tieneFechaPago = !!pago.fechaHoraEntregaEfectivo; // Si ya tiene fecha, ya se cobró
            const tieneMontoRecibido = (pago.efectivoRecibidoMesero || 0) > 0; // Si ya hay dinero registrado

            // Si cumple cualquiera de estas, la consideramos pagada y LA OCULTAMOS
            const yaEstaPagada = estatusPagado || tieneFechaPago || tieneMontoRecibido;

            return !yaEstaPagada; 
        });

        return ordenesReales;
    } catch (error) {
        console.error("Error obteniendo órdenes:", error);
        throw error;
    }
};



export const createOrderService = async (
    customerName: string, 
    cartItems: any[], 
    total: number, 
    paymentMethod: 'cash' | 'card',
    amountReceived?: number
) => {
    try {
        console.log("🛒 Items originales:", cartItems);

        // --- CORRECCIÓN MÁGICA ---
        // Filtramos para quitar cualquier producto que no tenga ID o sea 0
        const validItems = cartItems.filter(item => item.id && Number(item.id) !== 0);

        // Si después de filtrar no queda nada, lanzamos error para no molestar al backend
        if (validItems.length === 0) {
            throw new Error("El carrito contiene productos inválidos (ID 0). Recarga la página.");
        }

        // Mapeamos solo los items válidos
        const detalles: OrderDetailDTO[] = validItems.map(item => ({
            productoId: Number(item.id),
            cantidad: Number(item.quantity || 1),
            complementosIds: [],
            exclusionProductoIds: [],
            comentario: ""
        }));

        const payload = {
            tipoOrden: "Llevar",
            mesasIds: [], // Para llevar siempre es vacío
            comensales: 1,
            detallesOrden: {
                comensal: customerName || "Cliente Mostrador",
                orderDetailDTOs: detalles
            },
            pago: {
                tipoPago: paymentMethod === 'cash' ? "Efectivo" : "Tarjeta",
                tarjeta: {
                    estado: paymentMethod === 'card' ? "Pagado" : "Pendiente"
                },
                efectivo: {
                    recibido: paymentMethod === 'cash' ? amountReceived : 0
                }
            }
        };

        console.log("📤 Enviando a POST /orders:", JSON.stringify(payload, null, 2));

        // USAMOS TU ENDPOINT ORIGINAL QUE SÍ FUNCIONABA
        const response = await api.post('/orders', payload);
        return response.data;

    } catch (error) {
        console.error("Error creando la orden:", error);
        throw error;
    }
};

export const payOrderService = async (
    orderId: number, 
    paymentMethod: 'cash' | 'card',
    amountReceived?: number
) => {
    try {
        // Mantenemos esta estructura para decirle al sistema CÓMO se pagó
        const payload = {
            tipoPago: paymentMethod === 'cash' ? "Efectivo" : "Tarjeta",
            tarjeta: {
                estado: paymentMethod === 'card' ? "Pagado" : "Pendiente"
            },
            efectivo: {
                recibido: paymentMethod === 'cash' ? amountReceived : 0
            }
            // Nota: Si el backend en /checkout ignora este body, no pasa nada.
            // Pero si lo necesita para el corte de caja, ya se lo estamos enviando.
        };

        console.log(`📤 Enviando Checkout para Orden ${orderId}:`, payload);

        // --- CAMBIO CLAVE: Usamos el endpoint /checkout ---
        // Usamos .post porque es un POST en tu swagger
        const response = await api.post(`/orders/${orderId}/checkout`, payload);
        
        return response.data;
    } catch (error) {
        console.error("Error haciendo checkout de la orden:", error);
        throw error;
    }
};


