import api from '../../../api/axiosInstance';

// --- Interfaces según Swagger ---
interface OrderDetailDTO {
    productoId: number;
    cantidad: number;
    complementosIds: number[];       // Array vacío por ahora
    exclusionProductoIds: number[];  // Array vacío por ahora
    comentario: string;
}

interface CreateOrderPayload {
    tipoOrden: string;      // "Llevar"
    mesasIds: number[];     // Vacío
    comensales: number;
    detallesOrden: {
        comensal: string;   // Nombre del cliente
        orderDetailDTOs: OrderDetailDTO[];
    };
    pago: {
        tipoPago: string;   // "Efectivo" o "Tarjeta"
        tarjeta: {
            estado: string; // Ej: "Pagado"
        };
        efectivo: {
            recibido: number;
        };
    };
}

export const createOrderService = async (
    customerName: string, 
    cartItems: any[], 
    total: number, 
    paymentMethod: 'cash' | 'card'
) => {
    try {
        // 1. Validar que los productos tengan ID válido (evita el Error 500 "ID: 0")
        const detalles: OrderDetailDTO[] = cartItems.map(item => {
            if (!item.id || item.id === 0) {
                throw new Error(`El producto "${item.name}" tiene un ID inválido.`);
            }
            return {
                productoId: item.id,
                cantidad: item.quantity,
                complementosIds: [],
                exclusionProductoIds: [],
                comentario: ""
            };
        });

        // 2. Construir el Payload exacto como pide el Swagger
        const payload: CreateOrderPayload = {
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
                    estado: "Pagado" // Asumimos que si llega aquí, ya se cobró
                },
                efectivo: {
                    recibido: total // Asumimos pago exacto por ahora
                }
            }
        };

        console.log("📤 Payload enviado a /orders:", JSON.stringify(payload, null, 2));

        // 3. Enviar
        const response = await api.post('/orders', payload);
        return response.data;

    } catch (error) {
        console.error("Error creando la orden:", error);
        throw error;
    }
};