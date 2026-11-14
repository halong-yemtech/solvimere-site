import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useSiteAuth } from "../auth/SiteAuth";
import { authProviderEnabled } from "../lib/supabase";

function GoogleMark() {
  return (
    <svg viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.6 9.2c0-.6-.1-1.2-.2-1.8H9v3.4h4.8a4.1 4.1 0 0 1-1.8 2.7v2.2h2.9c1.7-1.6 2.7-3.9 2.7-6.5Z" />
      <path fill="#34A853" d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.2c-.8.6-1.9.9-3.1.9-2.4 0-4.4-1.6-5.1-3.8H.9v2.3A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.9 10.7A5.4 5.4 0 0 1 3.6 9c0-.6.1-1.2.3-1.7V5H.9A9 9 0 0 0 0 9c0 1.4.3 2.8.9 4l3-2.3Z" />
      <path fill="#EA4335" d="M9 3.6c1.3 0 2.5.5 3.4 1.3l2.6-2.6A9 9 0 0 0 .9 5l3 2.3C4.6 5.2 6.6 3.6 9 3.6Z" />
    </svg>
  );
}

export default function Auth({ mode = "login" }) {
  const { configured, user, signIn, signUp, signInWithGoogle } = useSiteAuth();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);
  const [google, setGoogle] = useState(false);
  const register = mode === "register";

  useEffect(() => {
    let active = true;
    authProviderEnabled("google")
      .then((enabled) => active && setGoogle(enabled))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  if (user) return <Navigate to="/account" replace />;

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setPending(true);
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") || "").trim();
    const password = String(data.get("password") || "");
    try {
      if (register) {
        const result = await signUp(email, password, String(data.get("full_name") || "").trim());
        if (!result.session) setNotice("Account created. Confirm the email, then sign in.");
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  async function onGoogle() {
    setError("");
    setPending(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message || "Google sign-in is unavailable.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={onSubmit}>
        <p className="eyebrow"><span>+</span> Account</p>
        <h1>{register ? "Create an account" : "Sign in"}</h1>
        <p className="auth-lede">
          {register
            ? "Register to keep your Solvimere chat with you."
            : google ? "Sign in with email or Google." : "Sign in with your email and password."}
        </p>
        {!configured ? <p className="auth-error">Supabase is not connected, so accounts cannot be created yet.</p> : null}
        {google ? (
          <>
            <button className="google-btn" type="button" onClick={onGoogle} disabled={!configured || pending}>
              <GoogleMark />
              Continue with Google
            </button>
            <p className="auth-or">or</p>
          </>
        ) : null}
        {register ? (
          <label>
            Name
            <input name="full_name" autoComplete="name" />
          </label>
        ) : null}
        <label>
          Email
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          Password
          <input name="password" type="password" autoComplete={register ? "new-password" : "current-password"} minLength={8} required />
        </label>
        {error ? <p className="auth-error">{error}</p> : null}
        {notice ? <p className="auth-notice">{notice}</p> : null}
        <button className="btn auth-submit" type="submit" disabled={!configured || pending}>
          <span>{pending ? "Please wait…" : register ? "Create account" : "Sign in"}</span>
        </button>
        <p className="auth-switch">
          {register ? (
            <>Already have an account? <Link to="/login">Sign in</Link></>
          ) : (
            <>New here? <Link to="/register">Create an account</Link></>
          )}
        </p>
      </form>
    </main>
  );
}
