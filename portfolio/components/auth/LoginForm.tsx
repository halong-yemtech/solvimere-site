"use client";

import { useState } from "react";
import Link from "next/link";
import AuthCard, { authRequest, field, primary } from "./AuthCard";
import { withBase } from "@/lib/basePath";

/** Only allow same-site relative redirects. */
const safeRedirect = (r: string | null) => (r && r.startsWith("/") && !r.startsWith("//") ? r : "/dashboard");

export default function LoginForm({ redirect }: { redirect: string | null }) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      const res = await authRequest<{ user?: { role?: string } }>("login", {
        email: String(form.get("email")),
        password: String(form.get("password")),
      });
      if (res.user?.role !== "admin") {
        // Signed in, but nothing to manage: end the session again.
        await fetch(withBase("/api/users/logout"), { method: "POST", credentials: "include" });
        throw new Error("This account doesn't have admin access.");
      }
      // Full navigation so every server component sees the new session cookie.
      window.location.assign(withBase(safeRedirect(redirect)));
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <AuthCard
      title="Sign in"
      subtitle="Manage your portfolio"
      footer={<Link href="/forgot-password" className="hover:text-main-orange">Forgot your password?</Link>}
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <label className="block">
          <span className="block mb-2 text-lg uppercase tracking-wider text-gray-400">Email</span>
          <input name="email" type="email" autoComplete="username" required autoFocus className={field} />
        </label>
        <label className="block">
          <span className="block mb-2 text-lg uppercase tracking-wider text-gray-400">Password</span>
          <input name="password" type="password" autoComplete="current-password" required className={field} />
        </label>
        {error && <p role="alert" className="text-lg text-red-400">{error}</p>}
        <button type="submit" disabled={busy} className={primary}>{busy ? "Signing in…" : "Sign in"}</button>
      </form>
    </AuthCard>
  );
}
