"use client";

import { useState } from "react";
import Link from "next/link";
import AuthCard, { authRequest, field, primary } from "./AuthCard";
import { withBase } from "@/lib/basePath";

export default function ResetForm({ token }: { token: string }) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (f.get("password") !== f.get("confirm")) return setError("The passwords don't match.");
    setBusy(true);
    setError(null);
    try {
      await authRequest("reset-password", { token, password: String(f.get("password")) });
      window.location.assign(withBase("/dashboard")); // reset also signs you in
    } catch (err) {
      setError((err as Error).message || "This link is invalid or has expired.");
      setBusy(false);
    }
  }

  return (
    <AuthCard
      title="Choose a new password"
      footer={<Link href="/forgot-password" className="hover:text-main-orange">Need a new link?</Link>}
    >
      {!token ? (
        <p className="text-xl text-red-400">This reset link is incomplete. Request a new one.</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5">
          <input name="password" type="password" placeholder="New password (min. 8 characters)" minLength={8} autoComplete="new-password" required autoFocus className={field} />
          <input name="confirm" type="password" placeholder="Repeat new password" minLength={8} autoComplete="new-password" required className={field} />
          {error && <p role="alert" className="text-lg text-red-400">{error}</p>}
          <button type="submit" disabled={busy} className={primary}>{busy ? "Saving…" : "Save password"}</button>
        </form>
      )}
    </AuthCard>
  );
}
