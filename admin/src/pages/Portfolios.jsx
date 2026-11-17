import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DocEditorModal } from "../components/DocEditor";
import { SITE_URL, counts, duplicateProfile, listProfiles } from "../portfolio/api";

/** All portfolio profiles (one per team member), shown on the site at /team/<address>. */
export default function Portfolios() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(null);
  const [creating, setCreating] = useState(false);

  function load() {
    listProfiles()
      .then(setProfiles)
      .catch((err) => setError(err.message));
    counts()
      .then(setStats)
      .catch(() => {});
  }
  useEffect(load, []);

  async function duplicate(id) {
    setBusy(id);
    setError("");
    try {
      navigate(`/portfolio/${await duplicateProfile(id)}`);
    } catch (err) {
      setError(err.message);
      setBusy(null);
    }
  }

  return (
    <>
      <header className="top row">
        <div>
          <p className="eyebrow">Portfolio</p>
          <h1>Profiles</h1>
          <p>Each team member&apos;s portfolio at /team/&lt;address&gt; on the site. Changes go live when saved.</p>
        </div>
        <button className="primary" type="button" onClick={() => setCreating(true)}>
          New profile
        </button>
      </header>
      {stats ? (
        <div className="stats">
          <article>
            <strong>{stats.profiles}</strong>
            <span>Profiles</span>
          </article>
          <Link to="/portfolio/media" className="stat-link">
            <strong>{stats.media}</strong>
            <span>Media files</span>
          </Link>
          <Link to="/portfolio/guestbook" className="stat-link">
            <strong>{stats.comments}</strong>
            <span>Guest-book comments</span>
          </Link>
        </div>
      ) : null}
      {error ? <p className="error">{error}</p> : null}
      {!profiles && !error ? <p className="empty">Loading…</p> : null}
      {profiles && profiles.length === 0 ? <p className="empty">No profiles yet.</p> : null}
      {profiles?.length ? (
        <div className="list pf-table">
          {profiles.map((p) => (
            <article key={p.id}>
              <Link to={`/portfolio/${p.id}`} className="pf-row-hit">
                {p.avatarUrl ? <img src={p.avatarUrl} alt="" /> : <span className="ph" />}
                <span>
                  <strong>{p.name}</strong>
                  <span>/team/{p.slug}</span>
                </span>
              </Link>
              <em className={`pill is-${p.visibility}`}>{p.visibility === "private" ? "Private" : "Public"}</em>
              <span className="pf-count">{p.items} items</span>
              <div className="actions">
                {p.visibility === "public" ? (
                  <a className="ghost" href={`${SITE_URL}/team/${p.slug}`} target="_blank" rel="noreferrer">
                    View
                  </a>
                ) : null}
                <button type="button" className="ghost" disabled={busy === p.id} onClick={() => duplicate(p.id)}>
                  Duplicate
                </button>
                <Link className="primary" to={`/portfolio/${p.id}`}>
                  Edit
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : null}
      {creating ? (
        <DocEditorModal
          title="New profile"
          target={{ kind: "profile" }}
          onClose={() => setCreating(false)}
          onSaved={(id) => navigate(`/portfolio/${id}`)}
        />
      ) : null}
    </>
  );
}
