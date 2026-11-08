import React from 'react';
import { MapPin, Calendar, Gauge, Car, Tag } from 'lucide-react';
import { CARD_GRADIENTS } from '../../constants';
import { WhatsAppIcon, openWhatsApp, openGoogleMaps } from '../common/WhatsAppIcon';
import { useLanguage } from '../../context/LanguageContext';
import { getVehicleUrl } from '../../utils/seo';

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
  const isSold = listing.sale_status === 'sold';
  const isRented = listing.sale_status === 'rented';

  // Small captions specifications
  const displayYear = listing.year || '';

  const displayMileage = (() => {
    if (listing.mileage === 0 || listing.mileage === '0') return '0 km';
    if (!listing.mileage) return '';
    const mStr = String(listing.mileage).trim();
    if (/km$/i.test(mStr)) return mStr;
    const num = Number(mStr.replace(/[^0-9.]/g, ''));
    if (Number.isFinite(num) && num > 0) return `${num.toLocaleString()} km`;
    return `${mStr} km`;
  })();

  const isManual = (listing.transmission || '').toLowerCase().includes('man');
  const displayTransmission = isManual
    ? (t('trans_manual') || 'Manual')
    : (listing.transmission || t('trans_auto') || 'Automatic');

  const displayCategory = listing.category || '';

  const vehicleUrl = getVehicleUrl(listing);

  const handleClick = (e) => {
    // If user clicked with Ctrl/Cmd/middle click, let default browser navigation happen (open in new tab)
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) {
      return;
    }
    e.preventDefault();
    if (onSelect) onSelect(listing);
  };

  return (
    <a
      href={vehicleUrl}
      className="card card-seo-link"
      onClick={handleClick}
      style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column' }}
      title={`${listing.title} - View vehicle details`}
    >
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
        {(isSold || isRented) && (
          <span
            style={{
              position: 'absolute',
              top: '14px',
              [isRTL ? 'left' : 'right']: '14px',
              background: isSold ? 'rgba(220, 38, 38, 0.95)' : 'rgba(124, 58, 237, 0.95)',
              color: '#ffffff',
              padding: '4px 12px',
              borderRadius: '999px',
              fontSize: '0.74rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              textTransform: 'uppercase',
              zIndex: 3
            }}
          >
            {isSold ? t('marketplace_badge_sold') : t('marketplace_badge_rented')}
          </span>
        )}
        {(isSold || isRented) && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
              backdropFilter: 'blur(1px)'
            }}
          >
            <span
              style={{
                transform: 'rotate(-10deg)',
                background: isSold ? '#dc2626' : '#7c3aed',
                color: '#ffffff',
                padding: '6px 20px',
                borderRadius: '8px',
                fontWeight: 900,
                fontSize: '1.05rem',
                letterSpacing: '0.1em',
                boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
                border: '2px solid rgba(255,255,255,0.9)',
                textTransform: 'uppercase'
              }}
            >
              {isSold ? t('marketplace_badge_sold') : t('marketplace_badge_rented')}
            </span>
          </div>
        )}
        {!hasRealImage && `${listing.make} ${listing.category}`}
      </div>
      <div className="card-body">
        <div className="card-title">{listing.title}</div>
        <div
          className="card-loc card-loc-clickable"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            openGoogleMaps(locationText, e);
          }}
          title={`Click to open "${locationText}" on Google Maps`}
        >
          <MapPin size={13} style={{ display: 'inline', verticalAlign: '-1px', marginRight: isRTL ? 0 : 4, marginLeft: isRTL ? 4 : 0, color: 'var(--gold)', flexShrink: 0 }} />
          <span className="loc-text">{locationText}</span>
          <span className="loc-badge-maps">{isRTL ? 'خريطة ↗' : 'Map ↗'}</span>
        </div>

        {/* Small captions details: Year, Mileage, Transmission, Category */}
        <div className="card-specs-strip">
          {displayYear && (
            <span className="card-spec-item" title={t('modal_year') || 'Year'}>
              <Calendar size={11} className="card-spec-icon" />
              <span>{displayYear}</span>
            </span>
          )}
          {displayMileage && (
            <span className="card-spec-item" title={t('modal_mileage') || 'Mileage'}>
              <Gauge size={11} className="card-spec-icon" />
              <span>{displayMileage}</span>
            </span>
          )}
          {displayTransmission && (
            <span className="card-spec-item" title={t('modal_transmission') || 'Transmission'}>
              <Car size={11} className="card-spec-icon" />
              <span>{displayTransmission}</span>
            </span>
          )}
          {displayCategory && (
            <span className="card-spec-item" title={t('modal_category') || 'Category'}>
              <Tag size={11} className="card-spec-icon" />
              <span>{displayCategory}</span>
            </span>
          )}
        </div>

        {/* Price row with WhatsApp Icon Button */}
        <div className="card-price-row">
          <div className="card-price">
            {listing.price_label || `${listing.currency || 'AED'} ${Number(listing.price).toLocaleString()}`}
          </div>
          <button
            type="button"
            className="btn-whatsapp-icon-only"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openWhatsApp(listing, e);
            }}
            title={t('chat_whatsapp') || 'Chat on WhatsApp'}
            aria-label="Chat on WhatsApp"
          >
            <WhatsAppIcon size={18} color="#ffffff" />
          </button>
        </div>

        <div className="card-meta">
          <span className={`card-cond ${listing.condition_type || listing.condition}`}>
            {condText}
          </span>
          <span className="card-seller">{listing.seller_name || listing.seller}</span>
        </div>
      </div>
    </a>
  );
}
