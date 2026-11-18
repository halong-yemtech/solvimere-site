import { useEffect, useMemo, useState } from "react";
import { KeyRound, Loader2, Mail, PenLine, Pencil, Search, ShieldCheck, User, UserPlus, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { signupClient, supabase } from "../lib/supabase";
import { useAuth } from "../auth";
import { Avatar } from "../components/Avatar";
import { Empty } from "../components/Empty";
import { Spinner } from "../components/Spinner";
import { toast } from "../components/Toast";

const ROLES = [
  { value: "admin", label: "Admin", icon: ShieldCheck, hint: "Everything, including staff" },
  { value: "editor", label: "Editor", icon: PenLine, hint: "Content, team and portfolios" },
];

/** Staff accounts: who can sign in to the admin, and their role. Admins only. */
export default function Profiles() {
  const { profile } = useAuth();
  const [people, setPeople] = useState(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [newRole, setNewRole] = useState("editor");
  const [savingRole, setSavingRole] = useState(null);

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

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!people || !q) return people || [];
    return people.filter((p) => `${p.full_name || ""} ${p.email}`.toLowerCase().includes(q));
  }, [people, query]);

  async function changeRole(person, role) {
    if (person.role === role) return;
    setSavingRole(person.id);
    const { error: saveError } = await supabase.from("profiles").update({ role }).eq("id", person.id);
    setSavingRole(null);
    if (saveError) {
      toast.error(saveError);
      return;
    }
    setPeople((all) => all.map((p) => (p.id === person.id ? { ...p, role } : p)));
    toast.success(`${person.full_name || person.email} is now ${role === "admin" ? "an admin" : "an editor"}.`);
  }

  async function createUser(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const email = String(data.get("email") || "")
      .trim()
      .toLowerCase();
    const password = String(data.get("password"));
    const fullName = String(data.get("full_name") || "").trim();
    setCreating(true);
    const { error: inviteError } = await supabase.from("staff_invites").upsert({
      email,
      full_name: fullName,
      role: newRole,
      invited_by: profile.id,
    });
    if (inviteError) {
      setCreating(false);
      toast.error(inviteError);
      return;
    }
    const { data: created, error: signError } = await signupClient().auth.signUp({
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
    setNewRole("editor");
    toast.success(
      created.session
        ? "Account created. They can sign in now."
        : "Account created. Confirm the email before they can sign in.",
    );
    load();
  }

  if (!people) return <Spinner label="Loading staff…" />;

  const admins = people.filter((p) => p.role === "admin").length;

  return (
    <div className="staff">
      <header className="ui-head">
        <div>
          <h1>Staff</h1>
          <p>People who can sign in to this admin. Roles are stored in the database and checked on every request.</p>
        </div>
        <div className="ui-stats">
          <span>
            <Users />
            <b>{people.length}</b> total
          </span>
          <span>
            <ShieldCheck />
            <b>{admins}</b> admin{admins === 1 ? "" : "s"}
          </span>
          <span>
            <PenLine />
            <b>{people.length - admins}</b> editor{people.length - admins === 1 ? "" : "s"}
          </span>
        </div>
      </header>
      {error ? <p className="error">{error}</p> : null}

      <div className="staff-layout">
        <section className="ui-card staff-list" aria-label="Staff accounts">
          <div className="staff-toolbar">
            <label className="ui-search">
              <Search aria-hidden="true" />
              <input
                type="search"
                placeholder="Search by name or email"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search staff"
              />
            </label>
          </div>
          {people.length === 0 && !error ? (
            <Empty icon={ShieldCheck} title="No staff accounts">
              Add a person to give them access to the admin.
            </Empty>
          ) : null}
          {people.length > 0 && shown.length === 0 ? (
            <Empty compact icon={Search} title="No matches">
              Nobody matches “{query}”.
            </Empty>
          ) : null}
          <ul className="staff-rows">
            {shown.map((person) => {
              const self = person.id === profile.id;
              const name = person.full_name || person.email;
              return (
                <li key={person.id}>
                  <Avatar src={person.avatar_url} name={name} size={32} />
                  <div className="staff-who">
                    <strong>
                      {person.full_name || "Unnamed"}
                      {self ? <em className="ui-chip">You</em> : null}
                    </strong>
                    <span>{person.email}</span>
                  </div>
                  <div
                    className="ui-segment"
                    role="radiogroup"
                    aria-label={`Role for ${name}`}
                    title={self ? "You can't change your own role" : undefined}
                  >
                    {ROLES.map((role) => {
                      const Icon = role.icon;
                      const on = person.role === role.value;
                      return (
                        <button
                          key={role.value}
                          type="button"
                          role="radio"
                          aria-checked={on}
                          className={on ? "is-on" : ""}
                          disabled={self || savingRole === person.id}
                          onClick={() => changeRole(person, role.value)}
                        >
                          <Icon />
                          {role.label}
                        </button>
                      );
                    })}
                  </div>
                  <Link
                    className="ghost icon-btn"
                    to={`/profiles/${person.id}`}
                    aria-label={`Edit ${name}`}
                    title="Edit profile"
                  >
                    <Pencil />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <form className="ui-card staff-add" onSubmit={createUser}>
          <div className="ui-card-head">
            <span className="ui-card-icon">
              <UserPlus />
            </span>
            <div>
              <h2>Add a person</h2>
              <p>They sign in with this email and the temporary password.</p>
            </div>
          </div>
          <label className="ui-field">
            <span>Name</span>
            <span className="ui-input">
              <User aria-hidden="true" />
              <input name="full_name" placeholder="Full name" autoComplete="off" />
            </span>
          </label>
          <label className="ui-field">
            <span>Email</span>
            <span className="ui-input">
              <Mail aria-hidden="true" />
              <input name="email" type="email" required placeholder="name@solvimere.com" autoComplete="off" />
            </span>
          </label>
          <label className="ui-field">
            <span>Temporary password</span>
            <span className="ui-input">
              <KeyRound aria-hidden="true" />
              <input
                name="password"
                type="password"
                minLength={8}
                required
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />
            </span>
          </label>
          <fieldset className="ui-field">
            <legend>Role</legend>
            <div className="role-cards">
              {ROLES.map((role) => {
                const Icon = role.icon;
                return (
                  <label key={role.value} className={newRole === role.value ? "is-on" : ""}>
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={newRole === role.value}
                      onChange={() => setNewRole(role.value)}
                    />
                    <Icon />
                    <strong>{role.label}</strong>
                    <small>{role.hint}</small>
                  </label>
                );
              })}
            </div>
          </fieldset>
          <button className="primary ui-submit" type="submit" disabled={creating}>
            {creating ? <Loader2 className="spin" /> : <UserPlus />}
            {creating ? "Creating…" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
