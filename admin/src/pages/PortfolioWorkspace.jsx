import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { call, portfolioUrl } from "../lib/portfolio";
import { DocEditor, DocEditorModal } from "../components/DocEditor";

const TABS = [
  { key: "profile", label: "Profile" },
  { key: "content", label: "Content" },
  { key: "cv", label: "CV" },
];

/** One profile: its fields, its list items (works, résumé, …), CV preview, drafts. */
export default function PortfolioWorkspace() {
  const { id: rawId } = useParams();
  const id = Number(rawId);
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = TABS.some((t) => t.key === params.get("tab")) ? params.get("tab") : "profile";
  const [summary, setSummary] = useState(null);
  const [pending, setPending] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(() => {
    call("listProfiles")
      .then((all) => setSummary(all.find((p) => p.id === id) || null))
      .catch((err) => setError(err.message));
    call("getPendingChanges", id)
      .then(setPending)
      .catch(() => setPending([]));
  }, [id]);

  useEffect(refresh, [refresh]);

  async function run(fn, done) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const res = await fn();
      done?.(res);
      refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function openPreview(which) {
    const win = window.open("about:blank", "_blank");
    try {
      const links = await call("previewLinks", id);
      if (win) win.location.href = portfolioUrl(links[which]);
    } catch (err) {
      win?.close();
      setError(err.message);
    }
  }

  const name = summary?.name || "Profile";

  return (
    <>
      <header className="top row">
        <div>
          <p className="eyebrow">
            <Link to="/portfolio">Portfolio</Link> / {summary?.slug ? `/team/${summary.slug}` : "…"}
          </p>
          <h1>{name}</h1>
          {summary ? (
            <div className="pf-pills">
              <em className={`pill is-${summary.visibility}`}>
                {summary.visibility === "private" ? "Private" : "Public"}
              </em>
              {summary.isActive ? <em className="pill is-active">Active</em> : null}
            </div>
          ) : null}
        </div>
        <div className="actions">
          <button type="button" className="ghost" onClick={() => openPreview("page")}>
            Preview drafts
          </button>
          {summary ? (
            <a
              className="ghost"
              href={portfolioUrl(`/team/${summary.slug}`)}
              target="_blank"
              rel="noreferrer"
              title="The published version visitors see"
            >
              View live
            </a>
          ) : null}
          <button
            type="button"
            className="danger"
            disabled={busy || summary?.isActive}
            title={summary?.isActive ? "Make another profile active first" : undefined}
            onClick={() => {
              if (!window.confirm(`Delete ${name} and all of its content (works, résumé, …)? This can't be undone.`))
                return;
              run(
                () => call("deleteItem", "profiles", id),
                () => navigate("/portfolio"),
              );
            }}
          >
            Delete
          </button>
        </div>
      </header>

      {pending.length ? (
        <div className="pf-pending panel">
          <span>
            <strong>
              {pending.length} unpublished change{pending.length === 1 ? "" : "s"}
            </strong>
            <span>
              {pending
                .slice(0, 4)
                .map((p) => `${p.group}: ${p.label}`)
                .join(" · ")}
              {pending.length > 4 ? " …" : ""}
            </span>
          </span>
          <div className="actions">
            <button
              type="button"
              className="ghost"
              disabled={busy}
              onClick={() => {
                if (window.confirm("Throw away all unpublished changes to this profile?")) {
                  run(
                    () => call("discard", undefined, id),
                    (r) => setMessage(`Discarded ${r.discarded} change(s).`),
                  );
                }
              }}
            >
              Discard
            </button>
            <button
              type="button"
              className="primary"
              disabled={busy}
              onClick={() =>
                run(
                  () => call("publish", undefined, id),
                  (r) => setMessage(`Published ${r.published} change(s).`),
                )
              }
            >
              {busy ? "Working…" : "Publish all"}
            </button>
          </div>
        </div>
      ) : summary ? (
        <p className="ok pf-uptodate">Everything is published.</p>
      ) : null}
      {error ? <p className="error">{error}</p> : null}
      {message ? <p className="ok">{message}</p> : null}

      <nav className="doc-tabs pf-tabs" aria-label="Profile sections">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={t.key === tab ? "is-on" : ""}
            aria-current={t.key === tab ? "page" : undefined}
            onClick={() => setParams({ tab: t.key })}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === "profile" ? (
        <DocEditor key={id} target={{ kind: "collection", slug: "profiles", id }} onSaved={refresh} />
      ) : null}
      {tab === "content" ? <ProfileContent profileId={id} onChange={refresh} /> : null}
      {tab === "cv" ? <CvPreview profileId={id} pending={pending.length} onOpen={() => openPreview("cv")} /> : null}
    </>
  );
}

/** Works, résumé entries, services, … that belong to this profile. */
function ProfileContent({ profileId, onChange }) {
  const [groups, setGroups] = useState(null);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    call("listProfileItems", profileId)
      .then(setGroups)
      .catch((err) => setError(err.message));
  }, [profileId]);

  useEffect(load, [load]);

  const changed = () => {
    load();
    onChange();
  };

  async function move(group, index, dir) {
    const ids = group.items.map((i) => i.id);
    [ids[index], ids[index + dir]] = [ids[index + dir], ids[index]];
    setGroups((gs) =>
      gs.map((g) => (g.slug === group.slug ? { ...g, items: ids.map((x) => g.items.find((i) => i.id === x)) } : g)),
    );
    try {
      await call("reorderItems", group.slug, ids);
      onChange();
    } catch (err) {
      setError(err.message);
      load();
    }
  }

  async function remove(group, item) {
    if (!window.confirm(`Delete “${item.label}”? This can't be undone.`)) return;
    try {
      await call("deleteItem", group.slug, item.id);
      changed();
    } catch (err) {
      setError(err.message);
    }
  }

  if (error && !groups) return <p className="error">{error}</p>;
  if (!groups) return <p className="empty">Loading…</p>;

  return (
    <div className="pf-content">
      {error ? <p className="error">{error}</p> : null}
      {groups.map((group) => (
        <section key={group.slug} className="panel">
          <header className="pf-group-head">
            <h2>
              {group.label} <span>{group.items.length}</span>
            </h2>
            <button
              type="button"
              className="ghost"
              onClick={() =>
                setEditing({ kind: "new", slug: group.slug, profileId, title: `New ${group.singular.toLowerCase()}` })
              }
            >
              + Add
            </button>
          </header>
          {group.items.length === 0 ? <p className="empty">None yet.</p> : null}
          <ul className="pf-items">
            {group.items.map((item, i) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="pf-item-hit"
                  onClick={() => setEditing({ kind: "collection", slug: group.slug, id: item.id, title: item.label })}
                >
                  {item.label}
                  {item.status === "draft" ? <em className="pill is-draft">Draft</em> : null}
                </button>
                <span className="pf-item-tools">
                  <button
                    type="button"
                    disabled={i === 0}
                    onClick={() => move(group, i, -1)}
                    aria-label={`Move ${item.label} up`}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={i === group.items.length - 1}
                    onClick={() => move(group, i, 1)}
                    aria-label={`Move ${item.label} down`}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="is-danger"
                    onClick={() => remove(group, item)}
                    aria-label={`Delete ${item.label}`}
                  >
                    ✕
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {editing ? (
        <DocEditorModal
          title={editing.title}
          target={
            editing.kind === "new"
              ? { kind: "new", slug: editing.slug, profileId: editing.profileId }
              : { kind: "collection", slug: editing.slug, id: editing.id }
          }
          onClose={() => {
            setEditing(null);
            changed();
          }}
          onSaved={(newId) => {
            if (editing.kind === "new")
              setEditing({
                kind: "collection",
                slug: editing.slug,
                id: newId,
                title: editing.title.replace(/^New /, ""),
              });
            changed();
          }}
        />
      ) : null}
    </div>
  );
}

/** The PDF résumé generated from this profile (draft version), via a signed preview link. */
function CvPreview({ profileId, pending, onOpen }) {
  const [src, setSrc] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    call("previewLinks", profileId)
      .then((links) => setSrc(`${portfolioUrl(links.cv)}&v=${Date.now()}`))
      .catch((err) => setError(err.message));
  }, [profileId, pending]);
  return (
    <div className="pf-cv">
      <p className="sf-help">
        Generated from this profile&apos;s résumé entries and skills, including unpublished drafts. CV wording and the
        option to use an uploaded PDF instead are in <b>Profile → CV</b>.
      </p>
      <div className="actions">
        <button type="button" className="ghost" onClick={onOpen}>
          Open in a new tab
        </button>
      </div>
      {error ? <p className="error">{error}</p> : null}
      {src ? <iframe title="CV preview" src={src} /> : <p className="empty">Loading…</p>}
    </div>
  );
}
