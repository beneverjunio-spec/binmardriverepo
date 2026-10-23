import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function Footer({
  setCurrentPage,
  setSelectedType,
  setRegAccountType,
  onPostListingClick
}) {
  const { t, tCountry } = useLanguage();

  return (
    <div className="footer">
      <div className="footer-grid">
        <div>
          <div className="footer-mark">
            <img src="/binmardrive-logo-transparent.png" alt="Binmar Drive Logo" className="brand-logo-img" />
            <span>BINMAR<b>DRIVE</b></span>
          </div>
          <div>{t('footer_desc')}</div>
        </div>
        <div className="footer-cols">
          <div className="footer-col">
            <h4>{t('footer_col_marketplace')}</h4>
            <a
              onClick={() => {
                setSelectedType('sale');
                document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {t('footer_buy_car')}
            </a>
            <a
              onClick={() => {
                setSelectedType('rent');
                document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {t('footer_rent_car')}
            </a>
            <a onClick={onPostListingClick}>{t('footer_sell_car')}</a>
            <a
              onClick={() => {
                setRegAccountType('company');
                setCurrentPage('registration');
              }}
            >
              {t('footer_dealer_signup')}
            </a>
          </div>
          <div className="footer-col">
            <h4>{t('footer_col_company')}</h4>
            <a onClick={() => setCurrentPage('about')}>{t('footer_about')}</a>
            <a onClick={() => setCurrentPage('how-it-works')}>{t('footer_how_it_works')}</a>
            <a onClick={() => setCurrentPage('contact')}>{t('footer_contact')}</a>
            <a onClick={() => setCurrentPage('user-login')}>{t('nav_sign_in')}</a>
            <a onClick={() => setCurrentPage('admin-login')}>{t('admin_tab_dashboard')}</a>
          </div>
          <div className="footer-col">
            <h4>{t('footer_col_countries')}</h4>
            <a>{tCountry('United Arab Emirates')}</a>
            <a>{tCountry('Saudi Arabia')}</a>
            <a>{tCountry('Qatar')}</a>
            <a>{tCountry('Kuwait')}</a>
            <a>{tCountry('Bahrain')}</a>
            <a>{tCountry('Oman')}</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>{t('footer_copyright')}</span>
        <span
          style={{ cursor: 'pointer', color: 'var(--gold-bright)' }}
          onClick={() => setCurrentPage('admin-login')}
        >
          {t('footer_staff_portal')}
        </span>
      </div>
    </div>
  );
}
