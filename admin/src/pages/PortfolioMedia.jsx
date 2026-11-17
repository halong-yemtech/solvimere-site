import { useEffect, useRef, useState } from "react";
import { ExternalLink, Images, Loader2, Save, Trash2, Upload } from "lucide-react";
import { Spinner } from "../components/Spinner";
import { Empty } from "../components/Empty";
import { toast } from "../components/Toast";
import { deleteMedia, isImage, listAllMedia, mediaUsage, updateMediaAlt, uploadMedia } from "../portfolio/api";

const size = (n) =>
  n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round((n || 0) / 1024))} KB`;

/** Images and PDFs used in portfolios (Supabase Storage, `portfolio` bucket). */
export default function PortfolioMedia() {
  const fileRef = useRef(null);
  const [items, setItems] = useState(null);
  const [selected, setSelected] = useState(null);
  const [alt, setAlt] = useState("");
  const [usage, setUsage] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function load() {
    listAllMedia()
      .then((list) => {
        setError("");
        setItems(list);
      })
      .catch((err) => {
        setError(err.message);
        setItems((current) => current || []);
      });
  }
  useEffect(load, []);

  function pick(item) {
    setSelected(item);
    setAlt(item.alt);
    setUsage(null);
    mediaUsage(item.id)
      .then(setUsage)
      .catch(() => setUsage([]));
  }

  async function onFiles(files) {
    if (!files?.length) return;
    setBusy(true);
    let ok = 0;
    for (const file of Array.from(files)) {
      try {
        await uploadMedia(file);
        ok += 1;
      } catch (err) {
        toast.error(`${file.name}: ${err.message}`);
      }
    }
    setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
    if (ok) toast.success(`Uploaded ${ok} file${ok === 1 ? "" : "s"}.`);
    load();
  }

  async function saveAlt(event) {
    event.preventDefault();
    try {
      await updateMediaAlt(selected.id, alt);
      setItems((all) => all.map((m) => (m.id === selected.id ? { ...m, alt } : m)));
      setSelected((s) => ({ ...s, alt }));
      toast.success("Description saved.");
    } catch (err) {
      toast.error(err);
    }
  }

  async function remove() {
    const warn = usage?.length ? `It's used by ${usage.join(", ")}. ` : "";
    if (!window.confirm(`${warn}Delete ${selected.filename}? This can't be undone.`)) return;
    try {
      await deleteMedia(selected);
      setItems((all) => all.filter((m) => m.id !== selected.id));
      setSelected(null);
      toast.success(`${selected.filename} deleted.`);
    } catch (err) {
      toast.error(err);
    }
  }

  if (!items) return <Spinner label="Loading media…" />;

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        onFiles(e.dataTransfer.files);
      }}
    >
      <header className="top row">
        <div>
          <p className="eyebrow">Portfolio</p>
          <h1>Media library</h1>
          <p>Images and PDFs used in portfolios. Drop files anywhere here to upload.</p>
        </div>
        <button type="button" className="primary" disabled={busy} onClick={() => fileRef.current?.click()}>
          {busy ? <Loader2 className="spin" /> : <Upload />}
          {busy ? "Uploading…" : "Upload"}
        </button>
        <input
          ref={fileRef}
          type="file"
          hidden
          multiple
          accept="image/*,application/pdf"
          onChange={(e) => onFiles(e.target.files)}
        />
      </header>
      {error ? <p className="error">{error}</p> : null}
      {items.length === 0 && !error ? (
        <Empty
          icon={Images}
          title="No media yet"
          action={
            <button type="button" className="primary" disabled={busy} onClick={() => fileRef.current?.click()}>
              {busy ? <Loader2 className="spin" /> : <Upload />}
              {busy ? "Uploading…" : "Upload files"}
            </button>
          }
        >
          Upload images and PDFs for the portfolios, or drop files anywhere on this page.
        </Empty>
      ) : null}
      <div className="split pf-media-split" hidden={items.length === 0}>
        <div className="pf-media-grid">
          {items.map((m) => (
            <button
              key={m.id}
              type="button"
              className={selected?.id === m.id ? "is-on" : ""}
              onClick={() => pick(m)}
              title={m.filename}
            >
              {isImage(m) ? (
                <img src={m.url} alt={m.alt} loading="lazy" />
              ) : (
                <span className="sf-thumb is-file">{m.filename}</span>
              )}
            </button>
          ))}
        </div>
        {selected ? (
          <form className="panel editor" onSubmit={saveAlt}>
            <h2>{selected.filename}</h2>
            {isImage(selected) ? <img className="pf-media-preview" src={selected.url} alt={selected.alt} /> : null}
            <p>
              {selected.mimeType} · {size(selected.filesize)}
              {selected.width ? ` · ${selected.width}×${selected.height}` : ""}
            </p>
            <label className="field">
              <span>Description (alt text)</span>
              <input value={alt} maxLength={300} onChange={(e) => setAlt(e.target.value)} />
            </label>
            <p>
              {usage === null
                ? "Checking where it's used…"
                : usage.length
                  ? `Used by: ${usage.join(", ")}`
                  : "Not used anywhere."}
            </p>
            <div className="actions">
              <button type="submit" className="primary" disabled={alt === selected.alt}>
                <Save />
                Save description
              </button>
              <a className="ghost" href={selected.url} target="_blank" rel="noreferrer">
                <ExternalLink />
                Open
              </a>
              <button type="button" className="danger" onClick={remove}>
                <Trash2 />
                Delete
              </button>
            </div>
          </form>
        ) : (
          <section className="panel editor empty-editor">
            <h2>File details</h2>
            <p>Select a file to edit its description, see where it&apos;s used, or delete it.</p>
          </section>
        )}
      </div>
    </div>
  );
}
