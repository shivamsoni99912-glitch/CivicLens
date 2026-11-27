import { Link } from 'react-router-dom';
import { PriorityBadge, StatusBadge } from '../components/Badges';
import { IconArrow, IconSparkle } from '../components/icons';
import { timeAgo } from '../lib/format';
import { useAuth } from '../lib/auth';
import { useComplaints } from '../lib/store';

export default function MyComplaints() {
  const { complaints, loading, error } = useComplaints();
  const { displayName, email } = useAuth();

  return (
    <section className="section section--cream">
      <div className="container">
        <header className="page-head">
          <span className="eyebrow">
            <span className="eyebrow__dot" />
            My complaints
          </span>
          <h1 className="display display--lg">
            Everything you have <em>reported.</em>
          </h1>
          <p className="page-head__lede">
            {displayName ? `Signed in as ${displayName}` : 'Signed in'}
            {email ? ` (${email})` : ''}. Only the complaints filed from your account appear here.
          </p>
        </header>

        {error && (
          <p className="field__error" role="alert">
            {error}
          </p>
        )}

        <div className="panel admin-panel">
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
                {complaints.map((complaint) => (
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
                      <StatusBadge status={complaint.status} />
                    </td>
                    <td>
                      <span className="cell-updated">{timeAgo(complaint.updatedAt)}</span>
                    </td>
                  </tr>
                ))}
                {!loading && complaints.length === 0 && (
                  <tr>
                    <td colSpan={5}>
                      <div className="table-empty">
                        <IconSparkle width={20} height={20} />
                        <strong>You have not filed a complaint yet.</strong>
                        <span>Your reports will appear here as soon as you submit the first one.</span>
                      </div>
                    </td>
                  </tr>
                )}
                {loading && complaints.length === 0 && (
                  <tr>
                    <td colSpan={5}>
                      <div className="table-empty">
                        <strong>Loading your complaints…</strong>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <footer className="admin-panel__foot">
            <span>
              <strong>{complaints.length}</strong> {complaints.length === 1 ? 'complaint' : 'complaints'} on file
            </span>
            <Link to="/report" className="link-btn">
              File a new complaint <IconArrow width={15} height={15} />
            </Link>
          </footer>
        </div>
      </div>
    </section>
  );
}
