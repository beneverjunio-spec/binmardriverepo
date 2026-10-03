import React from 'react';
import { CARD_GRADIENTS } from '../../constants';

export default function ListingCard({ listing, index, onSelect }) {
  const rawList = typeof listing.images === 'string'
    ? JSON.parse(listing.images || '[]')
    : (listing.images || []);
  const cardImages = (rawList || []).filter(url => typeof url === 'string' && !url.startsWith('blob:'));
  const hasRealImage = cardImages && cardImages.length > 0;

  return (
    <div className="card" onClick={() => onSelect(listing)}>
      <div
        className="card-img"
        style={{
          background: hasRealImage
            ? `url(${cardImages[0]}) center/cover no-repeat`
            : CARD_GRADIENTS[index % CARD_GRADIENTS.length],
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <span className={`card-tag ${listing.listing_type || listing.type}`}>
          {(listing.listing_type || listing.type) === 'sale' ? 'For sale' : 'For rent'}
        </span>
        {!hasRealImage && `${listing.make} ${listing.category}`}
      </div>
      <div className="card-body">
        <div className="card-title">{listing.title}</div>
        <div className="card-loc">{listing.city}, {listing.country}</div>
        <div className="card-price">
          {listing.price_label || `${listing.currency} ${Number(listing.price).toLocaleString()}`}
        </div>
        <div className="card-meta">
          <span className={`card-cond ${listing.condition_type || listing.condition}`}>
            {(listing.condition_type || listing.condition) === 'new' ? 'Brand new' : 'Used'}
          </span>
          <span className="card-seller">{listing.seller_name || listing.seller}</span>
        </div>
      </div>
    </div>
  );
}
