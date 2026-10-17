import React from 'react';

export default function DealersTab({ dealerQueue, onResolveDealer }) {
  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h2>Commercial Dealer & Seller Verification</h2>
          <p>Company and seller registrations requiring administrative trade license review.</p>
        </div>
        <span className="pending-count">{dealerQueue.length} pending</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Company / Seller</th>
            <th>Type</th>
            <th>Contact Email</th>
            <th>Country</th>
            <th>License / ID</th>
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
                  {dealer.phone && <div className="cell-sub">{dealer.phone}</div>}
                </td>
                <td>
                  <span style={{
                    display: 'inline-block',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    background: dealer.user_type === 'company' ? 'rgba(212, 175, 55, 0.15)' : 'rgba(100, 150, 255, 0.15)',
                    color: dealer.user_type === 'company' ? 'var(--gold)' : '#7cb3ff',
                    border: dealer.user_type === 'company' ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid rgba(100, 150, 255, 0.3)'
                  }}>
                    {dealer.user_type === 'company' ? 'Commercial Dealer' : 'Private Seller'}
                  </span>
                </td>
                <td>{dealer.email || 'N/A'}</td>
                <td>{dealer.country}</td>
                <td>{dealer.trade_license || 'Pending Verification'}</td>
                <td>
                  <span
                    style={{ color: 'var(--gold)', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem' }}
                    onClick={() =>
                      alert(
                        `Displaying verification credentials for ${dealer.name || dealer.company_name}:\nAccount Type: ${dealer.user_type === 'company' ? 'Commercial Dealership' : 'Private Seller'}\nDocument: ${dealer.trade_license_file || 'Trade_License_Document.pdf'}\nLicense/ID: ${dealer.trade_license || 'CN-Verified'}\nEmail: ${dealer.email || 'N/A'}\nPhone: ${dealer.phone || 'N/A'}`
                      )
                    }
                  >
                    View Document
                  </span>
                </td>
                <td>
                  <div className="row-actions">
                    <button
                      className="act-btn approve"
                      onClick={() => onResolveDealer(dealer.id, true)}
                    >
                      Approve & Verify
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
              <td colSpan="7">No pending dealer or seller registrations waiting for review.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
