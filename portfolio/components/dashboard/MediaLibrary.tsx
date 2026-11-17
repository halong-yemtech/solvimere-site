"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FiCopy, FiExternalLink, FiFile, FiSearch, FiTrash2, FiUpload, FiX } from "react-icons/fi";
import { deleteMedia, mediaUsage, updateMediaAlt } from "@/lib/dashboard/actions";
import { uploadMedia } from "@/lib/edit/actions";
import { prepareUpload } from "../edit/formUtils";
import { inputCls } from "../edit/FieldRenderer";

interface Item {
  id: number;
  url: string;
  alt: string;
  filename: string;
  mimeType: string;
  filesize: number;
  width: number | null;
  height: number | null;
  createdAt: string;
}

const size = (b: number) => (b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1e3))} KB`);

export default function MediaLibrary({ items }: { items: Item[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<"all" | "image" | "pdf">("all");
  const [uploading, setUploading] = useState(0);
  const [openId, setOpenId] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);

  const shown = useMemo(
    () =>
      items.filter(
        (m) =>
          (kind === "all" || (kind === "image" ? m.mimeType.startsWith("image/") : m.mimeType === "application/pdf")) &&
          `${m.alt} ${m.filename}`.toLowerCase().includes(q.toLowerCase()),
      ),
    [items, q, kind],
  );
  const open = items.find((m) => m.id === openId) ?? null;

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    const list = Array.from(files);
    setUploading(list.length);
    let ok = 0;
    for (const f of list) {
      const form = new FormData();
      form.append("file", await prepareUpload(f));
      const res = await uploadMedia(form);
      if (res.ok) ok++;
      else toast.error(`${f.name}: ${res.error}`);
      setUploading((n) => n - 1);
    }
    if (ok) toast.success(`Uploaded ${ok} file(s)`);
    if (fileRef.current) fileRef.current.value = "";
    router.refresh();
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        void upload(e.dataTransfer.files);
      }}
      className={`rounded-2xl ${dragging ? "ring-4 ring-main-orange/60" : ""}`}
    >
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[20rem] max-w-[40rem]">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or alt text"
            className={`${inputCls} pl-12`}
          />
        </div>
        <div className="flex rounded-lg bg-gray-800 p-1 text-lg">
          {(["all", "image", "pdf"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setKind(k)}
              className={`px-4 py-1.5 rounded-md capitalize ${kind === k ? "bg-gray-600 text-white" : "text-gray-400"}`}
            >
              {k === "pdf" ? "PDFs" : k === "image" ? "Images" : "All"}
            </button>
          ))}
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading > 0}
          className="ml-auto flex items-center gap-2 rounded-full px-6 py-3 bg-main-orange text-gray-900 font-semibold text-xl disabled:opacity-60"
        >
          <FiUpload /> {uploading ? `Uploading ${uploading}…` : "Upload"}
        </button>
        <input
          ref={fileRef}
          type="file"
          hidden
          multiple
          accept="image/*,application/pdf"
          onChange={(e) => void upload(e.target.files)}
        />
      </div>

      {shown.length === 0 && <p className="py-16 text-center text-xl text-gray-500">No files.</p>}
      <ul className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(16rem,1fr))]">
        {shown.map((m) => (
          <li key={m.id}>
            <button
              onClick={() => setOpenId(m.id)}
              className="w-full text-left rounded-xl bg-gray-900 border border-gray-800 overflow-hidden hover:border-main-orange"
            >
              {m.mimeType.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.url} alt={m.alt} loading="lazy" className="w-full aspect-square object-cover bg-gray-800" />
              ) : (
                <div className="w-full aspect-square grid place-items-center bg-gray-800 text-gray-400">
                  <FiFile className="text-6xl" />
                </div>
              )}
              <div className="px-3 py-2">
                <p className="text-lg text-gray-300 truncate">{m.alt || m.filename}</p>
                <p className="text-base text-gray-500 truncate">
                  {m.filename} · {size(m.filesize)}
                </p>
              </div>
            </button>
          </li>
        ))}
      </ul>

      {open && <Details item={open} onClose={() => setOpenId(null)} onChanged={() => router.refresh()} />}
    </div>
  );
}

function Details({ item, onClose, onChanged }: { item: Item; onClose: () => void; onChanged: () => void }) {
  const [alt, setAlt] = useState(item.alt);
  const [pending, start] = useTransition();
  const absolute = typeof window !== "undefined" ? new URL(item.url, window.location.origin).toString() : item.url;

  const save = () =>
    start(async () => {
      const res = await updateMediaAlt(item.id, alt);
      if (!res.ok) return void toast.error(res.error);
      toast.success("Saved");
      onChanged();
    });

  const remove = () =>
    start(async () => {
      const usage = await mediaUsage(item.id);
      const where =
        usage.ok && usage.data.length
          ? `\n\nIt is used by:\n• ${usage.data.join("\n• ")}\n\nThose places will lose this file.`
          : "";
      if (!confirm(`Delete “${item.filename}”? This cannot be undone.${where}`)) return;
      const res = await deleteMedia(item.id);
      if (!res.ok) return void toast.error(res.error);
      toast.success("Deleted");
      onClose();
      onChanged();
    });

  return (
    <div className="fixed inset-0 z-[70] flex justify-end" role="dialog" aria-modal="true" aria-label="Media details">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <aside className="relative w-[52rem] max-w-full h-full overflow-y-auto bg-gray-900 border-l border-gray-700 p-8 text-gray-300">
        <button onClick={onClose} className="absolute top-6 right-6 p-3 rounded-full hover:bg-gray-800" title="Close">
          <FiX className="text-2xl" />
        </button>
        <h2 className="text-3xl font-semibold text-gray-100 pr-14 break-all">{item.filename}</h2>
        <p className="mt-1 text-lg text-gray-500">
          {item.mimeType} · {size(item.filesize)}
          {item.width ? ` · ${item.width}×${item.height}` : ""} · {new Date(item.createdAt).toLocaleDateString()}
        </p>
        <div className="mt-6 rounded-xl bg-gray-800 overflow-hidden">
          {item.mimeType.startsWith("image/") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.url} alt={item.alt} className="w-full max-h-[50vh] object-contain" />
          ) : (
            <iframe src={item.url} title={item.filename} className="w-full h-[50vh] bg-white" />
          )}
        </div>
        <label className="block mt-6">
          <span className="block mb-2 text-lg uppercase tracking-wider text-gray-400">Alt text</span>
          <input
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            className={inputCls}
            placeholder="Describe the image for screen readers"
          />
        </label>
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={save}
            disabled={pending || alt === item.alt}
            className="rounded-lg px-5 py-2.5 bg-main-orange text-gray-900 font-semibold text-lg disabled:opacity-50"
          >
            Save
          </button>
          <button
            onClick={() => navigator.clipboard.writeText(absolute).then(() => toast.success("Link copied"))}
            className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-lg bg-gray-800 hover:bg-gray-700"
          >
            <FiCopy /> Copy link
          </button>
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-lg bg-gray-800 hover:bg-gray-700"
          >
            <FiExternalLink /> Open
          </a>
          <button
            onClick={remove}
            disabled={pending}
            className="ml-auto flex items-center gap-2 rounded-lg px-4 py-2.5 text-lg text-red-400 hover:bg-red-950/50"
          >
            <FiTrash2 /> Delete
          </button>
        </div>
      </aside>
    </div>
  );
}
