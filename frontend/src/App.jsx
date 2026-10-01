import React, { useState, useEffect, useRef } from 'react';
import {
  Car, ShieldCheck, CheckCircle2, Clock, Upload, Bell, Search,
  Phone, MessageSquare, ChevronRight, ArrowLeft, X, Eye, Trash2, Building2, User
} from 'lucide-react';

const gradients = [
  'linear-gradient(135deg,#0F3527,#1D4F3A)',
  'linear-gradient(135deg,#12281F,#2B4A3A)',
  'linear-gradient(135deg,#0A2A1F,#2F5443)',
  'linear-gradient(135deg,#173B2C,#3A6350)',
  'linear-gradient(135deg,#0D2E22,#254639)'
];

export default function App() {
  // Navigation & Page State
  const [currentPage, setCurrentPage] = useState('marketplace');
  const [toast, setToast] = useState({ show: false, message: '' });

  // User & Auth State
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('binmar_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Marketplace & Filter State
  const [listings, setListings] = useState([]);
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedListing, setSelectedListing] = useState(null);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  // Admin State
  const [adminTab, setAdminTab] = useState('dashboard');
  const [adminStats, setAdminStats] = useState({ liveListings: 12, pendingModeration: 2, verifiedDealers: 614, pendingDealers: 2 });
  const [moderationQueue, setModerationQueue] = useState([]);
  const [dealerQueue, setDealerQueue] = useState([]);
  const [adminListings, setAdminListings] = useState([]);
  const [adminSearch, setAdminSearch] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // Registration Flow State
  const [regStep, setRegStep] = useState(1);
  const [regAccountType, setRegAccountType] = useState('individual');
  const [regPhone, setRegPhone] = useState('');
  const [regName, setRegName] = useState('');
  const [regCompanyName, setRegCompanyName] = useState('');
  const [regLicense, setRegLicense] = useState('');
  const [regCountry, setRegCountry] = useState('United Arab Emirates');
  const [regError, setRegError] = useState('');

  // User Sign-in State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  // Admin Sign-in State
  const [adminEmail, setAdminEmail] = useState('admin@binmardrive.com');
  const [adminPass, setAdminPass] = useState('admin123');
  const [adminLoginError, setAdminLoginError] = useState('');

  // Create Listing Flow State
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
  const [tradeLicenseFile, setTradeLicenseFile] = useState(null);
  const fileInputRef = useRef(null);
  const licenseInputRef = useRef(null);
  const [lstPrice, setLstPrice] = useState('');
  const [lstCurrency, setLstCurrency] = useState('AED');
  const [lstCountry, setLstCountry] = useState('United Arab Emirates');
  const [lstCity, setLstCity] = useState('');
  const [lstDescription, setLstDescription] = useState('');
  const [lstContact, setLstContact] = useState('WhatsApp');
  const [lstError, setLstError] = useState('');

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  // Handle vehicle photo upload
  const handlePhotoSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    try {
      // Convert to Base64 data URLs so they work everywhere permanently
      const base64List = await Promise.all(files.map(fileToBase64));

      // Attempt to save to backend server
      const formData = new FormData();
      files.forEach(f => formData.append('photos', f));
      try {
        const res = await fetch('/api/listings/upload', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data.success && data.images && data.images.length > 0) {
          setLstUploadedImages(prev => [...prev, ...data.images]);
          notify(`${files.length} photo${files.length > 1 ? 's' : ''} uploaded successfully!`);
        } else {
          setLstUploadedImages(prev => [...prev, ...base64List]);
          notify(`${files.length} photo${files.length > 1 ? 's' : ''} added!`);
        }
      } catch (uploadErr) {
        setLstUploadedImages(prev => [...prev, ...base64List]);
        notify(`${files.length} photo${files.length > 1 ? 's' : ''} added!`);
      }
    } catch (err) {
      notify('Error processing photos');
    }
    if (e.target) e.target.value = '';
  };

  const removePhoto = (indexToRemove) => {
    setLstUploadedImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleLicenseSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setTradeLicenseFile(file.name);
      notify(`Trade license file attached: ${file.name}`);
    }
  };

  // Helper for Toasts
  const notify = (msg) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: '' }), 3500);
  };

  // Fetch initial data from Backend API
  const fetchListings = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (selectedMake) queryParams.append('make', selectedMake);
      if (selectedCountry) queryParams.append('country', selectedCountry);
      if (selectedType) queryParams.append('type', selectedType);
      if (selectedCategory) queryParams.append('category', selectedCategory);
      if (maxPrice) queryParams.append('maxPrice', maxPrice);
      if (sortBy) queryParams.append('sort', sortBy);

      const res = await fetch(`/api/listings?${queryParams.toString()}`);
      const data = await res.json();
      if (data.success) {
        setListings(data.listings);
      }
    } catch (e) {
      console.warn('API error, using cached data');
    }
  };

  const fetchAdminData = async () => {
    try {
      const [statsRes, modRes, dealerRes, listRes, notifRes] = await Promise.all([
        fetch('/api/admin/stats').then(r => r.json()),
        fetch('/api/admin/moderation').then(r => r.json()),
        fetch('/api/admin/dealers').then(r => r.json()),
        fetch('/api/admin/listings').then(r => r.json()),
        fetch('/api/notifications').then(r => r.json())
      ]);

      if (statsRes.success) setAdminStats(statsRes.stats);
      if (modRes.success) setModerationQueue(modRes.queue);
      if (dealerRes.success) setDealerQueue(dealerRes.dealers);
      if (listRes.success) setAdminListings(listRes.listings);
      if (notifRes.success) setNotifications(notifRes.notifications);
    } catch (e) {
      console.warn('Admin API sync error');
    }
  };

  useEffect(() => {
    fetchListings();
  }, [selectedMake, selectedCountry, selectedType, selectedCategory, maxPrice, sortBy]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentPage]);

  useEffect(() => {
    if (currentPage === 'admin') {
      fetchAdminData();
    }
  }, [currentPage]);

  // Auth Handlers
  const handleUserRegister = async () => {
    setRegError('');
    if (regAccountType === 'individual' && !regName) {
      setRegError('Please enter your full name');
      return;
    }
    if (regAccountType === 'company' && !regCompanyName) {
      setRegError('Please enter your company name');
      return;
    }

    try {
      const payload = {
        user_type: regAccountType,
        name: regAccountType === 'individual' ? regName : regCompanyName,
        phone: regPhone,
        company_name: regAccountType === 'company' ? regCompanyName : null,
        trade_license: regAccountType === 'company' ? (regLicense || 'CN-2026-UPLOADED') : null,
        country: regCountry
      };

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setCurrentUser(data.user);
        localStorage.setItem('binmar_user', JSON.stringify(data.user));
        notify(data.message);

        // Reset registration state
        setRegStep(1);
        setRegName('');
        setRegCompanyName('');
        setRegPhone('');

        window.scrollTo({ top: 0, behavior: 'instant' });
        setCurrentPage('marketplace');
        fetchAdminData();
      } else {
        setRegError(data.error || 'Registration failed');
      }
    } catch (err) {
      setRegError('Connection error. Please try again.');
    }
  };

  const handleUserLogin = async () => {
    setLoginError('');
    if (!loginEmail) {
      setLoginError('Enter email or mobile number');
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: loginEmail, password: loginPass })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        localStorage.setItem('binmar_user', JSON.stringify(data.user));
        notify(`Welcome back, ${data.user.name}!`);
        setCurrentPage('create-listing');
      } else {
        setLoginError(data.error || 'Login failed');
      }
    } catch (err) {
      setLoginError('Login error. Please try again.');
    }
  };

  const handleAdminLogin = async () => {
    setAdminLoginError('');
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPass })
      });
      const data = await res.json();
      if (data.success) {
        notify('Logged into Admin Portal');
        setCurrentPage('admin');
        fetchAdminData();
      } else {
        setAdminLoginError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setAdminLoginError('Connection error');
    }
  };

  const handlePostListingClick = () => {
    // Flow from Blueprint Slide 2 & 3:
    // If user has account and verified -> go to create listing
    // If company not verified yet -> alert
    // If not logged in -> go to sign in or register
    if (!currentUser) {
      setCurrentPage('user-login');
      return;
    }
    if (currentUser.user_type === 'company' && currentUser.status === 'pending') {
      alert('Your company trade license is currently in the admin verification queue. Once verified by our team, you will receive full access to publish listings!');
      return;
    }
    setCurrentPage('create-listing');
  };

  // Create Listing Submit Handler
  const handlePublishListing = async () => {
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

      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        notify('Listing submitted! It is now pending admin moderation review.');
        // Reset listing form
        setLstStep(1);
        setLstModel('');
        setLstPrice('');
        setLstMileage('');
        setLstDescription('');
        setLstUploadedImages([]);
        setCurrentPage('marketplace');
        fetchAdminData();
      } else {
        alert(data.error || 'Failed to submit listing');
      }
    } catch (e) {
      notify('Submitted to moderation queue!');
      setCurrentPage('marketplace');
    }
  };

  // Admin Actions
  const resolveModeration = async (id, approve) => {
    try {
      const res = await fetch(`/api/admin/moderation/${id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: approve ? 'approve' : 'reject' })
      });
      const data = await res.json();
      notify(data.message);
      fetchAdminData();
      fetchListings();
    } catch (err) {
      notify('Moderation action completed');
    }
  };

  const resolveDealer = async (id, verify) => {
    try {
      const res = await fetch(`/api/admin/dealers/${id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: verify ? 'verify' : 'reject' })
      });
      const data = await res.json();
      notify(data.message);
      fetchAdminData();
    } catch (err) {
      notify('Dealer action completed');
    }
  };

  const removeListing = async (id) => {
    if (!window.confirm('Are you sure you want to remove this listing from the live marketplace?')) return;
    try {
      await fetch(`/api/admin/listings/${id}`, { method: 'DELETE' });
      notify('Listing removed from marketplace');
      fetchAdminData();
      fetchListings();
    } catch (e) {
      notify('Listing removed');
    }
  };

  return (
    <div>
      {/* Toast Notification */}
      <div className={`toast ${toast.show ? 'show' : ''}`}>
        {toast.message}
      </div>

      {/* Top Navigation */}
      <div className="topnav">
        <div className="nav-mark" onClick={() => setCurrentPage('marketplace')}>
          BINMAR<b>DRIVE</b>
        </div>
        <div className="nav-links">
          <a className={selectedType === 'sale' && currentPage === 'marketplace' ? 'active' : ''} onClick={() => { setCurrentPage('marketplace'); setSelectedType('sale'); }}>Buy</a>
          <a className={selectedType === 'rent' && currentPage === 'marketplace' ? 'active' : ''} onClick={() => { setCurrentPage('marketplace'); setSelectedType('rent'); }}>Rent</a>
          <a className={currentPage === 'about' ? 'active' : ''} onClick={() => setCurrentPage('about')}>About</a>
          <a className={currentPage === 'how-it-works' ? 'active' : ''} onClick={() => setCurrentPage('how-it-works')}>How it works</a>
          <a className={currentPage === 'contact' ? 'active' : ''} onClick={() => setCurrentPage('contact')}>Contact</a>
        </div>
        <div className="nav-actions">
          {currentUser ? (
            <div className="user-chip">
              {currentUser.user_type === 'company' ? <Building2 size={13} style={{ display: 'inline', marginRight: 4 }} /> : <User size={13} style={{ display: 'inline', marginRight: 4 }} />}
              {currentUser.name}
            </div>
          ) : (
            <button className="btn-outline-gold" onClick={() => setCurrentPage('user-login')}>
              Sign in
            </button>
          )}

          <button className="btn-gold" onClick={handlePostListingClick}>
            <Car size={16} />
            Post a listing &mdash; free
          </button>
        </div>
      </div>

      {/* ================= PAGE: MARKETPLACE ================= */}
      {currentPage === 'marketplace' && (
        <div>
          {/* Hero */}
          <div className="hero">
            <span className="hero-badge">Free to register anywhere</span>
            <h1>Buy, sell or rent a car, <em>free</em> across the Middle East.</h1>
            <p>No listing fees for owners, dealers or first-time sellers. Thousands of new and used vehicles, updated daily.</p>

            {/* Filter Searchbar */}
            <div className="searchbar">
              <div>
                <label>Make</label>
                <select value={selectedMake} onChange={e => setSelectedMake(e.target.value)}>
                  <option value="">Any make</option>
                  <option>Toyota</option><option>Nissan</option><option>Mercedes-Benz</option>
                  <option>Ford</option><option>Lexus</option><option>BMW</option>
                  <option>Chevrolet</option><option>Land Rover</option><option>Porsche</option>
                </select>
              </div>
              <div>
                <label>Country</label>
                <select value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)}>
                  <option value="">Any country</option>
                  <option>United Arab Emirates</option><option>Saudi Arabia</option>
                  <option>Qatar</option><option>Kuwait</option><option>Bahrain</option><option>Oman</option>
                </select>
              </div>
              <div>
                <label>Type</label>
                <select value={selectedType} onChange={e => setSelectedType(e.target.value)}>
                  <option value="">Buy or rent</option>
                  <option value="sale">For sale</option>
                  <option value="rent">For rent</option>
                </select>
              </div>
              <div>
                <label>Max price</label>
                <input
                  type="number"
                  placeholder="Any price"
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                />
              </div>
              <button className="search-go" onClick={() => {
                document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                Search
              </button>
            </div>
          </div>

          {/* Trust Banner */}
          <div className="trust">
            <div className="trust-item">
              <div className="trust-value">{listings.length || 12}</div>
              <div className="trust-label">Active listings</div>
            </div>
            <div className="trust-item">
              <div className="trust-value">614</div>
              <div className="trust-label">Verified dealers</div>
            </div>
            <div className="trust-item">
              <div className="trust-value">6</div>
              <div className="trust-label">Countries</div>
            </div>
            <div className="trust-item">
              <div className="trust-value">0 AED</div>
              <div className="trust-label">Listing fees</div>
            </div>
          </div>

          {/* Category Strip */}
          <div className="cat-strip">
            {['', 'SUV', 'Sedan', 'Pickup', 'Luxury'].map(cat => (
              <div
                key={cat}
                className={`cat-chip ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === '' ? 'All Vehicles' : (cat === 'Luxury' ? 'Luxury / Sports' : `${cat}s`)}
              </div>
            ))}
          </div>

          {/* Browse Section */}
          <div className="browse" id="browse">
            <div className="browse-head">
              <div>
                <h2>Browse listings</h2>
                <p>Showing {listings.length} live verified listing{listings.length === 1 ? '' : 's'}</p>
              </div>
              <div className="browse-controls">
                <div className="tab-pair">
                  <div className={`tab-opt ${selectedType === '' ? 'on' : ''}`} onClick={() => setSelectedType('')}>All</div>
                  <div className={`tab-opt ${selectedType === 'sale' ? 'on' : ''}`} onClick={() => setSelectedType('sale')}>For sale</div>
                  <div className={`tab-opt ${selectedType === 'rent' ? 'on' : ''}`} onClick={() => setSelectedType('rent')}>For rent</div>
                </div>
                <select className="sort" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  <option value="newest">Newest first</option>
                  <option value="low">Price: low to high</option>
                  <option value="high">Price: high to low</option>
                </select>
              </div>
            </div>

            {/* Grid */}
            <div className="grid">
              {listings.length > 0 ? (
                listings.map((l, i) => {
                  const rawList = typeof l.images === 'string' ? JSON.parse(l.images || '[]') : (l.images || []);
                  const cardImages = (rawList || []).filter(url => typeof url === 'string' && !url.startsWith('blob:'));
                  const hasRealImage = cardImages && cardImages.length > 0;
                  return (
                    <div key={l.id} className="card" onClick={() => { setSelectedListing(l); setModalImageIndex(0); }}>
                      <div
                        className="card-img"
                        style={{
                          background: hasRealImage ? `url(${cardImages[0]}) center/cover no-repeat` : gradients[i % gradients.length],
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        <span className={`card-tag ${l.listing_type || l.type}`}>
                          {(l.listing_type || l.type) === 'sale' ? 'For sale' : 'For rent'}
                        </span>
                        {!hasRealImage && `${l.make} ${l.category}`}
                      </div>
                    <div className="card-body">
                      <div className="card-title">{l.title}</div>
                      <div className="card-loc">{l.city}, {l.country}</div>
                      <div className="card-price">{l.price_label || `${l.currency} ${Number(l.price).toLocaleString()}`}</div>
                      <div className="card-meta">
                        <span className={`card-cond ${l.condition_type || l.condition}`}>
                          {(l.condition_type || l.condition) === 'new' ? 'Brand new' : 'Used'}
                        </span>
                        <span className="card-seller">{l.seller_name || l.seller}</span>
                      </div>
                    </div>
                  </div>
                );
              })
              ) : (
                <div className="empty">No vehicles found matching your current filters. Try resetting search criteria.</div>
              )}
            </div>
          </div>

          {/* CTA Banner */}
          <div className="cta" style={{ background: 'linear-gradient(160deg, var(--deep) 0%, var(--deep-2) 100%)', padding: '3rem 2rem', textAlign: 'center', color: '#F5EFE0' }}>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.8rem', marginBottom: '8px' }}>
              Have a car to sell? <em style={{ color: 'var(--gold-bright)' }}>List it free</em>, today.
            </h2>
            <p style={{ color: 'var(--sage)', marginBottom: '1.5rem', fontSize: '0.92rem' }}>
              No commission, no listing fees &mdash; for individual owners, dealers and companies.
            </p>
            <button className="btn-gold" onClick={handlePostListingClick}>
              Post a listing
            </button>
          </div>

          {/* Footer */}
          <div className="footer">
            <div className="footer-grid">
              <div>
                <div className="footer-mark">BINMAR<b>DRIVE</b></div>
                <div>Buy, sell and rent cars across the Middle East.</div>
              </div>
              <div className="footer-cols">
                <div className="footer-col">
                  <h4>Marketplace</h4>
                  <a onClick={() => { setSelectedType('sale'); document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth' }); }}>Buy a car</a>
                  <a onClick={() => { setSelectedType('rent'); document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth' }); }}>Rent a car</a>
                  <a onClick={handlePostListingClick}>Sell your car</a>
                  <a onClick={() => { setRegAccountType('company'); setCurrentPage('registration'); }}>Dealer signup</a>
                </div>
                <div className="footer-col">
                  <h4>Company</h4>
                  <a onClick={() => setCurrentPage('about')}>About Binmar Drive</a>
                  <a onClick={() => setCurrentPage('how-it-works')}>How it works</a>
                  <a onClick={() => setCurrentPage('contact')}>Contact</a>
                  <a onClick={() => setCurrentPage('user-login')}>Sign in</a>
                  <a onClick={() => setCurrentPage('admin-login')}>Admin Portal</a>
                </div>
                <div className="footer-col">
                  <h4>Countries</h4>
                  <a>United Arab Emirates</a>
                  <a>Saudi Arabia</a>
                  <a>Qatar</a>
                  <a>Kuwait</a>
                  <a>Bahrain</a>
                  <a>Oman</a>
                </div>
              </div>
            </div>
            <div className="footer-bottom">
              <span>&copy; 2026 Binmar Drive. Free to register anywhere.</span>
              <span style={{ cursor: 'pointer', color: 'var(--gold-bright)' }} onClick={() => setCurrentPage('admin-login')}>Staff Portal &rarr;</span>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: VEHICLE DETAILS ================= */}
      {selectedListing && (() => {
        const rawList = typeof selectedListing.images === 'string'
          ? JSON.parse(selectedListing.images || '[]')
          : (selectedListing.images || []);
        const modalImages = (rawList || []).filter(url => typeof url === 'string' && !url.startsWith('blob:'));
        const hasRealImages = modalImages && modalImages.length > 0;

        return (
          <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setSelectedListing(null); }}>
            <div className="modal">
              <button className="modal-close" onClick={() => setSelectedListing(null)}>
                <X size={18} />
              </button>
              <div
                className="modal-hero"
                style={{
                  background: hasRealImages
                    ? `url(${modalImages[modalImageIndex % modalImages.length]}) center/cover no-repeat`
                    : gradients[(selectedListing.id + modalImageIndex) % gradients.length],
                  position: 'relative'
                }}
              >
                <span className={`card-tag ${selectedListing.listing_type || selectedListing.type}`} style={{ position: 'absolute', top: 14, left: 14 }}>
                  {(selectedListing.listing_type || selectedListing.type) === 'sale' ? 'For sale' : 'For rent'}
                </span>
                {!hasRealImages && `${selectedListing.make} ${selectedListing.category} — View ${modalImageIndex + 1} of 4`}
              </div>
              <div className="modal-thumbs">
                {hasRealImages ? (
                  modalImages.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className={`modal-thumb ${modalImageIndex === idx ? 'active' : ''}`}
                      style={{
                        background: `url(${imgUrl}) center/cover no-repeat`
                      }}
                      onClick={() => setModalImageIndex(idx)}
                    />
                  ))
                ) : (
                  [0, 1, 2, 3].map((idx) => (
                    <div
                      key={idx}
                      className={`modal-thumb ${modalImageIndex === idx ? 'active' : ''}`}
                      style={{ background: gradients[(selectedListing.id + idx) % gradients.length] }}
                      onClick={() => setModalImageIndex(idx)}
                    />
                  ))
                )}
              </div>
            <div className="modal-body">
              <div className="modal-title">{selectedListing.title}</div>
              <div className="modal-loc">{selectedListing.city}, {selectedListing.country}</div>
              <div className="modal-price">{selectedListing.price_label || `${selectedListing.currency} ${Number(selectedListing.price).toLocaleString()}`}</div>

              <div className="modal-specs">
                <div className="spec-item"><div className="spec-label">Year</div><div className="spec-value">{selectedListing.year}</div></div>
                <div className="spec-item"><div className="spec-label">Mileage</div><div className="spec-value">{selectedListing.mileage}</div></div>
                <div className="spec-item"><div className="spec-label">Transmission</div><div className="spec-value">{selectedListing.transmission || 'Automatic'}</div></div>
                <div className="spec-item"><div className="spec-label">Fuel type</div><div className="spec-value">{selectedListing.fuel || 'Petrol'}</div></div>
                <div className="spec-item"><div className="spec-label">Condition</div><div className="spec-value">{(selectedListing.condition_type || selectedListing.condition) === 'new' ? 'Brand new' : 'Used'}</div></div>
                <div className="spec-item"><div className="spec-label">Category</div><div className="spec-value">{selectedListing.category}</div></div>
              </div>

              <div className="modal-desc">{selectedListing.description}</div>

              <div className="modal-seller">
                <div>
                  <div className="modal-seller-name">{selectedListing.seller_name || selectedListing.seller}</div>
                  <div className="modal-seller-sub">Contact via {selectedListing.contact_preference || 'WhatsApp'}</div>
                </div>
                <button
                  className="btn-gold"
                  onClick={() => alert(`Connecting with seller (${selectedListing.seller_name || selectedListing.seller}) via ${selectedListing.contact_preference || 'WhatsApp'}`)}
                >
                  <MessageSquare size={16} />
                  Contact seller
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    })()}

      {/* ================= PAGE: REGISTRATION ================= */}
      {currentPage === 'registration' && (
        <div className="flow-wrap">
          <div className="flow-brand">
            <div className="nav-mark" onClick={() => setCurrentPage('marketplace')}>BINMAR<b>DRIVE</b></div>
            <div>
              <div className="flow-hero">List your car, <em>free to register</em> anywhere.</div>
              <p className="flow-sub">No listing fees for owners, dealers, or first-time sellers. For buyers and sellers across the Middle East.</p>
              <div className="odo-line">
                <div className="odo-dot" />
                <div className="odo-text">Free to register &mdash; no commission on sale</div>
              </div>
            </div>
            <div className="flow-fine">&copy; 2026 Binmar Drive. Built for owners, dealers and buyers across the Middle East.</div>
          </div>

          <div className="flow-formside">
            <div className="flow-card">
              {/* Progress Nodes */}
              <div className="steps">
                <div className={`step-node ${regStep >= 1 ? 'active' : ''} ${regStep > 1 ? 'done' : ''}`}>1</div>
                <div className="step-track"><div className="step-track-fill" style={{ width: regStep >= 2 ? '100%' : '0%' }} /></div>
                <div className={`step-node ${regStep >= 2 ? 'active' : ''} ${regStep > 2 ? 'done' : ''}`}>2</div>
                <div className="step-track"><div className="step-track-fill" style={{ width: regStep >= 3 ? '100%' : '0%' }} /></div>
                <div className={`step-node ${regStep >= 3 ? 'active' : ''}`}>3</div>
              </div>

              {/* Step 1: Who is registering */}
              {regStep === 1 && (
                <div>
                  <span className="free-badge">Free to register anywhere</span>
                  <h1 className="step-title">Who's registering?</h1>
                  <p className="step-desc">Open to individual vehicle owners, dealers, and corporate rental companies across the Middle East.</p>

                  <div className="type-grid">
                    <div
                      className={`type-card ${regAccountType === 'individual' ? 'selected' : ''}`}
                      onClick={() => setRegAccountType('individual')}
                    >
                      <User size={28} className="type-icon" />
                      <span>Individual owner</span>
                    </div>
                    <div
                      className={`type-card ${regAccountType === 'company' ? 'selected' : ''}`}
                      onClick={() => setRegAccountType('company')}
                    >
                      <Building2 size={28} className="type-icon" />
                      <span>Company / dealer</span>
                    </div>
                  </div>

                  <button className="btn-primary" onClick={() => setRegStep(2)}>
                    Continue &rarr;
                  </button>
                  <button className="btn-secondary" onClick={() => setCurrentPage('user-login')}>
                    Already have an account? Sign in
                  </button>
                </div>
              )}

              {/* Step 2: Phone Verification */}
              {regStep === 2 && (
                <div>
                  <h1 className="step-title">Verify your phone</h1>
                  <p className="step-desc">We will send a verification code to confirm your phone number.</p>

                  <label>Mobile number</label>
                  <div className="row-2">
                    <select value="+971" onChange={() => {}}>
                      <option>+971 (UAE)</option>
                      <option>+966 (KSA)</option>
                      <option>+974 (Qatar)</option>
                      <option>+965 (Kuwait)</option>
                    </select>
                    <input
                      type="tel"
                      placeholder="50 123 4567"
                      value={regPhone}
                      onChange={e => setRegPhone(e.target.value)}
                    />
                  </div>

                  {regError && <p className="err">{regError}</p>}

                  <button className="btn-primary" onClick={() => {
                    if (!regPhone) { setRegError('Please enter a valid phone number'); return; }
                    setRegError('');
                    setRegStep(3);
                  }}>
                    Send code &rarr;
                  </button>
                  <button className="btn-secondary" onClick={() => setRegStep(1)}>
                    Back
                  </button>
                </div>
              )}

              {/* Step 3: Account Details */}
              {regStep === 3 && (
                <div>
                  <h1 className="step-title">
                    {regAccountType === 'individual' ? 'Tell us about you' : 'Dealer & company details'}
                  </h1>
                  <p className="step-desc">Last step &mdash; this takes less than a minute.</p>

                  {regAccountType === 'individual' ? (
                    <div>
                      <label>Full name</label>
                      <input
                        type="text"
                        placeholder="e.g. Ahmed Al Mansoori"
                        value={regName}
                        onChange={e => setRegName(e.target.value)}
                      />
                      <label>Country</label>
                      <select value={regCountry} onChange={e => setRegCountry(e.target.value)}>
                        <option>United Arab Emirates</option>
                        <option>Saudi Arabia</option>
                        <option>Qatar</option>
                        <option>Kuwait</option>
                        <option>Bahrain</option>
                        <option>Oman</option>
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label>Company / Dealership name</label>
                      <input
                        type="text"
                        placeholder="e.g. Al Futtaim Motors"
                        value={regCompanyName}
                        onChange={e => setRegCompanyName(e.target.value)}
                      />
                      <label>Trade license number</label>
                      <input
                        type="text"
                        placeholder="e.g. CN-1234567"
                        value={regLicense}
                        onChange={e => setRegLicense(e.target.value)}
                      />
                      <label>Country of registration</label>
                      <select value={regCountry} onChange={e => setRegCountry(e.target.value)}>
                        <option>United Arab Emirates</option>
                        <option>Saudi Arabia</option>
                        <option>Qatar</option>
                        <option>Kuwait</option>
                        <option>Bahrain</option>
                        <option>Oman</option>
                      </select>

                      <input
                        type="file"
                        ref={licenseInputRef}
                        accept=".pdf,image/*"
                        style={{ display: 'none' }}
                        onChange={handleLicenseSelect}
                      />
                      <div className="dropzone" onClick={() => licenseInputRef.current?.click()}>
                        <Upload size={22} style={{ margin: '0 auto 6px', display: 'block', color: 'var(--sage-dim)' }} />
                        <p>{tradeLicenseFile ? `Attached: ${tradeLicenseFile}` : 'Click to upload Commercial Trade License (PDF / JPG)'}</p>
                        <p className="small">{tradeLicenseFile ? 'Document ready for verification' : 'Required for dealer verification'}</p>
                      </div>
                    </div>
                  )}

                  {regError && <p className="err">{regError}</p>}

                  <button className="btn-primary" onClick={handleUserRegister}>
                    {regAccountType === 'company' ? 'Submit for Dealer Verification' : 'Create account & continue'}
                  </button>
                  <button className="btn-secondary" onClick={() => setRegStep(2)}>
                    Back
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= PAGE: USER LOGIN ================= */}
      {currentPage === 'user-login' && (
        <div className="flow-wrap">
          <div className="flow-brand">
            <div className="nav-mark" onClick={() => setCurrentPage('marketplace')}>BINMAR<b>DRIVE</b></div>
            <div>
              <div className="flow-hero">Welcome back to <em>Binmar Drive</em>.</div>
              <p className="flow-sub">Sign in to post a listing, manage your vehicles, or connect with interested buyers.</p>
              <div className="odo-line">
                <div className="odo-dot" />
                <div className="odo-text">Free to register &mdash; no commission on sale</div>
              </div>
            </div>
            <div className="flow-fine">&copy; 2026 Binmar Drive. Built for owners, dealers and buyers across the Middle East.</div>
          </div>

          <div className="flow-formside">
            <div className="flow-card">
              <h1 className="step-title">Sign in</h1>
              <p className="step-desc">Enter your email or phone number to manage or publish your vehicle listings.</p>

              <label>Email or mobile number</label>
              <input
                type="text"
                placeholder="you@email.com or +97150..."
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
              />

              <label>Password</label>
              <input
                type="password"
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                value={loginPass}
                onChange={e => setLoginPass(e.target.value)}
              />

              {loginError && <p className="err">{loginError}</p>}

              <button className="btn-primary" onClick={handleUserLogin}>
                Sign in
              </button>
              <button className="btn-secondary" onClick={() => setCurrentPage('registration')}>
                New to BinmarDrive? Create an account (Free)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= PAGE: CREATE LISTING ================= */}
      {currentPage === 'create-listing' && (
        <div className="flow-wrap">
          <div className="flow-brand">
            <div className="nav-mark" onClick={() => setCurrentPage('marketplace')}>BINMAR<b>DRIVE</b></div>
            <div>
              <div className="flow-hero">Put your car in front of <em>real buyers</em>.</div>
              <p className="flow-sub">List a new or used vehicle for sale or rent. Free to post, for individual owners, dealers and companies across the Middle East.</p>
              <div className="odo-line">
                <div className="odo-dot" />
                <div className="odo-text">Zero commission &mdash; direct buyer contact</div>
              </div>
            </div>
            <div className="flow-fine">&copy; 2026 Binmar Drive. All rights reserved.</div>
          </div>

          <div className="flow-formside">
            <div className="flow-card">
              {/* 4 Step Progress Nodes */}
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
                    <div className={`toggle-opt ${lstType === 'sale' ? 'on' : ''}`} onClick={() => setLstType('sale')}>For sale</div>
                    <div className={`toggle-opt ${lstType === 'rent' ? 'on' : ''}`} onClick={() => setLstType('rent')}>For rent</div>
                  </div>

                  <div className="condition-pair">
                    <div className={`cond-card ${lstCondition === 'new' ? 'selected' : ''}`} onClick={() => setLstCondition('new')}>Brand new</div>
                    <div className={`cond-card ${lstCondition === 'used' ? 'selected' : ''}`} onClick={() => setLstCondition('used')}>Used</div>
                  </div>

                  <label>Make</label>
                  <select value={lstMake} onChange={e => setLstMake(e.target.value)}>
                    <option>Toyota</option><option>Nissan</option><option>Mercedes-Benz</option>
                    <option>Ford</option><option>Lexus</option><option>BMW</option>
                    <option>Chevrolet</option><option>Land Rover</option><option>Porsche</option>
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
                        <option>2026</option><option>2025</option><option>2024</option>
                        <option>2023</option><option>2022</option><option>2021</option><option>2020</option>
                      </select>
                    </div>
                  </div>

                  <div className="row-2">
                    <div>
                      <label>Category</label>
                      <select value={lstCategory} onChange={e => setLstCategory(e.target.value)}>
                        <option>SUV</option><option>Sedan</option><option>Pickup</option><option>Luxury</option>
                      </select>
                    </div>
                    <div>
                      <label>Fuel type</label>
                      <select value={lstFuel} onChange={e => setLstFuel(e.target.value)}>
                        <option>Petrol</option><option>Diesel</option><option>Electric</option><option>Hybrid</option>
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
                        <option>Automatic</option><option>Manual</option>
                      </select>
                    </div>
                  </div>

                  {lstError && <p className="err">{lstError}</p>}

                  <button className="btn-primary" onClick={() => {
                    if (!lstModel) { setLstError('Please enter the vehicle model name'); return; }
                    setLstError('');
                    setLstStep(2);
                  }}>
                    Continue to Photos &rarr;
                  </button>
                  <button className="btn-secondary" onClick={() => setCurrentPage('marketplace')}>
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
                            <span style={{ position: 'absolute', bottom: 4, left: 4, background: 'var(--gold)', color: 'var(--ink)', fontSize: '0.62rem', fontWeight: 700, padding: '2px 7px', borderRadius: 999 }}>
                              Cover
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removePhoto(i); }}
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
                        <option>AED</option><option>SAR</option><option>QAR</option>
                        <option>KWD</option><option>BHD</option><option>OMR</option>
                      </select>
                    </div>
                  </div>

                  <div className="row-2">
                    <div>
                      <label>Country</label>
                      <select value={lstCountry} onChange={e => setLstCountry(e.target.value)}>
                        <option>United Arab Emirates</option><option>Saudi Arabia</option>
                        <option>Qatar</option><option>Kuwait</option><option>Bahrain</option><option>Oman</option>
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
                    <option>WhatsApp</option><option>Phone call</option><option>In-app message</option>
                  </select>

                  {lstError && <p className="err">{lstError}</p>}

                  <button className="btn-primary" onClick={() => {
                    if (!lstPrice) { setLstError('Please specify the price'); return; }
                    setLstError('');
                    setLstStep(4);
                  }}>
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
                    <div className="review-row"><span>Type</span><span>{lstType === 'sale' ? 'For sale' : 'For rent'}</span></div>
                    <div className="review-row"><span>Condition</span><span>{lstCondition === 'new' ? 'Brand new' : 'Used'}</span></div>
                    <div className="review-row"><span>Vehicle</span><span>{lstYear} {lstMake} {lstModel}</span></div>
                    <div className="review-row"><span>Photos</span><span>{lstUploadedImages.length} photo{lstUploadedImages.length === 1 ? '' : 's'} uploaded</span></div>
                    <div className="review-row"><span>Price</span><span>{lstCurrency} {Number(lstPrice).toLocaleString()} {lstType === 'rent' ? '/ day' : ''}</span></div>
                    <div className="review-row"><span>Location</span><span>{lstCity || 'Abu Dhabi'}, {lstCountry}</span></div>
                    <div className="review-row"><span>Contact</span><span>{lstContact}</span></div>
                  </div>

                  <button className="btn-primary" onClick={handlePublishListing}>
                    Publish Listing &mdash; Free
                  </button>
                  <button className="btn-secondary" onClick={() => setLstStep(3)}>
                    Back to edit
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= PAGE: ADMIN LOGIN ================= */}
      {currentPage === 'admin-login' && (
        <div className="flow-wrap">
          <div className="flow-brand">
            <div className="nav-mark" onClick={() => setCurrentPage('marketplace')}>BINMAR<b>DRIVE</b></div>
            <div>
              <div className="flow-hero">Admin <em>portal</em> access.</div>
              <p className="flow-sub">Sign in to review listings, verify dealers, and manage marketplace inventory.</p>
              <div className="odo-line">
                <div className="odo-dot" />
                <div className="odo-text">Restricted to authorized Binmar Drive staff</div>
              </div>
            </div>
            <div className="flow-fine">&copy; 2026 Binmar Drive. Internal Operations.</div>
          </div>

          <div className="flow-formside">
            <div className="flow-card">
              <h1 className="step-title">Admin log in</h1>
              <p className="step-desc">Enter staff credentials to access moderation and verification queues.</p>

              <label>Admin email</label>
              <input
                type="text"
                value={adminEmail}
                onChange={e => setAdminEmail(e.target.value)}
              />

              <label>Password</label>
              <input
                type="password"
                value={adminPass}
                onChange={e => setAdminPass(e.target.value)}
              />

              {adminLoginError && <p className="err">{adminLoginError}</p>}

              <button className="btn-primary" onClick={handleAdminLogin}>
                Log in to Admin Portal
              </button>
              <button className="btn-secondary" onClick={() => setCurrentPage('marketplace')}>
                Back to Marketplace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= PAGE: ADMIN PORTAL ================= */}
      {currentPage === 'admin' && (
        <div className="admin-shell">
          {/* Admin Sidebar */}
          <div className="admin-side">
            <div
              className={`admin-nav-item ${adminTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setAdminTab('dashboard')}
            >
              <Car size={18} />
              <span>Dashboard</span>
            </div>
            <div
              className={`admin-nav-item ${adminTab === 'moderation' ? 'active' : ''}`}
              onClick={() => setAdminTab('moderation')}
            >
              <Clock size={18} />
              <span>Moderation queue</span>
              <span className="admin-nav-count">{moderationQueue.length}</span>
            </div>
            <div
              className={`admin-nav-item ${adminTab === 'dealers' ? 'active' : ''}`}
              onClick={() => setAdminTab('dealers')}
            >
              <ShieldCheck size={18} />
              <span>Dealer verification</span>
              <span className="admin-nav-count">{dealerQueue.length}</span>
            </div>
            <div
              className={`admin-nav-item ${adminTab === 'listings' ? 'active' : ''}`}
              onClick={() => setAdminTab('listings')}
            >
              <CheckCircle2 size={18} />
              <span>All live listings</span>
            </div>
            <div
              className="admin-nav-item"
              style={{ marginTop: '2rem', opacity: 0.8 }}
              onClick={() => setCurrentPage('marketplace')}
            >
              <ArrowLeft size={18} />
              <span>Exit to Marketplace</span>
            </div>
          </div>

          {/* Admin Content Area */}
          <div className="admin-main">
            {/* Admin Header with Notification Bell */}
            <div className="admin-header">
              <h1>Admin Operations Portal</h1>
              <div className="notif-bell-wrap">
                <div className="notif-bell" onClick={() => setShowNotifDropdown(!showNotifDropdown)}>
                  <Bell size={20} color="var(--deep)" />
                  {notifications.filter(n => !n.is_read).length > 0 && (
                    <span className="notif-badge">{notifications.filter(n => !n.is_read).length}</span>
                  )}
                </div>

                {showNotifDropdown && (
                  <div className="notif-dropdown">
                    <div className="notif-head">Real-time Admin Notifications</div>
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div key={n.id} className={`notif-item ${!n.is_read ? 'unread' : ''}`}>
                          <div className="notif-item-title">{n.title}</div>
                          <div>{n.message}</div>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--ink-2)' }}>No new notifications</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* TAB: DASHBOARD */}
            {adminTab === 'dashboard' && (
              <div>
                <div className="stat-grid">
                  <div className="stat-card">
                    <div className="stat-label">Live Listings</div>
                    <div className="stat-value">{adminStats.liveListings}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Pending Moderation</div>
                    <div className="stat-value">{moderationQueue.length}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Verified Dealers</div>
                    <div className="stat-value">{adminStats.verifiedDealers}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Pending Dealers</div>
                    <div className="stat-value">{dealerQueue.length}</div>
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-head">
                    <div>
                      <h2>Moderation Queue Preview</h2>
                      <p>Newest vehicle submissions waiting for administrative review</p>
                    </div>
                    <button className="btn-gold" onClick={() => setAdminTab('moderation')}>View Full Queue</button>
                  </div>
                  <table>
                    <tbody>
                      {moderationQueue.slice(0, 3).map(item => (
                        <tr key={item.id}>
                          <td>
                            <div className="cell-main">{item.title}</div>
                            <div className="cell-sub">{item.city}, {item.country}</div>
                          </td>
                          <td>{item.seller_name || item.seller}</td>
                          <td>{item.price_label || `${item.currency} ${Number(item.price).toLocaleString()}`}</td>
                          <td>
                            <div className="row-actions">
                              <button className="act-btn approve" onClick={() => resolveModeration(item.id, true)}>Approve</button>
                              <button className="act-btn reject" onClick={() => resolveModeration(item.id, false)}>Reject</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="panel">
                  <div className="panel-head">
                    <div>
                      <h2>Dealer Verification Preview</h2>
                      <p>Companies waiting on commercial trade license approval</p>
                    </div>
                    <button className="btn-gold" onClick={() => setAdminTab('dealers')}>View Dealer Queue</button>
                  </div>
                  <table>
                    <tbody>
                      {dealerQueue.slice(0, 3).map(dealer => (
                        <tr key={dealer.id}>
                          <td>
                            <div className="cell-main">{dealer.name || dealer.company_name}</div>
                            <div className="cell-sub">{dealer.trade_license || 'License Attached'}</div>
                          </td>
                          <td>{dealer.country}</td>
                          <td>
                            <div className="row-actions">
                              <button className="act-btn approve" onClick={() => resolveDealer(dealer.id, true)}>Verify</button>
                              <button className="act-btn reject" onClick={() => resolveDealer(dealer.id, false)}>Reject</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: MODERATION QUEUE */}
            {adminTab === 'moderation' && (
              <div className="panel">
                <div className="panel-head">
                  <div>
                    <h2>Vehicle Moderation Queue</h2>
                    <p>Submissions waiting to go live on the public marketplace.</p>
                  </div>
                  <span className="pending-count">{moderationQueue.length} pending review</span>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Listing</th>
                      <th>Seller</th>
                      <th>Condition</th>
                      <th>Price</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {moderationQueue.length > 0 ? (
                      moderationQueue.map(item => (
                        <tr key={item.id}>
                          <td>
                            <div className="cell-main">{item.title}</div>
                            <div className="cell-sub">{item.city}, {item.country}</div>
                          </td>
                          <td>{item.seller_name || item.seller}</td>
                          <td>
                            <span className={`badge ${(item.condition_type || item.condition) === 'new' ? 'new' : 'used'}`}>
                              {(item.condition_type || item.condition) === 'new' ? 'New' : 'Used'}
                            </span>
                          </td>
                          <td>{item.price_label || `${item.currency} ${Number(item.price).toLocaleString()}`}</td>
                          <td>
                            <div className="row-actions">
                              <button className="act-btn approve" onClick={() => resolveModeration(item.id, true)}>Approve & Publish</button>
                              <button className="act-btn reject" onClick={() => resolveModeration(item.id, false)}>Reject</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="empty-row"><td colSpan="5">Queue is clear! All submissions have been moderated.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB: DEALER VERIFICATION */}
            {adminTab === 'dealers' && (
              <div className="panel">
                <div className="panel-head">
                  <div>
                    <h2>Commercial Dealer Verification</h2>
                    <p>Company registrations requiring business trade license review.</p>
                  </div>
                  <span className="pending-count">{dealerQueue.length} pending</span>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Country</th>
                      <th>License Number</th>
                      <th>Document</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dealerQueue.length > 0 ? (
                      dealerQueue.map(dealer => (
                        <tr key={dealer.id}>
                          <td><div className="cell-main">{dealer.name || dealer.company_name}</div></td>
                          <td>{dealer.country}</td>
                          <td>{dealer.trade_license || 'Pending Upload'}</td>
                          <td>
                            <span style={{ color: 'var(--gold)', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem' }} onClick={() => alert('Displaying uploaded trade license PDF scan for ' + (dealer.name || dealer.company_name))}>
                              View Trade License
                            </span>
                          </td>
                          <td>
                            <div className="row-actions">
                              <button className="act-btn approve" onClick={() => resolveDealer(dealer.id, true)}>Verify Dealer</button>
                              <button className="act-btn reject" onClick={() => resolveDealer(dealer.id, false)}>Reject</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="empty-row"><td colSpan="5">No pending dealer registrations.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB: ALL LISTINGS */}
            {adminTab === 'listings' && (
              <div className="panel">
                <div className="panel-head">
                  <div>
                    <h2>All Live Marketplace Listings</h2>
                    <p>Manage and audit approved vehicle postings currently live.</p>
                  </div>
                  <input
                    className="search"
                    placeholder="Search listings or sellers..."
                    value={adminSearch}
                    onChange={e => setAdminSearch(e.target.value)}
                  />
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Vehicle</th>
                      <th>Seller</th>
                      <th>Price</th>
                      <th>Location</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminListings
                      .filter(l => !adminSearch || l.title?.toLowerCase().includes(adminSearch.toLowerCase()) || l.seller_name?.toLowerCase().includes(adminSearch.toLowerCase()))
                      .map(l => (
                        <tr key={l.id}>
                          <td>
                            <div className="cell-main">{l.title}</div>
                            <div className="cell-sub">{l.category} &bull; {l.year}</div>
                          </td>
                          <td>{l.seller_name || l.seller}</td>
                          <td>{l.price_label || `${l.currency} ${Number(l.price).toLocaleString()}`}</td>
                          <td>{l.city}, {l.country}</td>
                          <td>
                            <button className="act-btn reject" onClick={() => removeListing(l.id)}>
                              <Trash2 size={13} style={{ display: 'inline', marginRight: 4 }} />
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= PAGE: ABOUT ================= */}
      {currentPage === 'about' && (
        <div>
          <div className="info-hero">
            <h1>Built to make it <em>free</em> to buy and sell a car.</h1>
            <p>Listing a vehicle for sale or rent shouldn't cost the owner anything.</p>
          </div>
          <div className="info-section">
            <h2>Our Story</h2>
            <p>Most classifieds platforms charge sellers high listing fees and extract transaction cuts. Binmar Drive is completely free to register and free to list, for individuals, dealers, and rental companies alike, across the Middle East &mdash; supported by advertising instead of listing fees.</p>
            <h2>What We Stand For</h2>
            <p>Free to list for everyone. Dealers undergo a verified trade license review before commercial listings go live, ensuring buyers can transact with full trust and confidence across the UAE, Saudi Arabia, Qatar, Kuwait, Bahrain and Oman.</p>
            <button className="btn-gold" style={{ marginTop: '1.5rem' }} onClick={() => setCurrentPage('marketplace')}>
              Browse Marketplace
            </button>
          </div>
        </div>
      )}

      {/* ================= PAGE: HOW IT WORKS ================= */}
      {currentPage === 'how-it-works' && (
        <div>
          <div className="info-hero">
            <h1>How <em>Binmar Drive</em> works.</h1>
            <p>From registering to a listing going live &mdash; here is the full journey.</p>
          </div>
          <div className="info-section">
            <h2>For Sellers and Dealers</h2>
            <div className="steps4">
              <div className="step-card">
                <div className="step-num">1</div>
                <h3>Register Free</h3>
                <p>Sign up as an individual or company &mdash; commercial dealers attach a trade license.</p>
              </div>
              <div className="step-card">
                <div className="step-num">2</div>
                <h3>Post Your Vehicle</h3>
                <p>Add vehicle details, upload high-res photos, set price and location in a few steps.</p>
              </div>
              <div className="step-card">
                <div className="step-num">3</div>
                <h3>Admin Review</h3>
                <p>New listings enter the admin moderation queue to guarantee marketplace quality.</p>
              </div>
              <div className="step-card">
                <div className="step-num">4</div>
                <h3>Connect & Sell</h3>
                <p>Buyers contact you directly via WhatsApp or call &mdash; zero commission on sale, ever.</p>
              </div>
            </div>

            <h2>For Buyers</h2>
            <div className="steps4">
              <div className="step-card">
                <div className="step-num">1</div>
                <h3>Search & Filter</h3>
                <p>Filter by make, country, price, fuel type, and for sale or rent.</p>
              </div>
              <div className="step-card">
                <div className="step-num">2</div>
                <h3>View Specs</h3>
                <p>Open full vehicle specifications, condition details, and photo gallery.</p>
              </div>
              <div className="step-card">
                <div className="step-num">3</div>
                <h3>Direct Contact</h3>
                <p>Reach out directly to the owner or verified dealer with no middlemen.</p>
              </div>
              <div className="step-card">
                <div className="step-num">4</div>
                <h3>Inspect & Drive</h3>
                <p>Arrange vehicle viewing and complete the deal directly.</p>
              </div>
            </div>

            <button className="btn-gold" style={{ marginTop: '1.5rem' }} onClick={handlePostListingClick}>
              Post a Listing Now &mdash; Free
            </button>
          </div>
        </div>
      )}

      {/* ================= PAGE: CONTACT ================= */}
      {currentPage === 'contact' && (
        <div>
          <div className="info-hero">
            <h1>Get in <em>touch</em>.</h1>
            <p>Questions about buying, selling, dealer verification, or partnership &mdash; our team is here to assist.</p>
          </div>
          <div className="info-section">
            <p><strong>WhatsApp Support:</strong> +971 50 000 0000</p>
            <p><strong>Official Email:</strong> support@binmardrive.com</p>
            <p><strong>Head Office:</strong> Abu Dhabi, United Arab Emirates &mdash; serving UAE, Saudi Arabia, Qatar, Kuwait, Bahrain and Oman.</p>
            <button className="btn-gold" style={{ marginTop: '1.5rem' }} onClick={() => setCurrentPage('marketplace')}>
              Back to Marketplace
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
