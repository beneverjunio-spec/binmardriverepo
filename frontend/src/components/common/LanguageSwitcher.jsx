import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function LanguageSwitcher({ className = '', style = {} }) {
  const { lang, setLang } = useLanguage();

  return (
    <div
      className={`lang-switcher ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.08)',
        border: '1px solid rgba(198, 161, 91, 0.35)',
        borderRadius: '999px',
        padding: '3px 6px',
        gap: '4px',
        userSelect: 'none',
        ...style
      }}
      title={lang === 'en' ? 'التبديل إلى العربية' : 'Switch to English'}
    >
      <Globe size={14} style={{ color: 'var(--gold-bright)', opacity: 0.9, marginLeft: 2, marginRight: 2 }} />
      <button
        type="button"
        onClick={() => setLang('en')}
        style={{
          border: 'none',
          background: lang === 'en' ? 'var(--gold)' : 'transparent',
          color: lang === 'en' ? '#0A2A1F' : 'var(--sage)',
          fontWeight: lang === 'en' ? 700 : 500,
          fontSize: '0.75rem',
          padding: '3px 8px',
          borderRadius: '999px',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang('ar')}
        style={{
          border: 'none',
          background: lang === 'ar' ? 'var(--gold)' : 'transparent',
          color: lang === 'ar' ? '#0A2A1F' : 'var(--sage)',
          fontWeight: lang === 'ar' ? 700 : 500,
          fontSize: '0.75rem',
          padding: '3px 8px',
          borderRadius: '999px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          fontFamily: "'Cairo', sans-serif"
        }}
      >
        العربية
      </button>
    </div>
  );
}
