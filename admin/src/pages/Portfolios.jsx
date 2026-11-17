import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { call, portfolioUrl } from "../lib/portfolio";
import { DocEditorModal } from "../components/DocEditor";

/** All portfolio profiles (one per team member) — /team/<slug> on the site. */
export default function Portfolios() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(null);
  const [creating, setCreating] = useState(false);

  function load() {
    call("listProfiles")
      .then(setProfiles)
      .catch((err) => setError(err.message));
    call("overview")
      .then(setStats)
      .catch(() => {});
  }

  useEffect(load, []);

  async function act(id, op, done) {
    setBusy(id);
    setError("");
    setMessage("");
    try {
      const result = await call(op, id);
      done?.(result);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <header className="top row">
        <div>
          <p className="eyebrow">Portfolio</p>
          <h1>Profiles</h1>
          <p>
            Each team member&apos;s portfolio, at /team/&lt;slug&gt; on the site. Edits are saved as drafts; publish
            them from the profile.
          </p>
        </div>
        <button className="primary" type="button" onClick={() => setCreating(true)}>
          New profile
        </button>
      </header>
      {stats ? (
        <div className="pf-stats">
          <Link to="/portfolio/inbox" className="panel">
            <strong>{stats.unhandledMessages}</strong>
            <span>New contact messages</span>
          </Link>
          <Link to="/portfolio/inbox?tab=guestbook" className="panel">
            <strong>{stats.guestbook}</strong>
            <span>Guest-book comments</span>
          </Link>
          <Link to="/portfolio/media" className="panel">
            <strong>{stats.media}</strong>
            <span>Media files</span>
          </Link>
        </div>
      ) : null}
      {error ? <p className="error">{error}</p> : null}
      {message ? <p className="ok">{message}</p> : null}
      {!profiles && !error ? <p className="empty">Loading…</p> : null}
      {profiles && profiles.length === 0 ? <p className="empty">No profiles yet.</p> : null}
      <div className="pf-grid">
        {(profiles || []).map((p) => (
          <article key={p.id} className="panel pf-card">
            <Link to={`/portfolio/${p.id}`} className="pf-card-hit">
              {p.avatarUrl ? <img src={portfolioUrl(p.avatarUrl)} alt="" /> : <span className="ph lg" />}
              <span>
                <strong>{p.name}</strong>
                <span>/team/{p.slug}</span>
              </span>
            </Link>
            <div className="pf-pills">
              <em className={`pill is-${p.status}`}>{p.status === "draft" ? "Has drafts" : "Published"}</em>
              <em className={`pill is-${p.visibility}`}>{p.visibility === "private" ? "Private" : "Public"}</em>
              {p.isActive ? <em className="pill is-active">Active</em> : null}
              <em className="pill">{p.items} items</em>
            </div>
            <div className="actions">
              <Link className="primary" to={`/portfolio/${p.id}`}>
                Edit
              </Link>
              <button
                type="button"
                className="ghost"
                disabled={busy === p.id}
                onClick={() => act(p.id, "duplicateProfile", (res) => navigate(`/portfolio/${res.id}`))}
              >
                Duplicate
              </button>
              {!p.isActive ? (
                <button
                  type="button"
                  className="ghost"
                  disabled={busy === p.id}
                  onClick={() =>
                    act(p.id, "setActiveProfile", () => setMessage(`${p.name} is now the active profile.`))
                  }
                >
                  Make active
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
      {creating ? (
        <DocEditorModal
          title="New profile"
          target={{ kind: "new", slug: "profiles" }}
          onClose={() => setCreating(false)}
          onSaved={(id) => navigate(`/portfolio/${id}`)}
        />
      ) : null}
    </>
  );
}
