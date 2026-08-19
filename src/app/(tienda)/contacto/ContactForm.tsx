"use client";

import { useState } from "react";

export function ContactForm({ arrepentimiento }: { arrepentimiento: boolean }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", body: "" });
  const [state, setState] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    setError("");
    const res = await fetch("/api/contacto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        body: arrepentimiento ? `[ARREPENTIMIENTO] ${form.body}` : form.body,
      }),
    });
    if (res.ok) {
      setState("ok");
      setForm({ name: "", email: "", phone: "", body: "" });
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "No pudimos enviar el mensaje");
      setState("error");
    }
  }

  if (state === "ok") {
    return (
      <p className="bg-[#eaf7f0] text-[#2f7a56] text-[14px] p-4">
        ¡Recibimos tu mensaje! Te respondemos a la brevedad.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <input
        required className="input-rastro" placeholder="Nombre"
        value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        required type="email" className="input-rastro" placeholder="Email"
        value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        className="input-rastro" placeholder="Teléfono"
        value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
      />
      <textarea
        required className="input-rastro h-32 py-3"
        placeholder={arrepentimiento ? "Número de pedido y motivo" : "Mensaje"}
        value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })}
      />
      {error && <p className="text-[13px] text-[var(--danger)]">{error}</p>}
      <button type="submit" disabled={state === "sending"} className="btn-rastro px-10">
        {state === "sending" ? "Enviando…" : "Enviar"}
      </button>
    </form>
  );
}
