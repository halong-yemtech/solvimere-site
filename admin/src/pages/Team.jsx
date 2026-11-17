import { useEffect, useState } from "react";
import { ImageEditor } from "../components/ImageEditor";
import { supabase, uploadImage } from "../lib/supabase";

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

/** Same rule as the site's team cards and the portfolio app: "Ha Long" → "halong". */
function portfolioSlug(name) {
  return String(name || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 60);
}

export default function Team() {
  const [members, setMembers] = useState([]);
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
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
          return;
        }
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
    setMessage("");
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
    setError("");
    setEditor((current) => {
      if (current?.revoke) URL.revokeObjectURL(current.src);
      return { src: URL.createObjectURL(file), revoke: true };
    });
  }

  async function applyImage(blob) {
    setError("");
    setPending(true);
    try {
      const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
      const avatarUrl = await uploadImage("media", `team/${crypto.randomUUID()}-avatar.jpg`, file);
      setDraft((current) => ({ ...current, avatar_url: avatarUrl, avatar_scale: 1 }));
      setMessage("Photo updated. Save the member to publish it.");
      closeEditor();
    } catch (err) {
      setError(err.message || "The photo could not be saved.");
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
      setError("Name and role are required.");
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email, or leave it blank.");
      return;
    }
    setError("");
    setMessage("");
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
          .insert({ ...payload, sort_order: members.length })
          .select("id")
          .single();
    const { data, error: saveError } = await query;
    setPending(false);
    if (saveError) {
      setError(saveError.message);
      return;
    }
    setMessage(draft.id ? "Member saved." : "Member added.");
    load(data.id);
  }

  async function remove() {
    if (!draft?.id) return;
    if (!window.confirm(`Remove ${draft.name || "this member"} from the team page?`)) return;
    setError("");
    setMessage("");
    setPending(true);
    const { error: deleteError } = await supabase.from("team_members").delete().eq("id", draft.id);
    setPending(false);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setDraft(null);
    setMessage("Member removed.");
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
    if (failed) setError(failed.error.message);
  }

  return (
    <>
      <header className="top row">
        <div>
          <p className="eyebrow">Public site</p>
          <h1>Team</h1>
          <p>Add, edit, and reorder the people shown on the team page.</p>
        </div>
        <button className="primary" type="button" onClick={() => { setDraft({ ...emptyMember }); setMessage(""); setError(""); }}>
          Add member
        </button>
      </header>
      {error ? <p className="error">{error}</p> : null}
      {message ? <p className="ok">{message}</p> : null}
      <div className="split">
        <section className="roster">
          {members.length === 0 ? <p className="empty">No team members yet.</p> : null}
          {members.map((person, index) => (
            <article key={person.id} className={draft?.id === person.id ? "is-selected" : ""}>
              <button type="button" className="roster-hit" onClick={() => { setDraft(person); setMessage(""); setError(""); }}>
                {person.avatar_url ? (
                  <span className="avatar-frame" style={{ "--avatar-scale": person.avatar_scale || 1 }}>
                    <img src={person.avatar_url} alt="" />
                  </span>
                ) : <span className="ph" />}
                <span>
                  <strong>{person.name}</strong>
                  <span>{person.role}</span>
                  <span>{person.email || "No email"}</span>
                </span>
              </button>
              <div className="reorder">
                <button type="button" aria-label={`Move ${person.name} up`} disabled={index === 0} onClick={() => move(index, -1)}>
                  Up
                </button>
                <button type="button" aria-label={`Move ${person.name} down`} disabled={index === members.length - 1} onClick={() => move(index, 1)}>
                  Down
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
              ) : <span className="ph lg" />}
              <div className="avatar-fields">
                <label className="field">
                  <span>Avatar</span>
                  <input type="file" accept="image/png,image/jpeg,image/webp" onChange={onFile} />
                </label>
                {draft.avatar_url ? (
                  <button className="ghost" type="button" onClick={() => setEditor({ src: draft.avatar_url, revoke: false })}>
                    Edit image
                  </button>
                ) : (
                  <small>Choose a photo to crop, scale, and adjust it.</small>
                )}
              </div>
            </div>
            <label className="field">
              <span>Name</span>
              <input value={draft.name} onChange={(event) => update("name", event.target.value)} required />
              {portfolioSlug(draft.name) ? (
                <small>
                  Portfolio: /team/{portfolioSlug(draft.name)} (the portfolio app&apos;s profile slug must be{" "}
                  &ldquo;{portfolioSlug(draft.name)}&rdquo;)
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
                <input value={draft.highlight_label} onChange={(event) => update("highlight_label", event.target.value)} />
              </label>
              <label className="field">
                <span>Expertise label</span>
                <input value={draft.expertise_label} onChange={(event) => update("expertise_label", event.target.value)} />
              </label>
            </div>
            <label className="field">
              <span>Highlight</span>
              <textarea rows="3" value={draft.highlight_text} onChange={(event) => update("highlight_text", event.target.value)} />
            </label>
            <label className="field">
              <span>Expertise</span>
              <textarea rows="3" value={draft.expertise_text} onChange={(event) => update("expertise_text", event.target.value)} />
            </label>
            <label className="field">
              <span>Personal quote</span>
              <textarea rows="3" value={draft.quote} onChange={(event) => update("quote", event.target.value)} />
            </label>
            <div className="actions">
              <button className="primary" type="submit" disabled={pending}>
                {pending ? "Saving…" : draft.id ? "Save changes" : "Create member"}
              </button>
              {draft.id ? (
                <button className="danger" type="button" disabled={pending} onClick={remove}>
                  Delete
                </button>
              ) : (
                <button className="ghost" type="button" onClick={() => setDraft(null)}>
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
      {editor ? (
        <ImageEditor
          src={editor.src}
          pending={pending}
          onCancel={closeEditor}
          onApply={applyImage}
        />
      ) : null}
    </>
  );
}
