/**
 * Stock transfer UI permissions — aligned with backend
 * Backend-AI-Retail-POS-Inventory-Management-System/src/utils/stockTransferPermissions.js
 */

export const normalizeStockRole = (role) => {
  const r = String(role || '')
    .toLowerCase()
    .replace(/\s+/g, '_');
  if (r === 'super_admin' || r === 'superadmin' || r === 'administrator') return 'admin';
  if (r === 'admin' || r === 'admins') return 'admin';
  if (
    [
      'manager',
      'branch_manager',
      'store_manager',
      'floor_manager',
      'shift_manager',
      'area_manager',
      'regional_manager',
    ].includes(r) ||
    (r.endsWith('_manager') && r !== 'admin')
  ) {
    return 'manager';
  }
  if (r === 'cashier' || r === 'cashiers' || r === 'employee' || r === 'user') {
    return 'cashier';
  }
  return r;
};

export const resolveStockTransferRole = (user) => {
  const candidates = [
    user?.role,
    user?.roleName,
    user?.userType,
    user?.employeeRole,
    user?.position,
  ];
  for (const value of candidates) {
    const normalized = normalizeStockRole(value);
    if (normalized === 'admin' || normalized === 'manager' || normalized === 'cashier') {
      return normalized;
    }
  }
  return normalizeStockRole(user?.role ?? '');
};

/** Client fallback when /stock-transfers/permissions is unavailable */
export const getStockTransferPermissions = (role) => {
  const r = normalizeStockRole(role);
  const isAdmin = r === 'admin';
  const isManager = r === 'manager';
  const isCashier = r === 'cashier';
  const canView = isAdmin || isManager || isCashier;

  return {
    role: r,
    label: isAdmin ? 'Admin' : isManager ? 'Manager' : isCashier ? 'Cashier' : r,
    isViewOnly: isCashier,
    canCreateTransfer: isManager,
    canApproveTransfer: isAdmin,
    canRejectTransfer: isAdmin,
    canDispatchTransfer: isManager,
    canAdminCancelTransfer: isAdmin,
    canCancelOwnTransfer: isManager,
    canConfirmReceipt: isManager,
    canEditTransfer: isManager,
    canTrackProgress: canView,
    canTrackAllProgress: isAdmin,
    canViewAnalytics: isAdmin || isManager || isCashier,
    canViewTransferLogs: isAdmin,
    canViewAllBranches: isAdmin,
    canViewBranchReports: isAdmin || isManager || isCashier,
    canExportReports: isAdmin || isManager || isCashier,
    viewScope: isAdmin ? 'all' : isCashier ? 'all' : 'branch',
    tabs: {
      request: isManager,
      tracking: canView,
      availability: canView,
      history: canView,
      reports: isAdmin || isManager || isCashier,
      logs: isAdmin,
    },
    defaultTab: isAdmin ? 'tracking' : isManager ? 'request' : 'tracking',
  };
};

/** Merge API permissions (source of truth) with local fallback */
export const coalescePermissions = (apiPerms, role) => {
  const fallback = getStockTransferPermissions(role);
  if (!apiPerms || typeof apiPerms !== 'object') return fallback;

  const merged = {
    ...fallback,
    ...apiPerms,
    tabs: { ...fallback.tabs, ...(apiPerms.tabs || {}) },
    defaultTab: apiPerms.defaultTab ?? fallback.defaultTab,
  };
  if (merged.role === 'manager' || fallback.role === 'manager') {
    merged.canTrackProgress = true;
    merged.canDispatchTransfer = true;
    merged.canViewBranchReports = merged.canViewBranchReports ?? true;
  }
  if (merged.role === 'cashier' || fallback.role === 'cashier') {
    merged.isViewOnly = true;
    merged.tabs = {
      ...merged.tabs,
      tracking: true,
      history: true,
      reports: true,
      availability: merged.tabs.availability !== false,
      request: false,
      logs: false,
    };
    merged.canViewBranchReports = true;
    merged.canViewAnalytics = true;
    merged.canTrackProgress = true;
    merged.canExportReports = true;
  }
  merged.canExportReports = merged.canExportReports ?? fallback.canExportReports;
  return merged;
};

export const getUserBranchIds = (user, branches = []) => {
  const raw = user?.branchId ?? user?.branch?._id ?? user?.branch;
  if (raw == null || raw === '') return [];

  if (typeof raw === 'object' && raw._id != null) {
    return [String(raw._id)];
  }

  const str = String(raw);
  const byId = branches.find((b) => String(b.id ?? b._id) === str);
  if (byId) return [String(byId.id ?? byId._id)];

  const byName = branches.find(
    (b) => b.name?.toLowerCase() === str.toLowerCase(),
  );
  if (byName) return [String(byName.id ?? byName._id)];

  return [str];
};

export const transferTouchesBranch = (transfer, userBranchIds, branches = []) => {
  if (!userBranchIds?.length) return false;

  const fromId = String(
    transfer.fromBranchId ??
      transfer.fromBranch?._id ??
      (typeof transfer.fromBranch === 'string' ? transfer.fromBranch : '') ??
      '',
  );
  const toId = String(
    transfer.toBranchId ??
      transfer.toBranch?._id ??
      (typeof transfer.toBranch === 'string' ? transfer.toBranch : '') ??
      '',
  );

  const idSet = new Set(userBranchIds.map(String));
  const nameSet = new Set(
    userBranchIds
      .map((id) => branches.find((b) => String(b.id ?? b._id) === id)?.name)
      .filter(Boolean),
  );

  return (
    (fromId && idSet.has(fromId)) ||
    (toId && idSet.has(toId)) ||
    nameSet.has(transfer.from) ||
    nameSet.has(transfer.to)
  );
};

export const filterTransfersByScope = (
  transfers,
  perms,
  userBranchIds,
  branches,
  user = null,
) => {
  if (perms.viewScope === 'all') return transfers;
  // Manager/cashier lists are scoped on the API; avoid double-filter hiding approved items
  if (perms.canCreateTransfer && !perms.canApproveTransfer) return transfers;
  if (perms.isViewOnly) return transfers;
  if (!userBranchIds?.length) return transfers;

  const scoped = transfers.filter((t) => {
    if (transferTouchesBranch(t, userBranchIds, branches)) return true;
    const creatorId = String(t.createdById ?? t.createdBy ?? '');
    const userId = String(user?._id ?? user?.id ?? '');
    return creatorId && userId && creatorId === userId;
  });
  return scoped.length ? scoped : transfers;
};

export const canConfirmReceipt = (transfer, perms, userBranchIds, branches) => {
  if (!perms.canConfirmReceipt) return false;
  if (transfer.status !== 'In Transit') return false;
  if (!userBranchIds?.length) return true;

  const destId = String(transfer.toBranchId ?? '');
  const destName = transfer.to;
  return userBranchIds.some((id) => {
    if (destId && String(id) === destId) return true;
    const name = branches.find((b) => b.id === id)?.name;
    return name && name === destName;
  });
};

export const canReviewPendingTransfer = (transfer, perms) =>
  perms.canApproveTransfer && transfer.status === 'Pending';

export const canAdminCancelTransfer = (transfer, perms) => {
  if (!perms.canAdminCancelTransfer) return false;
  return transfer.status === 'Pending';
};

export const canCancelTransfer = (transfer, perms, userBranchIds = [], branches = []) =>
  canManagerCancelOwnTransfer(transfer, perms, userBranchIds, branches) ||
  canAdminCancelTransfer(transfer, perms);

/** Manager may edit/cancel only before admin approval (PENDING) */
export const canEditTransfer = (transfer, perms) =>
  Boolean(perms.canEditTransfer) && transfer.status === 'Pending';

export const canManagerCancelOwnTransfer = (transfer, perms) =>
  Boolean(perms.canCancelOwnTransfer) && transfer.status === 'Pending';

export const canDispatchTransfer = (transfer, perms) =>
  Boolean(perms.canDispatchTransfer) && transfer.status === 'Approved';

export const isAdminProgressViewOnly = (transfer, perms) =>
  Boolean(perms.canApproveTransfer) && transfer.status !== 'Pending';

export const isManagerViewOnlyStatus = (transfer, perms) =>
  perms.canCreateTransfer &&
  !perms.canApproveTransfer &&
  ['Completed', 'Cancelled', 'Rejected'].includes(transfer.status);

/** Prefer backend `transfer.actions` when present */
export const getTransferUiActions = (transfer, perms, userBranchIds, branches) => {
  if (perms.isViewOnly) {
    return {
      showApprove: false,
      showReject: false,
      showDispatch: false,
      showConfirm: false,
      showCancel: false,
      showEdit: false,
      isProgressViewOnly: true,
    };
  }

  const api = transfer.actions;
  if (api && typeof api === 'object') {
    return {
      showApprove: Boolean(api.canApprove),
      showReject: Boolean(api.canReject),
      showDispatch: Boolean(api.canDispatch),
      showConfirm: Boolean(api.canConfirmReceipt),
      showCancel: Boolean(api.canCancel),
      showEdit: Boolean(api.canEdit),
      isProgressViewOnly: Boolean(api.isProgressViewOnly ?? api.isViewOnly),
    };
  }
  const actions = {
    showApprove: canReviewPendingTransfer(transfer, perms),
    showReject: canReviewPendingTransfer(transfer, perms),
    showDispatch: canDispatchTransfer(transfer, perms),
    showConfirm: canConfirmReceipt(transfer, perms, userBranchIds, branches),
    showCancel: canCancelTransfer(transfer, perms, userBranchIds, branches),
    showEdit: canEditTransfer(transfer, perms),
    isProgressViewOnly:
      isManagerViewOnlyStatus(transfer, perms) ||
      isAdminProgressViewOnly(transfer, perms),
  };
  const hasAction = Object.entries(actions).some(
    ([k, v]) => k.startsWith('show') && v,
  );
  if (!hasAction) {
    actions.isProgressViewOnly =
      isManagerViewOnlyStatus(transfer, perms) ||
      isAdminProgressViewOnly(transfer, perms);
  }
  return actions;
};

export const isActiveForProgressTab = (transfer, perms) => {
  if (['Completed', 'Cancelled'].includes(transfer.status)) return false;
  if (transfer.status === 'Rejected') return Boolean(perms.canTrackAllProgress);
  return true;
};

export const WORKFLOW_STEPS = ['Pending', 'Approved', 'In Transit', 'Completed'];

export const getWorkflowStepIndex = (status) => {
  if (['Cancelled', 'Rejected'].includes(status)) return -1;
  const order = {
    Pending: 0,
    Approved: 1,
    'In Transit': 2,
    Completed: 3,
  };
  return order[status] ?? 0;
};
