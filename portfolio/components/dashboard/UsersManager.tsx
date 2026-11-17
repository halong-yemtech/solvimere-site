"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FiKey, FiLock, FiPlus, FiTrash2, FiX } from "react-icons/fi";
import { createUser, deleteUser, setUserPassword, setUserRole } from "@/lib/dashboard/actions";
import { inputCls } from "../edit/FieldRenderer";

interface User { id: number; email: string; name: string; role: "admin" | "user"; locked: boolean; createdAt: string }

export default function UsersManager({ users, meId }: { users: User[]; meId: number }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [adding, setAdding] = useState(false);

  const act = (fn: () => Promise<{ ok: boolean; error?: string }>, ok: string, after?: () => void) =>
    start(async () => {
      const res = await fn();
      if (!res.ok) return void toast.error(res.error ?? "Failed");
      toast.success(ok);
      after?.();
      router.refresh();
    });

  function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    act(
      () => createUser({
        email: String(f.get("email")), password: String(f.get("password")), name: String(f.get("name") || ""),
        role: f.get("role") === "admin" ? "admin" : "user",
      }),
      "User created",
      () => setAdding(false)
    );
  }

  const btn = "flex items-center gap-2 rounded-lg px-3 py-2 text-lg hover:bg-gray-800 disabled:opacity-40";

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={() => setAdding((a) => !a)} className="flex items-center gap-2 rounded-full px-6 py-3 bg-main-orange text-gray-900 font-semibold text-xl">
          {adding ? <FiX /> : <FiPlus />} {adding ? "Cancel" : "Add user"}
        </button>
      </div>

      {adding && (
        <form onSubmit={onCreate} className="rounded-2xl bg-gray-900 border border-gray-800 p-6 grid gap-4 sm:grid-cols-2">
          <input name="email" type="email" required placeholder="Email" autoComplete="off" className={inputCls} />
          <input name="name" placeholder="Name (optional)" className={inputCls} />
          <input name="password" type="password" required minLength={8} placeholder="Password (min. 8 characters)" autoComplete="new-password" className={inputCls} />
          <select name="role" defaultValue="user" className={inputCls} aria-label="Role">
            <option value="user">User — no editing rights</option>
            <option value="admin">Admin — can edit the site</option>
          </select>
          <div className="sm:col-span-2 flex justify-end">
            <button disabled={pending} className="rounded-lg px-6 py-3 bg-main-orange text-gray-900 font-semibold text-xl disabled:opacity-60">Create user</button>
          </div>
        </form>
      )}

      <ul className="rounded-2xl bg-gray-900 border border-gray-800 divide-y divide-gray-800">
        {users.map((u) => (
          <li key={u.id} className="flex flex-wrap items-center gap-4 px-6 py-4">
            <div className="min-w-0 flex-1">
              <p className="text-xl text-gray-200 truncate">
                {u.name || u.email}
                {u.id === meId && <span className="ml-2 text-base text-main-orange">you</span>}
                {u.locked && <span className="ml-2 text-base text-red-400 inline-flex items-center gap-1"><FiLock /> locked (too many failed sign-ins)</span>}
              </p>
              {u.name && <p className="text-lg text-gray-500 truncate">{u.email}</p>}
            </div>
            <select
              value={u.role}
              disabled={pending || u.id === meId}
              onChange={(e) => act(() => setUserRole(u.id, e.target.value as User["role"]), "Role updated")}
              className="rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-lg text-gray-200 disabled:opacity-60"
              aria-label={`Role of ${u.email}`}
              title={u.id === meId ? "You can't change your own role" : undefined}
            >
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
            <button className={btn} disabled={pending} onClick={() => {
              const pw = prompt(`New password for ${u.email} (min. 8 characters):`);
              if (pw) act(() => setUserPassword(u.id, pw), "Password changed");
            }}>
              <FiKey /> Set password
            </button>
            <button className={`${btn} text-red-400 hover:bg-red-950/50`} disabled={pending || u.id === meId}
              onClick={() => confirm(`Delete ${u.email}?`) && act(() => deleteUser(u.id), "User deleted")}>
              <FiTrash2 /> Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
