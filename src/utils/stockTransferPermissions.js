/** Normalize app / API role strings */
export const normalizeStockRole = (role) => {
  const r = String(role || '')
    .toLowerCase()
    .replace(/\s+/g, '_');
  if (r === 'super_admin' || r === 'superadmin' || r === 'administrator') return 'admin';
  if (r === 'admin' || r === 'admins') return 'admin';
  return r;
};

export const getStockTransferPermissions = (role) => {
  const r = normalizeStockRole(role);
  const isAdmin = r === 'admin';
  const isManager = r === 'manager';
  const isCashier = r === 'cashier';

  return {
    role: r,
    label: isAdmin ? 'Admin' : isManager ? 'Manager' : isCashier ? 'Cashier' : r,
    canCreateTransfer: isManager,
    canApproveTransfer: isAdmin,
    canRejectTransfer: isAdmin,
    canCancelTransfer: isAdmin,
    canDispatchTransfer: isAdmin,
    canConfirmReceipt: isManager,
    canEditTransfer: isManager,
    canTrackAllProgress: isAdmin,
    canViewAnalytics: isAdmin,
    canViewTransferLogs: isAdmin || isManager,
    canViewAllBranches: isAdmin,
    canViewBranchReports: isAdmin || isManager,
    viewScope: isAdmin ? 'all' : 'branch',
    tabs: {
      request: isManager,
      tracking: true,
      availability: true,
      history: true,
      reports: isAdmin || isManager,
      logs: isAdmin || isManager,
    },
    defaultTab: isAdmin ? 'tracking' : isManager ? 'request' : 'tracking',
  };
};

export const getUserBranchIds = (user, branches = []) => {
  const raw = user?.branchId ?? user?.branch?._id ?? user?.branch;
  if (raw == null || raw === '') return [];

  const str = String(raw);
  const byId = branches.find((b) => b.id === str);
  if (byId) return [byId.id];

  const byName = branches.find(
    (b) => b.name?.toLowerCase() === str.toLowerCase(),
  );
  if (byName) return [byName.id];

  return [str];
};

export const getUserBranchNames = (user, branches = []) => {
  const ids = getUserBranchIds(user, branches);
  return ids
    .map((id) => branches.find((b) => b.id === id)?.name)
    .filter(Boolean);
};

/** Whether a transfer involves the user's branch (from or to) */
export const transferTouchesBranch = (transfer, userBranchIds, branches = []) => {
  if (!userBranchIds?.length) return false;

  const idSet = new Set(userBranchIds.map(String));
  const nameSet = new Set(
    userBranchIds
      .map((id) => branches.find((b) => b.id === id)?.name)
      .filter(Boolean),
  );

  return (
    idSet.has(String(transfer.fromBranchId)) ||
    idSet.has(String(transfer.toBranchId)) ||
    nameSet.has(transfer.from) ||
    nameSet.has(transfer.to)
  );
};

export const filterTransfersByScope = (transfers, perms, userBranchIds, branches) => {
  if (perms.viewScope === 'all') return transfers;
  // Manager/cashier without branch on profile — don't hide everything
  if (!userBranchIds?.length) return transfers;
  return transfers.filter((t) =>
    transferTouchesBranch(t, userBranchIds, branches),
  );
};

/** Destination manager confirms receipt */
export const canConfirmReceipt = (transfer, perms, userBranchIds, branches) => {
  if (!perms.canConfirmReceipt) return false;
  if (transfer.status !== 'In Transit') return false;

  const destId = String(transfer.toBranchId ?? '');
  const destName = transfer.to;
  return userBranchIds.some((id) => {
    if (destId && String(id) === destId) return true;
    const name = branches.find((b) => b.id === id)?.name;
    return name && name === destName;
  });
};

/** Admin reviews manager-submitted requests */
export const canReviewPendingTransfer = (transfer, perms) =>
  perms.canApproveTransfer && transfer.status === 'Pending';

export const canCancelTransfer = (transfer, perms) => {
  if (!perms.canCancelTransfer) return false;
  return !['Completed', 'Cancelled', 'Rejected'].includes(transfer.status);
};

/** Manager may edit while Pending or after Rejected (fix & resubmit) */
export const canEditTransfer = (transfer, perms, userBranchIds, branches) => {
  if (!perms.canEditTransfer) return false;
  if (!['Pending', 'Rejected'].includes(transfer.status)) return false;
  if (!userBranchIds?.length) return true;
  return transferTouchesBranch(transfer, userBranchIds, branches);
};

/** Active on Progress tab — includes Rejected so manager can edit/resubmit */
export const isActiveForProgressTab = (transfer, perms) => {
  if (['Completed', 'Cancelled'].includes(transfer.status)) return false;
  if (transfer.status === 'Rejected') {
    return perms.canEditTransfer || perms.canTrackAllProgress;
  }
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
