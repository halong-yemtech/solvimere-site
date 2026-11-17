import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { signupClient, supabase } from "../lib/supabase";
import { useAuth } from "../auth";

export default function Profiles() {
  const { profile } = useAuth();
  const [people, setPeople] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function load() {
    supabase
      .from("profiles")
      .select("id, email, full_name, role, avatar_url")
      .order("email")
      .then(({ data, error: queryError }) => {
        if (queryError) setError(queryError.message);
        setPeople(data || []);
      });
  }

  useEffect(() => {
    load();
  }, []);

  async function changeRole(id, role) {
    setError("");
    const { error: saveError } = await supabase.from("profiles").update({ role }).eq("id", id);
    if (saveError) {
      setError(saveError.message);
      return;
    }
    load();
  }

  async function createUser(event) {
    event.preventDefault();
    setError("");
    setMessage("");
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
      setError(inviteError.message);
      return;
    }
    const client = signupClient();
    const { data: created, error: signError } = await client.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (signError) {
      setError(signError.message);
      return;
    }
    event.currentTarget.reset();
    setMessage(
      created.session
        ? "Account created. They can sign in now."
        : "Account created. Confirm the email before they can sign in.",
    );
    load();
  }

  return (
    <>
      <header className="top">
        <h1>Profiles</h1>
        <p>Staff accounts. Roles live in the database, not in editable user metadata.</p>
      </header>
      {error ? <p className="error">{error}</p> : null}
      {message ? <p className="ok">{message}</p> : null}
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
              onChange={(event) => changeRole(person.id, event.target.value)}
            >
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
            </select>
            <Link to={`/profiles/${person.id}`}>Edit</Link>
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
        <button className="primary" type="submit">
          Create account
        </button>
      </form>
    </>
  );
}
