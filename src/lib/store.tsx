import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './auth';
import { getSupabase } from './supabase';
import type { Complaint, ComplaintStatus, NewComplaint } from './types';

/*
 * Complaints now live in Supabase Postgres. Every read and write goes through the
 * signed-in user's JWT, and Row Level Security decides what may be touched, so the
 * browser can never read another citizen's records even if it asks for them.
 */

const LEGACY_KEY = 'civiclens.complaints.v1';
const migratedFlag = (userId: string) => `civiclens.migrated.${userId}`;

interface ComplaintRow {
  id: string;
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  title: string;
  description: string;
  category: string;
  location: string;
  image: string | null;
  priority: string;
  status: string;
  analysis: Complaint['analysis'] | null;
  created_at: string;
  updated_at: string;
}

interface ComplaintContextValue {
  complaints: Complaint[];
  loading: boolean;
  error: string | null;
  addComplaint: (input: NewComplaint) => Promise<Complaint>;
  updateStatus: (id: string, status: ComplaintStatus) => Promise<void>;
  getComplaint: (id: string) => Complaint | undefined;
  refresh: () => Promise<void>;
}

const ComplaintContext = createContext<ComplaintContextValue | null>(null);

const fromRow = (row: ComplaintRow): Complaint => ({
  id: row.id,
  title: row.title,
  description: row.description,
  category: row.category as Complaint['category'],
  location: row.location,
  image: row.image,
  priority: row.priority as Complaint['priority'],
  status: row.status as Complaint['status'],
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  analysis: row.analysis ?? null,
  userId: row.user_id,
  userName: row.user_name ?? '',
  userEmail: row.user_email
});

const createId = (existing: Complaint[]): string => {
  const alphabet = '0123456789ABCDEF';
  for (let attempt = 0; attempt < 20; attempt += 1) {
    let id = 'CL-';
    for (let i = 0; i < 6; i += 1) {
      id += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    if (!existing.some((complaint) => complaint.id === id)) return id;
  }
  return `CL-${Date.now().toString(16).slice(-6).toUpperCase()}`;
};

/** Complaints saved in this browser before accounts existed are copied into the signed-in account once. */
const readLegacyComplaints = (): Complaint[] => {
  try {
    const raw = window.localStorage.getItem(LEGACY_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Complaint[]) : [];
  } catch {
    return [];
  }
};

export function ComplaintProvider({ children }: { children: ReactNode }) {
  const { userId, displayName, email, loading: authLoading } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<Complaint[]>(complaints);

  useEffect(() => {
    listRef.current = complaints;
  }, [complaints]);

  const load = useCallback(async () => {
    if (!userId) {
      setComplaints([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const client = getSupabase();
      const { data, error: selectError } = await client
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });
      if (selectError) throw selectError;
      setComplaints((data as ComplaintRow[]).map(fromRow));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load your complaints.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const migrateLegacy = useCallback(async () => {
    if (!userId) return;
    if (window.localStorage.getItem(migratedFlag(userId))) return;

    const legacy = readLegacyComplaints();
    window.localStorage.setItem(migratedFlag(userId), new Date().toISOString());
    if (legacy.length === 0) return;

    const rows = legacy.map((complaint) => ({
      id: complaint.id,
      user_id: userId,
      user_name: displayName,
      user_email: email,
      title: complaint.title,
      description: complaint.description,
      category: complaint.category,
      location: complaint.location,
      image: complaint.image,
      priority: complaint.priority,
      status: complaint.status,
      analysis: complaint.analysis,
      created_at: complaint.createdAt,
      updated_at: complaint.updatedAt
    }));

    try {
      const { error: insertError } = await getSupabase()
        .from('complaints')
        .upsert(rows, { onConflict: 'id', ignoreDuplicates: true });
      if (insertError) throw insertError;
      await load();
    } catch (migrationError) {
      console.warn('Existing local complaints could not be imported:', migrationError);
    }
  }, [userId, displayName, email, load]);

  useEffect(() => {
    if (authLoading) return;
    void load().then(() => {
      void migrateLegacy();
    });
  }, [authLoading, load, migrateLegacy]);

  const addComplaint = useCallback(
    async (input: NewComplaint) => {
      if (!userId) throw new Error('Please sign in with Google before filing a complaint.');

      const client = getSupabase();
      const now = new Date().toISOString();
      const id = createId(listRef.current);

      const { data, error: insertError } = await client
        .from('complaints')
        .insert({
          id,
          user_id: userId,
          user_name: displayName,
          user_email: email,
          title: input.title,
          description: input.description,
          category: input.category,
          location: input.location,
          image: input.image,
          priority: input.priority,
          status: input.status ?? 'Pending',
          analysis: input.analysis,
          created_at: now,
          updated_at: now
        })
        .select()
        .single();

      if (insertError) throw new Error(insertError.message);

      const complaint = fromRow(data as ComplaintRow);
      setComplaints((current) => [complaint, ...current]);
      return complaint;
    },
    [userId, displayName, email]
  );

  const updateStatus = useCallback(async (id: string, status: ComplaintStatus) => {
    const previous = listRef.current;
    const updatedAt = new Date().toISOString();
    setComplaints((current) =>
      current.map((complaint) => (complaint.id === id ? { ...complaint, status, updatedAt } : complaint))
    );
    setError(null);

    try {
      const { error: updateError } = await getSupabase()
        .from('complaints')
        .update({ status, updated_at: updatedAt })
        .eq('id', id);
      if (updateError) throw updateError;
    } catch (updateErr) {
      setComplaints(previous);
      setError(
        updateErr instanceof Error
          ? `Status change was rejected: ${updateErr.message}`
          : 'Status change was rejected.'
      );
    }
  }, []);

  const getComplaint = useCallback(
    (id: string) =>
      listRef.current.find((complaint) => complaint.id.toLowerCase() === id.trim().toLowerCase()),
    []
  );

  const value = useMemo(
    () => ({ complaints, loading, error, addComplaint, updateStatus, getComplaint, refresh: load }),
    [complaints, loading, error, addComplaint, updateStatus, getComplaint, load]
  );

  return <ComplaintContext.Provider value={value}>{children}</ComplaintContext.Provider>;
}

export function useComplaints() {
  const context = useContext(ComplaintContext);
  if (!context) throw new Error('useComplaints must be used inside ComplaintProvider');
  return context;
}
