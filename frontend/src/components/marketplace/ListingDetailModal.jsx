import React, { useState } from 'react';
import { X, MapPin, Phone, Link2, Check, Share2 } from 'lucide-react';
import { CARD_GRADIENTS } from '../../constants';
import { WhatsAppIcon, getWhatsAppUrl, openGoogleMaps } from '../common/WhatsAppIcon';
import { useLanguage } from '../../context/LanguageContext';

// Branded SVGs for Social Media
const FacebookIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const TikTokIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.47 6.27 6.27 0 0 0 1.88-4.46V8.78a8.18 8.18 0 0 0 4.89 1.6V6.93a4.83 4.83 0 0 1-1-.24z" />
  </svg>
);

export default function ListingDetailModal({ listing, onClose }) {
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [shareFeedback, setShareFeedback] = useState('');
  const { t, isRTL } = useLanguage();

  if (!listing) return null;

  const rawList = typeof listing.images === 'string'
    ? JSON.parse(listing.images || '[]')
    : (listing.images || []);
  const modalImages = (rawList || []).filter(url => typeof url === 'string' && url.trim().length > 0);
  const hasRealImages = modalImages && modalImages.length > 0;
  const locationText = listing.location || [listing.city, listing.country].filter(Boolean).join(', ') || `${listing.city || 'Dubai'}, ${listing.country || 'United Arab Emirates'}`;

  const contactNumber = listing.whatsapp_number || listing.contact_phone || '+971 50 123 4567';

  // Construct absolute canonical share URL for this vehicle
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?listing=${listing.id}`
    : `https://binmardrive.binmargroup.com/?listing=${listing.id}`;

  const shareTitle = `${listing.title} - ${listing.price_label || 'AED ' + listing.price} on BinmarDrive`;

  const handleShareFacebook = (e) => {
    e.preventDefault();
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareTitle)}`;
    window.open(fbUrl, '_blank', 'width=620,height=580,menubar=no,toolbar=no');
  };

  const handleShareInstagram = async (e) => {
    e.preventDefault();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      }
      setShareFeedback(t('share_ig_copied'));
      setTimeout(() => setShareFeedback(''), 4500);
      window.open('https://www.instagram.com/', '_blank');
    } catch {
      window.open('https://www.instagram.com/', '_blank');
    }
  };

  const handleShareTikTok = async (e) => {
    e.preventDefault();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      }
      setShareFeedback(t('share_tiktok_copied'));
      setTimeout(() => setShareFeedback(''), 4500);
      window.open('https://www.tiktok.com/', '_blank');
    } catch {
      window.open('https://www.tiktok.com/', '_blank');
    }
  };

  const handleCopyLink = async (e) => {
    e.preventDefault();
    try {
      if (navigator.share && /mobile|android|iphone/i.test(navigator.userAgent)) {
        await navigator.share({
          title: shareTitle,
          text: `${listing.title} available now on BinmarDrive!`,
          url: shareUrl
        });
        return;
      }
    } catch {}

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const input = document.createElement('input');
        input.value = shareUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopiedLink(true);
      setShareFeedback(t('share_link_copied'));
      setTimeout(() => {
        setCopiedLink(false);
        setShareFeedback('');
      }, 3500);
    } catch {
      setShareFeedback(shareUrl);
    }
  };

  const isConditionNew = (listing.condition_type || listing.condition) === 'new';
  const conditionLabel = isConditionNew ? t('cond_brand_new') : t('cond_used');
  const isTypeSale = (listing.listing_type || listing.type) === 'sale';
  const typeLabel = isTypeSale ? t('for_sale') : t('for_rent');
  const transmissionLabel = (listing.transmission || '').toLowerCase().includes('man') ? t('trans_manual') : t('trans_auto');
  const isSold = listing.sale_status === 'sold';
  const isRented = listing.sale_status === 'rented';

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
            style={{ position: 'absolute', top: 14, [isRTL ? 'right' : 'left']: 14 }}
          >
            {typeLabel}
          </span>
          {(isSold || isRented) && (
            <span
              style={{
                position: 'absolute',
                top: 14,
                [isRTL ? 'left' : 'right']: 14,
                background: isSold ? 'rgba(220, 38, 38, 0.95)' : 'rgba(124, 58, 237, 0.95)',
                color: '#ffffff',
                padding: '4px 14px',
                borderRadius: '999px',
                fontSize: '0.82rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                textTransform: 'uppercase'
              }}
            >
              {isSold ? t('marketplace_badge_sold') : t('marketplace_badge_rented')}
            </span>
          )}
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
            <MapPin size={16} style={{ display: 'inline', verticalAlign: '-3px', marginRight: isRTL ? 0 : 5, marginLeft: isRTL ? 5 : 0, color: 'var(--gold)', flexShrink: 0 }} />
            <span>{locationText}</span>
            <span className="btn-loc-maps">{t('open_google_maps')}</span>
          </div>
          <div className="modal-price">
            {listing.price_label || `${listing.currency || 'AED'} ${Number(listing.price).toLocaleString()}`}
          </div>

          <div className="modal-specs">
            <div className="spec-item">
              <div className="spec-label">{t('modal_year')}</div>
              <div className="spec-value">{listing.year}</div>
            </div>
            <div className="spec-item">
              <div className="spec-label">{t('modal_mileage')}</div>
              <div className="spec-value">{listing.mileage}</div>
            </div>
            <div className="spec-item">
              <div className="spec-label">{t('modal_transmission')}</div>
              <div className="spec-value">{transmissionLabel}</div>
            </div>
            <div className="spec-item">
              <div className="spec-label">{t('modal_fuel')}</div>
              <div className="spec-value">{listing.fuel || 'Petrol'}</div>
            </div>
            <div className="spec-item">
              <div className="spec-label">{t('modal_condition')}</div>
              <div className="spec-value">{conditionLabel}</div>
            </div>
            <div className="spec-item">
              <div className="spec-label">{t('modal_category')}</div>
              <div className="spec-value">{listing.category}</div>
            </div>
          </div>

          <div className="modal-desc">{listing.description}</div>

          {/* Social Media Sharing Bar */}
          <div className="modal-share-bar">
            <div className="modal-share-label">
              <Share2 size={16} style={{ color: 'var(--gold)' }} />
              <span>{t('share_vehicle')}</span>
            </div>

            <div className="modal-share-icons">
              {/* Facebook */}
              <button
                type="button"
                className="share-btn share-btn-fb"
                onClick={handleShareFacebook}
                title={t('share_fb')}
              >
                <FacebookIcon size={14} />
                <span>{t('share_fb')}</span>
              </button>

              {/* Instagram */}
              <button
                type="button"
                className="share-btn share-btn-ig"
                onClick={handleShareInstagram}
                title={t('share_ig')}
              >
                <InstagramIcon size={14} />
                <span>{t('share_ig')}</span>
              </button>

              {/* TikTok */}
              <button
                type="button"
                className="share-btn share-btn-tiktok"
                onClick={handleShareTikTok}
                title={t('share_tiktok')}
              >
                <TikTokIcon size={14} />
                <span>{t('share_tiktok')}</span>
              </button>

              {/* Share / Copy Link */}
              <button
                type="button"
                className={`share-btn share-btn-link ${copiedLink ? 'share-btn-copied' : ''}`}
                onClick={handleCopyLink}
                title={t('share_link')}
              >
                {copiedLink ? <Check size={14} /> : <Link2 size={14} />}
                <span>{copiedLink ? (isRTL ? 'تم النسخ!' : 'Copied!') : t('share_link')}</span>
              </button>
            </div>
          </div>

          {shareFeedback && (
            <div
              style={{
                fontSize: '0.82rem',
                color: 'var(--gold-bright)',
                background: 'rgba(10, 42, 31, 0.95)',
                padding: '8px 14px',
                borderRadius: '8px',
                marginBottom: '1rem',
                textAlign: 'center',
                animation: 'fadeIn 0.2s ease'
              }}
            >
              {shareFeedback}
            </div>
          )}

          {(isSold || isRented) && (
            <div
              style={{
                background: isSold ? 'rgba(239, 68, 68, 0.12)' : 'rgba(139, 92, 246, 0.12)',
                border: isSold ? '1.5px solid rgba(239, 68, 68, 0.45)' : '1.5px solid rgba(139, 92, 246, 0.45)',
                borderRadius: '10px',
                padding: '12px 16px',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: isSold ? '#dc2626' : '#7c3aed',
                fontWeight: 700,
                fontSize: '0.9rem'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>⚠️</span>
              <span>{isSold ? t('marketplace_sold_out') : t('marketplace_rented_out')}</span>
            </div>
          )}

          {/* Seller Contact Card */}
          <div className="modal-seller">
            <div>
              <div className="modal-seller-name">{listing.seller_name || listing.seller}</div>
              <div className="modal-seller-sub">
                WhatsApp: <strong dir="ltr">{contactNumber}</strong>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <a
                href={getWhatsAppUrl(listing)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp-modal"
                title={t('chat_whatsapp')}
              >
                <WhatsAppIcon size={18} color="#ffffff" />
                <span>{t('chat_whatsapp')}</span>
              </a>
              <a
                href={`tel:${contactNumber.replace(/[^0-9+]/g, '')}`}
                className="btn-call-modal"
                title={t('call_seller')}
              >
                <Phone size={15} />
                <span>{t('call_seller')}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
