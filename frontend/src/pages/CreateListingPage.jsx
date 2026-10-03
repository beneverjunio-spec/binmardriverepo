import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import {
  GCC_COUNTRIES,
  GCC_CURRENCIES,
  VEHICLE_MAKES,
  VEHICLE_CATEGORIES,
  FUEL_TYPES,
  TRANSMISSION_TYPES,
  CONTACT_METHODS,
  getCountryCurrency
} from '../constants';
import { uploadListingPhotos, createListing } from '../api/listings';

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

  const handlePublishListing = async () => {
    setIsSubmitting(true);
    setLstError('');
    try {
      const payload = {
        make: lstMake,
        model: lstModel,
        year: lstYear,
        category: lstCategory,
        fuel: lstFuel,
        mileage: lstMileage,
        transmission: lstTransmission,
        condition_type: lstCondition,
        listing_type: lstType,
        price: lstPrice,
        currency: lstCurrency,
        country: lstCountry,
        city: lstCity || 'Abu Dhabi',
        seller_name: currentUser ? currentUser.name : 'Individual',
        contact_preference: lstContact,
        description: lstDescription || 'Well-maintained vehicle, GCC specs.',
        images: lstUploadedImages
      };

      const data = await createListing(payload);
      if (data.success) {
        notify('Listing submitted! It is now pending admin moderation review.');
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

          {/* Step 3: Price & Location */}
          {lstStep === 3 && (
            <div>
              <h1 className="step-title">Set price and location</h1>
              <p className="step-desc">Buyers will see this on your listing card across the Middle East marketplace.</p>

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

              <div className="row-2">
                <div>
                  <label>Country</label>
                  <select
                    value={lstCountry}
                    onChange={e => {
                      const selected = e.target.value;
                      setLstCountry(selected);
                      setLstCurrency(getCountryCurrency(selected));
                    }}
                  >
                    {GCC_COUNTRIES.map(country => (
                      <option key={country}>{country}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>City</label>
                  <input
                    type="text"
                    placeholder="e.g. Abu Dhabi"
                    value={lstCity}
                    onChange={e => setLstCity(e.target.value)}
                  />
                </div>
              </div>

              <label>Description</label>
              <textarea
                placeholder="Full agency service history, single owner, GCC specs, original paint..."
                value={lstDescription}
                onChange={e => setLstDescription(e.target.value)}
              />

              <label>Preferred contact method</label>
              <select value={lstContact} onChange={e => setLstContact(e.target.value)}>
                {CONTACT_METHODS.map(method => (
                  <option key={method}>{method}</option>
                ))}
              </select>

              {lstError && <p className="err">{lstError}</p>}

              <button
                className="btn-primary"
                onClick={() => {
                  if (!lstPrice) {
                    setLstError('Please specify the price');
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
              <p className="step-desc">Make sure vehicle specifications are accurate before submitting to moderation.</p>

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
                  <span>{lstCity || 'Abu Dhabi'}, {lstCountry}</span>
                </div>
                <div className="review-row">
                  <span>Contact</span>
                  <span>{lstContact}</span>
                </div>
              </div>

              {lstError && <p className="err">{lstError}</p>}

              <button
                className="btn-primary"
                disabled={isSubmitting}
                onClick={handlePublishListing}
              >
                {isSubmitting ? 'Submitting…' : 'Publish Listing — Free'}
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
