import { useEffect, useRef, useState } from "react";
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
  const [message, setMessage] = useState("");

  function load() {
    listAllMedia()
      .then(setItems)
      .catch((err) => setError(err.message));
  }
  useEffect(load, []);

  function pick(item) {
    setSelected(item);
    setAlt(item.alt);
    setUsage(null);
    setMessage("");
    mediaUsage(item.id)
      .then(setUsage)
      .catch(() => setUsage([]));
  }

  async function onFiles(files) {
    if (!files?.length) return;
    setBusy(true);
    setError("");
    let ok = 0;
    for (const file of Array.from(files)) {
      try {
        await uploadMedia(file);
        ok += 1;
      } catch (err) {
        setError(`${file.name}: ${err.message}`);
      }
    }
    setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
    if (ok) setMessage(`Uploaded ${ok} file${ok === 1 ? "" : "s"}.`);
    load();
  }

  async function saveAlt(event) {
    event.preventDefault();
    try {
      await updateMediaAlt(selected.id, alt);
      setItems((all) => all.map((m) => (m.id === selected.id ? { ...m, alt } : m)));
      setSelected((s) => ({ ...s, alt }));
      setMessage("Description saved.");
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove() {
    const warn = usage?.length ? `It's used by ${usage.join(", ")}. ` : "";
    if (!window.confirm(`${warn}Delete ${selected.filename}? This can't be undone.`)) return;
    try {
      await deleteMedia(selected);
      setItems((all) => all.filter((m) => m.id !== selected.id));
      setSelected(null);
      setMessage("File deleted.");
    } catch (err) {
      setError(err.message);
    }
  }

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
      {message ? <p className="ok">{message}</p> : null}
      {!items && !error ? <p className="empty">Loading…</p> : null}
      <div className="split pf-media-split">
        <div className="pf-media-grid">
          {(items || []).map((m) => (
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
                Save description
              </button>
              <a className="ghost" href={selected.url} target="_blank" rel="noreferrer">
                Open
              </a>
              <button type="button" className="danger" onClick={remove}>
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
