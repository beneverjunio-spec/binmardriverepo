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
    model: 'Land Cruiser GR-Sport',
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
    seller_name: 'Al Futtaim Motors Certified',
    contact_preference: 'WhatsApp',
    whatsapp_number: '+971501234567',
    contact_phone: '+971501234567',
    description: 'Immaculate 2024 Land Cruiser 3.5L Twin-Turbo V6 GR Sport. Full agency service record, ceramic tinted, zero accident history.',
    images: [
      'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1000&q=80'
    ],
    status: 'approved'
  },
  {
    id: 2,
    title: '2023 Mercedes-Benz G63 AMG',
    make: 'Mercedes-Benz',
    model: 'G63 AMG',
    year: 2023,
    category: 'Luxury',
    fuel: 'Petrol',
    mileage: '8,200 km',
    transmission: 'Automatic',
    condition_type: 'used',
    listing_type: 'sale',
    price: 790000,
    currency: 'AED',
    price_label: 'AED 790,000',
    country: 'United Arab Emirates',
    city: 'Abu Dhabi',
    seller_name: 'Al Tayer Prestige Motors',
    contact_preference: 'WhatsApp',
    whatsapp_number: '+971529876543',
    contact_phone: '+971529876543',
    description: 'GCC Specs G63 AMG with Night Package II, carbon fiber trim, dynamic bolster seats, 22-inch forged cross-spoke wheels.',
    images: [
      'https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1000&q=80'
    ],
    status: 'approved'
  },
  {
    id: 3,
    title: '2025 Porsche 911 GT3 RS',
    make: 'Porsche',
    model: '911 GT3 RS',
    year: 2025,
    category: 'Luxury',
    fuel: 'Petrol',
    mileage: '1,200 km',
    transmission: 'Automatic',
    condition_type: 'new',
    listing_type: 'sale',
    price: 1250000,
    currency: 'AED',
    price_label: 'AED 1,250,000',
    country: 'United Arab Emirates',
    city: 'Dubai',
    seller_name: 'Binmar Royal Exotics',
    contact_preference: 'WhatsApp',
    whatsapp_number: '+971553334455',
    contact_phone: '+971553334455',
    description: 'Weissach Package, magnesium lightweight wheels, PCCB carbon-ceramic brakes. Brand new delivery mileage.',
    images: [
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80'
    ],
    status: 'approved'
  },
  {
    id: 4,
    title: '2024 Nissan Patrol NISMO 5.6L',
    make: 'Nissan',
    model: 'Patrol NISMO',
    year: 2024,
    category: 'SUV',
    fuel: 'Petrol',
    mileage: '15,000 km',
    transmission: 'Automatic',
    condition_type: 'used',
    listing_type: 'rent',
    price: 950,
    currency: 'AED',
    price_label: 'AED 950 / day',
    country: 'United Arab Emirates',
    city: 'Dubai',
    seller_name: 'Desert Star Luxury Rentals',
    contact_preference: 'WhatsApp',
    whatsapp_number: '+971561122334',
    contact_phone: '+971561122334',
    description: '428 hp handcrafted NISMO engine, Bilstein sport-tuned suspension, Alcantara upholstery. Daily, weekly or monthly rental available.',
    images: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=80'
    ],
    status: 'approved'
  },
  {
    id: 5,
    title: '2024 Lexus LX 600 VIP Edition',
    make: 'Lexus',
    model: 'LX 600 VIP',
    year: 2024,
    category: 'SUV',
    fuel: 'Petrol',
    mileage: '6,400 km',
    transmission: 'Automatic',
    condition_type: 'used',
    listing_type: 'sale',
    price: 520000,
    currency: 'SAR',
    price_label: 'SAR 520,000',
    country: 'Saudi Arabia',
    city: 'Riyadh',
    seller_name: 'Abdul Latif Jameel Motors',
    contact_preference: 'WhatsApp',
    whatsapp_number: '+966501234567',
    contact_phone: '+966501234567',
    description: '4-seater executive VIP layout with rear ottoman recliner, Mark Levinson 25-speaker sound system, head-up display.',
    images: [
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80'
    ],
    status: 'approved'
  },
  {
    id: 6,
    title: '2024 Ford F-150 Raptor R 5.2L V8',
    make: 'Ford',
    model: 'F-150 Raptor R',
    year: 2024,
    category: 'Pickup',
    fuel: 'Petrol',
    mileage: '9,000 km',
    transmission: 'Automatic',
    condition_type: 'used',
    listing_type: 'sale',
    price: 460000,
    currency: 'AED',
    price_label: 'AED 460,000',
    country: 'United Arab Emirates',
    city: 'Sharjah',
    seller_name: 'Al Tayer Motors',
    contact_preference: 'WhatsApp',
    whatsapp_number: '+971507788990',
    contact_phone: '+971507788990',
    description: 'Supercharged 700hp 5.2L V8, FOX Live Valve shocks, 37-inch all-terrain tires. Ultimate off-road performance.',
    images: [
      'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=1000&q=80'
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
      name: 'Operations Director',
      email: 'admin@binmardrive.com',
      role: 'Super Admin',
      department: 'Operations',
      country: 'United Arab Emirates',
      status: 'Active',
      created_at: '2026-01-15'
    },
    {
      id: 2,
      name: 'Tariq Mansoor',
      email: 'tariq@binmardrive.com',
      role: 'Listing Moderator',
      department: 'Vehicle Moderation',
      country: 'United Arab Emirates',
      status: 'Active',
      created_at: '2026-02-10'
    },
    {
      id: 3,
      name: 'Faisal Al-Otaibi',
      email: 'faisal@binmardrive.com',
      role: 'Dealer Auditor',
      department: 'Compliance',
      country: 'Saudi Arabia',
      status: 'Active',
      created_at: '2026-03-01'
    }
  ],
  notifications: []
};

