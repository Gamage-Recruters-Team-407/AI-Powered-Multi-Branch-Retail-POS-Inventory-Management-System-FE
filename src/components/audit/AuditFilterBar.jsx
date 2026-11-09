import React, { useState } from 'react';

const MODULE_OPTIONS = [
  'All Modules', 'Auth', 'POS', 'Inventory', 'Products',
  'Employees', 'Customers', 'Reports', 'Branches', 'Suppliers',
  'Purchase Orders', 'Returns', 'Settings',
];

const ACTION_OPTIONS = [
  'All Actions', 'CREATE', 'UPDATE', 'DELETE', 'VIEW', 'LOGIN',
  'LOGOUT', 'EXPORT', 'IMPORT', 'APPROVE', 'REJECT',
];

const SEVERITY_OPTIONS = ['All Severities', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const AuditFilterBar = ({ filters, onChange, onSearch, onReset, loading }) => {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = Object.values(filters).some(v => v && v !== '');

  return (
    <div className="audit-filter-bar">
      {/* Search Row */}
      <div className="filter-main-row">
        <div className="filter-search-wrap">
          <span className="search-icon">🔍</span>
          <input
            className="filter-search"
            type="text"
            placeholder="Search by user, IP, action, description…"
            value={filters.search || ''}
            onChange={e => handleChange('search', e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onSearch()}
          />
          {filters.search && (
            <button className="search-clear" onClick={() => handleChange('search', '')}>✕</button>
          )}
        </div>

        <div className="filter-quick-btns">
          <button className="filter-btn-search" onClick={onSearch} disabled={loading}>
            {loading ? 'Searching…' : 'Search'}
          </button>
          <button
            className={`filter-btn-toggle ${expanded ? 'active' : ''}`}
            onClick={() => setExpanded(!expanded)}
          >
            ⚙ Filters {hasActiveFilters && <span className="filter-dot" />}
          </button>
          {hasActiveFilters && (
            <button className="filter-btn-reset" onClick={onReset}>Reset</button>
          )}
        </div>
      </div>

      {/* Expanded Filters */}
      {expanded && (
        <div className="filter-expanded">
          <div className="filter-group">
            <label className="filter-label">Module</label>
            <select
              className="filter-select"
              value={filters.module || ''}
              onChange={e => handleChange('module', e.target.value === 'All Modules' ? '' : e.target.value)}
            >
              {MODULE_OPTIONS.map(o => <option key={o} value={o === 'All Modules' ? '' : o}>{o}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Action</label>
            <select
              className="filter-select"
              value={filters.action || ''}
              onChange={e => handleChange('action', e.target.value === 'All Actions' ? '' : e.target.value)}
            >
              {ACTION_OPTIONS.map(o => <option key={o} value={o === 'All Actions' ? '' : o}>{o}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Severity</label>
            <select
              className="filter-select"
              value={filters.severity || ''}
              onChange={e => handleChange('severity', e.target.value === 'All Severities' ? '' : e.target.value)}
            >
              {SEVERITY_OPTIONS.map(o => <option key={o} value={o === 'All Severities' ? '' : o}>{o}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">From Date</label>
            <input
              type="date"
              className="filter-select"
              value={filters.startDate || ''}
              onChange={e => handleChange('startDate', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">To Date</label>
            <input
              type="date"
              className="filter-select"
              value={filters.endDate || ''}
              onChange={e => handleChange('endDate', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">User ID</label>
            <input
              type="text"
              className="filter-select"
              placeholder="Filter by user ID"
              value={filters.userId || ''}
              onChange={e => handleChange('userId', e.target.value)}
            />
          </div>
        </div>
      )}

      <style>{`
        .audit-filter-bar {
          background: white;
          border: 1.5px solid #e2e8f0;
          border-radius: 14px;
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .filter-main-row {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }
        .filter-search-wrap {
          flex: 1;
          min-width: 240px;
          position: relative;
          display: flex;
          align-items: center;
        }
        .search-icon {
          position: absolute;
          left: 12px;
          font-size: .95rem;
          pointer-events: none;
        }
        .filter-search {
          width: 100%;
          padding: 9px 36px 9px 36px;
          border: 1.5px solid #e2e8f0;
          border-radius: 9px;
          font-size: .875rem;
          color: #0f172a;
          background: #f8fafc;
          transition: border-color .15s;
          outline: none;
        }
        .filter-search:focus { border-color: #3b82f6; background: white; }
        .search-clear {
          position: absolute; right: 10px;
          color: #94a3b8; font-size: .8rem;
          background: none; border: none; cursor: pointer;
          padding: 4px;
        }
        .filter-quick-btns { display: flex; gap: 8px; flex-shrink: 0; flex-wrap: wrap; }
        .filter-btn-search {
          padding: 9px 20px;
          background: #1e3a5f;
          color: white;
          border-radius: 9px;
          font-size: .875rem;
          font-weight: 600;
          transition: background .15s;
        }
        .filter-btn-search:hover:not(:disabled) { background: #2563eb; }
        .filter-btn-search:disabled { opacity: .6; cursor: not-allowed; }
        .filter-btn-toggle {
          padding: 9px 16px;
          border: 1.5px solid #e2e8f0;
          border-radius: 9px;
          font-size: .875rem;
          font-weight: 500;
          color: #475569;
          background: white;
          position: relative;
          transition: border-color .15s, background .15s;
        }
        .filter-btn-toggle.active { border-color: #3b82f6; color: #3b82f6; background: #eff6ff; }
        .filter-dot {
          display: inline-block;
          width: 7px; height: 7px;
          background: #ef4444;
          border-radius: 50%;
          margin-left: 5px;
          vertical-align: middle;
        }
        .filter-btn-reset {
          padding: 9px 14px;
          border: 1.5px solid #fee2e2;
          border-radius: 9px;
          font-size: .875rem;
          font-weight: 500;
          color: #ef4444;
          background: #fff5f5;
          transition: background .15s;
        }
        .filter-btn-reset:hover { background: #fee2e2; }
        .filter-expanded {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
          padding-top: 12px;
          border-top: 1px solid #f1f5f9;
        }
        .filter-group { display: flex; flex-direction: column; gap: 5px; }
        .filter-label { font-size: .72rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: .06em; }
        .filter-select {
          padding: 8px 10px;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          font-size: .82rem;
          color: #0f172a;
          background: #f8fafc;
          outline: none;
          transition: border-color .15s;
        }
        .filter-select:focus { border-color: #3b82f6; background: white; }
      `}</style>
    </div>
  );
};

export default AuditFilterBar;
