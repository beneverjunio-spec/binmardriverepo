import React from 'react';

export default function DashboardTab({
  adminStats,
  moderationQueue,
  dealerQueue,
  setAdminTab,
  onResolveModeration,
  onResolveDealer
}) {
  return (
    <div>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Live Listings</div>
          <div className="stat-value">{adminStats.liveListings}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Moderation</div>
          <div className="stat-value">{moderationQueue.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Verified Dealers</div>
          <div className="stat-value">{adminStats.verifiedDealers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Dealers</div>
          <div className="stat-value">{dealerQueue.length}</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Moderation Queue Preview</h2>
            <p>Newest vehicle submissions waiting for administrative review</p>
          </div>
          <button className="btn-gold" onClick={() => setAdminTab('moderation')}>
            View Full Queue
          </button>
        </div>
        <table>
          <tbody>
            {moderationQueue.slice(0, 3).map(item => (
              <tr key={item.id}>
                <td>
                  <div className="cell-main">{item.title}</div>
                  <div className="cell-sub">{item.city}, {item.country}</div>
                </td>
                <td>{item.seller_name || item.seller}</td>
                <td>{item.price_label || `${item.currency} ${Number(item.price).toLocaleString()}`}</td>
                <td>
                  <div className="row-actions">
                    <button
                      className="act-btn approve"
                      onClick={() => onResolveModeration(item.id, true)}
                    >
                      Approve
                    </button>
                    <button
                      className="act-btn reject"
                      onClick={() => onResolveModeration(item.id, false)}
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Dealer Verification Preview</h2>
            <p>Companies waiting on commercial trade license approval</p>
          </div>
          <button className="btn-gold" onClick={() => setAdminTab('dealers')}>
            View Dealer Queue
          </button>
        </div>
        <table>
          <tbody>
            {dealerQueue.slice(0, 3).map(dealer => (
              <tr key={dealer.id}>
                <td>
                  <div className="cell-main">{dealer.name || dealer.company_name}</div>
                  <div className="cell-sub">{dealer.trade_license || 'License Attached'}</div>
                </td>
                <td>{dealer.country}</td>
                <td>
                  <div className="row-actions">
                    <button
                      className="act-btn approve"
                      onClick={() => onResolveDealer(dealer.id, true)}
                    >
                      Verify
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
