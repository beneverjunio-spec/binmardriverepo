import React, { useState, useRef } from 'react';
import { Upload, MapPin, Navigation, CheckCircle2 } from 'lucide-react';
import {
  GCC_COUNTRIES,
  GCC_CURRENCIES,
  VEHICLE_MAKES,
  VEHICLE_CATEGORIES,
  FUEL_TYPES,
  TRANSMISSION_TYPES,
  CONTACT_METHODS,
  COUNTRY_DIAL_CODES,
  getCountryCurrency
} from '../constants';
import { uploadListingPhotos, createListing } from '../api/listings';
import { WhatsAppIcon } from '../components/common/WhatsAppIcon';

export default function CreateListingPage({
  currentUser,
  onSuccess,
  onCancel,
  notify
}) {
  const [lstStep, setLstStep] = useState(1);
  const [lstType, setLstType] = useState('sale');
  const [lstCondition, setLstCondition] = useState('new');
  const [lstMake, setLstMake] = useState('Toyota');
  const [lstModel, setLstModel] = useState('');
  const [lstYear, setLstYear] = useState('2024');
  const [lstCategory, setLstCategory] = useState('SUV');
  const [lstFuel, setLstFuel] = useState('Petrol');
  const [lstMileage, setLstMileage] = useState('');
  const [lstTransmission, setLstTransmission] = useState('Automatic');
  const [lstUploadedImages, setLstUploadedImages] = useState([]);
  const [lstPrice, setLstPrice] = useState('');
  const [lstCurrency, setLstCurrency] = useState('AED');
  const [lstCountry, setLstCountry] = useState('United Arab Emirates');
  const [lstCity, setLstCity] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [lstCoordinates, setLstCoordinates] = useState(null);
  const [lstDialCode, setLstDialCode] = useState('+971');
  const [lstWhatsapp, setLstWhatsapp] = useState('');
  const [lstDescription, setLstDescription] = useState('');
  const [lstContact, setLstContact] = useState('WhatsApp');
  const [lstError, setLstError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef(null);

  const handlePhotoSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (files.length + lstUploadedImages.length > 12) {
      notify('A listing can contain up to 12 photos.');
      e.target.value = '';
      return;
    }
    try {
      const data = await uploadListingPhotos(files);
      setLstUploadedImages(prev => [...prev, ...data.images]);
      notify(`${files.length} photo${files.length > 1 ? 's' : ''} uploaded successfully!`);
    } catch (err) {
      notify(err.message || 'Unable to upload photos. Please try again.');
    }
    if (e.target) e.target.value = '';
  };

  const removePhoto = (indexToRemove) => {
    setLstUploadedImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      notify('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLstError('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLstCoordinates({ lat, lng });

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const cityFound = addr.city || addr.town || addr.suburb || addr.neighbourhood || addr.state || 'Dubai';
            const countryFound = addr.country || lstCountry;

            setLstCity(cityFound);
            const matchedCountry = GCC_COUNTRIES.find(c => c.toLowerCase() === countryFound.toLowerCase());
            if (matchedCountry) {
              setLstCountry(matchedCountry);
              setLstCurrency(getCountryCurrency(matchedCountry));
            } else {
              setLstCountry(countryFound);
            }
            notify(`GPS Location Pinned: ${cityFound}, ${countryFound}`);
          } else {
            setLstCity(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
            notify('Current GPS coordinates pinned successfully!');
          }
        } catch {
          setLstCity(`GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          notify('Current GPS coordinates pinned successfully!');
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        if (err.code === 1) {
          notify('Location permission was denied. You can enter your location manually.');
        } else {
          notify('Could not detect GPS location. Please enter manually.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handlePublishListing = async () => {
    setIsSubmitting(true);
    setLstError('');
    try {
      const cleanWa = lstWhatsapp.replace(/[^0-9]/g, '');
      const fullWhatsapp = cleanWa ? `${lstDialCode} ${cleanWa}` : `${lstDialCode} 501234567`;
      const locationCity = lstCity.trim() || 'Dubai';

      const mapsUrl = lstCoordinates
        ? `https://www.google.com/maps?q=${lstCoordinates.lat},${lstCoordinates.lng}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${locationCity}, ${lstCountry}`)}`;

      const payload = {
        make: lstMake,
        model: lstModel,
        year: lstYear,
        category: lstCategory,
        fuel: lstFuel,
        mileage: lstMileage ? `${lstMileage} km` : '0 km',
        transmission: lstTransmission,
        condition_type: lstCondition,
        listing_type: lstType,
        price: lstPrice,
        currency: lstCurrency,
        country: lstCountry,
        city: locationCity,
        location: `${locationCity}, ${lstCountry}`,
        latitude: lstCoordinates ? lstCoordinates.lat : null,
        longitude: lstCoordinates ? lstCoordinates.lng : null,
        maps_url: mapsUrl,
        seller_name: currentUser ? currentUser.name : (lstType === 'rent' ? 'Car Rental Host' : 'Car Owner'),
        contact_preference: 'WhatsApp',
        whatsapp_number: fullWhatsapp,
        contact_phone: fullWhatsapp,
        description: lstDescription || 'Well-maintained vehicle, GCC specs.',
        images: lstUploadedImages
      };

      const data = await createListing(payload);
      if (data.success) {
        notify('Listing submitted! It is now live with your WhatsApp contact and location.');
        onSuccess();
      }
    } catch (e) {
      setLstError(e.message || 'Unable to submit listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flow-wrap">
      <div className="flow-brand">
        <div className="nav-mark" onClick={onCancel}>BINMAR<b>DRIVE</b></div>
        <div>
          <div className="flow-hero">Put your car in front of <em>real buyers</em>.</div>
          <p className="flow-sub">
            List a new or used vehicle for sale or rent. Free to post, for individual owners, dealers and companies across the Middle East.
          </p>
          <div className="odo-line">
            <div className="odo-dot" />
            <div className="odo-text">Zero commission &mdash; direct buyer contact</div>
          </div>
        </div>
        <div className="flow-fine">&copy; 2026 Binmar Drive. All rights reserved.</div>
      </div>

      <div className="flow-formside">
        <div className="flow-card">
          {/* Progress Nodes */}
          <div className="steps">
            <div className={`step-node ${lstStep >= 1 ? 'active' : ''} ${lstStep > 1 ? 'done' : ''}`}>1</div>
            <div className="step-track"><div className="step-track-fill" style={{ width: lstStep >= 2 ? '100%' : '0%' }} /></div>
            <div className={`step-node ${lstStep >= 2 ? 'active' : ''} ${lstStep > 2 ? 'done' : ''}`}>2</div>
            <div className="step-track"><div className="step-track-fill" style={{ width: lstStep >= 3 ? '100%' : '0%' }} /></div>
            <div className={`step-node ${lstStep >= 3 ? 'active' : ''} ${lstStep > 3 ? 'done' : ''}`}>3</div>
            <div className="step-track"><div className="step-track-fill" style={{ width: lstStep >= 4 ? '100%' : '0%' }} /></div>
            <div className={`step-node ${lstStep >= 4 ? 'active' : ''}`}>4</div>
          </div>

          {/* Step 1: Vehicle Basics */}
          {lstStep === 1 && (
            <div>
              <span className="free-badge">Free to post</span>
              <h1 className="step-title">Tell us about the vehicle</h1>
              <p className="step-desc">Start with the basics &mdash; you can refine details later.</p>

              <div className="toggle-pair">
                <div className={`toggle-opt ${lstType === 'sale' ? 'on' : ''}`} onClick={() => setLstType('sale')}>
                  For sale
                </div>
                <div className={`toggle-opt ${lstType === 'rent' ? 'on' : ''}`} onClick={() => setLstType('rent')}>
                  For rent
                </div>
              </div>

              <div className="condition-pair">
                <div
                  className={`cond-card ${lstCondition === 'new' ? 'selected' : ''}`}
                  onClick={() => setLstCondition('new')}
                >
                  Brand new
                </div>
                <div
                  className={`cond-card ${lstCondition === 'used' ? 'selected' : ''}`}
                  onClick={() => setLstCondition('used')}
                >
                  Used
                </div>
              </div>

              <label>Make</label>
              <select value={lstMake} onChange={e => setLstMake(e.target.value)}>
                {VEHICLE_MAKES.map(make => (
                  <option key={make}>{make}</option>
                ))}
              </select>

              <div className="row-2">
                <div>
                  <label>Model</label>
                  <input
                    type="text"
                    placeholder="e.g. Land Cruiser"
                    value={lstModel}
                    onChange={e => setLstModel(e.target.value)}
                  />
                </div>
                <div>
                  <label>Year</label>
                  <select value={lstYear} onChange={e => setLstYear(e.target.value)}>
                    {['2026', '2025', '2024', '2023', '2022', '2021', '2020'].map(y => (
                      <option key={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="row-2">
                <div>
                  <label>Category</label>
                  <select value={lstCategory} onChange={e => setLstCategory(e.target.value)}>
                    {VEHICLE_CATEGORIES.map(cat => (
                      <option key={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Fuel type</label>
                  <select value={lstFuel} onChange={e => setLstFuel(e.target.value)}>
                    {FUEL_TYPES.map(fuel => (
                      <option key={fuel}>{fuel}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="row-2">
                <div>
                  <label>Mileage (km)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={lstMileage}
                    onChange={e => setLstMileage(e.target.value)}
                  />
                </div>
                <div>
                  <label>Transmission</label>
                  <select value={lstTransmission} onChange={e => setLstTransmission(e.target.value)}>
                    {TRANSMISSION_TYPES.map(trans => (
                      <option key={trans}>{trans}</option>
                    ))}
                  </select>
                </div>
              </div>

              {lstError && <p className="err">{lstError}</p>}

              <button
                className="btn-primary"
                onClick={() => {
                  if (!lstModel) {
                    setLstError('Please enter the vehicle model name');
                    return;
                  }
                  setLstError('');
                  setLstStep(2);
                }}
              >
                Continue to Photos &rarr;
              </button>
              <button className="btn-secondary" onClick={onCancel}>
                Cancel
              </button>
            </div>
          )}

          {/* Step 2: Photos */}
          {lstStep === 2 && (
            <div>
              <h1 className="step-title">Add photos</h1>
              <p className="step-desc">Listings with 5 or more photos receive significantly more inquiries. First photo becomes cover.</p>

              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handlePhotoSelect}
              />

              <div className="dropzone" onClick={() => fileInputRef.current?.click()}>
                <Upload size={26} style={{ margin: '0 auto 8px', display: 'block', color: 'var(--gold)' }} />
                <p style={{ fontWeight: 700, color: 'var(--ink)' }}>Click to browse and upload photos</p>
                <p className="small">High resolution JPG or PNG, select one or multiple photos</p>
              </div>

              {lstUploadedImages.length > 0 ? (
                <div className="thumb-grid">
                  {lstUploadedImages.map((imgUrl, i) => (
                    <div
                      key={i}
                      className={`thumb ${i === 0 ? 'cover' : ''}`}
                      style={{
                        backgroundImage: `url(${imgUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        overflow: 'hidden',
                        position: 'relative'
                      }}
                    >
                      {i === 0 && (
                        <span
                          style={{
                            position: 'absolute',
                            bottom: 4,
                            left: 4,
                            background: 'var(--gold)',
                            color: 'var(--ink)',
                            fontSize: '0.62rem',
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: 999
                          }}
                        >
                          Cover
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePhoto(i);
                        }}
                        style={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          background: 'rgba(0,0,0,0.7)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '50%',
                          width: 22,
                          height: 22,
                          fontSize: 14,
                          lineHeight: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                        title="Delete photo"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ textAlign: 'center', color: 'var(--ink-2)', fontSize: '0.82rem', marginBottom: '1.2rem' }}>
                  No photos added yet. Click the box above to select car images from your computer.
                </p>
              )}

              <button className="btn-primary" onClick={() => setLstStep(3)}>
                Continue to Price & Location &rarr;
              </button>
              <button className="btn-secondary" onClick={() => setLstStep(1)}>
                Back
              </button>
            </div>
          )}

          {/* Step 3: Price, Location & WhatsApp Contact */}
          {lstStep === 3 && (
            <div>
              <h1 className="step-title">Price, Location & WhatsApp</h1>
              <p className="step-desc">Buyers and renters will see this on your car listing and reach out directly.</p>

              <div className="row-2">
                <div>
                  <label>Price</label>
                  <input
                    type="number"
                    placeholder="e.g. 185000"
                    value={lstPrice}
                    onChange={e => setLstPrice(e.target.value)}
                  />
                </div>
                <div>
                  <label>Currency</label>
                  <select value={lstCurrency} onChange={e => setLstCurrency(e.target.value)}>
                    {GCC_CURRENCIES.map(curr => (
                      <option key={curr}>{curr}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location Section */}
              <div style={{ marginBottom: '1.2rem', padding: '1.1rem', background: '#fff', borderRadius: '12px', border: '1.5px solid var(--input-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--deep)', margin: 0, fontWeight: 700 }}>
                    <MapPin size={17} color="var(--gold)" />
                    Car Location
                  </label>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={isLocating}
                    className="btn-gps-detect"
                    title="Track my current GPS location so clients can navigate directly"
                  >
                    <Navigation size={14} className={isLocating ? 'spin-icon' : ''} />
                    <span>{isLocating ? 'Tracking Location…' : '📍 Use My Current Location (GPS)'}</span>
                  </button>
                </div>

                {lstCoordinates && (
                  <div className="gps-active-badge">
                    <CheckCircle2 size={16} color="#16A34A" />
                    <span style={{ fontSize: '0.8rem', color: '#14532D', fontWeight: 600 }}>
                      Current GPS Pinned: {lstCoordinates.lat.toFixed(5)}°, {lstCoordinates.lng.toFixed(5)}°
                    </span>
                    <a
                      href={`https://www.google.com/maps?q=${lstCoordinates.lat},${lstCoordinates.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gps-maps-link"
                    >
                      View on Google Maps ↗
                    </a>
                  </div>
                )}

                <div className="row-2" style={{ marginBottom: 0 }}>
                  <div>
                    <label style={{ fontSize: '0.72rem' }}>Country</label>
                    <select
                      value={lstCountry}
                      onChange={e => {
                        const selected = e.target.value;
                        setLstCountry(selected);
                        setLstCurrency(getCountryCurrency(selected));
                      }}
                      style={{ marginBottom: '0.5rem' }}
                    >
                      {GCC_COUNTRIES.map(country => (
                        <option key={country}>{country}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem' }}>City / Area / Showroom (Custom)</label>
                    <input
                      type="text"
                      placeholder="e.g. Dubai, Business Bay or Showroom"
                      value={lstCity}
                      onChange={e => setLstCity(e.target.value)}
                      style={{ marginBottom: '0.5rem' }}
                    />
                  </div>
                </div>
                <small style={{ color: 'var(--ink-2)', fontSize: '0.75rem', display: 'block', marginTop: '2px' }}>
                  GPS button se automatic pin karein ya apna exact area/showroom type karein taake buyers seedha Google Maps par car tak aa sakein.
                </small>
              </div>

              {/* WhatsApp Contact Section */}
              <div style={{ marginBottom: '1.2rem', padding: '1rem', background: '#F0FDF4', borderRadius: '10px', border: '1.5px solid #86EFAC' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#14532D', marginBottom: '6px' }}>
                  <WhatsAppIcon size={18} color="#25D366" />
                  WhatsApp Contact Number
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '10px', marginBottom: '6px' }}>
                  <select
                    value={lstDialCode}
                    onChange={e => setLstDialCode(e.target.value)}
                    style={{ marginBottom: 0 }}
                  >
                    {COUNTRY_DIAL_CODES.map(c => (
                      <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    placeholder="e.g. 50 123 4567"
                    value={lstWhatsapp}
                    onChange={e => setLstWhatsapp(e.target.value)}
                    style={{ marginBottom: 0 }}
                  />
                </div>
                <small style={{ color: '#166534', fontSize: '0.76rem', display: 'block' }}>
                  A direct WhatsApp button will be placed on your car listing so clients can message you immediately.
                </small>
              </div>

              <label>Description & Features</label>
              <textarea
                placeholder="Full agency service history, single owner, GCC specs, original paint..."
                value={lstDescription}
                onChange={e => setLstDescription(e.target.value)}
              />

              {lstError && <p className="err">{lstError}</p>}

              <button
                className="btn-primary"
                onClick={() => {
                  if (!lstPrice) {
                    setLstError('Please specify the vehicle price');
                    return;
                  }
                  if (!lstCity.trim()) {
                    setLstError('Please specify the car city or area location');
                    return;
                  }
                  if (!lstWhatsapp.trim()) {
                    setLstError('Please enter your WhatsApp contact number');
                    return;
                  }
                  setLstError('');
                  setLstStep(4);
                }}
              >
                Review Listing &rarr;
              </button>
              <button className="btn-secondary" onClick={() => setLstStep(2)}>
                Back
              </button>
            </div>
          )}

          {/* Step 4: Review and Publish */}
          {lstStep === 4 && (
            <div>
              <h1 className="step-title">Review your listing</h1>
              <p className="step-desc">Make sure vehicle specifications are accurate before submitting.</p>

              <div className="review-list">
                <div className="review-row">
                  <span>Type</span>
                  <span>{lstType === 'sale' ? 'For sale' : 'For rent'}</span>
                </div>
                <div className="review-row">
                  <span>Condition</span>
                  <span>{lstCondition === 'new' ? 'Brand new' : 'Used'}</span>
                </div>
                <div className="review-row">
                  <span>Vehicle</span>
                  <span>{lstYear} {lstMake} {lstModel}</span>
                </div>
                <div className="review-row">
                  <span>Photos</span>
                  <span>{lstUploadedImages.length} photo{lstUploadedImages.length === 1 ? '' : 's'} uploaded</span>
                </div>
                <div className="review-row">
                  <span>Price</span>
                  <span>{lstCurrency} {Number(lstPrice).toLocaleString()} {lstType === 'rent' ? '/ day' : ''}</span>
                </div>
                <div className="review-row">
                  <span>Location</span>
                  <span>
                    {lstCity || 'Dubai'}, {lstCountry}
                    {lstCoordinates && (
                      <span style={{ display: 'block', fontSize: '0.74rem', color: '#16A34A', fontWeight: 700 }}>
                        🎯 Exact GPS Pin Saved
                      </span>
                    )}
                  </span>
                </div>
                <div className="review-row">
                  <span>WhatsApp Contact</span>
                  <span style={{ color: '#16A34A', fontWeight: 700 }}>
                    {lstDialCode} {lstWhatsapp}
                  </span>
                </div>
              </div>

              {lstError && <p className="err">{lstError}</p>}

              <button
                className="btn-primary"
                disabled={isSubmitting}
                onClick={handlePublishListing}
              >
                {isSubmitting ? 'Publishing…' : 'Publish Listing — Free'}
              </button>
              <button className="btn-secondary" onClick={() => setLstStep(3)}>
                Back to edit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
