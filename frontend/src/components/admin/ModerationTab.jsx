import React from 'react';

export default function ModerationTab({ moderationQueue, onResolveModeration }) {
  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h2>Vehicle Moderation Queue</h2>
          <p>Submissions waiting to go live on the public marketplace.</p>
        </div>
        <span className="pending-count">{moderationQueue.length} pending review</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Listing</th>
            <th>Seller</th>
            <th>Condition</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {moderationQueue.length > 0 ? (
            moderationQueue.map(item => (
              <tr key={item.id}>
                <td>
                  <div className="cell-main">{item.title}</div>
                  <div className="cell-sub">{item.city}, {item.country}</div>
                </td>
                <td>{item.seller_name || item.seller}</td>
                <td>
                  <span className={`badge ${(item.condition_type || item.condition) === 'new' ? 'new' : 'used'}`}>
                    {(item.condition_type || item.condition) === 'new' ? 'New' : 'Used'}
                  </span>
                </td>
                <td>{item.price_label || `${item.currency} ${Number(item.price).toLocaleString()}`}</td>
                <td>
                  <div className="row-actions">
                    <button
                      className="act-btn approve"
                      onClick={() => onResolveModeration(item.id, true)}
                    >
                      Approve & Publish
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
            ))
          ) : (
            <tr className="empty-row">
              <td colSpan="5">Queue is clear! All submissions have been moderated.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
