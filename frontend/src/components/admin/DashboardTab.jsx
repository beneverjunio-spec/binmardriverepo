import React from 'react';

export default function DashboardTab({
  adminStats,
  moderationQueue,
  dealerQueue,
  setAdminTab,
  onResolveModeration,
  onResolveDealer
}) {
  const pendingDealers = dealerQueue.filter(d => !d.status || d.status === 'pending');
  const verifiedCount = adminStats.verifiedDealers ?? dealerQueue.filter(d => d.status === 'verified' || d.status === 'approved').length;
  const rejectedCount = adminStats.rejectedDealers ?? dealerQueue.filter(d => d.status === 'rejected').length;

  return (
    <div>
      {/* 5 Statistics Cards (Live, Moderation, Pending Dealers, Verified Dealers, Rejected Dealers) */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="stat-card">
          <div className="stat-label">Live Listings</div>
          <div className="stat-value">{adminStats.liveListings || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Moderation</div>
          <div className="stat-value">{moderationQueue.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Dealers</div>
          <div className="stat-value" style={{ color: 'var(--gold, #d4af37)' }}>
            {adminStats.pendingDealers ?? pendingDealers.length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Verified Dealers</div>
          <div className="stat-value" style={{ color: '#4ade80' }}>
            {verifiedCount}
          </div>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid rgba(239, 68, 68, 0.4)' }}>
          <div className="stat-label" style={{ color: '#f87171' }}>Rejected Registrations</div>
          <div className="stat-value" style={{ color: '#f87171' }}>
            {rejectedCount}
          </div>
        </div>
      </div>

      {/* Moderation Queue Preview */}
      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Moderation Queue Preview</h2>
            <p>Newest vehicle submissions waiting for administrative review</p>
          </div>
          <button className="btn-gold" onClick={() => setAdminTab('moderation')}>
            View Full Queue ({moderationQueue.length})
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

      {/* Dealer Verification Preview */}
      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Dealer Verification Preview</h2>
            <p>Companies and private sellers waiting on commercial trade license approval</p>
          </div>
          <button className="btn-gold" onClick={() => setAdminTab('dealers')}>
            View All Dealers ({dealerQueue.length})
          </button>
        </div>
        {pendingDealers.length > 0 ? (
          <table>
            <tbody>
              {pendingDealers.slice(0, 3).map(dealer => (
                <tr key={dealer.id}>
                  <td>
                    <div className="cell-main">{dealer.name || dealer.company_name}</div>
                    <div className="cell-sub">{dealer.trade_license || 'License Attached'}</div>
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 6px',
                      borderRadius: '3px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      background: dealer.user_type === 'company' ? 'rgba(212, 175, 55, 0.15)' : 'rgba(100, 150, 255, 0.15)',
                      color: dealer.user_type === 'company' ? 'var(--gold)' : '#7cb3ff'
                    }}>
                      {dealer.user_type === 'company' ? 'Dealer' : 'Private'}
                    </span>
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
            All clear! No pending verification requests waiting.
          </div>
        )}
      </div>
    </div>
  );
}
