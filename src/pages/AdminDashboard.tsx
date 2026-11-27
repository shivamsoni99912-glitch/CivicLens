import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PriorityBadge } from '../components/Badges';
import { IconArrow, IconGauge, IconGrid, IconSearch, IconShield, IconSparkle } from '../components/icons';
import { timeAgo } from '../lib/format';
import { useComplaints } from '../lib/store';
import { PRIORITIES, STATUSES } from '../lib/types';
import type { ComplaintStatus, Priority } from '../lib/types';

const STATUS_SLUG: Record<ComplaintStatus, string> = {
  Pending: 'pending',
  'In Review': 'review',
  'In Progress': 'progress',
  Resolved: 'resolved'
};

export default function AdminDashboard() {
  const { complaints, updateStatus, error } = useComplaints();
  const [statusFilter, setStatusFilter] = useState<'All' | ComplaintStatus>('All');
  const [priorityFilter, setPriorityFilter] = useState<'All' | Priority>('All');
  const [search, setSearch] = useState('');

  const stats = useMemo(() => {
    const total = complaints.length;
    const pending = complaints.filter((complaint) => complaint.status === 'Pending').length;
    const resolved = complaints.filter((complaint) => complaint.status === 'Resolved').length;
    const high = complaints.filter((complaint) => complaint.priority === 'High').length;
    return { total, pending, resolved, high };
  }, [complaints]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return complaints.filter((complaint) => {
      if (statusFilter !== 'All' && complaint.status !== statusFilter) return false;
      if (priorityFilter !== 'All' && complaint.priority !== priorityFilter) return false;
      if (!term) return true;
      return (
        complaint.title.toLowerCase().includes(term) ||
        complaint.id.toLowerCase().includes(term) ||
        complaint.location.toLowerCase().includes(term) ||
        complaint.category.toLowerCase().includes(term)
      );
    });
  }, [complaints, statusFilter, priorityFilter, search]);

  return (
    <>
      <section className="admin-hero">
        <div className="container admin-hero__inner">
          <div>
            <span className="eyebrow eyebrow--dark">
              <span className="eyebrow__dot" />
              Admin dashboard
            </span>
            <h1 className="display display--md display--onDark">
              Operations, <em>at a glance.</em>
            </h1>
            <p className="admin-hero__lede">
              Every complaint on file, ranked by urgency. Move a report through the pipeline and the citizen’s tracking
              page updates instantly.
            </p>
          </div>
          <div className="admin-hero__badge">
            <IconShield width={20} height={20} />
                          <span>
                <strong>Admin workspace</strong>
                Status changes save to the database
              </span>
          </div>
        </div>
      </section>

      <section className="section section--cream admin-page">
        <div className="container">
          <div className="stat-grid">
            <article className="stat-card stat-card--navy">
              <span className="stat-card__label">
                <IconGrid width={16} height={16} /> Total complaints
              </span>
              <strong className="stat-card__value">{stats.total}</strong>
              <span className="stat-card__note">All reports on file</span>
            </article>
            <article className="stat-card">
              <span className="stat-card__label">
                <IconClockish /> Pending
              </span>
              <strong className="stat-card__value">{stats.pending}</strong>
              <span className="stat-card__note">Awaiting triage</span>
            </article>
            <article className="stat-card">
              <span className="stat-card__label">
                <IconCheckish /> Resolved
              </span>
              <strong className="stat-card__value">{stats.resolved}</strong>
              <span className="stat-card__note">Closed after repair</span>
            </article>
            <article className="stat-card stat-card--coral">
              <span className="stat-card__label">
                <IconGauge width={16} height={16} /> High priority
              </span>
              <strong className="stat-card__value">{stats.high}</strong>
              <span className="stat-card__note">Safety or service risk</span>
            </article>
          </div>

          <div className="panel admin-panel">
            <div className="admin-toolbar">
              <div className="admin-toolbar__filters">
                <div className="filter-pills" role="group" aria-label="Filter by status">
                  {(['All', ...STATUSES] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      className={`filter-pill${statusFilter === status ? ' is-active' : ''}`}
                      onClick={() => setStatusFilter(status)}
                      aria-pressed={statusFilter === status}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="admin-toolbar__right">
                <div className="select-wrap select-wrap--compact">
                  <label className="visually-hidden" htmlFor="priority-filter">
                    Filter by priority
                  </label>
                  <select
                    id="priority-filter"
                    value={priorityFilter}
                    onChange={(event) => setPriorityFilter(event.target.value as 'All' | Priority)}
                  >
                    <option value="All">All priorities</option>
                    {PRIORITIES.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority} priority
                      </option>
                    ))}
                  </select>
                </div>
                <div className="search-field">
                  <IconSearch width={17} height={17} aria-hidden="true" />
                  <label className="visually-hidden" htmlFor="admin-search">
                    Search complaints
                  </label>
                  <input
                    id="admin-search"
                    type="search"
                    placeholder="Search ID, title, area…"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>
              </div>
            </div>

            {error && (
              <p className="field__error admin-panel__error" role="alert">
                {error}
              </p>
            )}

            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">Complaint</th>
                    <th scope="col">Category</th>
                    <th scope="col">Priority</th>
                    <th scope="col">Status</th>
                    <th scope="col">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((complaint) => (
                    <tr key={complaint.id}>
                      <td>
                        <div className="cell-complaint">
                          <span className="mono cell-complaint__id">{complaint.id}</span>
                          <Link to={`/track/${complaint.id}`} className="cell-complaint__title">
                            {complaint.title}
                          </Link>
                          <span className="cell-complaint__meta">{complaint.location}</span>
                        </div>
                      </td>
                      <td>
                        <span className="cell-category">{complaint.category}</span>
                      </td>
                      <td>
                        <PriorityBadge priority={complaint.priority} />
                      </td>
                      <td>
                        <div className="select-wrap select-wrap--status">
                          <select
                            className={`status-select status-select--${STATUS_SLUG[complaint.status]}`}
                            value={complaint.status}
                            onChange={(event) => updateStatus(complaint.id, event.target.value as ComplaintStatus)}
                            aria-label={`Update status for ${complaint.id}`}
                          >
                            {STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td>
                        <span className="cell-updated">{timeAgo(complaint.updatedAt)}</span>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5}>
                        <div className="table-empty">
                          <IconSparkle width={20} height={20} />
                          <strong>No complaints match these filters.</strong>
                          <span>Try clearing the search or switching the status filter.</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <footer className="admin-panel__foot">
              <span>
                Showing <strong>{filtered.length}</strong> of <strong>{complaints.length}</strong> complaints
              </span>
              <Link to="/report" className="link-btn">
                File a new complaint <IconArrow width={15} height={15} />
              </Link>
            </footer>
          </div>
        </div>
      </section>
    </>
  );
}

/* Small inline glyphs keep the stat cards from importing the full icon set twice. */
const IconClockish = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5V12l3.2 2" strokeLinecap="round" />
  </svg>
);

const IconCheckish = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
    <path d="m4 12.5 5 5L20 6.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
