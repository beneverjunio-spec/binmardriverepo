import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function CategoryStrip({ selectedCategory, setSelectedCategory }) {
  const { t, isRTL } = useLanguage();
  const categories = [
    { key: '', label: t('cat_all') },
    { key: 'SUV', label: isRTL ? 'دفع رباعي (SUV)' : 'SUVs' },
    { key: 'Sedan', label: isRTL ? 'سيدان' : 'Sedans' },
    { key: 'Pickup', label: isRTL ? 'بيك آب / شاحنة' : 'Trucks & Pickups' },
    { key: 'Luxury', label: isRTL ? 'فاخرة ورياضية' : 'Luxury & Sports' }
  ];

  return (
    <div className="cat-strip">
      {categories.map(cat => (
        <div
          key={cat.key}
          className={`cat-chip ${selectedCategory === cat.key ? 'active' : ''}`}
          onClick={() => setSelectedCategory(cat.key)}
        >
          {cat.label}
        </div>
      ))}
    </div>
  );
}
