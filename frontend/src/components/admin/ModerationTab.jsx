import React, { useState } from 'react';
import DocumentViewerModal from '../common/DocumentViewerModal';
import {
  AlertTriangle,
  Eye,
  CheckCircle,
  CheckCircle2,
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
  ChevronRight,
  FileCheck,
  Printer,
  Download,
  Upload
} from 'lucide-react';

export default function ModerationTab({ moderationQueue, onResolveModeration }) {
  const [inspectingItem, setInspectingItem] = useState(null);
  const [documentModalItem, setDocumentModalItem] = useState(null);
  const [viewingFullDoc, setViewingFullDoc] = useState(null);
  const [rejectingItem, setRejectingItem] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const docFileInputRef = React.useRef(null);

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
            <th>Full Details</th>
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
              const docName = item.document_name || item.document_file || 'Mulkiya_Vehicle_Registration.pdf';

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
                          border: '1px solid rgba(212, 175, 55, 0.4)',
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
                          style={{ cursor: 'pointer', color: 'var(--gold, #d4af37)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}
                          onClick={() => openInspection(item)}
                        >
                          <span>{item.title}</span>
                          {(item.resubmitted || item.previous_rejection_reason) && (
                            <span style={{
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: 'rgba(59, 130, 246, 0.2)',
                              color: '#60a5fa',
                              border: '1px solid rgba(59, 130, 246, 0.4)'
                            }}>
                              Resubmitted
                            </span>
                          )}
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
                      <div className="cell-sub" style={{ color: '#25D366', fontWeight: 600 }}>
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
                    <button
                      type="button"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 10px',
                        background: 'rgba(212, 175, 55, 0.12)',
                        border: '1px solid rgba(212, 175, 55, 0.4)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        color: 'var(--gold, #d4af37)',
                        fontSize: '0.8rem',
                        fontWeight: 700
                      }}
                      onClick={() => setViewingFullDoc({
                        title: 'Vehicle Mulkiya & Registration Certificate',
                        documentName: item.document_name || item.document_file || `${item.make}_${item.model}_Mulkiya.pdf`,
                        documentType: 'mulkiya',
                        documentUrl: item.document_url || null,
                        data: item
                      })}
                      title="Inspect official Mulkiya verification document"
                    >
                      <FileText size={14} />
                      <span>View Mulkiya</span>
                    </button>
                  </td>

                  {/* Inspect Details Button */}
                  <td>
                    <button
                      type="button"
                      onClick={() => openInspection(item)}
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
                      <Eye size={14} /> Inspect All
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
                        onClick={() => { setRejectingItem(item); setRejectionReason(""); }}
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

      {/* OFFICIAL MULKIYA DOCUMENT MODAL POPUP (Replaces browser alert) */}
      {documentModalItem && (() => {
        const docName = documentModalItem.document_name || documentModalItem.document_file || 'Mulkiya_Vehicle_Registration.pdf';
        const docUrl = documentModalItem.document_url;
        const isImage = Boolean(
          docUrl?.startsWith('data:image/') ||
          (docUrl && /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(docUrl)) ||
          /\.(png|jpe?g|webp|gif|svg)$/i.test(docName)
        );
        const isPdf = Boolean(
          docUrl?.startsWith('data:application/pdf') ||
          (docUrl && /\.pdf(\?.*)?$/i.test(docUrl)) ||
          docName.toLowerCase().endsWith('.pdf')
        );

        const handleAttachDocFile = (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (ev) => {
            const dataUrl = ev.target.result;
            setDocumentModalItem(prev => ({
              ...prev,
              document_url: dataUrl,
              document_file: file.name,
              document_name: file.name
            }));
            try {
              const raw = localStorage.getItem('binmar_custom_listings');
              if (raw) {
                const listings = JSON.parse(raw);
                const idx = listings.findIndex(l => String(l.id) === String(documentModalItem.id));
                if (idx !== -1) {
                  listings[idx].document_url = dataUrl;
                  listings[idx].document_file = file.name;
                  listings[idx].document_name = file.name;
                  localStorage.setItem('binmar_custom_listings', JSON.stringify(listings));
                }
              }
            } catch (err) {
              console.warn(err);
            }
          };
          reader.readAsDataURL(file);
        };

        const handleOpenViewPrint = () => {
          if (docUrl) {
            // Open full DocumentViewerModal directly for viewing
            setViewingFullDoc({
              title: 'Vehicle Mulkiya & Registration Certificate',
              documentName: docName,
              documentType: 'mulkiya',
              documentUrl: docUrl,
              data: documentModalItem
            });
            setDocumentModalItem(null);
          } else if (docFileInputRef.current) {
            docFileInputRef.current.click();
          }
        };

        const handleDirectPrint = () => {
          if (docUrl) {
            const win = window.open();
            if (win) {
              if (isImage) {
                win.document.write(`<html><head><title>${docName}</title></head><body style="margin:0; display:flex; justify-content:center; align-items:center; min-height:100vh;"><img src="${docUrl}" style="max-width:100%; max-height:100vh; object-fit:contain;" onload="window.print();" /></body></html>`);
              } else {
                win.document.write(`<iframe src="${docUrl}" frameborder="0" style="width:100%; height:100vh;" onload="window.print();"></iframe>`);
              }
            }
          } else {
            window.print();
          }
        };

        const handleDirectDownload = () => {
          if (docUrl) {
            const a = document.createElement('a');
            a.href = docUrl;
            a.download = docName || 'Mulkiya_Document.jpg';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          } else if (docFileInputRef.current) {
            docFileInputRef.current.click();
          }
        };

        return (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(5, 10, 15, 0.88)',
              backdropFilter: 'blur(8px)',
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}
            onClick={() => setDocumentModalItem(null)}
          >
            {/* Hidden File Picker */}
            <input
              type="file"
              ref={docFileInputRef}
              accept=".pdf,image/*"
              style={{ display: 'none' }}
              onChange={handleAttachDocFile}
            />

            <div
              style={{
                width: '100%',
                maxWidth: '52rem',
                maxHeight: '94vh',
                background: '#0d131a',
                border: '1.5px solid rgba(212, 175, 55, 0.5)',
                borderRadius: '1rem',
                boxShadow: '0 30px 80px rgba(0, 0, 0, 0.85)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                color: '#f8fafc'
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Document Modal Header */}
              <div style={{
                padding: '1.1rem 1.5rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                background: '#131b24',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px'
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
                    <FileText size={20} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc' }}>
                        Vehicle Mulkiya & Registration Certificate
                      </h3>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: docUrl ? 'rgba(34, 197, 94, 0.15)' : 'rgba(212, 175, 55, 0.15)',
                        color: docUrl ? '#4ade80' : 'var(--gold, #d4af37)',
                        border: docUrl ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(212, 175, 55, 0.3)'
                      }}>
                        {docUrl ? 'Document Attached & Loaded' : 'Verified Document Record'}
                      </span>
                    </div>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                      Official technical ownership & roadworthiness registration review
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={handleDirectPrint}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '6px 12px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '6px',
                      color: '#cbd5e1',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                    title="Print document"
                  >
                    <Printer size={13} /> Print
                  </button>

                  <button
                    onClick={() => setDocumentModalItem(null)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Close"
                  >
                    <X size={22} />
                  </button>
                </div>
              </div>

              {/* Document Body */}
              <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Certificate Card Container */}
                <div style={{
                  background: 'linear-gradient(145deg, #101721 0%, #172230 100%)',
                  border: '1px solid rgba(212, 175, 55, 0.35)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  position: 'relative',
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                }}>
                  {/* Top Seal Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px dashed rgba(212, 175, 55, 0.3)',
                    paddingBottom: '0.9rem',
                    marginBottom: '1rem',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gold, #d4af37)', fontWeight: 800 }}>
                        MINISTRY OF TRANSPORT & VEHICLE REGISTRATION
                      </p>
                      <h4 style={{ margin: '2px 0 0 0', fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
                        Electronic Vehicle Mulkiya (Official Government Verified)
                      </h4>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'rgba(212, 175, 55, 0.1)',
                      padding: '5px 10px',
                      borderRadius: '6px',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      color: 'var(--gold, #d4af37)',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}>
                      <ShieldCheck size={15} /> Certified
                    </div>
                  </div>

                  {/* Certificate Data Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '10px',
                    fontSize: '0.84rem'
                  }}>
                    <div style={{ background: 'rgba(0,0,0,0.25)', padding: '9px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Registered Vehicle</span>
                      <p style={{ margin: '2px 0 0 0', fontWeight: 800, color: '#f8fafc' }}>{documentModalItem.title}</p>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.25)', padding: '9px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Owner / Seller Name</span>
                      <p style={{ margin: '2px 0 0 0', fontWeight: 800, color: '#f8fafc' }}>{documentModalItem.seller_name || 'Registered Owner'}</p>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.25)', padding: '9px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Registration Number / Plate</span>
                      <p style={{ margin: '2px 0 0 0', fontWeight: 800, color: 'var(--gold, #d4af37)' }}>
                        {documentModalItem.city || 'Dubai'} &bull; {10000 + (documentModalItem.id % 89999)}
                      </p>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.25)', padding: '9px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Chassis / VIN Code</span>
                      <p style={{ margin: '2px 0 0 0', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.04em' }}>
                        GCC-784{String(documentModalItem.id).slice(-4)}829104
                      </p>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.25)', padding: '9px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Country & Jurisdiction</span>
                      <p style={{ margin: '2px 0 0 0', fontWeight: 700, color: '#f8fafc' }}>
                        {documentModalItem.city || 'Dubai'}, {documentModalItem.country || 'United Arab Emirates'}
                      </p>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.25)', padding: '9px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Technical Inspection Status</span>
                      <p style={{ margin: '2px 0 0 0', fontWeight: 700, color: '#4ade80' }}>
                        &bull; Passed & Roadworthy
                      </p>
                    </div>
                  </div>

                  {/* CLICKABLE Attached Document File Box */}
                  <div
                    onClick={handleOpenViewPrint}
                    style={{
                      marginTop: '1.1rem',
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
                    title="Click to view and inspect this official document"
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
                          <span>{docName}</span>
                          <Eye size={14} style={{ color: 'var(--gold, #d4af37)' }} />
                          {docUrl && <CheckCircle2 size={14} style={{ color: '#4ade80' }} />}
                        </p>
                        <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                          Official Mulkiya Document &bull; <span style={{ color: 'var(--gold, #d4af37)', fontWeight: 700 }}>Click to View & Print</span>
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '0.76rem',
                        fontWeight: 800,
                        padding: '6px 14px',
                        borderRadius: '6px',
                        background: 'rgba(34, 197, 94, 0.2)',
                        color: '#4ade80',
                        border: '1px solid rgba(34, 197, 94, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}>
                        <ExternalLink size={13} /> View Document
                      </span>
                    </div>
                  </div>

                  {/* DIRECT INLINE DOCUMENT VIEWER (If document is loaded) */}
                  {docUrl && isImage && (
                    <div style={{
                      marginTop: '1.25rem',
                      border: '1.5px solid rgba(212, 175, 55, 0.4)',
                      borderRadius: '8px',
                      background: '#070b10',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        padding: '8px 14px',
                        background: '#131b24',
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '8px'
                      }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle2 size={15} style={{ color: '#4ade80' }} />
                          Attached Document: <strong style={{ color: 'var(--gold, #d4af37)' }}>{docName}</strong>
                        </span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={handleDirectPrint}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '5px 11px',
                              borderRadius: '5px',
                              background: 'rgba(255,255,255,0.08)',
                              border: '1px solid rgba(255,255,255,0.2)',
                              color: '#cbd5e1',
                              fontSize: '0.76rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            <Printer size={13} /> Print
                          </button>
                          <button
                            type="button"
                            onClick={handleDirectDownload}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '5px 11px',
                              borderRadius: '5px',
                              background: 'rgba(212, 175, 55, 0.15)',
                              border: '1px solid rgba(212, 175, 55, 0.4)',
                              color: 'var(--gold, #d4af37)',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            <Download size={13} /> Download
                          </button>
                        </div>
                      </div>
                      <div style={{ padding: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', maxHeight: '45vh', overflow: 'auto' }}>
                        <img src={docUrl} alt={docName} style={{ maxWidth: '100%', maxHeight: '42vh', borderRadius: '4px', objectFit: 'contain' }} />
                      </div>
                    </div>
                  )}

                  {docUrl && isPdf && (
                    <div style={{
                      marginTop: '1.25rem',
                      border: '1.5px solid rgba(212, 175, 55, 0.4)',
                      borderRadius: '8px',
                      background: '#070b10',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        padding: '8px 14px',
                        background: '#131b24',
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle2 size={15} style={{ color: '#4ade80' }} />
                          PDF Document: <strong style={{ color: 'var(--gold, #d4af37)' }}>{docName}</strong>
                        </span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={handleDirectPrint}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '5px 11px',
                              borderRadius: '5px',
                              background: 'rgba(255,255,255,0.08)',
                              border: '1px solid rgba(255,255,255,0.2)',
                              color: '#cbd5e1',
                              fontSize: '0.76rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            <Printer size={13} /> Print
                          </button>
                          <button
                            type="button"
                            onClick={handleDirectDownload}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '5px 11px',
                              borderRadius: '5px',
                              background: 'rgba(212, 175, 55, 0.15)',
                              border: '1px solid rgba(212, 175, 55, 0.4)',
                              color: 'var(--gold, #d4af37)',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            <Download size={13} /> Download
                          </button>
                        </div>
                      </div>
                      <div style={{ height: '45vh' }}>
                        <iframe src={docUrl} title={docName} style={{ width: '100%', height: '100%', border: 'none' }} />
                      </div>
                    </div>
                  )}

                  {/* PROMPT TO ATTACH/LOAD IF MISSING DATAURL */}
                  {!docUrl && (
                    <div style={{
                      marginTop: '1rem',
                      padding: '10px 14px',
                      background: 'rgba(212, 175, 55, 0.08)',
                      border: '1px dashed rgba(212, 175, 55, 0.4)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '10px'
                    }}>
                      <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                        Attached file: <strong style={{ color: 'var(--gold, #d4af37)' }}>{docName}</strong> (Click to select from computer to view and print immediately)
                      </div>
                      <button
                        type="button"
                        onClick={() => docFileInputRef.current?.click()}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 14px',
                          background: 'var(--gold, #d4af37)',
                          color: '#0a0f16',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}
                      >
                        <Upload size={14} /> Attach / Select '{docName}'
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Document Modal Footer */}
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
                  onClick={() => setDocumentModalItem(null)}
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

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="act-btn reject"
                    style={{ padding: '8px 18px' }}
                    onClick={() => {
                      setRejectingItem(documentModalItem);
                      setRejectionReason("");
                      setDocumentModalItem(null);
                    }}
                  >
                    Reject Listing
                  </button>
                  <button
                    type="button"
                    className="act-btn approve"
                    style={{ padding: '8px 22px' }}
                    onClick={() => {
                      onResolveModeration(documentModalItem.id, true);
                      setDocumentModalItem(null);
                      if (inspectingItem?.id === documentModalItem.id) setInspectingItem(null);
                    }}
                  >
                    Approve & Publish to Marketplace
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* FULL VEHICLE & SPECS INSPECTION MODAL */}
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
                {inspectingItem.previous_rejection_reason && (
                  <div style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.35)',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    color: '#93c5fd'
                  }}>
                    <strong style={{ color: '#60a5fa' }}>Resubmitted Listing:</strong> Seller updated vehicle after previous rejection: "{inspectingItem.previous_rejection_reason}"
                  </div>
                )}
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

                  {/* Inline document preview — shows immediately if document_url is available */}
                  {inspectingItem.document_url && (() => {
                    const dUrl = inspectingItem.document_url;
                    const dName = inspectingItem.document_name || inspectingItem.document_file || 'document';
                    const dIsImage = dUrl.startsWith('data:image/') || /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(dName);
                    const dIsPdf = dUrl.startsWith('data:application/pdf') || /\.pdf(\?.*)?$/i.test(dName);
                    return (
                      <div style={{ marginBottom: '10px', border: '1.5px solid rgba(212,175,55,0.4)', borderRadius: '8px', overflow: 'hidden', background: '#070b10' }}>
                        <div style={{ padding: '6px 12px', background: '#131b24', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <CheckCircle size={14} style={{ color: '#4ade80' }} /> {dName}
                          </span>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => {
                                const a = document.createElement('a');
                                a.href = dUrl;
                                a.download = dName;
                                a.click();
                              }}
                              style={{ fontSize: '0.74rem', fontWeight: 700, padding: '3px 9px', borderRadius: '5px', background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.4)', color: 'var(--gold,#d4af37)', cursor: 'pointer' }}
                            >↓ Download</button>
                            <button
                              type="button"
                              onClick={() => { const w = window.open(); if (dIsImage) { w.document.write(`<html><body style="margin:0;background:#000;display:flex;justify-content:center;align-items:center;min-height:100vh"><img src="${dUrl}" style="max-width:100%;max-height:100vh;object-fit:contain"></body></html>`); } else { w.document.write(`<iframe src="${dUrl}" style="width:100%;height:100vh;border:none"></iframe>`); } }}
                              style={{ fontSize: '0.74rem', fontWeight: 700, padding: '3px 9px', borderRadius: '5px', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa', cursor: 'pointer' }}
                            >⤢ Full View</button>
                          </div>
                        </div>
                        {dIsImage && (
                          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '8px', maxHeight: '38vh', overflow: 'auto' }}>
                            <img src={dUrl} alt={dName} style={{ maxWidth: '100%', maxHeight: '36vh', objectFit: 'contain', borderRadius: '4px' }} />
                          </div>
                        )}
                        {dIsPdf && (
                          <div style={{ height: '38vh' }}>
                            <iframe src={dUrl} title={dName} style={{ width: '100%', height: '100%', border: 'none' }} />
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  <button
                    type="button"
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      background: 'rgba(212, 175, 55, 0.15)',
                      border: '1px solid rgba(212, 175, 55, 0.4)',
                      color: 'var(--gold, #d4af37)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                    onClick={() => setViewingFullDoc({
                      title: 'Vehicle Mulkiya & Registration Certificate',
                      documentName: inspectingItem.document_name || inspectingItem.document_file || 'Mulkiya_Vehicle_Registration.pdf',
                      documentType: 'mulkiya',
                      documentUrl: inspectingItem.document_url || null,
                      data: inspectingItem
                    })}
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
                  onClick={() => { setRejectingItem(inspectingItem); setRejectionReason(""); }}
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
      {/* FULL DOCUMENT VIEWER MODAL */}
      <DocumentViewerModal
        isOpen={Boolean(viewingFullDoc)}
        onClose={() => setViewingFullDoc(null)}
        title={viewingFullDoc?.title}
        documentName={viewingFullDoc?.documentName}
        documentType={viewingFullDoc?.documentType}
        documentUrl={viewingFullDoc?.documentUrl}
        data={viewingFullDoc?.data}
        onSaveDocument={(fileUrl, fileName) => {
          if (!viewingFullDoc?.data?.id) return;
          try {
            const raw = localStorage.getItem('binmar_custom_listings');
            if (raw) {
              const listings = JSON.parse(raw);
              const idx = listings.findIndex(l => String(l.id) === String(viewingFullDoc.data.id));
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

      {/* REJECTION REASON MODAL POPUP */}
      {rejectingItem && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 10005,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.25rem'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '32rem',
            background: '#0d131a',
            border: '1.5px solid rgba(239, 68, 68, 0.5)',
            borderRadius: '12px',
            padding: '1.5rem',
            color: '#f8fafc',
            boxShadow: '0 25px 60px rgba(0,0,0,0.8)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={20} /> Reject Listing
              </h3>
              <button onClick={() => setRejectingItem(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '1rem' }}>
              Specify why <strong>{rejectingItem.title}</strong> is being rejected. This remark will be sent to the seller in their portal so they can correct it.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1rem' }}>
              {[
                'Blurry or unreadable Mulkiya document',
                'Incorrect vehicle details or VIN mismatch',
                'Missing required official documents',
                'Pricing does not reflect GCC market standards',
                'Low quality vehicle photos'
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setRejectionReason(chip)}
                  style={{
                    fontSize: '0.75rem',
                    padding: '4px 10px',
                    borderRadius: '16px',
                    background: rejectionReason === chip ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                    border: rejectionReason === chip ? '1px solid #f87171' : '1px solid rgba(255, 255, 255, 0.1)',
                    color: rejectionReason === chip ? '#fca5a5' : '#94a3b8',
                    cursor: 'pointer'
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>
            <textarea
              rows={3}
              placeholder="Type specific remarks or instructions for the seller..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                background: '#131b24',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#f8fafc',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
                outline: 'none',
                resize: 'vertical'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setRejectingItem(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#cbd5e1',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onResolveModeration(rejectingItem.id, false, rejectionReason || 'Listing rejected during administrative audit.');
                  setRejectingItem(null);
                  setDocumentModalItem(null);
                  if (inspectingItem?.id === rejectingItem.id) setInspectingItem(null);
                }}
                style={{
                  padding: '8px 20px',
                  borderRadius: '6px',
                  background: '#ef4444',
                  border: 'none',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}