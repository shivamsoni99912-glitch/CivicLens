import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { MISSING_CONFIG_MESSAGE } from '../lib/supabase';

const Screen = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="section section--cream">
    <div className="container">
      <div className="panel guard-panel">
        <span className="eyebrow">
          <span className="eyebrow__dot" />
          CivicLens AI
        </span>
        <h1 className="display display--sm">{title}</h1>
        {children}
      </div>
    </div>
  </section>
);

export default function RequireAuth({
  children,
  adminOnly = false
}: {
  children: ReactNode;
  adminOnly?: boolean;
}) {
  const { configured, loading, session, isAdmin, adminChecked } = useAuth();
  const location = useLocation();

  if (!configured) {
    return (
      <Screen title="Authentication is not configured">
        <p className="guard-panel__lede">{MISSING_CONFIG_MESSAGE}</p>
      </Screen>
    );
  }

  if (loading) {
    return (
      <Screen title="Checking your session…">
        <p className="guard-panel__lede">One moment while we confirm who is signed in.</p>
      </Screen>
    );
  }

  if (!session) {
    const next = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
  }

  if (adminOnly && !adminChecked) {
    return (
      <Screen title="Checking your access…">
        <p className="guard-panel__lede">Verifying your dashboard permissions.</p>
      </Screen>
    );
  }

  if (adminOnly && !isAdmin) {
    return (
      <Screen title="Admin access required">
        <p className="guard-panel__lede">
          This dashboard is limited to CivicLens staff accounts. Your own complaints are available under{' '}
          <strong>My Complaints</strong>.
        </p>
      </Screen>
    );
  }

  return <>{children}</>;
}
