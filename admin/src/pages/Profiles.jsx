import { useEffect, useState } from "react";
import { Loader2, Pencil, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { signupClient, supabase } from "../lib/supabase";
import { useAuth } from "../auth";
import { Spinner } from "../components/Spinner";
import { Empty } from "../components/Empty";
import { ShieldCheck } from "lucide-react";
import { toast } from "../components/Toast";

export default function Profiles() {
  const { profile } = useAuth();
  const [people, setPeople] = useState(null);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  function load() {
    supabase
      .from("profiles")
      .select("id, email, full_name, role, avatar_url")
      .order("email")
      .then(({ data, error: queryError }) => {
        setError(queryError ? queryError.message : "");
        setPeople(data || []);
      });
  }

  useEffect(() => {
    load();
  }, []);

  async function changeRole(person, role) {
    const { error: saveError } = await supabase.from("profiles").update({ role }).eq("id", person.id);
    if (saveError) {
      toast.error(saveError);
      return;
    }
    toast.success(`${person.full_name || person.email} is now ${role === "admin" ? "an admin" : "an editor"}.`);
    load();
  }

  async function createUser(event) {
    event.preventDefault();
    const form = event.currentTarget;
    setCreating(true);
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") || "")
      .trim()
      .toLowerCase();
    const password = String(data.get("password"));
    const fullName = String(data.get("full_name") || "");
    const role = String(data.get("role"));
    const { error: inviteError } = await supabase.from("staff_invites").upsert({
      email,
      full_name: fullName,
      role,
      invited_by: profile.id,
    });
    if (inviteError) {
      setCreating(false);
      toast.error(inviteError);
      return;
    }
    const client = signupClient();
    const { data: created, error: signError } = await client.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    setCreating(false);
    if (signError) {
      toast.error(signError);
      return;
    }
    form.reset();
    toast.success(
      created.session
        ? "Account created. They can sign in now."
        : "Account created. Confirm the email before they can sign in.",
    );
    load();
  }

  if (!people) return <Spinner label="Loading staff…" />;

  return (
    <>
      <header className="top">
        <h1>Profiles</h1>
        <p>Staff accounts. Roles live in the database, not in editable user metadata.</p>
      </header>
      {error ? <p className="error">{error}</p> : null}
      {people.length === 0 && !error ? (
        <Empty icon={ShieldCheck} title="No staff accounts">
          Add a person below to give them access to the admin.
        </Empty>
      ) : null}
      <section className="people">
        {people.map((person) => (
          <article key={person.id}>
            {person.avatar_url ? <img src={person.avatar_url} alt="" /> : <span className="ph" />}
            <div>
              <strong>{person.full_name || "Unnamed"}</strong>
              <span>{person.email}</span>
            </div>
            <select
              value={person.role}
              disabled={person.id === profile.id}
              onChange={(event) => changeRole(person, event.target.value)}
            >
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
            </select>
            <Link
              className="ghost icon-btn"
              to={`/profiles/${person.id}`}
              aria-label={`Edit ${person.full_name || person.email}`}
              title="Edit"
            >
              <Pencil />
            </Link>
          </article>
        ))}
      </section>
      <form className="panel inline" onSubmit={createUser}>
        <h2>Add a person</h2>
        <label>
          Name
          <input name="full_name" />
        </label>
        <label>
          Email
          <input name="email" type="email" required />
        </label>
        <label>
          Temporary password
          <input name="password" type="password" minLength={8} required />
        </label>
        <label>
          Role
          <select name="role" defaultValue="editor">
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <button className="primary" type="submit" disabled={creating}>
          {creating ? <Loader2 className="spin" /> : <UserPlus />}
          {creating ? "Creating…" : "Create account"}
        </button>
      </form>
    </>
  );
}
