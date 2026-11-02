import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function HowItWorksPage({ onPostListingClick }) {
  const { t } = useLanguage();

  return (
    <div>
      <div className="info-hero">
        <h1>{t('how_hero_title')}</h1>
        <p>{t('how_hero_sub')}</p>
      </div>
      <div className="info-section">
        <h2>{t('how_for_sellers')}</h2>
        <div className="steps4">
          <div className="step-card">
            <div className="step-num">1</div>
            <h3>{t('how_s1_title')}</h3>
            <p>{t('how_s1_desc')}</p>
          </div>
          <div className="step-card">
            <div className="step-num">2</div>
            <h3>{t('how_s2_title')}</h3>
            <p>{t('how_s2_desc')}</p>
          </div>
          <div className="step-card">
            <div className="step-num">3</div>
            <h3>{t('how_s3_title')}</h3>
            <p>{t('how_s3_desc')}</p>
          </div>
          <div className="step-card">
            <div className="step-num">4</div>
            <h3>{t('how_s4_title')}</h3>
            <p>{t('how_s4_desc')}</p>
          </div>
        </div>

        <h2>{t('how_for_buyers')}</h2>
        <div className="steps4">
          <div className="step-card">
            <div className="step-num">1</div>
            <h3>{t('how_b1_title')}</h3>
            <p>{t('how_b1_desc')}</p>
          </div>
          <div className="step-card">
            <div className="step-num">2</div>
            <h3>{t('how_b2_title')}</h3>
            <p>{t('how_b2_desc')}</p>
          </div>
          <div className="step-card">
            <div className="step-num">3</div>
            <h3>{t('how_b3_title')}</h3>
            <p>{t('how_b3_desc')}</p>
          </div>
          <div className="step-card">
            <div className="step-num">4</div>
            <h3>{t('how_b4_title')}</h3>
            <p>{t('how_b4_desc')}</p>
          </div>
        </div>

        <button
          className="btn-gold"
          style={{ marginTop: '1.5rem' }}
          onClick={onPostListingClick}
        >
          {t('how_post_btn')}
        </button>
      </div>
    </div>
  );
}
