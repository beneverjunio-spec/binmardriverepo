import React, { useState } from 'react';
import {
  Eye,
  CheckCircle,
  XCircle,
  FileText,
  MapPin,
  Calendar,
  Gauge,
  Fuel,
  ShieldCheck,
  Phone,
  Mail,
  Car,
  Tag,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function ModerationTab({ moderationQueue, onResolveModeration }) {
  const [inspectingItem, setInspectingItem] = useState(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  const openInspection = (item) => {
    setInspectingItem(item);
    setActivePhotoIdx(0);
  };

  const closeInspection = () => {
    setInspectingItem(null);
    setActivePhotoIdx(0);
  };

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h2>Vehicle Moderation Queue</h2>
          <p>Review car images, Mulkiya documents, vehicle specifications, and seller details before publishing.</p>
        </div>
        <span className="pending-count">{moderationQueue.length} pending review</span>
      </div>

      <table>
        <thead>
          <tr>
            <th>Vehicle & Photos</th>
            <th>Seller Info</th>
            <th>Specifications</th>
            <th>Price</th>
            <th>Mulkiya / Document</th>
            <th>Details</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {moderationQueue.length > 0 ? (
            moderationQueue.map(item => {
              const images = Array.isArray(item.images) && item.images.length > 0
                ? item.images
                : ['https://images.unsplash.com/photo-1594502184342-2e12f877aa73?w=800&auto=format&fit=crop'];
              const coverImage = images[0];
              const docName = item.document_name || item.document_file || 'Mulkiya_Registration.pdf';

              return (
                <tr key={item.id}>
                  {/* Vehicle Thumbnail & Title */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '54px',
                          height: '44px',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          background: '#1a232f',
                          flexShrink: 0,
                          cursor: 'pointer',
                          border: '1px solid rgba(212, 175, 55, 0.3)',
                          position: 'relative'
                        }}
                        onClick={() => openInspection(item)}
                        title="Click to inspect all photos"
                      >
                        <img
                          src={coverImage}
                          alt={item.title}
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
                          style={{ cursor: 'pointer', color: 'var(--gold, #d4af37)' }}
                          onClick={() => openInspection(item)}
                        >
                          {item.title}
                        </div>
                        <div className="cell-sub" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={11} /> {item.city || 'Dubai'}, {item.country || 'UAE'}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Seller Info */}
                  <td>
                    <div className="cell-main">{item.seller_name || item.seller || 'Verified Seller'}</div>
                    {(item.whatsapp_number || item.contact_phone) && (
                      <div className="cell-sub" style={{ color: '#25D366' }}>
                        {item.whatsapp_number || item.contact_phone}
                      </div>
                    )}
                  </td>

                  {/* Specifications */}
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      <span className={`badge ${(item.condition_type || item.condition) === 'new' ? 'new' : 'used'}`}>
                        {(item.condition_type || item.condition) === 'new' ? 'New' : 'Used'}
                      </span>
                      <span className="badge" style={{ background: 'rgba(255,255,255,0.08)', color: '#cbd5e1' }}>
                        {item.category || 'SUV'}
                      </span>
                      {item.mileage && (
                        <span className="badge" style={{ background: 'rgba(255,255,255,0.08)', color: '#cbd5e1' }}>
                          {item.mileage}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Price */}
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--gold, #d4af37)' }}>
                      {item.price_label || `${item.currency || 'AED'} ${Number(item.price || 0).toLocaleString()}`}
                    </div>
                    <div className="cell-sub" style={{ textTransform: 'capitalize' }}>
                      {(item.listing_type || item.type) === 'rent' ? 'For Rent' : 'For Sale'}
                    </div>
                  </td>

                  {/* Mulkiya Document */}
                  <td>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '4px 8px',
                        background: 'rgba(212, 175, 55, 0.1)',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        color: 'var(--gold, #d4af37)',
                        fontSize: '0.78rem',
                        fontWeight: 600
                      }}
                      onClick={() =>
                        alert(
                          `Official Registration Verification Document:\n\nVehicle: ${item.title}\nDocument: ${docName}\nSeller: ${item.seller_name || 'Seller'}\nLocation: ${item.city || 'Dubai'}, ${item.country || 'UAE'}\nStatus: Verified Mulkiya Attached`
                        )
                      }
                      title="Inspect attached Mulkiya document"
                    >
                      <FileText size={13} />
                      <span>View Mulkiya</span>
                    </div>
                  </td>

                  {/* Inspect Details Button */}
                  <td>
                    <button
                      type="button"
                      onClick={() => openInspection(item)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '5px 10px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '4px',
                        color: '#f8fafc',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}
                    >
                      <Eye size={13} /> Inspect All
                    </button>
                  </td>

                  {/* Actions */}
                  <td>
                    <div className="row-actions">
                      <button
                        className="act-btn approve"
                        onClick={() => onResolveModeration(item.id, true)}
                        title="Approve and publish to marketplace"
                      >
                        Approve & Publish
                      </button>
                      <button
                        className="act-btn reject"
                        onClick={() => onResolveModeration(item.id, false)}
                        title="Reject submission"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr className="empty-row">
              <td colSpan="7">Queue is clear! All submissions have been moderated.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* FULL VEHICLE & DOCUMENT INSPECTION MODAL */}
      {inspectingItem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 10, 15, 0.75)',
            backdropFilter: 'blur(6px)',
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
              maxWidth: '52rem',
              maxHeight: '92vh',
              background: '#0d131a',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              borderRadius: '1rem',
              boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              color: '#f1f5f9'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '1.2rem 1.5rem',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#131b24'
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
                    background: 'rgba(212, 175, 55, 0.15)',
                    color: 'var(--gold, #d4af37)',
                    border: '1px solid rgba(212, 175, 55, 0.3)'
                  }}>
                    Moderation Inspection
                  </span>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'rgba(234, 179, 8, 0.15)',
                    color: '#facc15',
                    border: '1px solid rgba(234, 179, 8, 0.3)'
                  }}>
                    Pending Approval
                  </span>
                </div>
                <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, color: '#f8fafc' }}>
                  {inspectingItem.title}
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

            {/* Modal Scrollable Content */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Photo Gallery & Switcher */}
              <div>
                {(() => {
                  const imgs = Array.isArray(inspectingItem.images) && inspectingItem.images.length > 0
                    ? inspectingItem.images
                    : ['https://images.unsplash.com/photo-1594502184342-2e12f877aa73?w=800&auto=format&fit=crop'];
                  const currentPhoto = imgs[activePhotoIdx] || imgs[0];

                  return (
                    <div>
                      <div style={{
                        position: 'relative',
                        width: '100%',
                        height: '320px',
                        background: '#05080c',
                        borderRadius: '0.75rem',
                        overflow: 'hidden',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}>
                        <img
                          src={currentPhoto}
                          alt={inspectingItem.title}
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

              {/* Price & Primary Details Banner */}
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
                    {(inspectingItem.listing_type || inspectingItem.type) === 'rent' ? 'Rental Listing Price' : 'Asking Sale Price'}
                  </span>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--gold, #d4af37)' }}>
                    {inspectingItem.price_label || `${inspectingItem.currency || 'AED'} ${Number(inspectingItem.price || 0).toLocaleString()}`}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Location</span>
                  <div style={{ fontWeight: 600, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={14} style={{ color: 'var(--gold, #d4af37)' }} />
                    {inspectingItem.location || `${inspectingItem.city || 'Dubai'}, ${inspectingItem.country || 'UAE'}`}
                  </div>
                </div>
              </div>

              {/* Vehicle Specifications Grid */}
              <div>
                <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em', marginBottom: '10px' }}>
                  Vehicle Specifications
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '10px'
                }}>
                  <div style={{ background: '#131b24', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Make</span>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>{inspectingItem.make}</p>
                  </div>
                  <div style={{ background: '#131b24', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Model</span>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>{inspectingItem.model}</p>
                  </div>
                  <div style={{ background: '#131b24', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Year</span>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>{inspectingItem.year}</p>
                  </div>
                  <div style={{ background: '#131b24', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Category</span>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>{inspectingItem.category || 'SUV'}</p>
                  </div>
                  <div style={{ background: '#131b24', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Mileage</span>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>{inspectingItem.mileage || '0 km'}</p>
                  </div>
                  <div style={{ background: '#131b24', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Fuel Type</span>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>{inspectingItem.fuel || 'Petrol'}</p>
                  </div>
                  <div style={{ background: '#131b24', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Transmission</span>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>{inspectingItem.transmission || 'Automatic'}</p>
                  </div>
                  <div style={{ background: '#131b24', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Condition</span>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', textTransform: 'capitalize' }}>
                      {inspectingItem.condition_type || inspectingItem.condition || 'Pre-Owned'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Seller & Document Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {/* Seller Box */}
                <div style={{ background: '#131b24', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: 'var(--gold, #d4af37)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Car size={15} /> Seller Information
                  </h4>
                  <p style={{ margin: '0 0 4px 0', fontWeight: 700, fontSize: '1rem' }}>
                    {inspectingItem.seller_name || inspectingItem.seller || 'Verified Seller'}
                  </p>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: '#25D366', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Phone size={13} /> {inspectingItem.whatsapp_number || inspectingItem.contact_phone || 'WhatsApp Available'}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Mail size={13} /> {inspectingItem.seller_email || inspectingItem.email || 'seller@binmardrive.com'}
                  </p>
                </div>

                {/* Mulkiya Document Box */}
                <div style={{ background: '#131b24', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.25)' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: 'var(--gold, #d4af37)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={15} /> Mulkiya & Registration Document
                  </h4>
                  <p style={{ margin: '0 0 4px 0', fontWeight: 600, fontSize: '0.9rem', color: '#f8fafc' }}>
                    {inspectingItem.document_name || inspectingItem.document_file || 'Mulkiya_Vehicle_Registration.pdf'}
                  </p>
                  <p style={{ margin: '0 0 8px 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                    Official government ownership / technical inspection document submitted by seller.
                  </p>
                  <button
                    type="button"
                    style={{
                      padding: '4px 10px',
                      borderRadius: '4px',
                      background: 'rgba(212, 175, 55, 0.15)',
                      border: '1px solid rgba(212, 175, 55, 0.4)',
                      color: 'var(--gold, #d4af37)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                    onClick={() =>
                      alert(
                        `MULKIYA REGISTRATION DETAILS\n\nVehicle: ${inspectingItem.title}\nDocument: ${inspectingItem.document_name || inspectingItem.document_file || 'Mulkiya_Vehicle_Registration.pdf'}\nChassis/VIN: Verified GCC Spec\nRegistered Owner: ${inspectingItem.seller_name || 'Owner'}\nStatus: Document Verified for Administrative Approval`
                      )
                    }
                  >
                    Inspect Mulkiya Verification
                  </button>
                </div>
              </div>

              {/* Description */}
              {inspectingItem.description && (
                <div style={{ background: '#131b24', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '0.85rem', color: '#94a3b8' }}>Vehicle Description / Remarks</h4>
                  <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.5', color: '#cbd5e1' }}>
                    {inspectingItem.description}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#131b24'
            }}>
              <button
                type="button"
                onClick={closeInspection}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
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
                  className="act-btn reject"
                  style={{ padding: '8px 20px', fontSize: '0.88rem' }}
                  onClick={() => {
                    onResolveModeration(inspectingItem.id, false);
                    closeInspection();
                  }}
                >
                  Reject Listing
                </button>
                <button
                  type="button"
                  className="act-btn approve"
                  style={{ padding: '8px 24px', fontSize: '0.88rem' }}
                  onClick={() => {
                    onResolveModeration(inspectingItem.id, true);
                    closeInspection();
                  }}
                >
                  Approve & Publish to Marketplace
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
