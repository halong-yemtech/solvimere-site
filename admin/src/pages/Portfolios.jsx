import { useEffect, useMemo, useState } from "react";
import { BookOpen, Copy, Eye, EyeOff, ExternalLink, IdCard, Images, Layers, Loader2, Pencil, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { DocEditorModal } from "../components/DocEditor";
import { Spinner } from "../components/Spinner";
import { Empty } from "../components/Empty";
import { Avatar } from "../components/Avatar";
import { PageHead, SearchBox, Stat, Tabs, Toolbar, matches, timeAgo } from "../components/ui";
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
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const shown = useMemo(
    () =>
      (profiles || []).filter(
        (p) => (filter === "all" || p.visibility === filter) && matches(query, p.name, p.role, p.slug),
      ),
    [profiles, filter, query],
  );

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

  const publicCount = profiles.filter((p) => p.visibility === "public").length;

  return (
    <div className="ui-page">
      <PageHead
        icon={IdCard}
        title="Portfolio profiles"
        description="Each team member's portfolio at /team/<address> on the site. Changes go live when saved."
        stats={
          <>
            <Stat icon={Eye} value={publicCount} label="public" tone="good" />
            <Stat icon={EyeOff} value={profiles.length - publicCount} label="private" />
            {stats ? (
              <>
                <Link to="/portfolio/media" className="ui-stat-link">
                  <Stat icon={Images} value={stats.media} label="media" />
                </Link>
                <Link to="/portfolio/guestbook" className="ui-stat-link">
                  <Stat icon={BookOpen} value={stats.comments} label="comments" />
                </Link>
              </>
            ) : null}
          </>
        }
        actions={
          <button className="primary" type="button" onClick={() => setCreating(true)}>
            <Plus />
            New profile
          </button>
        }
      />
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
      ) : (
        <>
          <Toolbar>
            <SearchBox value={query} onChange={setQuery} placeholder="Search name, role or address" />
            <Tabs
              value={filter}
              onChange={setFilter}
              label="Visibility"
              options={[
                { value: "all", label: "All", count: profiles.length },
                { value: "public", label: "Public", icon: Eye, count: publicCount },
                { value: "private", label: "Private", icon: EyeOff, count: profiles.length - publicCount },
              ]}
            />
          </Toolbar>
          {shown.length === 0 ? (
            <Empty compact icon={IdCard} title="No matching profiles">
              Try another search or filter.
            </Empty>
          ) : (
            <div className="pf-cards">
              {shown.map((p) => {
                const isPublic = p.visibility === "public";
                return (
                  <article key={p.id} className="pf-card">
                    <Link to={`/portfolio/${p.id}`} className="pf-card-hit">
                      <Avatar src={p.avatarUrl} name={p.name} size={40} />
                      <span className="pf-card-text">
                        <strong>{p.name}</strong>
                        <span>{p.role || "No job title"}</span>
                        <code>/team/{p.slug}</code>
                      </span>
                    </Link>
                    <footer>
                      <span className={`ui-badge ${isPublic ? "is-green" : "is-gray"}`}>
                        {isPublic ? "Public" : "Private"}
                      </span>
                      <span className="ui-muted" title={p.updatedAt ? `Updated ${timeAgo(p.updatedAt)}` : undefined}>
                        <Layers className="pf-card-meta-icon" /> {p.items}
                      </span>
                      <span className="pf-card-actions">
                        {isPublic ? (
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
                        <Link
                          className="primary icon-btn"
                          to={`/portfolio/${p.id}`}
                          aria-label={`Edit ${p.name}`}
                          title="Edit"
                        >
                          <Pencil />
                        </Link>
                      </span>
                    </footer>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
      {creating ? (
        <DocEditorModal
          title="New profile"
          target={{ kind: "profile" }}
          onClose={() => setCreating(false)}
          onSaved={(id) => navigate(`/portfolio/${id}`)}
        />
      ) : null}
    </div>
  );
}
