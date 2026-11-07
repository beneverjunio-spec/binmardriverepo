import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  X,
  Building2,
  Search,
  Eye,
  User,
  Download,
  FileSpreadsheet,
  CheckSquare,
  Square,
  ExternalLink,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import DocumentViewerModal from '../common/DocumentViewerModal';
import { exportToExcel } from '../../utils/exportToExcel';

export default function DealersTab({ dealerQueue = [], onResolveDealer, onDeleteDealer }) {
  const [selectedDealerDoc, setSelectedDealerDoc] = useState(null);
  const [viewingDocument, setViewingDocument] = useState(null);
  const [dealerToDelete, setDealerToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'pending' | 'verified' | 'rejected'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  const pendingCount = dealerQueue.filter(d => !d.status || d.status === 'pending').length;
  const verifiedCount = dealerQueue.filter(d => d.status === 'verified' || d.status === 'approved').length;
  const rejectedCount = dealerQueue.filter(d => d.status === 'rejected').length;

  const filteredDealers = dealerQueue.filter(dealer => {
    // 1. Status Filter
    if (filterStatus === 'pending') {
      if (dealer.status && dealer.status !== 'pending') return false;
    } else if (filterStatus === 'verified') {
      if (dealer.status !== 'verified' && dealer.status !== 'approved') return false;
    } else if (filterStatus === 'rejected') {
      if (dealer.status !== 'rejected') return false;
    }

    // 2. Search Query
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (dealer.name && dealer.name.toLowerCase().includes(q)) ||
      (dealer.company_name && dealer.company_name.toLowerCase().includes(q)) ||
      (dealer.email && dealer.email.toLowerCase().includes(q)) ||
      (dealer.phone && dealer.phone.toLowerCase().includes(q)) ||
      (dealer.country && dealer.country.toLowerCase().includes(q)) ||
      (dealer.trade_license && dealer.trade_license.toLowerCase().includes(q))
    );
  });

  // Selection handlers
  const allFilteredSelected = filteredDealers.length > 0 && filteredDealers.every(d => selectedIds.includes(d.id));

  const handleToggleAll = () => {
    if (allFilteredSelected) {
      const filteredIdSet = new Set(filteredDealers.map(d => d.id));
      setSelectedIds(prev => prev.filter(id => !filteredIdSet.has(id)));
    } else {
      const newIds = Array.from(new Set([...selectedIds, ...filteredDealers.map(d => d.id)]));
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
      ? filteredDealers.filter(d => selectedIds.includes(d.id))
      : filteredDealers;

    if (listToExport.length === 0) {
      alert('No dealer data available to export.');
      return;
    }

    const headers = [
      'Dealer / Company Name',
      'Account Type',
      'Email Address',
      'Phone Number',
      'Country / Jurisdiction',
      'License / ID Number',
      'Verification Status',
      'Document Name',
      'Registration Date'
    ];

    const rows = listToExport.map(d => [
      d.company_name || d.name || 'N/A',
      d.user_type === 'company' ? 'Commercial Dealership' : 'Private Seller',
      d.email || 'N/A',
      d.phone || 'N/A',
      d.country || 'United Arab Emirates',
      d.trade_license || 'CN-Pending',
      d.status || 'Pending Review',
      d.trade_license_file || 'Trade_License.pdf',
      d.created_at ? new Date(d.created_at).toLocaleDateString() : 'N/A'
    ]);

    const dateStr = new Date().toISOString().slice(0, 10);
    exportToExcel(`BinmarDrive_Dealers_Export_${dateStr}`, headers, rows);
  };

  const openDocumentViewer = (dealer) => {
    setViewingDocument({
      title: dealer.user_type === 'company' ? 'Commercial Trade License Certificate' : 'Seller Verification Document',
      documentName: dealer.trade_license_file || `${dealer.name || 'Dealer'}_Trade_License.pdf`,
      documentType: 'license',
      documentUrl: dealer.trade_license_url || dealer.document_url || null,
      data: dealer
    });
  };

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h2>Registered Dealers & Sellers Directory</h2>
          <p>Complete directory of commercial dealerships and private sellers. Audit trade licenses, verify documents, and export records.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
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
            title="Export selected or filtered dealers to Excel (CSV)"
          >
            <FileSpreadsheet size={16} />
            <span>
              {selectedIds.length > 0
                ? `Export Selected (${selectedIds.length}) to Excel`
                : 'Export to Excel'}
            </span>
          </button>

          <input
            className="search"
            placeholder="Search by company, name, email, license..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ minWidth: '260px' }}
          />
        </div>
      </div>

      {/* Filter Tabs / Pills */}
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
            onClick={() => setFilterStatus('all')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: filterStatus === 'all' ? '1px solid var(--gold, #d4af37)' : '1px solid rgba(255, 255, 255, 0.15)',
              background: filterStatus === 'all' ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.04)',
              color: filterStatus === 'all' ? 'var(--gold, #d4af37)' : '#94a3b8'
            }}
          >
            All Registered ({dealerQueue.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus('pending')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: filterStatus === 'pending' ? '1px solid var(--gold, #d4af37)' : '1px solid rgba(212, 175, 55, 0.25)',
              background: filterStatus === 'pending' ? 'rgba(212, 175, 55, 0.25)' : 'rgba(212, 175, 55, 0.06)',
              color: 'var(--gold, #d4af37)'
            }}
          >
            Pending Review ({pendingCount})
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus('verified')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: filterStatus === 'verified' ? '1px solid #4ade80' : '1px solid rgba(74, 222, 128, 0.25)',
              background: filterStatus === 'verified' ? 'rgba(34, 197, 94, 0.25)' : 'rgba(34, 197, 94, 0.06)',
              color: '#4ade80'
            }}
          >
            Verified Active ({verifiedCount})
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus('rejected')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: filterStatus === 'rejected' ? '1px solid #f87171' : '1px solid rgba(239, 68, 68, 0.25)',
              background: filterStatus === 'rejected' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(239, 68, 68, 0.06)',
              color: '#f87171'
            }}
          >
            Rejected ({rejectedCount})
          </button>
        </div>

        {/* Selection Status indicator */}
        {selectedIds.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--gold, #d4af37)', fontWeight: 700 }}>
              {selectedIds.length} dealer(s) selected
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
            <th>Company / Seller</th>
            <th>Account Type</th>
            <th>Contact Email</th>
            <th>Country</th>
            <th>License / ID</th>
            <th>Status</th>
            <th>Details & Document</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredDealers.length > 0 ? (
            filteredDealers.map(dealer => {
              const isSelected = selectedIds.includes(dealer.id);
              const isPending = !dealer.status || dealer.status === 'pending';
              const isVerified = dealer.status === 'verified' || dealer.status === 'approved';
              const isRejected = dealer.status === 'rejected';

              return (
                <tr
                  key={dealer.id}
                  style={{
                    background: isSelected ? 'rgba(212, 175, 55, 0.08)' : 'transparent'
                  }}
                >
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleRow(dealer.id)}
                      style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--gold, #d4af37)' }}
                    />
                  </td>
                  <td>
                    <div
                      className="cell-main"
                      style={{ cursor: 'pointer', color: '#f8fafc', fontWeight: 700 }}
                      onClick={() => setSelectedDealerDoc(dealer)}
                    >
                      {dealer.name || dealer.company_name}
                    </div>
                    {dealer.phone && (
                      <div className="cell-sub" style={{ color: '#25D366', fontWeight: 600 }}>
                        {dealer.phone}
                      </div>
                    )}
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      background: dealer.user_type === 'company' ? 'rgba(212, 175, 55, 0.15)' : 'rgba(100, 150, 255, 0.15)',
                      color: dealer.user_type === 'company' ? 'var(--gold)' : '#7cb3ff',
                      border: dealer.user_type === 'company' ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid rgba(100, 150, 255, 0.3)'
                    }}>
                      {dealer.user_type === 'company' ? 'Commercial Dealer' : 'Private Seller'}
                    </span>
                  </td>
                  <td>{dealer.email || 'N/A'}</td>
                  <td>{dealer.country}</td>
                  <td>{dealer.trade_license || 'Pending Verification'}</td>
                  <td>
                    {isPending && (
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: 'rgba(234, 179, 8, 0.15)',
                        color: '#facc15',
                        border: '1px solid rgba(234, 179, 8, 0.3)'
                      }}>
                        Pending Review
                      </span>
                    )}
                    {isVerified && (
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: 'rgba(34, 197, 94, 0.15)',
                        color: '#4ade80',
                        border: '1px solid rgba(34, 197, 94, 0.3)'
                      }}>
                        Verified Active
                      </span>
                    )}
                    {isRejected && (
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: 'rgba(239, 68, 68, 0.15)',
                        color: '#f87171',
                        border: '1px solid rgba(239, 68, 68, 0.3)'
                      }}>
                        Rejected
                      </span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <button
                        type="button"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '5px 10px',
                          background: 'rgba(212, 175, 55, 0.12)',
                          border: '1px solid rgba(212, 175, 55, 0.4)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          color: 'var(--gold, #d4af37)',
                          fontSize: '0.78rem',
                          fontWeight: 700
                        }}
                        onClick={() => setSelectedDealerDoc(dealer)}
                        title="Inspect full seller credentials and review document"
                      >
                        <Eye size={13} />
                        <span>View Details</span>
                      </button>

                      <button
                        type="button"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '5px 9px',
                          background: 'rgba(34, 197, 94, 0.12)',
                          border: '1px solid rgba(34, 197, 94, 0.35)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          color: '#4ade80',
                          fontSize: '0.78rem',
                          fontWeight: 700
                        }}
                        onClick={() => openDocumentViewer(dealer)}
                        title="Click to view attached official Trade License document"
                      >
                        <FileText size={13} />
                        <span>Doc</span>
                      </button>
                    </div>
                  </td>
                  <td>
                    <div className="row-actions" style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                      {isPending && (
                        <>
                          <button
                            className="act-btn approve"
                            onClick={() => onResolveDealer(dealer.id, true)}
                            title="Verify and grant full access to Seller Studio"
                          >
                            Approve
                          </button>
                          <button
                            className="act-btn reject"
                            onClick={() => onResolveDealer(dealer.id, false)}
                            title="Reject this registration"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {isVerified && (
                        <button
                          className="act-btn reject"
                          onClick={() => onResolveDealer(dealer.id, false)}
                          title="Revoke verified status"
                        >
                          Revoke
                        </button>
                      )}
                      {isRejected && (
                        <button
                          className="act-btn approve"
                          onClick={() => onResolveDealer(dealer.id, true)}
                          title="Re-verify and approve seller"
                        >
                          Re-Approve
                        </button>
                      )}
                      <button
                        type="button"
                        className="act-btn delete"
                        onClick={() => setDealerToDelete(dealer)}
                        title="Delete seller from directory"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '5px 10px',
                          borderRadius: '4px',
                          background: 'rgba(239, 68, 68, 0.12)',
                          color: '#ef4444',
                          border: '1px solid rgba(239, 68, 68, 0.35)',
                          cursor: 'pointer',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.22)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)'}
                      >
                        <Trash2 size={12} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr className="empty-row">
              <td colSpan="9">
                {filterStatus === 'all'
                  ? 'No registered dealers or sellers found.'
                  : `No dealers or sellers found under "${filterStatus}" status.`}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* DOCUMENT VERIFICATION MODAL POPUP */}
      {selectedDealerDoc && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 10, 15, 0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setSelectedDealerDoc(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '46rem',
              maxHeight: '90vh',
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '8px',
                  background: 'rgba(212, 175, 55, 0.15)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--gold, #d4af37)'
                }}>
                  {selectedDealerDoc.user_type === 'company' ? <Building2 size={20} /> : <User size={20} />}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
                    {selectedDealerDoc.user_type === 'company' ? 'Commercial Trade License Certificate' : 'Seller Identity & Registration Certificate'}
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                    Official Administrative Verification & Review Archive
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDealerDoc(null)}
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

            {/* Modal Body */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{
                background: 'linear-gradient(145deg, #101721 0%, #172230 100%)',
                border: '1px solid rgba(212, 175, 55, 0.35)',
                borderRadius: '12px',
                padding: '1.5rem',
                position: 'relative'
              }}>
                {/* Certificate Sub-Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px dashed rgba(212, 175, 55, 0.3)',
                  paddingBottom: '1rem',
                  marginBottom: '1.25rem'
                }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gold, #d4af37)', fontWeight: 700 }}>
                      OFFICIAL REGISTRATION VERIFICATION
                    </p>
                    <h4 style={{ margin: '2px 0 0 0', fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc' }}>
                      {selectedDealerDoc.name || selectedDealerDoc.company_name}
                    </h4>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: (selectedDealerDoc.status === 'verified' || selectedDealerDoc.status === 'approved')
                      ? 'rgba(34, 197, 94, 0.15)'
                      : (selectedDealerDoc.status === 'rejected' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(212, 175, 55, 0.15)'),
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    color: (selectedDealerDoc.status === 'verified' || selectedDealerDoc.status === 'approved')
                      ? '#4ade80'
                      : (selectedDealerDoc.status === 'rejected' ? '#f87171' : 'var(--gold, #d4af37)'),
                    fontSize: '0.78rem',
                    fontWeight: 700
                  }}>
                    <ShieldCheck size={16} />
                    {selectedDealerDoc.status === 'verified' || selectedDealerDoc.status === 'approved'
                      ? 'Verified Active'
                      : (selectedDealerDoc.status === 'rejected' ? 'Rejected' : 'Pending Review')}
                  </div>
                </div>

                {/* Details Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px',
                  fontSize: '0.85rem'
                }}>
                  <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Entity / Trade Name</span>
                    <p style={{ margin: '2px 0 0 0', fontWeight: 700, color: '#f8fafc' }}>
                      {selectedDealerDoc.name || selectedDealerDoc.company_name}
                    </p>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Account Classification</span>
                    <p style={{ margin: '2px 0 0 0', fontWeight: 700, color: selectedDealerDoc.user_type === 'company' ? 'var(--gold)' : '#7cb3ff' }}>
                      {selectedDealerDoc.user_type === 'company' ? 'Commercial Dealership' : 'Private Verified Seller'}
                    </p>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>License / ID Number</span>
                    <p style={{ margin: '2px 0 0 0', fontWeight: 700, color: 'var(--gold, #d4af37)' }}>
                      {selectedDealerDoc.trade_license || `CN-REG-${selectedDealerDoc.id}9382`}
                    </p>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Country / Region</span>
                    <p style={{ margin: '2px 0 0 0', fontWeight: 700, color: '#f8fafc' }}>
                      {selectedDealerDoc.country || 'United Arab Emirates'}
                    </p>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Official Email</span>
                    <p style={{ margin: '2px 0 0 0', fontWeight: 700, color: '#f8fafc' }}>
                      {selectedDealerDoc.email || 'N/A'}
                    </p>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Official Contact Phone</span>
                    <p style={{ margin: '2px 0 0 0', fontWeight: 700, color: '#25D366' }}>
                      {selectedDealerDoc.phone || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* CLICKABLE Attached Document File Box */}
                <div
                  onClick={() => openDocumentViewer(selectedDealerDoc)}
                  style={{
                    marginTop: '1.25rem',
                    padding: '12px 16px',
                    background: 'rgba(212, 175, 55, 0.12)',
                    border: '1.5px solid rgba(212, 175, 55, 0.45)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  }}
                  title="Click to view and inspect this document in full viewer"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '6px',
                      background: 'rgba(212, 175, 55, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--gold, #d4af37)'
                    }}>
                      <FileText size={22} />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 800, fontSize: '0.92rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{selectedDealerDoc.trade_license_file || `${selectedDealerDoc.name || 'Company'}_Trade_License.pdf`}</span>
                        <Eye size={14} style={{ color: 'var(--gold, #d4af37)' }} />
                      </p>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                        Uploaded document &bull; <span style={{ color: 'var(--gold, #d4af37)', fontWeight: 600 }}>Click to View & Print Document</span>
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      padding: '5px 12px',
                      borderRadius: '4px',
                      background: 'rgba(34, 197, 94, 0.2)',
                      color: '#4ade80',
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
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              background: '#131b24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <button
                type="button"
                onClick={() => setSelectedDealerDoc(null)}
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
                Close
              </button>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                  type="button"
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    color: '#ef4444',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.82rem'
                  }}
                  onClick={() => {
                    const toDelete = selectedDealerDoc;
                    setSelectedDealerDoc(null);
                    setDealerToDelete(toDelete);
                  }}
                  title="Permanently delete this seller record"
                >
                  <Trash2 size={14} />
                  <span>Delete Seller</span>
                </button>
                <button
                  type="button"
                  className="act-btn reject"
                  style={{ padding: '8px 18px' }}
                  onClick={() => {
                    onResolveDealer(selectedDealerDoc.id, false);
                    setSelectedDealerDoc(null);
                  }}
                >
                  Reject Application
                </button>
                <button
                  type="button"
                  className="act-btn approve"
                  style={{ padding: '8px 22px' }}
                  onClick={() => {
                    onResolveDealer(selectedDealerDoc.id, true);
                    setSelectedDealerDoc(null);
                  }}
                >
                  Approve & Verify Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION POPUP MODAL BEFORE DELETION */}
      {dealerToDelete && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.78)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '20px'
          }}
          onClick={() => {
            if (!isDeleting) setDealerToDelete(null);
          }}
        >
          <div
            style={{
              background: '#0d261d',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              borderRadius: '14px',
              maxWidth: '520px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
              color: '#f8fafc',
              position: 'relative',
              animation: 'fadeIn 0.2s ease-out'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444',
                flexShrink: 0
              }}>
                <Trash2 size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#fff', fontWeight: 800 }}>
                  Confirm Seller Deletion
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                  Please confirm that you want to delete this seller from BinmarDrive.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDealerToDelete(null)}
                disabled={isDeleting}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Seller Details Card */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              padding: '16px',
              marginBottom: '18px',
              fontSize: '0.88rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#94a3b8' }}>Seller / Dealership:</span>
                <span style={{ color: '#fff', fontWeight: 700 }}>
                  {dealerToDelete.company_name || dealerToDelete.name || 'Seller'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#94a3b8' }}>Account Type:</span>
                <span style={{ color: '#d4af37', fontWeight: 600, textTransform: 'uppercase' }}>
                  {dealerToDelete.user_type === 'company' ? 'Commercial Dealer' : 'Private Seller'}
                </span>
              </div>
              {dealerToDelete.email && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#94a3b8' }}>Email Address:</span>
                  <span style={{ color: '#38bdf8' }}>{dealerToDelete.email}</span>
                </div>
              )}
              {dealerToDelete.phone && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#94a3b8' }}>Phone / WhatsApp:</span>
                  <span style={{ color: '#cbd5e1' }}>{dealerToDelete.phone}</span>
                </div>
              )}
              {dealerToDelete.country && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Country:</span>
                  <span style={{ color: '#cbd5e1' }}>{dealerToDelete.country}</span>
                </div>
              )}
            </div>

            {/* Warning Message */}
            <div style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '12px 14px',
              marginBottom: '22px',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start'
            }}>
              <AlertTriangle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.82rem', color: '#fca5a5', lineHeight: 1.5 }}>
                <strong>Permanent Deletion:</strong> This action cannot be reversed. The seller's credentials, verification documents, and all submitted vehicle listings will be permanently removed from the system.
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setDealerToDelete(null)}
                disabled={isDeleting}
                style={{
                  padding: '10px 20px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  color: '#cbd5e1',
                  fontWeight: 600,
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  fontSize: '0.88rem'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  try {
                    setIsDeleting(true);
                    const targetId = dealerToDelete.id;
                    if (onDeleteDealer) {
                      await onDeleteDealer(targetId);
                    }
                    setDealerToDelete(null);
                  } catch (err) {
                    console.error('Failed to delete dealer:', err);
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                style={{
                  padding: '10px 22px',
                  borderRadius: '6px',
                  background: '#ef4444',
                  border: '1px solid #dc2626',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  fontSize: '0.88rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
                }}
              >
                <Trash2 size={16} />
                <span>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL DOCUMENT VIEWER MODAL */}
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
            const raw = localStorage.getItem('binmar_custom_dealers');
            if (raw) {
              const items = JSON.parse(raw);
              const idx = items.findIndex(d => String(d.id) === String(viewingDocument.data.id));
              if (idx !== -1) {
                items[idx].trade_license_url = fileUrl;
                if (fileName) items[idx].trade_license_file = fileName;
                localStorage.setItem('binmar_custom_dealers', JSON.stringify(items));
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
