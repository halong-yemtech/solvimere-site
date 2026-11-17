import Link from "next/link";
import { withBase } from "@/lib/basePath";

export const field =
  "w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 text-xl text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-main-orange";
export const primary = "w-full rounded-lg bg-main-orange text-gray-900 font-semibold text-xl py-3 disabled:opacity-60";

export default function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-gray-900 border border-gray-800 p-10 shadow-2xl">
      <Link
        href="/"
        className="inline-grid place-items-center w-14 h-14 rounded-xl bg-main-orange text-gray-900 text-3xl font-bold"
        title="Back to the site"
      >
        P
      </Link>
      <h1 className="mt-6 text-[2.8rem] font-semibold text-gray-100">{title}</h1>
      {subtitle && <p className="mt-1 text-xl text-gray-500">{subtitle}</p>}
      <div className="mt-8">{children}</div>
      {footer && <div className="mt-8 text-lg text-gray-500">{footer}</div>}
    </div>
  );
}

/** POST to a Payload auth endpoint; returns the JSON body or throws a readable error. */
export async function authRequest<T = Record<string, unknown>>(path: string, body: unknown): Promise<T> {
  const res = await fetch(withBase(`/api/users/${path}`), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { errors?: { message?: string }[] }).errors?.[0]?.message;
    throw new Error(msg || `Request failed (${res.status})`);
  }
  return data as T;
}
