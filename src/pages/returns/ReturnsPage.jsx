import { useEffect, useMemo, useState } from 'react';
import { 
  FiSearch, 
  FiAlertTriangle, 
  FiCheckCircle, 
  FiRefreshCw, 
  FiTrendingDown, 
  FiLayers, 
  FiFilter, 
  FiClock, 
  FiEye,
  FiPrinter
} from 'react-icons/fi';
import ReceiptModal from '../../components/ReceiptModal';
import { createReturn, updateReturnStatus, getInvoiceById, getInvoices, getReturns } from '../../services/returnsApi';

const FALLBACK_INVOICES = [
  {
    id: 'INV-2026-004',
    customer: 'Nethmi Perera',
    branch: 'Colombo Main (HQ)',
    date: '2026-06-09',
    paymentMethod: 'Card',
    taxRate: 0.12,
    discountAmount: 8,
    items: [
      { id: 'PROD-1001', name: 'Mechanical Keyboard', qty: 1, price: 89.99, returnedQty: 0 },
      { id: 'PROD-1002', name: 'Wireless Mouse', qty: 1, price: 25.99, returnedQty: 0 }
    ]
  },
  {
    id: 'INV-2026-005',
    customer: 'Kavindu Senanayake',
    branch: 'Kandy City Mall',
    date: '2026-06-08',
    paymentMethod: 'Cash',
    taxRate: 0.08,
    discountAmount: 5,
    items: [
      { id: 'PROD-1003', name: 'Bluetooth Speaker', qty: 1, price: 45, returnedQty: 0 },
      { id: 'PROD-1004', name: 'USB-C Cable', qty: 2, price: 12.5, returnedQty: 0 }
    ]
  },
  {
    id: 'INV-2026-006',
    customer: 'Anudi Fernando',
    branch: 'Galle Harbour Rd',
    date: '2026-05-28',
    paymentMethod: 'Digital Wallet',
    taxRate: 0.1,
    discountAmount: 3,
    items: [
      { id: 'PROD-1005', name: 'Desk Lamp', qty: 1, price: 22, returnedQty: 0 },
      { id: 'PROD-1006', name: 'Notebook', qty: 3, price: 4.99, returnedQty: 0 }
    ]
  }
];

const normalizeInvoiceId = (value) => String(value ?? '').trim().toUpperCase();

const normalizeInvoice = (invoice) => ({
  ...invoice,
  id: invoice?.id || invoice?.invoiceId || '',
  items: Array.isArray(invoice?.items) ? invoice.items : [],
  taxRate: Number(invoice?.taxRate ?? 0),
  discountAmount: Number(invoice?.discountAmount ?? 0)
});

const ReturnsPage = ({ returnState, setReturnState }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchInvoiceId, setSearchInvoiceId] = useState('');
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [returnItems, setReturnItems] = useState({}); // sku -> qty to return
  const [returnReason, setReturnReason] = useState('Defective item');
  const [returnCondition, setReturnCondition] = useState('Resellable (Restock)');
  const [selectedReturnForDetails, setSelectedReturnForDetails] = useState(null);
  const [localInvoices, setLocalInvoices] = useState([]);
  const [localReturns, setLocalReturns] = useState([]);
  
  // Receipt modal state
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  // Filter state for history log
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    let cancelled = false;

    const loadReturnWorkspaceData = async () => {
      try {
        const [invoicesRes, returnsRes] = await Promise.all([getInvoices(), getReturns()]);
        const invoices = Array.isArray(invoicesRes?.data)
          ? invoicesRes.data
          : Array.isArray(invoicesRes)
            ? invoicesRes
            : [];
        const returnsData = Array.isArray(returnsRes?.data)
          ? returnsRes.data
          : Array.isArray(returnsRes)
            ? returnsRes
            : [];

        if (!cancelled) {
          setLocalInvoices(invoices.map(normalizeInvoice));
          setLocalReturns(returnsData);
        }
      } catch (error) {
        console.error('Error loading return workspace data:', error);
        if (!cancelled) {
          setLocalInvoices([]);
          setLocalReturns([]);
        }
      }
    };

    loadReturnWorkspaceData();

    return () => {
      cancelled = true;
    };
  }, []);

  const availableInvoices = useMemo(() => {
    const propInvoices = Array.isArray(returnState?.invoices)
      ? returnState.invoices.map(normalizeInvoice)
      : [];
    const mergedInvoices = [...propInvoices, ...localInvoices];
    const uniqueInvoices = new Map();

    mergedInvoices.forEach((invoice) => {
      const key = normalizeInvoiceId(invoice.id || invoice.invoiceId);
      if (key && !uniqueInvoices.has(key)) {
        uniqueInvoices.set(key, invoice);
      }
    });

    if (uniqueInvoices.size === 0) {
      FALLBACK_INVOICES.forEach((invoice) => {
        uniqueInvoices.set(normalizeInvoiceId(invoice.id), normalizeInvoice(invoice));
      });
    }

    return Array.from(uniqueInvoices.values());
  }, [localInvoices, returnState?.invoices]);

  const syncReturnState = (nextState) => {
    if (typeof setReturnState === 'function') {
      setReturnState(nextState);
      return;
    }

    if (Array.isArray(nextState?.invoices)) {
      setLocalInvoices(nextState.invoices.map(normalizeInvoice));
    }
    if (Array.isArray(nextState?.returns)) {
      setLocalReturns(nextState.returns);
    }
  };
  
  // Calculate dashboard statistics
  const returnsList = Array.isArray(returnState?.returns) && returnState.returns.length > 0
    ? returnState.returns
    : localReturns;

  const totalApprovedRefunds = returnsList
    .filter(r => r.status === 'Refunded')
    .reduce((sum, r) => sum + r.amount, 0);

  const pendingApprovalsCount = returnsList
    .filter(r => r.status === 'Pending Approval')
    .length;

  const totalRestocked = returnsList
    .filter(r => r.status === 'Refunded' && r.condition.includes('Resellable'))
    .reduce((sum, r) => sum + r.items.reduce((itemSum, item) => itemSum + item.qty, 0), 0);

  const totalDamaged = returnsList
    .filter(r => r.status === 'Refunded' && r.condition.includes('Damaged'))
    .reduce((sum, r) => sum + r.items.reduce((itemSum, item) => itemSum + item.qty, 0), 0);

  const handleInvoiceSearch = async (e) => {
    e.preventDefault();
    setSearchError('');
    setActiveInvoice(null);
    setReturnItems({});

    const normalizedSearchInvoiceId = normalizeInvoiceId(searchInvoiceId);
    const cachedInvoice = availableInvoices.find(
      inv => normalizeInvoiceId(inv.id || inv.invoiceId) === normalizedSearchInvoiceId
    );

    if (cachedInvoice) {
      setActiveInvoice(cachedInvoice);
      return;
    }

    try {
      const invoiceRes = await getInvoiceById(normalizedSearchInvoiceId);
      const apiInvoice = invoiceRes?.data ? normalizeInvoice(invoiceRes.data) : null;

      if (apiInvoice?.id) {
        setLocalInvoices((currentInvoices) => {
          const nextInvoices = [...currentInvoices];
          const existingIndex = nextInvoices.findIndex(
            (invoice) => normalizeInvoiceId(invoice.id) === normalizeInvoiceId(apiInvoice.id)
          );

          if (existingIndex >= 0) {
            nextInvoices[existingIndex] = apiInvoice;
          } else {
            nextInvoices.unshift(apiInvoice);
          }

          return nextInvoices;
        });
        setActiveInvoice(apiInvoice);
        return;
      }
    } catch (error) {
      console.error('Invoice lookup failed:', error);
    }

    setSearchError(`Invoice ID "${searchInvoiceId}" not found.`);
  };

  const handleQtyChange = (itemId, val, maxQty) => {
    const qty = Math.min(Math.max(0, parseInt(val) || 0), maxQty);
    setReturnItems({
      ...returnItems,
      [itemId]: qty
    });
  };

  // Helper to compute return window validation
  const getDaysSincePurchase = (invoiceDate) => {
    const pDate = new Date(invoiceDate);
    const diffTime = Date.now() - pDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const isReturnWindowValid = (invoiceDate) => {
    return getDaysSincePurchase(invoiceDate) <= 30;
  };

    // Create Return request
    const handleCreateReturn = async () => {
      const itemsToReturn = [];

      activeInvoice.items.forEach(item => {
        const qty = returnItems[item.id] || 0;
        if (qty > 0) {
          itemsToReturn.push({
            id: item.id,
            name: item.name,
            qty: qty,
            price: item.price
          });
        }
      });

      if (itemsToReturn.length === 0) {
        alert('Please select at least one item to return.');
        return;
      }

      const newReturn = {
        invoiceId: activeInvoice.id,
        reason: returnReason,
        condition: returnCondition,
        items: itemsToReturn
      };

      try {
        const res = await createReturn(newReturn);
        const createdReturn = res?.data || newReturn;

        const [invoicesRes, returnsRes] = await Promise.all([getInvoices(), getReturns()]);
        const refreshedInvoices = invoicesRes?.data || [];
        const refreshedReturns = returnsRes?.data || [];

        syncReturnState({
          invoices: refreshedInvoices,
          returns: refreshedReturns
        });

        setReceiptData(createdReturn);
        setIsReceiptOpen(true);
        setSelectedReturnForDetails(createdReturn);
        setActiveInvoice(null);
        setSearchInvoiceId('');
        setReturnItems({});

        alert(createdReturn.status === 'Pending Approval'
          ? 'Return request created and sent for approval.'
          : 'Refund processed successfully.'
        );
        setActiveTab('history');
      } catch (err) {
        console.error("Error creating return:", err);
        alert(`Failed to create return: ${err.response?.data?.message || err.message}`);
      }
    };

  const handleStatusChange = (returnId, newStatus) => {
    updateReturnStatus(returnId, newStatus)
      .then(() => {
        return Promise.all([getReturns(), getInvoices()]);
      })
      .then(([returnsRes, invoicesRes]) => {
        const refreshedReturns = returnsRes?.data || [];
        const refreshedInvoices = invoicesRes?.data || [];
        syncReturnState({
          ...(returnState || {}),
          invoices: refreshedInvoices,
          returns: refreshedReturns
        });

        const refreshedSelection = refreshedReturns.find((ret) => ret.id === returnId) || null;
        setSelectedReturnForDetails(refreshedSelection);
      })
      .catch((err) => {
        console.error("Error updating return status:", err);
      });
  };

  // Filter returns
  const filteredReturns = returnsList.filter(ret => {
    if (statusFilter === 'All') return true;
    return ret.status.toLowerCase() === statusFilter.toLowerCase();
  });

  return (
    <div className="glass-card returns-theme-override" style={{
      padding: '32px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      textAlign: 'left',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '24px',
      border: '1px solid #e2e8f0',
      marginBottom: '24px'
    }}>
      <style>{`
        .returns-theme-override {
          --text-primary: #1e293b !important;
          --text-secondary: #475569 !important;
          --text-muted: #64748b !important;
          --bg-primary: #f8fafc !important;
          --bg-secondary: #ffffff !important;
          --bg-tertiary: #f1f5f9 !important;
          --border-color: #e2e8f0 !important;
          --accent-color: #3b82f6 !important;
          --accent-hover: #2563eb !important;
          --accent-light: rgba(59, 130, 246, 0.1) !important;
          --success-light: rgba(16, 185, 129, 0.1) !important;
          --warning-light: rgba(245, 158, 11, 0.1) !important;
          --danger-light: rgba(239, 68, 68, 0.1) !important;
        }
        /* Explicitly color headings and bold text dark slate */
        .returns-theme-override h1:not([style*="color"]),
        .returns-theme-override h2:not([style*="color"]),
        .returns-theme-override h3:not([style*="color"]),
        .returns-theme-override h4:not([style*="color"]),
        .returns-theme-override h5:not([style*="color"]),
        .returns-theme-override h6:not([style*="color"]),
        .returns-theme-override strong:not([style*="color"]),
        .returns-theme-override b:not([style*="color"]) {
          color: #1e293b !important;
        }
        /* Explicitly color general text elements slate grey */
        .returns-theme-override span:not([style*="color"]),
        .returns-theme-override p:not([style*="color"]),
        .returns-theme-override label:not([style*="color"]),
        .returns-theme-override td:not([style*="color"]),
        .returns-theme-override th:not([style*="color"]),
        .returns-theme-override a:not([style*="color"]) {
          color: #475569 !important;
        }
        @media (max-width: 768px) {
          .returns-grid { grid-template-columns: 1fr !important; }
          .returns-header { flex-direction: column; gap: 16px; }
        }
      `}</style>
      
      {/* Returns App Header */}
      <div className="returns-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '24px'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', color: 'var(--text-primary)' }}>Returns & Refund Workspace</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Log returns, inspect conditions, auto-verify warranties, and authorize customer payouts.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => setActiveTab('new_return')} 
            className="btn-animate" 
            style={{
              padding: '10px 18px',
              backgroundColor: 'var(--accent-color)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
            <FiRefreshCw /> Process New Return
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="returns-tabs" style={{ display: 'flex', gap: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
        <button 
          onClick={() => setActiveTab('dashboard')} 
          style={{
            padding: '12px 4px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'dashboard' ? '2px solid var(--accent-color)' : 'none',
            color: activeTab === 'dashboard' ? 'var(--accent-color)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'dashboard' ? '600' : '500',
            cursor: 'pointer',
            fontSize: '15px'
          }}>
          Dashboard Overview
        </button>
        <button 
          onClick={() => setActiveTab('new_return')} 
          style={{
            padding: '12px 4px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'new_return' ? '2px solid var(--accent-color)' : 'none',
            color: activeTab === 'new_return' ? 'var(--accent-color)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'new_return' ? '600' : '500',
            cursor: 'pointer',
            fontSize: '15px'
          }}>
          New Return Request
        </button>
        <button 
          onClick={() => setActiveTab('history')} 
          style={{
            padding: '12px 4px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'history' ? '2px solid var(--accent-color)' : 'none',
            color: activeTab === 'history' ? 'var(--accent-color)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'history' ? '600' : '500',
            cursor: 'pointer',
            fontSize: '15px'
          }}>
          Refund History & Approvals
        </button>
      </div>

      {/* Tab contents */}
      {activeTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Total Approved Refunds</span>
                <FiTrendingDown style={{ color: 'var(--danger-color)', fontSize: '20px' }} />
              </div>
              <h2 style={{ fontSize: '26px', margin: '12px 0 4px 0', fontWeight: '700' }}>
                LKR {totalApprovedRefunds.toFixed(2)}
              </h2>
              <span style={{ fontSize: '12px', color: 'var(--success-color)' }}>Restored to customer accounts</span>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Pending Approvals</span>
                <FiClock style={{ color: 'var(--warning-color)', fontSize: '20px' }} />
              </div>
              <h2 style={{ fontSize: '26px', margin: '12px 0 4px 0', fontWeight: '700', color: 'var(--warning-color)' }}>
                {pendingApprovalsCount} Requests
              </h2>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Awaiting supervisor codes</span>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Items Restocked</span>
                <FiLayers style={{ color: 'var(--success-color)', fontSize: '20px' }} />
              </div>
              <h2 style={{ fontSize: '26px', margin: '12px 0 4px 0', fontWeight: '700' }}>
                {totalRestocked} Units
              </h2>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Returned to shelf inventory</span>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Damaged Items Write-off</span>
                <FiAlertTriangle style={{ color: 'var(--danger-color)', fontSize: '20px' }} />
              </div>
              <h2 style={{ fontSize: '26px', margin: '12px 0 4px 0', fontWeight: '700', color: 'var(--danger-color)' }}>
                {totalDamaged} Units
              </h2>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Sent to waste / disposal logs</span>
            </div>
          </div>

          {/* Quick instructions container */}
          <div className="glass-card" style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)' }}>
            <h3 style={{ marginBottom: '12px', color: 'var(--text-primary)' }}>Standard Return Eligibility Rules</h3>
            <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><strong>30-Day Return Window:</strong> Items purchased within 30 days are automatically eligible for direct refund. Invoices older than 30 days trigger manager authorization warnings.</li>
              <li><strong>Restocking Condition:</strong> Select "Resellable" condition to automatically add the item quantity back to branch active inventory records.</li>
              <li><strong>Original Payment Method:</strong> Refunds are returned to the client using the original payment channel (Cash, Card, Wallet) as specified on invoice receipts.</li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'new_return' && (
        <div className="returns-grid" style={{ display: 'grid', gridTemplateColumns: activeInvoice ? '1fr 340px' : '1fr', gap: '24px' }}>
          
          {/* Main workspace pane */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>Find Sale Transaction</h3>
              <form className="returns-search-form" onSubmit={handleInvoiceSearch} style={{ display: 'flex', gap: '12px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    placeholder="Enter Invoice ID (e.g. INV-2026-001)"
                    value={searchInvoiceId}
                    onChange={(e) => setSearchInvoiceId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <button type="submit" className="btn-animate" style={{
                  padding: '10px 24px',
                  backgroundColor: 'var(--accent-color)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  Search
                </button>
              </form>

              {searchError && (
                <div style={{ 
                  marginTop: '12px', 
                  padding: '12px', 
                  backgroundColor: 'var(--danger-light)', 
                  color: 'var(--danger-color)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FiAlertTriangle /> {searchError}
                </div>
              )}
            </div>

            {/* If invoice loaded */}
            {activeInvoice && (
              <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Purchased Items</h3>
                  
                  {/* Validity Badge */}
                  {isReturnWindowValid(activeInvoice.date) ? (
                    <span style={{
                      backgroundColor: 'var(--success-light)',
                      color: 'var(--success-color)',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <FiCheckCircle /> Within 30-Day Return Period
                    </span>
                  ) : (
                    <span style={{
                      backgroundColor: 'var(--warning-light)',
                      color: 'var(--warning-color)',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <FiAlertTriangle /> Policy Warning: Purchased {getDaysSincePurchase(activeInvoice.date)} days ago (needs authorization)
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {activeInvoice.items.map((item) => {
                    const maxQtyToReturn = item.qty - item.returnedQty;
                    const selectedReturnQty = returnItems[item.id] || 0;

                    return (
                      <div className="returns-item-row" key={item.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '14px',
                        backgroundColor: 'var(--bg-primary)',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)'
                      }}>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{item.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            SKU: {item.id} | Price: LKR {item.price.toFixed(2)} | Bought: {item.qty} (Already returned: {item.returnedQty})
                          </div>
                        </div>

                        <div className="returns-item-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {maxQtyToReturn > 0 ? (
                            <>
                              <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Qty to Return:</label>
                              <input 
                                type="number" 
                                min="0" 
                                max={maxQtyToReturn}
                                value={selectedReturnQty}
                                onChange={(e) => handleQtyChange(item.id, e.target.value, maxQtyToReturn)}
                                style={{
                                  width: '60px',
                                  padding: '6px',
                                  borderRadius: '6px',
                                  border: '1px solid var(--border-color)',
                                  textAlign: 'center',
                                  backgroundColor: 'var(--bg-secondary)',
                                  color: 'var(--text-primary)'
                                }}
                              />
                            </>
                          ) : (
                            <span style={{ fontSize: '13px', color: 'var(--danger-color)', fontWeight: '500' }}>
                              Fully Returned
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Return Settings Forms */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '24px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                      Return Reason
                    </label>
                    <select 
                      value={returnReason} 
                      onChange={(e) => setReturnReason(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-primary)'
                      }}>
                      <option>Defective item</option>
                      <option>Wrong size/item</option>
                      <option>Customer changed mind</option>
                      <option>Not as described</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                      Item Inventory Condition
                    </label>
                    <select 
                      value={returnCondition} 
                      onChange={(e) => setReturnCondition(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-primary)'
                      }}>
                      <option>Resellable (Restock)</option>
                      <option>Damaged (Write-off)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Summary Sidebar pane */}
          {activeInvoice && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="glass-card" style={{ padding: '20px' }}>
                <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>Invoice Details</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Customer:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{activeInvoice.customer}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Branch:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{activeInvoice.branch}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Date:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{activeInvoice.date}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Payment Method:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{activeInvoice.paymentMethod}</strong>
                  </div>
                </div>
              </div>

              {/* Cost Summary Box */}
              <div className="glass-card" style={{ padding: '20px', border: '1px solid var(--accent-color)' }}>
                <h3 style={{ marginBottom: '12px', color: 'var(--text-primary)' }}>Refund Estimate</h3>
                
                {/* Math values calculation */}
                {(() => {
                  let subtotal = 0;
                  activeInvoice.items.forEach(item => {
                    const qty = returnItems[item.id] || 0;
                    subtotal += qty * item.price;
                  });

                  const totalOriginalSubtotal = activeInvoice.items.reduce((sum, item) => sum + (item.qty * item.price), 0);
                  const discountProportion = activeInvoice.discountAmount / totalOriginalSubtotal;
                  const refundDiscount = subtotal * discountProportion;
                  const taxRefund = (subtotal - refundDiscount) * activeInvoice.taxRate;
                  const totalRefund = subtotal - refundDiscount + taxRefund;

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Subtotal Refund:</span>
                        <span>LKR {subtotal.toFixed(2)}</span>
                      </div>
                      {refundDiscount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--danger-color)' }}>
                          <span>Promo Discount:</span>
                          <span>-LKR {refundDiscount.toFixed(2)}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Tax ({Math.round(activeInvoice.taxRate * 100)}%):</span>
                        <span>+LKR {taxRefund.toFixed(2)}</span>
                      </div>
                      <div style={{ borderTop: '1px solid var(--border-color)', margin: '8px 0' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                        <span>Estimated Total:</span>
                        <span>LKR {totalRefund.toFixed(2)}</span>
                      </div>

                      <button 
                        onClick={handleCreateReturn}
                        disabled={subtotal === 0}
                        style={{
                          marginTop: '16px',
                          padding: '12px',
                          backgroundColor: subtotal > 0 ? 'var(--accent-color)' : 'var(--border-color)',
                          color: subtotal > 0 ? 'white' : 'var(--text-muted)',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: '600',
                          cursor: subtotal > 0 ? 'pointer' : 'not-allowed',
                          width: '100%'
                        }}
                        className="btn-animate"
                      >
                        {isReturnWindowValid(activeInvoice.date) ? 'Submit Credit Refund' : 'Request Supervisor Approval'}
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Filters Bar */}
          <div className="glass-card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FiFilter style={{ color: 'var(--text-secondary)' }} />
              <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)' }}>Filter by Status:</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['All', 'Pending Approval', 'Refunded', 'Rejected'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: statusFilter === status ? 'var(--accent-light)' : 'var(--bg-primary)',
                      color: statusFilter === status ? 'var(--accent-color)' : 'var(--text-secondary)',
                      fontWeight: statusFilter === status ? '600' : '500',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                    className="btn-animate"
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Showing {filteredReturns.length} records
            </span>
          </div>

          {/* Grid Layout containing Log and Selected Details Side-by-Side */}
          <div className="returns-grid" style={{ display: 'grid', gridTemplateColumns: selectedReturnForDetails ? '1fr 360px' : '1fr', gap: '20px' }}>
            
            {/* Returns Table */}
            <div className="glass-card return-history-table-container" style={{ overflowX: 'auto', overflowY: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left' }}>Return ID</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left' }}>Customer</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left' }}>Branch</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left' }}>Amount</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReturns.length > 0 ? (
                    filteredReturns.map((ret) => (
                      <tr key={ret.id} style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                        <td style={{ padding: '12px 16px', fontWeight: '600' }}>{ret.id}</td>
                        <td style={{ padding: '12px 16px' }}>{ret.customer}</td>
                        <td style={{ padding: '12px 16px' }}>{ret.branch}</td>
                        <td style={{ padding: '12px 16px', fontWeight: '600' }}>LKR {ret.amount.toFixed(2)}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '600',
                            backgroundColor: 
                              ret.status === 'Refunded' ? 'var(--success-light)' :
                              ret.status === 'Pending Approval' ? 'var(--warning-light)' : 'var(--danger-light)',
                            color: 
                              ret.status === 'Refunded' ? 'var(--success-color)' :
                              ret.status === 'Pending Approval' ? 'var(--warning-color)' : 'var(--danger-color)'
                          }}>
                            {ret.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                          <button 
                            onClick={() => setSelectedReturnForDetails(ret)} 
                            style={{
                              padding: '6px',
                              borderRadius: '6px',
                              border: '1px solid var(--border-color)',
                              backgroundColor: 'var(--bg-secondary)',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer',
                              display: 'flex'
                            }}
                            className="btn-animate"
                            title="Inspect Request"
                          >
                            <FiEye />
                          </button>
                          <button 
                            onClick={() => {
                              setReceiptData(ret);
                              setIsReceiptOpen(true);
                            }} 
                            style={{
                              padding: '6px',
                              borderRadius: '6px',
                              border: '1px solid var(--border-color)',
                              backgroundColor: 'var(--bg-secondary)',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer',
                              display: 'flex'
                            }}
                            className="btn-animate"
                            title="Print Slip"
                          >
                            <FiPrinter />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No refund requests matching filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Inspect Side Panel */}
            {selectedReturnForDetails && (
              <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '80px', height: 'fit-content' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Request: {selectedReturnForDetails.id}</h3>
                  <button 
                    onClick={() => setSelectedReturnForDetails(null)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    ✕
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Customer:</span>
                    <strong>{selectedReturnForDetails.customer}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Branch:</span>
                    <strong>{selectedReturnForDetails.branch}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Original Invoice:</span>
                    <strong>{selectedReturnForDetails.invoiceId}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Reason:</span>
                    <strong>{selectedReturnForDetails.reason}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Condition:</span>
                    <strong>{selectedReturnForDetails.condition}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Refund Sum:</span>
                    <strong style={{ fontSize: '14px', color: 'var(--accent-color)' }}>LKR {selectedReturnForDetails.amount.toFixed(2)}</strong>
                  </div>
                </div>

                {/* Returned Items details */}
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>Returned Items:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {selectedReturnForDetails.items.map((item, idx) => (
                      <div key={idx} style={{ padding: '8px', backgroundColor: 'var(--bg-primary)', borderRadius: '6px', fontSize: '12px' }}>
                        <div><strong>{item.name}</strong></div>
                        <div style={{ color: 'var(--text-secondary)' }}>Qty: {item.qty} x LKR {item.price.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Supervisor Approval Actions */}
                {selectedReturnForDetails.status === 'Pending Approval' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                    <div style={{
                      padding: '10px',
                      backgroundColor: 'var(--warning-light)',
                      color: 'var(--warning-color)',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      ⚠️ Warning: Return window exceeded standard 30-day policy limit. Supervisor authorization code required.
                    </div>
                    <button 
                      onClick={() => handleStatusChange(selectedReturnForDetails.id, 'Refunded')}
                      style={{
                        padding: '10px',
                        backgroundColor: 'var(--success-color)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                      className="btn-animate"
                    >
                      Authorize & Issue Refund
                    </button>
                    <button 
                      onClick={() => handleStatusChange(selectedReturnForDetails.id, 'Rejected')}
                      style={{
                        padding: '10px',
                        backgroundColor: 'var(--danger-light)',
                        color: 'var(--danger-color)',
                        border: '1px solid var(--danger-color)',
                        borderRadius: '6px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                      className="btn-animate"
                    >
                      Reject Return Request
                    </button>
                  </div>
                ) : (
                  <div style={{
                    padding: '12px',
                    backgroundColor: selectedReturnForDetails.status === 'Refunded' ? 'var(--success-light)' : 'var(--danger-light)',
                    color: selectedReturnForDetails.status === 'Refunded' ? 'var(--success-color)' : 'var(--danger-color)',
                    borderRadius: '6px',
                    textAlign: 'center',
                    fontWeight: '600',
                    fontSize: '14px',
                    marginTop: '12px'
                  }}>
                    Request Status: {selectedReturnForDetails.status}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      <ReceiptModal 
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        returnItem={receiptData}
      />
      <style>{`
        @media (max-width: 768px) {
          .returns-header {
            flex-direction: column !important;
            gap: 16px !important;
          }
          .returns-grid {
            grid-template-columns: 1fr !important;
          }
          .returns-search-form {
            flex-direction: column !important;
          }
          .returns-item-row {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }
          .returns-item-actions {
            width: 100% !important;
            justify-content: space-between !important;
          }
          .returns-tabs {
            scrollbar-width: none;
          }
          .returns-tabs::-webkit-scrollbar {
            display: none;
          }
          .return-history-table-container {
            overflow-x: auto !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ReturnsPage;

