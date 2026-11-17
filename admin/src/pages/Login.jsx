import { useState } from "react";
import { Loader2, LogIn } from "lucide-react";
import { useAuth } from "../auth";
import { toast } from "../components/Toast";

export default function Login() {
  const { signIn, configured } = useAuth();
  const [pending, setPending] = useState(false);

  if (!configured) {
    return (
      <main className="gate">
        <form className="panel">
          <p className="eyebrow">Solvimere admin</p>
          <h1>Connect Supabase</h1>
          <p>
            Copy <code>admin/.env.example</code> to <code>admin/.env</code> and add the project URL and publishable key.
            Use the same values in the public site <code>.env</code> so published pages show on the marketing site.
          </p>
        </form>
      </main>
    );
  }

  async function onSubmit(event) {
    event.preventDefault();
    setPending(true);
    const data = new FormData(event.currentTarget);
    try {
      await signIn(String(data.get("email")), String(data.get("password")));
      toast.success("Signed in. Welcome back.");
    } catch (err) {
      toast.error(err.message || "Sign-in failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="gate">
      <form className="panel" onSubmit={onSubmit}>
        <img className="gate-logo" src="/images/logo-white.png" alt="Solvimere" />
        <p className="eyebrow">Admin</p>
        <h1>Sign in</h1>
        <p>Use your staff account to manage the Solvimere site.</p>
        <label>
          Email
          <input name="email" type="email" autoComplete="username" required />
        </label>
        <label>
          Password
          <input name="password" type="password" autoComplete="current-password" required />
        </label>
        <button className="primary" type="submit" disabled={pending}>
          {pending ? <Loader2 className="spin" /> : <LogIn />}
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
