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
            <th>Contact Email</th>
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
                  {dealer.phone && <div className="cell-sub">{dealer.phone}</div>}
                </td>
                <td>{dealer.email || 'N/A'}</td>
                <td>{dealer.country}</td>
                <td>{dealer.trade_license || 'Pending Upload'}</td>
                <td>
                  <span
                    style={{ color: 'var(--gold)', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem' }}
                    onClick={() =>
                      alert(
                        `Displaying trade license verification document for ${dealer.name || dealer.company_name}:\nDocument: ${dealer.trade_license_file || 'Trade_License_Document.pdf'}\nLicense: ${dealer.trade_license || 'CN-Verified'}`
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
              <td colSpan="6">No pending dealer or seller registrations waiting for review.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
