import { useEffect, useState } from 'react';
import { FiSave, FiX } from 'react-icons/fi';

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
    <form className="st-edit-panel" onSubmit={handleSubmit}>
      <p className="st-edit-panel-title">
        {isResubmit ? 'Edit & resubmit to admin' : 'Edit request'}
      </p>
      {transfer.rejectReason ? (
        <p className="st-edit-reject-note">
          <strong>Rejection reason:</strong> {transfer.rejectReason}
        </p>
      ) : null}
      <div className="st-form-grid st-edit-grid">
        <label>
          From branch
          <select
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
        <label>
          To branch
          <select
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
        <label>
          Product
          <select
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
        <label>
          Quantity
          <input
            type="number"
            min="1"
            value={form.quantity}
            onChange={(e) =>
              setForm((p) => ({ ...p, quantity: e.target.value }))
            }
            required
          />
        </label>
        <label className="full">
          Notes
          <textarea
            rows={2}
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
          />
        </label>
        <p className="full st-edit-stock-hint">
          Available at source: <strong>{availableQty}</strong>
        </p>
      </div>
      <div className="st-btn-row">
        <button type="submit" className="st-btn primary" disabled={saving}>
          <FiSave aria-hidden="true" />
          {saving
            ? 'Saving…'
            : isResubmit
              ? 'Save & resubmit'
              : 'Save changes'}
        </button>
        <button type="button" className="st-btn ghost" onClick={onCancel}>
          <FiX aria-hidden="true" />
          Cancel
        </button>
      </div>
    </form>
  );
}

export default TransferEditPanel;
