import { FiX, FiPrinter } from 'react-icons/fi';

const ReceiptModal = ({ isOpen, onClose, returnItem }) => {
  if (!isOpen || !returnItem) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }} className="no-print">
      <div className="glass-card" style={{
        width: '420px',
        backgroundColor: 'var(--bg-secondary)',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '90vh',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Return Receipt</h3>
          <button onClick={onClose} style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '18px',
            display: 'flex'
          }} className="btn-animate">
            <FiX />
          </button>
        </div>

        {/* Scrollable Receipt Body */}
        <div style={{
          padding: '24px 20px',
          overflowY: 'auto',
          flex: 1
        }}>
          {/* Thermal Slip Style Container */}
          <div style={{
            backgroundColor: '#fff',
            color: '#1e293b',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
            fontFamily: 'Courier, monospace',
            fontSize: '13px',
            lineHeight: '1.4'
          }} id="printable-area">
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '18px', textTransform: 'uppercase' }}>AI POS</div>
              <div>Galle Road, Colombo 03, LK</div>
              <div>Tel: +94 11 234 5678</div>
              <div style={{ margin: '8px 0', borderTop: '1px dashed #cbd5e1' }} />
              <div style={{ fontWeight: 'bold' }}>RETURN CREDIT RECEIPT</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
              <div><strong>Return ID:</strong> {returnItem.id}</div>
              <div><strong>Invoice Ref:</strong> {returnItem.invoiceId}</div>
              <div><strong>Date:</strong> {returnItem.date}</div>
              <div><strong>Branch:</strong> {returnItem.branch}</div>
              <div><strong>Customer:</strong> {returnItem.customer}</div>
            </div>

            <div style={{ borderTop: '1px dashed #cbd5e1', margin: '8px 0' }} />

            {/* Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <span>ITEM DESCRIPTION</span>
                <span>QTY x PRICE</span>
              </div>
              <div style={{ borderTop: '1px dashed #cbd5e1', margin: '4px 0' }} />
              {returnItem.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ maxWidth: '200px' }}>{item.name}</span>
                  <span>{item.qty} x LKR {item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px dashed #cbd5e1', margin: '12px 0' }} />

            {/* Calculations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'right' }}>
              <div>Refund Subtotal: LKR {(returnItem.amount / 1.12).toFixed(2)}</div>
              <div>Tax (Refunded): LKR {(returnItem.amount - (returnItem.amount / 1.12)).toFixed(2)}</div>
              <div style={{ fontSize: '15px', fontWeight: 'bold', margin: '6px 0 0 0' }}>
                TOTAL REFUND: LKR {returnItem.amount.toFixed(2)}
              </div>
            </div>

            <div style={{ borderTop: '1px dashed #cbd5e1', margin: '12px 0' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div><strong>Reason:</strong> {returnItem.reason}</div>
              <div><strong>Condition:</strong> {returnItem.condition}</div>
              <div><strong>Status:</strong> {returnItem.status.toUpperCase()}</div>
            </div>

            <div style={{ borderTop: '1px dashed #cbd5e1', margin: '16px 0' }} />

            <div style={{ textAlign: 'center', fontSize: '11px' }}>
              <div style={{ marginBottom: '8px' }}>*** Thank You ***</div>
              <div>Return authorized under standard store policy terms.</div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <button onClick={onClose} style={{
            padding: '8px 16px',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500',
            color: 'var(--text-primary)'
          }} className="btn-animate">
            Close
          </button>
          <button onClick={handlePrint} style={{
            padding: '8px 16px',
            backgroundColor: 'var(--accent-color)',
            border: 'none',
            borderRadius: '6px',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }} className="btn-animate">
            <FiPrinter /> Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
