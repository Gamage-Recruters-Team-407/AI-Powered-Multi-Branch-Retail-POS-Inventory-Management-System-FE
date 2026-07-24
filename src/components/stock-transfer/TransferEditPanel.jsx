import { useEffect, useState } from 'react';
import { FiSave, FiX } from 'react-icons/fi';
import {
  transferBtnClass,
  transferBtnGhostClass,
  transferBtnPrimaryClass,
  transferFieldClass,
  transferLabelClass,
} from './StockTransferUI';
import { cn, stFieldFull, stFieldLabelText } from './stockTransferClasses';

function TransferEditPanel({
  transfer,
  branches,
  products,
  stockRows,
  onSave,
  onCancel,
  saving,
  isResubmit,
}) {
  const firstItem = transfer.items?.[0];
  const [form, setForm] = useState({
    fromBranchId: String(transfer.fromBranchId ?? ''),
    toBranchId: String(transfer.toBranchId ?? ''),
    productId: String(transfer.productId ?? firstItem?.product ?? ''),
    quantity: String(transfer.qty ?? firstItem?.quantity ?? ''),
    notes: transfer.notes ?? '',
  });

  useEffect(() => {
    setForm({
      fromBranchId: String(transfer.fromBranchId ?? ''),
      toBranchId: String(transfer.toBranchId ?? ''),
      productId: String(transfer.productId ?? firstItem?.product ?? ''),
      quantity: String(transfer.qty ?? firstItem?.quantity ?? ''),
      notes: transfer.notes ?? '',
    });
  }, [transfer._id, transfer.id]);

  const fromName = branches.find((b) => b.id === form.fromBranchId)?.name ?? '';
  const stock =
    stockRows.find(
      (s) =>
        s.branch === fromName && String(s.productId) === String(form.productId),
    ) ?? null;
  const availableQty = stock?.qty ?? 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form
      className="my-4 rounded-xl border border-blue-200/60 bg-gradient-to-b from-slate-50 to-white p-5 ring-1 ring-blue-100"
      onSubmit={handleSubmit}
    >
      <p className="mb-3 font-semibold text-slate-900">
        {isResubmit ? 'Edit & resubmit to admin' : 'Edit request'}
      </p>
      {transfer.rejectReason ? (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-900 ring-1 ring-red-100">
          <strong>Rejection reason:</strong> {transfer.rejectReason}
        </p>
      ) : null}
      <div className="mb-3 grid grid-cols-1 gap-5 sm:grid-cols-2 [&_.col-span-full]:sm:col-span-2">
        <label className={transferLabelClass}>
          <span className={stFieldLabelText}>From branch</span>
          <select
            className={transferFieldClass}
            value={form.fromBranchId}
            onChange={(e) =>
              setForm((p) => ({ ...p, fromBranchId: e.target.value }))
            }
            required
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
        <label className={transferLabelClass}>
          <span className={stFieldLabelText}>To branch</span>
          <select
            className={transferFieldClass}
            value={form.toBranchId}
            onChange={(e) =>
              setForm((p) => ({ ...p, toBranchId: e.target.value }))
            }
            required
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
        <label className={transferLabelClass}>
          <span className={stFieldLabelText}>Product</span>
          <select
            className={transferFieldClass}
            value={form.productId}
            onChange={(e) =>
              setForm((p) => ({ ...p, productId: e.target.value }))
            }
            required
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className={transferLabelClass}>
          <span className={stFieldLabelText}>Quantity</span>
          <input
            className={transferFieldClass}
            type="number"
            min="1"
            value={form.quantity}
            onChange={(e) =>
              setForm((p) => ({ ...p, quantity: e.target.value }))
            }
            required
          />
        </label>
        <label className={cn(transferLabelClass, stFieldFull)}>
          <span className={stFieldLabelText}>Notes</span>
          <textarea
            className={transferFieldClass}
            rows={2}
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
          />
        </label>
        <p className={cn(stFieldFull, 'text-sm text-slate-500')}>
          Available at source: <strong>{availableQty}</strong>
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className={`${transferBtnClass} ${transferBtnPrimaryClass}`}
          disabled={saving}
        >
          <FiSave aria-hidden="true" />
          {saving
            ? 'Saving…'
            : isResubmit
              ? 'Save & resubmit'
              : 'Save changes'}
        </button>
        <button
          type="button"
          className={`${transferBtnClass} ${transferBtnGhostClass}`}
          onClick={onCancel}
        >
          <FiX aria-hidden="true" />
          Cancel
        </button>
      </div>
    </form>
  );
}

export default TransferEditPanel;
