import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase, uploadImage } from "../lib/supabase";
import { useAuth } from "../auth";

export default function Account() {
  const { id } = useParams();
  const { profile, session, refreshProfile } = useAuth();
  const targetId = id || profile?.id;
  const [person, setPerson] = useState(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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
    setError("");
    setMessage("");
    const { error: saveError } = await supabase.from("profiles").update({ full_name: name }).eq("id", targetId);
    if (saveError) {
      setError(saveError.message);
      return;
    }
    if (targetId === profile.id) await refreshProfile();
    setMessage("Profile saved.");
  }

  async function onFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    try {
      const avatarUrl = await uploadImage("avatars", `${targetId}/avatar`, file);
      const { error: saveError } = await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", targetId);
      if (saveError) throw saveError;
      setPerson((current) => ({ ...current, avatar_url: avatarUrl }));
      if (targetId === profile.id) await refreshProfile();
    } catch (err) {
      setError(err.message);
    }
  }

  if (!person) return <p className="top">{error || "Loading profile…"}</p>;
  const own = person.id === session?.user?.id;

  return (
    <form className="panel account" onSubmit={save}>
      <header className="top">
        <h1>{own ? "My profile" : person.full_name || person.email}</h1>
        <p>{person.role}</p>
      </header>
      {person.avatar_url ? <img className="avatar" src={person.avatar_url} alt="" /> : <span className="ph lg" />}
      <label>
        Photo
        <input type="file" accept="image/png,image/jpeg,image/webp" onChange={onFile} />
      </label>
      <label>
        Name
        <input value={name} onChange={(event) => setName(event.target.value)} />
      </label>
      <label>
        Email
        <input value={person.email} disabled />
      </label>
      {error ? <p className="error">{error}</p> : null}
      {message ? <p className="ok">{message}</p> : null}
      <button className="primary" type="submit">Save profile</button>
    </form>
  );
}
