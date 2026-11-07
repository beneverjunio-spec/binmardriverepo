import React, { useMemo } from 'react';
import HeroSection from '../components/marketplace/HeroSection';
import TrustBanner from '../components/marketplace/TrustBanner';
import CategoryStrip from '../components/marketplace/CategoryStrip';
import ListingCard from '../components/marketplace/ListingCard';
import { useLanguage } from '../context/LanguageContext';

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

      {/* Category Chips Strip */}
      <CategoryStrip
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {/* Registered Sellers Quick Filter Strip */}
      {sellerOptions && sellerOptions.length > 0 && (
        <div className="seller-strip" style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          padding: '0.4rem 1.2rem 1.2rem',
          maxWidth: '1140px',
          margin: '0 auto',
          alignItems: 'center'
        }}>
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
        <div className="browse-head">
          <div>
            <h2>{t('browse_title')}</h2>
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
          <div className="browse-controls">
            <select
              className="sort"
              value={selectedSeller}
              onChange={e => setSelectedSeller(e.target.value)}
              title={t('label_seller')}
              style={{ minWidth: '130px', fontWeight: selectedSeller ? '700' : '500' }}
            >
              <option value="">{t('any_seller')}</option>
              {sellerOptions.map(seller => {
                const val = seller.company_name || seller.name;
                return (
                  <option key={seller.id || val} value={val}>
                    {val}
                  </option>
                );
              })}
            </select>
            <div className="tab-pair">
              <div
                className={`tab-opt ${selectedType === '' ? 'on' : ''}`}
                onClick={() => setSelectedType('')}
              >
                {t('tab_all')}
              </div>
              <div
                className={`tab-opt ${selectedType === 'sale' ? 'on' : ''}`}
                onClick={() => setSelectedType('sale')}
              >
                {t('tab_sale')}
              </div>
              <div
                className={`tab-opt ${selectedType === 'rent' ? 'on' : ''}`}
                onClick={() => setSelectedType('rent')}
              >
                {t('tab_rent')}
              </div>
            </div>
            <select className="sort" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="newest">{t('sort_newest')}</option>
              <option value="low">{t('sort_low')}</option>
              <option value="high">{t('sort_high')}</option>
            </select>
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
              />
            ))
          ) : (
            <div className="empty" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', gridColumn: '1 / -1' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>🚗</div>
              <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.4rem', color: 'var(--ink)', marginBottom: '0.5rem' }}>
                {t('no_listings_title')}
              </h3>
              <p style={{ color: 'var(--ink-soft)', maxWidth: '420px', margin: '0 auto 1.5rem', fontSize: '0.92rem', lineHeight: '1.5' }}>
                {selectedMake || selectedCountry || selectedType || selectedCategory || maxPrice
                  ? (t('no_listings_desc'))
                  : (t('no_listings_desc'))}
              </p>
              <button className="btn-gold" onClick={onPostListingClick}>
                {t('nav_post_listing')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
