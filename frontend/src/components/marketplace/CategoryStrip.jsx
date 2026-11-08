import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function CategoryStrip({
  selectedCategory,
  setSelectedCategory,
  selectedType,
  setSelectedType,
  selectedSeller,
  setSelectedSeller,
  sellerOptions = [],
  sortBy,
  setSortBy
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
      <div className="cat-strip-tabs">
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

      {(setSelectedSeller || setSortBy) && (
        <div className="cat-strip-dropdowns">
          {setSelectedSeller && (
            <select
              className={`filter-select ${selectedSeller ? 'active' : ''}`}
              value={selectedSeller}
              onChange={e => setSelectedSeller(e.target.value)}
              title={t('label_seller') || 'Seller'}
            >
              <option value="">{t('any_seller') || 'All Sellers'}</option>
              {sellerOptions.map(seller => {
                const val = seller.company_name || seller.name;
                return (
                  <option key={seller.id || val} value={val}>
                    {val}
                  </option>
                );
              })}
            </select>
          )}

          {setSortBy && (
            <select
              className={`filter-select ${sortBy && sortBy !== 'newest' ? 'active' : ''}`}
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              title={t('sort_title') || 'Sort listings'}
            >
              <option value="newest">{t('sort_newest') || 'Newest first'}</option>
              <option value="low">{t('sort_low') || 'Price: low to high'}</option>
              <option value="high">{t('sort_high') || 'Price: high to low'}</option>
            </select>
          )}
        </div>
      )}
    </div>
  );
}
