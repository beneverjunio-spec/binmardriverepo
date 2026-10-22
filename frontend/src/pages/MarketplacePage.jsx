import React from 'react';
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

      {/* Vehicle Browse Grid */}
      <div className="browse" id="browse">
        <div className="browse-head">
          <div>
            <h2>{t('browse_title')}</h2>
            <p>{t('showing_verified', { count: listings.length })}</p>
          </div>
          <div className="browse-controls">
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
