"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function OrderLookup() {
  const [id, setId] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const code = id.trim().toUpperCase();
    if (!/^RP-\d{6}$/.test(code)) {
      setError("El número de pedido tiene el formato RP-000123");
      return;
    }
    router.push(`/checkout/gracias/${code}`);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className="block text-[13px] mb-1">Número de pedido</span>
        <input
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="RP-000123"
          className="input-rastro"
        />
      </label>
      {error && <p className="text-[13px] text-[var(--danger)]">{error}</p>}
      <button type="submit" className="btn-rastro w-full">Ver mi pedido</button>
    </form>
  );
}
