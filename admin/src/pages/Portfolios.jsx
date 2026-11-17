import { useEffect, useState } from "react";
import { Copy, ExternalLink, IdCard, Loader2, Pencil, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { DocEditorModal } from "../components/DocEditor";
import { Spinner } from "../components/Spinner";
import { Empty } from "../components/Empty";
import { toast } from "../components/Toast";
import { SITE_URL, counts, duplicateProfile, listProfiles } from "../portfolio/api";

/** All portfolio profiles (one per team member), shown on the site at /team/<address>. */
export default function Portfolios() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(null);
  const [creating, setCreating] = useState(false);

  // Profiles and stats load together, so the page appears once, complete.
  useEffect(() => {
    let alive = true;
    Promise.allSettled([listProfiles(), counts()]).then(([list, totals]) => {
      if (!alive) return;
      if (list.status === "fulfilled") setProfiles(list.value);
      else {
        setError(list.reason?.message || "Profiles could not be loaded.");
        setProfiles([]);
      }
      setStats(totals.status === "fulfilled" ? totals.value : null);
    });
    return () => {
      alive = false;
    };
  }, []);

  async function duplicate(profile) {
    setBusy(profile.id);
    try {
      const copy = await duplicateProfile(profile.id);
      toast.success(`${profile.name} duplicated as a private copy.`);
      navigate(`/portfolio/${copy}`);
    } catch (err) {
      toast.error(err);
      setBusy(null);
    }
  }

  if (!profiles) return <Spinner label="Loading profiles…" />;

  return (
    <>
      <header className="top row">
        <div>
          <p className="eyebrow">Portfolio</p>
          <h1>Profiles</h1>
          <p>Each team member&apos;s portfolio at /team/&lt;address&gt; on the site. Changes go live when saved.</p>
        </div>
        <button className="primary" type="button" onClick={() => setCreating(true)}>
          <Plus />
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
      {profiles.length === 0 && !error ? (
        <Empty
          icon={IdCard}
          title="No portfolio profiles yet"
          action={
            <button className="primary" type="button" onClick={() => setCreating(true)}>
              <Plus />
              New profile
            </button>
          }
        >
          Create a profile for each team member who should have a portfolio at /team/&lt;address&gt;.
        </Empty>
      ) : null}
      {profiles.length ? (
        <div className="list pf-table">
          {profiles.map((p) => (
            <article key={p.id}>
              <Link to={`/portfolio/${p.id}`} className="pf-row-hit">
                {p.avatarUrl ? <img src={p.avatarUrl} alt="" /> : <span className="ph" />}
                <span>
                  <strong>
                    {p.name}
                    {p.role ? <em className="pf-role">{p.role}</em> : null}
                  </strong>
                  <span>/team/{p.slug}</span>
                </span>
              </Link>
              <em className={`pill is-${p.visibility}`}>{p.visibility === "private" ? "Private" : "Public"}</em>
              <span className="pf-count">{p.items} items</span>
              <div className="actions">
                {p.visibility === "public" ? (
                  <a
                    className="ghost icon-btn"
                    href={`${SITE_URL}/team/${p.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`View ${p.name}'s portfolio`}
                    title="View on the site"
                  >
                    <ExternalLink />
                  </a>
                ) : null}
                <button
                  type="button"
                  className="ghost icon-btn"
                  disabled={busy === p.id}
                  onClick={() => duplicate(p)}
                  aria-label={`Duplicate ${p.name}`}
                  title={busy === p.id ? "Duplicating…" : "Duplicate"}
                >
                  {busy === p.id ? <Loader2 className="spin" /> : <Copy />}
                </button>
                <Link className="primary icon-btn" to={`/portfolio/${p.id}`} aria-label={`Edit ${p.name}`} title="Edit">
                  <Pencil />
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
