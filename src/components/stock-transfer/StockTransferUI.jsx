import { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiRefreshCw } from 'react-icons/fi';

export function PanelHeader({ title, subtitle, children }) {
  return (
    <div className="st-panel-head st-ui-panel-head">
      <div>
        <h2 className="st-ui-panel-title">{title}</h2>
        {subtitle ? <p className="st-ui-panel-sub">{subtitle}</p> : null}
      </div>
      {children ? <div className="st-ui-panel-actions">{children}</div> : null}
    </div>
  );
}

export function EmptyState({
  icon = '📦',
  title,
  description,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  primaryDisabled = false,
}) {
  return (
    <div className="st-empty">
      <div className="st-empty-icon" aria-hidden="true">
        {icon}
      </div>
      <h3 className="st-empty-title">{title}</h3>
      <p className="st-empty-desc">{description}</p>
      {(primaryLabel || secondaryLabel) && (
        <div className="st-empty-actions">
          {primaryLabel && onPrimary ? (
            <button
              type="button"
              className="st-btn primary"
              onClick={onPrimary}
              disabled={primaryDisabled}
            >
              {primaryLabel}
            </button>
          ) : null}
          {secondaryLabel && onSecondary ? (
            <button type="button" className="st-btn ghost" onClick={onSecondary}>
              {secondaryLabel}
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}

export function StatusBadge({ status }) {
  const key = String(status || '')
    .toLowerCase()
    .replace(/\s/g, '');
  return <span className={`st-badge ${key}`}>{status}</span>;
}

export function ConnectionStatus({ connected, branches, products, transfers, syncing }) {
  return (
    <div
      className={`st-connection ${connected ? 'is-live' : 'is-offline'}`}
      role="status"
    >
      <span className="st-connection-dot" aria-hidden="true" />
      <span className="st-connection-label">
        {syncing ? 'Syncing…' : connected ? 'Connected' : 'Not connected'}
      </span>
      <span className="st-connection-stats">
        <span>{branches} branches</span>
        <span className="st-connection-sep">·</span>
        <span>{products} products</span>
        <span className="st-connection-sep">·</span>
        <span>{transfers} transfers</span>
      </span>
    </div>
  );
}

export function WorkflowGuide({ perms }) {
  const [open, setOpen] = useState(false);
  const roleHint = perms.canApproveTransfer
    ? 'You (Admin): approve or reject manager requests on Progress.'
    : perms.canCreateTransfer
      ? 'You (Manager): submit on New Request — admin approves on Progress.'
      : 'View-only: track transfer status for your branch.';

  return (
    <div className={`st-workflow ${open ? 'is-open' : ''}`}>
      <p className="st-workflow-role-hint">{roleHint}</p>
      <button
        type="button"
        className="st-workflow-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>How transfers work</span>
        {open ? <FiChevronUp aria-hidden="true" /> : <FiChevronDown aria-hidden="true" />}
      </button>
      {open ? (
        <div className="st-workflow-body">
          <ol className="st-workflow-steps">
            <li>
              <strong>Manager</strong> submits a request → <StatusBadge status="Pending" />
            </li>
            <li>
              <strong>Admin</strong> approves or rejects →{' '}
              <StatusBadge status="Approved" /> / <StatusBadge status="Rejected" />
            </li>
            <li>
              Stock leaves source → <StatusBadge status="In Transit" />
            </li>
            <li>
              <strong>Destination manager</strong> confirms receipt →{' '}
              <StatusBadge status="Completed" />
            </li>
          </ol>
          {perms.canCancelTransfer ? (
            <p className="st-workflow-note">
              Admins can cancel a transfer before it is completed.
            </p>
          ) : null}
          {perms.viewScope === 'branch' ? (
            <p className="st-workflow-note">
              You only see transfers linked to your branch.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function PageHero({
  perms,
  connected,
  branchCount,
  productCount,
  transferCount,
  loading,
  onSync,
}) {
  return (
    <header className="st-header st-ui-hero">
      <div className="st-icon" aria-hidden="true">
        🚛
      </div>
      <div className="st-ui-hero-main">
        <h1 className="st-title">Stock Transfer</h1>
        <span className="st-role-pill">{perms.label} access</span>
        <ConnectionStatus
          connected={connected}
          branches={branchCount}
          products={productCount}
          transfers={transferCount}
          syncing={loading}
        />
      </div>
      <div className="st-ui-hero-actions">
        <button
          type="button"
          className="st-btn primary st-sync-btn"
          onClick={onSync}
          disabled={loading}
          title="Refresh branches, products, and transfers"
        >
          <FiRefreshCw aria-hidden="true" className={loading ? 'st-spin' : ''} />
          {loading ? 'Syncing…' : 'Sync data'}
        </button>
      </div>
    </header>
  );
}

export function FilterBar({ children }) {
  return <div className="st-filter-bar st-ui-filter">{children}</div>;
}

export function SearchField({ label, value, onChange, placeholder }) {
  return (
    <label className="st-search st-ui-search">
      <span className="st-ui-search-label">{label}</span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
