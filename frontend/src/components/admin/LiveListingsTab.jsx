import React, { useState } from 'react';
import {
  Trash2,
  Eye,
  MapPin,
  Calendar,
  Gauge,
  Fuel,
  Car,
  Phone,
  Mail,
  ShieldCheck,
  Building2,
  User,
  FileText,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  ExternalLink,
  Tag
} from 'lucide-react';
import DocumentViewerModal from '../common/DocumentViewerModal';
import { exportToExcel } from '../../utils/exportToExcel';

export default function LiveListingsTab({
  adminListings = [],
  adminSearch,
  setAdminSearch,
  onRemoveListing,
  onRemoveAllListings
}) {
  const [inspectingListing, setInspectingListing] = useState(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'sale' | 'rent'
  const [selectedIds, setSelectedIds] = useState([]);
  const [viewingDocument, setViewingDocument] = useState(null);

  // Counts for filter pills
  const totalCount = adminListings.length;
  const saleCount = adminListings.filter(l => (l.listing_type || l.type || 'sale').toLowerCase() === 'sale').length;
  const rentCount = adminListings.filter(l => (l.listing_type || l.type || '').toLowerCase() === 'rent').length;

  const filteredListings = adminListings.filter(l => {
    // 1. Listing Type filter
    const listingType = (l.listing_type || l.type || 'sale').toLowerCase();
    if (filterType === 'sale' && listingType !== 'sale') return false;
    if (filterType === 'rent' && listingType !== 'rent') return false;

    // 2. Search query filter
    if (!adminSearch) return true;
    const q = adminSearch.toLowerCase();
    return (
      l.title?.toLowerCase().includes(q) ||
      l.seller_name?.toLowerCase().includes(q) ||
      l.seller?.toLowerCase().includes(q) ||
      l.make?.toLowerCase().includes(q) ||
      l.city?.toLowerCase().includes(q) ||
      l.country?.toLowerCase().includes(q)
    );
  });

  // Selection handlers
  const allFilteredSelected = filteredListings.length > 0 && filteredListings.every(l => selectedIds.includes(l.id));

  const handleToggleAll = () => {
    if (allFilteredSelected) {
      const filteredIdSet = new Set(filteredListings.map(l => l.id));
      setSelectedIds(prev => prev.filter(id => !filteredIdSet.has(id)));
    } else {
      const newIds = Array.from(new Set([...selectedIds, ...filteredListings.map(l => l.id)]));
      setSelectedIds(newIds);
    }
  };

  const handleToggleRow = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Export to Excel handler
  const handleExportExcel = () => {
    const listToExport = selectedIds.length > 0
      ? filteredListings.filter(l => selectedIds.includes(l.id))
      : filteredListings;

    if (listToExport.length === 0) {
      alert('No listing data available to export.');
      return;
    }

    const headers = [
      'Listing ID',
      'Vehicle Title',
      'Listing Type',
      'Make',
      'Model',
      'Year',
      'Category',
      'Condition',
      'Price',
      'Currency',
      'Price Label',
      'Location City',
      'Country',
      'Seller Name',
      'Contact Phone',
      'WhatsApp',
      'Mileage',
      'Fuel Type',
      'Transmission',
      'Status',
      'Created Date'
    ];

    const rows = listToExport.map(l => {
      const typeStr = (l.listing_type || l.type || 'sale').toLowerCase() === 'rent' ? 'For Rent' : 'For Sale';
      return [
        l.id || 'N/A',
        l.title || 'Untitled',
        typeStr,
        l.make || '',
        l.model || '',
        l.year || '',
        l.category || 'SUV',
        l.condition_type || l.condition || 'Used',
        l.price || 0,
        l.currency || 'AED',
        l.price_label || '',
        l.city || 'Dubai',
        l.country || 'United Arab Emirates',
        l.seller_name || l.seller || 'Verified Seller',
        l.contact_phone || l.phone || '',
        l.whatsapp_number || '',
        l.mileage || '0 km',
        l.fuel || 'Petrol',
        l.transmission || 'Automatic',
        l.status || 'approved',
        l.created_at ? new Date(l.created_at).toLocaleDateString() : 'N/A'
      ];
    });

    const dateStr = new Date().toISOString().slice(0, 10);
    exportToExcel(`BinmarDrive_Listings_Export_${dateStr}`, headers, rows);
  };

  const getSellerProfile = (listing) => {
    if (!listing) return null;
    try {
      const rawUsers = localStorage.getItem('binmar_custom_users');
      const users = rawUsers ? JSON.parse(rawUsers) : [];
      const userMatch = users.find(u =>
        (listing.seller_email && u.email && u.email.toLowerCase() === listing.seller_email.toLowerCase()) ||
        (listing.seller_name && u.name && u.name.toLowerCase() === listing.seller_name.toLowerCase()) ||
        (listing.seller && u.name && u.name.toLowerCase() === listing.seller.toLowerCase()) ||
        (listing.seller && u.company_name && u.company_name.toLowerCase() === listing.seller.toLowerCase())
      );

      const rawDealers = localStorage.getItem('binmar_custom_dealers');
      const dealers = rawDealers ? JSON.parse(rawDealers) : [];
      const dealerMatch = dealers.find(d =>
        (listing.seller_email && d.email && d.email.toLowerCase() === listing.seller_email.toLowerCase()) ||
        (listing.seller_name && d.name && d.name.toLowerCase() === listing.seller_name.toLowerCase()) ||
        (listing.seller && d.name && d.name.toLowerCase() === listing.seller.toLowerCase()) ||
        (listing.seller_name && d.company_name && d.company_name.toLowerCase() === listing.seller_name.toLowerCase())
      );

      const isCompany = listing.user_type === 'company' ||
        userMatch?.user_type === 'company' ||
        dealerMatch?.user_type === 'company' ||
        (listing.seller && !listing.seller.toLowerCase().includes('private'));

      return {
        name: listing.seller_name || listing.seller || userMatch?.name || dealerMatch?.name || 'Verified Seller',
        company_name: listing.company_name || dealerMatch?.company_name || userMatch?.company_name || null,
        email: listing.seller_email || listing.email || userMatch?.email || dealerMatch?.email || 'N/A',
        phone: listing.whatsapp_number || listing.contact_phone || listing.phone || userMatch?.phone || dealerMatch?.phone || 'N/A',
        user_type: isCompany ? 'company' : 'individual',
        trade_license: listing.trade_license || userMatch?.trade_license || dealerMatch?.trade_license || (isCompany ? 'CN-Verified Commercial' : 'National ID Verified'),
        trade_license_file: dealerMatch?.trade_license_file || userMatch?.trade_license_file || null,
        country: listing.country || userMatch?.country || dealerMatch?.country || 'United Arab Emirates',
        city: listing.city || 'Dubai',
        is_verified_seller: true
      };
    } catch {
      return {
        name: listing.seller_name || listing.seller || 'Verified Seller',
        company_name: listing.company_name || null,
        email: listing.seller_email || listing.email || 'N/A',
        phone: listing.whatsapp_number || listing.contact_phone || listing.phone || 'N/A',
        user_type: listing.seller?.toLowerCase().includes('private') ? 'individual' : 'company',
        trade_license: 'Verified Identity',
        country: listing.country || 'United Arab Emirates',
        city: listing.city || 'Dubai',
        is_verified_seller: true
      };
    }
  };

  const openInspection = (listing) => {
    setInspectingListing(listing);
    setActivePhotoIdx(0);
  };

  const closeInspection = () => {
    setInspectingListing(null);
    setActivePhotoIdx(0);
  };

  const openMulkiyaViewer = (listing) => {
    const docName = listing.document_name || listing.document_file || `${listing.title?.replace(/\s+/g, '_')}_Mulkiya.pdf`;
    setViewingDocument({
      title: 'Vehicle Mulkiya & Registration Certificate',
      documentName: docName,
      documentType: 'mulkiya',
      documentUrl: listing.document_url || null,
      data: {
        ...listing,
        seller_name: listing.seller_name || listing.seller || 'Owner'
      }
    });
  };

  const activeSeller = inspectingListing ? getSellerProfile(inspectingListing) : null;

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h2>All Live Marketplace Listings ({adminListings.length})</h2>
          <p>Manage, audit, filter by type (For Rent / For Sale), and export vehicle inventory to Excel.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Export to Excel Button */}
          <button
            type="button"
            onClick={handleExportExcel}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '6px',
              background: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(34, 197, 94, 0.4)',
              color: '#4ade80',
              fontWeight: 700,
              fontSize: '0.84rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            title="Export selected or filtered listings to Excel (CSV)"
          >
            <FileSpreadsheet size={16} />
            <span>
              {selectedIds.length > 0
                ? `Export Selected (${selectedIds.length}) to Excel`
                : 'Export to Excel'}
            </span>
          </button>

          {adminListings.length > 0 && onRemoveAllListings && (
            <button
              className="act-btn reject"
              style={{ whiteSpace: 'nowrap', padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}
              onClick={onRemoveAllListings}
            >
              <Trash2 size={13} style={{ display: 'inline', marginRight: 4 }} />
              Clear All Live Listings (Zero Out)
            </button>
          )}

          <input
            className="search"
            placeholder="Search listings, sellers, or makes..."
            value={adminSearch}
            onChange={e => setAdminSearch(e.target.value)}
          />
        </div>
      </div>

      {/* FILTER PILLS / TYPE TABS (For Rent / For Sale Filter) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem 1rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setFilterType('all')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: filterType === 'all' ? '1px solid var(--gold, #d4af37)' : '1px solid rgba(255, 255, 255, 0.15)',
              background: filterType === 'all' ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.04)',
              color: filterType === 'all' ? 'var(--gold, #d4af37)' : '#94a3b8'
            }}
          >
            All Listings ({totalCount})
          </button>

          <button
            type="button"
            onClick={() => setFilterType('sale')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: filterType === 'sale' ? '1px solid #4ade80' : '1px solid rgba(74, 222, 128, 0.25)',
              background: filterType === 'sale' ? 'rgba(34, 197, 94, 0.25)' : 'rgba(34, 197, 94, 0.06)',
              color: '#4ade80'
            }}
          >
            For Sale ({saleCount})
          </button>

          <button
            type="button"
            onClick={() => setFilterType('rent')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: filterType === 'rent' ? '1px solid #60a5fa' : '1px solid rgba(96, 165, 250, 0.25)',
              background: filterType === 'rent' ? 'rgba(96, 165, 250, 0.25)' : 'rgba(96, 165, 250, 0.06)',
              color: '#60a5fa'
            }}
          >
            For Rent ({rentCount})
          </button>
        </div>

        {selectedIds.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--gold, #d4af37)', fontWeight: 700 }}>
              {selectedIds.length} listing(s) selected
            </span>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                fontSize: '0.78rem',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Clear selection
            </button>
          </div>
        )}
      </div>

      <table>
        <thead>
          <tr>
            <th style={{ width: '40px', textAlign: 'center' }}>
              <input
                type="checkbox"
                checked={allFilteredSelected}
                onChange={handleToggleAll}
                title="Select all / Deselect all"
                style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--gold, #d4af37)' }}
              />
            </th>
            <th>Vehicle & Photos</th>
            {/* Dedicated Column: Type of Listing (For Rent or For Sale) */}
            <th>Type</th>
            <th>Seller / Dealer Details</th>
            <th>Price</th>
            <th>Location</th>
            <th>Mulkiya / Doc</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredListings.length > 0 ? (
            filteredListings.map(l => {
              const isSelected = selectedIds.includes(l.id);
              const images = Array.isArray(l.images) && l.images.length > 0
                ? l.images
                : ['https://images.unsplash.com/photo-1594502184342-2e12f877aa73?w=800&auto=format&fit=crop'];
              const coverImage = images[0];
              const sellerProfile = getSellerProfile(l);
              const isRent = (l.listing_type || l.type || '').toLowerCase() === 'rent';

              return (
                <tr
                  key={l.id}
                  style={{
                    background: isSelected ? 'rgba(212, 175, 55, 0.08)' : 'transparent'
                  }}
                >
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleRow(l.id)}
                      style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--gold, #d4af37)' }}
                    />
                  </td>

                  {/* Vehicle Thumbnail & Title */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '56px',
                          height: '44px',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          background: '#1a232f',
                          flexShrink: 0,
                          cursor: 'pointer',
                          border: '1px solid rgba(212, 175, 55, 0.4)',
                          position: 'relative'
                        }}
                        onClick={() => openInspection(l)}
                        title="Click to inspect car & seller details"
                      >
                        <img
                          src={coverImage}
                          alt={l.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        {images.length > 1 && (
                          <span style={{
                            position: 'absolute',
                            bottom: '2px',
                            right: '2px',
                            background: 'rgba(0,0,0,0.7)',
                            color: '#fff',
                            fontSize: '0.62rem',
                            padding: '1px 3px',
                            borderRadius: '3px'
                          }}>
                            {images.length}
                          </span>
                        )}
                      </div>
                      <div>
                        <div
                          className="cell-main"
                          style={{ cursor: 'pointer', color: 'var(--gold, #d4af37)', fontWeight: 700 }}
                          onClick={() => openInspection(l)}
                        >
                          {l.title}
                        </div>
                        <div className="cell-sub">{l.category || 'SUV'} &bull; {l.year} &bull; {l.mileage || '0 km'}</div>
                      </div>
                    </div>
                  </td>

                  {/* DEDICATED COLUMN: TYPE OF LISTING (For Rent or For Sale) */}
                  <td>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.76rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      background: isRent ? 'rgba(59, 130, 246, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                      color: isRent ? '#60a5fa' : '#4ade80',
                      border: isRent ? '1px solid rgba(59, 130, 246, 0.35)' : '1px solid rgba(34, 197, 94, 0.35)'
                    }}>
                      <Tag size={11} />
                      {isRent ? 'For Rent' : 'For Sale'}
                    </span>
                  </td>

                  {/* Seller / Dealer */}
                  <td>
                    <div
                      style={{ cursor: 'pointer', fontWeight: 700, color: '#f8fafc' }}
                      onClick={() => openInspection(l)}
                      title="Click to check full seller credentials"
                    >
                      {sellerProfile.company_name || sellerProfile.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        background: sellerProfile.user_type === 'company' ? 'rgba(212, 175, 55, 0.15)' : 'rgba(100, 150, 255, 0.15)',
                        color: sellerProfile.user_type === 'company' ? 'var(--gold, #d4af37)' : '#7cb3ff',
                        border: sellerProfile.user_type === 'company' ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid rgba(100, 150, 255, 0.3)'
                      }}>
                        {sellerProfile.user_type === 'company' ? 'Dealer' : 'Private'}
                      </span>
                      {sellerProfile.phone !== 'N/A' && (
                        <span style={{ fontSize: '0.74rem', color: '#25D366', fontWeight: 600 }}>
                          {sellerProfile.phone}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Price */}
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--gold, #d4af37)' }}>
                      {l.price_label || `${l.currency || 'AED'} ${Number(l.price || 0).toLocaleString()}`}
                    </div>
                    <div className="cell-sub" style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                      {isRent ? 'Daily / Weekly' : 'Single Payment'}
                    </div>
                  </td>

                  {/* Location */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} style={{ color: 'var(--gold, #d4af37)' }} />
                      <span>{l.city || 'Dubai'}, {l.country || 'UAE'}</span>
                    </div>
                  </td>

                  {/* Mulkiya / Document Button */}
                  <td>
                    <button
                      type="button"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '5px 10px',
                        background: 'rgba(212, 175, 55, 0.12)',
                        border: '1px solid rgba(212, 175, 55, 0.35)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        color: 'var(--gold, #d4af37)',
                        fontSize: '0.76rem',
                        fontWeight: 700
                      }}
                      onClick={() => openMulkiyaViewer(l)}
                      title="Click to view attached official Mulkiya/Istimara document"
                    >
                      <FileText size={13} />
                      <span>Mulkiya</span>
                    </button>
                  </td>

                  {/* Actions */}
                  <td>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => openInspection(l)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '6px 12px',
                          background: 'rgba(212, 175, 55, 0.15)',
                          border: '1px solid rgba(212, 175, 55, 0.45)',
                          borderRadius: '6px',
                          color: 'var(--gold, #d4af37)',
                          cursor: 'pointer',
                          fontSize: '0.82rem',
                          fontWeight: 700
                        }}
                      >
                        <Eye size={14} /> Details
                      </button>

                      <button
                        className="act-btn reject"
                        onClick={() => onRemoveListing(l.id)}
                        title="Remove listing from live marketplace"
                      >
                        <Trash2 size={13} style={{ display: 'inline', marginRight: 4 }} />
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr className="empty-row">
              <td colSpan="8">No live listings found matching your search and filter criteria.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* FULL VEHICLE & SELLER / DEALER INSPECTION MODAL */}
      {inspectingListing && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 10, 15, 0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={closeInspection}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '54rem',
              maxHeight: '92vh',
              background: '#0d131a',
              border: '1px solid rgba(212, 175, 55, 0.45)',
              borderRadius: '1rem',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              color: '#f8fafc'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              background: '#131b24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'rgba(34, 197, 94, 0.15)',
                    color: '#4ade80',
                    border: '1px solid rgba(34, 197, 94, 0.3)'
                  }}>
                    Live on Marketplace
                  </span>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: (inspectingListing.listing_type || inspectingListing.type) === 'rent'
                      ? 'rgba(59, 130, 246, 0.2)'
                      : 'rgba(34, 197, 94, 0.2)',
                    color: (inspectingListing.listing_type || inspectingListing.type) === 'rent'
                      ? '#60a5fa'
                      : '#4ade80',
                    border: (inspectingListing.listing_type || inspectingListing.type) === 'rent'
                      ? '1px solid rgba(59, 130, 246, 0.4)'
                      : '1px solid rgba(34, 197, 94, 0.4)'
                  }}>
                    {(inspectingListing.listing_type || inspectingListing.type) === 'rent' ? 'For Rent' : 'For Sale'}
                  </span>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: activeSeller?.user_type === 'company' ? 'rgba(212, 175, 55, 0.15)' : 'rgba(100, 150, 255, 0.15)',
                    color: activeSeller?.user_type === 'company' ? 'var(--gold, #d4af37)' : '#7cb3ff',
                    border: activeSeller?.user_type === 'company' ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid rgba(100, 150, 255, 0.3)'
                  }}>
                    {activeSeller?.user_type === 'company' ? 'Commercial Dealer Post' : 'Private Seller Post'}
                  </span>
                </div>
                <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc' }}>
                  {inspectingListing.title}
                </h2>
              </div>
              <button
                onClick={closeInspection}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Photo Carousel & Preview */}
              <div>
                {(() => {
                  const imgs = Array.isArray(inspectingListing.images) && inspectingListing.images.length > 0
                    ? inspectingListing.images
                    : ['https://images.unsplash.com/photo-1594502184342-2e12f877aa73?w=800&auto=format&fit=crop'];
                  const currentPhoto = imgs[activePhotoIdx] || imgs[0];

                  return (
                    <div>
                      <div style={{
                        position: 'relative',
                        width: '100%',
                        height: '310px',
                        background: '#05080c',
                        borderRadius: '0.75rem',
                        overflow: 'hidden',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}>
                        <img
                          src={currentPhoto}
                          alt={inspectingListing.title}
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                        <div style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: 'rgba(0,0,0,0.7)',
                          color: '#fff',
                          fontSize: '0.75rem',
                          padding: '3px 8px',
                          borderRadius: '4px'
                        }}>
                          Photo {activePhotoIdx + 1} of {imgs.length}
                        </div>

                        {imgs.length > 1 && (
                          <>
                            <button
                              type="button"
                              onClick={() => setActivePhotoIdx((activePhotoIdx - 1 + imgs.length) % imgs.length)}
                              style={{
                                position: 'absolute',
                                left: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'rgba(0,0,0,0.6)',
                                border: 'none',
                                color: '#fff',
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                              }}
                            >
                              <ChevronLeft size={20} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setActivePhotoIdx((activePhotoIdx + 1) % imgs.length)}
                              style={{
                                position: 'absolute',
                                right: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'rgba(0,0,0,0.6)',
                                border: 'none',
                                color: '#fff',
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                              }}
                            >
                              <ChevronRight size={20} />
                            </button>
                          </>
                        )}
                      </div>

                      {imgs.length > 1 && (
                        <div style={{ display: 'flex', gap: '8px', marginTop: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
                          {imgs.map((src, i) => (
                            <img
                              key={i}
                              src={src}
                              alt=""
                              onClick={() => setActivePhotoIdx(i)}
                              style={{
                                width: '64px',
                                height: '48px',
                                objectFit: 'cover',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                border: activePhotoIdx === i ? '2px solid var(--gold, #d4af37)' : '1px solid rgba(255,255,255,0.2)'
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* SELLER & DEALER CREDENTIALS SECTION */}
              <div style={{
                background: 'linear-gradient(145deg, #101721 0%, #172230 100%)',
                border: '1px solid rgba(212, 175, 55, 0.35)',
                borderRadius: '12px',
                padding: '1.25rem',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px dashed rgba(212, 175, 55, 0.3)',
                  paddingBottom: '0.85rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: 'rgba(212, 175, 55, 0.15)',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--gold, #d4af37)'
                    }}>
                      {activeSeller?.user_type === 'company' ? <Building2 size={20} /> : <User size={20} />}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gold, #d4af37)', fontWeight: 700 }}>
                        REGISTERED SELLER & DEALER PROFILE
                      </p>
                      <h3 style={{ margin: '2px 0 0 0', fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc' }}>
                        {activeSeller?.name}
                      </h3>
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(34, 197, 94, 0.12)',
                    padding: '5px 10px',
                    borderRadius: '6px',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    color: '#4ade80',
                    fontSize: '0.78rem',
                    fontWeight: 700
                  }}>
                    <ShieldCheck size={16} /> Verified Active Seller
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '10px',
                  fontSize: '0.85rem'
                }}>
                  <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Company / Entity</span>
                    <p style={{ margin: '2px 0 0 0', fontWeight: 700, color: '#f8fafc' }}>
                      {activeSeller?.company_name || `${activeSeller?.name} (Private Seller)`}
                    </p>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Classification</span>
                    <p style={{ margin: '2px 0 0 0', fontWeight: 700, color: activeSeller?.user_type === 'company' ? 'var(--gold)' : '#7cb3ff' }}>
                      {activeSeller?.user_type === 'company' ? 'Commercial Dealership' : 'Private Verified Seller'}
                    </p>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Contact Phone / WhatsApp</span>
                    <p style={{ margin: '2px 0 0 0', fontWeight: 700, color: '#25D366', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Phone size={13} /> {activeSeller?.phone}
                    </p>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Email Address</span>
                    <p style={{ margin: '2px 0 0 0', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Mail size={13} /> {activeSeller?.email}
                    </p>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Trade License / ID Code</span>
                    <p style={{ margin: '2px 0 0 0', fontWeight: 700, color: 'var(--gold, #d4af37)' }}>
                      {activeSeller?.trade_license}
                    </p>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Jurisdiction / Country</span>
                    <p style={{ margin: '2px 0 0 0', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <MapPin size={13} /> {activeSeller?.city}, {activeSeller?.country}
                    </p>
                  </div>
                </div>

                {/* CLICKABLE ATTACHED DOCUMENT / MULKIYA BOX */}
                <div
                  onClick={() => openMulkiyaViewer(inspectingListing)}
                  style={{
                    marginTop: '12px',
                    padding: '12px 14px',
                    background: 'rgba(212, 175, 55, 0.12)',
                    borderRadius: '8px',
                    border: '1.5px solid rgba(212, 175, 55, 0.45)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  }}
                  title="Click to view and inspect this official document"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.84rem' }}>
                    <FileText size={20} style={{ color: 'var(--gold, #d4af37)' }} />
                    <div>
                      <span style={{ color: '#f8fafc', fontWeight: 800 }}>
                        {inspectingListing.document_name || inspectingListing.document_file || activeSeller?.trade_license_file || `${inspectingListing.title}_Mulkiya.pdf`}
                      </span>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                        Official Technical Mulkiya / License &bull; <span style={{ color: 'var(--gold, #d4af37)', fontWeight: 600 }}>Click to View & Print</span>
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '0.72rem',
                      color: '#4ade80',
                      fontWeight: 800,
                      background: 'rgba(34, 197, 94, 0.2)',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      border: '1px solid rgba(34, 197, 94, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <ExternalLink size={12} /> View Document
                    </span>
                  </div>
                </div>
              </div>

              {/* Price & Location Banner */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                background: '#131b24',
                borderRadius: '0.75rem',
                border: '1px solid rgba(255,255,255,0.06)'
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                    {(inspectingListing.listing_type || inspectingListing.type) === 'rent' ? 'Rental Listing Price' : 'Asking Sale Price'}
                  </span>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--gold, #d4af37)' }}>
                    {inspectingListing.price_label || `${inspectingListing.currency || 'AED'} ${Number(inspectingListing.price || 0).toLocaleString()}`}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Listed Location</span>
                  <div style={{ fontWeight: 600, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={14} style={{ color: 'var(--gold, #d4af37)' }} />
                    {inspectingListing.location || `${inspectingListing.city || 'Dubai'}, ${inspectingListing.country || 'UAE'}`}
                  </div>
                </div>
              </div>

              {/* Vehicle Specifications Grid */}
              <div>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                  Technical Specifications & Overview
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '10px'
                }}>
                  <div style={{ background: '#131b24', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Listing Type</span>
                    <p style={{ margin: '2px 0 0 0', fontWeight: 700, color: (inspectingListing.listing_type || inspectingListing.type) === 'rent' ? '#60a5fa' : '#4ade80' }}>
                      {(inspectingListing.listing_type || inspectingListing.type) === 'rent' ? 'For Rent' : 'For Sale'}
                    </p>
                  </div>

                  <div style={{ background: '#131b24', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Year</span>
                    <p style={{ margin: '2px 0 0 0', fontWeight: 700, color: '#f8fafc' }}>{inspectingListing.year}</p>
                  </div>

                  <div style={{ background: '#131b24', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Category</span>
                    <p style={{ margin: '2px 0 0 0', fontWeight: 700, color: '#f8fafc' }}>{inspectingListing.category || 'SUV'}</p>
                  </div>

                  <div style={{ background: '#131b24', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Mileage</span>
                    <p style={{ margin: '2px 0 0 0', fontWeight: 700, color: '#f8fafc' }}>{inspectingListing.mileage || '0 km'}</p>
                  </div>

                  <div style={{ background: '#131b24', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Fuel</span>
                    <p style={{ margin: '2px 0 0 0', fontWeight: 700, color: '#f8fafc' }}>{inspectingListing.fuel || 'Petrol'}</p>
                  </div>

                  <div style={{ background: '#131b24', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Transmission</span>
                    <p style={{ margin: '2px 0 0 0', fontWeight: 700, color: '#f8fafc' }}>{inspectingListing.transmission || 'Automatic'}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {inspectingListing.description && (
                <div style={{ background: '#131b24', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Seller Description</span>
                  <p style={{ margin: '6px 0 0 0', fontSize: '0.88rem', lineHeight: '1.6', color: '#cbd5e1' }}>
                    {inspectingListing.description}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              background: '#131b24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <button
                type="button"
                onClick={closeInspection}
                style={{
                  padding: '8px 18px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#cbd5e1',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Close Inspection
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    background: 'rgba(212, 175, 55, 0.15)',
                    border: '1px solid rgba(212, 175, 55, 0.45)',
                    color: 'var(--gold, #d4af37)',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                  onClick={() => openMulkiyaViewer(inspectingListing)}
                >
                  <FileText size={15} /> View Official Mulkiya
                </button>

                <button
                  type="button"
                  className="act-btn reject"
                  style={{ padding: '8px 18px' }}
                  onClick={() => {
                    onRemoveListing(inspectingListing.id);
                    closeInspection();
                  }}
                >
                  <Trash2 size={14} style={{ display: 'inline', marginRight: 4 }} />
                  Remove from Live
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT VIEWER MODAL POPUP */}
      <DocumentViewerModal
        isOpen={Boolean(viewingDocument)}
        onClose={() => setViewingDocument(null)}
        title={viewingDocument?.title}
        documentName={viewingDocument?.documentName}
        documentType={viewingDocument?.documentType}
        documentUrl={viewingDocument?.documentUrl}
        data={viewingDocument?.data}
        onSaveDocument={(fileUrl, fileName) => {
          if (!viewingDocument?.data?.id) return;
          try {
            const raw = localStorage.getItem('binmar_custom_listings');
            if (raw) {
              const listings = JSON.parse(raw);
              const idx = listings.findIndex(l => String(l.id) === String(viewingDocument.data.id));
              if (idx !== -1) {
                listings[idx].document_url = fileUrl;
                if (fileName) listings[idx].document_file = fileName;
                localStorage.setItem('binmar_custom_listings', JSON.stringify(listings));
              }
            }
          } catch (e) {
            console.warn(e);
          }
        }}
      />
    </div>
  );
}
