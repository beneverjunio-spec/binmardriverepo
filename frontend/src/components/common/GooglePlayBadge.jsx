import React from 'react';
import { GOOGLE_PLAY_APP_URL } from '../../constants';
import { useLanguage } from '../../context/LanguageContext';

export function GooglePlayIcon({ size = 24, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ flexShrink: 0, display: 'inline-block', verticalAlign: 'middle' }}
      aria-hidden="true"
    >
      <path
        d="M48.2 24.3C46.8 28.5 46 33.6 46 39.8v432.4c0 6.2.8 11.3 2.2 15.5l241.6-231.8L48.2 24.3z"
        fill="#00E676"
      />
      <path
        d="M380.4 170.8L289.8 255.9l90.6 85.1 82.2-46.7c19.1-10.9 29.4-25.7 29.4-38.4s-10.3-27.5-29.4-38.4l-82.2-46.7z"
        fill="#FFD300"
      />
      <path
        d="M48.2 487.7c12 12.3 32.5 13.9 57.3-.2l274.9-156.3-90.6-85.1L48.2 487.7z"
        fill="#FF3A44"
      />
      <path
        d="M48.2 24.3l241.6 231.6 90.6-85.1L105.5 14.5c-24.8-14.1-45.3-12.5-57.3-.2z"
        fill="#0086FF"
      />
    </svg>
  );
}

/**
 * Official Google Play Store Badge & Action Button
 *
 * Variants:
 * - 'badge': Official black Google Play download badge with icon and 'GET IT ON / Google Play'
 * - 'button': Sleek 'Get the App' button with icon, ideal for navbar/header
 * - 'promo': Responsive promotional card for listing details & seller showcase
 */
export default function GooglePlayBadge({
  variant = 'badge',
  className = '',
  style = {},
  onClick
}) {
  const { t, isRTL } = useLanguage();

  if (variant === 'button') {
    return (
      <a
        href={GOOGLE_PLAY_APP_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className={`btn-google-play-header ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 13px',
          borderRadius: '8px',
          background: 'rgba(0, 0, 0, 0.45)',
          border: '1px solid rgba(228, 195, 116, 0.45)',
          color: '#ffffff',
          fontSize: '0.82rem',
          fontWeight: 600,
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          ...style
        }}
        title="Download BinmarDrive App on Google Play"
        aria-label="Download BinmarDrive App on Google Play"
      >
        <GooglePlayIcon size={16} />
        <span>{t('app_get_the_app') || 'Get the App'}</span>
      </a>
    );
  }

  if (variant === 'promo') {
    return (
      <div
        className={`app-promo-card ${className}`}
        style={{
          background: 'linear-gradient(135deg, #071e16 0%, #0d3829 60%, #134e3a 100%)',
          border: '1px solid rgba(228, 195, 116, 0.35)',
          borderRadius: '16px',
          padding: '20px 22px',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          ...style
        }}
      >
        {/* Decorative background glow */}
        <div
          style={{
            position: 'absolute',
            top: '-20px',
            right: isRTL ? 'auto' : '-20px',
            left: isRTL ? '-20px' : 'auto',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(228,195,116,0.2) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: '#04130e',
              border: '1px solid rgba(228, 195, 116, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <GooglePlayIcon size={26} />
          </div>

          <div style={{ flex: '1 1 200px' }}>
            <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gold-bright, #E4C374)', fontWeight: 700 }}>
              {t('app_download_title') || 'Download BinmarDrive App'}
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 800, marginTop: '2px', color: '#ffffff' }}>
              {t('app_promo_title') || 'BinmarDrive on Google Play'}
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.4 }}>
              {t('app_promo_desc') || 'Browse verified cars across the Middle East, receive direct WhatsApp inquiries, and manage listings on the go.'}
            </p>
          </div>

          <div style={{ flexShrink: 0 }}>
            <GooglePlayBadge variant="badge" />
          </div>
        </div>
      </div>
    );
  }

  // Default: Official Google Play Store Badge
  return (
    <a
      href={GOOGLE_PLAY_APP_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={`google-play-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        background: '#000000',
        color: '#ffffff',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        borderRadius: '10px',
        padding: '8px 16px',
        textDecoration: 'none',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.35)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        ...style
      }}
      title="Get It on Google Play"
      aria-label="Get It on Google Play - Download BinmarDrive App"
    >
      <GooglePlayIcon size={24} />
      <div style={{ display: 'flex', flexDirection: 'column', textAlign: isRTL ? 'right' : 'left', lineHeight: 1.15 }}>
        <span
          style={{
            fontSize: '0.62rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#cbd5e1',
            fontWeight: 600
          }}
        >
          {t('app_get_on_play_sub') || 'GET IT ON'}
        </span>
        <span
          style={{
            fontSize: '0.98rem',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.01em',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
        >
          Google Play
        </span>
      </div>
    </a>
  );
}
