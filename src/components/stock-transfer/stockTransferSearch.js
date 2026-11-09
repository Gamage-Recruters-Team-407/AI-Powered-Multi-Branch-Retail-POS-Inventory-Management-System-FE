import { formatUserLabel, toDisplayString } from '../../services/stockTransferApi';

/** Normalize query for case-insensitive substring match */
export function normalizeSearchQuery(query) {
  return String(query ?? '').trim().toLowerCase();
}

/** True when query empty or any part contains query */
export function haystackIncludes(parts, query) {
  const q = normalizeSearchQuery(query);
  if (!q) return true;
  const haystack = parts
    .map((v) => String(v ?? '').toLowerCase())
    .join(' ');
  return haystack.includes(q);
}

export function matchesTransferSearch(transfer, query) {
  if (!transfer) return false;
  return haystackIncludes(
    [
      transfer.id,
      transfer._id,
      transfer.product,
      transfer.sku,
      transfer.from,
      transfer.to,
      transfer.fromBranchId,
      transfer.toBranchId,
      transfer.status,
      transfer.rawStatus,
      formatUserLabel(transfer.requestedBy),
      transfer.requestedBy,
      transfer.notes,
      transfer.rejectReason,
      transfer.date,
      transfer.eta,
      transfer.qty,
    ],
    query,
  );
}

export function matchesStockRowSearch(row, query) {
  if (!row) return false;
  return haystackIncludes(
    [
      row.sku,
      row.productName,
      row.branch,
      row.productId,
      row.unit,
      row.qty,
    ],
    query,
  );
}

export function matchesMovementLogSearch(log, query, transferRefMap = new Map()) {
  if (!log) return false;
  const refKey = log.transferKey ?? log.transferId ?? log.transfer?._id;
  const ref =
    transferRefMap.get(String(refKey)) ??
    toDisplayString(log.transferNumber ?? log.transferId ?? refKey, '');

  return haystackIncludes(
    [
      ref,
      log.transferId,
      log.transferNumber,
      log.productName,
      log.branchName,
      log.type,
      log.eventType,
      log.changedBy,
      log.user,
      log.note,
      log.notes,
      log.quantity,
      log.qty,
    ],
    query,
  );
}
