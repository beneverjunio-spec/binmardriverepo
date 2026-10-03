import React from 'react';

export default function Footer({
  setCurrentPage,
  setSelectedType,
  setRegAccountType,
  onPostListingClick
}) {
  return (
    <div className="footer">
      <div className="footer-grid">
        <div>
          <div className="footer-mark">BINMAR<b>DRIVE</b></div>
          <div>Buy, sell and rent cars across the Middle East.</div>
        </div>
        <div className="footer-cols">
          <div className="footer-col">
            <h4>Marketplace</h4>
            <a
              onClick={() => {
                setSelectedType('sale');
                document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Buy a car
            </a>
            <a
              onClick={() => {
                setSelectedType('rent');
                document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Rent a car
            </a>
            <a onClick={onPostListingClick}>Sell your car</a>
            <a
              onClick={() => {
                setRegAccountType('company');
                setCurrentPage('registration');
              }}
            >
              Dealer signup
            </a>
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
        <span
          style={{ cursor: 'pointer', color: 'var(--gold-bright)' }}
          onClick={() => setCurrentPage('admin-login')}
        >
          Staff Portal &rarr;
        </span>
      </div>
    </div>
  );
}
