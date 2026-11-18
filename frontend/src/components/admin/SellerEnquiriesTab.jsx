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
  AlertTriangle,
  Car
} from 'lucide-react';
import { exportToExcel } from '../../utils/exportToExcel';
import { WhatsAppIcon } from '../common/WhatsAppIcon';
import {
  deleteEnquiry,
  clearSellerEnquiries,
  deleteMultipleEnquiries,
  clearMultipleSellersEnquiries
} from '../../api/enquiries';
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

  // Selection state for Sellers Overview (View 1)
  const [selectedSellers, setSelectedSellers] = useState(new Set());

  // Search & Filter state for Detailed Enquiries view
  const [enquirySearch, setEnquirySearch] = useState('');
  const [enquiryTypeFilter, setEnquiryTypeFilter] = useState('all'); // 'all' | 'sale' | 'rent'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'title' | 'price'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Selection state for Detailed Enquiries view (View 2)
  const [selectedEnquiryIds, setSelectedEnquiryIds] = useState(new Set());

  // Dedicated Deletion Confirmation Modal state
  const [confirmModalState, setConfirmModalState] = useState(null);

  // WhatsApp Share Modal state
  const [shareModalSeller, setShareModalSeller] = useState(null);
  const [sharePhone, setSharePhone] = useState('');
  const [shareMessageText, setShareMessageText] = useState('');
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // ----------------------------------------------------
  // Accurate Dashboard Figures (Directly derived from the current list)
  // ----------------------------------------------------
  const activeEnquiriesList = enquiries || [];
  const displayTotalEnquiries = activeEnquiriesList.length;
  const displayTotalSale = useMemo(() => {
    return activeEnquiriesList.filter(e => (e.enquiry_type || 'sale').toLowerCase() === 'sale').length;
  }, [activeEnquiriesList]);
  const displayTotalRent = useMemo(() => {
    return activeEnquiriesList.filter(e => (e.enquiry_type || '').toLowerCase() === 'rent').length;
  }, [activeEnquiriesList]);
  const displayTotalSellers = useMemo(() => {
    if (sellerSummaries && sellerSummaries.length > 0) {
      return sellerSummaries.filter(s => s.total > 0).length;
    }
    const set = new Set(activeEnquiriesList.map(e => (e.seller_name || '').trim().toLowerCase()).filter(Boolean));
    return set.size;
  }, [sellerSummaries, activeEnquiriesList]);

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

  // Sellers Selection Calculations
  const isAllSellersSelected = useMemo(() => {
    if (!filteredSellers.length) return false;
    return filteredSellers.every(s => selectedSellers.has(s.seller));
  }, [filteredSellers, selectedSellers]);

  const selectedSellersEnquiryCount = useMemo(() => {
    let sum = 0;
    sellerSummaries.forEach(s => {
      if (selectedSellers.has(s.seller)) sum += (s.total || 0);
    });
    return sum;
  }, [sellerSummaries, selectedSellers]);

  const toggleSelectSeller = (sellerName) => {
    setSelectedSellers(prev => {
      const next = new Set(prev);
      if (next.has(sellerName)) next.delete(sellerName);
      else next.add(sellerName);
      return next;
    });
  };

  const toggleSelectAllSellers = () => {
    if (isAllSellersSelected) {
      setSelectedSellers(new Set());
    } else {
      setSelectedSellers(new Set(filteredSellers.map(s => s.seller)));
    }
  };

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
  // Detailed Enquiries Selection Helpers
  // ----------------------------------------------------
  const isAllEnquiriesSelected = useMemo(() => {
    if (!paginatedEnquiries.length) return false;
    return paginatedEnquiries.every(e => selectedEnquiryIds.has(String(e.id || e._id)));
  }, [paginatedEnquiries, selectedEnquiryIds]);

  const toggleSelectEnquiry = (id) => {
    const str = String(id);
    setSelectedEnquiryIds(prev => {
      const next = new Set(prev);
      if (next.has(str)) next.delete(str);
      else next.add(str);
      return next;
    });
  };

  const toggleSelectAllEnquiries = () => {
    if (isAllEnquiriesSelected) {
      setSelectedEnquiryIds(new Set());
    } else {
      setSelectedEnquiryIds(new Set(paginatedEnquiries.map(e => String(e.id || e._id))));
    }
  };

  // ----------------------------------------------------
  // Deletion Request & Confirmation Handlers
  // ----------------------------------------------------
  const handleRequestDeleteSingleSeller = (sellerName, totalCount = 0) => {
    setConfirmModalState({
      isOpen: true,
      type: 'sellers',
      sellerNames: [sellerName],
      sellerDetails: [{ name: sellerName, count: totalCount }],
      totalEnquiries: totalCount,
      isProcessing: false
    });
  };

  const handleRequestDeleteSelectedSellers = () => {
    if (!selectedSellers.size) return;
    const names = Array.from(selectedSellers);
    const details = names.map(name => {
      const summary = sellerSummaries.find(s => s.seller === name);
      return { name, count: summary ? summary.total : 0 };
    });
    const total = details.reduce((sum, d) => sum + d.count, 0);

    setConfirmModalState({
      isOpen: true,
      type: 'sellers',
      sellerNames: names,
      sellerDetails: details,
      totalEnquiries: total,
      isProcessing: false
    });
  };

  const handleRequestDeleteSingleEnquiry = (id, title = 'Enquiry') => {
    setConfirmModalState({
      isOpen: true,
      type: 'enquiries',
      enquiryIds: [String(id)],
      enquiryDetails: [{ title, ref: String(id) }],
      totalEnquiries: 1,
      isProcessing: false
    });
  };

  const handleRequestDeleteSelectedEnquiries = () => {
    if (!selectedEnquiryIds.size) return;
    const ids = Array.from(selectedEnquiryIds);
    const details = ids.map(id => {
      const record = enquiries.find(e => String(e.id || e._id) === id);
      return {
        title: record?.listing_title || `Enquiry #${id}`,
        ref: record?.reference_id || `REF-${id}`
      };
    });

    setConfirmModalState({
      isOpen: true,
      type: 'enquiries',
      enquiryIds: ids,
      enquiryDetails: details,
      totalEnquiries: ids.length,
      isProcessing: false
    });
  };

  const executeConfirmedDeletion = async () => {
    if (!confirmModalState) return;
    setConfirmModalState(prev => ({ ...prev, isProcessing: true }));

    try {
      if (confirmModalState.type === 'sellers') {
        await clearMultipleSellersEnquiries(confirmModalState.sellerNames);
        notify(`Deleted enquiries for ${confirmModalState.sellerNames.length} seller(s).`);
        setSelectedSellers(new Set());
        if (selectedSellerName && confirmModalState.sellerNames.includes(selectedSellerName)) {
          setSelectedSellerName(null);
        }
      } else {
        await deleteMultipleEnquiries(confirmModalState.enquiryIds);
        notify(`Deleted ${confirmModalState.enquiryIds.length} enquiry record(s).`);
        setSelectedEnquiryIds(new Set());
      }
      setConfirmModalState(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      notify(err?.message || 'Failed to delete enquiries. Please try again.');
      setConfirmModalState(prev => ({ ...prev, isProcessing: false }));
    }
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

      {/* KPI Stats Cards - Strictly driven by current active list data */}
      <div className="enquiries-kpi-grid">
        <div className="enquiries-kpi-card">
          <div className="kpi-icon-wrap" style={{ background: 'rgba(37, 211, 102, 0.12)', color: '#25D366' }}>
            <WhatsAppIcon size={24} color="#25D366" />
          </div>
          <div>
            <div className="kpi-label">Total WhatsApp Enquiries</div>
            <div className="kpi-value">{displayTotalEnquiries}</div>
            <div className="kpi-hint">Across all vehicle listings</div>
          </div>
        </div>

        <div className="enquiries-kpi-card">
          <div className="kpi-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
            <Tag size={24} />
          </div>
          <div>
            <div className="kpi-label">For Sale Enquiries</div>
            <div className="kpi-value" style={{ color: '#059669' }}>{displayTotalSale}</div>
            <div className="kpi-hint">
              {displayTotalEnquiries > 0 ? `${Math.round((displayTotalSale / displayTotalEnquiries) * 100)}% of total enquiries` : '0%'}
            </div>
          </div>
        </div>

        <div className="enquiries-kpi-card">
          <div className="kpi-icon-wrap" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' }}>
            <Car size={24} />
          </div>
          <div>
            <div className="kpi-label">For Rent Enquiries</div>
            <div className="kpi-value" style={{ color: '#2563eb' }}>{displayTotalRent}</div>
            <div className="kpi-hint">
              {displayTotalEnquiries > 0 ? `${Math.round((displayTotalRent / displayTotalEnquiries) * 100)}% of total enquiries` : '0%'}
            </div>
          </div>
        </div>

        <div className="enquiries-kpi-card">
          <div className="kpi-icon-wrap" style={{ background: 'rgba(212, 175, 55, 0.15)', color: '#B8860B' }}>
            <Building2 size={24} />
          </div>
          <div>
            <div className="kpi-label">Active Sellers</div>
            <div className="kpi-value">{displayTotalSellers}</div>
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

          {/* Selection Action Bar (when 1 or more sellers selected) */}
          {selectedSellers.size > 0 && (
            <div className="selection-action-bar">
              <div className="selection-info">
                <CheckCircle2 size={18} color="#059669" />
                <span>
                  <strong>{selectedSellers.size}</strong> seller{selectedSellers.size > 1 ? 's' : ''} selected
                  {' '}(<strong>{selectedSellersEnquiryCount}</strong> total enquiries)
                </span>
              </div>
              <div className="selection-actions">
                <button
                  type="button"
                  className="btn-selection-delete"
                  onClick={handleRequestDeleteSelectedSellers}
                  title="Delete enquiries for selected sellers"
                >
                  <Trash2 size={14} />
                  <span>Delete Selected ({selectedSellers.size})</span>
                </button>
                <button
                  type="button"
                  className="btn-selection-cancel"
                  onClick={() => setSelectedSellers(new Set())}
                >
                  Deselect All
                </button>
              </div>
            </div>
          )}

          {/* Grouped Sellers Table */}
          <div className="table-responsive">
            <table className="enquiries-table">
              <thead>
                <tr>
                  <th style={{ width: '44px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={isAllSellersSelected}
                      onChange={toggleSelectAllSellers}
                      className="enquiry-checkbox"
                      aria-label="Select all sellers"
                      title="Select all sellers"
                    />
                  </th>
                  <th style={{ width: '28%' }}>Seller</th>
                  <th style={{ width: '16%', textAlign: 'center' }}>Total Enquiries</th>
                  <th style={{ width: '22%' }}>Enquiry Breakdown</th>
                  <th style={{ width: '14%' }}>Latest Activity</th>
                  <th style={{ width: '16%', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSellers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-cell">
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
                    <tr
                      key={item.seller}
                      className={`seller-row ${selectedSellers.has(item.seller) ? 'row-selected' : ''}`}
                    >
                      {/* Selection Checkbox */}
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={selectedSellers.has(item.seller)}
                          onChange={() => toggleSelectSeller(item.seller)}
                          className="enquiry-checkbox"
                          aria-label={`Select ${item.seller}`}
                        />
                      </td>

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
                              <span dir="ltr">{item.seller_phone || '+971 52 653 9699'}</span>
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

                          <button
                            type="button"
                            className="btn-action-delete-seller"
                            onClick={() => handleRequestDeleteSingleSeller(item.seller, item.total)}
                            title={`Delete enquiries for ${item.seller}`}
                          >
                            <Trash2 size={14} />
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
                  onClick={() => handleRequestDeleteSingleSeller(selectedSellerName, currentSellerEnquiries.length)}
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

          {/* Selection Action Bar for Detailed View (when 1 or more enquiries selected) */}
          {selectedEnquiryIds.size > 0 && (
            <div className="selection-action-bar" style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
              <div className="selection-info">
                <CheckCircle2 size={18} color="#059669" />
                <span>
                  <strong>{selectedEnquiryIds.size}</strong> enquiry record{selectedEnquiryIds.size > 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="selection-actions">
                <button
                  type="button"
                  className="btn-selection-delete"
                  onClick={handleRequestDeleteSelectedEnquiries}
                  title="Delete selected enquiry records"
                >
                  <Trash2 size={14} />
                  <span>Delete Selected ({selectedEnquiryIds.size})</span>
                </button>
                <button
                  type="button"
                  className="btn-selection-cancel"
                  onClick={() => setSelectedEnquiryIds(new Set())}
                >
                  Deselect All
                </button>
              </div>
            </div>
          )}

          {/* Detailed Enquiries Table */}
          <div className="table-responsive" style={{ marginTop: '1rem' }}>
            <table className="enquiries-table">
              <thead>
                <tr>
                  <th style={{ width: '44px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={isAllEnquiriesSelected}
                      onChange={toggleSelectAllEnquiries}
                      className="enquiry-checkbox"
                      aria-label="Select all enquiries"
                      title="Select all enquiries on this page"
                    />
                  </th>
                  <th style={{ width: '12%' }}>Ref ID</th>
                  <th style={{ width: '30%' }}>Vehicle Listing / Title</th>
                  <th style={{ width: '12%' }}>Type</th>
                  <th style={{ width: '20%' }}>Customer Contact</th>
                  <th style={{ width: '14%' }}>Date & Time</th>
                  <th style={{ width: '8%', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedEnquiries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="empty-cell">
                      <div className="empty-state">
                        <Car size={32} style={{ opacity: 0.3, marginBottom: '6px' }} />
                        <div>No enquiry records match your search criteria.</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedEnquiries.map((enq) => {
                    const isRent = (enq.enquiry_type || 'sale').toLowerCase() === 'rent';
                    const isEnqSelected = selectedEnquiryIds.has(String(enq.id || enq._id));
                    return (
                      <tr key={enq.id || enq._id} className={isEnqSelected ? 'row-selected' : ''}>
                        {/* Selection Checkbox */}
                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={isEnqSelected}
                            onChange={() => toggleSelectEnquiry(enq.id || enq._id)}
                            className="enquiry-checkbox"
                            aria-label={`Select enquiry ${enq.reference_id}`}
                          />
                        </td>

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
                              onClick={() => handleRequestDeleteSingleEnquiry(enq.id || enq._id, enq.listing_title)}
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

      {/* ==================================================== */}
      {/* DEDICATED DELETION CONFIRMATION MODAL               */}
      {/* ==================================================== */}
      {confirmModalState && confirmModalState.isOpen && (
        <div
          className="modal-backdrop"
          onClick={() => !confirmModalState.isProcessing && setConfirmModalState(null)}
        >
          <div
            className="confirm-delete-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="confirm-modal-header">
              <div className="confirm-icon-badge">
                <Trash2 size={22} color="#dc2626" />
              </div>
              <div>
                <h3 className="confirm-modal-title">
                  {confirmModalState.type === 'sellers'
                    ? `Delete Enquiries: ${confirmModalState.sellerNames.length} Seller${confirmModalState.sellerNames.length > 1 ? 's' : ''}`
                    : `Delete Enquiry Record${confirmModalState.enquiryIds.length > 1 ? 's' : ''}`}
                </h3>
                <p className="confirm-modal-subtitle">
                  Confirmation required before proceeding with deletion
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="confirm-modal-body">
              <div className="confirm-warning-banner">
                <AlertTriangle size={18} color="#c2410c" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  {confirmModalState.type === 'sellers' ? (
                    <>
                      Are you sure you want to delete all enquiries for <strong>{confirmModalState.sellerNames.length} seller(s)</strong>?
                      This will permanently remove <strong>{confirmModalState.totalEnquiries} enquiry record(s)</strong>.
                    </>
                  ) : (
                    <>
                      Are you sure you want to delete <strong>{confirmModalState.totalEnquiries} enquiry record(s)</strong>?
                    </>
                  )}
                </div>
              </div>

              <div className="confirm-items-preview">
                <div className="confirm-items-heading">
                  {confirmModalState.type === 'sellers' ? 'Sellers to be cleared:' : 'Records to be deleted:'}
                </div>
                <div className="confirm-items-list">
                  {confirmModalState.type === 'sellers' ? (
                    confirmModalState.sellerDetails.map((s, idx) => (
                      <div key={idx} className="confirm-item-row">
                        <span className="confirm-item-name">{s.name}</span>
                        <span className="confirm-item-badge">{s.count} enquiries</span>
                      </div>
                    ))
                  ) : (
                    confirmModalState.enquiryDetails.map((e, idx) => (
                      <div key={idx} className="confirm-item-row">
                        <span className="confirm-item-name">{e.title}</span>
                        {e.ref && <span className="confirm-item-badge">{e.ref}</span>}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <p className="confirm-irreversible-note">
                ⚠️ <strong>Note:</strong> This action cannot be undone. Dashboard KPI numbers, seller enquiry counters, and reports will update immediately to reflect the new figures.
              </p>
            </div>

            {/* Footer */}
            <div className="confirm-modal-footer">
              <button
                type="button"
                className="btn-confirm-cancel"
                onClick={() => setConfirmModalState(null)}
                disabled={confirmModalState.isProcessing}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn-confirm-delete"
                onClick={executeConfirmedDeletion}
                disabled={confirmModalState.isProcessing}
              >
                <Trash2 size={16} />
                <span>
                  {confirmModalState.isProcessing ? 'Deleting...' : 'Yes, Delete Permanently'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
