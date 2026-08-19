import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getSetting, CHECKOUT_NOTE_KEY } from "@/lib/repo/settings";
import { store } from "@/lib/config";
import { updateSetting } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const checkoutNote = getSetting(CHECKOUT_NOTE_KEY, store.checkoutNote);

  return (
    <>
      <h1 className="font-heading text-[24px] mb-2">Mensajes</h1>
      <p className="text-[13px] text-[var(--fg-40)] mb-6 max-w-[640px]">
        Textos del sitio que podés editar sin tocar código.
      </p>

      <form action={updateSetting} className="bg-white border border-[var(--fg-10)] p-5 space-y-3 max-w-[640px]">
        <input type="hidden" name="key" value={CHECKOUT_NOTE_KEY} />
        <label className="block">
          <span className="block text-[13px] mb-1">
            Mensaje en el paso de pago (arriba del campo &quot;agregar nota&quot;)
          </span>
          <textarea
            name="value"
            defaultValue={checkoutNote}
            className="input-rastro h-28 py-2"
          />
        </label>
        <button type="submit" className="btn-rastro px-8">Guardar</button>
      </form>
    </>
  );
}
