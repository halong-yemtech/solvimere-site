import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ExternalLink,
  FileText,
  FileType,
  Image as ImageIcon,
  Images,
  Link2,
  Loader2,
  MousePointerClick,
  Save,
  Trash2,
  Upload,
  UploadCloud,
} from "lucide-react";
import { Spinner } from "../components/Spinner";
import { Empty } from "../components/Empty";
import { PageHead, SearchBox, Stat, Tabs, Toolbar, matches } from "../components/ui";
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
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const dragDepth = useRef(0);

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

  const images = items.filter(isImage).length;
  const shown = items.filter(
    (m) => (kind === "all" || (kind === "images" ? isImage(m) : !isImage(m))) && matches(query, m.filename, m.alt),
  );
  const total = items.reduce((sum, m) => sum + (m.filesize || 0), 0);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(selected.url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
      toast.success("Link copied.");
    } catch {
      toast.error("Couldn't copy the link.");
    }
  }

  const uploadButton = (
    <button type="button" className="primary" disabled={busy} onClick={() => fileRef.current?.click()}>
      {busy ? <Loader2 className="spin" /> : <Upload />}
      {busy ? "Uploading…" : "Upload"}
    </button>
  );

  return (
    <div
      className="ui-page media-page"
      onDragEnter={(e) => {
        if (![...e.dataTransfer.types].includes("Files")) return;
        dragDepth.current += 1;
        setDragging(true);
      }}
      onDragLeave={() => {
        dragDepth.current = Math.max(0, dragDepth.current - 1);
        if (!dragDepth.current) setDragging(false);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        dragDepth.current = 0;
        setDragging(false);
        onFiles(e.dataTransfer.files);
      }}
    >
      <PageHead
        icon={Images}
        title="Media library"
        description="Images and PDFs used in portfolios. Drop files anywhere on this page to upload."
        stats={
          <>
            <Stat icon={ImageIcon} value={images} label={images === 1 ? "image" : "images"} />
            <Stat icon={FileText} value={items.length - images} label={items.length - images === 1 ? "PDF" : "PDFs"} />
            <Stat icon={UploadCloud} value={size(total)} label="total" />
          </>
        }
        actions={uploadButton}
      />
      <input
        ref={fileRef}
        type="file"
        hidden
        multiple
        accept="image/*,application/pdf"
        onChange={(e) => onFiles(e.target.files)}
      />
      {error ? <p className="error">{error}</p> : null}

      {items.length === 0 && !error ? (
        <Empty icon={Images} title="No media yet" action={uploadButton}>
          Upload images and PDFs for the portfolios, or drop files anywhere on this page.
        </Empty>
      ) : (
        <>
          <Toolbar>
            <SearchBox value={query} onChange={setQuery} placeholder="Search file name or description" />
            <Tabs
              value={kind}
              onChange={setKind}
              label="File type"
              options={[
                { value: "all", label: "All", count: items.length },
                { value: "images", label: "Images", icon: ImageIcon, count: images },
                { value: "files", label: "PDFs", icon: FileType, count: items.length - images },
              ]}
            />
          </Toolbar>
          <div className="media-layout">
            <div className="media-grid">
              {shown.length === 0 ? (
                <Empty compact icon={Images} title="No matching files">
                  Try another search or filter.
                </Empty>
              ) : null}
              {shown.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`media-tile${selected?.id === m.id ? " is-on" : ""}`}
                  onClick={() => pick(m)}
                  title={m.filename}
                >
                  {isImage(m) ? (
                    <img src={m.url} alt={m.alt} loading="lazy" />
                  ) : (
                    <span className="media-file">
                      <FileText />
                      PDF
                    </span>
                  )}
                  <span className="media-name">{m.filename}</span>
                  {!m.alt ? <span className="media-flag" title="No description" /> : null}
                </button>
              ))}
            </div>

            {selected ? (
              <form className="ui-card media-detail" onSubmit={saveAlt}>
                <div className="media-preview">
                  {isImage(selected) ? (
                    <img src={selected.url} alt={selected.alt} />
                  ) : (
                    <span className="media-file is-lg">
                      <FileText />
                      PDF
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="media-title">{selected.filename}</h2>
                  <dl className="media-facts">
                    <div>
                      <dt>Type</dt>
                      <dd>{selected.mimeType}</dd>
                    </div>
                    <div>
                      <dt>Size</dt>
                      <dd>{size(selected.filesize)}</dd>
                    </div>
                    {selected.width ? (
                      <div>
                        <dt>Dimensions</dt>
                        <dd>
                          {selected.width} × {selected.height}
                        </dd>
                      </div>
                    ) : null}
                    <div>
                      <dt>Used by</dt>
                      <dd>
                        {usage === null ? (
                          <span className="ui-muted">Checking…</span>
                        ) : usage.length ? (
                          usage.join(", ")
                        ) : (
                          <span className="ui-muted">Not used anywhere</span>
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>
                <label className="field">
                  <span>Description (alt text)</span>
                  <textarea
                    rows="2"
                    value={alt}
                    maxLength={300}
                    placeholder="Describe the image for screen readers and search engines"
                    onChange={(e) => setAlt(e.target.value)}
                  />
                </label>
                <div className="ui-actions">
                  <button
                    type="button"
                    className="danger icon-btn media-delete"
                    onClick={remove}
                    title="Delete file"
                    aria-label="Delete file"
                  >
                    <Trash2 />
                  </button>
                  <button
                    type="button"
                    className="ghost icon-btn"
                    onClick={copyLink}
                    title="Copy link"
                    aria-label="Copy link"
                  >
                    {copied ? <Check /> : <Link2 />}
                  </button>
                  <a
                    className="ghost icon-btn"
                    href={selected.url}
                    target="_blank"
                    rel="noreferrer"
                    title="Open in a new tab"
                    aria-label="Open in a new tab"
                  >
                    <ExternalLink />
                  </a>
                  <button type="submit" className="primary" disabled={alt === selected.alt}>
                    <Save />
                    Save
                  </button>
                </div>
              </form>
            ) : (
              <section className="ui-card media-detail">
                <Empty icon={MousePointerClick} title="Select a file">
                  See its details, edit its description, copy its link or delete it.
                </Empty>
              </section>
            )}
          </div>
        </>
      )}
      {dragging ? (
        <div className="media-drop" aria-hidden="true">
          <UploadCloud />
          <strong>Drop to upload</strong>
          <span>Images and PDFs</span>
        </div>
      ) : null}
    </div>
  );
}
