import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { listOrders } from "@/lib/repo/orders";
import { formatARS } from "@/lib/config";
import { updateOrderStatus } from "./actions";

export const dynamic = "force-dynamic";

const STATUSES = [
  ["pending", "Pendiente"],
  ["awaiting_transfer", "Esperando transferencia"],
  ["paid", "Pagado"],
  ["shipped", "Enviado"],
  ["delivered", "Entregado"],
  ["cancelled", "Cancelado"],
] as const;

const COLORS: Record<string, string> = {
  pending: "bg-[#fdf3e3] text-[#8a5a12]",
  awaiting_transfer: "bg-[#fdf3e3] text-[#8a5a12]",
  paid: "bg-[#eaf7f0] text-[#2f7a56]",
  shipped: "bg-[#eaf4fb] text-[#2a6f97]",
  delivered: "bg-[#eaf7f0] text-[#2f7a56]",
  cancelled: "bg-[#fdecea] text-[#a33]",
};

export default async function AdminOrdersPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const orders = listOrders();

  const paid = orders.filter((o) => ["paid", "shipped", "delivered"].includes(o.status));
  const revenue = paid.reduce((s, o) => s + o.total, 0);

  return (
    <>
      <h1 className="font-heading text-[24px] mb-6">Pedidos</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          ["Pedidos", String(orders.length)],
          ["Pagados", String(paid.length)],
          ["Esperando transferencia", String(orders.filter((o) => o.status === "awaiting_transfer").length)],
          ["Facturación", formatARS(revenue)],
        ].map(([label, value]) => (
          <div key={label} className="bg-white border border-[var(--fg-10)] p-4">
            <p className="text-[12px] text-[var(--fg-40)]">{label}</p>
            <p className="font-heading text-[20px] mt-1">{value}</p>
          </div>
        ))}
      </div>

      {orders.length === 0 ? (
        <p className="text-[14px] text-[var(--fg-40)]">Todavía no entró ningún pedido.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <article key={o.id} className="bg-white border border-[var(--fg-10)] p-5">
              <div className="flex flex-wrap items-start gap-4">
                <div className="flex-1 min-w-[220px]">
                  <p className="font-heading text-[16px]">
                    {o.id}{" "}
                    <span className={`ml-2 text-[11px] px-2 py-1 ${COLORS[o.status] ?? ""}`}>
                      {STATUSES.find(([s]) => s === o.status)?.[1] ?? o.status}
                    </span>
                  </p>
                  <p className="text-[13px] text-[var(--fg-40)] mt-1">
                    {new Date(o.createdAt + "Z").toLocaleString("es-AR")} ·{" "}
                    {o.paymentMethod === "transfer" ? "Transferencia" : "Mercado Pago"}
                  </p>
                  <p className="text-[13px] mt-2">
                    {o.customerName} · {o.customerPhone} · {o.customerEmail}
                  </p>
                  <ul className="text-[13px] mt-2 text-[var(--fg-40)]">
                    {o.items.map((i, k) => (
                      <li key={k}>• {i.name} ({i.size}) × {i.quantity}</li>
                    ))}
                  </ul>
                  <p className="text-[13px] mt-2">
                    {o.shippingLabel} — {o.address.street} {o.address.number} {o.address.extra}{" "}
                    {o.address.city} CP {o.address.zip}
                  </p>
                  {o.note && (
                    <p className="text-[13px] bg-[#fff8e6] p-2 mt-2">Nota: {o.note}</p>
                  )}
                </div>

                <div className="text-right">
                  <p className="font-heading text-[20px]">{formatARS(o.total)}</p>
                  <form action={updateOrderStatus} className="mt-3 flex gap-2">
                    <input type="hidden" name="id" value={o.id} />
                    <select name="status" defaultValue={o.status} className="input-rastro h-9 text-[13px]">
                      {STATUSES.map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                    <button type="submit" className="btn-rastro h-9 px-4">Guardar</button>
                  </form>
                  <a
                    href={`https://wa.me/${o.customerPhone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-block mt-2 text-[13px] underline"
                  >
                    Escribirle por WhatsApp
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
