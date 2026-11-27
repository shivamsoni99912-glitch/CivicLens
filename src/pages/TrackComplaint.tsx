import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PriorityBadge, StatusBadge } from '../components/Badges';
import StatusTimeline from '../components/StatusTimeline';
import { IconArrow, IconClock, IconPin, IconSearch, IconSparkle } from '../components/icons';
import { formatDateTime, timeAgo } from '../lib/format';
import { useComplaints } from '../lib/store';

export default function TrackComplaint() {
  const { id } = useParams();
  const { complaints, getComplaint } = useComplaints();
  const [query, setQuery] = useState(id ?? '');
  const [searched, setSearched] = useState(id ?? '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      setQuery(id);
      setSearched(id);
      setError('');
    }
  }, [id]);

  const complaint = useMemo(() => (searched ? getComplaint(searched) : undefined), [searched, getComplaint]);
  const samples = complaints.slice(0, 3);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      setError('Enter your complaint ID to continue.');
      setSearched('');
      return;
    }
    setError('');
    setSearched(trimmed);
  };

  return (
    <section className="section section--cream track-page">
      <div className="container">
        <header className="page-head">
          <span className="eyebrow">
            <span className="eyebrow__dot" />
            Track a complaint
          </span>
          <h1 className="display display--lg">
            Where did your <em>report land?</em>
          </h1>
          <p className="page-head__lede">
            Enter the complaint ID you received after submitting. You will see its current status, the department
            handling it, and every update since it was filed.
          </p>
        </header>

        <form className="track-search" onSubmit={handleSubmit} noValidate>
          <label className="visually-hidden" htmlFor="complaint-id">
            Complaint ID
          </label>
          <div className="track-search__field">
            <IconSearch width={19} height={19} aria-hidden="true" />
            <input
              id="complaint-id"
              type="text"
              placeholder="CL-8F42A1"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setError('');
              }}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'track-error' : undefined}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <button type="submit" className="btn btn--coral">
            Track complaint <IconArrow width={18} height={18} />
          </button>
        </form>
        {error && (
          <p className="field__error track-search__error" id="track-error">
            {error}
          </p>
        )}

        {!searched && (
          <div className="panel track-placeholder">
            <span className="track-placeholder__icon" aria-hidden="true">
              <IconSearch width={22} height={22} />
            </span>
            <h2>Your ID looks like CL-8F42A1</h2>
            <p>
              Every complaint gets a six-character ID after submission, and it stays linked to your account.
              {samples.length > 0
                ? ' Try one of your own reports:'
                : ' You have not filed a complaint yet — once you do, its ID will be listed here.'}
            </p>
            {samples.length > 0 && (
              <div className="chips">
                {samples.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    className="chip chip--button"
                    onClick={() => {
                      setQuery(sample.id);
                      setSearched(sample.id);
                    }}
                  >
                    {sample.id}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {searched && !complaint && (
          <div className="panel track-placeholder track-placeholder--error">
            <span className="track-placeholder__icon" aria-hidden="true">
              <IconSearch width={22} height={22} />
            </span>
            <h2>No complaint found for “{searched}”</h2>
            <p>
              Check the ID for typos — only complaints filed from your account can be opened here. You can also file a
              new report if this is the first time you are raising the issue.
            </p>
            {samples.length > 0 && (
              <div className="chips">
                {samples.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    className="chip chip--button"
                    onClick={() => {
                      setQuery(sample.id);
                      setSearched(sample.id);
                    }}
                  >
                    {sample.id}
                  </button>
                ))}
              </div>
            )}
            <Link to="/report" className="btn btn--coral">
              Report an issue <IconArrow width={18} height={18} />
            </Link>
          </div>
        )}

        {complaint && (
          <article className="track-card">
            <header className="track-card__head">
              <div>
                <span className="mono track-card__id">{complaint.id}</span>
                <h2>{complaint.title}</h2>
              </div>
              <StatusBadge status={complaint.status} />
            </header>

            <dl className="meta-grid">
              <div>
                <dt>Category</dt>
                <dd>{complaint.category}</dd>
              </div>
              <div>
                <dt>Priority</dt>
                <dd>
                  <PriorityBadge priority={complaint.priority} />
                </dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>
                  <IconPin width={15} height={15} /> {complaint.location}
                </dd>
              </div>
              <div>
                <dt>Reported on</dt>
                <dd>{formatDateTime(complaint.createdAt)}</dd>
              </div>
              <div>
                <dt>Last update</dt>
                <dd>
                  <IconClock width={15} height={15} /> {timeAgo(complaint.updatedAt)}
                </dd>
              </div>
            </dl>

            <div className="track-card__section">
              <h3>Status timeline</h3>
              <StatusTimeline status={complaint.status} />
            </div>

            <div className="track-card__section">
              <h3>What was reported</h3>
              <p>{complaint.description}</p>
            </div>

            {complaint.image && (
              <figure className="track-card__figure">
                <img src={complaint.image} alt="Photo attached to this complaint" />
                <figcaption>Photo submitted with the complaint</figcaption>
              </figure>
            )}

            {complaint.analysis && (
              <div className="insight">
                <div className="insight__head">
                  <span className="ai-card__spark" aria-hidden="true">
                    <IconSparkle width={17} height={17} />
                  </span>
                  <div>
                    <h3>AI analysis on file</h3>
                    <p>{complaint.analysis.confidence}% confidence · typical response {complaint.analysis.responseWindow}</p>
                  </div>
                </div>
                <p>{complaint.analysis.explanation}</p>
                {complaint.analysis.signals.length > 0 && (
                  <div className="chips">
                    {complaint.analysis.signals.map((signal) => (
                      <span key={signal} className="chip">
                        {signal}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </article>
        )}
      </div>
    </section>
  );
}
