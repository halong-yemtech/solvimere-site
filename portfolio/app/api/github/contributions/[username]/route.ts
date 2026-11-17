import { NextResponse } from "next/server";
import { getContributions, GITHUB_USERNAME } from "@/lib/github";

export async function GET(_req: Request, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  if (!GITHUB_USERNAME.test(username)) {
    return NextResponse.json({ error: "Invalid GitHub username" }, { status: 400 });
  }
  try {
    const data = await getContributions(username);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400" },
    });
  } catch (e) {
    const message = (e as Error).message;
    return NextResponse.json({ error: message }, { status: /not found/i.test(message) ? 404 : 502 });
  }
}
