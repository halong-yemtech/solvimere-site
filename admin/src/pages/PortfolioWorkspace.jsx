import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { DocEditor, DocEditorModal } from "../components/DocEditor";
import { SITE_URL, deleteItem, deleteProfile, listItems, listProfiles, reorderItems } from "../portfolio/api";

const TABS = [
  { key: "profile", label: "Profile" },
  { key: "content", label: "Content" },
];

/** One profile: its fields and its list items (works, résumé, …). */
export default function PortfolioWorkspace() {
  const { id: rawId } = useParams();
  const id = Number(rawId);
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = TABS.some((t) => t.key === params.get("tab")) ? params.get("tab") : "profile";
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  const refresh = useCallback(() => {
    listProfiles()
      .then((all) => {
        const found = all.find((p) => p.id === id);
        if (!found) setError("This profile doesn't exist.");
        setSummary(found || null);
      })
      .catch((err) => setError(err.message));
  }, [id]);
  useEffect(refresh, [refresh]);

  async function remove() {
    if (!window.confirm(`Delete ${summary.name} and all of its content? This can't be undone.`)) return;
    try {
      await deleteProfile(id);
      navigate("/portfolio");
    } catch (err) {
      setError(err.message);
    }
  }

  const live = summary?.visibility === "public";

  return (
    <>
      <header className="top row">
        <div>
          <p className="eyebrow">
            <Link to="/portfolio">Portfolio</Link> / {summary ? `/team/${summary.slug}` : "…"}
          </p>
          <h1>{summary?.name || "Profile"}</h1>
        </div>
        {summary ? (
          <div className="actions">
            <em className={`pill is-${summary.visibility}`}>{live ? "Public" : "Private"}</em>
            {live ? (
              <>
                <a className="ghost" href={`${SITE_URL}/team/${summary.slug}`} target="_blank" rel="noreferrer">
                  View live
                </a>
                <a className="ghost" href={`${SITE_URL}/team/${summary.slug}/cv`} target="_blank" rel="noreferrer">
                  CV
                </a>
              </>
            ) : null}
            <button type="button" className="danger" onClick={remove}>
              Delete
            </button>
          </div>
        ) : null}
      </header>
      {error ? <p className="error">{error}</p> : null}

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
        <DocEditor
          key={id}
          target={{ kind: "profile", id }}
          onSaved={refresh}
          savedNotice={
            live ? "Saved. Changes are live." : "Saved. The profile is private: set it to Public to show it."
          }
        />
      ) : null}
      {tab === "content" ? <ProfileContent profileId={id} /> : null}
    </>
  );
}

/** Works, résumé entries, services, … that belong to this profile. */
function ProfileContent({ profileId }) {
  const [groups, setGroups] = useState(null);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    listItems(profileId)
      .then(setGroups)
      .catch((err) => setError(err.message));
  }, [profileId]);
  useEffect(load, [load]);

  async function move(group, index, dir) {
    const ids = group.items.map((i) => i.id);
    [ids[index], ids[index + dir]] = [ids[index + dir], ids[index]];
    setGroups((gs) =>
      gs.map((g) => (g.kind === group.kind ? { ...g, items: ids.map((x) => g.items.find((i) => i.id === x)) } : g)),
    );
    try {
      await reorderItems(ids);
    } catch (err) {
      setError(err.message);
      load();
    }
  }

  async function remove(item) {
    if (!window.confirm(`Delete “${item.label}”? This can't be undone.`)) return;
    try {
      await deleteItem(item.id);
      load();
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
        <section key={group.kind} className="panel">
          <header className="pf-group-head">
            <h2>
              {group.label} <span>{group.items.length}</span>
            </h2>
            <button
              type="button"
              className="ghost"
              onClick={() =>
                setEditing({
                  target: { kind: "item", itemKind: group.kind, profileId },
                  title: `New ${group.singular.toLowerCase()}`,
                })
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
                  onClick={() =>
                    setEditing({
                      target: { kind: "item", itemKind: group.kind, profileId, id: item.id },
                      title: item.label,
                    })
                  }
                >
                  {item.label}
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
                    onClick={() => remove(item)}
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
          target={editing.target}
          onClose={() => {
            setEditing(null);
            load();
          }}
          onSaved={(newId) => {
            // A new item becomes an existing one, so further saves update it.
            if (editing.target.id == null) setEditing({ ...editing, target: { ...editing.target, id: newId } });
            load();
          }}
        />
      ) : null}
    </div>
  );
}
