import React from 'react';

export default function ContactPage({ onBackToMarketplace }) {
  return (
    <div>
      <div className="info-hero">
        <h1>Get in <em>touch</em>.</h1>
        <p>
          Questions about buying, selling, dealer verification, or partnership &mdash; our team
          is here to assist.
        </p>
      </div>
      <div className="info-section">
        <p><strong>WhatsApp Support:</strong> +971 50 000 0000</p>
        <p><strong>Official Email:</strong> support@binmardrive.com</p>
        <p>
          <strong>Head Office:</strong> Abu Dhabi, United Arab Emirates &mdash; serving UAE, Saudi
          Arabia, Qatar, Kuwait, Bahrain and Oman.
        </p>
        <button
          className="btn-gold"
          style={{ marginTop: '1.5rem' }}
          onClick={onBackToMarketplace}
        >
          Back to Marketplace
        </button>
      </div>
    </div>
  );
}
