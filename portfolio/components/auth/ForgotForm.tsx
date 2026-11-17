"use client";

import { useState } from "react";
import Link from "next/link";
import AuthCard, { authRequest, field, primary } from "./AuthCard";

export default function ForgotForm() {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    // Same answer whether or not the address exists, so accounts can't be probed.
    await authRequest("forgot-password", { email: String(new FormData(e.currentTarget).get("email")) }).catch(() => {});
    setSent(true);
  }

  return (
    <AuthCard
      title="Forgot password"
      subtitle="We'll email you a link to choose a new one."
      footer={
        <Link href="/login" className="hover:text-main-orange">
          ← Back to sign in
        </Link>
      }
    >
      {sent ? (
        <p className="text-xl text-gray-300">
          If an account exists for that address, a reset link is on its way. It's valid for one hour.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5">
          <input
            name="email"
            type="email"
            placeholder="Email"
            autoComplete="username"
            required
            autoFocus
            className={field}
          />
          <button type="submit" disabled={busy} className={primary}>
            {busy ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}
    </AuthCard>
  );
}
