import { STATUSES } from '../lib/types';
import type { ComplaintStatus } from '../lib/types';
import { IconCheck } from './icons';

const COPY: Record<ComplaintStatus, string> = {
  Pending: 'Received and queued for triage',
  'In Review': 'Assigned to a department reviewer',
  'In Progress': 'Field crew working on it',
  Resolved: 'Fix confirmed and closed'
};

export default function StatusTimeline({ status }: { status: ComplaintStatus }) {
  const currentIndex = STATUSES.indexOf(status);

  return (
    <ol className="timeline">
      {STATUSES.map((step, index) => {
        const state = index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'upcoming';
        return (
          <li key={step} className={`timeline__step is-${state}`}>
            <span className="timeline__marker" aria-hidden="true">
              {state === 'done' ? <IconCheck width={14} height={14} /> : index + 1}
            </span>
            <span className="timeline__body">
              <strong>{step}</strong>
              <span>{COPY[step]}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
