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
      { key: 'next', label: 'Manager may create a new request', done: false },
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
    <div className="my-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
        Progress trail
      </p>
      <ul className="m-0 list-none space-y-2 p-0">
        {steps.map((step) => (
          <li
            key={step.key}
            className={`flex items-start gap-2.5 text-sm ${
              step.tone === 'danger'
                ? 'font-medium text-red-700'
                : step.done
                  ? 'font-medium text-slate-700'
                  : 'text-slate-400'
            }`}
          >
            <span
              className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                step.tone === 'danger'
                  ? 'bg-red-500'
                  : step.done
                    ? 'bg-emerald-500'
                    : 'bg-slate-300'
              }`}
              aria-hidden="true"
            />
            <span>{step.label}</span>
          </li>
        ))}
      </ul>
      {logs.length > 0 ? (
        <ul className="mt-3 space-y-1 border-t border-slate-200 pt-3 text-xs text-slate-500">
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
