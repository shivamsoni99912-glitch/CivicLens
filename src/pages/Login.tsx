import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { IconArrow, IconShield } from '../components/icons';
import { useAuth } from '../lib/auth';
import { MISSING_CONFIG_MESSAGE } from '../lib/supabase';

const GoogleGlyph = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      fill="#4285F4"
      d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3.01h3.88c2.27-2.09 3.58-5.17 3.58-8.82Z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.96-1.08 7.94-2.91l-3.88-3.01c-1.08.72-2.46 1.15-4.06 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.1A12 12 0 0 0 12 24Z"
    />
    <path
      fill="#FBBC05"
      d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54v-3.1H1.26a12 12 0 0 0 0 10.74l4.01-3.1Z"
    />
    <path
      fill="#EA4335"
      d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.26 6.63l4.01 3.1C6.22 6.88 8.87 4.77 12 4.77Z"
    />
  </svg>
);

export default function Login() {
  const { configured, loading, session, signInWithGoogle, error } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState('');

  const requested = params.get('next') ?? '';
  const next = requested.startsWith('/') && !requested.startsWith('//') ? requested : '/report';

  useEffect(() => {
    if (!loading && session) navigate(next, { replace: true });
  }, [loading, session, next, navigate]);

  const handleGoogle = async () => {
    setBusy(true);
    setLocalError('');
    try {
      await signInWithGoogle(next);
    } catch {
      setBusy(false);
    }
  };

  const callbackError = params.get('error_description') ?? params.get('error');
  const message = localError || error || callbackError;

  return (
    <section className="auth-page">
      <div className="container auth-page__grid">
        <div className="auth-page__copy">
          <span className="eyebrow eyebrow--dark">
            <span className="eyebrow__dot" />
            Secure access
          </span>
          <h1 className="display display--lg display--onDark">
            One account. <em>Every report you file.</em>
          </h1>
          <p className="auth-page__lede">
            Sign in with Google to file a complaint and follow it from report to repair. Your reports stay tied to your
            account — nobody else can open them, and you can pick up where you left off on any device.
          </p>
          <ul className="auth-page__list">
            <li>
              <span className="auth-page__tick" aria-hidden="true">
                ✓
              </span>
              Browse the homepage without an account
            </li>
            <li>
              <span className="auth-page__tick" aria-hidden="true">
                ✓
              </span>
              Google sign-in — no new password to remember
            </li>
            <li>
              <span className="auth-page__tick" aria-hidden="true">
                ✓
              </span>
              Only you can see the complaints you filed
            </li>
          </ul>
        </div>

        <div className="panel auth-card">
          <span className="auth-card__badge">
            <IconShield width={16} height={16} /> Verified sign-in
          </span>
          <h2 className="auth-card__title">Continue to CivicLens AI</h2>
          <p className="auth-card__lede">
            We use Supabase Auth with Google. CivicLens never sees or stores your Google password.
          </p>

          {!configured ? (
            <div className="auth-setup">
              <strong>Authentication is not configured yet</strong>
              <p>{MISSING_CONFIG_MESSAGE}</p>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn--google btn--block btn--lg"
              onClick={() => void handleGoogle()}
              disabled={busy || loading}
            >
              <GoogleGlyph />
              {busy ? 'Opening Google…' : 'Continue with Google'}
            </button>
          )}

          {message && (
            <p className="auth-card__error" role="alert">
              {message}
            </p>
          )}

          <p className="auth-card__note">
            After signing in you will be taken straight to the complaint form. You can sign out at any time from the
            header.
          </p>

          <div className="auth-card__foot">
            <Link to="/" className="link-btn">
              Back to home
            </Link>
            <Link to="/track" className="link-btn">
              Track a complaint <IconArrow width={15} height={15} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
