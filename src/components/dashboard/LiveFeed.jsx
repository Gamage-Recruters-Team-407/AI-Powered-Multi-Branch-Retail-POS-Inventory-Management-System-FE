import React, { useState, useEffect } from 'react';

const INITIAL_TRANSACTIONS = [
  { id: 1, branch: 'Colombo', amount: '$124.50', items: 8, cashier: 'Nimal S.', time: '2:41 PM', type: 'sale' },
  { id: 2, branch: 'Kandy', amount: '$67.20', items: 4, cashier: 'Kamani P.', time: '2:38 PM', type: 'sale' },
  { id: 3, branch: 'Galle', amount: '$234.00', items: 15, cashier: 'Roshan M.', time: '2:35 PM', type: 'sale' },
  { id: 4, branch: 'Colombo', amount: '$45.80', items: 3, cashier: 'Dilani W.', time: '2:31 PM', type: 'refund' },
];

const LiveFeed = ({ wsConnected, liveTransaction }) => {
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);

  useEffect(() => {
    if (liveTransaction) {
      setTransactions(prev => [
        {
          id: Date.now(),
          branch: liveTransaction.branch,
          amount: liveTransaction.amount,
          items: Math.floor(Math.random() * 12 + 1),
          cashier: ['Nimal S.', 'Kamani P.', 'Roshan M.'][Math.floor(Math.random() * 3)],
          time: liveTransaction.time,
          type: 'sale',
          isNew: true,
        },
        ...prev.slice(0, 7),
      ]);
    }
  }, [liveTransaction]);

  return (
    <div className="lf-card">
      <div className="lf-header">
        <div>
          <h3 className="lf-title">Live Transactions</h3>
          <p className="lf-sub">Real-time POS activity</p>
        </div>
        <div className={`lf-status ${wsConnected ? 'live' : 'paused'}`}>
          <span className="lf-dot" />
          {wsConnected ? 'LIVE' : 'PAUSED'}
        </div>
      </div>

      <div className="lf-list">
        {transactions.map((tx, i) => (
          <div key={tx.id} className={`lf-item ${tx.isNew ? 'new-item' : ''} ${tx.type}`}>
            <div className="lf-icon">{tx.type === 'refund' ? '↩️' : '🛒'}</div>
            <div className="lf-info">
              <div className="lf-branch">{tx.branch} Branch</div>
              <div className="lf-cashier">{tx.cashier} • {tx.items} items</div>
            </div>
            <div className="lf-right">
              <div className={`lf-amount ${tx.type}`}>{tx.type === 'refund' ? '-' : '+'}{tx.amount}</div>
              <div className="lf-time">{tx.time}</div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .lf-card {
          background: white; border-radius: var(--radius);
          border: 1.5px solid var(--gray-200);
          padding: 20px;
          animation: fadeIn .5s ease both;
        }
        .lf-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
        .lf-title { font-size: .95rem; font-weight: 700; color: var(--gray-900); }
        .lf-sub { font-size: .73rem; color: var(--gray-400); margin-top: 2px; }
        .lf-status {
          display: flex; align-items: center; gap: 5px;
          font-size: .68rem; font-weight: 800; letter-spacing: .08em;
          padding: 4px 10px; border-radius: 99px;
        }
        .lf-status.live { background: #d1fae5; color: var(--success); }
        .lf-status.paused { background: var(--gray-100); color: var(--gray-400); }
        .lf-dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; animation: blink 1.2s infinite; }

        .lf-list { display: flex; flex-direction: column; gap: 2px; }
        .lf-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 8px; border-radius: 8px;
          transition: background var(--transition);
        }
        .lf-item:hover { background: var(--gray-50); }
        .lf-item.new-item { animation: fadeIn .3s ease; background: var(--blue-50); }
        .lf-icon { font-size: 1.1rem; width: 28px; text-align: center; }
        .lf-info { flex: 1; }
        .lf-branch { font-size: .83rem; font-weight: 600; color: var(--gray-800); }
        .lf-cashier { font-size: .72rem; color: var(--gray-400); margin-top: 1px; }
        .lf-right { text-align: right; }
        .lf-amount { font-size: .9rem; font-weight: 800; }
        .lf-amount.sale { color: var(--success); }
        .lf-amount.refund { color: var(--danger); }
        .lf-time { font-size: .7rem; color: var(--gray-400); margin-top: 1px; }
      `}</style>
    </div>
  );
};

export default LiveFeed;
