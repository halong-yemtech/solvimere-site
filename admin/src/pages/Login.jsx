import { useState } from "react";
import { Eye, EyeOff, FileText, IdCard, KeyRound, Loader2, LogIn, Mail, Users } from "lucide-react";
import { useAuth } from "../auth";
import { toast } from "../components/Toast";

export default function Login() {
  const { signIn, configured } = useAuth();
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!configured) {
    return (
      <main className="login">
        <section className="login-card is-single">
          <img className="login-logo" src="/images/logo-white.png" alt="Solvimere" />
          <h1>Connect Supabase</h1>
          <p>
            Copy <code>admin/.env.example</code> to <code>admin/.env</code> and add the project URL and publishable key.
            Use the same values in the public site <code>.env</code> so published pages show on the marketing site.
          </p>
        </section>
      </main>
    );
  }

  async function onSubmit(event) {
    event.preventDefault();
    setPending(true);
    const data = new FormData(event.currentTarget);
    try {
      await signIn(String(data.get("email")).trim(), String(data.get("password")));
      toast.success("Signed in. Welcome back.");
    } catch (err) {
      toast.error(err.message || "Sign-in failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="login">
      <section className="login-card">
        <div className="login-brand">
          <img className="login-logo" src="/images/logo-white.png" alt="Solvimere" />
          <div>
            <h2>Admin</h2>
            <p>Manage the Solvimere website, the team and every portfolio in one place.</p>
          </div>
          <ul>
            <li>
              <FileText /> Edit and publish site pages
            </li>
            <li>
              <Users /> Keep the team up to date
            </li>
            <li>
              <IdCard /> Build members&apos; portfolios
            </li>
          </ul>
        </div>

        <form className="login-form" onSubmit={onSubmit}>
          <div>
            <h1>Sign in</h1>
            <p>Use your staff account.</p>
          </div>
          <label className="ui-field">
            <span>Email</span>
            <span className="ui-input">
              <Mail aria-hidden="true" />
              <input
                name="email"
                type="email"
                autoComplete="username"
                placeholder="you@solvimere.com"
                required
                autoFocus
              />
            </span>
          </label>
          <label className="ui-field">
            <span>Password</span>
            <span className="ui-input">
              <KeyRound aria-hidden="true" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="login-eye"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </span>
          </label>
          <button className="primary login-submit" type="submit" disabled={pending}>
            {pending ? <Loader2 className="spin" /> : <LogIn />}
            {pending ? "Signing in…" : "Sign in"}
          </button>
          <p className="login-help">Forgot your password? Ask an admin to reset it from Staff.</p>
        </form>
      </section>
    </main>
  );
}
