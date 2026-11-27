import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { IconClose, IconMenu } from './icons';

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/report', label: 'Report Issue' },
  { to: '/track', label: 'Track Complaint' }
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { session, displayName, email, avatarUrl, isAdmin, signOut } = useAuth();

  const signedIn = Boolean(session);
  const links = [
    ...LINKS,
    ...(signedIn ? [{ to: '/my-complaints', label: 'My Complaints' }] : []),
    ...(isAdmin ? [{ to: '/admin', label: 'Admin Dashboard' }] : [])
  ];
  const initials = (displayName || email || '?')
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('is-menu-open', open);
    return () => document.body.classList.remove('is-menu-open');
  }, [open]);

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
      <div className="container site-header__inner">
        <Link to="/" className="brand" aria-label="CivicLens AI home">
          <span className="brand__mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" width="22" height="22">
              <circle cx="14" cy="14" r="8" fill="none" stroke="currentColor" strokeWidth="2.6" />
              <circle cx="14" cy="14" r="2.6" fill="currentColor" />
              <path d="m20.5 20.5 4.5 4.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
            </svg>
          </span>
          <span className="brand__name">
            CivicLens<span className="brand__ai">AI</span>
          </span>
        </Link>

        <nav className="site-nav" aria-label="Main">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={'end' in link ? link.end : false}
              className={({ isActive }) => `site-nav__link${isActive ? ' is-active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="site-header__actions">
          {signedIn ? (
            <div className="account">
              <Link to="/my-complaints" className="account__link">
                {avatarUrl ? (
                  <img className="account__avatar" src={avatarUrl} alt="" referrerPolicy="no-referrer" />
                ) : (
                  <span className="account__avatar account__avatar--initials" aria-hidden="true">
                    {initials}
                  </span>
                )}
                <span className="account__meta">
                  <span className="account__label">Signed in</span>
                  <strong className="account__name">{displayName || 'Citizen'}</strong>
                </span>
              </Link>
              <button type="button" className="btn btn--ghost btn--sm account__signout" onClick={() => void signOut()}>
                Sign out
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn--ghost btn--sm site-header__signin">
              Sign in
            </Link>
          )}

          {!signedIn && (
            <Link to="/report" className="btn btn--coral btn--sm site-header__cta">
              Report an Issue
            </Link>
          )}

          <button
            type="button"
            className="nav-toggle"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <IconClose width={22} height={22} /> : <IconMenu width={22} height={22} />}
          </button>
        </div>
      </div>

      <div id="mobile-nav" className={`mobile-nav${open ? ' is-open' : ''}`} hidden={!open}>
        <nav aria-label="Mobile">
          {links.map((link, index) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={'end' in link ? link.end : false}
              className={({ isActive }) => `mobile-nav__link${isActive ? ' is-active' : ''}`}
              style={{ animationDelay: `${index * 45}ms` }}
            >
              <span className="mobile-nav__index">0{index + 1}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {signedIn ? (
          <div className="mobile-account">
            <div className="mobile-account__meta">
              <strong>{displayName || 'Citizen'}</strong>
              <span>{email}</span>
            </div>
            <button type="button" className="btn btn--ghost btn--block" onClick={() => void signOut()}>
              Sign out
            </button>
          </div>
        ) : (
          <Link to="/login" className="btn btn--coral btn--block">
            Sign in with Google
          </Link>
        )}
      </div>
    </header>
  );
}
