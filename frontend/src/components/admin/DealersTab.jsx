import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  X,
  Building2,
  UserCheck,
  Mail,
  Phone,
  Search,
  Eye,
  Check,
  Ban,
  RefreshCw,
  User
} from 'lucide-react';

export default function DealersTab({ dealerQueue = [], onResolveDealer }) {
  const [selectedDealerDoc, setSelectedDealerDoc] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'pending' | 'verified' | 'rejected'
  const [searchQuery, setSearchQuery] = useState('');

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

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h2>Registered Dealers & Sellers Directory</h2>
          <p>Complete directory of commercial dealerships and private sellers. Audit trade licenses, verify documents, and manage account authorization.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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
        gap: '8px',
        padding: '0 1.5rem 1rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        flexWrap: 'wrap'
      }}>
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

      <table>
        <thead>
          <tr>
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
              const isPending = !dealer.status || dealer.status === 'pending';
              const isVerified = dealer.status === 'verified' || dealer.status === 'approved';
              const isRejected = dealer.status === 'rejected';

              return (
                <tr key={dealer.id}>
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
                    <button
                      type="button"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '5px 12px',
                        background: 'rgba(212, 175, 55, 0.12)',
                        border: '1px solid rgba(212, 175, 55, 0.4)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        color: 'var(--gold, #d4af37)',
                        fontSize: '0.8rem',
                        fontWeight: 700
                      }}
                      onClick={() => setSelectedDealerDoc(dealer)}
                      title="Inspect full seller credentials and documents"
                    >
                      <Eye size={14} />
                      <span>View Details</span>
                    </button>
                  </td>
                  <td>
                    <div className="row-actions">
                      {isPending && (
                        <>
                          <button
                            className="act-btn approve"
                            onClick={() => onResolveDealer(dealer.id, true)}
                            title="Verify and grant full access to Seller Studio"
                          >
                            Approve & Verify
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
                          Revoke / Reject
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
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr className="empty-row">
              <td colSpan="8">
                {filterStatus === 'all'
                  ? 'No registered dealers or sellers found.'
                  : `No dealers or sellers found under "${filterStatus}" status.`}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* DOCUMENT VERIFICATION MODAL POPUP (Inspect anytime!) */}
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
              maxWidth: '44rem',
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
                      {selectedDealerDoc.user_type === 'company' ? 'Commercial Trade License Certificate' : 'Seller Identity & Registration Certificate'}
                    </h3>
                  </div>
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

                {/* Attached Document File Box */}
                <div style={{
                  marginTop: '1rem',
                  padding: '10px 14px',
                  background: 'rgba(212, 175, 55, 0.08)',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText size={22} style={{ color: 'var(--gold, #d4af37)' }} />
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem', color: '#f8fafc' }}>
                        {selectedDealerDoc.trade_license_file || `${selectedDealerDoc.name || 'Company'}_Trade_License.pdf`}
                      </p>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                        Uploaded document &bull; Digital Verification Archive Attached
                      </p>
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: 'rgba(34, 197, 94, 0.15)',
                    color: '#4ade80',
                    border: '1px solid rgba(34, 197, 94, 0.3)'
                  }}>
                    PDF Document
                  </span>
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
              justifyContent: 'space-between'
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
                Close Document
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
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
    </div>
  );
}
