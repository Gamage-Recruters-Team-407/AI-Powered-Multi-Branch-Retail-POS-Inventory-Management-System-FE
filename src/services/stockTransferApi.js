import api from '../api/axiosInstance';
import { getAllBranches } from './branchApi';
import { getAllProducts, getActiveProducts } from './productManagementApi';

/** Unwrap { success, data } or return raw payload */
export const unwrap = (response) => {
  const body = response?.data ?? response;
  if (body && typeof body === 'object' && 'success' in body) {
    return body.data;
  }
  return body;
};

export const unwrapList = (response) => {
  const data = unwrap(response);
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== 'object') return [];

  const nestedKeys = [
    'branches',
    'products',
    'transfers',
    'items',
    'movements',
    'movementHistory',
    'movementLogs',
    'activityLogs',
    'logs',
    'history',
    'inventory',
    'docs',
    'results',
    'records',
    'data',
  ];

  for (const key of nestedKeys) {
    if (Array.isArray(data[key])) return data[key];
  }

  return [];
};

/** Coerce API values (objects, ObjectIds) to safe React display strings */
export const toDisplayString = (value, fallback = '—') => {
  if (value == null || value === '') return fallback;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);

  if (typeof value === 'object') {
    const nested =
      value.name ??
      value.fullName ??
      value.label ??
      value.title ??
      value.transferNumber ??
      value.reference ??
      value.email ??
      value.username ??
      value.productName;
    if (nested != null && typeof nested !== 'object') {
      return String(nested);
    }
    if (value._id != null) return String(value._id);
    if (value.id != null && typeof value.id !== 'object') return String(value.id);
    return fallback;
  }

  return String(value);
};

const MONGO_ID_RE = /^[a-f\d]{24}$/i;

/** Human-readable transfer reference (maps DB id → TRF number when known) */
export const formatTransferReference = (rawId, transferMap = new Map()) => {
  const id = toDisplayString(rawId, '');
  if (!id || id === '—') return '—';
  if (transferMap.has(id)) return transferMap.get(id);
  if (/^(TRF|TR-|ST-)/i.test(id)) return id;
  if (MONGO_ID_RE.test(id)) return `TRF-${id.slice(-6).toUpperCase()}`;
  if (id.length > 14) return `TRF-${id.slice(-6).toUpperCase()}`;
  return id;
};

/** Shorter, friendly user label from email or name */
export const formatUserLabel = (value) => {
  const s = toDisplayString(value, '—');
  if (s === '—') return s;
  if (s.includes('@')) {
    const local = s.split('@')[0];
    return local
      .replace(/[._-]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();
  }
  return s;
};

/** Event badge label + tone for movement logs */
export const formatEventType = (type) => {
  const t = String(type || '').toUpperCase();
  if (t === 'IN' || t.includes('RECEIV') || t.includes('INBOUND') || t.includes('COMPLETE')) {
    return { label: 'Stock In', tone: 'in' };
  }
  if (t === 'OUT' || t.includes('DISPAT') || t.includes('OUTBOUND') || t.includes('SENT')) {
    return { label: 'Stock Out', tone: 'out' };
  }
  if (t.includes('PEND') || t.includes('REQUEST')) {
    return { label: 'Requested', tone: 'pending' };
  }
  if (t.includes('APPROV')) {
    return { label: 'Approved', tone: 'approved' };
  }
  if (t.includes('CANCEL') || t.includes('REJECT')) {
    return { label: toDisplayString(type, 'Update'), tone: 'muted' };
  }
  return { label: toDisplayString(type, 'Update'), tone: 'neutral' };
};

export const formatLogDate = (value) => {
  const raw = toDisplayString(value, '');
  if (!raw || raw === '—') return '—';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw.slice(0, 10);
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const getApiErrorMessage = (error, fallback = 'Request failed') => {
  const data = error?.response?.data;
  if (typeof data?.message === 'string') return data.message;
  if (Array.isArray(data?.errors)) return data.errors.join(', ');
  if (typeof data?.error === 'string') return data.error;
  return error?.message || fallback;
};

/** Backend status → UI label */
export const mapStatusToUi = (status) => {
  const map = {
    PENDING: 'Pending',
    APPROVED: 'Approved',
    IN_TRANSIT: 'In Transit',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
    REJECTED: 'Rejected',
  };
  return map[status] ?? status ?? 'Pending';
};

/** UI / filter label → API query param */
export const mapStatusToApi = (status) => {
  const map = {
    Pending: 'PENDING',
    Approved: 'APPROVED',
    'In Transit': 'IN_TRANSIT',
    Completed: 'COMPLETED',
    Cancelled: 'CANCELLED',
    Rejected: 'REJECTED',
  };
  return map[status] ?? status;
};

export const normalizeBranch = (branch) => ({
  id: String(branch._id ?? branch.id ?? ''),
  name: branch.name ?? branch.branchName ?? 'Branch',
});

export const normalizeProduct = (product) => ({
  id: String(product._id ?? product.id ?? ''),
  sku: product.sku ?? product.barcode ?? '',
  name: product.name ?? product.productName ?? 'Product',
  unit: product.unit ?? product.uom ?? 'units',
});

export const normalizeTransfer = (transfer) => {
  const from = toDisplayString(
    transfer.fromBranch?.name ??
      transfer.fromBranchName ??
      transfer.fromBranch,
    '—',
  );
  const to = toDisplayString(
    transfer.toBranch?.name ??
      transfer.toBranchName ??
      transfer.toBranch,
    '—',
  );

  const items = transfer.items ?? [];
  const totalQty = items.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
  const first = items[0];
  const productRef = first?.product;

  const productLabel =
    typeof productRef === 'object'
      ? toDisplayString(productRef?.name ?? productRef, '—')
      : toDisplayString(
          first?.productName ?? productRef ?? first?.product,
          items.length > 1 ? `${items.length} products` : '—',
        );

  return {
    _id: transfer._id ?? transfer.id,
    id: toDisplayString(
      transfer.transferNumber ??
        transfer.reference ??
        transfer.transferId ??
        transfer._id,
      'TRF-PENDING',
    ),
    product: productLabel,
    sku:
      typeof productRef === 'object'
        ? toDisplayString(productRef?.sku ?? productRef?.barcode, '')
        : '',
    productId:
      typeof productRef === 'object'
        ? String(productRef?._id ?? productRef?.id ?? '')
        : String(productRef ?? first?.product ?? ''),
    from,
    to,
    fromBranchId: String(
      transfer.fromBranch?._id ??
        (typeof transfer.fromBranch === 'string' ? transfer.fromBranch : '') ??
        '',
    ),
    toBranchId: String(
      transfer.toBranch?._id ??
        (typeof transfer.toBranch === 'string' ? transfer.toBranch : '') ??
        '',
    ),
    qty: totalQty,
    items,
    status: mapStatusToUi(transfer.status ?? 'PENDING'),
    rawStatus: transfer.status,
    createdById: String(
      transfer.createdBy?._id ??
        transfer.createdBy ??
        transfer.requestedById ??
        '',
    ),
    requestedBy: toDisplayString(
      transfer.createdBy ?? transfer.requestedBy ?? transfer.createdByUser,
      '—',
    ),
    date: (transfer.createdAt ?? transfer.date ?? '').toString().slice(0, 10),
    eta: (transfer.expectedDeliveryDate ?? transfer.eta ?? transfer.updatedAt ?? '')
      .toString()
      .slice(0, 10),
    notes: toDisplayString(transfer.notes, ''),
    rejectReason: toDisplayString(
      transfer.rejectReason ?? transfer.rejectionReason ?? transfer.reason,
      '',
    ),
    activityLogs: transfer.activityLogs ?? transfer.movementHistory ?? [],
    actions: transfer.actions ?? null,
  };
};

export const normalizeStockRow = (row, branchName) => {
  const productRef = row.product;
  const productObj =
    productRef && typeof productRef === 'object' ? productRef : null;
  const productId = productObj
    ? String(productObj._id ?? productObj.id ?? '')
    : String(row.productId ?? row.product ?? productRef ?? '');

  return {
    sku: productObj?.sku ?? productObj?.barcode ?? row.sku ?? '—',
    productId,
    branch: branchName,
    qty: row.quantity ?? row.qty ?? row.stock ?? row.availableQuantity ?? 0,
    reorder:
      row.reorderPoint ??
      row.reorderLevel ??
      row.minimumStock ??
      row.minStock ??
      0,
    productName: productObj?.name ?? row.productName ?? 'Product',
    unit: productObj?.unit ?? 'units',
  };
};

const uniqueById = (items, getId) => {
  const seen = new Set();
  return items.filter((item) => {
    const id = getId(item);
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
};

/** Load branches from main API, then branch service fallback */
export const getBranches = async () => {
  try {
    const res = await api.get('/branches');
    const list = unwrapList(res).map(normalizeBranch).filter((b) => b.id);
    if (list.length) return list;
  } catch {
    // try branch API module
  }

  try {
    const res = await getAllBranches();
    const list = unwrapList(res).map(normalizeBranch).filter((b) => b.id);
    if (list.length) return list;
  } catch {
    return [];
  }

  return [];
};

/** Load products from catalog and inventory endpoints */
export const getProducts = async () => {
  const collected = [];

  const addFromRows = (rows) => {
    for (const row of rows) {
      if (row?.product && typeof row.product === 'object') {
        collected.push(normalizeProduct(row.product));
      } else if (row?.name || row?._id || row?.id) {
        collected.push(normalizeProduct(row));
      }
    }
  };

  const attempts = [
    () => api.get('/products'),
    () => api.get('/products/status/active'),
    () => api.get('/inventory', { params: { limit: 500 } }),
  ];

  for (const request of attempts) {
    try {
      const res = await request();
      addFromRows(unwrapList(res));
    } catch {
      // next endpoint
    }
  }

  try {
    const res = await getAllProducts();
    addFromRows(unwrapList(res));
  } catch {
    // optional product API URL
  }

  try {
    const res = await getActiveProducts();
    addFromRows(unwrapList(res));
  } catch {
    // optional active products route
  }

  return uniqueById(collected, (p) => p.id);
};

/** Branch inventory for availability checks */
export const getBranchInventory = async (branchId) => {
  if (!branchId) return [];

  const attempts = [
    () => api.get(`/branches/${branchId}/inventory`),
    () => api.get('/inventory', { params: { branch: branchId, limit: 500 } }),
    () => api.get('/inventory', { params: { branchId, limit: 500 } }),
  ];

  for (const request of attempts) {
    try {
      const list = unwrapList(await request());
      if (list.length) return list;
    } catch {
      // next endpoint
    }
  }

  return [];
};

// ——— Stock transfers ———

export const listTransfers = (params = {}) =>
  api.get('/stock-transfers', { params }).then((res) => {
    const body = res.data ?? {};
    const data = unwrap(res);
    const items = Array.isArray(data)
      ? data
      : unwrapList(res);
    return {
      items: items.map(normalizeTransfer),
      permissions: body.permissions ?? (data && !Array.isArray(data) ? data.permissions : null) ?? null,
      summary: body.summary ?? null,
      pagination: body.pagination ?? data?.pagination,
    };
  });

/** Role permissions from backend (admin / manager / cashier) */
export const getTransferPermissions = () =>
  api.get('/stock-transfers/permissions').then((res) => {
    const data = unwrap(res);
    return data?.permissions ?? data;
  });

/** Branch stock for availability tab */
export const getBranchStockAvailability = (branchId) =>
  api
    .get('/stock-transfers/availability', {
      params: branchId ? { branchId } : {},
    })
    .then((res) => {
      const rows = unwrapList(res);
      const branchName =
        rows[0]?.branchName ??
        rows[0]?.branch?.name ??
        '';
      return rows.map((row) =>
        normalizeStockRow(
          {
            product: row.productId
              ? { _id: row.productId, name: row.name, sku: row.sku ?? row.barcode }
              : row,
            quantity: row.availableQuantity ?? row.quantity,
            reorderPoint: row.lowStockAlert ? 1 : 0,
          },
          row.branchName ?? branchName,
        ),
      );
    });

/** Admin transfer activity logs */
export const getTransferActivityLogs = (params = {}) =>
  api.get('/stock-transfers/logs', { params }).then((res) => {
    const rows = unwrapList(res);
    return rows.map((row) =>
      normalizeMovementLog(
        {
          status: row.logStatus ?? row.status,
          note: row.note,
          changedBy: row.changedBy,
          changedAt: row.changedAt,
          type: row.logStatus ?? 'Activity',
        },
        row.transferId
          ? {
              _id: row.transferId,
              from: row.fromBranch?.name,
              to: row.toBranch?.name,
              status: mapStatusToUi(row.status),
            }
          : null,
      ),
    );
  });

/** Manager / admin branch transfer reports */
export const getBranchTransferReports = (params = {}) =>
  api.get('/stock-transfers/reports/by-branch', { params }).then((res) => unwrap(res));

export const getTransferById = (id) =>
  api.get(`/stock-transfers/${id}`).then((res) => normalizeTransfer(unwrap(res)));

/** Payload for manager-created transfer requests (always starts Pending) */
export const buildCreateTransferPayload = ({
  fromBranchId,
  toBranchId,
  productId,
  quantity,
  notes,
}) => {
  const qty = Number(quantity);
  const product = String(productId);
  const fromBranch = String(fromBranchId);
  const toBranch = String(toBranchId);

  return {
    fromBranch,
    toBranch,
    items: [{ product, quantity: qty }],
    notes: notes || undefined,
  };
};

export const createTransfer = async (input) => {
  const body =
    input?.fromBranch && input?.items?.length
      ? input
      : buildCreateTransferPayload(input);
  const res = await api.post('/stock-transfers', body);
  const normalized = normalizeTransfer(unwrap(res));
  if (normalized.status === 'Pending') return normalized;
  return { ...normalized, status: 'Pending', rawStatus: 'PENDING' };
};

const buildUpdateBody = (payload) => ({
  fromBranch: payload.fromBranch,
  toBranch: payload.toBranch,
  fromBranchId: payload.fromBranch,
  toBranchId: payload.toBranch,
  items: payload.items,
  notes: payload.notes,
  ...(payload.status ? { status: mapStatusToApi(payload.status) ?? payload.status } : {}),
});

/** Update transfer request (manager edit / resubmit) */
export const updateTransfer = async (id, payload) => {
  const body = buildUpdateBody(payload);
  const attempts = [
    () => api.patch(`/stock-transfers/${id}`, body),
    () => api.put(`/stock-transfers/${id}`, body),
  ];

  for (const request of attempts) {
    try {
      const res = await request();
      return normalizeTransfer(unwrap(res));
    } catch (err) {
      if (![404, 405, 501].includes(err.response?.status)) throw err;
    }
  }

  throw new Error('Transfer update API is not available on the server.');
};

/** Rejected → Pending after manager fixes request */
export const resubmitTransfer = async (id, payload) => {
  const body = buildUpdateBody({ ...payload, status: 'Pending' });
  try {
    const res = await api.patch(`/stock-transfers/${id}/resubmit`, body);
    return normalizeTransfer(unwrap(res));
  } catch (err) {
    if ([404, 405, 501].includes(err.response?.status)) {
      return updateTransfer(id, { ...payload, status: 'Pending' });
    }
    throw err;
  }
};

export const approveTransfer = (id) =>
  api.patch(`/stock-transfers/${id}/approve`).then((res) => normalizeTransfer(unwrap(res)));

export const rejectTransfer = (id, reason) =>
  api
    .patch(`/stock-transfers/${id}/reject`, { reason, rejectReason: reason })
    .then((res) => normalizeTransfer(unwrap(res)));

/** Admin approve → optional dispatch (deduct source stock, in transit) */
export const approveAndDispatchTransfer = async (id) => {
  let transfer;
  try {
    transfer = await approveTransfer(id);
  } catch (err) {
    if (err.response?.status === 404 || err.response?.status === 405) {
      transfer = await dispatchTransfer(id);
      return transfer;
    }
    throw err;
  }

  if (transfer.status === 'Approved' || transfer.rawStatus === 'APPROVED') {
    try {
      transfer = await dispatchTransfer(id);
    } catch {
      // approve succeeded; dispatch may be automatic on backend
    }
  } else if (transfer.status === 'Pending') {
    transfer = await dispatchTransfer(id);
  }
  return transfer;
};

export const dispatchTransfer = (id) =>
  api.patch(`/stock-transfers/${id}/dispatch`).then((res) => normalizeTransfer(unwrap(res)));

export const completeTransfer = (id) =>
  api.patch(`/stock-transfers/${id}/complete`).then((res) => normalizeTransfer(unwrap(res)));

export const cancelTransfer = (id, cancelReason) =>
  api
    .patch(`/stock-transfers/${id}/cancel`, { cancelReason })
    .then((res) => normalizeTransfer(unwrap(res)));

export const normalizeMovementLog = (log, transfer = null) => {
  const changedAt = log.changedAt ?? log.createdAt ?? log.date ?? transfer?.date ?? '';
  const route =
    transfer?.from && transfer?.to
      ? `${toDisplayString(transfer.from)} → ${toDisplayString(transfer.to)}`
      : '—';

  const rawTransferKey = String(
    log.transfer?._id ??
      log.transferId ??
      (typeof log.transfer === 'string' ? log.transfer : '') ??
      transfer?._id ??
      '',
  );

  return {
    _id: String(
      log._id ??
        log.id ??
        `${transfer?.id ?? 'tr'}-${changedAt}-${log.status ?? log.type ?? 'log'}`,
    ),
    createdAt: String(changedAt).slice(0, 10),
    transferKey: rawTransferKey,
    transferId: toDisplayString(
      transfer?.id ??
        log.transfer?.transferNumber ??
        log.transfer?.reference ??
        log.transferId ??
        log.transfer,
      '—',
    ),
    productName: toDisplayString(
      log.product ?? log.productName ?? transfer?.product,
      '—',
    ),
    branchName: toDisplayString(
      log.branch ?? log.branchName ?? log.fromBranch ?? log.toBranch,
      route,
    ),
    quantity: toDisplayString(log.quantity ?? log.qty ?? transfer?.qty, '—'),
    type: toDisplayString(
      log.type ?? log.movementType ?? log.action ?? log.status,
      'Activity',
    ),
    note: toDisplayString(log.note ?? log.message ?? log.description, ''),
    changedBy: toDisplayString(
      log.changedBy ?? log.user ?? log.performedBy ?? log.userName,
      '—',
    ),
  };
};

/** Attach friendly transfer numbers from loaded transfers list */
export const enrichMovementLogs = (logs = [], transfers = []) => {
  const map = new Map();
  transfers.forEach((t) => {
    if (t._id) map.set(String(t._id), t.id);
  });
  return logs.map((log) => {
    const key = log.transferKey ?? log.transferId;
    const friendly = key ? map.get(String(key)) : null;
    if (!friendly) return log;
    return { ...log, transferId: friendly };
  });
};

/** Build log rows from transfer register when movements API is empty */
export const buildLogsFromTransfers = (transfers = []) => {
  const rows = [];

  transfers.forEach((transfer) => {
    const activityLogs = transfer.activityLogs ?? [];
    if (activityLogs.length) {
      activityLogs.forEach((log) => {
        rows.push(normalizeMovementLog(log, transfer));
      });
    } else {
      rows.push(
        normalizeMovementLog(
          {
            status: transfer.status,
            note: transfer.notes || `Transfer ${transfer.status}`,
            changedBy: transfer.requestedBy,
            changedAt: transfer.date,
          },
          transfer,
        ),
      );
    }
  });

  return rows.sort((a, b) =>
    String(b.createdAt).localeCompare(String(a.createdAt)),
  );
};

const ensureLogArray = (value) => (Array.isArray(value) ? value : []);

const MOVEMENT_HISTORY_TIMEOUT_MS = 6000;

/** Movement / activity log history with endpoint fallbacks */
export const getMovementHistory = async (params = {}) => {
  const endpoints = [
    '/stock-transfers/movements/history',
    '/stock-transfers/movements',
    '/stock-transfers/logs',
  ];

  for (const path of endpoints) {
    try {
      const res = await api.get(path, {
        params,
        timeout: MOVEMENT_HISTORY_TIMEOUT_MS,
      });
      const list = ensureLogArray(unwrapList(res));
      if (list.length) {
        return list.map((log) => normalizeMovementLog(log));
      }
    } catch {
      // try next path
    }
  }

  return [];
};

export const getTransferAnalytics = (params = {}) =>
  api.get('/stock-transfers/analytics/summary', { params }).then((res) => {
    const data = unwrap(res) ?? res.data ?? {};
    const statusSummary = {};
    const rawStatus = data.statusSummary ?? [];
    if (Array.isArray(rawStatus)) {
      rawStatus.forEach((row) => {
        const key = mapStatusToUi(row._id ?? row.status);
        statusSummary[key] = row.count ?? 0;
      });
    }
    return {
      ...data,
      statusSummary,
      volumeSummary: data.volumeSummary,
    };
  });
