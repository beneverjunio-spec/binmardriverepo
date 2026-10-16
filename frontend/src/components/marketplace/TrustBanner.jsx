import React, { useState, useEffect, useMemo } from 'react';
import { getCountryCurrency, GCC_COUNTRIES } from '../../constants';

export default function TrustBanner({ listings = [], listingsCount, selectedCountry }) {
  const currency = getCountryCurrency(selectedCountry);
  const [verifiedDealersCount, setVerifiedDealersCount] = useState(0);

  // Dynamic active listings count
  const activeCount = typeof listingsCount === 'number'
    ? listingsCount
    : (Array.isArray(listings) ? listings.length : 0);

  // Dynamic countries count
  const countriesCount = useMemo(() => {
    if (selectedCountry) return 1;
    if (Array.isArray(listings) && listings.length > 0) {
      const distinct = new Set(listings.map(l => l.country).filter(Boolean));
      return distinct.size > 0 ? distinct.size : GCC_COUNTRIES.length;
    }
    return GCC_COUNTRIES.length;
  }, [listings, selectedCountry]);

  // Dynamically load verified dealers count
  useEffect(() => {
    let localVerified = 0;
    try {
      const raw = localStorage.getItem('binmar_custom_dealers');
      if (raw) {
        const dealers = JSON.parse(raw);
        localVerified = dealers.filter(d => d.status === 'verified' || d.status === 'approved').length;
      }
    } catch {}

    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.stats) {
          setVerifiedDealersCount((data.stats.verifiedDealers || 0) + localVerified);
        } else {
          setVerifiedDealersCount(localVerified);
        }
      })
      .catch(() => {
        setVerifiedDealersCount(localVerified);
      });
  }, []);

  return (
    <div className="trust">
      <div className="trust-item">
        <div className="trust-value">{activeCount}</div>
        <div className="trust-label">Active listings</div>
      </div>
      <div className="trust-item">
        <div className="trust-value">{verifiedDealersCount}</div>
        <div className="trust-label">Verified dealers</div>
      </div>
      <div className="trust-item">
        <div className="trust-value">{countriesCount}</div>
        <div className="trust-label">{selectedCountry ? selectedCountry : 'GCC Countries'}</div>
      </div>
      <div className="trust-item">
        <div className="trust-value">0 {currency}</div>
        <div className="trust-label">Listing fees</div>
      </div>
    </div>
  );
}

