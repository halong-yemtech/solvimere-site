import { requireAdmin } from "@/lib/auth";
import { getPayloadClient } from "@/lib/site";
import MediaLibrary from "@/components/dashboard/MediaLibrary";

export const metadata = { title: "Media library" };

export default async function MediaPage() {
  const user = await requireAdmin();
  const payload = await getPayloadClient();
  const res = await payload.find({
    collection: "media",
    sort: "-createdAt",
    limit: 1000,
    pagination: false,
    depth: 0,
    user,
    overrideAccess: false,
  });
  return (
    <div className="max-w-[150rem] space-y-6">
      <header>
        <h1 className="text-[3.2rem] font-semibold text-gray-100">Media library</h1>
        <p className="text-xl text-gray-500">
          Images and PDFs used on the site. Drop files anywhere on this page to upload.
        </p>
      </header>
      <MediaLibrary
        items={res.docs.map((m) => ({
          id: m.id,
          url: m.url ?? "",
          alt: m.alt ?? "",
          filename: m.filename ?? "",
          mimeType: m.mimeType ?? "",
          filesize: m.filesize ?? 0,
          width: m.width ?? null,
          height: m.height ?? null,
          createdAt: m.createdAt,
        }))}
      />
    </div>
  );
}
