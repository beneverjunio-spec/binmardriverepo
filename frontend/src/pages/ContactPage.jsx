import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function ContactPage({ onBackToMarketplace }) {
  const { t } = useLanguage();

  return (
    <div>
      <div className="info-hero">
        <h1>{t('contact_hero_title')}</h1>
        <p>{t('contact_hero_sub')}</p>
      </div>
      <div className="info-section">
        <p><strong>{t('contact_whatsapp_label')}</strong> <a href="https://wa.me/971527621325" dir="ltr" style={{ color: 'var(--gold-bright)' }}>+971 52 762 1325</a></p>
        <p><strong>{t('contact_email_label')}</strong> <a href="mailto:Info@binmargroup.com" style={{ color: 'var(--gold-bright)' }}>Info@binmargroup.com</a></p>
        <p>
          <strong>{t('contact_office_label')}</strong> {t('contact_office_desc')}
        </p>
        <button
          className="btn-gold"
          style={{ marginTop: '1.5rem' }}
          onClick={onBackToMarketplace}
        >
          {t('contact_back_btn')}
        </button>
      </div>
    </div>
  );
}
