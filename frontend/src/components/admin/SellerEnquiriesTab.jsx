import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  Download,
  Share2,
  Eye,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  Building2,
  Calendar,
  Clock,
  Phone,
  Trash2,
  RefreshCw,
  Tag,
  CheckCircle2,
  Car
} from 'lucide-react';
import { exportToExcel } from '../../utils/exportToExcel';
import { WhatsAppIcon } from '../common/WhatsAppIcon';
import { deleteEnquiry, clearSellerEnquiries } from '../../api/enquiries';
import { useLanguage } from '../../context/LanguageContext';

export default function SellerEnquiriesTab({
  enquiries = [],
  sellerSummaries = [],
  totalEnquiries = 0,
  totalSale = 0,
  totalRent = 0,
  totalSellers = 0,
  onRefresh,
  isRefreshing = false,
  notify = () => {}
}) {
  const { t, isRTL } = useLanguage();

  // Active view: 'sellers' (grouped table) or 'detail' (specific seller view)
  const [selectedSellerName, setSelectedSellerName] = useState(null);

  // Search & Filter state for Sellers overview
  const [sellerSearch, setSellerSearch] = useState('');
  const [sellerTypeFilter, setSellerTypeFilter] = useState('all'); // 'all' | 'sale' | 'rent'

  // Search & Filter state for Detailed Enquiries view
  const [enquirySearch, setEnquirySearch] = useState('');
  const [enquiryTypeFilter, setEnquiryTypeFilter] = useState('all'); // 'all' | 'sale' | 'rent'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'title' | 'price'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // WhatsApp Share Modal state
  const [shareModalSeller, setShareModalSeller] = useState(null);
  const [sharePhone, setSharePhone] = useState('');
  const [shareMessageText, setShareMessageText] = useState('');
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // ----------------------------------------------------
  // Grouped Sellers Data Calculation
  // ----------------------------------------------------
  const filteredSellers = useMemo(() => {
    return sellerSummaries.filter(item => {
      // Search
      if (sellerSearch.trim()) {
        const q = sellerSearch.toLowerCase().trim();
        if (!item.seller.toLowerCase().includes(q)) return false;
      }
      // Type Filter
      if (sellerTypeFilter === 'sale' && item.saleCount === 0) return false;
      if (sellerTypeFilter === 'rent' && item.rentCount === 0) return false;
      return true;
    });
  }, [sellerSummaries, sellerSearch, sellerTypeFilter]);

  // Selected Seller's Enquiries
  const currentSellerEnquiries = useMemo(() => {
    if (!selectedSellerName) return [];
    const s = selectedSellerName.toLowerCase().trim();
    return enquiries.filter(e => (e.seller_name || '').toLowerCase().trim() === s);
  }, [enquiries, selectedSellerName]);

  const selectedSellerSummary = useMemo(() => {
    if (!selectedSellerName) return null;
    return sellerSummaries.find(
      s => s.seller.toLowerCase().trim() === selectedSellerName.toLowerCase().trim()
    ) || {
      seller: selectedSellerName,
      total: currentSellerEnquiries.length,
      saleCount: currentSellerEnquiries.filter(e => e.enquiry_type === 'sale').length,
      rentCount: currentSellerEnquiries.filter(e => e.enquiry_type === 'rent').length,
      seller_phone: currentSellerEnquiries[0]?.seller_phone || '+971526539699'
    };
  }, [sellerSummaries, selectedSellerName, currentSellerEnquiries]);

  // Filtered & Sorted Enquiries for Detailed View
  const processedEnquiries = useMemo(() => {
    let list = [...currentSellerEnquiries];

    // Search
    if (enquirySearch.trim()) {
      const q = enquirySearch.toLowerCase().trim();
      list = list.filter(e =>
        (e.listing_title && e.listing_title.toLowerCase().includes(q)) ||
        (e.vehicle_brand && e.vehicle_brand.toLowerCase().includes(q)) ||
        (e.vehicle_model && e.vehicle_model.toLowerCase().includes(q)) ||
        (e.reference_id && e.reference_id.toLowerCase().includes(q)) ||
        (e.customer_name && e.customer_name.toLowerCase().includes(q)) ||
        (e.customer_phone && e.customer_phone.toLowerCase().includes(q))
      );
    }

    // Type Filter
    if (enquiryTypeFilter !== 'all') {
      list = list.filter(e => (e.enquiry_type || 'sale').toLowerCase() === enquiryTypeFilter);
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      }
      if (sortBy === 'title') {
        return (a.listing_title || '').localeCompare(b.listing_title || '');
      }
      if (sortBy === 'price') {
        const pA = parseFloat(String(a.price_label || '').replace(/[^0-9.]/g, '')) || 0;
        const pB = parseFloat(String(b.price_label || '').replace(/[^0-9.]/g, '')) || 0;
        return pB - pA;
      }
      return 0;
    });

    return list;
  }, [currentSellerEnquiries, enquirySearch, enquiryTypeFilter, sortBy]);

  // Pagination Calculation
  const totalPages = Math.ceil(processedEnquiries.length / itemsPerPage) || 1;
  const paginatedEnquiries = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedEnquiries.slice(start, start + itemsPerPage);
  }, [processedEnquiries, currentPage, itemsPerPage]);

  // ----------------------------------------------------
  // Export Handlers (Excel / CSV)
  // ----------------------------------------------------
  const handleExportCSV = (records, filenamePrefix) => {
    if (!records || records.length === 0) {
      notify('No enquiry records available to export.');
      return;
    }

    const headers = [
      'Enquiry ID',
      'Date & Time',
      'Seller Name',
      'Seller WhatsApp',
      'Vehicle Reference ID',
      'Vehicle Listing Title',
      'Brand',
      'Model',
      'Enquiry Type',
      'Price',
      'Customer Name',
      'Customer WhatsApp',
      'WhatsApp Enquiry Link',
      'Capture Source'
    ];

    const rows = records.map(item => [
      item.id || item._id || '',
      item.created_at ? new Date(item.created_at).toLocaleString() : '',
      item.seller_name || '',
      item.seller_phone || '',
      item.reference_id || item.listing_id || '',
      item.listing_title || '',
      item.vehicle_brand || '',
      item.vehicle_model || '',
      (item.enquiry_type || 'sale').toUpperCase(),
      item.price_label || '',
      item.customer_name || 'Marketplace Visitor',
      item.customer_phone || 'Via WhatsApp Click',
      item.whatsapp_link || '',
      item.source || 'marketplace'
    ]);

    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `${filenamePrefix}-${dateStr}.csv`;
    exportToExcel(filename, headers, rows);
    notify(`Exported ${records.length} enquiry records to ${filename}`);
  };

  // ----------------------------------------------------
  // WhatsApp Share Preparation
  // ----------------------------------------------------
  const handleOpenShareModal = (sellerItem) => {
    const sName = sellerItem.seller || sellerItem.seller_name;
    const sPhone = sellerItem.seller_phone || '+971526539699';
    const sellerRecords = enquiries.filter(
      e => (e.seller_name || '').toLowerCase().trim() === sName.toLowerCase().trim()
    );

    // Format enquiry summary matching requirement 4:
    // **Binmar Motors – Enquiry Summary**
    // Total Enquiries: 25
    // 1. Toyota Camry – Sale
    //    Customer: +971XXXXXXXXX
    //    Date: 18 November 2026
    let message = `*${sName} – Enquiry Summary*\n`;
    message += `Total Enquiries: ${sellerRecords.length}\n`;
    message += `(Sale: ${sellerRecords.filter(e => e.enquiry_type === 'sale').length} | Rent: ${sellerRecords.filter(e => e.enquiry_type === 'rent').length})\n\n`;

    const previewList = sellerRecords.slice(0, 15);
    previewList.forEach((e, idx) => {
      const typeLabel = (e.enquiry_type || 'sale') === 'rent' ? 'Rent' : 'Sale';
      const custInfo = e.customer_phone ? e.customer_phone : 'Marketplace Visitor';
      const dateStr = e.created_at
        ? new Date(e.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
        : 'Recent';
      const ref = e.reference_id || `#${e.listing_id}`;
      const link = `https://binmardrive.binmargroup.com/listing/${e.listing_id}`;

      message += `${idx + 1}. ${e.listing_title || 'Vehicle'} – ${typeLabel}\n`;
      message += `   Ref: ${ref} | Price: ${e.price_label || 'Contact'}\n`;
      message += `   Customer: ${custInfo}\n`;
      message += `   Date: ${dateStr}\n`;
      message += `   Link: ${link}\n\n`;
    });

    if (sellerRecords.length > 15) {
      message += `...and ${sellerRecords.length - 15} more enquiries tracked in BinmarDrive Admin Portal.\n\n`;
    }

    message += `_Generated via BinmarDrive Marketplace Operations Portal_`;

    setShareModalSeller(sellerItem);
    setSharePhone(sPhone);
    setShareMessageText(message);
    setCopiedSuccess(false);
  };

  const handleCopyShareMessage = () => {
    navigator.clipboard.writeText(shareMessageText);
    setCopiedSuccess(true);
    notify('Enquiry summary copied to clipboard!');
    setTimeout(() => setCopiedSuccess(false), 3000);
  };

  const handleSendWhatsApp = () => {
    const cleanNumber = sharePhone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(shareMessageText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // ----------------------------------------------------
  // Delete / Clear Actions
  // ----------------------------------------------------
  const handleDeleteSingleEnquiry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this enquiry record?')) return;
    await deleteEnquiry(id);
    notify('Enquiry record deleted.');
    if (onRefresh) onRefresh();
  };

  const handleClearSeller = async (sellerName) => {
    if (!window.confirm(`Are you sure you want to clear all enquiries for "${sellerName}"?`)) return;
    await clearSellerEnquiries(sellerName);
    notify(`All enquiries for ${sellerName} cleared.`);
    setSelectedSellerName(null);
    if (onRefresh) onRefresh();
  };

  // ----------------------------------------------------
  // Render
  // ----------------------------------------------------
  return (
    <div className="enquiries-module">
      {/* Top Header */}
      <div className="enquiries-header">
        <div>
          <div className="enquiries-badge-row">
            <span className="enquiries-badge">
              <MessageSquare size={14} />
              Seller WhatsApp Enquiries
            </span>
            <span className="enquiries-auto-sync">
              <span className="live-dot" /> Auto-sync active
            </span>
          </div>
          <h2 className="enquiries-title">Seller Enquiries Management</h2>
          <p className="enquiries-desc">
            Track, review, export, and share marketplace WhatsApp enquiries generated when visitors contact sellers for vehicle sales and rentals.
          </p>
        </div>

        <div className="enquiries-header-actions">
          <button
            type="button"
            className="btn-export-excel"
            onClick={() => handleExportCSV(enquiries, 'binmardrive-all-seller-enquiries')}
            title="Export all enquiry records to Excel / CSV"
          >
            <Download size={16} />
            <span>Export All (Excel / CSV)</span>
          </button>

          <button
            type="button"
            className="btn-refresh-enquiries"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh enquiries"
          >
            <RefreshCw size={16} className={isRefreshing ? 'spin-anim' : ''} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="enquiries-kpi-grid">
        <div className="enquiries-kpi-card">
          <div className="kpi-icon-wrap" style={{ background: 'rgba(37, 211, 102, 0.12)', color: '#25D366' }}>
            <WhatsAppIcon size={24} color="#25D366" />
          </div>
          <div>
            <div className="kpi-label">Total WhatsApp Enquiries</div>
            <div className="kpi-value">{totalEnquiries}</div>
            <div className="kpi-hint">Across all vehicle listings</div>
          </div>
        </div>

        <div className="enquiries-kpi-card">
          <div className="kpi-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
            <Tag size={24} />
          </div>
          <div>
            <div className="kpi-label">For Sale Enquiries</div>
            <div className="kpi-value" style={{ color: '#059669' }}>{totalSale}</div>
            <div className="kpi-hint">
              {totalEnquiries > 0 ? `${Math.round((totalSale / totalEnquiries) * 100)}% of total enquiries` : '0%'}
            </div>
          </div>
        </div>

        <div className="enquiries-kpi-card">
          <div className="kpi-icon-wrap" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' }}>
            <Car size={24} />
          </div>
          <div>
            <div className="kpi-label">For Rent Enquiries</div>
            <div className="kpi-value" style={{ color: '#2563eb' }}>{totalRent}</div>
            <div className="kpi-hint">
              {totalEnquiries > 0 ? `${Math.round((totalRent / totalEnquiries) * 100)}% of total enquiries` : '0%'}
            </div>
          </div>
        </div>

        <div className="enquiries-kpi-card">
          <div className="kpi-icon-wrap" style={{ background: 'rgba(212, 175, 55, 0.15)', color: '#B8860B' }}>
            <Building2 size={24} />
          </div>
          <div>
            <div className="kpi-label">Active Sellers</div>
            <div className="kpi-value">{totalSellers}</div>
            <div className="kpi-hint">Receiving buyer contacts</div>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* VIEW 1: SELLERS OVERVIEW (Grouped Dashboard)         */}
      {/* ==================================================== */}
      {!selectedSellerName ? (
        <div className="enquiries-panel-card">
          {/* Controls Bar */}
          <div className="enquiries-toolbar">
            <div className="enquiries-search-wrap">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search sellers by name..."
                value={sellerSearch}
                onChange={(e) => setSellerSearch(e.target.value)}
                className="enquiries-search-input"
              />
              {sellerSearch && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSellerSearch('')}
                >
                  ×
                </button>
              )}
            </div>

            <div className="enquiries-filter-group">
              <label className="filter-label">Filter by:</label>
              <div className="filter-pills">
                <button
                  type="button"
                  className={`filter-pill ${sellerTypeFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setSellerTypeFilter('all')}
                >
                  All ({sellerSummaries.length})
                </button>
                <button
                  type="button"
                  className={`filter-pill ${sellerTypeFilter === 'sale' ? 'active' : ''}`}
                  onClick={() => setSellerTypeFilter('sale')}
                >
                  Has For Sale
                </button>
                <button
                  type="button"
                  className={`filter-pill ${sellerTypeFilter === 'rent' ? 'active' : ''}`}
                  onClick={() => setSellerTypeFilter('rent')}
                >
                  Has For Rent
                </button>
              </div>
            </div>
          </div>

          {/* Grouped Sellers Table */}
          <div className="table-responsive">
            <table className="enquiries-table">
              <thead>
                <tr>
                  <th style={{ width: '30%' }}>Seller</th>
                  <th style={{ width: '18%', textAlign: 'center' }}>Total Enquiries</th>
                  <th style={{ width: '22%' }}>Enquiry Breakdown</th>
                  <th style={{ width: '15%' }}>Latest Activity</th>
                  <th style={{ width: '15%', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSellers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="empty-cell">
                      <div className="empty-state">
                        <MessageSquare size={36} style={{ opacity: 0.3, marginBottom: '8px' }} />
                        <div style={{ fontWeight: 600 }}>No seller enquiries found</div>
                        <div style={{ fontSize: '0.82rem', color: '#6b7280' }}>
                          When visitors click WhatsApp on listings, enquiries will appear here automatically.
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSellers.map((item) => (
                    <tr key={item.seller} className="seller-row">
                      {/* Seller Column */}
                      <td>
                        <div className="seller-cell-info">
                          <div className="seller-avatar">
                            <Building2 size={18} />
                          </div>
                          <div>
                            <div className="seller-name-row">
                              <span className="seller-title-name">{item.seller}</span>
                              <span className="seller-verified-tag">Verified Seller</span>
                            </div>
                            <div className="seller-phone-sub">
                              <WhatsAppIcon size={12} color="#25D366" />
                              <span dir="ltr">{item.seller_phone || '+971 50 123 4567'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Total Enquiries Column */}
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="total-enquiries-badge-btn"
                          onClick={() => {
                            setSelectedSellerName(item.seller);
                            setCurrentPage(1);
                          }}
                          title={`Click to view all ${item.total} enquiries for ${item.seller}`}
                        >
                          <span className="badge-count-num">{item.total}</span>
                          <span className="badge-count-sub">Enquiries</span>
                        </button>
                      </td>

                      {/* Breakdown Column */}
                      <td>
                        <div className="breakdown-badges">
                          <span className="type-badge-sale" title={`${item.saleCount} Sale Enquiries`}>
                            {item.saleCount} For Sale
                          </span>
                          <span className="type-badge-rent" title={`${item.rentCount} Rent Enquiries`}>
                            {item.rentCount} For Rent
                          </span>
                        </div>
                      </td>

                      {/* Latest Activity Column */}
                      <td>
                        <div className="activity-cell">
                          <Clock size={13} style={{ opacity: 0.6 }} />
                          <span>
                            {item.lastEnquiryAt
                              ? new Date(item.lastEnquiryAt).toLocaleDateString('en-GB', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : 'Recent'}
                          </span>
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td style={{ textAlign: 'right' }}>
                        <div className="row-actions-group">
                          <button
                            type="button"
                            className="btn-action-view"
                            onClick={() => {
                              setSelectedSellerName(item.seller);
                              setCurrentPage(1);
                            }}
                            title="View Enquiries"
                          >
                            <Eye size={14} />
                            <span>View Enquiries</span>
                          </button>

                          <button
                            type="button"
                            className="btn-action-share-wa"
                            onClick={() => handleOpenShareModal(item)}
                            title="Share Enquiries via WhatsApp"
                          >
                            <WhatsAppIcon size={14} color="#ffffff" />
                            <span>Share</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ==================================================== */
        /* VIEW 2: DETAILED SELLER ENQUIRIES SCREEN            */
        /* ==================================================== */
        <div className="enquiries-panel-card">
          {/* Breadcrumb & Navigation */}
          <div className="detail-top-nav">
            <button
              type="button"
              className="btn-back-to-sellers"
              onClick={() => {
                setSelectedSellerName(null);
                setEnquirySearch('');
                setCurrentPage(1);
              }}
            >
              <ArrowLeft size={16} />
              <span>Back to All Sellers</span>
            </button>

            <div className="detail-seller-banner">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 size={20} color="var(--gold-bright, #D4AF37)" />
                  <h3 className="detail-seller-title">{selectedSellerName}</h3>
                </div>
                <div className="detail-seller-meta">
                  <span>WhatsApp: <strong dir="ltr">{selectedSellerSummary?.seller_phone || '+971 50 123 4567'}</strong></span>
                  <span>•</span>
                  <span>Total: <strong>{currentSellerEnquiries.length} enquiries</strong></span>
                  <span>•</span>
                  <span style={{ color: '#059669' }}>Sale: <strong>{selectedSellerSummary?.saleCount || 0}</strong></span>
                  <span>•</span>
                  <span style={{ color: '#2563eb' }}>Rent: <strong>{selectedSellerSummary?.rentCount || 0}</strong></span>
                </div>
              </div>

              <div className="detail-banner-actions">
                <button
                  type="button"
                  className="btn-action-share-wa"
                  onClick={() => handleOpenShareModal(selectedSellerSummary)}
                  style={{ padding: '8px 14px' }}
                >
                  <WhatsAppIcon size={16} color="#ffffff" />
                  <span>Share via WhatsApp</span>
                </button>

                <button
                  type="button"
                  className="btn-export-excel"
                  onClick={() =>
                    handleExportCSV(
                      processedEnquiries,
                      `binmardrive-enquiries-${selectedSellerName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
                    )
                  }
                  style={{ padding: '8px 14px' }}
                  title="Export this seller's enquiries to CSV"
                >
                  <Download size={15} />
                  <span>Export CSV</span>
                </button>

                <button
                  type="button"
                  className="btn-clear-seller"
                  onClick={() => handleClearSeller(selectedSellerName)}
                  title="Clear all records for this seller"
                >
                  <Trash2 size={15} />
                  <span>Clear All</span>
                </button>
              </div>
            </div>
          </div>

          {/* Search, Filter & Sort Controls for Detailed View */}
          <div className="enquiries-toolbar" style={{ marginTop: '1.2rem' }}>
            <div className="enquiries-search-wrap">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search by vehicle title, model, reference ID, customer..."
                value={enquirySearch}
                onChange={(e) => {
                  setEnquirySearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="enquiries-search-input"
              />
              {enquirySearch && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => {
                    setEnquirySearch('');
                    setCurrentPage(1);
                  }}
                >
                  ×
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Type Filter */}
              <div className="filter-pills">
                <button
                  type="button"
                  className={`filter-pill ${enquiryTypeFilter === 'all' ? 'active' : ''}`}
                  onClick={() => {
                    setEnquiryTypeFilter('all');
                    setCurrentPage(1);
                  }}
                >
                  All ({currentSellerEnquiries.length})
                </button>
                <button
                  type="button"
                  className={`filter-pill ${enquiryTypeFilter === 'sale' ? 'active' : ''}`}
                  onClick={() => {
                    setEnquiryTypeFilter('sale');
                    setCurrentPage(1);
                  }}
                >
                  For Sale ({selectedSellerSummary?.saleCount || 0})
                </button>
                <button
                  type="button"
                  className={`filter-pill ${enquiryTypeFilter === 'rent' ? 'active' : ''}`}
                  onClick={() => {
                    setEnquiryTypeFilter('rent');
                    setCurrentPage(1);
                  }}
                >
                  For Rent ({selectedSellerSummary?.rentCount || 0})
                </button>
              </div>

              {/* Sort Selector */}
              <div className="sort-select-wrap">
                <span className="sort-label">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="enquiry-select"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="title">Vehicle Title (A-Z)</option>
                  <option value="price">Price (High to Low)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Detailed Enquiries Table */}
          <div className="table-responsive" style={{ marginTop: '1rem' }}>
            <table className="enquiries-table">
              <thead>
                <tr>
                  <th style={{ width: '12%' }}>Ref ID</th>
                  <th style={{ width: '32%' }}>Vehicle Listing / Title</th>
                  <th style={{ width: '12%' }}>Type</th>
                  <th style={{ width: '22%' }}>Customer Contact</th>
                  <th style={{ width: '14%' }}>Date & Time</th>
                  <th style={{ width: '8%', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedEnquiries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-cell">
                      <div className="empty-state">
                        <Car size={32} style={{ opacity: 0.3, marginBottom: '6px' }} />
                        <div>No enquiry records match your search criteria.</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedEnquiries.map((enq) => {
                    const isRent = (enq.enquiry_type || 'sale').toLowerCase() === 'rent';
                    return (
                      <tr key={enq.id || enq._id}>
                        {/* Reference ID */}
                        <td>
                          <span className="ref-tag">
                            {enq.reference_id || `REF-${enq.listing_id || '001'}`}
                          </span>
                        </td>

                        {/* Vehicle Title & Model */}
                        <td>
                          <div className="vehicle-cell">
                            <div className="vehicle-title-text">{enq.listing_title}</div>
                            <div className="vehicle-sub-specs">
                              {enq.vehicle_brand && (
                                <span>{enq.vehicle_brand} {enq.vehicle_model}</span>
                              )}
                              {enq.price_label && (
                                <span className="vehicle-price-chip">{enq.price_label}</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Enquiry Type Badge */}
                        <td>
                          <span className={isRent ? 'type-badge-rent' : 'type-badge-sale'}>
                            {isRent ? 'For Rent' : 'For Sale'}
                          </span>
                        </td>

                        {/* Customer Contact */}
                        <td>
                          <div className="customer-info-box">
                            <div className="customer-name-text">
                              {enq.customer_name || 'Marketplace Visitor'}
                            </div>
                            <div className="customer-phone-text">
                              {enq.customer_phone ? (
                                <a
                                  href={`https://wa.me/${enq.customer_phone.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="wa-phone-link"
                                  dir="ltr"
                                >
                                  <WhatsAppIcon size={12} color="#25D366" />
                                  <span>{enq.customer_phone}</span>
                                </a>
                              ) : (
                                <span className="via-badge">Direct WhatsApp Enquiry</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Date and Time */}
                        <td>
                          <div className="date-time-cell">
                            <div className="date-main">
                              {enq.created_at
                                ? new Date(enq.created_at).toLocaleDateString('en-GB', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  })
                                : 'Recent'}
                            </div>
                            <div className="date-time-sub">
                              {enq.created_at
                                ? new Date(enq.created_at).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                : ''}
                            </div>
                          </div>
                        </td>

                        {/* Action Link & Delete */}
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                            {enq.whatsapp_link && (
                              <a
                                href={enq.whatsapp_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-chat-link"
                                title="Open WhatsApp chat link"
                              >
                                <WhatsAppIcon size={14} color="#25D366" />
                              </a>
                            )}
                            <button
                              type="button"
                              className="btn-delete-row"
                              onClick={() => handleDeleteSingleEnquiry(enq.id || enq._id)}
                              title="Delete record"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {processedEnquiries.length > 0 && (
            <div className="enquiries-pagination-bar">
              <div className="pagination-count-label">
                Showing{' '}
                <strong>
                  {Math.min((currentPage - 1) * itemsPerPage + 1, processedEnquiries.length)} -{' '}
                  {Math.min(currentPage * itemsPerPage, processedEnquiries.length)}
                </strong>{' '}
                of <strong>{processedEnquiries.length}</strong> enquiries
              </div>

              <div className="pagination-buttons">
                <button
                  type="button"
                  className="btn-page-nav"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>

                <div className="page-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                    <button
                      key={num}
                      type="button"
                      className={`page-num-btn ${currentPage === num ? 'active' : ''}`}
                      onClick={() => setCurrentPage(num)}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className="btn-page-nav"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* WHATSAPP ENQUIRY SHARING MODAL                      */}
      {/* ==================================================== */}
      {shareModalSeller && (
        <div className="modal-backdrop" onClick={() => setShareModalSeller(null)}>
          <div
            className="share-wa-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="share-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="share-modal-icon">
                  <WhatsAppIcon size={22} color="#ffffff" />
                </div>
                <div>
                  <h3 className="share-modal-title">Share Enquiries via WhatsApp</h3>
                  <div className="share-modal-sub">
                    Send structured enquiry summary directly to <strong>{shareModalSeller.seller || shareModalSeller.seller_name}</strong>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="share-modal-close"
                onClick={() => setShareModalSeller(null)}
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="share-modal-body">
              {/* Destination Phone Input */}
              <div className="share-field-group">
                <label className="share-field-label">
                  <Phone size={14} />
                  Seller WhatsApp Number
                </label>
                <input
                  type="text"
                  value={sharePhone}
                  onChange={(e) => setSharePhone(e.target.value)}
                  className="share-phone-input"
                  placeholder="+971 50 123 4567"
                  dir="ltr"
                />
                <span className="share-field-hint">
                  The formatted message will be dispatched directly to this WhatsApp contact.
                </span>
              </div>

              {/* Message Textarea Preview */}
              <div className="share-field-group" style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="share-field-label">
                    <MessageSquare size={14} />
                    Message Preview & Customization
                  </label>
                  <button
                    type="button"
                    className="btn-copy-preview"
                    onClick={handleCopyShareMessage}
                  >
                    {copiedSuccess ? (
                      <>
                        <Check size={13} color="#059669" />
                        <span style={{ color: '#059669', fontWeight: 600 }}>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>Copy Message</span>
                      </>
                    )}
                  </button>
                </div>

                <textarea
                  value={shareMessageText}
                  onChange={(e) => setShareMessageText(e.target.value)}
                  rows={12}
                  className="share-textarea"
                />
                <span className="share-field-hint">
                  You can edit or personalize this summary before dispatching it to the seller.
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="share-modal-footer">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setShareModalSeller(null)}
              >
                Close
              </button>

              <button
                type="button"
                className="btn-modal-send-wa"
                onClick={handleSendWhatsApp}
              >
                <WhatsAppIcon size={18} color="#ffffff" />
                <span>Send to Seller on WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
