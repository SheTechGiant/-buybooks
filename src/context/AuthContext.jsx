import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({ user: null, isAdmin: false, loading: false });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(Boolean(supabase));

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      if (!data.session) setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Admin status is decided by the database (admins table), never by the browser.
  useEffect(() => {
    if (!supabase) return;
    if (!user) {
      setIsAdmin(false);
      return;
    }
    let alive = true;
    supabase.rpc('is_admin').then(({ data }) => {
      if (!alive) return;
      setIsAdmin(data === true);
      setLoading(false);
    });
    return () => { alive = false; };
  }, [user?.id]);

  return <AuthContext.Provider value={{ user, isAdmin, loading }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
