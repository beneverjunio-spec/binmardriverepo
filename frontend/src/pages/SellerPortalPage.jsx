import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  AlertTriangle,
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
import { sendAdminEmailNotification, sendSellerEmailNotification } from '../api/email';
import { apiRequest } from '../api/client';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import { useLanguage } from '../context/LanguageContext';

// Helper to compress images on the client side to keep uploads fast and avoid localStorage quota errors
function compressImage(file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) {
  return new Promise((resolve) => {
    if (!file) return resolve(null);
    if (file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

// Resilient localStorage saver that automatically handles quota limits
function safeSaveListings(newItems) {
  try {
    localStorage.setItem('binmar_custom_listings', JSON.stringify(newItems));
    return true;
  } catch (err) {
    console.warn('[Storage] Quota limit encountered. Compacting older entries...', err);
    try {
      const optimized = newItems.slice(0, 15).map((item, idx) => {
        if (idx < 2) return item;
        return {
          ...item,
          images: Array.isArray(item.images)
            ? item.images.map(img => (typeof img === 'string' && img.startsWith('data:')) ? 'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?w=800&auto=format&fit=crop' : img)
            : [],
          document_url: null
        };
      });
      localStorage.setItem('binmar_custom_listings', JSON.stringify(optimized));
      return true;
    } catch (e2) {
      console.warn('[Storage] Trimming to minimal entries...', e2);
      try {
        const minimal = newItems.slice(0, 5).map(item => ({
          ...item,
          images: [],
          document_url: null
        }));
        localStorage.setItem('binmar_custom_listings', JSON.stringify(minimal));
        return true;
      } catch (e3) {
        console.error('[Storage] Local storage full:', e3);
        return false;
      }
    }
  }
}

export default function SellerPortalPage({
  currentUser,
  setCurrentUser,
  setCurrentPage,
  notify,
  onRefreshListings,
  onOpenCreateListing
}) {
  const { t, isRTL } = useLanguage();
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
  const [editWasRejected, setEditWasRejected] = useState(false);
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

  const handleAddPhotos = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    for (const file of files) {
      try {
        const compressedUrl = await compressImage(file, 1200, 1200, 0.8);
        if (compressedUrl) {
          setAddForm(prev => ({
            ...prev,
            images: [...prev.images, compressedUrl]
          }));
        }
      } catch (err) {
        console.warn('Could not compress photo:', err);
      }
    }
    notify(`${files.length} photo(s) attached!`);
  };

  const handleRemoveAddPhoto = (index) => {
    setAddForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleAddDoc = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const docUrl = await compressImage(file, 1600, 1600, 0.85);
      setAddForm(prev => ({
        ...prev,
        document_name: file.name,
        document_file: file.name,
        document_url: docUrl
      }));
      notify(`Document attached: ${file.name}`);
    } catch (err) {
      console.warn('Could not read document:', err);
    }
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
  const loadSellerData = async () => {
    let allCustom = [];
    const currentUserName = (currentUser?.name || '').toLowerCase();
    const currentUserCompany = (currentUser?.company_name || '').toLowerCase();
    const currentUserEmail = (currentUser?.email || '').toLowerCase();
    const sellerParam = currentUserEmail || currentUserCompany || currentUserName;

    // 1. Fetch online seller listings from server database (primary source - works across all devices)
    try {
      if (currentUserEmail) {
        // Query by email first (most reliable identifier)
        const res = await fetch(`/api/seller/listings?seller=${encodeURIComponent(currentUserEmail)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.success && Array.isArray(data.listings)) {
            allCustom = data.listings.filter(item => !isTestData(item));
          }
        }
      }

      // Also try querying by seller name / company name if email gave no results
      if (allCustom.length === 0 && (currentUserName || currentUserCompany)) {
        const nameParam = currentUserCompany || currentUserName;
        const res = await fetch(`/api/seller/listings?seller=${encodeURIComponent(nameParam)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.success && Array.isArray(data.listings)) {
            const byName = data.listings.filter(item => !isTestData(item));
            for (const item of byName) {
              if (!allCustom.some(c => String(c.id) === String(item.id))) {
                allCustom.push(item);
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn('API seller listings fetch note:', e.message);
    }

    // 2. Merge with local custom listings (covers offline/pending submissions on this device)
    try {
      const raw = localStorage.getItem('binmar_custom_listings');
      if (raw) {
        const parsed = JSON.parse(raw);
        const localItems = parsed.filter(item => {
          if (isTestData(item)) return false;
          const sName = (item.seller_name || '').toLowerCase();
          const sEmail = (item.seller_email || '').toLowerCase();
          return (
            !sellerParam ||
            sName === currentUserName ||
            (currentUserCompany && sName === currentUserCompany) ||
            (currentUserEmail && sEmail === currentUserEmail)
          );
        });
        localItems.forEach(item => {
          const matchIdx = allCustom.findIndex(c =>
            String(c.id) === String(item.id) ||
            ((c.title || '').trim().toLowerCase() === (item.title || '').trim().toLowerCase() &&
             Number(c.price) === Number(item.price))
          );
          if (matchIdx !== -1) {
            // Prefer server data from database, preserving any local document attachments and status
            allCustom[matchIdx] = {
              ...item,
              ...allCustom[matchIdx],
              sale_status: allCustom[matchIdx].sale_status || item.sale_status || 'available',
              sold_at: allCustom[matchIdx].sold_at || item.sold_at || null,
              disabled: allCustom[matchIdx].disabled !== undefined ? allCustom[matchIdx].disabled : item.disabled,
              document_url: allCustom[matchIdx].document_url || item.document_url || null,
              document_file: allCustom[matchIdx].document_file || item.document_file || null
            };
          } else {
            allCustom.push(item);
          }
        });
      }
    } catch {
      if (!allCustom.length) allCustom = [];
    }

    let deletedIds = [];
    try {
      const rawDel = localStorage.getItem('binmar_deleted_listings');
      if (rawDel) deletedIds = JSON.parse(rawDel);
    } catch {}

    const matchedListings = allCustom.filter(item => {
      if (deletedIds.includes(String(item.id))) return false;
      if (isTestData(item)) return false;
      return true;
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
  const rejectedCount = sellerListings.filter(l => l.status === 'rejected').length;

  const totalViews = sellerListings.reduce((sum, l) => sum + (Number(l.views) || 240), 0);
  const totalInquiries = sellerListings.reduce((sum, l) => sum + (Number(l.inquiries) || 12), 0);

  // In-place Edit action
  const handleStartEdit = (listing, e) => {
    if (e) e.stopPropagation();
    setEditingListing(listing);
    setEditWasRejected(listing.status === 'rejected');
    setEditForm({
      ...listing,
      price: listing.price || '',
      mileage: listing.mileage ? String(listing.mileage).replace(' km', '') : '',
      images: Array.isArray(listing.images) ? [...listing.images] : []
    });
  };

  const handleSaveListingEdit = async () => {
    if (!editForm.model || !editForm.price) {
      notify('Please enter both vehicle model and price.');
      return;
    }
    setIsSavingEdit(true);

    try {
      const wasRejected = editWasRejected || editingListing?.status === 'rejected';
      const updatedItem = {
        ...editingListing,
        ...editForm,
        title: `${editForm.year} ${editForm.make} ${editForm.model}`,
        price: Number(editForm.price),
        mileage: editForm.mileage ? (String(editForm.mileage).includes('km') ? editForm.mileage : `${editForm.mileage} km`) : '0 km',
        location: `${editForm.city || 'Dubai'}, ${editForm.country || 'United Arab Emirates'}`,
        updated_at: new Date().toISOString(),
        // All resubmitted or edited listings MUST enter Admin Moderation Queue first
        status: 'pending',
        resubmitted: true,
        resubmitted_at: new Date().toISOString(),
        previous_rejection_reason: editingListing.rejection_reason || editingListing.previous_rejection_reason || null,
        rejection_reason: null
      };

      // Remove from resolved moderation list so admin moderation queue displays it immediately
      try {
        const rawRes = localStorage.getItem('binmar_resolved_moderation');
        if (rawRes) {
          const resList = JSON.parse(rawRes);
          const filteredRes = resList.filter(rid => String(rid) !== String(editingListing.id));
          localStorage.setItem('binmar_resolved_moderation', JSON.stringify(filteredRes));
        }
      } catch {}

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

      // Send admin notification
      try {
        const notifRaw = localStorage.getItem('binmar_admin_notifications');
        const notifs = notifRaw ? JSON.parse(notifRaw) : [];
        notifs.unshift({
          id: Date.now(),
          title: wasRejected ? 'Listing Resubmitted for Moderation' : 'Listing Updated - Pending Moderation',
          message: `"${updatedItem.title}" has been updated by ${updatedItem.seller_name || 'Seller'} and submitted to the Moderation Queue for admin approval before publishing.`,
          is_read: false,
          created_at: new Date().toISOString()
        });
        localStorage.setItem('binmar_admin_notifications', JSON.stringify(notifs));
      } catch {}

      // Synchronize with backend API
      try {
        await apiRequest(`/api/listings/${editingListing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedItem)
        });
      } catch (err) {
        console.warn('Backend update sync note:', err.message);
      }

      // Update state
      setSellerListings(prev => prev.map(l => (String(l.id) === String(editingListing.id) ? updatedItem : l)));
      setEditingListing(null);
      setEditForm(null);
      setEditWasRejected(false);
            // Send notification emails for listing update
      const sellerMail = updatedItem.seller_email || (currentUser ? currentUser.email : '');
      sendAdminEmailNotification({
        subject: 'New Listing Submitted',
        title: 'New Listing Submitted',
        message: 'A seller has submitted a new vehicle listing. Please review and approve or reject the listing.',
        details: {
          'Vehicle Title': updatedItem.title,
          'Make & Model': `${updatedItem.make} ${updatedItem.model} (${updatedItem.year})`,
          'Listing Type': (updatedItem.listing_type || updatedItem.type) === 'rent' ? 'For Rent' : 'For Sale',
          'Price': `${updatedItem.currency || 'AED'} ${Number(updatedItem.price).toLocaleString()}`,
          'Seller Name': updatedItem.seller_name || (currentUser ? (currentUser.company_name || currentUser.name) : 'Seller'),
          'Seller Email': sellerMail || 'N/A',
          'Location': `${updatedItem.city || 'Dubai'}, ${updatedItem.country || 'UAE'}`,
          'Status': 'Pending Verification',
          'Updated At': new Date().toLocaleString()
        },
        actionUrl: 'https://binmardrive.binmargroup.com/admin'
      }).catch(e => console.warn(e));

      if (sellerMail) {
        sendSellerEmailNotification({
          to: sellerMail,
          subject: 'Listing Submitted — Pending Approval',
          title: 'Listing Submitted — Pending Approval',
          message: `Hello Seller,\n\nThank you for submitting your vehicle listing to BinmarDrive.\n\nYour listing has been successfully submitted and is currently pending admin review. You will be notified once it has been approved or rejected.\n\nBest regards,\nBinmarDrive Team`,
          details: {
            'Vehicle': updatedItem.title,
            'Price': `${updatedItem.currency || 'AED'} ${Number(updatedItem.price).toLocaleString()}`,
            'Status': 'Under Moderation Review',
            'Support Email': 'info@binmargroup.com'
          },
          actionUrl: 'https://binmardrive.binmargroup.com/seller'
        }).catch(e => console.warn(e));
      }

      notify(`"${updatedItem.title}" submitted to Admin Moderation Queue! Admin approval is required before it goes live.`);
      if (onRefreshListings) onRefreshListings();
    } catch {
      notify('Failed to save listing changes. Please try again.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Toggle Sold / Rented Status
  const handleToggleSoldStatus = async (listing, e) => {
    if (e) e.stopPropagation();
    const isRent = (listing.listing_type || listing.type) === 'rent';
    const isCurrentlySoldOrRented = listing.sale_status === 'sold' || listing.sale_status === 'rented';
    const targetStatus = isCurrentlySoldOrRented ? 'available' : (isRent ? 'rented' : 'sold');
    const label = targetStatus === 'available' ? 'Available' : (isRent ? 'Rented' : 'Sold');

    try {
      const updatedItem = {
        ...listing,
        sale_status: targetStatus,
        sold_at: targetStatus !== 'available' ? new Date().toISOString() : null
      };

      // 1. Sync directly to backend API & cloud database
      try {
        await apiRequest(`/api/listings/${listing.id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sale_status: targetStatus,
            sold_at: updatedItem.sold_at
          })
        });
      } catch (apiErr) {
        console.warn('API listing status update note:', apiErr);
      }

      // 2. Post notification directly to online database for Admin Portal
      if (targetStatus !== 'available') {
        const notifTitle = isRent ? 'Vehicle Marked as Rented' : 'Vehicle Marked as Sold';
        const notifMsg = `${listing.title || 'Vehicle'} has been marked as ${targetStatus.toUpperCase()} by seller ${sellerDisplayName} (${listing.city || 'Dubai'}, ${listing.country || 'UAE'}).`;
        try {
          await apiRequest('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: notifTitle,
              message: notifMsg
            })
          });
        } catch (nErr) {
          console.warn('API notification note:', nErr);
        }

        // Also update local notifications cache
        try {
          const notifRaw = localStorage.getItem('binmar_admin_notifications');
          const existingNotifs = notifRaw ? JSON.parse(notifRaw) : [];
          const newNotif = {
            id: Date.now(),
            title: notifTitle,
            message: notifMsg,
            is_read: false,
            created_at: new Date().toISOString()
          };
          localStorage.setItem('binmar_admin_notifications', JSON.stringify([newNotif, ...existingNotifs.slice(0, 30)]));
        } catch {}
      }

      // 3. Update in local storage cache
      const raw = localStorage.getItem('binmar_custom_listings');
      if (raw) {
        const items = JSON.parse(raw);
        const updated = items.map(l => String(l.id) === String(listing.id) ? { ...l, ...updatedItem } : l);
        safeSaveListings(updated);
      }

      // 4. Update UI state immediately
      setSellerListings(prev => prev.map(l => String(l.id) === String(listing.id) ? { ...l, ...updatedItem } : l));
      notify(`Listing marked as ${label}! Admin notified.`);
      if (onRefreshListings) onRefreshListings();
      window.dispatchEvent(new Event('binmar_listings_updated'));
    } catch (err) {
      notify(err.message || 'Unable to update status.');
    }
  };

  const handleDeleteListing = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this listing from your studio?')) return;

    try {
      // 1. Delete from online database via API
      try {
        await apiRequest(`/api/listings/${id}`, { method: 'DELETE' });
      } catch (apiErr) {
        console.warn('API delete listing note:', apiErr);
      }

      // 2. Add to local deleted IDs cache
      let deleted = [];
      const rawDel = localStorage.getItem('binmar_deleted_listings');
      if (rawDel) deleted = JSON.parse(rawDel);
      if (!deleted.includes(String(id))) {
        deleted.push(String(id));
        localStorage.setItem('binmar_deleted_listings', JSON.stringify(deleted));
      }

      // 3. Remove from custom listings cache
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
      document_url: addForm.document_url || null,
      views: 0,
      inquiries: 0,
      status: 'pending', // PENDING: All seller listings must be approved by admin!
      created_at: new Date().toISOString()
    };

    // 1. Submit to backend API
    try {
      const res = await apiRequest('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVehicle)
      });
      if (res && res.id) {
        newVehicle.id = res.id;
      }
    } catch (apiErr) {
      console.warn('[API] Queued vehicle locally for admin moderation:', apiErr);
    }

    // 2. Persist in local storage safely without quota crashes
    try {
      const raw = localStorage.getItem('binmar_custom_listings');
      const existing = raw ? JSON.parse(raw) : [];
      const filtered = existing.filter(l => String(l.id) !== String(newVehicle.id));
      safeSaveListings([newVehicle, ...filtered]);
    } catch (storageErr) {
      console.warn('[Storage] Could not write to local storage:', storageErr);
    }

    // 3. Notify Admin Portal
    try {
      const notifRaw = localStorage.getItem('binmar_admin_notifications');
      const existingNotifs = notifRaw ? JSON.parse(notifRaw) : [];
      const newNotif = {
        id: Date.now(),
        title: 'New Vehicle Pending Review',
        message: `${newVehicle.title} submitted by ${newVehicle.seller_name} (${newVehicle.city}, ${newVehicle.country}) and is waiting in the Moderation Queue for review.`,
        is_read: false,
        created_at: new Date().toISOString()
      };
      localStorage.setItem('binmar_admin_notifications', JSON.stringify([newNotif, ...existingNotifs.slice(0, 30)]));
    } catch (notifErr) {
      console.warn('[Notifications] Could not save admin notification:', notifErr);
    }

    // 4. Update UI state immediately
    setSellerListings(prev => [newVehicle, ...prev.filter(l => String(l.id) !== String(newVehicle.id))]);
        // Send notification emails for new vehicle submitted in Seller Studio
    const newSellerMail = newVehicle.seller_email || (currentUser ? currentUser.email : '');
    sendAdminEmailNotification({
      subject: 'New Listing Submitted',
      title: 'New Listing Submitted',
      message: 'A seller has submitted a new vehicle listing. Please review and approve or reject the listing.',
      details: {
        'Vehicle Title': newVehicle.title,
        'Make & Model': `${newVehicle.make} ${newVehicle.model} (${newVehicle.year})`,
        'Listing Type': newVehicle.listing_type === 'rent' ? 'For Rent' : 'For Sale',
        'Price': `${newVehicle.currency} ${Number(newVehicle.price).toLocaleString()}`,
        'Seller Name': newVehicle.seller_name,
        'Seller Email': newSellerMail || 'N/A',
        'Contact WhatsApp': newVehicle.whatsapp_number || 'N/A',
        'Location': `${newVehicle.city}, ${newVehicle.country}`,
        'Submission Time': new Date().toLocaleString()
      },
      actionUrl: 'https://binmardrive.binmargroup.com/admin'
    }).catch(e => console.warn(e));

    if (newSellerMail) {
      sendSellerEmailNotification({
        to: newSellerMail,
        subject: 'Listing Submitted — Pending Approval',
        title: 'Listing Submitted — Pending Approval',
        message: `Hello Seller,\n\nThank you for submitting your vehicle listing to BinmarDrive.\n\nYour listing has been successfully submitted and is currently pending admin review. You will be notified once it has been approved or rejected.\n\nBest regards,\nBinmarDrive Team`,
        details: {
          'Vehicle Title': newVehicle.title,
          'Price': `${newVehicle.currency} ${Number(newVehicle.price).toLocaleString()}`,
          'Type': newVehicle.listing_type === 'rent' ? 'For Rent' : 'For Sale',
          'Location': `${newVehicle.city}, ${newVehicle.country}`,
          'Status': 'Pending Moderation Approval',
          'Support Email': 'info@binmargroup.com'
        },
        actionUrl: 'https://binmardrive.binmargroup.com/seller'
      }).catch(e => console.warn(e));
    }

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
      document_file: '',
      document_url: null
    });

    notify(`Listing "${newVehicle.title}" submitted to Admin Moderation! Once verified & approved, it will be published live.`);
    if (onRefreshListings) onRefreshListings();
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
            <span className="seller-brand-title">{sellerDisplayName}</span>
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
          <p className="seller-nav-section-title">{isRTL ? 'الرئيسية' : 'Main'}</p>
          <ul className="seller-nav-list">
            <li>
              <button
                className={`seller-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
              >
                <LayoutDashboard size={18} className="seller-nav-icon" />
                <span className="seller-nav-label">{t('admin_tab_dashboard')}</span>
              </button>
            </li>
            <li>
              <button
                className={`seller-nav-item ${activeTab === 'listings' ? 'active' : ''}`}
                onClick={() => { setActiveTab('listings'); setMobileMenuOpen(false); }}
              >
                {activeTab === 'listings' && <span className="seller-active-indicator" />}
                <Car size={18} className="seller-nav-icon" />
                <span className="seller-nav-label">{t('studio_my_listings')}</span>
                <span className="seller-nav-badge">{publishedCount + pendingCount}</span>
              </button>
            </li>
            <li>
              <button
                className={`seller-nav-item ${activeTab === 'add-listing' ? 'active' : ''}`}
                onClick={() => { setShowAddModal(true); setMobileMenuOpen(false); }}
              >
                <PlusCircle size={18} className="seller-nav-icon" />
                <span className="seller-nav-label">{t('studio_add_listing')}</span>
              </button>
            </li>
            <li>
              <button
                className={`seller-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => { setActiveTab('orders'); setMobileMenuOpen(false); }}
              >
                {activeTab === 'orders' && <span className="seller-active-indicator" />}
                <Tag size={18} className="seller-nav-icon" />
                <span className="seller-nav-label">{t('studio_orders')}</span>
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
                <span className="seller-nav-label">{t('studio_messages')}</span>
                <span className="seller-nav-badge">5</span>
              </button>
            </li>
            <li>
              <button
                className={`seller-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
                onClick={() => { setActiveTab('analytics'); setMobileMenuOpen(false); }}
              >
                <BarChart3 size={18} className="seller-nav-icon" />
                <span className="seller-nav-label">{t('studio_analytics')}</span>
              </button>
            </li>
          </ul>

          <p className="seller-nav-section-title mt-6">{isRTL ? 'الحساب' : 'Account'}</p>
          <ul className="seller-nav-list">
            <li>
              <button
                className={`seller-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => { setActiveTab('profile'); setMobileMenuOpen(false); }}
              >
                {activeTab === 'profile' && <span className="seller-active-indicator" />}
                <User size={18} className="seller-nav-icon" />
                <span className="seller-nav-label">{t('studio_profile')}</span>
              </button>
            </li>
            <li>
              <button
                className={`seller-nav-item ${activeTab === 'wallet' ? 'active' : ''}`}
                onClick={() => { setActiveTab('wallet'); setMobileMenuOpen(false); }}
              >
                {activeTab === 'wallet' && <span className="seller-active-indicator" />}
                <Wallet size={18} className="seller-nav-icon" />
                <span className="seller-nav-label">{t('studio_wallet')}</span>
              </button>
            </li>
            <li>
              <button
                className={`seller-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }}
              >
                {activeTab === 'settings' && <span className="seller-active-indicator" />}
                <Settings size={18} className="seller-nav-icon" />
                <span className="seller-nav-label">{t('studio_settings')}</span>
              </button>
            </li>
            <li>
              <button
                className={`seller-nav-item ${activeTab === 'help' ? 'active' : ''}`}
                onClick={() => { setActiveTab('help'); setMobileMenuOpen(false); }}
              >
                {activeTab === 'help' && <span className="seller-active-indicator" />}
                <HelpCircle size={18} className="seller-nav-icon" />
                <span className="seller-nav-label">{t('studio_help')}</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* Upgrade Card */}
        <div className="seller-upgrade-card">
          <div className="seller-card-dec1" />
          <div className="seller-card-dec2" />
          <p className="seller-card-tag">{t('studio_premium_tag')}</p>
          <p className="seller-card-title">{t('studio_premium_title')}</p>
          <p className="seller-card-desc">{t('studio_premium_desc')}</p>
          <button
            className="seller-upgrade-btn"
            onClick={() => notify('Premium dealer boost feature active for verified accounts.')}
          >
            {t('studio_upgrade_btn')} <ChevronRight size={14} />
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
              {t('studio_verified_seller')}
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
            <img src="/binmardrive-logo-transparent.png" alt="Binmar Drive Logo" className="w-8 h-8 rounded-full object-contain bg-emerald-950 border border-gold/40" />
            <span className="font-bold text-ink">BINMAR <b>STUDIO</b></span>
          </div>
          <button
            className="text-xs font-semibold text-gold-deep px-2.5 py-1 rounded-md bg-cream-deep border border-tan/60"
            onClick={() => setCurrentPage('marketplace')}
          >
            {t('studio_mobile_marketplace')}
          </button>
        </div>

        {/* Top Header */}
        {activeTab !== 'orders' && activeTab !== 'messages' && (
          <header className="seller-top-header">
          <div className="seller-header-inner">
            <div>
              <p className="seller-header-kicker">{t('studio_header_kicker')}</p>
              <h1 className="seller-header-title">
                {activeTab === 'listings' && t('studio_tab_listings_title')}
                {activeTab === 'dashboard' && t('studio_tab_dashboard_title')}
                {activeTab === 'profile' && t('studio_tab_profile_title')}
                {activeTab === 'analytics' && t('studio_tab_analytics_title')}
                {activeTab === 'inquiries' && t('studio_tab_inquiries_title')}
                {activeTab === 'wallet' && t('studio_tab_wallet_title')}
                {activeTab === 'settings' && t('studio_tab_settings_title')}
                {activeTab === 'help' && t('studio_tab_help_title')}
              </h1>
              <p className="seller-header-subtitle">
                {activeTab === 'listings'
                  ? t('studio_listings_subtitle')
                  : t('studio_manage_subtitle')}
              </p>
            </div>

            <div className="seller-header-actions">
              {activeTab === 'listings' && (
                <div className="seller-search-box">
                  <Search size={16} className="seller-search-icon" />
                  <input
                    type="text"
                    placeholder={t('studio_search_placeholder')}
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

              <LanguageSwitcher />

              <button
                className="seller-new-listing-btn"
                onClick={() => setShowAddModal(true)}
              >
                <Plus size={16} /> {t('studio_add_listing')}
              </button>

              <button
                className="seller-public-link-btn"
                onClick={() => setCurrentPage('marketplace')}
                title="View live website"
              >
                <ExternalLink size={15} />
                <span className="hidden sm:inline">{t('nav_marketplace')}</span>
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
                    <p className="seller-stat-label">{t('studio_published_label')}</p>
                    <p className="seller-stat-value">{publishedCount}</p>
                    <p className="seller-stat-sub">{t('studio_active_label')}</p>
                  </div>
                </div>

                <div className="seller-stat-card bg-amber-50/60 border-amber-200/50">
                  <div className="seller-stat-icon-wrap text-amber-600 bg-white">
                    <Eye size={22} />
                  </div>
                  <div>
                    <p className="seller-stat-label">{t('studio_views_label')}</p>
                    <p className="seller-stat-value">{totalViews.toLocaleString()}</p>
                    <p className="seller-stat-sub">{t('studio_views_sub')}</p>
                  </div>
                </div>

                <div className="seller-stat-card bg-violet-50 border-violet-100">
                  <div className="seller-stat-icon-wrap text-violet-600 bg-white">
                    <MessageSquare size={22} />
                  </div>
                  <div>
                    <p className="seller-stat-label">{t('studio_inquiries_label')}</p>
                    <p className="seller-stat-value">{totalInquiries}</p>
                    <p className="seller-stat-sub">{t('studio_inquiries_sub')}</p>
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
                    {t('studio_tab_all')} <span className="seller-pill-badge">{sellerListings.length}</span>
                  </button>
                  <button
                    className={`seller-pill ${statusFilter === 'published' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('published')}
                  >
                    {t('studio_tab_published')} <span className="seller-pill-badge">{publishedCount}</span>
                  </button>
                  <button
                    className={`seller-pill ${statusFilter === 'pending' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('pending')}
                  >
                    {t('studio_tab_pending')} <span className="seller-pill-badge">{pendingCount}</span>
                  </button>
                  <button
                    className={`seller-pill ${statusFilter === 'drafts' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('drafts')}
                  >
                    {t('studio_tab_drafts')} <span className="seller-pill-badge">{draftsCount}</span>
                  </button>
                  <button
                    className={`seller-pill ${statusFilter === 'expired' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('expired')}
                  >
                    {t('studio_tab_expired')} <span className="seller-pill-badge">{expiredCount}</span>
                  </button>
                </div>

                <div className="seller-sorter-wrap">
                  <SlidersHorizontal size={15} className="text-ink-soft/70" />
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="seller-sorter-select"
                  >
                    <option value="recent">{t('studio_sort_recent')}</option>
                    <option value="price_desc">{t('studio_sort_price_high')}</option>
                    <option value="price_asc">{t('studio_sort_price_low')}</option>
                  </select>
                </div>
              </div>

              {/* Vehicle Listings Grid */}
              {filteredListings.length === 0 ? (
                <div className="seller-empty-state">
                  <Car size={48} className="text-gold-dim mx-auto mb-3" />
                  <h3 className="text-xl font-bold font-serif-display text-ink">{t('studio_no_listings')}</h3>
                  <p className="text-ink-soft text-sm max-w-md mx-auto mt-1 mb-5">
                    {searchQuery
                      ? t('studio_no_search_result', { query: searchQuery })
                      : t('studio_no_listings_sub')}
                  </p>
                  <button
                    className="seller-new-listing-btn mx-auto"
                    onClick={() => setShowAddModal(true)}
                  >
                    <Plus size={16} /> {t('studio_add_first_btn')}
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
                    const isRejected = listing.status === 'rejected';
                    const isSold = listing.sale_status === 'sold';
                    const isRented = listing.sale_status === 'rented';

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
                              className={`seller-dot ${isSold || isRented ? 'bg-red-500' : isPublished ? 'bg-emerald-500' : isPending ? 'bg-amber-500' : isRejected ? 'bg-red-500' : 'bg-gray-400'}`}
                            />
                            <span className="text-xs font-semibold text-ink">
                              {isSold ? t('status_sold') : isRented ? t('status_rented') : isPublished ? t('studio_status_published') : isPending ? t('studio_status_pending') : isRejected ? t('studio_status_rejected') : t('studio_status_draft')}
                            </span>
                          </div>

                          {/* Sold / Rented Banner Overlay on Image */}
                          {(isSold || isRented) && (
                            <div style={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%) rotate(-12deg)',
                              background: isSold ? 'rgba(220, 38, 38, 0.95)' : 'rgba(124, 58, 237, 0.95)',
                              color: '#fff',
                              padding: '6px 20px',
                              borderRadius: '8px',
                              fontWeight: 900,
                              fontSize: '1.05rem',
                              letterSpacing: '0.08em',
                              boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
                              zIndex: 10,
                              textTransform: 'uppercase',
                              border: '2px solid #fff',
                              pointerEvents: 'none'
                            }}>
                              {isSold ? t('marketplace_badge_sold') : t('marketplace_badge_rented')}
                            </div>
                          )}

                          {/* Sale/Rent Pill */}
                          <div className={`seller-badge-type ${isForRent ? 'rent' : 'sale'}`}>
                            {isForRent ? t('studio_status_for_rent') : t('studio_status_for_sale')}
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
                          {/* Rejection Remarks Banner */}
                          {isRejected && (
                            <div style={{
                              margin: '10px 0 8px',
                              padding: '12px 14px',
                              background: 'rgba(239, 68, 68, 0.08)',
                              border: '1.5px solid rgba(239, 68, 68, 0.45)',
                              borderRadius: '10px',
                              textAlign: 'left'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontWeight: 800, fontSize: '0.82rem', marginBottom: '4px' }}>
                                <AlertTriangle size={15} /> {t('studio_rejection_title')}
                              </div>
                              <p style={{ margin: '0 0 8px', color: '#991b1b', fontSize: '0.82rem', lineHeight: '1.4', fontWeight: 600, fontStyle: 'italic' }}>
                                "{listing.rejection_reason || 'Verification requirements not met. Please review your Mulkiya document and specs.'}"
                              </p>
                              <div style={{ fontSize: '0.74rem', color: '#b91c1c', marginBottom: '10px' }}>
                                {t('studio_rejection_note')}
                              </div>
                              <button
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '7px 14px',
                                  background: '#dc2626',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '0.8rem',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  width: '100%',
                                  justifyContent: 'center'
                                }}
                                onClick={(e) => { e.stopPropagation(); handleStartEdit(listing, e); }}
                              >
                                <Edit size={14} /> {t('studio_edit_resubmit')}
                              </button>
                            </div>
                          )}
                          <div className="seller-card-actions-row">
                            <button
                              className="seller-edit-btn"
                              onClick={(e) => handleStartEdit(listing, e)}
                            >
                              <Edit size={14} /> {t('studio_edit_btn')}
                            </button>

                            {/* Mark as Sold / Rented button */}
                            {isPublished && (
                              <button
                                type="button"
                                onClick={(e) => handleToggleSoldStatus(listing, e)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  padding: '7px 11px',
                                  borderRadius: '8px',
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  border: isSold || isRented
                                    ? '1.5px solid #16a34a'
                                    : '1.5px solid #dc2626',
                                  background: isSold || isRented
                                    ? 'rgba(22, 163, 74, 0.08)'
                                    : 'rgba(220, 38, 38, 0.08)',
                                  color: isSold || isRented ? '#15803d' : '#b91c1c',
                                  transition: 'all 0.2s ease',
                                  whiteSpace: 'nowrap'
                                }}
                                title={isSold || isRented ? 'Re-activate this listing on the marketplace' : `Mark as ${isForRent ? 'Rented' : 'Sold'} and notify admin`}
                              >
                                {isSold || isRented ? (
                                  <>
                                    <CheckCircle2 size={13} /> {t('action_mark_active')}
                                  </>
                                ) : (
                                  <>
                                    <Tag size={13} /> {isForRent ? t('action_mark_rented') : t('action_mark_sold')}
                                  </>
                                )}
                              </button>
                            )}

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
                                    <Edit size={14} /> {isRejected ? t('studio_edit_resubmit') : t('studio_edit_details')}
                                  </button>
                                  <button
                                    className="seller-dropdown-item"
                                    onClick={(e) => {
                                      setActiveMenuId(null);
                                      handleToggleSoldStatus(listing, e);
                                    }}
                                  >
                                    <Tag size={14} /> {isSold || isRented ? t('action_mark_active') : (isForRent ? t('action_mark_rented') : t('action_mark_sold'))}
                                  </button>
                                  <button
                                    className="seller-dropdown-item"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      if (setCurrentPage) setCurrentPage('marketplace');
                                    }}
                                  >
                                    <ExternalLink size={14} /> {t('studio_view_public')}
                                  </button>
                                  <button
                                    className="seller-dropdown-item text-red-600 hover:bg-red-50"
                                    onClick={(e) => {
                                      setActiveMenuId(null);
                                      handleDeleteListing(listing.id, e);
                                    }}
                                  >
                                    <Trash2 size={14} /> {t('studio_delete_listing')}
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
                    <h2 className="text-xl font-bold font-serif-display text-ink">{t('profile_credentials_title')}</h2>
                    <p className="text-sm text-ink-soft mt-0.5">
                      {t('profile_credentials_sub')}
                    </p>
                  </div>
                  <span className="seller-verified-badge-lg">
                    <ShieldCheck size={16} className="text-emerald-600" />
                    {t('profile_verified_badge')}
                  </span>
                </div>

                <form onSubmit={handleSaveProfile} className="mt-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="seller-form-label">{t('profile_dealer_name')}</label>
                      <input
                        type="text"
                        required
                        value={profileForm.company_name}
                        onChange={e => setProfileForm({ ...profileForm, company_name: e.target.value })}
                        className="seller-form-input"
                      />
                    </div>

                    <div>
                      <label className="seller-form-label">{t('profile_contact_person')}</label>
                      <input
                        type="text"
                        required
                        value={profileForm.name}
                        onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="seller-form-input"
                      />
                    </div>

                    <div>
                      <label className="seller-form-label">{t('profile_contact_email')}</label>
                      <input
                        type="email"
                        required
                        value={profileForm.email}
                        onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                        className="seller-form-input"
                      />
                    </div>

                    <div>
                      <label className="seller-form-label">{t('profile_whatsapp')}</label>
                      <input
                        type="text"
                        required
                        value={profileForm.phone}
                        onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="seller-form-input"
                      />
                    </div>

                    <div>
                      <label className="seller-form-label">{t('profile_license_num')}</label>
                      <input
                        type="text"
                        value={profileForm.trade_license}
                        onChange={e => setProfileForm({ ...profileForm, trade_license: e.target.value })}
                        className="seller-form-input"
                      />
                    </div>

                    <div>
                      <label className="seller-form-label">{t('profile_country_hq')}</label>
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
                    <label className="seller-form-label">{t('profile_showroom_city')}</label>
                    <input
                      type="text"
                      value={profileForm.city}
                      onChange={e => setProfileForm({ ...profileForm, city: e.target.value })}
                      placeholder="e.g. Sheikh Zayed Road, Al Quoz 1, Dubai"
                      className="seller-form-input"
                    />
                  </div>

                  <div>
                    <label className="seller-form-label">{t('profile_about_dealer')}</label>
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
                      <Check size={16} /> {t('profile_save_btn')}
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
                    <p className="seller-stat-label">{t('dash_active_listings')}</p>
                    <p className="seller-stat-value">{publishedCount}</p>
                    <p className="seller-stat-sub">{t('dash_active_sub')}</p>
                  </div>
                </div>

                <div className="seller-stat-card bg-amber-50/60 border-amber-200/50">
                  <div className="seller-stat-icon-wrap text-amber-600 bg-white">
                    <Eye size={22} />
                  </div>
                  <div>
                    <p className="seller-stat-label">{t('dash_impressions')}</p>
                    <p className="seller-stat-value">{totalViews.toLocaleString()}</p>
                    <p className="seller-stat-sub">{t('dash_impressions_sub')}</p>
                  </div>
                </div>

                <div className="seller-stat-card bg-violet-50 border-violet-100">
                  <div className="seller-stat-icon-wrap text-violet-600 bg-white">
                    <MessageSquare size={22} />
                  </div>
                  <div>
                    <p className="seller-stat-label">{t('dash_direct_leads')}</p>
                    <p className="seller-stat-value">{totalInquiries}</p>
                    <p className="seller-stat-sub">{t('dash_leads_sub')}</p>
                  </div>
                </div>
              </div>

              {/* 2-Column Dashboard Body */}
              <div className="seller-dash-grid-2">
                {/* Recent Inventory List */}
                <div className="seller-dashboard-card">
                  <div className="seller-dashboard-header">
                    <div>
                      <h3 className="seller-dashboard-card-title">{t('dash_recent_listings')}</h3>
                      <p className="text-xs text-ink-soft mt-0.5">{t('dash_recent_sub')}</p>
                    </div>
                    <button
                      className="seller-dashboard-link-btn"
                      onClick={() => setActiveTab('listings')}
                    >
                      {t('dash_view_all')}
                    </button>
                  </div>

                  <div className="seller-dash-table-wrap">
                    {sellerListings.length === 0 ? (
                      <div className="p-8 text-center text-sm text-ink-soft">
                        {t('dash_no_listings')}
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
                                <span>{l.views || 0} {t('dash_views_label')}</span>
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
                              <Edit size={13} /> {t('dash_edit_btn')}
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
                    <h3 className="seller-dashboard-card-title">{t('dash_showroom_status')}</h3>
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
                {activeTab === 'help' && 'Need help publishing or managing vehicles? Contact our 24/7 dealer concierges at Info@binmargroup.com.'}
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
              {/* Notice if editing a rejected listing */}
              {(editWasRejected || editingListing?.status === 'rejected') && (
                <div style={{
                  padding: '12px 16px',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1.5px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '10px',
                  marginBottom: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontWeight: 800, fontSize: '0.85rem', marginBottom: '3px' }}>
                    <AlertTriangle size={16} /> Rejection Remarks from Admin:
                  </div>
                  <p style={{ margin: '0 0 6px', color: '#991b1b', fontSize: '0.84rem', fontWeight: 600, fontStyle: 'italic' }}>
                    "{editingListing?.rejection_reason || editingListing?.previous_rejection_reason || 'Verification requirements not met.'}"
                  </p>
                  <p style={{ margin: 0, fontSize: '0.74rem', color: '#b91c1c' }}>
                    Please update the vehicle information or attach a clear Mulkiya document below. When saved, it will be automatically resubmitted to the Admin team for approval.
                  </p>
                </div>
              )}
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

              {/* Mulkiya / Vehicle Registration Document Field */}
              <div>
                <label className="seller-form-label mb-1.5 flex items-center justify-between">
                  <span>Vehicle Registration / Mulkiya Document</span>
                  <span className="text-xs text-ink-soft">Required for Admin verification</span>
                </label>
                <div style={{
                  border: '1.5px dashed rgba(212, 175, 55, 0.4)',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  background: 'rgba(212, 175, 55, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: 'rgba(212, 175, 55, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--gold, #d4af37)'
                    }}>
                      <FileText size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{editForm.document_file || editForm.document_name || 'No Mulkiya attached'}</span>
                        {editForm.document_url && <CheckCircle2 size={15} style={{ color: '#16a34a' }} />}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        PDF or image scan of official Mulkiya / Istimara card
                      </div>
                    </div>
                  </div>

                  <label style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 14px',
                    background: 'var(--gold, #d4af37)',
                    color: '#0f172a',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}>
                    <Upload size={13} /> {editForm.document_url ? 'Replace Document' : 'Attach Document'}
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          setEditForm(prev => ({
                            ...prev,
                            document_name: file.name,
                            document_file: file.name,
                            document_url: ev.target.result
                          }));
                          notify(`Attached updated Mulkiya: ${file.name}`);
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
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
                  <label className="seller-form-label">Moderation & Approval</label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    background: '#fffbeb',
                    border: '1.5px solid #fde68a',
                    borderRadius: '8px',
                    color: '#92400e',
                    fontSize: '0.82rem',
                    fontWeight: 600
                  }}>
                    <Clock size={16} color="#d97706" />
                    <span>Goes to Admin Moderation Queue for Approval</span>
                  </div>
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
                {isSavingEdit ? 'Saving & Submitting...' : 'Save & Submit for Admin Approval'}
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
