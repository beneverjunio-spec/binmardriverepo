import React, { useState, useEffect, useRef } from 'react';
import { getUser, handleAuthCallback, logout, onAuthChange } from '@netlify/identity';
import { authErrorMessage, loadProfile } from './api/auth';
import { fetchPublicListings, fetchRegisteredSellers } from './api/listings';

// Common Components
import Toast from './components/common/Toast';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ListingDetailModal from './components/marketplace/ListingDetailModal';

// Pages
import MarketplacePage from './pages/MarketplacePage';
import CreateListingPage from './pages/CreateListingPage';
import RegistrationPage from './pages/RegistrationPage';
import UserLoginPage from './pages/UserLoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import SetPasswordPage from './pages/SetPasswordPage';
import AdminPortalPage from './pages/AdminPortalPage';
import AboutPage from './pages/AboutPage';
import HowItWorksPage from './pages/HowItWorksPage';
import ContactPage from './pages/ContactPage';
import SellerPortalPage from './pages/SellerPortalPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfUsePage from './pages/TermsOfUsePage';
import VehicleDetailPage from './pages/VehicleDetailPage';
import { getVehicleUrl, extractListingIdFromSlug } from './utils/seo';

function getInitialPage() {
  try {
    const path = (window.location.pathname || '').toLowerCase();
    if (path.startsWith('/car/') || path === '/car') return 'vehicle-detail';
    if (path.includes('seller') || path.includes('studio')) return 'seller';
    if (path.includes('admin-login')) return 'admin-login';
    if (path.includes('admin')) return 'admin';
    if (path.includes('login') || path.includes('signin')) return 'user-login';
    if (path.includes('register') || path.includes('signup')) return 'registration';
    if (path.includes('create') || path.includes('post')) return 'create-listing';
    if (path.includes('about')) return 'about';
    if (path.includes('how-it-works')) return 'how-it-works';
    if (path.includes('contact')) return 'contact';
    if (path.includes('privacy-policy')) return 'privacy-policy';
    if (path.includes('terms-of-use')) return 'terms-of-use';
  } catch {}
  return 'marketplace';
}

function getSavedUser() {
  try {
    const raw = localStorage.getItem('binmar_current_user');
    if (raw) {
      const u = JSON.parse(raw);
      if (u.user_type === 'admin') return u;
      if (u.status === 'pending' || u.status === 'rejected') return null;
      const isVerified = u.status === 'approved' || u.status === 'verified' || Boolean(u.is_verified_seller);
      if (!isVerified) return null;
      return u;
    }
  } catch {}
  return null;
}

export default function App() {
  // Navigation & Page State
  const [currentPage, setCurrentPage] = useState(getInitialPage);
  const [toast, setToast] = useState({ show: false, message: '' });

  // User & Auth State — restored immediately from localStorage on refresh
  const [currentUser, setCurrentUserState] = useState(getSavedUser);
  const [passwordCallback, setPasswordCallback] = useState(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginError, setLoginError] = useState('');
  const [regAccountType, setRegAccountType] = useState('individual');
  const authCallbackRef = useRef(null);

  // Wrapper that persists user to localStorage so refresh restores session
  const setCurrentUser = (userOrUpdater) => {
    setCurrentUserState(prev => {
      const next = typeof userOrUpdater === 'function' ? userOrUpdater(prev) : userOrUpdater;
      try {
        if (next) {
          const isVerified = next.user_type === 'admin' || next.status === 'approved' || next.status === 'verified' || Boolean(next.is_verified_seller);
          if (isVerified && next.status !== 'pending' && next.status !== 'rejected') {
            localStorage.setItem('binmar_current_user', JSON.stringify(next));
            return next;
          } else if (next.user_type === 'admin') {
            localStorage.setItem('binmar_current_user', JSON.stringify(next));
            return next;
          } else {
            localStorage.removeItem('binmar_current_user');
            return null;
          }
        } else {
          localStorage.removeItem('binmar_current_user');
        }
      } catch {}
      return next;
    });
  };

  // Marketplace & Filter State
  const [listings, setListings] = useState([]);
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedSeller, setSelectedSeller] = useState('');
  const [registeredSellers, setRegisteredSellers] = useState([]);
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedListing, setSelectedListing] = useState(null);

  // Toast Helper
  const notify = (msg) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: '' }), 3500);
  };

  const handleSelectListing = (listing) => {
    setSelectedListing(listing);
    setCurrentPage('vehicle-detail');
  };

  // Fetch live public listings
  const loadListings = async () => {
    try {
      const data = await fetchPublicListings({
        make: selectedMake,
        country: selectedCountry,
        type: selectedType,
        seller: selectedSeller,
        category: selectedCategory,
        maxPrice,
        sortBy
      });
      setListings(data);

      // If URL contains ?listing=ID or ?id=ID from social sharing, auto-open modal
      try {
        const params = new URLSearchParams(window.location.search);
        const sharedId = params.get('listing') || params.get('id');
        if (sharedId && data && data.length > 0) {
          const matched = data.find(item => String(item.id) === String(sharedId));
          if (matched) {
            setSelectedListing(matched);
          }
        }

        // Deep link match for SEO vehicle URL: /car/{slug-id}
        const currentPath = window.location.pathname || '';
        if (currentPath.startsWith('/car/') && data && data.length > 0) {
          const rawSlug = currentPath.replace(/^\/car\/?/, '').replace(/\/$/, '');
          const extractedId = extractListingIdFromSlug(rawSlug);
          const matched = data.find(item => String(item.id) === String(extractedId) || item.slug === rawSlug);
          if (matched) {
            setSelectedListing(matched);
            setCurrentPage('vehicle-detail');
          }
        }
      } catch {}
    } catch (e) {
      console.warn('API error, using cached data', e);
    }
  };

  // Load registered sellers for marketplace dropdown filter
  useEffect(() => {
    let active = true;
    async function loadSellers() {
      try {
        const data = await fetchRegisteredSellers();
        if (active && Array.isArray(data)) {
          setRegisteredSellers(data);
        }
      } catch (err) {
        console.warn('Could not load registered sellers:', err);
      }
    }
    loadSellers();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    loadListings();
  }, [selectedMake, selectedCountry, selectedType, selectedSeller, selectedCategory, maxPrice, sortBy]);

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (currentPage === 'admin-login' && currentUser?.user_type === 'admin') {
      setCurrentPage('admin');
    }
    // If a verified seller is already logged in, redirect away from login/register pages
    if (currentPage === 'user-login' && currentUser && currentUser.user_type !== 'admin') {
      const isVerified = currentUser.status === 'approved' || currentUser.status === 'verified' || Boolean(currentUser.is_verified_seller);
      if (isVerified) {
        setCurrentPage('seller');
      }
    }
  }, [currentPage, currentUser]);

  // Synchronize browser URL bar and scroll position
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    try {
      const pageToPath = {
        'marketplace': '/',
        'seller': '/seller',
        'user-login': '/login',
        'admin-login': '/admin-login',
        'admin': '/admin',
        'registration': '/register',
        'create-listing': '/create-listing',
        'about': '/about',
        'how-it-works': '/how-it-works',
        'contact': '/contact',
        'privacy-policy': '/privacy-policy',
        'terms-of-use': '/terms-of-use'
      };
      if (currentPage === 'vehicle-detail' && selectedListing) {
        const vehicleUrl = getVehicleUrl(selectedListing);
        if (window.location.pathname !== vehicleUrl) {
          window.history.pushState({ page: 'vehicle-detail', listingId: selectedListing.id }, '', vehicleUrl);
        }
      } else {
        const targetPath = pageToPath[currentPage] || '/';
        if (window.location.pathname !== targetPath) {
          window.history.pushState({ page: currentPage }, '', targetPath);
        }
      }
    } catch {}
  }, [currentPage]);

  // Handle browser back / forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPage(getInitialPage());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handle Netlify Identity auth state and invitations safely
  useEffect(() => {
    let active = true;

    try {
      const unsubscribe = onAuthChange((event, user) => {
        // Only clear the user if Netlify fires an explicit logout/signout event
        if (!user && active && (event === 'logout' || event === 'signout')) {
          setCurrentUser(null);
          setCurrentPage(page => (page === 'admin' ? 'admin-login' : page));
        }
      });

      async function restoreSession() {
        try {
          authCallbackRef.current ??= handleAuthCallback();
          const callback = await authCallbackRef.current;
          if (!active) return;

          if (callback?.type === 'invite' || callback?.type === 'recovery') {
            setPasswordCallback(callback);
            setCurrentPage('set-password');
            return;
          }

          const identity = await getUser();
          if (identity) {
            // Netlify has a valid session — refresh profile from API
            const profile = await loadProfile();
            const isVerified = profile?.user_type === 'admin' || profile?.status === 'approved' || profile?.status === 'verified' || Boolean(profile?.is_verified_seller);
            if (!isVerified) {
              try { await logout(); } catch {}
              if (active) setCurrentUser(null);
            } else if (active) {
              setCurrentUser(profile);
            }
          }
          // If no identity from Netlify but we have a cached user in localStorage,
          // keep the cached session (handled by getSavedUser initializer above)
        } catch {
          // Gracefully do nothing — the localStorage-restored user stays in place
        }
      }

      restoreSession();
      return () => {
        active = false;
        if (unsubscribe) unsubscribe();
      };
    } catch {
      // Identity service not available locally
    }
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setCurrentUser(null);
      setCurrentPage('marketplace');
      notify('You have signed out.');
    } catch {
      setCurrentUser(null);
      setCurrentPage('marketplace');
      notify('You have signed out.');
    }
  };

  const handlePostListingClick = () => {
    if (!currentUser) {
      setCurrentPage('user-login');
      return;
    }
    if (currentUser.user_type === 'company' && currentUser.status === 'pending') {
      notify(
        'Your company trade license is currently in the admin verification queue. Once verified by our team, you will receive full access to publish listings!'
      );
      return;
    }
    setCurrentPage('create-listing');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toast Notification */}
      <Toast show={toast.show} message={toast.message} />

      {/* Top Navigation on all pages except full Admin Portal, Seller Studio, and standalone auth screens */}
      {currentPage !== 'admin' && currentPage !== 'seller' && currentPage !== 'admin-login' && currentPage !== 'user-login' && (
        <Navbar
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          currentUser={currentUser}
          onLogout={handleLogout}
          onPostListingClick={handlePostListingClick}
        />
      )}

      {/* Page Content */}
      <main style={{ flex: 1 }}>
        {currentPage === 'vehicle-detail' && (
          <VehicleDetailPage
            listing={selectedListing}
            onBack={() => {
              setSelectedListing(null);
              setCurrentPage('marketplace');
            }}
            onPostListingClick={handlePostListingClick}
          />
        )}

        {currentPage === 'marketplace' && (
          <MarketplacePage
            listings={listings}
            selectedMake={selectedMake}
            setSelectedMake={setSelectedMake}
            selectedCountry={selectedCountry}
            setSelectedCountry={setSelectedCountry}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            selectedSeller={selectedSeller}
            setSelectedSeller={setSelectedSeller}
            registeredSellers={registeredSellers}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            sortBy={sortBy}
            setSortBy={setSortBy}
            onSelectListing={handleSelectListing}
            onPostListingClick={handlePostListingClick}
          />
        )}

        {currentPage === 'about' && (
          <AboutPage onExploreMarketplace={() => setCurrentPage('marketplace')} />
        )}

        {currentPage === 'how-it-works' && (
          <HowItWorksPage onPostListingClick={handlePostListingClick} />
        )}

        {currentPage === 'contact' && (
          <ContactPage onBackToMarketplace={() => setCurrentPage('marketplace')} />
        )}

        {currentPage === 'privacy-policy' && (
          <PrivacyPolicyPage onBack={() => setCurrentPage('marketplace')} />
        )}

        {currentPage === 'terms-of-use' && (
          <TermsOfUsePage onBack={() => setCurrentPage('marketplace')} />
        )}

        {currentPage === 'registration' && (
          <RegistrationPage
            regAccountType={regAccountType}
            setRegAccountType={setRegAccountType}
            setCurrentUser={setCurrentUser}
            setCurrentPage={setCurrentPage}
            setLoginEmail={setLoginEmail}
            setLoginError={setLoginError}
            notify={notify}
          />
        )}

        {currentPage === 'user-login' && (
          <UserLoginPage
            loginEmail={loginEmail}
            setLoginEmail={setLoginEmail}
            loginError={loginError}
            setLoginError={setLoginError}
            setCurrentUser={setCurrentUser}
            setCurrentPage={setCurrentPage}
            notify={notify}
          />
        )}

        {currentPage === 'admin-login' && (
          <AdminLoginPage
            setCurrentUser={setCurrentUser}
            setCurrentPage={setCurrentPage}
            notify={notify}
          />
        )}

        {currentPage === 'create-listing' && (
          <CreateListingPage
            currentUser={currentUser}
            onSuccess={() => {
              loadListings();
              setCurrentPage('seller');
            }}
            onCancel={() => setCurrentPage('marketplace')}
            notify={notify}
          />
        )}

        {currentPage === 'set-password' && (
          <SetPasswordPage
            passwordCallback={passwordCallback}
            setPasswordCallback={setPasswordCallback}
            setCurrentUser={setCurrentUser}
            setCurrentPage={setCurrentPage}
            notify={notify}
          />
        )}

        {currentPage === 'admin' && (
          <AdminPortalPage
            currentUser={currentUser || { name: 'Staff Administrator', user_type: 'admin' }}
            onExit={() => setCurrentPage('marketplace')}
            onRefreshListings={loadListings}
            notify={notify}
          />
        )}

        {currentPage === 'seller' && (
          currentUser && (currentUser.is_verified_seller || currentUser.status === 'approved' || currentUser.status === 'verified') && currentUser.status !== 'pending' && currentUser.status !== 'rejected' ? (
            <SellerPortalPage
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
              setCurrentPage={setCurrentPage}
              notify={notify}
              onRefreshListings={loadListings}
              onOpenCreateListing={() => setCurrentPage('create-listing')}
            />
          ) : (
            <UserLoginPage
              loginEmail={loginEmail}
              setLoginEmail={setLoginEmail}
              loginError={
                currentUser?.status === 'pending'
                  ? 'Your seller account is currently pending administrative verification in the Admin Operations Portal. Please wait for the administrator to approve your account.'
                  : currentUser?.status === 'rejected'
                  ? 'Your seller application was rejected by the administration.'
                  : 'Seller Studio is reserved for verified sellers. Please sign in with an approved seller account or register to get verified.'
              }
              setLoginError={setLoginError}
              setCurrentUser={setCurrentUser}
              setCurrentPage={setCurrentPage}
              notify={notify}
            />
          )
        )}
      </main>

      {/* Vehicle Details Modal */}
      {selectedListing && (
        <ListingDetailModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
        />
      )}

      {/* Public Footer on non-admin and non-seller pages */}
      {currentPage !== 'admin' && currentPage !== 'seller' && (
        <Footer
          setCurrentPage={setCurrentPage}
          setSelectedType={setSelectedType}
          setRegAccountType={setRegAccountType}
          onPostListingClick={handlePostListingClick}
        />
      )}
    </div>
  );
}
