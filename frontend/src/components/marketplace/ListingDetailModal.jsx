import React, { useState } from 'react';
import { X, MapPin, Phone } from 'lucide-react';
import { CARD_GRADIENTS } from '../../constants';
import { WhatsAppIcon, getWhatsAppUrl, openGoogleMaps } from '../common/WhatsAppIcon';

export default function ListingDetailModal({ listing, onClose }) {
  const [modalImageIndex, setModalImageIndex] = useState(0);

  if (!listing) return null;

  const rawList = typeof listing.images === 'string'
    ? JSON.parse(listing.images || '[]')
    : (listing.images || []);
  const modalImages = (rawList || []).filter(url => typeof url === 'string' && url.trim().length > 0);
  const hasRealImages = modalImages && modalImages.length > 0;
  const locationText = listing.location || [listing.city, listing.country].filter(Boolean).join(', ') || `${listing.city || 'Dubai'}, ${listing.country || 'United Arab Emirates'}`;

  const contactNumber = listing.whatsapp_number || listing.contact_phone || '+971 50 123 4567';

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          <X size={18} />
        </button>

        <div
          className="modal-hero"
          style={{
            background: hasRealImages
              ? `url(${modalImages[modalImageIndex % modalImages.length]}) center/cover no-repeat`
              : CARD_GRADIENTS[(listing.id + modalImageIndex) % CARD_GRADIENTS.length],
            position: 'relative'
          }}
        >
          <span
            className={`card-tag ${listing.listing_type || listing.type}`}
            style={{ position: 'absolute', top: 14, left: 14 }}
          >
            {(listing.listing_type || listing.type) === 'sale' ? 'For sale' : 'For rent'}
          </span>
          {!hasRealImages && `${listing.make} ${listing.category} — View ${modalImageIndex + 1} of 4`}
        </div>

        <div className="modal-thumbs">
          {hasRealImages ? (
            modalImages.map((imgUrl, idx) => (
              <div
                key={idx}
                className={`modal-thumb ${modalImageIndex === idx ? 'active' : ''}`}
                style={{
                  background: `url(${imgUrl}) center/cover no-repeat`
                }}
                onClick={() => setModalImageIndex(idx)}
              />
            ))
          ) : (
            [0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`modal-thumb ${modalImageIndex === idx ? 'active' : ''}`}
                style={{ background: CARD_GRADIENTS[(listing.id + idx) % CARD_GRADIENTS.length] }}
                onClick={() => setModalImageIndex(idx)}
              />
            ))
          )}
        </div>

        <div className="modal-body">
          <div className="modal-title">{listing.title}</div>
          <div
            className="modal-loc modal-loc-clickable"
            onClick={(e) => openGoogleMaps(locationText, e)}
            title={`Click to open "${locationText}" in Google Maps`}
          >
            <MapPin size={16} style={{ display: 'inline', verticalAlign: '-3px', marginRight: 5, color: 'var(--gold)', flexShrink: 0 }} />
            <span>{locationText}</span>
            <span className="btn-loc-maps">Open in Google Maps ↗</span>
          </div>
          <div className="modal-price">
            {listing.price_label || `${listing.currency} ${Number(listing.price).toLocaleString()}`}
          </div>

          <div className="modal-specs">
            <div className="spec-item">
              <div className="spec-label">Year</div>
              <div className="spec-value">{listing.year}</div>
            </div>
            <div className="spec-item">
              <div className="spec-label">Mileage</div>
              <div className="spec-value">{listing.mileage}</div>
            </div>
            <div className="spec-item">
              <div className="spec-label">Transmission</div>
              <div className="spec-value">{listing.transmission || 'Automatic'}</div>
            </div>
            <div className="spec-item">
              <div className="spec-label">Fuel type</div>
              <div className="spec-value">{listing.fuel || 'Petrol'}</div>
            </div>
            <div className="spec-item">
              <div className="spec-label">Condition</div>
              <div className="spec-value">
                {(listing.condition_type || listing.condition) === 'new' ? 'Brand new' : 'Used'}
              </div>
            </div>
            <div className="spec-item">
              <div className="spec-label">Category</div>
              <div className="spec-value">{listing.category}</div>
            </div>
          </div>

          <div className="modal-desc">{listing.description}</div>

          <div className="modal-seller">
            <div>
              <div className="modal-seller-name">{listing.seller_name || listing.seller}</div>
              <div className="modal-seller-sub">
                WhatsApp: <strong>{contactNumber}</strong>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <a
                href={getWhatsAppUrl(listing)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp-modal"
                title="Direct WhatsApp chat"
              >
                <WhatsAppIcon size={18} color="#ffffff" />
                <span>Chat on WhatsApp</span>
              </a>
              <a
                href={`tel:${contactNumber.replace(/[^0-9+]/g, '')}`}
                className="btn-call-modal"
                title="Call seller"
              >
                <Phone size={15} />
                <span>Call</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
