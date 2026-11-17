import type { Metadata } from "next";

export const metadata: Metadata = { title: "Portfolio coming soon", robots: { index: false } };

/** Shown for /team/<slug> when that member has no public portfolio yet. */
export default function NotFound() {
  return (
    <main className="flex items-center justify-center min-h-screen p-10 text-center bg-gray-900">
      <div className="max-w-2xl space-y-6 text-2xl text-gray-300">
        <h1 className="text-4xl font-semibold text-main-orange">Portfolio coming soon</h1>
        <p>This team member&apos;s portfolio isn&apos;t published yet.</p>
        {/* A plain link: /team is the Solvimere site's team page, not part of this app. */}
        <a href="/team" className="inline-block underline hover:text-main-orange">
          ← Back to the team
        </a>
      </div>
    </main>
  );
}
