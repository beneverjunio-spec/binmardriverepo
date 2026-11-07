import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Calendar,
  Gauge,
  Fuel,
  Car,
  Phone,
  ArrowLeft,
  Share2,
  Check,
  Building2,
  User,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Tag,
  Clock,
  Sparkles
} from 'lucide-react';
import { CARD_GRADIENTS } from '../constants';
import { WhatsAppIcon, getWhatsAppUrl, openGoogleMaps } from '../components/common/WhatsAppIcon';
import { useLanguage } from '../context/LanguageContext';
import { getVehicleUrl, getVehicleCanonicalUrl, generateVehicleSlug } from '../utils/seo';

// Branded SVGs for Social Sharing
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

export default function VehicleDetailPage({
  listing,
  onBack,
  onSelectMake,
  notify
}) {
  const { t, isRTL } = useLanguage();
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [shareFeedback, setShareFeedback] = useState('');

  // Extract photos safely
  const rawImages = typeof listing?.images === 'string'
    ? JSON.parse(listing.images || '[]')
    : (Array.isArray(listing?.images) ? listing.images : []);
  const photos = (rawImages || []).filter(url => typeof url === 'string' && url.trim().length > 0);
  const hasPhotos = photos.length > 0;

  // SEO & Share metadata
  const canonicalUrl = listing ? getVehicleCanonicalUrl(listing) : 'https://binmardrive.binmargroup.com/';
  const isRent = (listing?.listing_type || listing?.type) === 'rent';
  const isSold = listing?.sale_status === 'sold';
  const isRented = listing?.sale_status === 'rented';
  const isBrandNew = (listing?.condition_type || listing?.condition) === 'new';

  const typeLabel = isRent ? t('for_rent') : t('for_sale');
  const condLabel = isBrandNew ? t('cond_brand_new') : t('cond_used');
  const transLabel = (listing?.transmission || '').toLowerCase().includes('man') ? t('trans_manual') : t('trans_auto');
  const locationText = listing?.location || [listing?.city, listing?.country].filter(Boolean).join(', ') || `${listing?.city || 'Dubai'}, ${listing?.country || 'United Arab Emirates'}`;
  const contactNumber = listing?.whatsapp_number || listing?.contact_phone || '+971 50 123 4567';

  // Client-Side Meta Tags & Structured Data Injection
  useEffect(() => {
    if (!listing) return;

    const pageTitle = `${listing.year || ''} ${listing.make || ''} ${listing.model || ''} for ${isRent ? 'Rent' : 'Sale'} in ${listing.city || 'Dubai'} | BinmarDrive AED ${Number(listing.price || 0).toLocaleString()}`.trim();
    document.title = pageTitle;

    // Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    const descText = listing.description?.slice(0, 160) ||
      `Find this ${listing.year} ${listing.make} ${listing.model} for ${isRent ? 'rent' : 'sale'} in ${listing.city}, ${listing.country}. Price: ${listing.currency || 'AED'} ${Number(listing.price || 0).toLocaleString()}. Verified vehicle on BinmarDrive.`;
    metaDesc.content = descText;

    // Canonical link tag
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.rel = 'canonical';
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.href = canonicalUrl;

    // Schema.org JSON-LD tag
    let scriptTag = document.getElementById('vehicle-jsonld');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'vehicle-jsonld';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    const schemaData = {
      '@context': 'https://schema.org',
      '@type': ['Car', 'Product'],
      name: listing.title,
      description: descText,
      image: photos.length > 0 ? photos : ['https://binmardrive.binmargroup.com/binmardrive-logo-transparent.png'],
      brand: { '@type': 'Brand', name: listing.make },
      model: listing.model,
      productionDate: String(listing.year || ''),
      vehicleTransmission: listing.transmission || 'Automatic',
      fuelType: listing.fuel || 'Petrol',
      itemCondition: isBrandNew ? 'https://schema.org/NewCondition' : 'https://schema.org/UsedCondition',
      offers: {
        '@type': 'Offer',
        priceCurrency: listing.currency || 'AED',
        price: Number(listing.price || 0),
        availability: (isSold || isRented) ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
        url: canonicalUrl,
        seller: {
          '@type': 'Organization',
          name: listing.seller_name || 'BinmarDrive Verified Dealer'
        }
      }
    };
    scriptTag.text = JSON.stringify(schemaData);

    return () => {
      document.title = 'Binmar Drive — Buy, sell or rent a car, free across the Middle East';
      if (scriptTag && scriptTag.parentNode) {
        scriptTag.parentNode.removeChild(scriptTag);
      }
    };
  }, [listing, canonicalUrl, isRent, isSold, isRented, isBrandNew, photos]);

  if (!listing) {
    return (
      <div style={{ maxWidth: '800px', margin: '4rem auto', textAlign: 'center', padding: '2rem' }}>
        <h1 style={{ color: 'var(--gold, #d4af37)', fontSize: '2rem', marginBottom: '1rem' }}>
          Vehicle Listing Not Found
        </h1>
        <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
          This vehicle listing may have been sold, removed, or is no longer available on BinmarDrive.
        </p>
        <button
          className="btn-primary"
          onClick={onBack}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <ArrowLeft size={16} /> Return to Marketplace
        </button>
      </div>
    );
  }

  // Social sharing handlers
  const shareTitle = `${listing.title} - ${listing.price_label || 'AED ' + Number(listing.price).toLocaleString()} on BinmarDrive`;

  const handleCopyLink = async (e) => {
    e.preventDefault();
    try {
      if (navigator.share && /mobile|android|iphone/i.test(navigator.userAgent)) {
        await navigator.share({
          title: shareTitle,
          text: `${listing.title} on BinmarDrive!`,
          url: canonicalUrl
        });
        return;
      }
    } catch {}

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(canonicalUrl);
      }
      setCopiedLink(true);
      setShareFeedback(t('share_link_copied'));
      if (notify) notify('Vehicle link copied to clipboard!');
      setTimeout(() => {
        setCopiedLink(false);
        setShareFeedback('');
      }, 3500);
    } catch {
      setShareFeedback(canonicalUrl);
    }
  };

  const handleShareFacebook = (e) => {
    e.preventDefault();
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonicalUrl)}&quote=${encodeURIComponent(shareTitle)}`;
    window.open(fbUrl, '_blank', 'width=620,height=580,menubar=no,toolbar=no');
  };

  const handleShareInstagram = async (e) => {
    e.preventDefault();
    try {
      if (navigator.clipboard) await navigator.clipboard.writeText(canonicalUrl);
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
      if (navigator.clipboard) await navigator.clipboard.writeText(canonicalUrl);
      setShareFeedback(t('share_tiktok_copied'));
      setTimeout(() => setShareFeedback(''), 4500);
      window.open('https://www.tiktok.com/', '_blank');
    } catch {
      window.open('https://www.tiktok.com/', '_blank');
    }
  };

  const isCompany = listing.user_type === 'company' || (listing.seller_name && !listing.seller_name.toLowerCase().includes('private'));

  return (
    <article className="vehicle-page-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1rem 4rem' }}>
      {/* Crawlable Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" style={{ marginBottom: '1.25rem', fontSize: '0.82rem', color: '#94a3b8' }}>
        <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px' }}>
          <li>
            <a href="/" onClick={(e) => { e.preventDefault(); onBack(); }} style={{ color: 'var(--gold, #d4af37)', textDecoration: 'none' }}>
              Home
            </a>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <a href={`/?type=${isRent ? 'rent' : 'sale'}`} style={{ color: 'var(--gold, #d4af37)', textDecoration: 'none' }}>
              {isRent ? 'Cars for Rent' : 'Cars for Sale'}
            </a>
          </li>
          <li aria-hidden="true">/</li>
          {listing.make && (
            <>
              <li>
                <a
                  href={`/?make=${encodeURIComponent(listing.make)}`}
                  onClick={(e) => {
                    if (onSelectMake) {
                      e.preventDefault();
                      onSelectMake(listing.make);
                      onBack();
                    }
                  }}
                  style={{ color: 'var(--gold, #d4af37)', textDecoration: 'none' }}
                >
                  {listing.make}
                </a>
              </li>
              <li aria-hidden="true">/</li>
            </>
          )}
          <li aria-current="page" style={{ color: '#cbd5e1', fontWeight: 600 }}>
            {listing.title}
          </li>
        </ol>
      </nav>

      {/* Back button & Share Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#f8fafc',
            padding: '7px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.85rem',
            fontWeight: 600
          }}
        >
          <ArrowLeft size={16} /> {t('back_to_marketplace') || 'Back to Marketplace'}
        </button>

        {/* Share buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8', marginRight: '4px' }}>Share:</span>
          <button
            type="button"
            className="share-btn link-btn"
            onClick={handleCopyLink}
            title="Copy unique link to vehicle"
            style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
          >
            {copiedLink ? <Check size={14} style={{ color: '#4ade80' }} /> : <Share2 size={14} />}
            <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
          </button>
          <button type="button" className="share-btn fb-btn" onClick={handleShareFacebook} title="Share on Facebook">
            <FacebookIcon size={14} />
          </button>
          <button type="button" className="share-btn ig-btn" onClick={handleShareInstagram} title="Share on Instagram">
            <InstagramIcon size={14} />
          </button>
          <button type="button" className="share-btn tt-btn" onClick={handleShareTikTok} title="Share on TikTok">
            <TikTokIcon size={14} />
          </button>
          {shareFeedback && (
            <span style={{ fontSize: '0.74rem', color: '#4ade80', marginLeft: '6px' }}>{shareFeedback}</span>
          )}
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 1fr)', gap: '2rem' }}>
        {/* Left Column: Photos & Description */}
        <div>
          {/* Main Hero Photo */}
          <div
            style={{
              width: '100%',
              height: '420px',
              borderRadius: '16px',
              overflow: 'hidden',
              background: hasPhotos
                ? `url(${photos[activePhotoIdx % photos.length]}) center/cover no-repeat`
                : CARD_GRADIENTS[(listing.id) % CARD_GRADIENTS.length],
              border: '1px solid rgba(212, 175, 55, 0.35)',
              position: 'relative',
              boxShadow: '0 12px 35px rgba(0, 0, 0, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* Badges Overlay */}
            <div style={{ position: 'absolute', top: '16px', left: isRTL ? 'auto' : '16px', right: isRTL ? '16px' : 'auto', display: 'flex', gap: '8px', zIndex: 3 }}>
              <span style={{
                background: isRent ? 'rgba(59, 130, 246, 0.95)' : 'rgba(34, 197, 94, 0.95)',
                color: '#fff',
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}>
                {typeLabel}
              </span>

              <span style={{
                background: 'rgba(0, 0, 0, 0.75)',
                color: 'var(--gold, #d4af37)',
                border: '1px solid rgba(212, 175, 55, 0.5)',
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700
              }}>
                {condLabel}
              </span>
            </div>

            {/* Sold / Rented Banner */}
            {(isSold || isRented) && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.55)',
                backdropFilter: 'blur(3px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 4
              }}>
                <span style={{
                  transform: 'rotate(-8deg)',
                  background: isSold ? '#dc2626' : '#7c3aed',
                  color: '#ffffff',
                  padding: '10px 32px',
                  borderRadius: '10px',
                  fontWeight: 900,
                  fontSize: '1.75rem',
                  letterSpacing: '0.12em',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.7)',
                  border: '3px solid rgba(255,255,255,0.95)',
                  textTransform: 'uppercase'
                }}>
                  {isSold ? '● SOLD OUT' : '● CURRENTLY RENTED'}
                </span>
              </div>
            )}

            {/* Photo Navigation Arrows */}
            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={() => setActivePhotoIdx(prev => (prev === 0 ? photos.length - 1 : prev - 1))}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(0,0,0,0.65)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '38px',
                    height: '38px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 5
                  }}
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={() => setActivePhotoIdx(prev => (prev === photos.length - 1 ? 0 : prev + 1))}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(0,0,0,0.65)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '38px',
                    height: '38px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 5
                  }}
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}

            {/* Image Counter */}
            {photos.length > 0 && (
              <span style={{
                position: 'absolute',
                bottom: '14px',
                right: '14px',
                background: 'rgba(0, 0, 0, 0.75)',
                color: '#fff',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.74rem',
                fontWeight: 700,
                zIndex: 3
              }}>
                {activePhotoIdx + 1} / {photos.length} Photos
              </span>
            )}
          </div>

          {/* Thumbnails Row */}
          {photos.length > 1 && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px', overflowX: 'auto', paddingBottom: '6px' }}>
              {photos.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActivePhotoIdx(i)}
                  style={{
                    width: '74px',
                    height: '52px',
                    borderRadius: '8px',
                    border: activePhotoIdx === i ? '2px solid var(--gold, #d4af37)' : '1px solid rgba(255,255,255,0.15)',
                    padding: 0,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    flexShrink: 0,
                    background: '#131b24',
                    opacity: activePhotoIdx === i ? 1 : 0.65
                  }}
                >
                  <img
                    src={src}
                    alt={`${listing.title} - Photo ${i + 1}`}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Vehicle Description Section */}
          <div style={{
            marginTop: '2rem',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <h2 style={{ fontSize: '1.15rem', color: '#f8fafc', fontWeight: 700, marginBottom: '0.75rem' }}>
              Vehicle Overview & Details
            </h2>
            <div style={{
              color: '#cbd5e1',
              fontSize: '0.92rem',
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap'
            }}>
              {listing.description || 'No specific description provided by seller. Please contact seller for inspection and complete service history.'}
            </div>

            {/* Official Mulkiya & Registration Status */}
            {(listing.document_name || listing.document_file) && (
              <div style={{
                marginTop: '1.25rem',
                padding: '12px 16px',
                borderRadius: '8px',
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <ShieldCheck size={20} style={{ color: '#4ade80', flexShrink: 0 }} />
                <div style={{ fontSize: '0.82rem', color: '#e2e8f0' }}>
                  <strong>Mulkiya / Registration Verified</strong>
                  <div style={{ color: '#94a3b8', fontSize: '0.76rem' }}>
                    Document on file: {listing.document_name || listing.document_file}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Key Specifications, Pricing & Contact */}
        <div>
          {/* Header & H1 Heading */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold, #d4af37)', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
              <span>{listing.make}</span>
              <span>&bull;</span>
              <span>{listing.model}</span>
              <span>&bull;</span>
              <span>{listing.year}</span>
            </div>

            <h1 style={{
              fontSize: '1.85rem',
              fontWeight: 800,
              color: '#f8fafc',
              lineHeight: 1.25,
              margin: '0 0 10px 0'
            }}>
              {listing.title}
            </h1>

            {/* Location */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.85rem',
                color: '#94a3b8',
                cursor: 'pointer'
              }}
              onClick={(e) => openGoogleMaps(locationText, e)}
              title="View location on Google Maps"
            >
              <MapPin size={15} style={{ color: 'var(--gold, #d4af37)' }} />
              <span style={{ textDecoration: 'underline' }}>{locationText}</span>
              <ExternalLink size={12} />
            </div>
          </div>

          {/* Pricing Box */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15), rgba(15, 30, 24, 0.5))',
            border: '1px solid rgba(212, 175, 55, 0.4)',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
              {isRent ? 'Rental Rate' : 'Asking Price'}
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--gold, #d4af37)', marginTop: '4px' }}>
              {listing.price_label || `${listing.currency || 'AED'} ${Number(listing.price || 0).toLocaleString()}`}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#4ade80', marginTop: '4px', fontWeight: 600 }}>
              ✓ No buyer commission &bull; Direct dealer / owner pricing
            </div>
          </div>

          {/* Specifications Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            marginBottom: '1.75rem'
          }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Calendar size={13} style={{ color: 'var(--gold, #d4af37)' }} /> Year
              </div>
              <div style={{ fontSize: '0.96rem', fontWeight: 700, color: '#f8fafc', marginTop: '3px' }}>
                {listing.year}
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Gauge size={13} style={{ color: 'var(--gold, #d4af37)' }} /> Mileage
              </div>
              <div style={{ fontSize: '0.96rem', fontWeight: 700, color: '#f8fafc', marginTop: '3px' }}>
                {listing.mileage || '0 km'}
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Car size={13} style={{ color: 'var(--gold, #d4af37)' }} /> Transmission
              </div>
              <div style={{ fontSize: '0.96rem', fontWeight: 700, color: '#f8fafc', marginTop: '3px' }}>
                {transLabel}
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Fuel size={13} style={{ color: 'var(--gold, #d4af37)' }} /> Fuel Type
              </div>
              <div style={{ fontSize: '0.96rem', fontWeight: 700, color: '#f8fafc', marginTop: '3px' }}>
                {listing.fuel || 'Petrol'}
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Sparkles size={13} style={{ color: 'var(--gold, #d4af37)' }} /> Condition
              </div>
              <div style={{ fontSize: '0.96rem', fontWeight: 700, color: '#f8fafc', marginTop: '3px' }}>
                {condLabel}
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Tag size={13} style={{ color: 'var(--gold, #d4af37)' }} /> Category
              </div>
              <div style={{ fontSize: '0.96rem', fontWeight: 700, color: '#f8fafc', marginTop: '3px' }}>
                {listing.category || 'SUV'}
              </div>
            </div>
          </div>

          {/* Seller / Dealer Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '1.25rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'rgba(212, 175, 55, 0.15)',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--gold, #d4af37)'
              }}>
                {isCompany ? <Building2 size={20} /> : <User size={20} />}
              </div>
              <div>
                <div style={{ fontWeight: 800, color: '#f8fafc', fontSize: '1rem' }}>
                  {listing.seller_name || listing.seller || 'Verified Dealer'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: isCompany ? 'rgba(212, 175, 55, 0.2)' : 'rgba(96, 165, 250, 0.2)',
                    color: isCompany ? 'var(--gold, #d4af37)' : '#60a5fa',
                    border: isCompany ? '1px solid rgba(212, 175, 55, 0.4)' : '1px solid rgba(96, 165, 250, 0.4)',
                    textTransform: 'uppercase'
                  }}>
                    {isCompany ? 'Commercial Dealer' : 'Private Seller'}
                  </span>
                  <span style={{ fontSize: '0.74rem', color: '#4ade80', fontWeight: 600 }}>
                    ✓ Verified Account
                  </span>
                </div>
              </div>
            </div>

            {/* Direct Contact Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px' }}>
              {/* WhatsApp Button */}
              <a
                href={getWhatsAppUrl(contactNumber, `Hello, I am inquiring about the ${listing.title} listed on BinmarDrive (${canonicalUrl}). Is it still available?`)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: '#25D366',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.94rem',
                  padding: '12px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)',
                  transition: 'opacity 0.2s'
                }}
              >
                <WhatsAppIcon size={20} />
                <span>Chat on WhatsApp</span>
              </a>

              {/* Direct Phone Call */}
              <a
                href={`tel:${contactNumber}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#f8fafc',
                  fontWeight: 700,
                  fontSize: '0.94rem',
                  padding: '12px',
                  borderRadius: '8px',
                  textDecoration: 'none'
                }}
              >
                <Phone size={18} />
                <span>Call {contactNumber}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
