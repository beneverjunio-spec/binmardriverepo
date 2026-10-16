import React from 'react';
import { Car, Building2, User, Store } from 'lucide-react';

export default function Navbar({
  currentPage,
  setCurrentPage,
  selectedType,
  setSelectedType,
  currentUser,
  onLogout,
  onPostListingClick
}) {
  return (
    <div className="topnav">
      <div className="nav-mark" onClick={() => setCurrentPage('marketplace')}>
        BINMAR<b>DRIVE</b>
      </div>

      <div className="nav-links">
        <a
          className={selectedType === 'sale' && currentPage === 'marketplace' ? 'active' : ''}
          onClick={() => {
            setCurrentPage('marketplace');
            setSelectedType('sale');
          }}
        >
          Buy
        </a>
        <a
          className={selectedType === 'rent' && currentPage === 'marketplace' ? 'active' : ''}
          onClick={() => {
            setCurrentPage('marketplace');
            setSelectedType('rent');
          }}
        >
          Rent
        </a>
        <a
          className={currentPage === 'about' ? 'active' : ''}
          onClick={() => setCurrentPage('about')}
        >
          About
        </a>
        <a
          className={currentPage === 'how-it-works' ? 'active' : ''}
          onClick={() => setCurrentPage('how-it-works')}
        >
          How it works
        </a>
        <a
          className={currentPage === 'contact' ? 'active' : ''}
          onClick={() => setCurrentPage('contact')}
        >
          Contact
        </a>
        {currentUser && (
          <a
            className={currentPage === 'seller' ? 'active' : ''}
            onClick={() => setCurrentPage('seller')}
            style={{ color: '#E4C374' }}
          >
            Seller Studio
          </a>
        )}
      </div>

      <div className="nav-actions">
        {currentUser ? (
          <>
            <div
              className="user-chip cursor-pointer"
              onClick={() => setCurrentPage('seller')}
              title="Open Seller Studio"
              style={{ cursor: 'pointer' }}
            >
              {currentUser.user_type === 'company' ? (
                <Building2 size={13} style={{ display: 'inline', marginRight: 4 }} />
              ) : (
                <User size={13} style={{ display: 'inline', marginRight: 4 }} />
              )}
              {currentUser.name}
            </div>

            <button
              className="btn-outline-gold"
              onClick={() => setCurrentPage(currentPage === 'seller' ? 'marketplace' : 'seller')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
            >
              <Store size={14} />
              {currentPage === 'seller' ? 'Marketplace' : 'Seller Studio'}
            </button>

            <button className="btn-outline-gold" onClick={onLogout}>
              Sign out
            </button>
          </>
        ) : (
          <button className="btn-outline-gold" onClick={() => setCurrentPage('user-login')}>
            Sign in
          </button>
        )}

        <button className="btn-gold" onClick={onPostListingClick}>
          <Car size={16} />
          Post a listing &mdash; free
        </button>
      </div>
    </div>
  );
}
