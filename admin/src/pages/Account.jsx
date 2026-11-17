import { useEffect, useState } from "react";
import { ImageUp, Loader2, Save } from "lucide-react";
import { useParams } from "react-router-dom";
import { supabase, uploadImage } from "../lib/supabase";
import { useAuth } from "../auth";
import { Spinner } from "../components/Spinner";
import { toast } from "../components/Toast";

export default function Account() {
  const { id } = useParams();
  const { profile, session, refreshProfile } = useAuth();
  const targetId = id || profile?.id;
  const [person, setPerson] = useState(null);
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
    const { error: saveError } = await supabase.from("profiles").update({ full_name: name }).eq("id", targetId);
    setSaving(false);
    if (saveError) {
      toast.error(saveError);
      return;
    }
    setPerson((current) => ({ ...current, full_name: name }));
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

  return (
    <form className="panel account" onSubmit={save}>
      <header className="top">
        <h1>{own ? "My profile" : person.full_name || person.email}</h1>
        <p>{person.role}</p>
      </header>
      {person.avatar_url ? <img className="avatar" src={person.avatar_url} alt="" /> : <span className="ph lg" />}
      <div className="photo-field">
        <span>Photo</span>
        <label className={`ghost file-btn${uploading ? " is-busy" : ""}`}>
          {uploading ? <Loader2 className="spin" /> : <ImageUp />}
          {uploading ? "Uploading…" : person.avatar_url ? "Replace photo" : "Upload photo"}
          <input type="file" accept="image/png,image/jpeg,image/webp" disabled={uploading} onChange={onFile} />
        </label>
      </div>
      <label>
        Name
        <input value={name} onChange={(event) => setName(event.target.value)} />
      </label>
      <label>
        Email
        <input value={person.email} disabled />
      </label>
      <button className="primary" type="submit" disabled={saving || name === (person.full_name || "")}>
        {saving ? <Loader2 className="spin" /> : <Save />}
        {saving ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
