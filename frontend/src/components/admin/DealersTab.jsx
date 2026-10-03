import React from 'react';

export default function DealersTab({ dealerQueue, onResolveDealer }) {
  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h2>Commercial Dealer Verification</h2>
          <p>Company registrations requiring business trade license review.</p>
        </div>
        <span className="pending-count">{dealerQueue.length} pending</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Company</th>
            <th>Country</th>
            <th>License Number</th>
            <th>Document</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {dealerQueue.length > 0 ? (
            dealerQueue.map(dealer => (
              <tr key={dealer.id}>
                <td>
                  <div className="cell-main">{dealer.name || dealer.company_name}</div>
                </td>
                <td>{dealer.country}</td>
                <td>{dealer.trade_license || 'Pending Upload'}</td>
                <td>
                  <span
                    style={{ color: 'var(--gold)', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem' }}
                    onClick={() =>
                      alert(
                        'Displaying uploaded trade license PDF scan for ' +
                          (dealer.name || dealer.company_name)
                      )
                    }
                  >
                    View Trade License
                  </span>
                </td>
                <td>
                  <div className="row-actions">
                    <button
                      className="act-btn approve"
                      onClick={() => onResolveDealer(dealer.id, true)}
                    >
                      Verify Dealer
                    </button>
                    <button
                      className="act-btn reject"
                      onClick={() => onResolveDealer(dealer.id, false)}
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr className="empty-row">
              <td colSpan="5">No pending dealer registrations.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
