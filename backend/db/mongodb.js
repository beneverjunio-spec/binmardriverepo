const mongoose = require('mongoose');
mongoose.set('bufferCommands', false);

// ==========================================
// Schemas
// ==========================================
const listingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  make: { type: String, required: true, index: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  category: { type: String, default: 'SUV', index: true },
  fuel: { type: String, default: 'Petrol' },
  mileage: { type: String, default: '0 km' },
  transmission: { type: String, default: 'Automatic' },
  condition_type: { type: String, default: 'used' },
  listing_type: { type: String, default: 'sale', index: true },
  price: { type: Number, required: true, index: true },
  currency: { type: String, default: 'AED' },
  price_label: { type: String },
  country: { type: String, default: 'United Arab Emirates', index: true },
  city: { type: String, default: 'Dubai' },
  seller_name: { type: String, default: 'Owner' },
  contact_preference: { type: String, default: 'WhatsApp' },
  contact_phone: { type: String, default: '+971501234567' },
  whatsapp_number: { type: String, default: '+971501234567' },
  description: { type: String, default: '' },
  images: { type: [String], default: [] },
  document_name: { type: String },
  document_file: { type: String },
  document_url: { type: String },
  rejection_reason: { type: String, default: null },
  status: { type: String, default: 'approved', index: true }, // 'approved', 'pending', 'rejected'
  created_at: { type: Date, default: Date.now }
}, { bufferCommands: false });

listingSchema.virtual('id').get(function() {
  return this._id.toHexString();
});
listingSchema.set('toJSON', { virtuals: true });
listingSchema.set('toObject', { virtuals: true });

const userSchema = new mongoose.Schema({
  identity_id: { type: String, unique: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true },
  user_type: { type: String, enum: ['individual', 'company', 'admin'], default: 'individual' },
  phone: { type: String },
  company_name: { type: String },
  trade_license: { type: String },
  trade_license_file: { type: String },
  trade_license_url: { type: String },
  country: { type: String, default: 'United Arab Emirates' },
  status: { type: String, default: 'approved' }, // 'approved', 'pending', 'rejected'
  created_at: { type: Date, default: Date.now }
}, { bufferCommands: false });

userSchema.virtual('id').get(function() {
  return this._id.toHexString();
});
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  is_read: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
}, { bufferCommands: false });

notificationSchema.virtual('id').get(function() {
  return this._id.toHexString();
});
notificationSchema.set('toJSON', { virtuals: true });
notificationSchema.set('toObject', { virtuals: true });

const Listing = mongoose.models.Listing || mongoose.model('Listing', listingSchema);
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

// Initial Seed Dataset
const sampleVehicles = [
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
    images: ['https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=1000&q=80'],
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
    images: ['https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=1000&q=80'],
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
    images: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=80'],
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
    images: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80'],
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
    images: ['https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1000&q=80'],
    status: 'approved'
  }
];

async function connectMongoDB(uri) {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (!uri) throw new Error('MONGODB_URI is not configured in .env');

  console.log('[MongoDB] Connecting to MongoDB Cluster...');
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 8000,
    dbName: 'binmardrive'
  });
  console.log('[MongoDB] Connected successfully to MongoDB (database: binmardrive)');

  // Auto-seed: DO NOT seed sample/demo vehicles. Marketplace only shows real admin-approved listings.
  // Sample vehicle seeding removed intentionally so the marketplace starts empty
  // and only shows what admin has approved.

  // Create default admin user if none exists
  const adminCount = await User.countDocuments({ user_type: 'admin' });
  if (adminCount === 0) {
    await User.create({
      identity_id: 'admin_root',
      email: process.env.ADMIN_EMAIL || 'beneverjunio@gmail.com',
      name: 'Binmar Administrator',
      user_type: 'admin',
      status: 'approved',
      country: 'United Arab Emirates'
    });
  }

  return mongoose.connection;
}


// ==========================================
// In-Memory Fallback Store (active when Atlas IP is pending whitelist)
// Empty by default — only admin-approved listings go live
// ==========================================
let inMemoryListings = [];

let inMemoryUsers = [
  {
    id: 'usr_admin',
    _id: 'usr_admin',
    identity_id: 'admin_root',
    email: process.env.ADMIN_EMAIL || 'beneverjunio@gmail.com',
    name: 'Binmar Administrator',
    company_name: 'Binmar Administrator',
    user_type: 'admin',
    status: 'approved',
    country: 'United Arab Emirates',
    trade_license: 'CN-SUPERADMIN-01',
    created_at: new Date()
  }
];

let inMemoryNotifications = [
  {
    id: 'notif_1',
    _id: 'notif_1',
    title: 'System Initialized',
    message: 'BinmarDrive operational and ready.',
    is_read: false,
    created_at: new Date()
  }
];

function isConnected() {
  return mongoose.connection.readyState === 1;
}

async function findListings(filter = {}, sortOption = { _id: -1 }) {
  if (isConnected()) {
    try {
      const docs = await Listing.find(filter).sort(sortOption).lean();
      return docs.map(d => ({ ...d, id: d._id.toString() }));
    } catch (e) {
      console.warn('[DB] Fallback to in-memory listings:', e.message);
    }
  }

  let results = [...inMemoryListings];
  if (filter.status) {
    results = results.filter(r => (r.status || 'approved').toLowerCase() === filter.status.toLowerCase());
  }
  if (filter.make instanceof RegExp) {
    results = results.filter(r => filter.make.test(r.make || ''));
  }
  if (filter.country instanceof RegExp) {
    results = results.filter(r => filter.country.test(r.country || ''));
  }
  if (filter.listing_type instanceof RegExp) {
    results = results.filter(r => filter.listing_type.test(r.listing_type || ''));
  }
  if (filter.category instanceof RegExp) {
    results = results.filter(r => filter.category.test(r.category || ''));
  }
  if (filter.price && filter.price.$lte) {
    results = results.filter(r => Number(r.price) <= filter.price.$lte);
  }
  if (filter.$or) {
    results = results.filter(r => {
      return filter.$or.some(cond => {
        if (cond.title && cond.title.test) return cond.title.test(r.title || '');
        if (cond.seller_name && cond.seller_name.test) return cond.seller_name.test(r.seller_name || '');
        return false;
      });
    });
  }

  if (sortOption.price === 1) results.sort((a, b) => Number(a.price) - Number(b.price));
  else if (sortOption.price === -1) results.sort((a, b) => Number(b.price) - Number(a.price));
  else results.reverse();

  return results;
}

async function createListing(data) {
  if (isConnected()) {
    try {
      const doc = await Listing.create(data);
      return { ...doc.toObject(), id: doc._id.toString() };
    } catch (e) {
      console.warn('[DB] Fallback create in-memory:', e.message);
    }
  }
  const newDoc = {
    ...data,
    _id: 'mem_' + Date.now(),
    id: 'mem_' + Date.now(),
    created_at: new Date()
  };
  inMemoryListings.unshift(newDoc);
  return newDoc;
}

async function updateListing(id, updates) {
  if (isConnected()) {
    try {
      const doc = await Listing.findByIdAndUpdate(id, updates, { new: true }).lean();
      if (doc) return { ...doc, id: doc._id.toString() };
    } catch (e) {
      console.warn('[DB] Fallback update in-memory:', e.message);
    }
  }
  const idx = inMemoryListings.findIndex(l => String(l.id) === String(id) || String(l._id) === String(id));
  if (idx !== -1) {
    inMemoryListings[idx] = { ...inMemoryListings[idx], ...updates };
    return inMemoryListings[idx];
  }
  return null;
}

async function deleteListing(id) {
  if (isConnected()) {
    try {
      await Listing.findByIdAndDelete(id);
      return true;
    } catch (e) {}
  }
  inMemoryListings = inMemoryListings.filter(l => String(l.id) !== String(id) && String(l._id) !== String(id));
  return true;
}

async function findUsers() {
  if (isConnected()) {
    try {
      const docs = await User.find().sort({ _id: -1 }).lean();
      return docs.map(d => ({ ...d, id: d._id.toString() }));
    } catch (e) {}
  }
  return [...inMemoryUsers];
}

async function upsertUser(email, data) {
  if (isConnected()) {
    try {
      const user = await User.findOneAndUpdate(
        { email },
        data,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ).lean();
      return { ...user, id: user._id.toString() };
    } catch (e) {}
  }
  const idx = inMemoryUsers.findIndex(u => (u.email || '').toLowerCase() === email.toLowerCase());
  if (idx !== -1) {
    inMemoryUsers[idx] = { ...inMemoryUsers[idx], ...data };
    return inMemoryUsers[idx];
  }
  const newUser = {
    ...data,
    email,
    _id: 'usr_' + Date.now(),
    id: 'usr_' + Date.now(),
    created_at: new Date()
  };
  inMemoryUsers.unshift(newUser);
  return newUser;
}

async function updateUser(id, updates) {
  if (isConnected()) {
    try {
      const doc = await User.findByIdAndUpdate(id, updates, { new: true }).lean();
      if (doc) return { ...doc, id: doc._id.toString() };
    } catch (e) {}
  }
  const idx = inMemoryUsers.findIndex(u => String(u.id) === String(id) || String(u._id) === String(id));
  if (idx !== -1) {
    inMemoryUsers[idx] = { ...inMemoryUsers[idx], ...updates };
    return inMemoryUsers[idx];
  }
  return null;
}

async function findNotifications() {
  if (isConnected()) {
    try {
      const docs = await Notification.find().sort({ _id: -1 }).lean();
      return docs.map(d => ({ ...d, id: d._id.toString() }));
    } catch (e) {}
  }
  return [...inMemoryNotifications];
}

async function createNotification(title, message) {
  if (isConnected()) {
    try {
      await Notification.create({ title, message });
      return;
    } catch (e) {}
  }
  inMemoryNotifications.unshift({
    id: 'notif_' + Date.now(),
    _id: 'notif_' + Date.now(),
    title,
    message,
    is_read: false,
    created_at: new Date()
  });
}

async function markNotificationRead(id) {
  if (isConnected()) {
    try {
      await Notification.findByIdAndUpdate(id, { is_read: true });
      return;
    } catch (e) {}
  }
  const notif = inMemoryNotifications.find(n => String(n.id) === String(id) || String(n._id) === String(id));
  if (notif) notif.is_read = true;
}

async function getStats() {
  if (isConnected()) {
    try {
      const liveListings = await Listing.countDocuments({ status: 'approved' });
      const pendingModeration = await Listing.countDocuments({ status: 'pending' });
      const verifiedDealers = await User.countDocuments({ status: 'approved' });
      const pendingDealers = await User.countDocuments({ status: 'pending' });
      return { liveListings, pendingModeration, verifiedDealers, pendingDealers };
    } catch (e) {}
  }
  return {
    liveListings: inMemoryListings.filter(l => l.status === 'approved').length,
    pendingModeration: inMemoryListings.filter(l => l.status === 'pending').length,
    verifiedDealers: inMemoryUsers.filter(u => u.status === 'approved').length,
    pendingDealers: inMemoryUsers.filter(u => u.status === 'pending').length
  };
}

module.exports = {
  connectMongoDB,
  isConnected,
  Listing,
  User,
  Notification,
  findListings,
  createListing,
  updateListing,
  deleteListing,
  findUsers,
  upsertUser,
  updateUser,
  findNotifications,
  createNotification,
  markNotificationRead,
  getStats
};
