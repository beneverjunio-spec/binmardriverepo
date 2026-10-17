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

export const DEFAULT_LISTINGS = [];


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

