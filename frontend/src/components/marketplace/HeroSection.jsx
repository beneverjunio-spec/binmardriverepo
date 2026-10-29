import React from 'react';
import { GCC_COUNTRIES, VEHICLE_MAKES, getCountryCurrency } from '../../constants';
import { useLanguage } from '../../context/LanguageContext';

export default function HeroSection({
  selectedMake,
  setSelectedMake,
  selectedCountry,
  setSelectedCountry,
  selectedType,
  setSelectedType,
  selectedSeller,
  setSelectedSeller,
  registeredSellers = [],
  maxPrice,
  setMaxPrice
}) {
  const { t } = useLanguage();
  const currency = getCountryCurrency(selectedCountry);

  return (
    <div className="hero">
      <span className="hero-badge">{t('hero_badge')}</span>
      <h1>
        {t('hero_title')} <em>{t('hero_title_free')}</em> {t('hero_title_suffix')}
      </h1>
      <p>{t('hero_desc')}</p>

      {/* Filter Searchbar */}
      <div className="searchbar">
        <div>
          <label>{t('label_make')}</label>
          <select value={selectedMake} onChange={e => setSelectedMake(e.target.value)}>
            <option value="">{t('any_make')}</option>
            {VEHICLE_MAKES.map(make => (
              <option key={make} value={make}>{make}</option>
            ))}
          </select>
        </div>
        <div>
          <label>{t('label_country')}</label>
          <select value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)}>
            <option value="">{t('any_country')}</option>
            {GCC_COUNTRIES.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>
        <div>
          <label>{t('label_type')}</label>
          <select value={selectedType} onChange={e => setSelectedType(e.target.value)}>
            <option value="">{t('buy_or_rent')}</option>
            <option value="sale">{t('for_sale')}</option>
            <option value="rent">{t('for_rent')}</option>
          </select>
        </div>
        <div>
          <label>{t('label_seller')}</label>
          <select value={selectedSeller} onChange={e => setSelectedSeller(e.target.value)}>
            <option value="">{t('any_seller')}</option>
            {registeredSellers.map(seller => {
              const val = seller.company_name || seller.name;
              return (
                <option key={seller.id || val} value={val}>
                  {val}
                </option>
              );
            })}
          </select>
        </div>
        <div>
          <label>{t('label_max_price')} {selectedCountry ? `(${currency})` : ''}</label>
          <input
            type="number"
            placeholder={selectedCountry ? `Max in ${currency}` : t('any_price')}
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
          />
        </div>
        <button
          className="search-go"
          onClick={() => {
            document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          {t('btn_search')}
        </button>
      </div>
    </div>
  );
}
