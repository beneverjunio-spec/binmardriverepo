import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Store,
  Car,
  LayoutDashboard,
  Plus,
  PlusCircle,
  Tag,
  MessageSquare,
  BarChart3,
  User,
  Wallet,
  Settings,
  HelpCircle,
  CheckCircle2,
  Eye,
  SlidersHorizontal,
  MapPin,
  Clock,
  Edit,
  MoreVertical,
  X,
  Upload,
  Trash2,
  Check,
  ExternalLink,
  LogOut,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Search,
  Phone,
  Building2,
  AlertCircle,
  FileText,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import {
  GCC_COUNTRIES,
  GCC_CURRENCIES,
  VEHICLE_MAKES,
  VEHICLE_CATEGORIES,
  FUEL_TYPES,
  TRANSMISSION_TYPES
} from '../constants';
import { uploadListingPhotos, isTestData } from '../api/listings';
import { apiRequest } from '../api/client';

export default function SellerPortalPage({
  currentUser,
  setCurrentUser,
  setCurrentPage,
  notify,
  onRefreshListings,
  onOpenCreateListing
}) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState('listings'); // 'listings', 'dashboard', 'profile', 'analytics', 'inquiries', 'wallet', 'settings'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'published', 'pending', 'drafts', 'expired'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'price_asc', 'price_desc'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Listings data
  const [sellerListings, setSellerListings] = useState([]);
  const [activeMenuId, setActiveMenuId] = useState(null);

  // In-place edit modal state
  const [editingListing, setEditingListing] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editImageInput, setEditImageInput] = useState('');
  const [isUploadingEditPhoto, setIsUploadingEditPhoto] = useState(false);
  const editFileInputRef = useRef(null);
  const addPhotoInputRef = useRef(null);
  const addDocInputRef = useRef(null);

  // Quick Add Listing Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    make: 'Toyota',
    model: '',
    year: '2025',
    category: 'SUV',
    fuel: 'Petrol',
    transmission: 'Automatic',
    mileage: '',
    condition_type: 'used',
    listing_type: 'sale',
    price: '',
    currency: 'AED',
    country: currentUser?.country || 'United Arab Emirates',
    city: 'Dubai',
    whatsapp_number: currentUser?.phone || '+971 50 123 4567',
    description: '',
    images: [],
    document_name: '',
    document_file: ''
  });

  const handleAddPhotos = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setAddForm(prev => ({
          ...prev,
          images: [...prev.images, uploadEvent.target.result]
        }));
      };
      reader.readAsDataURL(file);
    });
    notify(`${files.length} photo(s) attached!`);
  };

  const handleRemoveAddPhoto = (index) => {
    setAddForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleAddDoc = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAddForm(prev => ({
      ...prev,
      document_name: file.name,
      document_file: file.name
    }));
    notify(`Document attached: ${file.name}`);
  };

  // Profile edit state
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || currentUser?.company_name || 'Al Futtaim Motors',
    company_name: currentUser?.company_name || currentUser?.name || 'Al Futtaim Motors',
    email: currentUser?.email || 'dealer@binmardrive.com',
    phone: currentUser?.phone || '+971 50 892 1245',
    trade_license: currentUser?.trade_license || 'CN-8924151',
    country: currentUser?.country || 'United Arab Emirates',
    city: currentUser?.city || 'Dubai',
    bio: currentUser?.bio || 'Certified premium automotive dealership offering certified pre-owned and luxury vehicles across the GCC with complete inspection guarantees.'
  });

  // Load listings belonging to this seller/dealer
  const loadSellerData = () => {
    let allCustom = [];
    try {
      const raw = localStorage.getItem('binmar_custom_listings');
      if (raw) {
        const parsed = JSON.parse(raw);
        allCustom = parsed.filter(item => !isTestData(item));
        localStorage.setItem('binmar_custom_listings', JSON.stringify(allCustom));
      }
    } catch {
      allCustom = [];
    }

    let deletedIds = [];
    try {
      const rawDel = localStorage.getItem('binmar_deleted_listings');
      if (rawDel) deletedIds = JSON.parse(rawDel);
    } catch {}

    const currentUserName = (currentUser?.name || '').toLowerCase();
    const currentUserCompany = (currentUser?.company_name || '').toLowerCase();
    const currentUserEmail = (currentUser?.email || '').toLowerCase();

    // Find custom listings added by this user
    const matchedListings = allCustom.filter(item => {
      if (deletedIds.includes(String(item.id))) return false;
      if (isTestData(item)) return false;
      const sName = (item.seller_name || '').toLowerCase();
      const sEmail = (item.seller_email || '').toLowerCase();
      return (
        sName === currentUserName ||
        (currentUserCompany && sName === currentUserCompany) ||
        (currentUserEmail && sEmail === currentUserEmail)
      );
    });

    setSellerListings(matchedListings);
  };

  useEffect(() => {
    loadSellerData();
  }, [currentUser]);

  // Close menus on click outside
  useEffect(() => {
    const handleGlobalClick = () => setActiveMenuId(null);
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  // Filter listings by status and search query
  const filteredListings = useMemo(() => {
    let list = [...sellerListings];

    // Status filter
    if (statusFilter === 'published') {
      list = list.filter(l => l.status === 'approved' || l.status === 'published' || !l.status);
    } else if (statusFilter === 'pending') {
      list = list.filter(l => l.status === 'pending');
    } else if (statusFilter === 'drafts') {
      list = list.filter(l => l.status === 'draft');
    } else if (statusFilter === 'expired') {
      list = list.filter(l => l.status === 'expired');
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(l =>
        (l.make && l.make.toLowerCase().includes(q)) ||
        (l.model && l.model.toLowerCase().includes(q)) ||
        (l.title && l.title.toLowerCase().includes(q)) ||
        (l.city && l.city.toLowerCase().includes(q)) ||
        (l.country && l.country.toLowerCase().includes(q))
      );
    }

    // Sort
    if (sortBy === 'price_asc') {
      list.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => Number(b.price) - Number(a.price));
    } else {
      // Recent first
      list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    }

    return list;
  }, [sellerListings, statusFilter, searchQuery, sortBy]);

  // Stats calculation
  const publishedCount = sellerListings.filter(l => l.status === 'approved' || l.status === 'published' || !l.status).length;
  const pendingCount = sellerListings.filter(l => l.status === 'pending').length;
  const draftsCount = sellerListings.filter(l => l.status === 'draft').length;
  const expiredCount = sellerListings.filter(l => l.status === 'expired').length;

  const totalViews = sellerListings.reduce((sum, l) => sum + (Number(l.views) || 240), 0);
  const totalInquiries = sellerListings.reduce((sum, l) => sum + (Number(l.inquiries) || 12), 0);

  // In-place Edit action
  const handleStartEdit = (listing, e) => {
    if (e) e.stopPropagation();
    setEditingListing(listing);
    setEditForm({
      ...listing,
      price: listing.price || '',
      mileage: listing.mileage ? String(listing.mileage).replace(' km', '') : '',
      images: Array.isArray(listing.images) ? [...listing.images] : []
    });
  };

  const handleSaveListingEdit = () => {
    if (!editForm.model || !editForm.price) {
      notify('Please enter both vehicle model and price.');
      return;
    }
    setIsSavingEdit(true);

    try {
      const updatedItem = {
        ...editingListing,
        ...editForm,
        title: `${editForm.year} ${editForm.make} ${editForm.model}`,
        price: Number(editForm.price),
        mileage: editForm.mileage ? `${editForm.mileage} km` : '0 km',
        location: `${editForm.city || 'Dubai'}, ${editForm.country || 'United Arab Emirates'}`,
        updated_at: new Date().toISOString()
      };

      // Update local storage
      const raw = localStorage.getItem('binmar_custom_listings');
      let customList = raw ? JSON.parse(raw) : [];
      const index = customList.findIndex(l => String(l.id) === String(editingListing.id));

      if (index !== -1) {
        customList[index] = updatedItem;
      } else {
        customList.unshift(updatedItem);
      }
      localStorage.setItem('binmar_custom_listings', JSON.stringify(customList));

      // Update state
      setSellerListings(prev => prev.map(l => (String(l.id) === String(editingListing.id) ? updatedItem : l)));
      setEditingListing(null);
      setEditForm(null);
      notify(`Updated "${updatedItem.title}" successfully!`);
      if (onRefreshListings) onRefreshListings();
    } catch {
      notify('Failed to save listing changes. Please try again.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteListing = (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this listing from your studio?')) return;

    try {
      // Add to deleted IDs
      let deleted = [];
      const rawDel = localStorage.getItem('binmar_deleted_listings');
      if (rawDel) deleted = JSON.parse(rawDel);
      if (!deleted.includes(String(id))) {
        deleted.push(String(id));
        localStorage.setItem('binmar_deleted_listings', JSON.stringify(deleted));
      }

      // Remove from custom listings
      const raw = localStorage.getItem('binmar_custom_listings');
      if (raw) {
        const items = JSON.parse(raw);
        const filtered = items.filter(l => String(l.id) !== String(id));
        localStorage.setItem('binmar_custom_listings', JSON.stringify(filtered));
      }

      setSellerListings(prev => prev.filter(l => String(l.id) !== String(id)));
      notify('Listing removed successfully.');
      if (onRefreshListings) onRefreshListings();
    } catch {
      notify('Could not delete listing.');
    }
  };

  // Profile Save
  const handleSaveProfile = (e) => {
    if (e) e.preventDefault();
    try {
      const rawUsers = localStorage.getItem('binmar_custom_users');
      let users = rawUsers ? JSON.parse(rawUsers) : [];
      const userIndex = users.findIndex(u => u.email?.toLowerCase() === currentUser?.email?.toLowerCase());

      const updatedUser = {
        ...(currentUser || {}),
        name: profileForm.name,
        company_name: profileForm.company_name,
        phone: profileForm.phone,
        trade_license: profileForm.trade_license,
        country: profileForm.country,
        city: profileForm.city,
        bio: profileForm.bio,
        is_verified_seller: true,
        status: 'approved'
      };

      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updatedUser };
      } else {
        users.push(updatedUser);
      }
      localStorage.setItem('binmar_custom_users', JSON.stringify(users));

      if (setCurrentUser) setCurrentUser(updatedUser);
      notify('Seller profile details updated successfully!');
    } catch {
      notify('Could not save profile changes.');
    }
  };

  // Quick Add Listing Submit
  const handleQuickAddSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!addForm.model || !addForm.price) {
      notify('Please fill in vehicle model and price.');
      return;
    }

    const newVehicle = {
      id: Date.now(),
      title: `${addForm.year} ${addForm.make} ${addForm.model}`,
      make: addForm.make,
      model: addForm.model,
      year: Number(addForm.year),
      category: addForm.category,
      fuel: addForm.fuel,
      mileage: addForm.mileage ? `${addForm.mileage} km` : '0 km',
      transmission: addForm.transmission,
      condition_type: addForm.condition_type,
      listing_type: addForm.listing_type,
      price: Number(addForm.price),
      currency: addForm.currency,
      price_label: `${addForm.currency} ${Number(addForm.price).toLocaleString()}${addForm.listing_type === 'rent' ? ' / day' : ''}`,
      country: addForm.country,
      city: addForm.city,
      location: `${addForm.city}, ${addForm.country}`,
      seller_name: currentUser?.company_name || currentUser?.name || 'Verified Seller',
      seller_email: currentUser?.email || 'seller@binmardrive.com',
      whatsapp_number: addForm.whatsapp_number,
      contact_phone: addForm.whatsapp_number,
      description: addForm.description || 'Verified vehicle with GCC specifications.',
      images: addForm.images.length > 0 ? addForm.images : [
        'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?w=800&auto=format&fit=crop'
      ],
      document_name: addForm.document_name || 'Mulkiya_Vehicle_Registration.pdf',
      document_file: addForm.document_file || 'Mulkiya_Vehicle_Registration.pdf',
      views: 0,
      inquiries: 0,
      status: 'pending', // PENDING: All seller listings must be approved by admin!
      created_at: new Date().toISOString()
    };

    try {
      const raw = localStorage.getItem('binmar_custom_listings');
      const existing = raw ? JSON.parse(raw) : [];
      localStorage.setItem('binmar_custom_listings', JSON.stringify([newVehicle, ...existing]));

      // Send high-priority notification to Admin Portal
      const notifRaw = localStorage.getItem('binmar_admin_notifications');
      const existingNotifs = notifRaw ? JSON.parse(notifRaw) : [];
      const newNotif = {
        id: Date.now(),
        title: 'New Vehicle Pending Review',
        message: `${newVehicle.title} submitted by ${newVehicle.seller_name} (${newVehicle.city}, ${newVehicle.country}) and is waiting in the Moderation Queue for review.`,
        is_read: false,
        created_at: new Date().toISOString()
      };
      localStorage.setItem('binmar_admin_notifications', JSON.stringify([newNotif, ...existingNotifs]));

      // Also submit to backend API
      try {
        await apiRequest('/api/listings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newVehicle)
        });
      } catch (err) {
        console.warn('Backend queued locally for admin moderation', err);
      }

      setSellerListings(prev => [newVehicle, ...prev]);
      setStatusFilter('pending'); // Auto switch to Pending tab so seller sees their submission
      setShowAddModal(false);
      setAddForm({
        make: 'Toyota',
        model: '',
        year: '2025',
        category: 'SUV',
        fuel: 'Petrol',
        transmission: 'Automatic',
        mileage: '',
        condition_type: 'used',
        listing_type: 'sale',
        price: '',
        currency: 'AED',
        country: currentUser?.country || 'United Arab Emirates',
        city: 'Dubai',
        whatsapp_number: currentUser?.phone || '+971 50 123 4567',
        description: '',
        images: [],
        document_name: '',
        document_file: ''
      });

      notify(`Listing "${newVehicle.title}" submitted to Admin Moderation! Once verified & approved, it will be published live.`);
      if (onRefreshListings) onRefreshListings();
    } catch {
      notify('Failed to submit listing. Please try again.');
    }
  };

  const sellerDisplayName = currentUser?.company_name || currentUser?.name || 'Verified Dealer';
  const sellerInitials = sellerDisplayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('') || 'SP';

  return (
    <div className="seller-studio-root">
      {/* Sidebar Navigation (Matching https://d1ws88zqvck0-d.space-z.ai/) */}
      <aside className={`seller-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div className="seller-brand">
          <div className="seller-logo-box">
            <Store className="w-5 h-5 text-white" />
          </div>
          <div className="seller-brand-text">
            <span className="seller-brand-title">Motors ME</span>
            <span className="seller-brand-subtitle">SELLER STUDIO</span>
          </div>
          {mobileMenuOpen && (
            <button
              className="seller-close-mobile-btn"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="seller-nav-wrap">
          <p className="seller-nav-section-title">Main</p>
          <ul className="seller-nav-list">
            <li>
              <button
                className={`seller-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
              >
                <LayoutDashboard size={18} className="seller-nav-icon" />
                <span className="seller-nav-label">Dashboard</span>
              </button>
            </li>
            <li>
              <button
                className={`seller-nav-item ${activeTab === 'listings' ? 'active' : ''}`}
                onClick={() => { setActiveTab('listings'); setMobileMenuOpen(false); }}
              >
                {activeTab === 'listings' && <span className="seller-active-indicator" />}
                <Car size={18} className="seller-nav-icon" />
                <span className="seller-nav-label">My Listings</span>
                <span className="seller-nav-badge">{publishedCount + pendingCount}</span>
              </button>
            </li>
            <li>
              <button
                className={`seller-nav-item ${activeTab === 'add-listing' ? 'active' : ''}`}
                onClick={() => { setShowAddModal(true); setMobileMenuOpen(false); }}
              >
                <PlusCircle size={18} className="seller-nav-icon" />
                <span className="seller-nav-label">Add Listing</span>
              </button>
            </li>
            <li>
              <button
                className={`seller-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => { setActiveTab('orders'); setMobileMenuOpen(false); }}
              >
                {activeTab === 'orders' && <span className="seller-active-indicator" />}
                <Tag size={18} className="seller-nav-icon" />
                <span className="seller-nav-label">Orders</span>
                <span className="seller-nav-badge">0</span>
              </button>
            </li>
            <li>
              <button
                className={`seller-nav-item ${activeTab === 'messages' ? 'active' : ''}`}
                onClick={() => { setActiveTab('messages'); setMobileMenuOpen(false); }}
              >
                {activeTab === 'messages' && <span className="seller-active-indicator" />}
                <MessageSquare size={18} className="seller-nav-icon" />
                <span className="seller-nav-label">Messages</span>
                <span className="seller-nav-badge">5</span>
              </button>
            </li>
            <li>
              <button
                className={`seller-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
                onClick={() => { setActiveTab('analytics'); setMobileMenuOpen(false); }}
              >
                <BarChart3 size={18} className="seller-nav-icon" />
                <span className="seller-nav-label">Analytics</span>
              </button>
            </li>
          </ul>

          <p className="seller-nav-section-title mt-6">Account</p>
          <ul className="seller-nav-list">
            <li>
              <button
                className={`seller-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => { setActiveTab('profile'); setMobileMenuOpen(false); }}
              >
                {activeTab === 'profile' && <span className="seller-active-indicator" />}
                <User size={18} className="seller-nav-icon" />
                <span className="seller-nav-label">Profile</span>
              </button>
            </li>
            <li>
              <button
                className={`seller-nav-item ${activeTab === 'wallet' ? 'active' : ''}`}
                onClick={() => { setActiveTab('wallet'); setMobileMenuOpen(false); }}
              >
                {activeTab === 'wallet' && <span className="seller-active-indicator" />}
                <Wallet size={18} className="seller-nav-icon" />
                <span className="seller-nav-label">Wallet</span>
              </button>
            </li>
            <li>
              <button
                className={`seller-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }}
              >
                {activeTab === 'settings' && <span className="seller-active-indicator" />}
                <Settings size={18} className="seller-nav-icon" />
                <span className="seller-nav-label">Settings</span>
              </button>
            </li>
            <li>
              <button
                className={`seller-nav-item ${activeTab === 'help' ? 'active' : ''}`}
                onClick={() => { setActiveTab('help'); setMobileMenuOpen(false); }}
              >
                {activeTab === 'help' && <span className="seller-active-indicator" />}
                <HelpCircle size={18} className="seller-nav-icon" />
                <span className="seller-nav-label">Help Center</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* Upgrade Card */}
        <div className="seller-upgrade-card">
          <div className="seller-card-dec1" />
          <div className="seller-card-dec2" />
          <p className="seller-card-tag">PREMIUM</p>
          <p className="seller-card-title">Boost your listings</p>
          <p className="seller-card-desc">Get up to 5x more buyer inquiries.</p>
          <button
            className="seller-upgrade-btn"
            onClick={() => notify('Premium dealer boost feature active for verified accounts.')}
          >
            Upgrade Now <ChevronRight size={14} />
          </button>
        </div>

        {/* User Card at Bottom of Sidebar */}
        <div className="seller-user-bottom">
          <div className="seller-avatar-circle">
            <span>{sellerInitials}</span>
          </div>
          <div className="seller-user-info">
            <p className="seller-user-name" title={sellerDisplayName}>{sellerDisplayName}</p>
            <p className="seller-user-badge">
              <ShieldCheck size={12} className="inline text-emerald-500 mr-1" />
              Verified Seller
            </p>
          </div>
          <button
            className="seller-signout-btn"
            title="Sign out or Exit Studio"
            onClick={() => {
              if (setCurrentPage) setCurrentPage('marketplace');
              notify('Exited Seller Studio to public marketplace.');
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Studio Viewport */}
      <main className="seller-main-viewport">
        {/* Mobile Header Bar */}
        <div className="seller-mobile-header">
          <button
            className="seller-mobile-burger"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold to-gold-deep flex items-center justify-center">
              <Store className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-ink">BINMAR <b>STUDIO</b></span>
          </div>
          <button
            className="text-xs font-semibold text-gold-deep px-2.5 py-1 rounded-md bg-cream-deep border border-tan/60"
            onClick={() => setCurrentPage('marketplace')}
          >
            Marketplace
          </button>
        </div>

        {/* Top Header */}
        {activeTab !== 'orders' && activeTab !== 'messages' && (
          <header className="seller-top-header">
          <div className="seller-header-inner">
            <div>
              <p className="seller-header-kicker">SELLER STUDIO</p>
              <h1 className="seller-header-title">
                {activeTab === 'listings' && 'My Listings'}
                {activeTab === 'dashboard' && 'Studio Dashboard'}
                {activeTab === 'profile' && 'Seller Profile & Commercial Verification'}
                {activeTab === 'analytics' && 'Performance Analytics'}
                {activeTab === 'inquiries' && 'Buyer Leads & Inquiries'}
                {activeTab === 'wallet' && 'Seller Wallet & Transactions'}
                {activeTab === 'settings' && 'Studio Settings'}
                {activeTab === 'help' && 'Seller Support & Knowledge Base'}
              </h1>
              <p className="seller-header-subtitle">
                {activeTab === 'listings'
                  ? 'Edit any published listing in place — vehicle details, photos, price & location.'
                  : `Manage your dealer operations, verification credentials, and buyer requests.`}
              </p>
            </div>

            <div className="seller-header-actions">
              {activeTab === 'listings' && (
                <div className="seller-search-box">
                  <Search size={16} className="seller-search-icon" />
                  <input
                    type="text"
                    placeholder="Search make, model, city…"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="seller-search-input"
                  />
                  {searchQuery && (
                    <button
                      className="seller-search-clear"
                      onClick={() => setSearchQuery('')}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              )}

              <button
                className="seller-new-listing-btn"
                onClick={() => setShowAddModal(true)}
              >
                <Plus size={16} /> New Listing
              </button>

              <button
                className="seller-public-link-btn"
                onClick={() => setCurrentPage('marketplace')}
                title="View live website"
              >
                <ExternalLink size={15} />
                <span className="hidden sm:inline">Marketplace</span>
              </button>
            </div>
          </div>
        </header>
      )}

        {/* Content Body */}
        <div className="seller-body-content">
          {/* TAB 1: LISTINGS (Mirroring https://d1ws88zqvck0-d.space-z.ai/) */}
          {activeTab === 'listings' && (
            <>
              {/* Summary Metric Cards */}
              <div className="seller-metrics-grid">
                <div className="seller-stat-card bg-emerald-50 border-emerald-100">
                  <div className="seller-stat-icon-wrap text-emerald-600 bg-white">
                    <CheckCircle2 size={22} />
                  </div>
                  <div>
                    <p className="seller-stat-label">Published</p>
                    <p className="seller-stat-value">{publishedCount}</p>
                    <p className="seller-stat-sub">active listings</p>
                  </div>
                </div>

                <div className="seller-stat-card bg-amber-50/60 border-amber-200/50">
                  <div className="seller-stat-icon-wrap text-amber-600 bg-white">
                    <Eye size={22} />
                  </div>
                  <div>
                    <p className="seller-stat-label">Total views</p>
                    <p className="seller-stat-value">{totalViews.toLocaleString()}</p>
                    <p className="seller-stat-sub">last 30 days</p>
                  </div>
                </div>

                <div className="seller-stat-card bg-violet-50 border-violet-100">
                  <div className="seller-stat-icon-wrap text-violet-600 bg-white">
                    <MessageSquare size={22} />
                  </div>
                  <div>
                    <p className="seller-stat-label">Inquiries</p>
                    <p className="seller-stat-value">{totalInquiries}</p>
                    <p className="seller-stat-sub">buyer messages</p>
                  </div>
                </div>
              </div>

              {/* Status Filter Tabs & Sorter */}
              <div className="seller-filters-bar">
                <div className="seller-tab-pills">
                  <button
                    className={`seller-pill ${statusFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('all')}
                  >
                    All <span className="seller-pill-badge">{sellerListings.length}</span>
                  </button>
                  <button
                    className={`seller-pill ${statusFilter === 'published' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('published')}
                  >
                    Published <span className="seller-pill-badge">{publishedCount}</span>
                  </button>
                  <button
                    className={`seller-pill ${statusFilter === 'pending' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('pending')}
                  >
                    Pending <span className="seller-pill-badge">{pendingCount}</span>
                  </button>
                  <button
                    className={`seller-pill ${statusFilter === 'drafts' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('drafts')}
                  >
                    Drafts <span className="seller-pill-badge">{draftsCount}</span>
                  </button>
                  <button
                    className={`seller-pill ${statusFilter === 'expired' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('expired')}
                  >
                    Expired <span className="seller-pill-badge">{expiredCount}</span>
                  </button>
                </div>

                <div className="seller-sorter-wrap">
                  <SlidersHorizontal size={15} className="text-ink-soft/70" />
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="seller-sorter-select"
                  >
                    <option value="recent">Sort by recent</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="price_asc">Price: Low to High</option>
                  </select>
                </div>
              </div>

              {/* Vehicle Listings Grid */}
              {filteredListings.length === 0 ? (
                <div className="seller-empty-state">
                  <Car size={48} className="text-gold-dim mx-auto mb-3" />
                  <h3 className="text-xl font-bold font-serif-display text-ink">No vehicle listings found</h3>
                  <p className="text-ink-soft text-sm max-w-md mx-auto mt-1 mb-5">
                    {searchQuery
                      ? `No vehicles matched "${searchQuery}". Clear your search query to see all vehicles.`
                      : 'You do not have any listings in this status tab yet. Post your first vehicle to get started!'}
                  </p>
                  <button
                    className="seller-new-listing-btn mx-auto"
                    onClick={() => setShowAddModal(true)}
                  >
                    <Plus size={16} /> Add Your First Listing
                  </button>
                </div>
              ) : (
                <div className="seller-cards-grid">
                  {filteredListings.map(listing => {
                    const images = Array.isArray(listing.images) && listing.images.length > 0
                      ? listing.images
                      : ['https://images.unsplash.com/photo-1594502184342-2e12f877aa73?w=800&auto=format&fit=crop'];
                    const coverPhoto = images[0];
                    const photoCount = images.length;
                    const isForRent = (listing.listing_type || listing.type) === 'rent';
                    const isPublished = listing.status === 'approved' || listing.status === 'published' || !listing.status;
                    const isPending = listing.status === 'pending';

                    return (
                      <article key={listing.id} className="seller-vehicle-card">
                        {/* Cover Image & Badges */}
                        <div className="seller-card-image-box">
                          <img
                            src={coverPhoto}
                            alt={listing.title}
                            className="seller-card-image"
                            loading="lazy"
                          />

                          {/* Status Badge */}
                          <div className="seller-badge-status">
                            <span
                              className={`seller-dot ${isPublished ? 'bg-emerald-500' : isPending ? 'bg-amber-500' : 'bg-gray-400'}`}
                            />
                            <span className="text-xs font-semibold text-ink">
                              {isPublished ? 'Published' : isPending ? 'Pending Review' : 'Draft'}
                            </span>
                          </div>

                          {/* Sale/Rent Pill */}
                          <div className={`seller-badge-type ${isForRent ? 'rent' : 'sale'}`}>
                            {isForRent ? 'For Rent' : 'For Sale'}
                          </div>

                          {/* Photo Count */}
                          <div className="seller-badge-photos">
                            {photoCount} photo{photoCount !== 1 ? 's' : ''}
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="seller-card-body">
                          {/* Title & Price Header */}
                          <div className="seller-card-header-row">
                            <div className="min-w-0">
                              <p className="seller-card-make">{listing.make}</p>
                              <h3 className="seller-card-title truncate">
                                {listing.model}{' '}
                                <span className="seller-card-year">{listing.year}</span>
                              </h3>
                            </div>
                            <div className="seller-card-price-box">
                              <span className="seller-card-price">
                                {Number(listing.price || 0).toLocaleString()}
                              </span>{' '}
                              <span className="seller-card-currency">
                                {listing.currency || 'AED'}
                                {isForRent ? '/mo' : ''}
                              </span>
                            </div>
                          </div>

                          {/* Specs Pills */}
                          <div className="seller-spec-pills">
                            <span className="seller-spec-pill">{listing.category || 'SUV'}</span>
                            <span className="seller-spec-pill">{listing.fuel || 'Petrol'}</span>
                            <span className="seller-spec-pill">{listing.transmission || 'Automatic'}</span>
                            <span className="seller-spec-pill">{listing.mileage || '0 km'}</span>
                          </div>

                          {/* Location Pin */}
                          <div className="seller-card-location">
                            <MapPin size={14} className="shrink-0 text-gold-deep" />
                            <span className="truncate">{listing.location || `${listing.city || 'Dubai'}, ${listing.country || 'UAE'}`}</span>
                          </div>

                          {/* Metrics Row */}
                          <div className="seller-card-stats-row">
                            <span className="seller-stat-chip">
                              <Eye size={13} /> {listing.views || 240} views
                            </span>
                            <span className="seller-stat-chip">
                              <MessageSquare size={13} /> {listing.inquiries || 12} inquiries
                            </span>
                            <span className="seller-stat-chip ml-auto">
                              <Clock size={13} /> {String(listing.created_at || '2026-10-01').slice(0, 10)}
                            </span>
                          </div>

                          {/* Action Buttons: Edit Listing & Dropdown */}
                          <div className="seller-card-actions-row">
                            <button
                              className="seller-edit-btn"
                              onClick={(e) => handleStartEdit(listing, e)}
                            >
                              <Edit size={14} /> Edit Listing
                            </button>

                            <div className="relative">
                              <button
                                className="seller-more-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(activeMenuId === listing.id ? null : listing.id);
                                }}
                                aria-label="More actions"
                              >
                                <MoreVertical size={16} />
                              </button>

                              {/* Dropdown Menu */}
                              {activeMenuId === listing.id && (
                                <div
                                  className="seller-dropdown-menu"
                                  onClick={e => e.stopPropagation()}
                                >
                                  <button
                                    className="seller-dropdown-item"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      handleStartEdit(listing);
                                    }}
                                  >
                                    <Edit size={14} /> Edit Details & Photos
                                  </button>
                                  <button
                                    className="seller-dropdown-item"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      if (setCurrentPage) setCurrentPage('marketplace');
                                    }}
                                  >
                                    <ExternalLink size={14} /> View on Public Site
                                  </button>
                                  <button
                                    className="seller-dropdown-item text-red-600 hover:bg-red-50"
                                    onClick={(e) => {
                                      setActiveMenuId(null);
                                      handleDeleteListing(listing.id, e);
                                    }}
                                  >
                                    <Trash2 size={14} /> Delete Listing
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* TAB 2: PROFILE & DEALER VERIFICATION */}
          {activeTab === 'profile' && (
            <div className="seller-profile-panel">
              <div className="seller-profile-card">
                <div className="flex items-center justify-between pb-4 border-b border-tan/40">
                  <div>
                    <h2 className="text-xl font-bold font-serif-display text-ink">Dealer & Seller Credentials</h2>
                    <p className="text-sm text-ink-soft mt-0.5">
                      Verified commercial credentials allow direct vehicle posting and buyer WhatsApp lead generation.
                    </p>
                  </div>
                  <span className="seller-verified-badge-lg">
                    <ShieldCheck size={16} className="text-emerald-600" />
                    Verified by Admin
                  </span>
                </div>

                <form onSubmit={handleSaveProfile} className="mt-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="seller-form-label">Dealer / Business Name</label>
                      <input
                        type="text"
                        required
                        value={profileForm.company_name}
                        onChange={e => setProfileForm({ ...profileForm, company_name: e.target.value })}
                        className="seller-form-input"
                      />
                    </div>

                    <div>
                      <label className="seller-form-label">Primary Contact Person</label>
                      <input
                        type="text"
                        required
                        value={profileForm.name}
                        onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="seller-form-input"
                      />
                    </div>

                    <div>
                      <label className="seller-form-label">Contact Email</label>
                      <input
                        type="email"
                        required
                        value={profileForm.email}
                        onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                        className="seller-form-input"
                      />
                    </div>

                    <div>
                      <label className="seller-form-label">WhatsApp / Contact Phone</label>
                      <input
                        type="text"
                        required
                        value={profileForm.phone}
                        onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="seller-form-input"
                      />
                    </div>

                    <div>
                      <label className="seller-form-label">Commercial Trade License Number</label>
                      <input
                        type="text"
                        value={profileForm.trade_license}
                        onChange={e => setProfileForm({ ...profileForm, trade_license: e.target.value })}
                        className="seller-form-input"
                      />
                    </div>

                    <div>
                      <label className="seller-form-label">Country & Headquarters</label>
                      <select
                        value={profileForm.country}
                        onChange={e => setProfileForm({ ...profileForm, country: e.target.value })}
                        className="seller-form-input"
                      >
                        {GCC_COUNTRIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="seller-form-label">Showroom Location / City</label>
                    <input
                      type="text"
                      value={profileForm.city}
                      onChange={e => setProfileForm({ ...profileForm, city: e.target.value })}
                      placeholder="e.g. Sheikh Zayed Road, Al Quoz 1, Dubai"
                      className="seller-form-input"
                    />
                  </div>

                  <div>
                    <label className="seller-form-label">About Dealership / Bio</label>
                    <textarea
                      rows={3}
                      value={profileForm.bio}
                      onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                      className="seller-form-textarea"
                    />
                  </div>

                  <div className="pt-3 flex justify-end gap-3">
                    <button
                      type="submit"
                      className="seller-primary-save-btn"
                    >
                      <Check size={16} /> Save Profile Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: DASHBOARD / OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="seller-dashboard-wrap">
              {/* Metric Stats Cards */}
              <div className="seller-metrics-grid">
                <div className="seller-stat-card bg-emerald-50 border-emerald-100">
                  <div className="seller-stat-icon-wrap text-emerald-600 bg-white">
                    <CheckCircle2 size={22} />
                  </div>
                  <div>
                    <p className="seller-stat-label">Active Listings</p>
                    <p className="seller-stat-value">{publishedCount}</p>
                    <p className="seller-stat-sub">Live on GCC Marketplace</p>
                  </div>
                </div>

                <div className="seller-stat-card bg-amber-50/60 border-amber-200/50">
                  <div className="seller-stat-icon-wrap text-amber-600 bg-white">
                    <Eye size={22} />
                  </div>
                  <div>
                    <p className="seller-stat-label">30-Day Impressions</p>
                    <p className="seller-stat-value">{totalViews.toLocaleString()}</p>
                    <p className="seller-stat-sub">+18.4% this week</p>
                  </div>
                </div>

                <div className="seller-stat-card bg-violet-50 border-violet-100">
                  <div className="seller-stat-icon-wrap text-violet-600 bg-white">
                    <MessageSquare size={22} />
                  </div>
                  <div>
                    <p className="seller-stat-label">Direct Leads</p>
                    <p className="seller-stat-value">{totalInquiries}</p>
                    <p className="seller-stat-sub">via WhatsApp / Phone</p>
                  </div>
                </div>
              </div>

              {/* 2-Column Dashboard Body */}
              <div className="seller-dash-grid-2">
                {/* Recent Inventory List */}
                <div className="seller-dashboard-card">
                  <div className="seller-dashboard-header">
                    <div>
                      <h3 className="seller-dashboard-card-title">Recent Studio Listings</h3>
                      <p className="text-xs text-ink-soft mt-0.5">Quickly edit or view your latest inventory.</p>
                    </div>
                    <button
                      className="seller-dashboard-link-btn"
                      onClick={() => setActiveTab('listings')}
                    >
                      View All Listings &rarr;
                    </button>
                  </div>

                  <div className="seller-dash-table-wrap">
                    {sellerListings.length === 0 ? (
                      <div className="p-8 text-center text-sm text-ink-soft">
                        No studio listings yet. Click "New Listing" to add your first vehicle.
                      </div>
                    ) : (
                      sellerListings.slice(0, 5).map(l => {
                      const img = (Array.isArray(l.images) && l.images[0]) ||
                        'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?w=800&fit=crop';
                      const isRent = (l.listing_type || l.type) === 'rent';

                      return (
                        <div key={l.id} className="seller-dash-vehicle-row">
                          <div className="seller-dash-vehicle-left">
                            <img
                              src={img}
                              alt={l.title}
                              className="seller-dash-thumb"
                              loading="lazy"
                            />
                            <div className="seller-dash-meta">
                              <p className="seller-dash-title">{l.title}</p>
                              <div className="seller-dash-submeta">
                                <span>{l.category || 'SUV'}</span>
                                <span>&bull;</span>
                                <span>{l.city || 'Dubai'}</span>
                                <span>&bull;</span>
                                <span>{l.views || 0} views</span>
                              </div>
                            </div>
                          </div>

                          <div className="seller-dash-vehicle-right">
                            <span className="seller-dash-price">
                              {Number(l.price || 0).toLocaleString()} {l.currency || 'AED'}
                              {isRent ? '/mo' : ''}
                            </span>
                            <button
                              className="seller-dash-action-btn"
                              onClick={() => handleStartEdit(l)}
                            >
                              <Edit size={13} /> Edit
                            </button>
                          </div>
                        </div>
                      );
                    }))}
                  </div>
                </div>

                {/* Quick Showroom Overview Panel */}
                <div className="seller-dashboard-card space-y-4">
                  <div className="seller-dashboard-header">
                    <h3 className="seller-dashboard-card-title">Showroom Status</h3>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center gap-3">
                    <ShieldCheck size={24} className="text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-emerald-900">Verified Seller Account</p>
                      <p className="text-[11px] text-emerald-700">Commercial trade license verified by admin.</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-2 border-b border-tan/30">
                      <span className="text-ink-soft">Dealership</span>
                      <span className="font-semibold text-ink">{sellerDisplayName}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-tan/30">
                      <span className="text-ink-soft">Live Inventory</span>
                      <span className="font-semibold text-ink">{publishedCount} published</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-tan/30">
                      <span className="text-ink-soft">WhatsApp Leads</span>
                      <span className="font-semibold text-emerald-600 font-bold">{totalInquiries} inquiries</span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      className="seller-new-listing-btn w-full"
                      onClick={() => setShowAddModal(true)}
                    >
                      <Plus size={16} /> Post New Vehicle
                    </button>
                    <button
                      className="seller-public-link-btn w-full justify-center"
                      onClick={() => setCurrentPage('marketplace')}
                    >
                      <ExternalLink size={14} /> Open Public Showroom
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ORDERS (Exact match with user screenshot) */}
          {activeTab === 'orders' && (
            <div className="seller-orders-center-view">
              <div className="seller-orders-icon-box">
                <Store size={26} className="text-[#A87B2E]" />
              </div>
              <p className="seller-orders-kicker">SELLER STUDIO</p>
              <h1 className="seller-orders-title">Orders</h1>
              <p className="seller-orders-desc">
                Track reservations, deposits, and completed sales for your published vehicles.
              </p>
              <button
                onClick={() => setActiveTab('listings')}
                className="seller-back-listings-btn"
              >
                Back to My Listings
              </button>
            </div>
          )}

          {/* TAB 5: MESSAGES */}
          {activeTab === 'messages' && (
            <div className="seller-orders-center-view">
              <div className="seller-orders-icon-box">
                <MessageSquare size={26} className="text-[#A87B2E]" />
              </div>
              <p className="seller-orders-kicker">SELLER STUDIO</p>
              <h1 className="seller-orders-title">Messages</h1>
              <p className="seller-orders-desc">
                Direct buyer inquiries and message threads for your published vehicles.
              </p>
              <button
                onClick={() => setActiveTab('listings')}
                className="seller-back-listings-btn"
              >
                Back to My Listings
              </button>
            </div>
          )}

          {/* TAB 5: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="bg-white rounded-2xl border border-tan/60 p-6 space-y-6">
              <div>
                <h2 className="text-xl font-bold font-serif-display text-ink">Marketplace Analytics</h2>
                <p className="text-sm text-ink-soft">Real-time engagement telemetry across the Middle East marketplace.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-cream-deep/50 border border-tan/40">
                  <p className="text-xs text-ink-soft uppercase font-semibold">Total Views</p>
                  <p className="text-2xl font-bold text-ink mt-1">{totalViews.toLocaleString()}</p>
                  <p className="text-xs text-emerald-600 mt-1">&uarr; 14.8% vs last month</p>
                </div>
                <div className="p-4 rounded-xl bg-cream-deep/50 border border-tan/40">
                  <p className="text-xs text-ink-soft uppercase font-semibold">Buyer Inquiries</p>
                  <p className="text-2xl font-bold text-ink mt-1">{totalInquiries}</p>
                  <p className="text-xs text-emerald-600 mt-1">&uarr; 22.3% conversion</p>
                </div>
                <div className="p-4 rounded-xl bg-cream-deep/50 border border-tan/40">
                  <p className="text-xs text-ink-soft uppercase font-semibold">Avg. Price</p>
                  <p className="text-2xl font-bold text-ink mt-1">AED 446k</p>
                  <p className="text-xs text-ink-soft mt-1">Across 4 models</p>
                </div>
                <div className="p-4 rounded-xl bg-cream-deep/50 border border-tan/40">
                  <p className="text-xs text-ink-soft uppercase font-semibold">Top Location</p>
                  <p className="text-2xl font-bold text-ink mt-1">Dubai</p>
                  <p className="text-xs text-ink-soft mt-1">74% of traffic</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: WALLET / SETTINGS / HELP */}
          {(activeTab === 'wallet' || activeTab === 'settings' || activeTab === 'help') && (
            <div className="bg-white rounded-2xl border border-tan/60 p-8 max-w-2xl">
              <h2 className="text-xl font-bold font-serif-display text-ink capitalize">{activeTab}</h2>
              <p className="text-sm text-ink-soft mt-1 mb-6">
                {activeTab === 'wallet' && 'Zero commission policy. All buyer deals and payments are settled directly between you and the buyer.'}
                {activeTab === 'settings' && 'Configure your dealer notification preferences and showroom branding.'}
                {activeTab === 'help' && 'Need help publishing or managing vehicles? Contact our 24/7 dealer concierges at support@binmardrive.com.'}
              </p>
              <div className="p-4 rounded-xl bg-cream border border-tan/40 text-sm">
                <p className="font-semibold text-ink">Account Status: Active Verified Partner</p>
                <p className="text-ink-soft text-xs mt-1">Commercial partner ID: {currentUser?.id || 'DEALER-7718'}</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ========================================================= */}
      {/* IN-PLACE EDIT LISTING MODAL (Directly updates vehicle)     */}
      {/* ========================================================= */}
      {editingListing && editForm && (
        <div className="seller-modal-backdrop" onClick={() => setEditingListing(null)}>
          <div
            className="seller-modal-card"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="seller-modal-header">
              <div>
                <p className="text-xs uppercase tracking-wider text-gold-deep font-semibold">In-Place Vehicle Editor</p>
                <h2 className="font-serif-display text-xl font-bold text-ink leading-tight">
                  Edit: {editingListing.title}
                </h2>
              </div>
              <button
                className="seller-modal-close"
                onClick={() => setEditingListing(null)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <div className="seller-modal-body space-y-4">
              {/* Photo Manager */}
              <div>
                <label className="seller-form-label mb-2 flex items-center justify-between">
                  <span>Vehicle Photos ({editForm.images?.length || 0})</span>
                  <span className="text-xs text-ink-soft font-normal">Cover photo is first</span>
                </label>

                {/* Thumbnails row */}
                <div className="flex flex-wrap gap-2.5 mb-3">
                  {editForm.images?.map((url, idx) => (
                    <div key={idx} className="relative w-20 h-16 rounded-lg overflow-hidden border border-tan/60 group">
                      <img src={url} alt={`car-${idx}`} className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute bottom-0 left-0 right-0 bg-gold text-white text-[9px] text-center font-bold">
                          COVER
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setEditForm({
                            ...editForm,
                            images: editForm.images.filter((_, i) => i !== idx)
                          });
                        }}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow"
                        title="Remove photo"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Photo Inputs */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Paste image URL..."
                    value={editImageInput}
                    onChange={e => setEditImageInput(e.target.value)}
                    className="seller-form-input text-xs flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (editImageInput.trim()) {
                        setEditForm({
                          ...editForm,
                          images: [...(editForm.images || []), editImageInput.trim()]
                        });
                        setEditImageInput('');
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-cream-deep border border-tan/60 text-xs font-semibold text-ink hover:border-gold"
                  >
                    Add URL
                  </button>

                  <input
                    type="file"
                    ref={editFileInputRef}
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || []);
                      if (!files.length) return;
                      setIsUploadingEditPhoto(true);
                      try {
                        const res = await uploadListingPhotos(files);
                        if (res && res.images) {
                          setEditForm(prev => ({
                            ...prev,
                            images: [...(prev.images || []), ...res.images]
                          }));
                          notify(`Uploaded ${files.length} photo(s).`);
                        }
                      } catch {
                        notify('Error uploading photo.');
                      } finally {
                        setIsUploadingEditPhoto(false);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => editFileInputRef.current?.click()}
                    disabled={isUploadingEditPhoto}
                    className="px-3 py-1.5 rounded-lg bg-gold text-white text-xs font-semibold flex items-center gap-1 hover:bg-gold-deep"
                  >
                    <Upload size={13} /> {isUploadingEditPhoto ? 'Uploading...' : 'Upload File'}
                  </button>
                </div>
              </div>

              {/* Grid Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className="seller-form-label">Make</label>
                  <select
                    value={editForm.make}
                    onChange={e => setEditForm({ ...editForm, make: e.target.value })}
                    className="seller-form-input"
                  >
                    {VEHICLE_MAKES.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="seller-form-label">Model</label>
                  <input
                    type="text"
                    required
                    value={editForm.model}
                    onChange={e => setEditForm({ ...editForm, model: e.target.value })}
                    className="seller-form-input"
                  />
                </div>

                <div>
                  <label className="seller-form-label">Year</label>
                  <input
                    type="number"
                    min="1990"
                    max="2027"
                    value={editForm.year}
                    onChange={e => setEditForm({ ...editForm, year: e.target.value })}
                    className="seller-form-input"
                  />
                </div>

                <div>
                  <label className="seller-form-label">Price</label>
                  <input
                    type="number"
                    required
                    value={editForm.price}
                    onChange={e => setEditForm({ ...editForm, price: e.target.value })}
                    className="seller-form-input"
                  />
                </div>

                <div>
                  <label className="seller-form-label">Currency</label>
                  <select
                    value={editForm.currency || 'AED'}
                    onChange={e => setEditForm({ ...editForm, currency: e.target.value })}
                    className="seller-form-input"
                  >
                    {GCC_CURRENCIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="seller-form-label">Listing Type</label>
                  <select
                    value={editForm.listing_type || 'sale'}
                    onChange={e => setEditForm({ ...editForm, listing_type: e.target.value })}
                    className="seller-form-input"
                  >
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                  </select>
                </div>

                <div>
                  <label className="seller-form-label">Condition</label>
                  <select
                    value={editForm.condition_type || 'used'}
                    onChange={e => setEditForm({ ...editForm, condition_type: e.target.value })}
                    className="seller-form-input"
                  >
                    <option value="new">Brand New</option>
                    <option value="used">Pre-Owned</option>
                  </select>
                </div>

                <div>
                  <label className="seller-form-label">Category</label>
                  <select
                    value={editForm.category || 'SUV'}
                    onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                    className="seller-form-input"
                  >
                    {VEHICLE_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="seller-form-label">Fuel</label>
                  <select
                    value={editForm.fuel || 'Petrol'}
                    onChange={e => setEditForm({ ...editForm, fuel: e.target.value })}
                    className="seller-form-input"
                  >
                    {FUEL_TYPES.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="seller-form-label">Transmission</label>
                  <select
                    value={editForm.transmission || 'Automatic'}
                    onChange={e => setEditForm({ ...editForm, transmission: e.target.value })}
                    className="seller-form-input"
                  >
                    {TRANSMISSION_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="seller-form-label">Mileage (km)</label>
                  <input
                    type="text"
                    value={editForm.mileage}
                    onChange={e => setEditForm({ ...editForm, mileage: e.target.value })}
                    placeholder="e.g. 15000"
                    className="seller-form-input"
                  />
                </div>

                <div>
                  <label className="seller-form-label">City / Location</label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={e => setEditForm({ ...editForm, city: e.target.value })}
                    placeholder="Dubai"
                    className="seller-form-input"
                  />
                </div>

                <div>
                  <label className="seller-form-label">Country</label>
                  <select
                    value={editForm.country || 'United Arab Emirates'}
                    onChange={e => setEditForm({ ...editForm, country: e.target.value })}
                    className="seller-form-input"
                  >
                    {GCC_COUNTRIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="seller-form-label">WhatsApp Contact Number</label>
                  <input
                    type="text"
                    value={editForm.whatsapp_number}
                    onChange={e => setEditForm({ ...editForm, whatsapp_number: e.target.value })}
                    placeholder="+971 50 123 4567"
                    className="seller-form-input"
                  />
                </div>

                <div>
                  <label className="seller-form-label">Status</label>
                  <select
                    value={editForm.status || 'approved'}
                    onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                    className="seller-form-input"
                  >
                    <option value="approved">Published (Live)</option>
                    <option value="pending">Pending Admin Review</option>
                    <option value="draft">Draft (Private)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="seller-form-label">Vehicle Description</label>
                <textarea
                  rows={3}
                  value={editForm.description || ''}
                  onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Key features, service history, GCC warranty details..."
                  className="seller-form-textarea"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="seller-modal-footer">
              <button
                type="button"
                className="seller-modal-cancel-btn"
                onClick={() => setEditingListing(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSavingEdit}
                className="seller-modal-save-btn"
                onClick={handleSaveListingEdit}
              >
                {isSavingEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* QUICK ADD LISTING MODAL                                   */}
      {/* ========================================================= */}
      {showAddModal && (
        <div className="seller-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div
            className="seller-modal-card"
            style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="seller-modal-header" style={{ flexShrink: 0 }}>
              <div>
                <p className="text-xs uppercase tracking-wider text-gold-deep font-semibold">Seller Studio</p>
                <h2 className="font-serif-display text-xl font-bold text-ink">Publish New Listing</h2>
              </div>
              <button className="seller-modal-close" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleQuickAddSubmit}
              style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}
            >
              <div
                className="seller-modal-body space-y-4"
                style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="seller-form-label">Make</label>
                    <select
                      value={addForm.make}
                      onChange={e => setAddForm({ ...addForm, make: e.target.value })}
                      className="seller-form-input"
                    >
                      {VEHICLE_MAKES.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="seller-form-label">Model</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Land Cruiser, Patrol, G63"
                      value={addForm.model}
                      onChange={e => setAddForm({ ...addForm, model: e.target.value })}
                      className="seller-form-input"
                    />
                  </div>

                  <div>
                    <label className="seller-form-label">Year</label>
                    <input
                      type="number"
                      min="1990"
                      max="2027"
                      value={addForm.year}
                      onChange={e => setAddForm({ ...addForm, year: e.target.value })}
                      className="seller-form-input"
                    />
                  </div>

                  <div>
                    <label className="seller-form-label">Price</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 185000"
                      value={addForm.price}
                      onChange={e => setAddForm({ ...addForm, price: e.target.value })}
                      className="seller-form-input"
                    />
                  </div>

                  <div>
                    <label className="seller-form-label">Listing Type</label>
                    <select
                      value={addForm.listing_type}
                      onChange={e => setAddForm({ ...addForm, listing_type: e.target.value })}
                      className="seller-form-input"
                    >
                      <option value="sale">For Sale</option>
                      <option value="rent">For Rent</option>
                    </select>
                  </div>

                  <div>
                    <label className="seller-form-label">Condition</label>
                    <select
                      value={addForm.condition_type}
                      onChange={e => setAddForm({ ...addForm, condition_type: e.target.value })}
                      className="seller-form-input"
                    >
                      <option value="new">Brand New</option>
                      <option value="used">Pre-Owned</option>
                    </select>
                  </div>

                  <div>
                    <label className="seller-form-label">Category</label>
                    <select
                      value={addForm.category}
                      onChange={e => setAddForm({ ...addForm, category: e.target.value })}
                      className="seller-form-input"
                    >
                      {VEHICLE_CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="seller-form-label">City</label>
                    <input
                      type="text"
                      value={addForm.city}
                      onChange={e => setAddForm({ ...addForm, city: e.target.value })}
                      placeholder="Dubai"
                      className="seller-form-input"
                    />
                  </div>

                  <div>
                    <label className="seller-form-label">WhatsApp Contact</label>
                    <input
                      type="text"
                      value={addForm.whatsapp_number}
                      onChange={e => setAddForm({ ...addForm, whatsapp_number: e.target.value })}
                      placeholder="+971 50 123 4567"
                      className="seller-form-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="seller-form-label">Description</label>
                  <textarea
                    rows={2}
                    value={addForm.description}
                    onChange={e => setAddForm({ ...addForm, description: e.target.value })}
                    placeholder="Optional specs, warranty, features..."
                    className="seller-form-textarea"
                  />
                </div>

                {/* Photos Upload */}
                <div>
                  <div className="flex items-center justify-between mb-1.5" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label className="seller-form-label mb-0" style={{ margin: 0 }}>Vehicle Photos ({addForm.images.length})</label>
                    <button
                      type="button"
                      className="text-xs font-semibold text-gold-deep hover:underline flex items-center gap-1"
                      style={{ background: 'none', border: 'none', color: '#c6a15b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600 }}
                      onClick={() => addPhotoInputRef.current?.click()}
                    >
                      <Camera size={14} /> Add Photos
                    </button>
                  </div>

                  <input
                    type="file"
                    ref={addPhotoInputRef}
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleAddPhotos}
                  />

                  {addForm.images.length > 0 ? (
                    <div className="seller-photo-preview-grid">
                      {addForm.images.map((img, idx) => (
                        <div key={idx} className="seller-photo-thumb">
                          <img src={img} alt={`Upload ${idx}`} />
                          <button
                            type="button"
                            className="seller-photo-delete-btn"
                            title="Remove photo"
                            onClick={() => handleRemoveAddPhoto(idx)}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="seller-photo-add-btn"
                        title="Add more photos"
                        onClick={() => addPhotoInputRef.current?.click()}
                      >
                        <Plus size={18} />
                        <span>Add More</span>
                      </button>
                    </div>
                  ) : (
                    <div
                      style={{
                        border: '2px dashed #cbd5e1',
                        borderRadius: '12px',
                        padding: '16px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: '#ffffff',
                        transition: 'border-color 0.2s'
                      }}
                      onClick={() => addPhotoInputRef.current?.click()}
                    >
                      <Camera size={26} style={{ margin: '0 auto 6px', color: '#c6a15b', display: 'block' }} />
                      <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>Click to Upload Vehicle Photos</p>
                      <p style={{ margin: '3px 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>Select one or multiple photos (Exterior, Interior, Dashboard)</p>
                    </div>
                  )}
                </div>

                {/* Mulkiya / Vehicle Registration Document Upload */}
                <div>
                  <label className="seller-form-label">Vehicle Registration / Mulkiya (Official Verification Document)</label>
                  <input
                    type="file"
                    ref={addDocInputRef}
                    accept=".pdf,image/*"
                    style={{ display: 'none' }}
                    onChange={handleAddDoc}
                  />
                  <div
                    style={{
                      border: '1px dashed #6ee7b7',
                      background: 'rgba(236, 253, 245, 0.6)',
                      borderRadius: '10px',
                      padding: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer'
                    }}
                    onClick={() => addDocInputRef.current?.click()}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FileText size={22} style={{ color: '#047857', flexShrink: 0 }} />
                      <div>
                        <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#064e3b' }}>
                          {addForm.document_name ? `Attached: ${addForm.document_name}` : 'Attach Mulkiya / Registration Document (PDF / JPG)'}
                        </p>
                        <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: '#047857' }}>
                          {addForm.document_name ? 'Document ready for admin review' : 'Inspected by admin before approval'}
                        </p>
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: '#065f46',
                      background: '#fff',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      border: '1px solid #a7f3d0'
                    }}>
                      {addForm.document_name ? 'Change File' : 'Browse File'}
                    </span>
                  </div>
                </div>

                {/* Admin Moderation Notice */}
                <div style={{
                  background: '#fefce8',
                  border: '1px solid #fef08a',
                  borderRadius: '10px',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}>
                  <ShieldCheck size={18} style={{ color: '#a16207', flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ fontSize: '0.8rem', color: '#713f12', lineHeight: '1.4' }}>
                    <span style={{ fontWeight: 700 }}>Administrative Approval Required:</span> Your listing and uploaded documents will be reviewed by the admin operations team. Once verified and approved, it will be published live to the marketplace.
                  </div>
                </div>
              </div>

              <div className="seller-modal-footer" style={{ flexShrink: 0 }}>
                <button
                  type="button"
                  className="seller-modal-cancel-btn"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="seller-modal-save-btn flex items-center gap-1.5"
                  style={{ background: 'var(--gold, #D4AF37)', color: '#0A2A1F', fontWeight: 700 }}
                >
                  <ShieldCheck size={16} /> Submit for Admin Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
