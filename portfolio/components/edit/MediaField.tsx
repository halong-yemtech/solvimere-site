"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FiArrowLeft, FiArrowRight, FiFile, FiImage, FiUpload, FiX } from "react-icons/fi";
import { listMedia, uploadMedia } from "@/lib/edit/actions";
import type { MediaItem } from "@/lib/edit/types";
import { isImage, prepareUpload } from "./formUtils";

type MediaValue = MediaItem | number | null;

function Thumb({ item, size = 96 }: { item: MediaValue; size?: number }) {
  if (!item || typeof item === "number") {
    return (
      <div
        style={{ width: size, height: size }}
        className="rounded-lg bg-gray-800 grid place-items-center text-gray-500 text-lg"
      >
        #{String(item ?? "")}
      </div>
    );
  }
  return isImage(item) ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={item.url}
      alt={item.alt}
      style={{ width: size, height: size }}
      className="rounded-lg object-cover bg-gray-800"
    />
  ) : (
    <div
      style={{ width: size, height: size }}
      className="rounded-lg bg-gray-800 flex flex-col items-center justify-center gap-1 text-gray-400 p-1"
    >
      <FiFile className="text-3xl" />
      <span className="text-sm truncate max-w-full">{item.filename}</span>
    </div>
  );
}

/** Upload or pick media for an `upload` field (single or hasMany). */
export default function MediaField({
  value,
  hasMany,
  onChange,
}: {
  value: MediaValue | MediaValue[];
  hasMany: boolean;
  onChange: (v: MediaValue | MediaValue[]) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [picking, setPicking] = useState(false);
  const list: MediaValue[] = hasMany ? ((value as MediaValue[]) ?? []) : value ? [value as MediaValue] : [];

  const add = (items: MediaItem[]) => {
    if (!items.length) return;
    onChange(hasMany ? [...list, ...items] : items[0]);
  };

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    const uploaded: MediaItem[] = [];
    for (const raw of Array.from(hasMany ? files : [files[0]])) {
      const form = new FormData();
      form.append("file", await prepareUpload(raw));
      const res = await uploadMedia(form);
      if (res.ok) uploaded.push(res.data);
      else toast.error(`${raw.name}: ${res.error}`);
    }
    setUploading(false);
    add(uploaded);
    if (fileRef.current) fileRef.current.value = "";
  }

  const move = (i: number, d: -1 | 1) => {
    const next = [...list];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  const remove = (i: number) => (hasMany ? onChange(list.filter((_, j) => j !== i)) : onChange(null));

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        void onFiles(e.dataTransfer.files);
      }}
      className="rounded-xl border border-dashed border-gray-700 p-3"
    >
      <div className="flex flex-wrap gap-3">
        {list.map((item, i) => (
          <div key={`${typeof item === "object" && item ? item.id : item}-${i}`} className="relative group">
            <Thumb item={item} />
            <div className="absolute inset-x-0 bottom-0 flex justify-between p-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {hasMany && i > 0 ? (
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  className="rounded bg-gray-900/80 p-1"
                  title="Move left"
                >
                  <FiArrowLeft />
                </button>
              ) : (
                <span />
              )}
              {hasMany && i < list.length - 1 && (
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  className="rounded bg-gray-900/80 p-1"
                  title="Move right"
                >
                  <FiArrowRight />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute -top-2 -right-2 rounded-full bg-red-600 text-white p-1 opacity-0 group-hover:opacity-100"
              title="Remove"
            >
              <FiX />
            </button>
          </div>
        ))}
        {(hasMany || list.length === 0) && (
          <div className="flex flex-col gap-2 justify-center">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 hover:bg-gray-700 disabled:opacity-60"
            >
              <FiUpload /> {uploading ? "Uploading…" : "Upload"}
            </button>
            <button
              type="button"
              onClick={() => setPicking(true)}
              className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 hover:bg-gray-700"
            >
              <FiImage /> Library
            </button>
          </div>
        )}
        {!hasMany && list.length === 1 && (
          <div className="flex flex-col gap-2 justify-center">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 hover:bg-gray-700 disabled:opacity-60"
            >
              <FiUpload /> {uploading ? "Uploading…" : "Replace"}
            </button>
            <button
              type="button"
              onClick={() => setPicking(true)}
              className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 hover:bg-gray-700"
            >
              <FiImage /> Library
            </button>
          </div>
        )}
      </div>
      <p className="mt-2 text-base text-gray-500">Drop files here, upload, or pick from the library.</p>
      <input
        ref={fileRef}
        type="file"
        hidden
        multiple={hasMany}
        accept="image/*,application/pdf"
        onChange={(e) => void onFiles(e.target.files)}
      />
      {picking && (
        <MediaPicker
          multiple={hasMany}
          onClose={() => setPicking(false)}
          onPick={(items) => {
            add(items);
            setPicking(false);
          }}
        />
      )}
    </div>
  );
}

function MediaPicker({
  multiple,
  onPick,
  onClose,
}: {
  multiple: boolean;
  onPick: (items: MediaItem[]) => void;
  onClose: () => void;
}) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selected, setSelected] = useState<MediaItem[]>([]);

  useEffect(() => {
    void listMedia(page).then((res) => {
      if (!res.ok) return toast.error(res.error);
      setItems((prev) => (page === 1 ? res.data.items : [...prev, ...res.data.items]));
      setHasMore(res.data.hasNextPage);
    });
  }, [page]);

  const toggle = (m: MediaItem) => {
    if (!multiple) return onPick([m]);
    setSelected((s) => (s.some((x) => x.id === m.id) ? s.filter((x) => x.id !== m.id) : [...s, m]));
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/70 grid place-items-center p-6" onClick={onClose}>
      <div
        className="w-[72rem] max-w-full max-h-[85vh] flex flex-col rounded-2xl bg-gray-900 border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h3 className="text-2xl text-gray-200">Media library</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-800">
            <FiX />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-4">
          {items.map((m) => {
            const on = selected.some((x) => x.id === m.id);
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => toggle(m)}
                className={`rounded-xl p-1 text-left ${on ? "ring-4 ring-main-orange" : "hover:ring-2 hover:ring-gray-600"}`}
              >
                <Thumb item={m} size={110} />
                <p className="mt-1 text-sm text-gray-500 truncate">{m.alt || m.filename}</p>
              </button>
            );
          })}
          {hasMore && (
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              className="rounded-xl bg-gray-800 text-gray-300"
            >
              Load more
            </button>
          )}
        </div>
        {multiple && (
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-800">
            <button onClick={onClose} className="px-5 py-2 rounded-lg hover:bg-gray-800 text-gray-300">
              Cancel
            </button>
            <button
              onClick={() => onPick(selected)}
              disabled={!selected.length}
              className="px-5 py-2 rounded-lg bg-main-orange text-gray-900 font-semibold disabled:opacity-50"
            >
              Add {selected.length || ""}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
