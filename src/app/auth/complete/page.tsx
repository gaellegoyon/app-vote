"use client";

import { useState } from "react";

export default function CompleteInvitePage() {
  const [pwd, setPwd] = useState("");
  const [ok, setOk] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const token = new URLSearchParams(window.location.search).get("token");
    const res = await fetch("/api/auth/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, pwd }),
    });
    setOk(
      res.ok
        ? "Mot de passe créé. Tu peux te connecter."
        : "Lien invalide ou expiré."
    );
  }

  return (
    <section className="max-w-md space-y-4">
      <h2 className="text-xl font-semibold">Créer un mot de passe</h2>
      <form onSubmit={submit} className="space-y-3">
        <input
          type="password"
          className="w-full border p-2 rounded"
          placeholder="Nouveau mot de passe"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
        />
        <button className="px-4 py-2 bg-slate-900 text-white rounded">
          Valider
        </button>
      </form>
      {ok && <p className="text-sm">{ok}</p>}
    </section>
  );
}
