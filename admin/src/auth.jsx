import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase, supabaseConfigured } from "./lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [ready, setReady] = useState(!supabaseConfigured);

  useEffect(() => {
    if (!supabaseConfigured) return undefined;
    let active = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!active) return;
      const user = data.user;
      if (!user) {
        setReady(true);
        return;
      }
      const { data: row } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (!active) return;
      setSession({ user });
      setProfile(row);
      setReady(true);
    });
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, next) => {
      window.setTimeout(async () => {
        if (!next?.user) {
          setSession(null);
          setProfile(null);
          return;
        }
        const { data: row } = await supabase.from("profiles").select("*").eq("id", next.user.id).single();
        setSession(next);
        setProfile(row);
      }, 0);
    });
    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      session,
      profile,
      ready,
      configured: supabaseConfigured,
      async signIn(email, password) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      },
      async signOut() {
        await supabase.auth.signOut();
      },
      async refreshProfile() {
        if (!session?.user) return;
        const { data: row } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
        setProfile(row);
      },
    }),
    [session, profile, ready],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
