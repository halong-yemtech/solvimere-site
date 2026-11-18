import { useEffect, useMemo, useState } from "react";
import {
  AtSign,
  BriefcaseBusiness,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ImageUp,
  Loader2,
  MousePointerClick,
  Pencil,
  Quote,
  Save,
  Trash2,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { ImageEditor } from "../components/ImageEditor";
import { Spinner } from "../components/Spinner";
import { Empty } from "../components/Empty";
import { toast } from "../components/Toast";
import { PageHead, SearchBox, Stat, matches } from "../components/ui";
import { SITE_URL } from "../portfolio/api";
import { supabase, uploadImage } from "../lib/supabase";
import { portfolioSlug } from "../../../src/lib/slug.js";

const SCALE_MIN = 0.5;
const SCALE_MAX = 2.5;

function clampScale(value) {
  const next = Math.round(Number(value) * 100) / 100;
  if (!Number.isFinite(next)) return 1;
  return Math.min(SCALE_MAX, Math.max(SCALE_MIN, next));
}

const emptyMember = {
  id: null,
  name: "",
  role: "",
  email: "",
  avatar_url: "",
  avatar_scale: 1,
  bio: "",
  highlight_label: "",
  highlight_text: "",
  expertise_label: "",
  expertise_text: "",
  quote: "",
};

function clean(value) {
  return String(value || "").trim();
}

export default function Team() {
  const [members, setMembers] = useState(null);
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [editor, setEditor] = useState(null);
  const [query, setQuery] = useState("");
  const shown = useMemo(() => (members || []).filter((p) => matches(query, p.name, p.role, p.email)), [members, query]);

  function load(selectId) {
    supabase
      .from("team_members")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true })
      .then(({ data, error: queryError }) => {
        if (queryError) {
          setError(queryError.message);
          setMembers((current) => current || []);
          return;
        }
        setError("");
        const rows = data || [];
        setMembers(rows);
        if (selectId) {
          setDraft(rows.find((person) => person.id === selectId) || null);
        }
      });
  }

  useEffect(() => {
    load();
  }, []);

  function update(key, value) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function closeEditor() {
    setEditor((current) => {
      if (current?.revoke) URL.revokeObjectURL(current.src);
      return null;
    });
  }

  async function onFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !draft) return;
    setEditor((current) => {
      if (current?.revoke) URL.revokeObjectURL(current.src);
      return { src: URL.createObjectURL(file), revoke: true };
    });
  }

  async function applyImage(blob) {
    setPending(true);
    try {
      const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
      const avatarUrl = await uploadImage("media", `team/${crypto.randomUUID()}-avatar.jpg`, file);
      setDraft((current) => ({ ...current, avatar_url: avatarUrl, avatar_scale: 1 }));
      toast.success("Photo updated. Save the member to publish it.");
      closeEditor();
    } catch (err) {
      toast.error(err.message || "The photo could not be saved.");
    } finally {
      setPending(false);
    }
  }

  async function save(event) {
    event.preventDefault();
    if (!draft) return;
    const name = clean(draft.name);
    const role = clean(draft.role);
    const email = clean(draft.email).toLowerCase();
    if (!name || !role) {
      toast.error("Name and role are required.");
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Enter a valid email, or leave it blank.");
      return;
    }
    setPending(true);
    const payload = {
      name,
      role,
      email,
      avatar_url: clean(draft.avatar_url),
      avatar_scale: clampScale(draft.avatar_scale),
      bio: clean(draft.bio),
      highlight_label: clean(draft.highlight_label),
      highlight_text: clean(draft.highlight_text),
      expertise_label: clean(draft.expertise_label),
      expertise_text: clean(draft.expertise_text),
      quote: clean(draft.quote),
    };
    const query = draft.id
      ? supabase.from("team_members").update(payload).eq("id", draft.id).select("id").single()
      : supabase
          .from("team_members")
          .insert({ ...payload, sort_order: members?.length || 0 })
          .select("id")
          .single();
    const { data, error: saveError } = await query;
    setPending(false);
    if (saveError) {
      toast.error(saveError);
      return;
    }
    toast.success(draft.id ? `${name} saved.` : `${name} added to the team.`);
    load(data.id);
  }

  async function remove() {
    if (!draft?.id) return;
    if (!window.confirm(`Remove ${draft.name || "this member"} from the team page?`)) return;
    setPending(true);
    const { error: deleteError } = await supabase.from("team_members").delete().eq("id", draft.id);
    setPending(false);
    if (deleteError) {
      toast.error(deleteError);
      return;
    }
    toast.success(`${draft.name || "Member"} removed from the team.`);
    setDraft(null);
    load();
  }

  async function move(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= members.length) return;
    const next = members.slice();
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    setMembers(next);
    const results = await Promise.all(
      next.map((person, order) => supabase.from("team_members").update({ sort_order: order }).eq("id", person.id)),
    );
    const failed = results.find((result) => result.error);
    if (failed) {
      toast.error(failed.error);
      load();
      return;
    }
    toast.success(`Moved ${item.name} ${direction < 0 ? "up" : "down"}.`);
  }

  if (!members) return <Spinner label="Loading team…" />;

  const withPhoto = members.filter((m) => m.avatar_url).length;
  const slug = draft ? portfolioSlug(draft.name) : "";

  return (
    <div className="ui-page">
      <PageHead
        icon={Users}
        title="Team"
        description="The people on the team and home pages. Reorder with the arrows; the order saves at once."
        stats={
          <>
            <Stat icon={Users} value={members.length} label="members" />
            <Stat icon={ImageUp} value={withPhoto} label="with photos" />
          </>
        }
        actions={
          <button className="primary" type="button" onClick={() => setDraft({ ...emptyMember })}>
            <UserPlus />
            Add member
          </button>
        }
      />
      {error ? <p className="error">{error}</p> : null}

      <div className="team-layout">
        <section className="ui-card team-roster" aria-label="Team members">
          <SearchBox value={query} onChange={setQuery} placeholder="Search name, role or email" />
          {members.length === 0 && !error ? (
            <Empty icon={Users} title="No team members yet">
              Add the people who should appear on the site&apos;s team page.
            </Empty>
          ) : null}
          {members.length > 0 && shown.length === 0 ? (
            <Empty compact icon={Users} title="No matches">
              Nobody matches “{query}”.
            </Empty>
          ) : null}
          <ul className="team-rows">
            {shown.map((person) => {
              const index = members.indexOf(person);
              const selected = draft?.id === person.id;
              return (
                <li key={person.id} className={selected ? "is-selected" : ""}>
                  <button type="button" className="team-hit" onClick={() => setDraft(person)}>
                    {person.avatar_url ? (
                      <span className="avatar-frame" style={{ "--avatar-scale": person.avatar_scale || 1 }}>
                        <img src={person.avatar_url} alt="" />
                      </span>
                    ) : (
                      <span className="team-ph">
                        <User />
                      </span>
                    )}
                    <span className="ui-row-main">
                      <strong>{person.name}</strong>
                      <span>{person.role}</span>
                    </span>
                  </button>
                  {!query ? (
                    <span className="team-order">
                      <button
                        type="button"
                        aria-label={`Move ${person.name} up`}
                        disabled={index === 0}
                        onClick={() => move(index, -1)}
                        title="Move up"
                      >
                        <ChevronUp />
                      </button>
                      <button
                        type="button"
                        aria-label={`Move ${person.name} down`}
                        disabled={index === members.length - 1}
                        onClick={() => move(index, 1)}
                        title="Move down"
                      >
                        <ChevronDown />
                      </button>
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>

        {draft ? (
          <form className="ui-card team-editor" onSubmit={save}>
            <div className="ui-card-head">
              <span className="ui-card-icon">{draft.id ? <Pencil /> : <UserPlus />}</span>
              <div>
                <h2>{draft.id ? draft.name || "Edit member" : "New member"}</h2>
                <p>{draft.id ? "Changes show on the site when you save." : "Fill in the details and create."}</p>
              </div>
              {draft.id && slug && SITE_URL ? (
                <a
                  className="ghost icon-btn team-portfolio"
                  href={`${SITE_URL}/team/${slug}`}
                  target="_blank"
                  rel="noreferrer"
                  title="Open portfolio"
                  aria-label="Open portfolio"
                >
                  <ExternalLink />
                </a>
              ) : null}
            </div>

            <fieldset className="team-section">
              <legend>Photo</legend>
              <div className="avatar-row">
                {draft.avatar_url ? (
                  <span className="avatar-frame" style={{ "--avatar-scale": clampScale(draft.avatar_scale) }}>
                    <img src={draft.avatar_url} alt="" />
                  </span>
                ) : (
                  <span className="team-ph is-lg">
                    <User />
                  </span>
                )}
                <div className="avatar-fields">
                  <div className="tool-row">
                    <label className="ghost file-btn">
                      <ImageUp />
                      {draft.avatar_url ? "Replace photo" : "Upload photo"}
                      <input type="file" accept="image/png,image/jpeg,image/webp" onChange={onFile} />
                    </label>
                    {draft.avatar_url ? (
                      <button
                        className="ghost"
                        type="button"
                        onClick={() => setEditor({ src: draft.avatar_url, revoke: false })}
                      >
                        <Pencil />
                        Edit image
                      </button>
                    ) : null}
                  </div>
                  <small>Crop, scale and adjust after choosing a photo.</small>
                </div>
              </div>
            </fieldset>

            <fieldset className="team-section">
              <legend>Basics</legend>
              <div className="form-grid">
                <label className="ui-field">
                  <span>Name</span>
                  <span className="ui-input">
                    <User aria-hidden="true" />
                    <input value={draft.name} onChange={(event) => update("name", event.target.value)} required />
                  </span>
                  {slug ? <small>Portfolio address: /team/{slug}</small> : null}
                </label>
                <label className="ui-field">
                  <span>Role</span>
                  <span className="ui-input">
                    <BriefcaseBusiness aria-hidden="true" />
                    <input value={draft.role} onChange={(event) => update("role", event.target.value)} required />
                  </span>
                </label>
              </div>
              <label className="ui-field">
                <span>Email</span>
                <span className="ui-input">
                  <AtSign aria-hidden="true" />
                  <input
                    type="email"
                    value={draft.email}
                    placeholder="name@solvimere.com"
                    onChange={(event) => update("email", event.target.value)}
                  />
                </span>
              </label>
            </fieldset>

            <fieldset className="team-section">
              <legend>Team page text</legend>
              <label className="field">
                <span>Bio</span>
                <textarea rows="3" value={draft.bio} onChange={(event) => update("bio", event.target.value)} />
              </label>
              <div className="form-grid">
                <label className="field">
                  <span>Highlight label</span>
                  <input
                    value={draft.highlight_label}
                    placeholder="Highlights"
                    onChange={(event) => update("highlight_label", event.target.value)}
                  />
                </label>
                <label className="field">
                  <span>Expertise label</span>
                  <input
                    value={draft.expertise_label}
                    placeholder="Expertise"
                    onChange={(event) => update("expertise_label", event.target.value)}
                  />
                </label>
              </div>
              <label className="field">
                <span>Highlight</span>
                <textarea
                  rows="3"
                  value={draft.highlight_text}
                  onChange={(event) => update("highlight_text", event.target.value)}
                />
              </label>
              <label className="field">
                <span>Expertise</span>
                <textarea
                  rows="3"
                  value={draft.expertise_text}
                  onChange={(event) => update("expertise_text", event.target.value)}
                />
              </label>
              <label className="field">
                <span>
                  <Quote className="team-quote-icon" aria-hidden="true" /> Personal quote
                </span>
                <textarea rows="2" value={draft.quote} onChange={(event) => update("quote", event.target.value)} />
              </label>
            </fieldset>

            <div className="ui-actions">
              {draft.id ? (
                <button className="danger team-delete" type="button" disabled={pending} onClick={remove}>
                  <Trash2 />
                  Delete
                </button>
              ) : null}
              <button className="ghost" type="button" onClick={() => setDraft(null)}>
                <X />
                Close
              </button>
              <button className="primary" type="submit" disabled={pending}>
                {pending ? <Loader2 className="spin" /> : draft.id ? <Save /> : <UserPlus />}
                {pending ? "Saving…" : draft.id ? "Save changes" : "Create member"}
              </button>
            </div>
          </form>
        ) : (
          <section className="ui-card team-editor">
            <Empty icon={MousePointerClick} title="Select a team member">
              Pick someone on the left to edit their photo, role and profile, or add someone new.
            </Empty>
          </section>
        )}
      </div>
      {editor ? <ImageEditor src={editor.src} pending={pending} onCancel={closeEditor} onApply={applyImage} /> : null}
    </div>
  );
}
