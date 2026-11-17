"use client";

import { useTransition } from "react";
import toast from "react-hot-toast";
import { updateAccount } from "@/lib/dashboard/actions";
import { inputCls } from "../edit/FieldRenderer";
import Card from "./Card";

export default function AccountForm({ name, email }: { name: string; email: string }) {
  const [pending, start] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const newPassword = String(f.get("newPassword") || "");
    if (newPassword && newPassword !== f.get("confirm")) return void toast.error("The new passwords don't match.");
    start(async () => {
      const res = await updateAccount({
        name: String(f.get("name") ?? ""),
        email: String(f.get("email") ?? ""),
        currentPassword: String(f.get("currentPassword") || ""),
        newPassword: newPassword || undefined,
      });
      if (!res.ok) return void toast.error(res.error);
      toast.success("Account updated");
      for (const k of ["currentPassword", "newPassword", "confirm"])
        (form.elements.namedItem(k) as HTMLInputElement).value = "";
    });
  }

  const label = "block mb-2 text-lg uppercase tracking-wider text-gray-400";
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card title="Details">
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className={label}>Name</span>
            <input name="name" defaultValue={name} className={inputCls} />
          </label>
          <label>
            <span className={label}>Email</span>
            <input name="email" type="email" defaultValue={email} required className={inputCls} />
          </label>
        </div>
      </Card>
      <Card title="Change password">
        <div className="grid gap-4">
          <label>
            <span className={label}>Current password</span>
            <input name="currentPassword" type="password" autoComplete="current-password" className={inputCls} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className={label}>New password</span>
              <input
                name="newPassword"
                type="password"
                minLength={8}
                autoComplete="new-password"
                className={inputCls}
              />
            </label>
            <label>
              <span className={label}>Repeat new password</span>
              <input name="confirm" type="password" minLength={8} autoComplete="new-password" className={inputCls} />
            </label>
          </div>
        </div>
      </Card>
      <div className="flex justify-end">
        <button
          disabled={pending}
          className="rounded-lg px-6 py-3 bg-main-orange text-gray-900 font-semibold text-xl disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
