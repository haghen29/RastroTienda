import type { OrderStatus } from "@/lib/types";

export function statusMessage(status: OrderStatus): { title: string; detail: string } {
  switch (status) {
    case "pending":
      return {
        title: "Estamos procesando tu pedido",
        detail: "En un momento te confirmamos los siguientes pasos.",
      };
    case "awaiting_transfer":
      return {
        title: "Reservamos tu pedido",
        detail: "Esperamos tu transferencia. Apenas la recibamos, lo preparamos para el envío.",
      };
    case "paid":
      return {
        title: "¡Recibimos tu pago!",
        detail: "En breve tu pedido va a estar siendo enviado.",
      };
    case "shipped":
      return {
        title: "Tu pedido ya está en camino",
        detail: "Lo despachamos — pronto va a llegar.",
      };
    case "delivered":
      return {
        title: "Tu pedido fue entregado",
        detail: "¡Gracias por elegirnos!",
      };
    case "cancelled":
      return {
        title: "Tu pedido fue cancelado",
        detail: "Si te parece un error o tenés dudas, escribinos por WhatsApp.",
      };
  }
}
