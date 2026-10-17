import React from 'react';
import { Trash2 } from 'lucide-react';

export default function LiveListingsTab({
  adminListings,
  adminSearch,
  setAdminSearch,
  onRemoveListing,
  onRemoveAllListings
}) {
  const filteredListings = adminListings.filter(
    l =>
      !adminSearch ||
      l.title?.toLowerCase().includes(adminSearch.toLowerCase()) ||
      l.seller_name?.toLowerCase().includes(adminSearch.toLowerCase())
  );

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h2>All Live Marketplace Listings ({adminListings.length})</h2>
          <p>Manage and audit approved vehicle postings currently live.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {adminListings.length > 0 && onRemoveAllListings && (
            <button
              className="act-btn reject"
              style={{ whiteSpace: 'nowrap', padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}
              onClick={onRemoveAllListings}
            >
              <Trash2 size={13} style={{ display: 'inline', marginRight: 4 }} />
              Clear All Live Listings (Zero Out)
            </button>
          )}
          <input
            className="search"
            placeholder="Search listings or sellers..."
            value={adminSearch}
            onChange={e => setAdminSearch(e.target.value)}
          />
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Vehicle</th>
            <th>Seller</th>
            <th>Price</th>
            <th>Location</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredListings.length > 0 ? (
            filteredListings.map(l => (
              <tr key={l.id}>
                <td>
                  <div className="cell-main">{l.title}</div>
                  <div className="cell-sub">{l.category} &bull; {l.year}</div>
                </td>
                <td>{l.seller_name || l.seller}</td>
                <td>{l.price_label || `${l.currency} ${Number(l.price).toLocaleString()}`}</td>
                <td>{l.city}, {l.country}</td>
                <td>
                  <button className="act-btn reject" onClick={() => onRemoveListing(l.id)}>
                    <Trash2 size={13} style={{ display: 'inline', marginRight: 4 }} />
                    Remove
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr className="empty-row">
              <td colSpan="5">No live listings found matching search criteria.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
