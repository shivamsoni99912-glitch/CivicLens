import type { ComplaintStatus, Priority } from '../lib/types';

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`badge badge--${priority.toLowerCase()}`}>
      <i aria-hidden="true" />
      {priority}
    </span>
  );
}

const STATUS_CLASS: Record<ComplaintStatus, string> = {
  Pending: 'pending',
  'In Review': 'review',
  'In Progress': 'progress',
  Resolved: 'resolved'
};

export function StatusBadge({ status }: { status: ComplaintStatus }) {
  return <span className={`badge badge--status-${STATUS_CLASS[status]}`}>{status}</span>;
}
