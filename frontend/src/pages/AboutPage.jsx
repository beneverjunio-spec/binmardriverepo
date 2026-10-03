import React from 'react';

export default function AboutPage({ onExploreMarketplace }) {
  return (
    <div>
      <div className="info-hero">
        <h1>Built to make it <em>free</em> to buy and sell a car.</h1>
        <p>Listing a vehicle for sale or rent shouldn't cost the owner anything.</p>
      </div>
      <div className="info-section">
        <h2>Our Story</h2>
        <p>
          Most classifieds platforms charge sellers high listing fees and extract transaction cuts.
          Binmar Drive is completely free to register and free to list, for individuals, dealers,
          and rental companies alike, across the Middle East &mdash; supported by advertising
          instead of listing fees.
        </p>
        <h2>What We Stand For</h2>
        <p>
          Free to list for everyone. Dealers undergo a verified trade license review before commercial
          listings go live, ensuring buyers can transact with full trust and confidence across
          the UAE, Saudi Arabia, Qatar, Kuwait, Bahrain and Oman.
        </p>
        <button
          className="btn-gold"
          style={{ marginTop: '1.5rem' }}
          onClick={onExploreMarketplace}
        >
          Browse Marketplace
        </button>
      </div>
    </div>
  );
}
