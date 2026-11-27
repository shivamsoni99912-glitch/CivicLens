import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured, supabase } from './supabase';

interface AuthContextValue {
  configured: boolean;
  loading: boolean;
  session: Session | null;
  userId: string | null;
  email: string | null;
  displayName: string;
  avatarUrl: string | null;
  isAdmin: boolean;
  adminChecked: boolean;
  error: string | null;
  signInWithGoogle: (next?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const readMetadata = (session: Session | null) => (session?.user.user_metadata ?? {}) as Record<string, unknown>;

const pickText = (metadata: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = metadata[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminChecked, setAdminChecked] = useState(!isSupabaseConfigured);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const client = supabase;
    if (!client) return;

    let active = true;
    void client.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session ?? null);
      setLoading(false);
    });

    const { data: listener } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const userId = session?.user.id ?? null;

  useEffect(() => {
    const client = supabase;
    if (!client || !userId) {
      setIsAdmin(false);
      setAdminChecked(true);
      return;
    }

    let active = true;
    setAdminChecked(false);
    void client
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data, error: profileError }) => {
        if (!active) return;
        if (profileError) console.warn('Could not read the profile row:', profileError.message);
        setIsAdmin(Boolean(data?.is_admin));
        setAdminChecked(true);
      });

    return () => {
      active = false;
    };
  }, [userId]);

  const metadata = useMemo(() => readMetadata(session), [session]);

  const displayName = useMemo(() => {
    const fromProvider = pickText(metadata, ['full_name', 'name', 'preferred_username']);
    if (fromProvider) return fromProvider;
    const local = session?.user.email?.split('@')[0];
    return local ?? '';
  }, [metadata, session]);

  const avatarUrl = useMemo(() => pickText(metadata, ['avatar_url', 'picture']), [metadata]);

  const signInWithGoogle = useCallback(async (next = '/report') => {
    setError(null);
    try {
      const client = getSupabase();
      const target = next.startsWith('/') ? next : '/report';
      const { error: oauthError } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${target}`,
          queryParams: { prompt: 'select_account' }
        }
      });
      if (oauthError) throw oauthError;
    } catch (oauthError) {
      const message = oauthError instanceof Error ? oauthError.message : 'Google sign-in could not start.';
      setError(message);
      throw oauthError;
    }
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    try {
      await getSupabase().auth.signOut();
    } catch (signOutError) {
      setError(signOutError instanceof Error ? signOutError.message : 'Sign out failed.');
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      configured: isSupabaseConfigured,
      loading,
      session,
      userId,
      email: session?.user.email ?? null,
      displayName,
      avatarUrl,
      isAdmin,
      adminChecked,
      error,
      signInWithGoogle,
      signOut
    }),
    [loading, session, userId, displayName, avatarUrl, isAdmin, adminChecked, error, signInWithGoogle, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
