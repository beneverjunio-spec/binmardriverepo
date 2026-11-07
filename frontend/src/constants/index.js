export const GCC_COUNTRIES = [
  'United Arab Emirates',
  'Saudi Arabia',
  'Qatar',
  'Kuwait',
  'Bahrain',
  'Oman'
];

export const GCC_CURRENCIES = ['AED', 'SAR', 'QAR', 'KWD', 'BHD', 'OMR'];

export const COUNTRY_CURRENCY_MAP = {
  'United Arab Emirates': 'AED',
  'Saudi Arabia': 'SAR',
  'Qatar': 'QAR',
  'Kuwait': 'KWD',
  'Bahrain': 'BHD',
  'Oman': 'OMR'
};

export function getCountryCurrency(country) {
  return COUNTRY_CURRENCY_MAP[country] || 'AED';
}

export const VEHICLE_MAKES = [
  'Toyota',
  'Nissan',
  'Mercedes-Benz',
  'Ford',
  'Lexus',
  'BMW',
  'Chevrolet',
  'Land Rover',
  'Porsche'
];

export const VEHICLE_CATEGORIES = ['SUV', 'Sedan', 'Pickup', 'Luxury'];

export const FUEL_TYPES = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];

export const TRANSMISSION_TYPES = ['Automatic', 'Manual'];

export const CONTACT_METHODS = ['WhatsApp', 'Phone call', 'In-app message'];

export const COUNTRY_DIAL_CODES = [
  { code: '+971', label: '+971 (UAE)' },
  { code: '+966', label: '+966 (KSA)' },
  { code: '+974', label: '+974 (Qatar)' },
  { code: '+965', label: '+965 (Kuwait)' },
  { code: '+973', label: '+973 (Bahrain)' },
  { code: '+968', label: '+968 (Oman)' },
  { code: '+92', label: '+92 (Pakistan)' },
  { code: '+91', label: '+91 (India)' },
  { code: '+44', label: '+44 (UK)' },
  { code: '+1', label: '+1 (USA/Canada)' }
];

export const CARD_GRADIENTS = [
  'linear-gradient(135deg,#0F3527,#1D4F3A)',
  'linear-gradient(135deg,#12281F,#2B4A3A)',
  'linear-gradient(135deg,#0A2A1F,#2F5443)',
  'linear-gradient(135deg,#173B2C,#3A6350)',
  'linear-gradient(135deg,#0D2E22,#254639)'
];

export const DEFAULT_LISTINGS = [
  {
    id: 1,
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
    seller_type: 'Verified Partner',
    contact_preference: 'WhatsApp',
    contact_phone: '+971501234567',
    whatsapp_number: '+971501234567',
    verified: true,
    featured: true,
    description: 'Immaculate 2024 Land Cruiser GR Sport V6 Twin Turbo. GCC specs with full agency service history, 360 camera, JBL premium audio, ventilated leather seats.',
    images: [
      'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=80'
    ],
    status: 'approved'
  },
  {
    id: 2,
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
    seller_type: 'Verified Partner',
    contact_preference: 'WhatsApp',
    contact_phone: '+971559876543',
    whatsapp_number: '+971559876543',
    verified: true,
    featured: true,
    description: 'Iconic Mercedes-AMG G63 in Matte Black Night Package. Burmester 3D surround sound, carbon fiber interior, massage seats.',
    images: [
      'https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1618843479313-40f5afb4bfc9?auto=format&fit=crop&w=800&q=80'
    ],
    status: 'approved'
  },
  {
    id: 3,
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
    seller_type: 'Verified Dealer',
    contact_preference: 'WhatsApp',
    contact_phone: '+971523344556',
    whatsapp_number: '+971523344556',
    verified: true,
    featured: true,
    description: 'Legendary Desert Master Nissan Patrol 5.6L V8 Titanium edition. Tan diamond leather, rear entertainment, adaptive suspension.',
    images: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=80'
    ],
    status: 'approved'
  },
  {
    id: 4,
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
    seller_type: 'Verified Dealer',
    contact_preference: 'WhatsApp',
    contact_phone: '+966501122334',
    whatsapp_number: '+966501122334',
    verified: true,
    featured: true,
    description: 'Flagship Lexus LX 600 Ultra Luxury 4-Seater. Executive rear Ottoman seating, Mark Levinson Reference audio, dual rear screens.',
    images: [
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80'
    ],
    status: 'approved'
  },
  {
    id: 5,
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
    seller_type: 'Verified Partner',
    contact_preference: 'WhatsApp',
    contact_phone: '+971501234567',
    whatsapp_number: '+971501234567',
    verified: true,
    featured: true,
    description: 'Pure motorsport engineering. Weissach Package with carbon aero kit, magnesium wheels, bucket seats, and ceramic composite brakes (PCCB).',
    images: [
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1000&q=80'
    ],
    status: 'approved'
  },
  {
    id: 6,
    title: '2024 Land Rover Defender 110 V8',
    make: 'Land Rover',
    model: 'Defender 110',
    year: 2024,
    category: 'SUV',
    fuel: 'Petrol',
    mileage: '6,100 km',
    transmission: 'Automatic',
    condition_type: 'used',
    listing_type: 'sale',
    price: 420000,
    currency: 'AED',
    price_label: 'AED 420,000',
    country: 'United Arab Emirates',
    city: 'Dubai',
    seller_name: 'Al Tayer Prestige Motors',
    seller_type: 'Verified Dealer',
    contact_preference: 'WhatsApp',
    contact_phone: '+971501234567',
    whatsapp_number: '+971501234567',
    verified: true,
    featured: true,
    description: '5.0L Supercharged V8 518 HP Defender 110 Carpathian Edition. Matrix LED, Meridian surround sound, refrigerated console.',
    images: [
      'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=1000&q=80'
    ],
    status: 'approved'
  },
  {
    id: 7,
    title: '2024 Ford F-150 Raptor R',
    make: 'Ford',
    model: 'F-150 Raptor R',
    year: 2024,
    category: 'Pickup',
    fuel: 'Petrol',
    mileage: '4,200 km',
    transmission: 'Automatic',
    condition_type: 'used',
    listing_type: 'sale',
    price: 395000,
    currency: 'AED',
    price_label: 'AED 395,000',
    country: 'United Arab Emirates',
    city: 'Dubai',
    seller_name: 'Desert Star Luxury Fleet',
    seller_type: 'Verified Partner',
    contact_preference: 'WhatsApp',
    contact_phone: '+971559876543',
    whatsapp_number: '+971559876543',
    verified: true,
    featured: true,
    description: 'Unleashed 5.2L Supercharged V8 Predator engine delivering 700 HP. FOX Live Valve shocks, Recaro carbon interior, beadlock wheels.',
    images: [
      'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=1000&q=80'
    ],
    status: 'approved'
  },
  {
    id: 8,
    title: '2023 BMW M4 Competition Coupe',
    make: 'BMW',
    model: 'M4 Competition',
    year: 2023,
    category: 'Luxury',
    fuel: 'Petrol',
    mileage: '11,000 km',
    transmission: 'Automatic',
    condition_type: 'used',
    listing_type: 'rent',
    price: 2200,
    currency: 'AED',
    price_label: 'AED 2,200 / day',
    country: 'United Arab Emirates',
    city: 'Dubai',
    seller_name: 'AGMC Luxury Fleet',
    seller_type: 'Verified Partner',
    contact_preference: 'WhatsApp',
    contact_phone: '+971523344556',
    whatsapp_number: '+971523344556',
    verified: true,
    featured: true,
    description: 'TwinPower Turbo inline-6 503 HP in Isle of Man Green. Carbon bucket seats, Harman Kardon audio, M Drive professional.',
    images: [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1000&q=80'
    ],
    status: 'approved'
  }
];

export const DEFAULT_ADMIN_DATA = {
  stats: {
    liveListings: 0,
    pendingModeration: 0,
    verifiedDealers: 0,
    pendingDealers: 0
  },
  moderationQueue: [],
  dealerQueue: [],
  adminListings: [],
  admins: [
    {
      id: 1,
      name: 'Binmar Group Admin',
      email: 'info@binmargroup.com',
      role: 'Super Admin',
      department: 'Executive Operations',
      country: 'United Arab Emirates',
      status: 'Active',
      created_at: '2026-01-15'
    },
    {
      id: 2,
      name: 'Operations Director',
      email: 'admin@binmardrive.com',
      role: 'Super Admin',
      department: 'Operations',
      country: 'United Arab Emirates',
      status: 'Active',
      created_at: '2026-01-15'
    },
    {
      id: 3,
      name: 'Benever Junio',
      email: 'beneverjunio@gmail.com',
      role: 'Super Admin',
      department: 'Operations',
      country: 'United Arab Emirates',
      status: 'Active',
      created_at: '2026-01-15'
    }
  ],
  notifications: []
};
