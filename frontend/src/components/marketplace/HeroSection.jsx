import React from 'react';
import { GCC_COUNTRIES, VEHICLE_MAKES, getCountryCurrency } from '../../constants';

export default function HeroSection({
  selectedMake,
  setSelectedMake,
  selectedCountry,
  setSelectedCountry,
  selectedType,
  setSelectedType,
  maxPrice,
  setMaxPrice
}) {
  const currency = getCountryCurrency(selectedCountry);

  return (
    <div className="hero">
      <span className="hero-badge">Free to register anywhere</span>
      <h1>Buy, sell or rent a car, <em>free</em> across the Middle East.</h1>
      <p>No listing fees for owners, dealers or first-time sellers. Thousands of new and used vehicles, updated daily.</p>

      {/* Filter Searchbar */}
      <div className="searchbar">
        <div>
          <label>Make</label>
          <select value={selectedMake} onChange={e => setSelectedMake(e.target.value)}>
            <option value="">Any make</option>
            {VEHICLE_MAKES.map(make => (
              <option key={make} value={make}>{make}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Country</label>
          <select value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)}>
            <option value="">Any country</option>
            {GCC_COUNTRIES.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Type</label>
          <select value={selectedType} onChange={e => setSelectedType(e.target.value)}>
            <option value="">Buy or rent</option>
            <option value="sale">For sale</option>
            <option value="rent">For rent</option>
          </select>
        </div>
        <div>
          <label>Max price {selectedCountry ? `(${currency})` : ''}</label>
          <input
            type="number"
            placeholder={selectedCountry ? `Max in ${currency}` : 'Any price'}
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
          Search
        </button>
      </div>
    </div>
  );
}
