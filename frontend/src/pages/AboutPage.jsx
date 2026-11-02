import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function AboutPage({ onExploreMarketplace }) {
  const { t } = useLanguage();

  return (
    <div>
      <div className="info-hero">
        <h1>{t('about_hero_title')}</h1>
        <p>{t('about_hero_sub')}</p>
      </div>
      <div className="info-section">
        <h2>{t('about_story_title')}</h2>
        <p>{t('about_story_desc')}</p>
        <h2>{t('about_values_title')}</h2>
        <p>{t('about_values_desc')}</p>
        <button
          className="btn-gold"
          style={{ marginTop: '1.5rem' }}
          onClick={onExploreMarketplace}
        >
          {t('about_browse_btn')}
        </button>
      </div>
    </div>
  );
}
