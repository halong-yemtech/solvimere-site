import { useEffect, useState } from "react";
import { Camera, Fingerprint, Loader2, Lock, Mail, PenLine, Save, ShieldCheck, Undo2, User } from "lucide-react";
import { useParams } from "react-router-dom";
import { supabase, uploadImage } from "../lib/supabase";
import { useAuth } from "../auth";
import { Avatar } from "../components/Avatar";
import { Spinner } from "../components/Spinner";
import { useCrumb } from "../components/Topbar";
import { toast } from "../components/Toast";

/** "My profile" (/account) and, for admins, any staff member's profile (/profiles/:id). */
export default function Account() {
  const { id } = useParams();
  const { profile, session, refreshProfile } = useAuth();
  const targetId = id || profile?.id;
  const [person, setPerson] = useState(null);
  // On /profiles/:id the breadcrumb ends with the person being edited.
  useCrumb(id ? person?.full_name || person?.email : null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!targetId) return undefined;
    supabase
      .from("profiles")
      .select("id, email, full_name, role, avatar_url")
      .eq("id", targetId)
      .single()
      .then(({ data, error: queryError }) => {
        if (queryError) setError(queryError.message);
        setPerson(data);
        setName(data?.full_name || "");
      });
    return undefined;
  }, [targetId]);

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    const { error: saveError } = await supabase.from("profiles").update({ full_name: name.trim() }).eq("id", targetId);
    setSaving(false);
    if (saveError) {
      toast.error(saveError);
      return;
    }
    setPerson((current) => ({ ...current, full_name: name.trim() }));
    if (targetId === profile.id) await refreshProfile();
    toast.success("Profile saved.");
  }

  async function onFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const avatarUrl = await uploadImage("avatars", `${targetId}/avatar`, file);
      const { error: saveError } = await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", targetId);
      if (saveError) throw saveError;
      setPerson((current) => ({ ...current, avatar_url: avatarUrl }));
      if (targetId === profile.id) await refreshProfile();
      toast.success("Photo updated.");
    } catch (err) {
      toast.error(err);
    } finally {
      setUploading(false);
    }
  }

  if (!person) return error ? <p className="top error">{error}</p> : <Spinner label="Loading profile…" />;
  const own = person.id === session?.user?.id;
  const displayName = person.full_name || person.email;
  const dirty = name.trim() !== (person.full_name || "");
  const RoleIcon = person.role === "admin" ? ShieldCheck : PenLine;
  const roleBadge = (
    <span className={`ui-role is-${person.role}`}>
      <RoleIcon />
      {person.role === "admin" ? "Admin" : "Editor"}
    </span>
  );

  return (
    <div className="acct">
      <section className="ui-card ui-hero">
        <div className="ui-cover" aria-hidden="true" />
        <div className="ui-hero-body">
          <div className="ui-photo">
            <Avatar src={person.avatar_url} name={displayName} size={96} />
            <label className={`ui-photo-btn${uploading ? " is-busy" : ""}`} title="Change photo">
              {uploading ? <Loader2 className="spin" /> : <Camera />}
              <span className="sr-only">{person.avatar_url ? "Replace photo" : "Upload photo"}</span>
              <input type="file" accept="image/png,image/jpeg,image/webp" disabled={uploading} onChange={onFile} />
            </label>
          </div>
          <div className="ui-hero-text">
            <h1>
              {displayName}
              {own ? <em className="ui-chip">You</em> : null}
            </h1>
            <p>
              <Mail aria-hidden="true" />
              {person.email}
            </p>
          </div>
          {roleBadge}
        </div>
      </section>

      <div className="ui-grid">
        <form className="ui-card" onSubmit={save}>
          <div className="ui-card-head">
            <span className="ui-card-icon">
              <User />
            </span>
            <div>
              <h2>Personal details</h2>
              <p>{own ? "How your name appears in the admin." : "How this person's name appears in the admin."}</p>
            </div>
          </div>
          <label className="ui-field">
            <span>Full name</span>
            <span className="ui-input">
              <User aria-hidden="true" />
              <input value={name} placeholder="Full name" onChange={(event) => setName(event.target.value)} />
            </span>
          </label>
          <label className="ui-field">
            <span>Email</span>
            <span className="ui-input is-locked">
              <Mail aria-hidden="true" />
              <input value={person.email} disabled />
              <Lock className="ui-lock" aria-hidden="true" />
            </span>
            <small>The sign-in email can&apos;t be changed here.</small>
          </label>
          <div className="ui-actions">
            {dirty ? (
              <button type="button" className="ghost" onClick={() => setName(person.full_name || "")}>
                <Undo2 />
                Undo
              </button>
            ) : null}
            <button className="primary" type="submit" disabled={saving || !dirty || !name.trim()}>
              {saving ? <Loader2 className="spin" /> : <Save />}
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>

        <section className="ui-card">
          <div className="ui-card-head">
            <span className="ui-card-icon">
              <ShieldCheck />
            </span>
            <div>
              <h2>Access</h2>
              <p>What this account can do in the admin.</p>
            </div>
          </div>
          <dl className="ui-facts">
            <div>
              <dt>Role</dt>
              <dd>{roleBadge}</dd>
            </div>
            <div>
              <dt>Can manage</dt>
              <dd>
                {person.role === "admin"
                  ? "Pages, team, messages, appointments, portfolios and staff"
                  : "Pages, team, messages, appointments and portfolios"}
              </dd>
            </div>
            <div>
              <dt>
                <Fingerprint aria-hidden="true" />
                Account ID
              </dt>
              <dd>
                <code>{person.id}</code>
              </dd>
            </div>
          </dl>
          {own ? <p className="ui-note">Only another admin can change your role, from Staff.</p> : null}
        </section>
      </div>
    </div>
  );
}
