import React from 'react';
import { getCountryCurrency } from '../../constants';

export default function TrustBanner({ listingsCount, selectedCountry }) {
  const currency = getCountryCurrency(selectedCountry);

  return (
    <div className="trust">
      <div className="trust-item">
        <div className="trust-value">{listingsCount || 12}</div>
        <div className="trust-label">Active listings</div>
      </div>
      <div className="trust-item">
        <div className="trust-value">614</div>
        <div className="trust-label">Verified dealers</div>
      </div>
      <div className="trust-item">
        <div className="trust-value">{selectedCountry ? '1' : '6'}</div>
        <div className="trust-label">{selectedCountry ? selectedCountry : 'GCC Countries'}</div>
      </div>
      <div className="trust-item">
        <div className="trust-value">0 {currency}</div>
        <div className="trust-label">Listing fees</div>
      </div>
    </div>
  );
}
