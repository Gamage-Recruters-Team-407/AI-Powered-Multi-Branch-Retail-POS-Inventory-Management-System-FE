import { useMemo, useState } from 'react';
import { FiRefreshCw, FiSearch } from 'react-icons/fi';
import {
  buildLogsFromTransfers,
  formatEventType,
  formatLogDate,
  formatTransferReference,
  formatUserLabel,
  toDisplayString,
} from '../../services/stockTransferApi';
import { matchesMovementLogSearch, normalizeSearchQuery } from './stockTransferSearch';
import {
  AlertBanner,
  transferBtnClass,
  transferBtnGhostClass,
  transferBtnPrimaryClass,
} from './StockTransferUI';

const EVENT_BADGE_BASE =
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset';

function logEventBadgeClass(tone) {
  const map = {
    in: `${EVENT_BADGE_BASE} bg-emerald-50 text-emerald-800 ring-emerald-600/20`,
    out: `${EVENT_BADGE_BASE} bg-orange-50 text-orange-800 ring-orange-600/20`,
    pending: `${EVENT_BADGE_BASE} bg-amber-50 text-amber-800 ring-amber-600/20`,
    approved: `${EVENT_BADGE_BASE} bg-blue-50 text-blue-800 ring-blue-600/20`,
  };
  return map[tone] ?? `${EVENT_BADGE_BASE} bg-slate-50 text-slate-700 ring-slate-500/20`;
}

function TransferLogsTab({
  perms,
  logsLoading,
  logsError,
  movementLogs,
  scopedTransfers,
  onRefresh,
}) {
  const [search, setSearch] = useState('');

  const transferRefMap = useMemo(() => {
    const map = new Map();
    (scopedTransfers ?? []).forEach((t) => {
      if (t._id) map.set(String(t._id), t.id);
      if (t.id) map.set(String(t.id), t.id);
    });
    return map;
  }, [scopedTransfers]);

  const allRows = useMemo(() => {
    const apiRows = Array.isArray(movementLogs) ? movementLogs : [];
    const fromTransfers = buildLogsFromTransfers(scopedTransfers ?? []);
    return apiRows.length > 0 ? apiRows : fromTransfers;
  }, [movementLogs, scopedTransfers]);

  const filteredRows = useMemo(
    () =>
      allRows.filter((log) => matchesMovementLogSearch(log, search, transferRefMap)),
    [allRows, search, transferRefMap],
  );

  const hasSearch = normalizeSearchQuery(search).length > 0;

  const stats = useMemo(() => {
    let stockIn = 0;
    let stockOut = 0;
    filteredRows.forEach((log) => {
      const { tone } = formatEventType(log.type);
      if (tone === 'in') stockIn += 1;
      else if (tone === 'out') stockOut += 1;
    });
    return { total: filteredRows.length, stockIn, stockOut };
  }, [filteredRows]);

  const scopeLabel = perms.canViewAllBranches
    ? 'All branches'
    : 'Your branch only';

  return (
    <section
      className="relative flex min-h-[320px] flex-col gap-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-900/[0.03] before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-gradient-to-r before:from-blue-500 before:via-indigo-500 before:to-violet-500 sm:p-8"
      aria-labelledby="transfer-logs-title"
      data-testid="transfer-logs-panel"
    >
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2
            id="transfer-logs-title"
            className="text-xl font-semibold tracking-tight text-slate-900"
          >
            Transfer Movement Logs
          </h2>
          <p className="mt-1 max-w-lg text-sm text-slate-500">
            Track stock movements between branches — when items leave, arrive, or
            transfer status changes.
          </p>
          <span className="mt-2 inline-flex rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100">
            {scopeLabel}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative flex min-w-[200px] items-center gap-2 rounded-xl bg-white py-2 pl-3 pr-2 shadow-sm ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-blue-500/30 sm:min-w-[280px]">
            <FiSearch aria-hidden="true" className="shrink-0 text-slate-400" />
            <input
              id="transfer-logs-search"
              type="search"
              className="w-full border-0 bg-transparent text-sm outline-none"
              placeholder="Transfer ID, product, branch, user, event…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search transfer logs"
              autoComplete="off"
            />
            {hasSearch ? (
              <button
                type="button"
                className="shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold text-slate-500 hover:bg-slate-100"
                onClick={() => setSearch('')}
                aria-label="Clear log search"
              >
                ✕
              </button>
            ) : null}
          </label>
          <button
            type="button"
            className={`${transferBtnClass} ${transferBtnGhostClass}`}
            onClick={onRefresh}
            disabled={logsLoading}
            title="Reload movement history"
          >
            <FiRefreshCw
              aria-hidden="true"
              className={logsLoading ? 'animate-spin' : ''}
            />
            {logsLoading ? 'Updating…' : 'Refresh'}
          </button>
        </div>
      </header>

      <div
        className="grid grid-cols-3 gap-3 max-sm:grid-cols-1"
        aria-label="Log summary"
      >
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
          <strong className="block text-2xl font-bold tabular-nums text-slate-900">
            {stats.total}
          </strong>
          <span className="text-xs font-medium text-slate-500">Total entries</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md [&>strong]:text-emerald-600">
          <strong className="block text-2xl font-bold tabular-nums text-slate-900">
            {stats.stockIn}
          </strong>
          <span className="text-xs font-medium text-slate-500">Stock in</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md [&>strong]:text-orange-600">
          <strong className="block text-2xl font-bold tabular-nums text-slate-900">
            {stats.stockOut}
          </strong>
          <span className="text-xs font-medium text-slate-500">Stock out</span>
        </div>
      </div>

      {logsError ? <AlertBanner variant="warn">{logsError}</AlertBanner> : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {filteredRows.length === 0 ? (
          <div className="px-8 py-14 text-center">
            <div className="mb-4 text-5xl" aria-hidden="true">
              📋
            </div>
            <h3 className="mb-2 text-lg font-bold text-slate-900">
              {hasSearch ? 'No logs match your search' : 'No movement logs yet'}
            </h3>
            <p className="mx-auto mb-5 max-w-[400px] text-sm leading-normal text-slate-500">
              {hasSearch
                ? `Nothing matches "${search.trim()}". Try transfer ID, product, branch, user, or event type.`
                : 'When transfers are dispatched or received, stock in/out events will appear here. Create a transfer and complete the workflow to generate history.'}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {hasSearch ? (
                <button
                  type="button"
                  className={`${transferBtnClass} ${transferBtnGhostClass}`}
                  onClick={() => setSearch('')}
                >
                  Clear search
                </button>
              ) : null}
              <button
                type="button"
                className={`${transferBtnClass} ${transferBtnPrimaryClass}`}
                onClick={onRefresh}
                disabled={logsLoading}
              >
                <FiRefreshCw
                  aria-hidden="true"
                  className={logsLoading ? 'animate-spin' : ''}
                />
                Refresh logs
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="bg-slate-50/90 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Date
                  </th>
                  <th className="bg-slate-50/90 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Transfer
                  </th>
                  <th className="bg-slate-50/90 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Product
                  </th>
                  <th className="bg-slate-50/90 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Branch
                  </th>
                  <th className="bg-slate-50/90 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Qty
                  </th>
                  <th className="bg-slate-50/90 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Event
                  </th>
                  <th className="bg-slate-50/90 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    User
                  </th>
                  <th className="bg-slate-50/90 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((log, idx) => {
                  const ref = formatTransferReference(
                    log.transferKey ?? log.transferId,
                    transferRefMap,
                  );
                  const rawId = toDisplayString(
                    log.transferKey ?? log.transferId,
                    '',
                  );
                  const showRawHint =
                    rawId &&
                    ref !== rawId &&
                    /^[a-f\d]{24}$/i.test(rawId);
                  const event = formatEventType(log.type);
                  const userLabel = formatUserLabel(log.changedBy);
                  const userRaw = toDisplayString(log.changedBy, '');

                  return (
                    <tr
                      key={log._id ?? `log-${idx}`}
                      className="transition-colors hover:bg-blue-50/30"
                    >
                      <td className="border-t border-slate-100 px-4 py-3.5 text-slate-700">
                        {formatLogDate(log.createdAt)}
                      </td>
                      <td className="border-t border-slate-100 px-4 py-3.5 text-slate-700">
                        <span className="font-mono text-xs font-semibold text-blue-600 [&>span]:mt-0.5 [&>span]:block [&>span]:font-normal [&>span]:text-slate-400">
                          {ref}
                          {showRawHint ? (
                            <span title={rawId}>ID …{rawId.slice(-6)}</span>
                          ) : null}
                        </span>
                      </td>
                      <td className="border-t border-slate-100 px-4 py-3.5 font-medium text-slate-900">
                        {toDisplayString(log.productName)}
                      </td>
                      <td className="border-t border-slate-100 px-4 py-3.5 text-slate-600">
                        {toDisplayString(log.branchName)}
                      </td>
                      <td className="border-t border-slate-100 px-4 py-3.5 text-center font-semibold tabular-nums text-slate-900">
                        {toDisplayString(log.quantity)}
                      </td>
                      <td className="border-t border-slate-100 px-4 py-3.5 text-slate-700">
                        <span className={logEventBadgeClass(event.tone)}>
                          {event.label}
                        </span>
                      </td>
                      <td className="border-t border-slate-100 px-4 py-3.5 text-slate-700 [&>small]:mt-0.5 [&>small]:block [&>small]:text-xs [&>small]:text-slate-400">
                        {userLabel}
                        {userRaw.includes('@') && userLabel !== userRaw ? (
                          <small>{userRaw}</small>
                        ) : null}
                      </td>
                      <td className="max-w-[220px] border-t border-slate-100 px-4 py-3.5 text-sm text-slate-500">
                        {toDisplayString(log.note, '') || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default TransferLogsTab;
