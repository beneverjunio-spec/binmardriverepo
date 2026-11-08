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
  isLoading = false,
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

  // Dynamic specs extraction matching popup / marketplace listings
  const displayYear = listing?.year || '—';

  const displayMileage = (() => {
    if (listing?.mileage === 0 || listing?.mileage === '0') return '0 km';
    if (!listing?.mileage) return '0 km';
    const mStr = String(listing.mileage).trim();
    if (/km$/i.test(mStr)) return mStr;
    const num = Number(mStr.replace(/[^0-9.]/g, ''));
    if (Number.isFinite(num) && num > 0) return `${num.toLocaleString()} km`;
    return `${mStr} km`;
  })();

  const isManual = (listing?.transmission || '').toLowerCase().includes('man');
  const displayTransmission = isManual
    ? (t('trans_manual') || 'Manual')
    : (listing?.transmission || t('trans_auto') || 'Automatic');

  const isBrandNew = (listing?.condition_type || listing?.condition || '').toLowerCase() === 'new' ||
                     (listing?.condition_type || listing?.condition || '').toLowerCase().includes('brand');
  const displayCondition = isBrandNew
    ? (t('cond_brand_new') || 'Brand New')
    : (t('cond_used') || 'Used');

  const displayCategory = listing?.category || 'SUV';
  const displayFuel = listing?.fuel || 'Petrol';

  const typeLabel = isRent ? (t('for_rent') || 'For Rent') : (t('for_sale') || 'For Sale');
  const condLabel = displayCondition;
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

  if (isLoading) {
    return (
      <div style={{ maxWidth: '800px', margin: '6rem auto', textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1.2rem' }}>🚗</div>
        <h2 style={{ color: '#12281F', fontSize: '1.6rem', marginBottom: '0.6rem', fontFamily: 'Fraunces, Georgia, serif', fontWeight: 700 }}>
          Loading vehicle details...
        </h2>
        <p style={{ color: '#5C6F65', fontSize: '0.95rem' }}>Retrieving verified vehicle specifications and media.</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div style={{ maxWidth: '800px', margin: '4rem auto', textAlign: 'center', padding: '2.5rem 1.5rem', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E8E1CE', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
        <h1 style={{ color: '#12281F', fontSize: '2rem', marginBottom: '1rem', fontFamily: 'Fraunces, Georgia, serif', fontWeight: 700 }}>
          Vehicle Listing Not Found
        </h1>
        <p style={{ color: '#5C6F65', marginBottom: '2rem', fontSize: '0.95rem' }}>
          This vehicle listing may have been sold, removed, or is no longer available on BinmarDrive.
        </p>
        <button
          className="btn-primary"
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #C6A15B, #B89327)',
            color: '#12281F',
            fontWeight: 800,
            padding: '12px 28px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer'
          }}
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
      setShareFeedback(t('share_link_copied') || 'Link copied!');
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
      setShareFeedback(t('share_ig_copied') || 'Link copied for Instagram!');
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
      setShareFeedback(t('share_tiktok_copied') || 'Link copied for TikTok!');
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
      <nav aria-label="Breadcrumb" style={{ marginBottom: '1.25rem', fontSize: '0.84rem' }}>
        <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
          <li>
            <a href="/" onClick={(e) => { e.preventDefault(); onBack(); }} style={{ color: '#A87B2E', textDecoration: 'none', fontWeight: 600 }}>
              Home
            </a>
          </li>
          <li aria-hidden="true" style={{ color: '#8C9B92' }}>/</li>
          <li>
            <a href={`/?type=${isRent ? 'rent' : 'sale'}`} style={{ color: '#A87B2E', textDecoration: 'none', fontWeight: 600 }}>
              {isRent ? 'Cars for Rent' : 'Cars for Sale'}
            </a>
          </li>
          <li aria-hidden="true" style={{ color: '#8C9B92' }}>/</li>
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
                  style={{ color: '#A87B2E', textDecoration: 'none', fontWeight: 600 }}
                >
                  {listing.make}
                </a>
              </li>
              <li aria-hidden="true" style={{ color: '#8C9B92' }}>/</li>
            </>
          )}
          <li aria-current="page" style={{ color: '#12281F', fontWeight: 700 }}>
            {listing.title}
          </li>
        </ol>
      </nav>

      {/* Back button & Share Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '10px' }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            background: '#FFFFFF',
            border: '1px solid #E8E1CE',
            color: '#12281F',
            padding: '8px 18px',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.88rem',
            fontWeight: 700,
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
            transition: 'background 0.15s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#F5EFE1'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#FFFFFF'}
        >
          <ArrowLeft size={16} /> {t('back_to_marketplace') || 'Back to Marketplace'}
        </button>

        {/* Share buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.82rem', color: '#5C6F65', fontWeight: 700, marginRight: '4px' }}>Share:</span>
          <button
            type="button"
            className="share-btn link-btn"
            onClick={handleCopyLink}
            title="Copy unique link to vehicle"
            style={{
              padding: '7px 14px',
              fontSize: '0.8rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#FFFFFF',
              border: '1px solid #E8E1CE',
              color: '#12281F',
              borderRadius: '8px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {copiedLink ? <Check size={14} style={{ color: '#16A34A' }} /> : <Share2 size={14} style={{ color: '#C6A15B' }} />}
            <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
          </button>
          <button
            type="button"
            className="share-btn fb-btn"
            onClick={handleShareFacebook}
            title="Share on Facebook"
            style={{
              padding: '7px 10px',
              background: '#FFFFFF',
              border: '1px solid #E8E1CE',
              color: '#1877F2',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            <FacebookIcon size={15} />
          </button>
          <button
            type="button"
            className="share-btn ig-btn"
            onClick={handleShareInstagram}
            title="Share on Instagram"
            style={{
              padding: '7px 10px',
              background: '#FFFFFF',
              border: '1px solid #E8E1CE',
              color: '#E4405F',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            <InstagramIcon size={15} />
          </button>
          <button
            type="button"
            className="share-btn tt-btn"
            onClick={handleShareTikTok}
            title="Share on TikTok"
            style={{
              padding: '7px 10px',
              background: '#FFFFFF',
              border: '1px solid #E8E1CE',
              color: '#000000',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            <TikTokIcon size={15} />
          </button>
          {shareFeedback && (
            <span style={{ fontSize: '0.8rem', color: '#16A34A', fontWeight: 700, marginLeft: '6px' }}>{shareFeedback}</span>
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
              border: '1px solid #E8E1CE',
              position: 'relative',
              boxShadow: '0 12px 30px rgba(10, 42, 31, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* Badges Overlay */}
            <div style={{ position: 'absolute', top: '16px', left: isRTL ? 'auto' : '16px', right: isRTL ? '16px' : 'auto', display: 'flex', gap: '8px', zIndex: 3 }}>
              <span style={{
                background: isRent ? '#2563EB' : '#16A34A',
                color: '#ffffff',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                boxShadow: '0 2px 8px rgba(0,0,0,0.25)'
              }}>
                {typeLabel}
              </span>

              <span style={{
                background: 'rgba(10, 42, 31, 0.9)',
                color: '#E4C374',
                border: '1px solid #C6A15B',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                boxShadow: '0 2px 8px rgba(0,0,0,0.25)'
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
                  background: isSold ? '#DC2626' : '#7C3AED',
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
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(10, 42, 31, 0.75)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 5,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                  }}
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={() => setActivePhotoIdx(prev => (prev === photos.length - 1 ? 0 : prev + 1))}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(10, 42, 31, 0.75)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 5,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                  }}
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* Image Counter */}
            {photos.length > 0 && (
              <span style={{
                position: 'absolute',
                bottom: '14px',
                right: '14px',
                background: 'rgba(10, 42, 31, 0.85)',
                color: '#FFFFFF',
                padding: '4px 12px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 700,
                border: '1px solid rgba(255,255,255,0.2)',
                zIndex: 3
              }}>
                {activePhotoIdx + 1} / {photos.length} Photos
              </span>
            )}
          </div>

          {/* Thumbnails Row */}
          {photos.length > 1 && (
            <div style={{ display: 'flex', gap: '10px', marginTop: '12px', overflowX: 'auto', paddingBottom: '6px' }}>
              {photos.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActivePhotoIdx(i)}
                  style={{
                    width: '80px',
                    height: '56px',
                    borderRadius: '10px',
                    border: activePhotoIdx === i ? '2px solid #C6A15B' : '1px solid #E8E1CE',
                    padding: 0,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    flexShrink: 0,
                    background: '#FFFFFF',
                    boxShadow: activePhotoIdx === i ? '0 0 0 2px rgba(198, 161, 91, 0.3)' : 'none',
                    opacity: activePhotoIdx === i ? 1 : 0.7,
                    transition: 'opacity 0.15s, border 0.15s'
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
            background: '#FFFFFF',
            border: '1px solid #E8E1CE',
            borderRadius: '14px',
            padding: '1.6rem',
            boxShadow: '0 4px 18px rgba(10, 42, 31, 0.04)'
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              color: '#12281F',
              fontWeight: 700,
              fontFamily: "'Fraunces', Georgia, serif",
              marginBottom: '0.9rem'
            }}>
              Vehicle Overview & Details
            </h2>
            <div style={{
              color: '#334155',
              fontSize: '0.95rem',
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap'
            }}>
              {listing.description || 'No specific description provided by seller. Please contact seller for inspection and complete service history.'}
            </div>

            {/* Official Mulkiya & Registration Status */}
            {(listing.document_name || listing.document_file) && (
              <div style={{
                marginTop: '1.4rem',
                padding: '14px 18px',
                borderRadius: '10px',
                background: '#F0FDF4',
                border: '1px solid #86EFAC',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <ShieldCheck size={22} style={{ color: '#16A34A', flexShrink: 0 }} />
                <div style={{ fontSize: '0.88rem' }}>
                  <strong style={{ color: '#14532D', display: 'block', marginBottom: '2px' }}>
                    Mulkiya / Registration Verified
                  </strong>
                  <div style={{ color: '#166534', fontSize: '0.8rem' }}>
                    Document on file: <span style={{ fontWeight: 600 }}>{listing.document_name || listing.document_file}</span>
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
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#A87B2E',
              fontSize: '0.86rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '6px'
            }}>
              <span>{listing.make}</span>
              <span>&bull;</span>
              <span>{listing.model}</span>
              <span>&bull;</span>
              <span>{listing.year}</span>
            </div>

            <h1 style={{
              fontSize: '2.1rem',
              fontWeight: 700,
              color: '#12281F',
              fontFamily: "'Fraunces', Georgia, serif",
              lineHeight: 1.25,
              margin: '4px 0 10px 0'
            }}>
              {listing.title}
            </h1>

            {/* Location */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.9rem',
                color: '#5C6F65',
                cursor: 'pointer',
                fontWeight: 600
              }}
              onClick={(e) => openGoogleMaps(locationText, e)}
              title="View location on Google Maps"
            >
              <MapPin size={16} style={{ color: '#C6A15B' }} />
              <span style={{ color: '#12281F', textDecoration: 'underline' }}>{locationText}</span>
              <span style={{
                background: '#F3EBD8',
                border: '1px solid #DED6C0',
                color: '#0A2A1F',
                padding: '2px 8px',
                borderRadius: '999px',
                fontSize: '0.72rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}>
                Map <ExternalLink size={10} />
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div style={{
            background: 'linear-gradient(135deg, #0A2A1F 0%, #123B2C 100%)',
            border: '1px solid rgba(198, 161, 91, 0.45)',
            borderRadius: '14px',
            padding: '1.4rem 1.6rem',
            marginBottom: '1.5rem',
            boxShadow: '0 8px 24px rgba(10, 42, 31, 0.15)'
          }}>
            <div style={{ fontSize: '0.78rem', color: '#9FBBA9', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>
              {isRent ? 'Rental Rate' : 'Asking Price'}
            </div>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#E4C374', fontFamily: "'Fraunces', Georgia, serif", margin: '4px 0 6px' }}>
              {listing.price_label || `${listing.currency || 'AED'} ${Number(listing.price || 0).toLocaleString()}${isRent ? ' / day' : ''}`}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#86EFAC', fontWeight: 600 }}>
              ✓ No buyer commission &bull; Direct dealer / owner pricing
            </div>
          </div>

          {/* Specifications Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            marginBottom: '1.5rem'
          }}>
            {/* 1. Year */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E8E1CE',
              padding: '12px 16px',
              borderRadius: '12px',
              boxShadow: '0 2px 6px rgba(10, 42, 31, 0.03)'
            }}>
              <div style={{ fontSize: '0.74rem', color: '#5C6F65', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} style={{ color: '#C6A15B' }} /> {t('modal_year') || 'Year'}
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#12281F', marginTop: '4px' }}>
                {displayYear}
              </div>
            </div>

            {/* 2. Mileage */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E8E1CE',
              padding: '12px 16px',
              borderRadius: '12px',
              boxShadow: '0 2px 6px rgba(10, 42, 31, 0.03)'
            }}>
              <div style={{ fontSize: '0.74rem', color: '#5C6F65', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Gauge size={14} style={{ color: '#C6A15B' }} /> {t('modal_mileage') || 'Mileage'}
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#12281F', marginTop: '4px' }}>
                {displayMileage}
              </div>
            </div>

            {/* 3. Transmission */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E8E1CE',
              padding: '12px 16px',
              borderRadius: '12px',
              boxShadow: '0 2px 6px rgba(10, 42, 31, 0.03)'
            }}>
              <div style={{ fontSize: '0.74rem', color: '#5C6F65', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Car size={14} style={{ color: '#C6A15B' }} /> {t('modal_transmission') || 'Transmission'}
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#12281F', marginTop: '4px' }}>
                {displayTransmission}
              </div>
            </div>

            {/* 4. Fuel Type */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E8E1CE',
              padding: '12px 16px',
              borderRadius: '12px',
              boxShadow: '0 2px 6px rgba(10, 42, 31, 0.03)'
            }}>
              <div style={{ fontSize: '0.74rem', color: '#5C6F65', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Fuel size={14} style={{ color: '#C6A15B' }} /> {t('modal_fuel') || 'Fuel Type'}
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#12281F', marginTop: '4px' }}>
                {displayFuel}
              </div>
            </div>

            {/* 5. Condition */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E8E1CE',
              padding: '12px 16px',
              borderRadius: '12px',
              boxShadow: '0 2px 6px rgba(10, 42, 31, 0.03)'
            }}>
              <div style={{ fontSize: '0.74rem', color: '#5C6F65', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} style={{ color: '#C6A15B' }} /> {t('modal_condition') || 'Condition'}
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#12281F', marginTop: '4px' }}>
                {displayCondition}
              </div>
            </div>

            {/* 6. Category */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E8E1CE',
              padding: '12px 16px',
              borderRadius: '12px',
              boxShadow: '0 2px 6px rgba(10, 42, 31, 0.03)'
            }}>
              <div style={{ fontSize: '0.74rem', color: '#5C6F65', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Tag size={14} style={{ color: '#C6A15B' }} /> {t('modal_category') || 'Category'}
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#12281F', marginTop: '4px' }}>
                {displayCategory}
              </div>
            </div>
          </div>

          {/* Seller / Dealer Card */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E8E1CE',
            borderRadius: '14px',
            padding: '1.4rem',
            marginBottom: '1.5rem',
            boxShadow: '0 4px 18px rgba(10, 42, 31, 0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: '#F5EFE1',
                border: '1px solid #DED6C0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#A87B2E',
                flexShrink: 0
              }}>
                {isCompany ? <Building2 size={22} /> : <User size={22} />}
              </div>
              <div>
                <div style={{ fontWeight: 800, color: '#12281F', fontSize: '1.08rem' }}>
                  {listing.seller_name || listing.seller || 'Verified Dealer'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '5px',
                    background: isCompany ? '#FEF3C7' : '#EFF6FF',
                    color: isCompany ? '#92400E' : '#1E40AF',
                    border: isCompany ? '1px solid #FCD34D' : '1px solid #BFDBFE',
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em'
                  }}>
                    {isCompany ? 'Commercial Dealer' : 'Private Seller'}
                  </span>
                  <span style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '5px',
                    background: '#DCFCE7',
                    color: '#166534',
                    border: '1px solid #BBF7D0'
                  }}>
                    ✓ Verified Account
                  </span>
                </div>
              </div>
            </div>

            {/* Direct Contact Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
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
                  fontWeight: 800,
                  fontSize: '0.96rem',
                  padding: '13px',
                  borderRadius: '10px',
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
                  background: '#FAF7EF',
                  border: '1px solid #E8E1CE',
                  color: '#12281F',
                  fontWeight: 800,
                  fontSize: '0.96rem',
                  padding: '12px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F0EAD8'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#FAF7EF'}
              >
                <Phone size={18} style={{ color: '#C6A15B' }} />
                <span>Call {contactNumber}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
