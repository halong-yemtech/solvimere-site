"use client";

import { useState } from "react";
import AuthCard, { authRequest, field, primary } from "./AuthCard";
import { withBase } from "@/lib/basePath";

export default function SetupForm() {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (f.get("password") !== f.get("confirm")) return setError("The passwords don't match.");
    setBusy(true);
    setError(null);
    try {
      // Payload only accepts this while no user exists; the first account is made an admin.
      await authRequest("first-register", {
        email: String(f.get("email")),
        password: String(f.get("password")),
        name: String(f.get("name") || ""),
      });
      window.location.assign(withBase("/dashboard"));
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <AuthCard title="Welcome" subtitle="Create the first admin account for your portfolio.">
      <form onSubmit={onSubmit} className="space-y-5">
        <input name="name" placeholder="Your name" autoComplete="name" className={field} />
        <input name="email" type="email" placeholder="Email" autoComplete="username" required className={field} />
        <input
          name="password"
          type="password"
          placeholder="Password (min. 8 characters)"
          minLength={8}
          autoComplete="new-password"
          required
          className={field}
        />
        <input
          name="confirm"
          type="password"
          placeholder="Repeat password"
          minLength={8}
          autoComplete="new-password"
          required
          className={field}
        />
        {error && (
          <p role="alert" className="text-lg text-red-400">
            {error}
          </p>
        )}
        <button type="submit" disabled={busy} className={primary}>
          {busy ? "Creating…" : "Create admin account"}
        </button>
      </form>
    </AuthCard>
  );
}
