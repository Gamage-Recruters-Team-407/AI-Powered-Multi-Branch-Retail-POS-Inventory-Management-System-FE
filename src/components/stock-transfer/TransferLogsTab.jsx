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
import './TransferLogsTab.css';

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

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allRows;
    return allRows.filter((log) => {
      const ref = formatTransferReference(
        log.transferKey ?? log.transferId,
        transferRefMap,
      );
      const haystack = [
        ref,
        log.transferId,
        log.productName,
        log.branchName,
        log.type,
        log.changedBy,
        log.note,
      ]
        .map((v) => toDisplayString(v, '').toLowerCase())
        .join(' ');
      return haystack.includes(q);
    });
  }, [allRows, search, transferRefMap]);

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
      className="st-panel st-logs-panel st-logs-page"
      aria-labelledby="transfer-logs-title"
      data-testid="transfer-logs-panel"
    >
      <header className="st-logs-page__header">
        <div>
          <h2 id="transfer-logs-title" className="st-logs-page__title">
            Transfer Movement Logs
          </h2>
          <p className="st-logs-page__subtitle">
            Track stock movements between branches — when items leave, arrive, or
            transfer status changes.
          </p>
          <span className="st-logs-scope">{scopeLabel}</span>
        </div>
        <div className="st-logs-page__actions">
          <label className="st-logs-search">
            <FiSearch aria-hidden="true" />
            <input
              type="search"
              placeholder="Search product, branch, user…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search transfer logs"
            />
          </label>
          <button
            type="button"
            className="st-btn ghost"
            onClick={onRefresh}
            disabled={logsLoading}
            title="Reload movement history"
          >
            <FiRefreshCw
              aria-hidden="true"
              className={logsLoading ? 'st-spin' : ''}
            />
            {logsLoading ? 'Updating…' : 'Refresh'}
          </button>
        </div>
      </header>

      <div className="st-logs-stats" aria-label="Log summary">
        <div className="st-logs-stat">
          <strong>{stats.total}</strong>
          <span>Total entries</span>
        </div>
        <div className="st-logs-stat st-logs-stat--in">
          <strong>{stats.stockIn}</strong>
          <span>Stock in</span>
        </div>
        <div className="st-logs-stat st-logs-stat--out">
          <strong>{stats.stockOut}</strong>
          <span>Stock out</span>
        </div>
      </div>

      {logsError ? (
        <div className="st-alert warn" role="status">
          {logsError}
        </div>
      ) : null}

      <div className="st-logs-table-card">
        {filteredRows.length === 0 ? (
          <div className="st-logs-empty">
            <div className="st-logs-empty-icon" aria-hidden="true">
              📋
            </div>
            <h3>No movement logs yet</h3>
            <p>
              When transfers are dispatched or received, stock in/out events will
              appear here. Create a transfer and complete the workflow to generate
              history.
            </p>
            <button
              type="button"
              className="st-btn primary"
              onClick={onRefresh}
              disabled={logsLoading}
            >
              <FiRefreshCw aria-hidden="true" className={logsLoading ? 'st-spin' : ''} />
              Refresh logs
            </button>
          </div>
        ) : (
          <div className="st-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Transfer</th>
                  <th>Product</th>
                  <th>Branch</th>
                  <th>Qty</th>
                  <th>Event</th>
                  <th>User</th>
                  <th>Details</th>
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
                    <tr key={log._id ?? `log-${idx}`}>
                      <td>{formatLogDate(log.createdAt)}</td>
                      <td>
                        <span className="st-logs-ref">
                          {ref}
                          {showRawHint ? (
                            <span title={rawId}>ID …{rawId.slice(-6)}</span>
                          ) : null}
                        </span>
                      </td>
                      <td className="st-logs-product">
                        {toDisplayString(log.productName)}
                      </td>
                      <td className="st-logs-branch">
                        {toDisplayString(log.branchName)}
                      </td>
                      <td className="st-logs-qty">
                        {toDisplayString(log.quantity)}
                      </td>
                      <td>
                        <span
                          className={`st-logs-event st-logs-event--${event.tone}`}
                        >
                          {event.label}
                        </span>
                      </td>
                      <td className="st-logs-user">
                        {userLabel}
                        {userRaw.includes('@') && userLabel !== userRaw ? (
                          <small>{userRaw}</small>
                        ) : null}
                      </td>
                      <td className="st-logs-note">
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
