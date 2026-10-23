import React from 'react';
import { Car, Building2, User, Store } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '../../context/LanguageContext';

export default function Navbar({
  currentPage,
  setCurrentPage,
  selectedType,
  setSelectedType,
  currentUser,
  onLogout,
  onPostListingClick
}) {
  const { t, isRTL } = useLanguage();

  return (
    <div className="topnav">
      <div className="nav-mark" onClick={() => setCurrentPage('marketplace')}>
        <img src="/binmardrive-logo-transparent.png" alt="Binmar Drive Logo" className="brand-logo-img" />
        <span>BINMAR<b>DRIVE</b></span>
      </div>

      <div className="nav-links">
        <a
          className={selectedType === 'sale' && currentPage === 'marketplace' ? 'active' : ''}
          onClick={() => {
            setCurrentPage('marketplace');
            setSelectedType('sale');
          }}
        >
          {t('nav_buy')}
        </a>
        <a
          className={selectedType === 'rent' && currentPage === 'marketplace' ? 'active' : ''}
          onClick={() => {
            setCurrentPage('marketplace');
            setSelectedType('rent');
          }}
        >
          {t('nav_rent')}
        </a>
        <a
          className={currentPage === 'about' ? 'active' : ''}
          onClick={() => setCurrentPage('about')}
        >
          {t('nav_about')}
        </a>
        <a
          className={currentPage === 'how-it-works' ? 'active' : ''}
          onClick={() => setCurrentPage('how-it-works')}
        >
          {t('nav_how_it_works')}
        </a>
        <a
          className={currentPage === 'contact' ? 'active' : ''}
          onClick={() => setCurrentPage('contact')}
        >
          {t('nav_contact')}
        </a>
        {currentUser && (
          <a
            className={currentPage === 'seller' ? 'active' : ''}
            onClick={() => setCurrentPage('seller')}
            style={{ color: '#E4C374' }}
          >
            {t('nav_seller_studio')}
          </a>
        )}
      </div>

      <div className="nav-actions">
        {/* Language Selection Switcher */}
        <LanguageSwitcher />

        {currentUser ? (
          <>
            <div
              className="user-chip cursor-pointer"
              onClick={() => setCurrentPage('seller')}
              title="Open Seller Studio"
              style={{ cursor: 'pointer' }}
            >
              {currentUser.user_type === 'company' ? (
                <Building2 size={13} style={{ display: 'inline', marginRight: isRTL ? 0 : 4, marginLeft: isRTL ? 4 : 0 }} />
              ) : (
                <User size={13} style={{ display: 'inline', marginRight: isRTL ? 0 : 4, marginLeft: isRTL ? 4 : 0 }} />
              )}
              {currentUser.name}
            </div>

            <button
              className="btn-outline-gold"
              onClick={() => setCurrentPage(currentPage === 'seller' ? 'marketplace' : 'seller')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
            >
              <Store size={14} />
              {currentPage === 'seller' ? t('nav_marketplace') : t('nav_seller_studio')}
            </button>

            <button className="btn-outline-gold" onClick={onLogout}>
              {t('nav_sign_out')}
            </button>
          </>
        ) : (
          <button className="btn-outline-gold" onClick={() => setCurrentPage('user-login')}>
            {t('nav_sign_in')}
          </button>
        )}

        <button className="btn-gold" onClick={onPostListingClick}>
          <Car size={16} />
          {t('nav_post_listing')}
        </button>
      </div>
    </div>
  );
}
