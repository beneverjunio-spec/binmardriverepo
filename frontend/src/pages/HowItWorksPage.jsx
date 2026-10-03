import React from 'react';

export default function HowItWorksPage({ onPostListingClick }) {
  return (
    <div>
      <div className="info-hero">
        <h1>How <em>Binmar Drive</em> works.</h1>
        <p>From registering to a listing going live &mdash; here is the full journey.</p>
      </div>
      <div className="info-section">
        <h2>For Sellers and Dealers</h2>
        <div className="steps4">
          <div className="step-card">
            <div className="step-num">1</div>
            <h3>Register Free</h3>
            <p>Sign up as an individual or company &mdash; commercial dealers attach a trade license.</p>
          </div>
          <div className="step-card">
            <div className="step-num">2</div>
            <h3>Post Your Vehicle</h3>
            <p>Add vehicle details, upload high-res photos, set price and location in a few steps.</p>
          </div>
          <div className="step-card">
            <div className="step-num">3</div>
            <h3>Admin Review</h3>
            <p>New listings enter the admin moderation queue to guarantee marketplace quality.</p>
          </div>
          <div className="step-card">
            <div className="step-num">4</div>
            <h3>Connect & Sell</h3>
            <p>Buyers contact you directly via WhatsApp or call &mdash; zero commission on sale, ever.</p>
          </div>
        </div>

        <h2>For Buyers</h2>
        <div className="steps4">
          <div className="step-card">
            <div className="step-num">1</div>
            <h3>Search & Filter</h3>
            <p>Filter by make, country, price, fuel type, and for sale or rent.</p>
          </div>
          <div className="step-card">
            <div className="step-num">2</div>
            <h3>View Specs</h3>
            <p>Open full vehicle specifications, condition details, and photo gallery.</p>
          </div>
          <div className="step-card">
            <div className="step-num">3</div>
            <h3>Direct Contact</h3>
            <p>Reach out directly to the owner or verified dealer with no middlemen.</p>
          </div>
          <div className="step-card">
            <div className="step-num">4</div>
            <h3>Inspect & Drive</h3>
            <p>Arrange vehicle viewing and complete the deal directly.</p>
          </div>
        </div>

        <button
          className="btn-gold"
          style={{ marginTop: '1.5rem' }}
          onClick={onPostListingClick}
        >
          Post a Listing Now &mdash; Free
        </button>
      </div>
    </div>
  );
}
