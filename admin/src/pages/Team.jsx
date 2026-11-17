import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, ImageUp, Loader2, Pencil, Save, Trash2, UserPlus, X } from "lucide-react";
import { ImageEditor } from "../components/ImageEditor";
import { Spinner } from "../components/Spinner";
import { Empty } from "../components/Empty";
import { Users } from "lucide-react";
import { toast } from "../components/Toast";
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

  return (
    <>
      <header className="top row">
        <div>
          <p className="eyebrow">Public site</p>
          <h1>Team</h1>
          <p>Add, edit, and reorder the people shown on the team page.</p>
        </div>
        <button
          className="primary"
          type="button"
          onClick={() => {
            setDraft({ ...emptyMember });
          }}
        >
          <UserPlus />
          Add member
        </button>
      </header>
      {error ? <p className="error">{error}</p> : null}
      <div className="split">
        <section className="roster">
          {members.length === 0 && !error ? (
            <Empty icon={Users} title="No team members yet">
              Add the people who should appear on the site&apos;s team page.
            </Empty>
          ) : null}
          {members.map((person, index) => (
            <article key={person.id} className={draft?.id === person.id ? "is-selected" : ""}>
              <button
                type="button"
                className="roster-hit"
                onClick={() => {
                  setDraft(person);
                }}
              >
                {person.avatar_url ? (
                  <span className="avatar-frame" style={{ "--avatar-scale": person.avatar_scale || 1 }}>
                    <img src={person.avatar_url} alt="" />
                  </span>
                ) : (
                  <span className="ph" />
                )}
                <span>
                  <strong>{person.name}</strong>
                  <span>{person.role}</span>
                  <span>{person.email || "No email"}</span>
                </span>
              </button>
              <div className="reorder">
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
              </div>
            </article>
          ))}
        </section>
        {draft ? (
          <form className="panel editor" onSubmit={save}>
            <h2>{draft.id ? "Edit member" : "New member"}</h2>
            <div className="avatar-row">
              {draft.avatar_url ? (
                <span className="avatar-frame" style={{ "--avatar-scale": clampScale(draft.avatar_scale) }}>
                  <img src={draft.avatar_url} alt="" />
                </span>
              ) : (
                <span className="ph lg" />
              )}
              <div className="avatar-fields">
                <span className="field-label">Avatar</span>
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
                <small>Choose a photo to crop, scale, and adjust it.</small>
              </div>
            </div>
            <label className="field">
              <span>Name</span>
              <input value={draft.name} onChange={(event) => update("name", event.target.value)} required />
              {portfolioSlug(draft.name) ? (
                <small>
                  Portfolio: /team/{portfolioSlug(draft.name)} (the portfolio app&apos;s profile slug must be &ldquo;
                  {portfolioSlug(draft.name)}&rdquo;)
                </small>
              ) : null}
            </label>
            <label className="field">
              <span>Role</span>
              <input value={draft.role} onChange={(event) => update("role", event.target.value)} required />
            </label>
            <label className="field">
              <span>Email</span>
              <input
                type="email"
                value={draft.email}
                placeholder="name@solvimere.com"
                onChange={(event) => update("email", event.target.value)}
              />
            </label>
            <label className="field">
              <span>Bio</span>
              <textarea rows="3" value={draft.bio} onChange={(event) => update("bio", event.target.value)} />
            </label>
            <div className="form-grid">
              <label className="field">
                <span>Highlight label</span>
                <input
                  value={draft.highlight_label}
                  onChange={(event) => update("highlight_label", event.target.value)}
                />
              </label>
              <label className="field">
                <span>Expertise label</span>
                <input
                  value={draft.expertise_label}
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
              <span>Personal quote</span>
              <textarea rows="3" value={draft.quote} onChange={(event) => update("quote", event.target.value)} />
            </label>
            <div className="actions">
              <button className="primary" type="submit" disabled={pending}>
                {pending ? <Loader2 className="spin" /> : draft.id ? <Save /> : <UserPlus />}
                {pending ? "Saving…" : draft.id ? "Save changes" : "Create member"}
              </button>
              {draft.id ? (
                <button className="danger" type="button" disabled={pending} onClick={remove}>
                  <Trash2 />
                  Delete
                </button>
              ) : (
                <button className="ghost" type="button" onClick={() => setDraft(null)}>
                  <X />
                  Cancel
                </button>
              )}
            </div>
          </form>
        ) : (
          <section className="panel editor empty-editor">
            <h2>Member details</h2>
            <p>Select a person to edit their avatar, email, role, and profile, or add someone new.</p>
          </section>
        )}
      </div>
      {editor ? <ImageEditor src={editor.src} pending={pending} onCancel={closeEditor} onApply={applyImage} /> : null}
    </>
  );
}
