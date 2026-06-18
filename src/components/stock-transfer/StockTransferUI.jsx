import { useState } from 'react';
import {
  FiAlertTriangle,
  FiChevronDown,
  FiChevronUp,
  FiInfo,
  FiRefreshCw,
  FiTruck,
  FiUser,
} from 'react-icons/fi';
import {
  cn,
  stAlertBase,
  stAlertOk,
  stAlertWarn,
  stBtnGhost,
  stBtnPrimary,
  stChip,
  stConnection,
  stConnectionDot,
  stConnectionDotLive,
  stEmpty,
  stEmptyDesc,
  stEmptyIcon,
  stEmptyTitle,
  stFieldInput,
  stFieldLabel,
  stFieldLabelText,
  stFilters,
  stHero,
  stHeroIcon,
  stHeroTitle,
  stMetricCard,
  stMetricIcon,
  stMetricLabel,
  stMetricValue,
  stPanelHeader,
  stPanelSubtitle,
  stPanelTitle,
  stRoleBadge,
  stSearchClearBtn,
  stSearchIcon,
  stSearchInput,
  stSearchInputWrap,
  stSearchWrap,
  stTable,
  stTableRowHover,
  stTableTh,
  stTableTd,
  stTableWrap,
  stWorkflow,
  stWorkflowBody,
  stWorkflowHint,
  stWorkflowToggle,
  statusBadgeClass,
} from './stockTransferClasses';

const KPI_ICONS = {
  primary: 'blue',
  warning: 'amber',
  success: 'green',
  info: 'violet',
};

export function PanelHeader({ title, subtitle, icon: Icon, children }) {
  return (
    <div className={cn(stPanelHeader, 'flex flex-wrap items-start justify-between gap-4')}>
      <div className="flex items-start gap-3.5">
        {Icon ? (
          <div className={cn(stMetricIcon.blue, 'size-11 text-lg')} aria-hidden="true">
            <Icon />
          </div>
        ) : null}
        <div>
          <h2 className={stPanelTitle}>{title}</h2>
          {subtitle ? <p className={stPanelSubtitle}>{subtitle}</p> : null}
        </div>
      </div>
      {children ? <div className="flex flex-wrap gap-2">{children}</div> : null}
    </div>
  );
}

export function KpiCard({ variant = 'primary', icon: Icon, value, label }) {
  const tone = KPI_ICONS[variant] ?? 'blue';
  return (
    <div className={stMetricCard}>
      <div className={stMetricIcon[tone]}>
        <Icon aria-hidden="true" className="size-[22px]" />
      </div>
      <div>
        <div className={stMetricLabel}>{label}</div>
        <div className={stMetricValue}>{value}</div>
      </div>
    </div>
  );
}

export function AlertBanner({ variant = 'warn', children }) {
  return (
    <div
      className={cn(stAlertBase, variant === 'warn' ? stAlertWarn : stAlertOk)}
      role="status"
    >
      <span className="text-lg" aria-hidden="true">
        {variant === 'warn' ? <FiAlertTriangle /> : <FiInfo />}
      </span>
      <div>{children}</div>
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
    <div className={stEmpty}>
      <div className={stEmptyIcon} aria-hidden="true">
        {icon}
      </div>
      <h3 className={stEmptyTitle}>{title}</h3>
      <p className={stEmptyDesc}>{description}</p>
      {(primaryLabel || secondaryLabel) && (
        <div className="flex flex-wrap justify-center gap-2.5">
          {primaryLabel && onPrimary ? (
            <button
              type="button"
              className={stBtnPrimary}
              onClick={onPrimary}
              disabled={primaryDisabled}
            >
              {primaryLabel}
            </button>
          ) : null}
          {secondaryLabel && onSecondary ? (
            <button type="button" className={stBtnGhost} onClick={onSecondary}>
              {secondaryLabel}
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}

export function StatusBadge({ status }) {
  return <span className={statusBadgeClass(status)}>{status}</span>;
}

export function ConnectionStatus({
  connected,
  branches,
  products,
  transfers,
  syncing,
}) {
  return (
    <div className={stConnection} role="status">
      <span
        className={connected ? stConnectionDotLive : stConnectionDot}
        aria-hidden="true"
      />
      <span
        className={cn(
          'font-semibold',
          connected ? 'text-emerald-700' : 'text-amber-700',
        )}
      >
        {syncing ? 'Syncing…' : connected ? 'Connected' : 'Not connected'}
      </span>
      <span className={stChip}>{branches} branches</span>
      <span className={stChip}>{products} products</span>
      <span className={stChip}>{transfers} transfers</span>
    </div>
  );
}

export function WorkflowGuide({ perms }) {
  const [open, setOpen] = useState(false);
  const roleHint = perms.canApproveTransfer
    ? 'You (Admin): approve or reject pending requests on Progress; view logs and full history. After approval, managers dispatch stock.'
    : perms.canCreateTransfer
      ? 'You (Manager): create and edit pending requests; cancel before admin approval; dispatch when Approved; confirm receipt at your branch when In Transit.'
      : perms.isViewOnly
        ? 'You (Cashier): view-only — Progress, History, Branch Stock, and Reports. No create, approve, or cancel.'
        : 'Track transfers for your branch.';

  return (
    <div className={stWorkflow}>
      <div className={stWorkflowHint}>
        <FiUser className="mt-0.5 shrink-0" aria-hidden="true" />
        <p className="m-0">{roleHint}</p>
      </div>
      <button
        type="button"
        className={stWorkflowToggle}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>How transfers work</span>
        {open ? <FiChevronUp /> : <FiChevronDown />}
      </button>
      {open ? (
        <div className={stWorkflowBody}>
          <ol className="m-0 list-decimal pl-5 leading-loose">
            <li>
              <strong>Manager</strong> submits → <StatusBadge status="Pending" />
            </li>
            <li>
              <strong>Admin</strong> approves or rejects →{' '}
              <StatusBadge status="Approved" /> / <StatusBadge status="Rejected" />
            </li>
            <li>
              <strong>Manager</strong> dispatches → <StatusBadge status="In Transit" />
            </li>
            <li>
              <strong>Destination manager</strong> confirms →{' '}
              <StatusBadge status="Completed" />
            </li>
          </ol>
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
    <header className={stHero}>
      <div className={stHeroIcon} aria-hidden="true">
        <FiTruck className="size-9" />
      </div>
      <div className="min-w-[200px] flex-1">
        <h1 className={stHeroTitle}>Stock Transfer Management</h1>
        <span className={stRoleBadge}>{perms.label} access</span>
        <ConnectionStatus
          connected={connected}
          branches={branchCount}
          products={productCount}
          transfers={transferCount}
          syncing={loading}
        />
      </div>
      <button
        type="button"
        className={stBtnPrimary}
        onClick={onSync}
        disabled={loading}
        title="Refresh branches, products, and transfers"
      >
        <FiRefreshCw className={loading ? 'animate-spin' : ''} />
        {loading ? 'Syncing…' : 'Sync data'}
      </button>
    </header>
  );
}

export function FilterBar({ children }) {
  return <div className={stFilters}>{children}</div>;
}

export function SearchField({
  label,
  value,
  onChange,
  placeholder,
  id,
  name,
}) {
  const inputId =
    id ?? `st-search-${String(label || 'field').replace(/\s+/g, '-').toLowerCase()}`;
  const hasValue = String(value ?? '').length > 0;

  return (
    <div className={cn(stSearchWrap, stFieldLabel)}>
      <label htmlFor={inputId} className={stFieldLabelText}>
        {label}
      </label>
      <div className={stSearchInputWrap}>
        <span className={stSearchIcon} aria-hidden="true">
          🔍
        </span>
        <input
          id={inputId}
          name={name ?? inputId}
          type="search"
          className={stSearchInput}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          aria-label={placeholder ? `${label}: ${placeholder}` : label}
        />
        {hasValue ? (
          <button
            type="button"
            className={stSearchClearBtn}
            onClick={() => onChange('')}
            aria-label={`Clear ${label}`}
          >
            ✕
          </button>
        ) : null}
      </div>
    </div>
  );
}

export const transferFieldClass = stFieldInput;
export const transferLabelClass = stFieldLabel;
export const transferBtnClass = stBtnGhost;
export const transferBtnPrimaryClass = stBtnPrimary;
export const transferBtnGhostClass = stBtnGhost;

export function TransferTable({ columns, children, caption }) {
  return (
    <div className={stTableWrap}>
      <div className="overflow-x-auto">
        <table className={stTable}>
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col} scope="col" className={stTableTh}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}

export const transferTableRowClass = stTableRowHover;
export const transferTableCellClass = stTableTd;
