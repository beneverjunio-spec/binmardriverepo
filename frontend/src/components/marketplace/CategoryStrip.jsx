import React from 'react';

export default function CategoryStrip({ selectedCategory, setSelectedCategory }) {
  const categories = ['', 'SUV', 'Sedan', 'Pickup', 'Luxury'];

  return (
    <div className="cat-strip">
      {categories.map(cat => (
        <div
          key={cat}
          className={`cat-chip ${selectedCategory === cat ? 'active' : ''}`}
          onClick={() => setSelectedCategory(cat)}
        >
          {cat === '' ? 'All Vehicles' : (cat === 'Luxury' ? 'Luxury / Sports' : `${cat}s`)}
        </div>
      ))}
    </div>
  );
}
