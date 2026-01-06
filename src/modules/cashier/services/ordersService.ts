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

export const createOrderService = async (
    customerName: string, 
    cartItems: any[], 
    total: number, 
    paymentMethod: 'cash' | 'card',
    cashAmountReceived?: number 
) => {
    try {
        const detalles: OrderDetailDTO[] = cartItems.map(item => {
            if (!item.id || item.id === 0) throw new Error(`ID inválido en producto: ${item.name}`);
            return {
                productoId: item.id,
                cantidad: item.quantity,
                complementosIds: [],
                exclusionProductoIds: [],
                comentario: ""
            };
        });

        // Calculamos el monto recibido real
        const montoRecibido = paymentMethod === 'cash' && cashAmountReceived 
            ? cashAmountReceived 
            : 0; // Si es tarjeta, no recibimos efectivo

        // --- CORRECCIÓN DE LÓGICA ---
        // El estado de la tarjeta debe ser coherente con el método de pago
        const estadoTarjeta = paymentMethod === 'card' ? "Pagado" : "Pendiente";

        const payload: CreateOrderPayload = {
            tipoOrden: "Llevar",
            mesasIds: [], // Enviamos array vacío
            comensales: 1,
            detallesOrden: {
                comensal: customerName || "Cliente Mostrador",
                orderDetailDTOs: detalles
            },
            pago: {
                tipoPago: paymentMethod === 'cash' ? "Efectivo" : "Tarjeta",
                tarjeta: {
                    estado: estadoTarjeta // "Pendiente" si es efectivo, "Pagado" si es tarjeta
                },
                efectivo: {
                    recibido: montoRecibido // Cantidad o 0
                }
            }
        };

        console.log("📤 Payload corregido:", JSON.stringify(payload, null, 2));
        
        const response = await api.post('/orders', payload);
        return response.data;

    } catch (error) {
        console.error("Error creando la orden:", error);
        throw error;
    }
};