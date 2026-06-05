import {
  buildLogsFromTransfers,
  formatLogDate,
  formatUserLabel,
  toDisplayString,
} from '../../services/stockTransferApi';

function getTrailSteps(transfer) {
  if (transfer.status === 'Rejected') {
    return [
      { key: 'created', label: 'Request created', done: true },
      {
        key: 'rejected',
        label: `Rejected${transfer.rejectReason ? `: ${transfer.rejectReason}` : ''}`,
        done: true,
        tone: 'danger',
      },
      { key: 'resubmit', label: 'Manager may edit & resubmit', done: false },
    ];
  }
  if (transfer.status === 'Cancelled') {
    return [
      { key: 'created', label: 'Request created', done: true },
      { key: 'cancelled', label: 'Cancelled', done: true, tone: 'danger' },
    ];
  }

  return [
    { key: 'created', label: 'Request created', done: true },
    {
      key: 'pending',
      label: 'Awaiting admin review',
      done: transfer.status !== 'Pending',
    },
    {
      key: 'approved',
      label: 'Approved by admin',
      done: ['Approved', 'In Transit', 'Completed'].includes(transfer.status),
    },
    {
      key: 'transit',
      label: 'In transit (stock left source)',
      done: ['In Transit', 'Completed'].includes(transfer.status),
    },
    {
      key: 'done',
      label: 'Received at destination',
      done: transfer.status === 'Completed',
    },
  ];
}

function TransferActivityTrail({ transfer }) {
  const steps = getTrailSteps(transfer);
  const logs = buildLogsFromTransfers([transfer]);

  return (
    <div className="st-activity-trail">
      <p className="st-activity-trail-title">Progress trail</p>
      <ul className="st-activity-steps">
        {steps.map((step) => (
          <li
            key={step.key}
            className={`st-activity-step ${step.done ? 'done' : ''} ${step.tone ?? ''}`}
          >
            <span className="st-activity-dot" aria-hidden="true" />
            <span>{step.label}</span>
          </li>
        ))}
      </ul>
      {logs.length > 0 ? (
        <ul className="st-activity-log-list">
          {logs.slice(0, 5).map((log, i) => (
            <li key={log._id ?? i}>
              {formatLogDate(log.createdAt)} — {toDisplayString(log.type)} —{' '}
              {formatUserLabel(log.changedBy)}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default TransferActivityTrail;
