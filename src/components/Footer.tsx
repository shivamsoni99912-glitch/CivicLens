import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div className="site-footer__brand">
          <Link to="/" className="brand brand--footer" aria-label="CivicLens AI home">
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
          <p>
            An AI-assisted civic complaint platform. Report what is broken, understand how urgent it is, and follow it
            until it is fixed.
          </p>
        </div>

        <div className="site-footer__col">
          <h3>Platform</h3>
          <Link to="/report">Report an Issue</Link>
          <Link to="/track">Track a Complaint</Link>
          <Link to="/admin">Admin Dashboard</Link>
        </div>

        <div className="site-footer__col">
          <h3>How it works</h3>
          <Link to="/#features">Features</Link>
          <Link to="/#how-it-works">Three-step process</Link>
          <Link to="/track">Status timeline</Link>
        </div>

        <div className="site-footer__col site-footer__col--meta">
          <h3>Built for</h3>
          <p>Citizens, campus municipalities and city councils who need complaints to move, not disappear.</p>
          <span className="site-footer__tag">Capstone demo · Reports live in your signed-in account</span>
        </div>
      </div>
      <div className="container site-footer__bottom">
        <span>© {new Date().getFullYear()} CivicLens AI. Built for civic good.</span>
        <span className="site-footer__dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </div>
    </footer>
  );
}
