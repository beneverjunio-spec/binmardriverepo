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
        {moderationQueue.length > 0 ? (
          <table>
            <tbody>
              {moderationQueue.slice(0, 3).map(item => {
                const images = Array.isArray(item.images) && item.images.length > 0
                  ? item.images
                  : ['https://images.unsplash.com/photo-1594502184342-2e12f877aa73?w=800&auto=format&fit=crop'];
                return (
                  <tr key={item.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img
                          src={images[0]}
                          alt={item.title}
                          style={{ width: '42px', height: '34px', borderRadius: '4px', objectFit: 'cover', border: '1px solid rgba(212, 175, 55, 0.3)' }}
                        />
                        <div>
                          <div
                            className="cell-main"
                            style={{ cursor: 'pointer', color: 'var(--gold)' }}
                            onClick={() => setAdminTab('moderation')}
                          >
                            {item.title}
                          </div>
                          <div className="cell-sub">{item.city}, {item.country}</div>
                        </div>
                      </div>
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
                );
              })}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center', color: 'var(--ink-2)', fontSize: '0.9rem' }}>
            All clear! No pending vehicle submissions waiting for review.
          </div>
        )}
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
        {dealerQueue.length > 0 ? (
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
        ) : (
          <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center', color: 'var(--ink-2)', fontSize: '0.9rem' }}>
            All clear! No commercial dealer verification requests waiting.
          </div>
        )}
      </div>
    </div>
  );
}

