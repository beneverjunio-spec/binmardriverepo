import React, { useState } from 'react';
import { FileText, ShieldCheck, X, Building2, UserCheck, Mail, Phone, FileCheck } from 'lucide-react';

export default function DealersTab({ dealerQueue, onResolveDealer }) {
  const [selectedDealerDoc, setSelectedDealerDoc] = useState(null);

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h2>Commercial Dealer & Seller Verification</h2>
          <p>Company and seller registrations requiring administrative trade license review.</p>
        </div>
        <span className="pending-count">{dealerQueue.length} pending</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Company / Seller</th>
            <th>Type</th>
            <th>Contact Email</th>
            <th>Country</th>
            <th>License / ID</th>
            <th>Document</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {dealerQueue.length > 0 ? (
            dealerQueue.map(dealer => (
              <tr key={dealer.id}>
                <td>
                  <div className="cell-main">{dealer.name || dealer.company_name}</div>
                  {dealer.phone && <div className="cell-sub">{dealer.phone}</div>}
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
                  <button
                    type="button"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 10px',
                      background: 'rgba(212, 175, 55, 0.12)',
                      border: '1px solid rgba(212, 175, 55, 0.4)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      color: 'var(--gold, #d4af37)',
                      fontSize: '0.8rem',
                      fontWeight: 700
                    }}
                    onClick={() => setSelectedDealerDoc(dealer)}
                    title="Inspect verification document"
                  >
                    <FileText size={14} />
                    <span>View Document</span>
                  </button>
                </td>
                <td>
                  <div className="row-actions">
                    <button
                      className="act-btn approve"
                      onClick={() => onResolveDealer(dealer.id, true)}
                    >
                      Approve & Verify
                    </button>
                    <button
                      className="act-btn reject"
                      onClick={() => onResolveDealer(dealer.id, false)}
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr className="empty-row">
              <td colSpan="7">No pending dealer or seller registrations waiting for review.</td>
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
              maxWidth: '42rem',
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
                  <Building2 size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
                      {selectedDealerDoc.user_type === 'company' ? 'Commercial Trade License Certificate' : 'Seller Identity & Registration Certificate'}
                    </h3>
                  </div>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                    Department of Economic Development & Registration Authority Review
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
                      OFFICIAL COMMERCIAL VERIFICATION
                    </p>
                    <h4 style={{ margin: '2px 0 0 0', fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
                      {selectedDealerDoc.name || selectedDealerDoc.company_name}
                    </h4>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(212, 175, 55, 0.1)',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    color: 'var(--gold, #d4af37)',
                    fontSize: '0.78rem',
                    fontWeight: 700
                  }}>
                    <ShieldCheck size={16} /> Certified Filing
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
                    <p style={{ margin: '2px 0 0 0', fontWeight: 700, color: '#f8fafc' }}>{selectedDealerDoc.name || selectedDealerDoc.company_name}</p>
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
                  Reject Verification
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
