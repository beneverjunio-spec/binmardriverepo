import React from 'react';
import HeroSection from '../components/marketplace/HeroSection';
import TrustBanner from '../components/marketplace/TrustBanner';
import CategoryStrip from '../components/marketplace/CategoryStrip';
import ListingCard from '../components/marketplace/ListingCard';

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
            <h2>Browse listings</h2>
            <p>Showing {listings.length} live verified listing{listings.length === 1 ? '' : 's'}</p>
          </div>
          <div className="browse-controls">
            <div className="tab-pair">
              <div
                className={`tab-opt ${selectedType === '' ? 'on' : ''}`}
                onClick={() => setSelectedType('')}
              >
                All
              </div>
              <div
                className={`tab-opt ${selectedType === 'sale' ? 'on' : ''}`}
                onClick={() => setSelectedType('sale')}
              >
                For sale
              </div>
              <div
                className={`tab-opt ${selectedType === 'rent' ? 'on' : ''}`}
                onClick={() => setSelectedType('rent')}
              >
                For rent
              </div>
            </div>
            <select className="sort" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="newest">Newest first</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
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
                No active listings yet
              </h3>
              <p style={{ color: 'var(--ink-soft)', maxWidth: '420px', margin: '0 auto 1.5rem', fontSize: '0.92rem', lineHeight: '1.5' }}>
                {selectedMake || selectedCountry || selectedType || selectedCategory || maxPrice
                  ? 'No vehicles found matching your current filters. Try resetting search criteria.'
                  : 'All test data has been cleared. Post your vehicle now to become the first live verified listing on BinmarDrive!'}
              </p>
              <button className="btn-gold" onClick={onPostListingClick}>
                Post a listing — free
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Post a Listing Banner */}
      <div
        className="cta"
        style={{
          background: 'linear-gradient(160deg, var(--deep) 0%, var(--deep-2) 100%)',
          padding: '3rem 2rem',
          textAlign: 'center',
          color: '#F5EFE0'
        }}
      >
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.8rem', marginBottom: '8px' }}>
          Have a car to sell? <em style={{ color: 'var(--gold-bright)' }}>List it free</em>, today.
        </h2>
        <p style={{ color: 'var(--sage)', marginBottom: '1.5rem', fontSize: '0.92rem' }}>
          No commission, no listing fees &mdash; for individual owners, dealers and companies.
        </p>
        <button className="btn-gold" onClick={onPostListingClick}>
          Post a listing
        </button>
      </div>
    </div>
  );
}
