import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function CategoryStrip({
  selectedCategory,
  setSelectedCategory,
  selectedType,
  setSelectedType
}) {
  const { t, isRTL } = useLanguage();
  const categories = [
    { key: '', label: t('cat_all') || 'All Vehicles' },
    { key: 'SUV', label: isRTL ? 'دفع رباعي (SUV)' : 'SUVs' },
    { key: 'Sedan', label: isRTL ? 'سيدان' : 'Sedans' },
    { key: 'Pickup', label: isRTL ? 'بيك آب / شاحنة' : 'Trucks & Pickups' },
    { key: 'Luxury', label: isRTL ? 'فاخرة ورياضية' : 'Luxury & Sports' }
  ];

  const typeFilters = [
    { key: '', label: t('tab_all') || 'All' },
    { key: 'sale', label: t('tab_sale') || 'For sale' },
    { key: 'rent', label: t('tab_rent') || 'For rent' }
  ];

  return (
    <div className="cat-strip">
      {categories.map(cat => (
        <button
          key={cat.key}
          type="button"
          className={`cat-chip ${selectedCategory === cat.key ? 'active' : ''}`}
          onClick={() => setSelectedCategory(cat.key)}
        >
          {cat.label}
        </button>
      ))}

      {setSelectedType && (
        <>
          <div className="cat-strip-divider" aria-hidden="true" />
          {typeFilters.map(tf => (
            <button
              key={tf.key}
              type="button"
              className={`cat-chip ${selectedType === tf.key ? 'active' : ''}`}
              onClick={() => setSelectedType(tf.key)}
            >
              {tf.label}
            </button>
          ))}
        </>
      )}
    </div>
  );
}
