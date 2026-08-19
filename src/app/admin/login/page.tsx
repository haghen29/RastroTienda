"use client";

import { useActionState } from "react";
import { loginAction } from "../actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, { error: "" } as { error?: string });

  return (
    <form action={action} className="max-w-[340px] mx-auto mt-20 space-y-4">
      <h1 className="font-heading text-[22px]">Ingresar al administrador</h1>
      <input
        name="password"
        type="password"
        placeholder="Contraseña"
        autoFocus
        className="input-rastro"
      />
      {state?.error && <p className="text-[13px] text-[var(--danger)]">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn-rastro w-full">
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
