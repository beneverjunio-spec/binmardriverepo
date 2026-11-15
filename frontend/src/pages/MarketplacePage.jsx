import React, { useMemo, useState } from 'react';
import { Share2, ExternalLink, ShieldCheck, Building2, Check } from 'lucide-react';
import HeroSection from '../components/marketplace/HeroSection';
import TrustBanner from '../components/marketplace/TrustBanner';
import CategoryStrip from '../components/marketplace/CategoryStrip';
import ListingCard from '../components/marketplace/ListingCard';
import GooglePlayBadge from '../components/common/GooglePlayBadge';
import { useLanguage } from '../context/LanguageContext';
import { generateSellerSlug, getSellerUrl } from '../utils/seo';

export default function MarketplacePage({
  listings,
  selectedMake,
  setSelectedMake,
  selectedCountry,
  setSelectedCountry,
  selectedType,
  setSelectedType,
  selectedSeller,
  setSelectedSeller,
  registeredSellers = [],
  maxPrice,
  setMaxPrice,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  onSelectListing,
  onPostListingClick
}) {
  const { t } = useLanguage();
  const [copiedSellerLink, setCopiedSellerLink] = useState(false);

  // Combine registered sellers and active listing sellers to ensure comprehensive filter options
  const sellerOptions = useMemo(() => {
    const map = new Map();
    (registeredSellers || []).forEach(s => {
      const name = (s.company_name || s.name || '').trim();
      if (name && !map.has(name.toLowerCase())) {
        map.set(name.toLowerCase(), { id: s.id, name, company_name: name });
      }
    });
    (listings || []).forEach(l => {
      const name = (l.seller_name || '').trim();
      if (name && !map.has(name.toLowerCase())) {
        map.set(name.toLowerCase(), { id: l.seller_id || name, name, company_name: name });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [registeredSellers, listings]);

  return (
    <div>
      {/* Hero Section */}
      <HeroSection
        selectedMake={selectedMake}
        setSelectedMake={setSelectedMake}
        selectedCountry={selectedCountry}
        setSelectedCountry={setSelectedCountry}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        selectedSeller={selectedSeller}
        setSelectedSeller={setSelectedSeller}
        registeredSellers={sellerOptions}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
      />

      {/* Trust Metrics */}
      <TrustBanner listings={listings} listingsCount={listings.length} selectedCountry={selectedCountry} />

      {/* Category Chips, Type Filters & Sort/Seller Dropdowns Strip */}
      <CategoryStrip
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        selectedSeller={selectedSeller}
        setSelectedSeller={setSelectedSeller}
        sellerOptions={sellerOptions}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {/* Registered Sellers Quick Filter Strip */}
      {sellerOptions && sellerOptions.length > 0 && (
        <div className="seller-strip">
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {t('label_seller')}:
          </span>
          <button
            type="button"
            onClick={() => setSelectedSeller('')}
            style={{
              padding: '5px 14px',
              borderRadius: '20px',
              border: selectedSeller === '' ? '1.5px solid #d4af37' : '1px solid #cbd5e1',
              background: selectedSeller === '' ? '#d4af37' : '#ffffff',
              color: selectedSeller === '' ? '#071e16' : '#1e293b',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
          >
            {t('tab_all')}
          </button>
          {sellerOptions.map(s => {
            const val = s.company_name || s.name;
            const isSelected = selectedSeller.toLowerCase() === val.toLowerCase();
            return (
              <button
                key={s.id || val}
                type="button"
                onClick={() => setSelectedSeller(isSelected ? '' : val)}
                style={{
                  padding: '5px 14px',
                  borderRadius: '20px',
                  border: isSelected ? '1.5px solid #d4af37' : '1px solid #cbd5e1',
                  background: isSelected ? '#d4af37' : '#ffffff',
                  color: isSelected ? '#071e16' : '#1e293b',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
              >
                {val}
              </button>
            );
          })}
        </div>
      )}

      {/* Vehicle Browse Grid */}
      <div className="browse" id="browse">
        {/* Active Seller Showroom SEO Showcase Banner */}
        {selectedSeller && (
          <div className="seller-showcase-banner">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', position: 'relative', zIndex: 1 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  <span style={{
                    fontSize: '0.74rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'var(--gold-bright)',
                    fontWeight: 800,
                    background: 'rgba(212, 175, 55, 0.2)',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    border: '1px solid rgba(212, 175, 55, 0.45)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <ShieldCheck size={13} />
                    {t('seller_canonical_label') || 'Verified Seller Showroom'}
                  </span>
                  <span style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 600 }}>
                    /seller/{generateSellerSlug(selectedSeller)}
                  </span>
                </div>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '4px 0 8px 0', color: '#ffffff', fontFamily: "'Fraunces', serif" }}>
                  {selectedSeller}
                </h1>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#cbd5e1' }}>
                  {t('showing_verified', { count: listings.length })}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => {
                    const fullUrl = `${window.location.origin}${getSellerUrl(selectedSeller)}`;
                    navigator.clipboard?.writeText(fullUrl);
                    setCopiedSellerLink(true);
                    setTimeout(() => setCopiedSellerLink(false), 2500);
                  }}
                  className="btn-outline-gold"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem' }}
                >
                  {copiedSellerLink ? <Check size={14} /> : <Share2 size={14} />}
                  <span>{copiedSellerLink ? (t('seller_link_copied') || 'Copied!') : (t('seller_copy_link') || 'Copy Showroom Link')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedSeller('')}
                  className="btn-gold"
                  style={{ fontSize: '0.84rem' }}
                >
                  {t('seller_show_all') || 'View All Vehicles'} &times;
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="browse-head">
          <div>
            <h2>{selectedSeller ? `${selectedSeller} — ${t('seller_showroom_title') || 'Showroom Inventory'}` : t('browse_title')}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <p style={{ margin: 0 }}>{t('showing_verified', { count: listings.length })}</p>
              {selectedSeller && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(212, 175, 55, 0.15)',
                  border: '1px solid rgba(212, 175, 55, 0.4)',
                  padding: '3px 10px',
                  borderRadius: '16px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--ink)'
                }}>
                  {t('seller_filter_active')}: <strong>{selectedSeller}</strong>
                  <button
                    onClick={() => setSelectedSeller('')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      lineHeight: 1,
                      padding: 0,
                      marginLeft: '2px',
                      color: 'var(--ink)'
                    }}
                    title={t('clear_filter')}
                  >
                    &times;
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="grid">
          {listings.length > 0 ? (
            listings.map((listing, index) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                index={index}
                onSelect={onSelectListing}
                onSelectSeller={setSelectedSeller}
              />
            ))
          ) : (
            <div className="empty" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', gridColumn: '1 / -1' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>🚗</div>
              <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.4rem', color: 'var(--ink)', marginBottom: '0.5rem' }}>
                {t('no_listings_title')}
              </h3>
              <p style={{ color: 'var(--ink-soft)', maxWidth: '420px', margin: '0 auto 1.5rem', fontSize: '0.92rem', lineHeight: '1.5' }}>
                {selectedMake || selectedCountry || selectedType || selectedCategory || maxPrice || selectedSeller
                  ? (t('no_listings_desc'))
                  : (t('no_listings_desc'))}
              </p>
              {selectedSeller ? (
                <button className="btn-gold" onClick={() => setSelectedSeller('')}>
                  {t('seller_show_all') || 'View All Vehicles'}
                </button>
              ) : (
                <button className="btn-gold" onClick={onPostListingClick}>
                  {t('nav_post_listing')}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Google Play Store Promotion on Marketplace & Seller Pages */}
        <div style={{ marginTop: '3.5rem' }}>
          <GooglePlayBadge variant="promo" />
        </div>
      </div>
    </div>
  );
}
