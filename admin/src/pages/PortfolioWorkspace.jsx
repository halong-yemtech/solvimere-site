import { useCallback, useEffect, useState } from "react";
import {
  BadgeDollarSign,
  BriefcaseBusiness,
  Building2,
  ChartColumn,
  GraduationCap,
  Lightbulb,
  MessageSquareQuote,
  Newspaper,
  Tags,
  Wrench,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ExternalLink,
  FileText,
  Inbox,
  Layers,
  LayoutList,
  Plus,
  SearchX,
  Trash2,
  UserRound,
} from "lucide-react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { DocEditor, DocEditorModal } from "../components/DocEditor";
import { Spinner } from "../components/Spinner";
import { useCrumb } from "../components/Topbar";
import { Empty } from "../components/Empty";
import { Avatar } from "../components/Avatar";
import { toast } from "../components/Toast";
import { SITE_URL, deleteItem, deleteProfile, listItems, listProfiles, reorderItems } from "../portfolio/api";

const KIND_ICONS = {
  services: Wrench,
  "pricing-plans": BadgeDollarSign,
  clients: Building2,
  testimonials: MessageSquareQuote,
  facts: Lightbulb,
  statistics: ChartColumn,
  "resume-entries": GraduationCap,
  works: BriefcaseBusiness,
  "work-categories": Tags,
  "blog-posts": Newspaper,
};

const TABS = [
  { key: "profile", label: "Profile", icon: UserRound },
  { key: "content", label: "Content", icon: LayoutList },
];

/** One profile: its fields and its list items (works, résumé, …). */
export default function PortfolioWorkspace() {
  const { id: rawId } = useParams();
  const id = Number(rawId);
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = TABS.some((t) => t.key === params.get("tab")) ? params.get("tab") : "profile";
  const [summary, setSummary] = useState(null);
  useCrumb(summary?.name);
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
      toast.success(`${summary.name}'s portfolio deleted.`);
      navigate("/portfolio");
    } catch (err) {
      toast.error(err);
    }
  }

  const live = summary?.visibility === "public";

  if (!summary && !error) return <Spinner label="Loading profile…" />;
  if (!summary) {
    return (
      <Empty
        icon={SearchX}
        title="Profile not found"
        action={
          <Link className="ghost" to="/portfolio">
            <ArrowLeft />
            Back to profiles
          </Link>
        }
      >
        {error}
      </Empty>
    );
  }

  return (
    <div className="ui-page">
      <section className="ui-card pw-hero">
        <Avatar src={summary.avatarUrl} name={summary.name} size={64} />
        <div className="pw-hero-text">
          <h1>{summary.name}</h1>
          <p>
            {summary.role ? <span>{summary.role}</span> : null}
            <code>/team/{summary.slug}</code>
          </p>
        </div>
        <div className="pw-hero-meta">
          <span className={`ui-badge ${live ? "is-green" : "is-gray"}`}>{live ? "Public" : "Private"}</span>
          <span className="ui-muted">
            <Layers className="pf-card-meta-icon" /> {summary.items} items
          </span>
        </div>
        <div className="pw-hero-actions">
          {live ? (
            <>
              <a className="ghost" href={`${SITE_URL}/team/${summary.slug}`} target="_blank" rel="noreferrer">
                <ExternalLink />
                View live
              </a>
              <a className="ghost" href={`${SITE_URL}/team/${summary.slug}/cv`} target="_blank" rel="noreferrer">
                <FileText />
                CV
              </a>
            </>
          ) : null}
          <button
            type="button"
            className="danger icon-btn"
            onClick={remove}
            title="Delete profile"
            aria-label="Delete profile"
          >
            <Trash2 />
          </button>
        </div>
      </section>
      {error ? <p className="error">{error}</p> : null}

      <div className="ui-tabs pw-tabs" role="tablist" aria-label="Profile sections">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={t.key === tab}
            className={t.key === tab ? "is-on" : ""}
            onClick={() => setParams({ tab: t.key })}
          >
            <t.icon />
            {t.label}
          </button>
        ))}
      </div>

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
    </div>
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
      toast.success(`Moved “${group.items[index].label}” ${dir < 0 ? "up" : "down"}.`);
    } catch (err) {
      toast.error(err);
      load();
    }
  }

  async function remove(item) {
    if (!window.confirm(`Delete “${item.label}”? This can't be undone.`)) return;
    try {
      await deleteItem(item.id);
      toast.success(`“${item.label}” deleted.`);
      load();
    } catch (err) {
      toast.error(err);
    }
  }

  if (error && !groups) return <p className="error">{error}</p>;
  if (groups?.length === 0) return <Empty icon={LayoutList} title="No content types" />;
  if (!groups) return <Spinner label="Loading content…" />;

  return (
    <div className="pf-content">
      {groups.map((group) => {
        const GroupIcon = KIND_ICONS[group.kind] || LayoutList;
        return (
          <section key={group.kind} className="ui-card pf-group">
            <header className="pf-group-head">
              <h2>
                <span className="pf-group-icon">
                  <GroupIcon />
                </span>
                {group.label} <em>{group.items.length}</em>
              </h2>
              <button
                type="button"
                className="ghost icon-btn"
                title={`Add ${group.singular.toLowerCase()}`}
                aria-label={`Add ${group.singular.toLowerCase()}`}
                onClick={() =>
                  setEditing({
                    target: { kind: "item", itemKind: group.kind, profileId },
                    title: `New ${group.singular.toLowerCase()}`,
                  })
                }
              >
                <Plus />
              </button>
            </header>
            {group.items.length === 0 ? (
              <Empty compact icon={Inbox} title="Empty">
                No {group.label.toLowerCase()} yet. Use + to add one.
              </Empty>
            ) : null}
            <ul className="pf-items">
              {group.items.map((item, i) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="pf-item-hit"
                    title={item.label}
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
                      title="Move up"
                    >
                      <ArrowUp />
                    </button>
                    <button
                      type="button"
                      disabled={i === group.items.length - 1}
                      onClick={() => move(group, i, 1)}
                      aria-label={`Move ${item.label} down`}
                      title="Move down"
                    >
                      <ArrowDown />
                    </button>
                    <button
                      type="button"
                      className="is-danger"
                      onClick={() => remove(item)}
                      aria-label={`Delete ${item.label}`}
                      title="Delete"
                    >
                      <Trash2 />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
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
