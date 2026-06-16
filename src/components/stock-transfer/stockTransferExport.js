import { formatLogDate, formatUserLabel, toDisplayString } from '../../services/stockTransferApi';

function escapeCsvCell(value) {
  const text = value == null ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function rowToCsv(row) {
  return row.map(escapeCsvCell).join(',');
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const EXPORT_HEADERS = [
  'Transfer ID',
  'Date',
  'From',
  'To',
  'Product',
  'Quantity',
  'Status',
  'Requested by',
  'Notes',
];

function printHtmlReport(html) {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('title', 'Stock transfer report');
  iframe.style.cssText =
    'position:fixed;left:0;top:0;width:0;height:0;border:0;visibility:hidden';
  document.body.appendChild(iframe);

  const frameWindow = iframe.contentWindow;
  const doc = frameWindow?.document;
  if (!doc || !frameWindow) {
    iframe.remove();
    throw new Error('Could not open print preview.');
  }

  doc.open();
  doc.write(html);
  doc.close();

  const runPrint = () => {
    try {
      frameWindow.focus();
      frameWindow.print();
    } finally {
      window.setTimeout(() => iframe.remove(), 1500);
    }
  };

  if (doc.readyState === 'complete') {
    window.setTimeout(runPrint, 300);
  } else {
    iframe.onload = () => window.setTimeout(runPrint, 300);
  }
}

export function transferToExportRow(transfer) {
  return {
    'Transfer ID': transfer.id ?? transfer._id ?? '',
    Date: formatLogDate(transfer.date),
    From: toDisplayString(transfer.from),
    To: toDisplayString(transfer.to),
    Product: toDisplayString(transfer.product),
    Quantity: transfer.qty ?? '',
    Status: transfer.status ?? '',
    'Requested by': formatUserLabel(transfer.requestedBy),
    Notes: transfer.notes ?? '',
  };
}

/**
 * @param {object} options
 * @param {Array} options.transfers - scoped transfer list
 * @param {string} options.roleLabel
 * @param {object} [options.kpis]
 * @param {Array} [options.byBranch]
 * @param {Array} [options.byStatus]
 * @param {object} [options.pipeline]
 */
export function buildStockTransferReportMeta({
  transfers,
  roleLabel,
  kpis = {},
  byBranch = [],
  byStatus = [],
  pipeline = {},
}) {
  const generatedAt = new Date().toLocaleString();
  const totalUnits = transfers.reduce((sum, t) => sum + (Number(t.qty) || 0), 0);

  return {
    title: 'Stock Transfer Report',
    generatedAt,
    roleLabel,
    transfers,
    exportRows: transfers.map(transferToExportRow),
    summary: {
      'Total transfers': transfers.length,
      'Total units': totalUnits,
      'In transit': kpis.inTransit ?? 0,
      Pending: kpis.pending ?? 0,
      Completed: kpis.completed ?? 0,
      'Low-stock lines': kpis.lowStock ?? 0,
      'Pending (pipeline)': pipeline.Pending ?? 0,
      'Approved (pipeline)': pipeline.Approved ?? 0,
      'In transit (pipeline)': pipeline['In Transit'] ?? 0,
      Rejected: pipeline.Rejected ?? 0,
    },
    byBranch,
    byStatus,
  };
}

export function exportStockTransferExcel(report) {
  const lines = [];
  const push = (...rows) => lines.push(...rows);

  push(['Stock Transfer Report']);
  push([`Generated`, report.generatedAt]);
  push([`Role`, report.roleLabel]);
  push([]);

  push(['Summary']);
  push(['Metric', 'Value']);
  Object.entries(report.summary).forEach(([key, value]) => {
    push([key, value]);
  });
  push([]);

  if (report.byBranch?.length) {
    push(['Transfers by branch']);
    push(['Branch', 'Transfers', 'Units']);
    report.byBranch.forEach((row) => {
      push([row.branch ?? '', row.transfers ?? 0, row.units ?? 0]);
    });
    push([]);
  }

  if (report.byStatus?.length) {
    push(['Transfers by status']);
    push(['Status', 'Count']);
    report.byStatus.forEach((row) => {
      push([row.name ?? '', row.value ?? 0]);
    });
    push([]);
  }

  const headers = [
    'Transfer ID',
    'Date',
    'From',
    'To',
    'Product',
    'Quantity',
    'Status',
    'Requested by',
    'Notes',
  ];
  push(['Transfer details']);
  push(headers);
  report.exportRows.forEach((row) => {
    push(headers.map((h) => row[h] ?? ''));
  });

  const csv = `\ufeff${lines.map(rowToCsv).join('\n')}`;
  const stamp = new Date().toISOString().slice(0, 10);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `stock-transfers-${stamp}.csv`);
  return report.exportRows.length;
}

function buildReportHtml(report) {
  const summaryRows = Object.entries(report.summary)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 10px;border:1px solid #e2e8f0;font-weight:600">${escapeHtml(k)}</td><td style="padding:6px 10px;border:1px solid #e2e8f0">${escapeHtml(v)}</td></tr>`,
    )
    .join('');

  const branchRows = (report.byBranch ?? [])
    .map(
      (r) =>
        `<tr><td style="padding:6px 10px;border:1px solid #e2e8f0">${escapeHtml(r.branch)}</td><td style="padding:6px 10px;border:1px solid #e2e8f0;text-align:right">${escapeHtml(r.transfers)}</td><td style="padding:6px 10px;border:1px solid #e2e8f0;text-align:right">${escapeHtml(r.units)}</td></tr>`,
    )
    .join('');

  const statusRows = (report.byStatus ?? [])
    .map(
      (r) =>
        `<tr><td style="padding:6px 10px;border:1px solid #e2e8f0">${escapeHtml(r.name)}</td><td style="padding:6px 10px;border:1px solid #e2e8f0;text-align:right">${escapeHtml(r.value)}</td></tr>`,
    )
    .join('');

  const headers = EXPORT_HEADERS;
  const detailHead = headers
    .map(
      (h) =>
        `<th style="padding:8px 10px;border:1px solid #cbd5e1;background:#f1f5f9;text-align:left;font-size:11px">${escapeHtml(h)}</th>`,
    )
    .join('');
  const detailBody = report.exportRows
    .map(
      (row) =>
        `<tr>${headers.map((h) => `<td style="padding:6px 10px;border:1px solid #e2e8f0;font-size:11px">${escapeHtml(row[h])}</td>`).join('')}</tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${report.title}</title>
  <style>
    body { font-family: system-ui, Segoe UI, sans-serif; color: #0f172a; margin: 24px; }
    h1 { font-size: 20px; margin: 0 0 4px; }
    p.meta { color: #64748b; font-size: 12px; margin: 0 0 20px; }
    h2 { font-size: 14px; margin: 20px 0 8px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    @media print { body { margin: 12px; } }
  </style>
</head>
<body>
  <h1>${escapeHtml(report.title)}</h1>
  <p class="meta">Generated ${escapeHtml(report.generatedAt)} · ${escapeHtml(report.roleLabel)} · ${report.exportRows.length} transfer(s)</p>
  <p class="meta" style="margin-top:8px">Use your browser print dialog and choose &quot;Save as PDF&quot;.</p>

  <h2>Summary</h2>
  <table>${summaryRows}</table>

  ${branchRows ? `<h2>By branch</h2><table><thead><tr><th style="padding:8px 10px;border:1px solid #cbd5e1;background:#f1f5f9;text-align:left">Branch</th><th style="padding:8px 10px;border:1px solid #cbd5e1;background:#f1f5f9">Transfers</th><th style="padding:8px 10px;border:1px solid #cbd5e1;background:#f1f5f9">Units</th></tr></thead><tbody>${branchRows}</tbody></table>` : ''}

  ${statusRows ? `<h2>By status</h2><table><thead><tr><th style="padding:8px 10px;border:1px solid #cbd5e1;background:#f1f5f9;text-align:left">Status</th><th style="padding:8px 10px;border:1px solid #cbd5e1;background:#f1f5f9">Count</th></tr></thead><tbody>${statusRows}</tbody></table>` : ''}

  <h2>Transfer details</h2>
  <table><thead><tr>${detailHead}</tr></thead><tbody>${detailBody || '<tr><td colspan="' + headers.length + '" style="padding:12px">No transfers in scope</td></tr>'}</tbody></table>
</body>
</html>`;
}

export function exportStockTransferPdf(report) {
  const html = buildReportHtml(report);
  const stamp = new Date().toISOString().slice(0, 10);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const blobUrl = URL.createObjectURL(blob);

  // Prefer blob URL tab (avoids about:blank from document.write on empty window)
  const popup = window.open(blobUrl, '_blank');
  if (popup) {
    const schedulePrint = () => {
      window.setTimeout(() => {
        try {
          popup.focus();
          popup.print();
        } catch {
          /* print may fail cross-origin in edge cases */
        }
      }, 500);
    };
    popup.addEventListener('load', schedulePrint);
    window.setTimeout(schedulePrint, 800);
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 120_000);
    return { count: report.exportRows.length, mode: 'tab' };
  }

  URL.revokeObjectURL(blobUrl);

  // Pop-up blocked: print in hidden iframe on same page
  try {
    printHtmlReport(html);
    return { count: report.exportRows.length, mode: 'print' };
  } catch {
    downloadBlob(blob, `stock-transfers-${stamp}.html`);
    return { count: report.exportRows.length, mode: 'html' };
  }
}
