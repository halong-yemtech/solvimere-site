import { Link, useSearchParams } from "react-router-dom";
import { useSiteAuth } from "../auth/SiteAuth";

export default function Account() {
  const { ready, user, signOut } = useSiteAuth();
  const [params] = useSearchParams();
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const authError = params.get("error_description") || params.get("error") || hash.get("error_description") || hash.get("error");
  if (!ready) return <main className="auth-page"><p>Loading…</p></main>;
  if (!user) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <h1>Account</h1>
          <p className="auth-lede">Sign in to see this page.</p>
          {authError ? <p className="auth-error">{authError}</p> : null}
          <Link className="btn auth-submit" to="/login"><span>Sign in</span></Link>
        </section>
      </main>
    );
  }
  const name = user.user_metadata?.full_name || user.email;
  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="eyebrow"><span>+</span> Account</p>
        <h1>{name}</h1>
        <p className="auth-lede">{user.email}</p>
        <button className="btn auth-submit" type="button" onClick={signOut}><span>Sign out</span></button>
      </section>
    </main>
  );
}
