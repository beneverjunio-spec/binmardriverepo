import React, { useState, useEffect, useRef } from 'react';
import { getUser, handleAuthCallback, logout, onAuthChange } from '@netlify/identity';
import { authErrorMessage, loadProfile } from './api/auth';
import { fetchPublicListings } from './api/listings';

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

function getInitialPage() {
  try {
    const path = (window.location.pathname || '').toLowerCase();
    if (path.includes('seller') || path.includes('studio')) return 'seller';
    if (path.includes('admin-login')) return 'admin-login';
    if (path.includes('admin')) return 'admin';
    if (path.includes('login') || path.includes('signin')) return 'user-login';
    if (path.includes('register') || path.includes('signup')) return 'registration';
    if (path.includes('create') || path.includes('post')) return 'create-listing';
    if (path.includes('about')) return 'about';
    if (path.includes('how-it-works')) return 'how-it-works';
    if (path.includes('contact')) return 'contact';
  } catch {}
  return 'marketplace';
}

export default function App() {
  // Navigation & Page State
  const [currentPage, setCurrentPage] = useState(getInitialPage);
  const [toast, setToast] = useState({ show: false, message: '' });

  // User & Auth State
  const [currentUser, setCurrentUser] = useState(null);
  const [passwordCallback, setPasswordCallback] = useState(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginError, setLoginError] = useState('');
  const [regAccountType, setRegAccountType] = useState('individual');
  const authCallbackRef = useRef(null);

  // Marketplace & Filter State
  const [listings, setListings] = useState([]);
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedListing, setSelectedListing] = useState(null);

  // Toast Helper
  const notify = (msg) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: '' }), 3500);
  };

  // Fetch live public listings
  const loadListings = async () => {
    try {
      const data = await fetchPublicListings({
        make: selectedMake,
        country: selectedCountry,
        type: selectedType,
        category: selectedCategory,
        maxPrice,
        sortBy
      });
      setListings(data);
    } catch (e) {
      console.warn('API error, using cached data', e);
    }
  };

  useEffect(() => {
    loadListings();
  }, [selectedMake, selectedCountry, selectedType, selectedCategory, maxPrice, sortBy]);

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
        'contact': '/contact'
      };
      const targetPath = pageToPath[currentPage] || '/';
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ page: currentPage }, '', targetPath);
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
        if (!user && active) {
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
            const profile = await loadProfile();
            if (active) setCurrentUser(profile);
          }
        } catch {
          // Gracefully do nothing on initial load so marketplace remains open
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
      alert(
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

      {/* Top Navigation on all pages except full Admin Portal and Seller Studio shells */}
      {currentPage !== 'admin' && currentPage !== 'seller' && (
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
        {currentPage === 'marketplace' && (
          <MarketplacePage
            listings={listings}
            selectedMake={selectedMake}
            setSelectedMake={setSelectedMake}
            selectedCountry={selectedCountry}
            setSelectedCountry={setSelectedCountry}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            sortBy={sortBy}
            setSortBy={setSortBy}
            onSelectListing={setSelectedListing}
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
          <SellerPortalPage
            currentUser={currentUser || { name: 'Verified Dealer', user_type: 'company', is_verified_seller: true }}
            setCurrentUser={setCurrentUser}
            setCurrentPage={setCurrentPage}
            notify={notify}
            onRefreshListings={loadListings}
            onOpenCreateListing={() => setCurrentPage('create-listing')}
          />
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
