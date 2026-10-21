import React, { useState, useEffect, useMemo } from 'react';
import { getCountryCurrency, GCC_COUNTRIES } from '../../constants';
import { fetchAdminPortalData } from '../../api/admin';

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

  // Dynamically load verified dealers count strictly from Admin Verified Dealers
  const updateDealersCount = async () => {
    try {
      const data = await fetchAdminPortalData();
      if (data && data.dealerQueue) {
        const verifiedCount = data.dealerQueue.filter(
          d => d.status === 'verified' || d.status === 'approved'
        ).length;
        setVerifiedDealersCount(verifiedCount);
        return;
      }
      if (data && data.stats && typeof data.stats.verifiedDealers === 'number') {
        setVerifiedDealersCount(data.stats.verifiedDealers);
        return;
      }
    } catch {}

    // Fallback: direct localStorage inspection matching admin criteria
    try {
      const raw = localStorage.getItem('binmar_custom_dealers');
      if (raw) {
        const dealers = JSON.parse(raw);
        const verified = dealers.filter(d => d.status === 'verified' || d.status === 'approved').length;
        setVerifiedDealersCount(verified);
        return;
      }
    } catch {}

    setVerifiedDealersCount(0);
  };

  useEffect(() => {
    updateDealersCount();

    const handleUpdate = () => updateDealersCount();
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('binmar_dealers_updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('binmar_dealers_updated', handleUpdate);
    };
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
