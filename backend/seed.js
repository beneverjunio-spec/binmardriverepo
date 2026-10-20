const { getPool, sql } = require('./config/db');

const initialVehicles = [
  {
    title: '2024 Toyota Land Cruiser GR-Sport',
    make: 'Toyota',
    model: 'Land Cruiser',
    year: 2024,
    category: 'SUV',
    fuel: 'Petrol',
    mileage: '12,500 km',
    transmission: 'Automatic',
    condition_type: 'used',
    listing_type: 'sale',
    price: 345000,
    currency: 'AED',
    price_label: 'AED 345,000',
    country: 'United Arab Emirates',
    city: 'Dubai',
    seller_name: 'Binmar Royal Motors',
    contact_preference: 'WhatsApp',
    contact_phone: '+971501234567',
    whatsapp_number: '+971501234567',
    description: 'Immaculate 2024 Land Cruiser GR Sport V6 Twin Turbo. GCC specs with full agency service history, 360 camera, JBL premium audio, ventilated leather seats.',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=1000&q=80'
    ]),
    status: 'approved'
  },
  {
    title: '2023 Mercedes-Benz G63 AMG',
    make: 'Mercedes-Benz',
    model: 'G63 AMG',
    year: 2023,
    category: 'SUV',
    fuel: 'Petrol',
    mileage: '18,000 km',
    transmission: 'Automatic',
    condition_type: 'used',
    listing_type: 'rent',
    price: 1800,
    currency: 'AED',
    price_label: 'AED 1,800 / day',
    country: 'United Arab Emirates',
    city: 'Dubai',
    seller_name: 'Desert Star Luxury Fleet',
    contact_preference: 'WhatsApp',
    contact_phone: '+971559876543',
    whatsapp_number: '+971559876543',
    description: 'Iconic Mercedes-AMG G63 in Matte Black Night Package. Burmester 3D surround sound, carbon fiber interior, massage seats.',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=1000&q=80'
    ]),
    status: 'approved'
  },
  {
    title: '2024 Nissan Patrol Titanium V8',
    make: 'Nissan',
    model: 'Patrol',
    year: 2024,
    category: 'SUV',
    fuel: 'Petrol',
    mileage: '8,200 km',
    transmission: 'Automatic',
    condition_type: 'used',
    listing_type: 'sale',
    price: 285000,
    currency: 'AED',
    price_label: 'AED 285,000',
    country: 'United Arab Emirates',
    city: 'Abu Dhabi',
    seller_name: 'Al Masaood Automobiles',
    contact_preference: 'WhatsApp',
    contact_phone: '+971523344556',
    whatsapp_number: '+971523344556',
    description: 'Legendary Desert Master Nissan Patrol 5.6L V8 Titanium edition. Tan diamond leather, rear entertainment, adaptive suspension.',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=80'
    ]),
    status: 'approved'
  },
  {
    title: '2024 Lexus LX 600 VIP 4-Seater',
    make: 'Lexus',
    model: 'LX 600',
    year: 2024,
    category: 'Luxury',
    fuel: 'Petrol',
    mileage: '5,000 km',
    transmission: 'Automatic',
    condition_type: 'new',
    listing_type: 'sale',
    price: 590000,
    currency: 'SAR',
    price_label: 'SAR 590,000',
    country: 'Saudi Arabia',
    city: 'Riyadh',
    seller_name: 'Abdul Latif Jameel Motors',
    contact_preference: 'WhatsApp',
    contact_phone: '+966501122334',
    whatsapp_number: '+966501122334',
    description: 'Flagship Lexus LX 600 Ultra Luxury 4-Seater. Executive rear Ottoman seating, Mark Levinson Reference audio, dual rear screens.',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80'
    ]),
    status: 'approved'
  },
  {
    title: '2024 Porsche 911 GT3 RS',
    make: 'Porsche',
    model: '911 GT3 RS',
    year: 2024,
    category: 'Luxury',
    fuel: 'Petrol',
    mileage: '2,400 km',
    transmission: 'Automatic',
    condition_type: 'used',
    listing_type: 'rent',
    price: 3500,
    currency: 'AED',
    price_label: 'AED 3,500 / day',
    country: 'United Arab Emirates',
    city: 'Dubai',
    seller_name: 'Binmar Royal Motors',
    contact_preference: 'WhatsApp',
    contact_phone: '+971501234567',
    whatsapp_number: '+971501234567',
    description: 'Pure motorsport engineering. Weissach Package with carbon aero kit, magnesium wheels, bucket seats, and ceramic composite brakes (PCCB).',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1000&q=80'
    ]),
    status: 'approved'
  }
];

async function seed() {
  const pool = await getPool();
  const check = await pool.request().query('SELECT COUNT(*) as count FROM listings');
  if (check.recordset[0].count > 0) {
    console.log('Database already has listings. Skipping seed.');
    process.exit(0);
  }

  console.log('Seeding initial vehicle listings to MSSQL database...');
  for (const v of initialVehicles) {
    const req = pool.request();
    req.input('title', sql.NVarChar, v.title);
    req.input('make', sql.NVarChar, v.make);
    req.input('model', sql.NVarChar, v.model);
    req.input('year', sql.Int, v.year);
    req.input('category', sql.NVarChar, v.category);
    req.input('fuel', sql.NVarChar, v.fuel);
    req.input('mileage', sql.NVarChar, v.mileage);
    req.input('transmission', sql.NVarChar, v.transmission);
    req.input('condition_type', sql.NVarChar, v.condition_type);
    req.input('listing_type', sql.NVarChar, v.listing_type);
    req.input('price', sql.Decimal(14, 2), v.price);
    req.input('currency', sql.NVarChar, v.currency);
    req.input('price_label', sql.NVarChar, v.price_label);
    req.input('country', sql.NVarChar, v.country);
    req.input('city', sql.NVarChar, v.city);
    req.input('seller_name', sql.NVarChar, v.seller_name);
    req.input('contact_preference', sql.NVarChar, v.contact_preference);
    req.input('contact_phone', sql.NVarChar, v.contact_phone);
    req.input('whatsapp_number', sql.NVarChar, v.whatsapp_number);
    req.input('description', sql.NVarChar, v.description);
    req.input('images', sql.NVarChar, v.images);
    req.input('status', sql.NVarChar, v.status);

    await req.query(`
      INSERT INTO listings (
        title, make, model, year, category, fuel, mileage, transmission,
        condition_type, listing_type, price, currency, price_label, country,
        city, seller_name, contact_preference, contact_phone, whatsapp_number,
        description, images, status
      ) VALUES (
        @title, @make, @model, @year, @category, @fuel, @mileage, @transmission,
        @condition_type, @listing_type, @price, @currency, @price_label, @country,
        @city, @seller_name, @contact_preference, @contact_phone, @whatsapp_number,
        @description, @images, @status
      )
    `);
  }

  console.log(`Successfully seeded ${initialVehicles.length} vehicles into MSSQL listings table!`);
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
