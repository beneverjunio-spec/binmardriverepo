import React from 'react';
import { MapPin } from 'lucide-react';
import { CARD_GRADIENTS } from '../../constants';
import { WhatsAppIcon, openWhatsApp, openGoogleMaps } from '../common/WhatsAppIcon';
import { useLanguage } from '../../context/LanguageContext';

export default function ListingCard({ listing, index, onSelect }) {
  const { t, isRTL } = useLanguage();
  const rawList = typeof listing.images === 'string'
    ? JSON.parse(listing.images || '[]')
    : (listing.images || []);
  const cardImages = (rawList || []).filter(url => typeof url === 'string' && url.trim().length > 0);
  const hasRealImage = cardImages && cardImages.length > 0;
  const locationText = listing.location || [listing.city, listing.country].filter(Boolean).join(', ') || `${listing.city || 'Dubai'}, ${listing.country || 'United Arab Emirates'}`;

  const isSale = (listing.listing_type || listing.type) === 'sale';
  const typeText = isSale ? t('for_sale') : t('for_rent');
  const isBrandNew = (listing.condition_type || listing.condition) === 'new';
  const condText = isBrandNew ? t('cond_brand_new') : t('cond_used');

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
        <span
          className={`card-tag ${listing.listing_type || listing.type}`}
          style={{ [isRTL ? 'right' : 'left']: '14px', [isRTL ? 'left' : 'right']: 'auto' }}
        >
          {typeText}
        </span>
        {!hasRealImage && `${listing.make} ${listing.category}`}
      </div>
      <div className="card-body">
        <div className="card-title">{listing.title}</div>
        <div
          className="card-loc card-loc-clickable"
          onClick={(e) => openGoogleMaps(locationText, e)}
          title={`Click to open "${locationText}" on Google Maps`}
        >
          <MapPin size={13} style={{ display: 'inline', verticalAlign: '-1px', marginRight: isRTL ? 0 : 4, marginLeft: isRTL ? 4 : 0, color: 'var(--gold)', flexShrink: 0 }} />
          <span className="loc-text">{locationText}</span>
          <span className="loc-badge-maps">{isRTL ? 'خريطة ↗' : 'Map ↗'}</span>
        </div>
        <div className="card-price">
          {listing.price_label || `${listing.currency || 'AED'} ${Number(listing.price).toLocaleString()}`}
        </div>
        <div className="card-meta">
          <span className={`card-cond ${listing.condition_type || listing.condition}`}>
            {condText}
          </span>
          <span className="card-seller">{listing.seller_name || listing.seller}</span>
        </div>
        <button
          type="button"
          className="btn-whatsapp-card"
          onClick={(e) => openWhatsApp(listing, e)}
          title="Direct WhatsApp inquiry with seller"
        >
          <WhatsAppIcon size={16} color="#ffffff" />
          <span>{t('chat_whatsapp')}</span>
        </button>
      </div>
    </div>
  );
}
