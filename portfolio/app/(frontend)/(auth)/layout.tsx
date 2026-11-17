import type { Metadata } from "next";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#0b0f17] flex items-center justify-center p-6 text-gray-300">
      <div className="w-full max-w-[44rem]">{children}</div>
    </main>
  );
}
