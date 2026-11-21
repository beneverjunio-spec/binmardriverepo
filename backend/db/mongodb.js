const fs = require('fs');
const path = require('path');
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
  seller_email: { type: String, default: 'seller@binmardrive.com' },
  contact_preference: { type: String, default: 'WhatsApp' },
  contact_phone: { type: String, default: '+971526539699' },
  whatsapp_number: { type: String, default: '+971526539699' },
  description: { type: String, default: '' },
  images: { type: [String], default: [] },
  document_name: { type: String },
  document_file: { type: String },
  document_url: { type: String },
  rejection_reason: { type: String, default: null },
  resubmitted: { type: Boolean, default: false },
  resubmitted_at: { type: Date },
  status: { type: String, default: 'pending', index: true }, // 'approved', 'pending', 'rejected'
  created_at: { type: Date, default: Date.now }
}, { bufferCommands: false });

listingSchema.virtual('id').get(function() {
  return this._id.toHexString();
});
listingSchema.set('toJSON', { virtuals: true });
listingSchema.set('toObject', { virtuals: true });

const userSchema = new mongoose.Schema({
  identity_id: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true },
  user_type: { type: String, enum: ['individual', 'company', 'admin'], default: 'individual' },
  phone: { type: String },
  company_name: { type: String },
  trade_license: { type: String },
  trade_license_file: { type: String },
  trade_license_url: { type: String },
  country: { type: String, default: 'United Arab Emirates' },
  password: { type: String },
  role: { type: String, default: 'Seller' },
  department: { type: String },
  is_verified_seller: { type: Boolean, default: false },
  status: { type: String, default: 'pending' }, // 'approved', 'pending', 'rejected'
  created_at: { type: Date, default: Date.now }
}, { bufferCommands: false });

userSchema.virtual('id').get(function() {
  return this._id.toHexString();
});
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, default: 'Listing Moderator' },
  department: { type: String, default: 'Vehicle Moderation' },
  country: { type: String, default: 'United Arab Emirates' },
  status: { type: String, default: 'Active' },
  created_at: { type: Date, default: Date.now }
}, { bufferCommands: false });

adminSchema.virtual('id').get(function() {
  return this._id.toHexString();
});
adminSchema.set('toJSON', { virtuals: true });
adminSchema.set('toObject', { virtuals: true });

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

const enquirySchema = new mongoose.Schema({
  seller_name: { type: String, required: true, index: true },
  seller_phone: { type: String, default: '+971526539699' },
  listing_id: { type: String, required: true, index: true },
  listing_title: { type: String, required: true },
  vehicle_brand: { type: String, default: '' },
  vehicle_model: { type: String, default: '' },
  reference_id: { type: String, default: '' },
  enquiry_type: { type: String, enum: ['sale', 'rent'], default: 'sale', index: true },
  price_label: { type: String, default: '' },
  customer_name: { type: String, default: null },
  customer_phone: { type: String, default: null },
  whatsapp_link: { type: String, default: '' },
  source: { type: String, default: 'marketplace' },
  ip: { type: String, default: '' },
  user_agent: { type: String, default: '' },
  created_at: { type: Date, default: Date.now, index: true }
}, { bufferCommands: false });

enquirySchema.virtual('id').get(function() {
  return this._id.toHexString();
});
enquirySchema.set('toJSON', { virtuals: true });
enquirySchema.set('toObject', { virtuals: true });

const Listing = mongoose.models.Listing || mongoose.model('Listing', listingSchema);
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);
const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
const Enquiry = mongoose.models.Enquiry || mongoose.model('Enquiry', enquirySchema);

const blogPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  excerpt: { type: String, default: '' },
  content: { type: String, default: '' },
  cover_image: { type: String, default: '' },
  cover_image_alt: { type: String, default: '' },
  category: { type: String, default: 'General', index: true },
  author: { type: String, default: 'Binmar Drive Team' },
  reading_time: { type: String, default: '5 min read' },
  meta_title: { type: String, default: '' },
  meta_description: { type: String, default: '' },
  status: { type: String, enum: ['published', 'draft'], default: 'published', index: true },
  views: { type: Number, default: 0 },
  published_at: { type: Date, default: Date.now },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, { bufferCommands: false });

blogPostSchema.virtual('id').get(function() {
  return this._id.toHexString();
});
blogPostSchema.set('toJSON', { virtuals: true });
blogPostSchema.set('toObject', { virtuals: true });

const BlogPost = mongoose.models.BlogPost || mongoose.model('BlogPost', blogPostSchema);

// ==========================================
// In-Memory & File Store Persistence
// ==========================================
const DATA_DIR = path.join(__dirname, '..', 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');
const seedBlogPosts = require('../data/seedBlogPosts');

let inMemoryListings = [];
let inMemoryUsers = [];
let inMemoryBlogPosts = Array.isArray(seedBlogPosts) ? [...seedBlogPosts] : [];
let inMemoryAdmins = [
  {
    id: 1,
    name: 'Operations Director',
    email: 'admin@binmardrive.com',
    password: 'admin123',
    role: 'Super Admin',
    department: 'Operations',
    country: 'United Arab Emirates',
    status: 'Active',
    created_at: '2026-01-15'
  },
  {
    id: 2,
    name: 'Benever Junio',
    email: 'beneverjunio@gmail.com',
    password: '12345678',
    role: 'Super Admin',
    department: 'Operations',
    country: 'United Arab Emirates',
    status: 'Active',
    created_at: '2026-01-15'
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

function buildDefaultEnquiries() {
  const list = [];
  const now = new Date('2026-11-18T10:30:00.000Z');

  // 1. Binmar Motors (25 enquiries: 18 sale, 7 rent)
  const binmarModels = [
    { title: '2024 Toyota Land Cruiser GR-Sport', brand: 'Toyota', model: 'Land Cruiser', type: 'sale', price: 'AED 345,000', ref: 'REF-101' },
    { title: '2023 Mercedes-Benz G63 AMG Night Package', brand: 'Mercedes-Benz', model: 'G63 AMG', type: 'rent', price: 'AED 1,800 / day', ref: 'REF-102' },
    { title: '2024 Lexus LX600 Signature', brand: 'Lexus', model: 'LX600', type: 'sale', price: 'AED 510,000', ref: 'REF-103' },
    { title: '2024 Nissan Patrol Titanium V8', brand: 'Nissan', model: 'Patrol', type: 'sale', price: 'AED 295,000', ref: 'REF-104' },
    { title: '2023 Range Rover Autobiography', brand: 'Land Rover', model: 'Range Rover', type: 'rent', price: 'AED 2,200 / day', ref: 'REF-105' }
  ];
  for (let i = 1; i <= 25; i++) {
    const preset = binmarModels[(i - 1) % binmarModels.length];
    const isRent = i % 4 === 0 || i % 7 === 0;
    const type = isRent ? 'rent' : 'sale';
    const minsAgo = (25 - i) * 35;
    const date = new Date(now.getTime() - minsAgo * 60000);
    list.push({
      id: `enq_binmar_${i}`,
      _id: `enq_binmar_${i}`,
      seller_name: 'Binmar Motors',
      seller_phone: '+971526539699',
      listing_id: String(100 + (i % 5)),
      listing_title: preset.title,
      vehicle_brand: preset.brand,
      vehicle_model: preset.model,
      reference_id: `REF-BMD-${100 + (i % 5)}`,
      enquiry_type: type,
      price_label: type === 'rent' ? 'AED 1,500 / day' : preset.price,
      customer_name: i % 3 === 0 ? `Ahmed Al Mansoori` : i % 5 === 0 ? `Rashid Saeed` : null,
      customer_phone: `+97150${Math.floor(1000000 + (i * 27361) % 8999999)}`,
      whatsapp_link: `https://wa.me/971501234567?text=${encodeURIComponent('Hello! I am inquiring about ' + preset.title + ' on BinmarDrive.')}`,
      source: i % 2 === 0 ? 'detail_page' : 'listing_card',
      created_at: date
    });
  }

  // 2. ABC Motors (14 enquiries: 10 sale, 4 rent)
  const abcModels = [
    { title: '2023 Toyota Camry GLE Hybrid', brand: 'Toyota', model: 'Camry', type: 'sale', price: 'AED 98,000', ref: 'REF-201' },
    { title: '2022 BMW M5 Competition', brand: 'BMW', model: 'M5', type: 'sale', price: 'AED 385,000', ref: 'REF-202' },
    { title: '2024 Mercedes-Benz C300 AMG Line', brand: 'Mercedes-Benz', model: 'C300', type: 'rent', price: 'AED 650 / day', ref: 'REF-203' },
    { title: '2023 Audi RS6 Avant Quattro', brand: 'Audi', model: 'RS6', type: 'sale', price: 'AED 440,000', ref: 'REF-204' }
  ];
  for (let i = 1; i <= 14; i++) {
    const preset = abcModels[(i - 1) % abcModels.length];
    const isRent = i % 3 === 0;
    const type = isRent ? 'rent' : 'sale';
    const minsAgo = (14 - i) * 75 + 40;
    const date = new Date(now.getTime() - minsAgo * 60000);
    list.push({
      id: `enq_abc_${i}`,
      _id: `enq_abc_${i}`,
      seller_name: 'ABC Motors',
      seller_phone: '+971559876543',
      listing_id: String(200 + (i % 4)),
      listing_title: preset.title,
      vehicle_brand: preset.brand,
      vehicle_model: preset.model,
      reference_id: `REF-ABC-${200 + (i % 4)}`,
      enquiry_type: type,
      price_label: type === 'rent' ? 'AED 650 / day' : preset.price,
      customer_name: i % 2 === 0 ? `Mohamed Tariq` : null,
      customer_phone: `+97155${Math.floor(2000000 + (i * 38291) % 7999999)}`,
      whatsapp_link: `https://wa.me/971559876543?text=${encodeURIComponent('Hello! I am inquiring about ' + preset.title + ' on BinmarDrive.')}`,
      source: 'detail_modal',
      created_at: date
    });
  }

  // 3. John Cars (8 enquiries: 5 sale, 3 rent)
  const johnModels = [
    { title: '2022 Ford Mustang GT Premium 5.0L', brand: 'Ford', model: 'Mustang', type: 'sale', price: 'AED 165,000', ref: 'REF-301' },
    { title: '2023 Porsche 911 Carrera S', brand: 'Porsche', model: '911', type: 'rent', price: 'AED 2,400 / day', ref: 'REF-302' },
    { title: '2021 Dodge Charger Scat Pack 392', brand: 'Dodge', model: 'Charger', type: 'sale', price: 'AED 155,000', ref: 'REF-303' }
  ];
  for (let i = 1; i <= 8; i++) {
    const preset = johnModels[(i - 1) % johnModels.length];
    const isRent = i % 3 === 0;
    const type = isRent ? 'rent' : 'sale';
    const minsAgo = (8 - i) * 120 + 90;
    const date = new Date(now.getTime() - minsAgo * 60000);
    list.push({
      id: `enq_john_${i}`,
      _id: `enq_john_${i}`,
      seller_name: 'John Cars',
      seller_phone: '+971527621325',
      listing_id: String(300 + (i % 3)),
      listing_title: preset.title,
      vehicle_brand: preset.brand,
      vehicle_model: preset.model,
      reference_id: `REF-JC-${300 + (i % 3)}`,
      enquiry_type: type,
      price_label: type === 'rent' ? 'AED 2,400 / day' : preset.price,
      customer_name: i % 2 === 0 ? `Khalid Al Shamsi` : null,
      customer_phone: `+97152${Math.floor(3000000 + (i * 49201) % 6999999)}`,
      whatsapp_link: `https://wa.me/971527621325?text=${encodeURIComponent('Hello! I am inquiring about ' + preset.title + ' on BinmarDrive.')}`,
      source: 'listing_card',
      created_at: date
    });
  }

  return list;
}

let inMemoryEnquiries = buildDefaultEnquiries();

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch {}
  }
}

function loadStoreFromFile() {
  ensureDataDir();
  if (fs.existsSync(STORE_FILE)) {
    try {
      const content = fs.readFileSync(STORE_FILE, 'utf8');
      const data = JSON.parse(content);
      if (Array.isArray(data.listings)) inMemoryListings = data.listings;
      if (Array.isArray(data.users)) inMemoryUsers = data.users;
      if (Array.isArray(data.notifications)) inMemoryNotifications = data.notifications;
      if (Array.isArray(data.admins) && data.admins.length > 0) inMemoryAdmins = data.admins;
      if (Array.isArray(data.enquiries) && data.enquiries.length > 0) inMemoryEnquiries = data.enquiries;
    } catch (e) {
      console.warn('[DB] Could not read store.json:', e.message);
    }
  }
}

function saveStoreToFile() {
  ensureDataDir();
  try {
    const data = {
      listings: inMemoryListings,
      users: inMemoryUsers,
      notifications: inMemoryNotifications,
      admins: inMemoryAdmins,
      enquiries: inMemoryEnquiries
    };
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.warn('[DB] Could not write store.json:', e.message);
  }
}

// Initial load
loadStoreFromFile();

function isConnected() {
  return mongoose.connection.readyState === 1;
}

// ==========================================
// Database Connection
// ==========================================
async function connectMongoDB(uri) {
  if (mongoose.connection.readyState >= 1) return mongoose.connection;
  
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000
  });

  console.log('[MongoDB] Connected successfully to Atlas cluster.');
  return mongoose.connection;
}

// ==========================================
// Listings Operations
// ==========================================
async function findListings(filter = {}, sortOption = { _id: -1 }) {
  if (isConnected()) {
    try {
      const docs = await Listing.find(filter).sort(sortOption).lean();
      return docs.map(d => ({ ...d, id: d._id.toString() }));
    } catch (e) {
      console.warn('[DB] Fallback to store listings:', e.message);
    }
  }

  let results = [...inMemoryListings];
  if (filter.status) {
    results = results.filter(r => (r.status || 'pending').toLowerCase() === filter.status.toLowerCase());
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
  const newDoc = {
    ...data,
    id: String(data.id || Date.now()),
    _id: String(data.id || Date.now()),
    created_at: new Date()
  };

  if (isConnected()) {
    try {
      const doc = await Listing.create(data);
      newDoc.id = doc._id.toString();
      newDoc._id = doc._id.toString();
    } catch (e) {
      console.warn('[DB] Atlas create failed, saved to store:', e.message);
    }
  }

  inMemoryListings.unshift(newDoc);
  saveStoreToFile();
  return newDoc;
}

async function updateListing(id, updates) {
  if (isConnected()) {
    try {
      let doc = null;
      if (mongoose.isValidObjectId(id)) {
        doc = await Listing.findByIdAndUpdate(id, updates, { new: true }).lean();
      } else {
        doc = await Listing.findOneAndUpdate(
          { $or: [{ id: String(id) }, { _id: id }] },
          updates,
          { new: true }
        ).lean();
      }
      if (doc) {
        const result = { ...doc, id: doc._id.toString() };
        const idx = inMemoryListings.findIndex(l => String(l.id) === String(id) || String(l._id) === String(id));
        if (idx !== -1) inMemoryListings[idx] = result;
        saveStoreToFile();
        return result;
      }
    } catch (e) {
      console.warn('[DB] Atlas update fallback to store:', e.message);
    }
  }

  const idx = inMemoryListings.findIndex(l => String(l.id) === String(id) || String(l._id) === String(id));
  if (idx !== -1) {
    inMemoryListings[idx] = { ...inMemoryListings[idx], ...updates };
    saveStoreToFile();
    return inMemoryListings[idx];
  }
  return null;
}

async function deleteListing(id) {
  if (isConnected()) {
    try {
      if (mongoose.isValidObjectId(id)) {
        await Listing.findByIdAndDelete(id);
      } else {
        await Listing.deleteOne({ $or: [{ id: String(id) }, { _id: id }] });
      }
    } catch (e) {}
  }
  inMemoryListings = inMemoryListings.filter(l => String(l.id) !== String(id) && String(l._id) !== String(id));
  saveStoreToFile();
  return true;
}

// ==========================================
// Users & Dealers Operations
// ==========================================
async function findUsers(filter = {}) {
  if (isConnected()) {
    try {
      const docs = await User.find(filter).sort({ _id: -1 }).lean();
      return docs.map(d => ({ ...d, id: d._id.toString() }));
    } catch (e) {}
  }

  let results = [...inMemoryUsers];
  if (filter.status) {
    results = results.filter(u => (u.status || 'pending').toLowerCase() === filter.status.toLowerCase());
  }
  return results;
}

async function upsertUser(email, data) {
  const cleanEmail = email.trim().toLowerCase();
  let userRecord = null;

  if (isConnected()) {
    try {
      const user = await User.findOneAndUpdate(
        { email: cleanEmail },
        { ...data, email: cleanEmail },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ).lean();
      userRecord = { ...user, id: user._id.toString() };
    } catch (e) {}
  }

  const idx = inMemoryUsers.findIndex(u => (u.email || '').toLowerCase() === cleanEmail);
  if (idx !== -1) {
    inMemoryUsers[idx] = { ...inMemoryUsers[idx], ...data, email: cleanEmail };
    userRecord = inMemoryUsers[idx];
  } else {
    const newUser = {
      ...data,
      email: cleanEmail,
      _id: 'usr_' + Date.now(),
      id: 'usr_' + Date.now(),
      created_at: new Date()
    };
    inMemoryUsers.unshift(newUser);
    userRecord = newUser;
  }

  saveStoreToFile();
  return userRecord;
}

async function updateUser(id, updates) {
  if (isConnected()) {
    try {
      let doc = null;
      if (mongoose.isValidObjectId(id)) {
        doc = await User.findByIdAndUpdate(id, updates, { new: true }).lean();
      } else {
        doc = await User.findOneAndUpdate(
          { $or: [{ id: String(id) }, { identity_id: String(id) }, { _id: id }] },
          updates,
          { new: true }
        ).lean();
      }
      if (doc) {
        const res = { ...doc, id: doc._id.toString() };
        const idx = inMemoryUsers.findIndex(u => String(u.id) === String(id) || String(u._id) === String(id) || String(u.identity_id) === String(id));
        if (idx !== -1) inMemoryUsers[idx] = res;
        saveStoreToFile();
        return res;
      }
    } catch (e) {}
  }
  const idx = inMemoryUsers.findIndex(u => String(u.id) === String(id) || String(u._id) === String(id) || String(u.identity_id) === String(id));
  if (idx !== -1) {
    inMemoryUsers[idx] = { ...inMemoryUsers[idx], ...updates };
    saveStoreToFile();
    return inMemoryUsers[idx];
  }
  return null;
}

async function deleteUser(id) {
  if (isConnected()) {
    try {
      if (mongoose.isValidObjectId(id)) {
        await User.findByIdAndDelete(id);
      } else {
        await User.deleteOne({ $or: [{ id: String(id) }, { identity_id: String(id) }, { _id: id }] });
      }
    } catch (e) {}
  }
  inMemoryUsers = inMemoryUsers.filter(u => String(u.id) !== String(id) && String(u._id) !== String(id) && String(u.identity_id) !== String(id));
  saveStoreToFile();
  return true;
}

// ==========================================
// Admin Staff Operations
// ==========================================
async function findAdmins() {
  if (isConnected()) {
    try {
      const docs = await Admin.find().sort({ _id: -1 }).lean();
      if (docs && docs.length > 0) {
        return docs.map(d => ({ ...d, id: d._id.toString() }));
      }
    } catch (e) {}
  }
  return [...inMemoryAdmins];
}

async function createAdmin(data) {
  const cleanEmail = (data.email || '').trim().toLowerCase();
  const newAdmin = {
    ...data,
    email: cleanEmail,
    id: Date.now(),
    _id: String(Date.now()),
    status: data.status || 'Active',
    created_at: new Date().toISOString().split('T')[0]
  };

  if (isConnected()) {
    try {
      const doc = await Admin.create(newAdmin);
      newAdmin.id = doc._id.toString();
      newAdmin._id = doc._id.toString();
    } catch (e) {}
  }

  // Remove existing with same email
  inMemoryAdmins = inMemoryAdmins.filter(a => (a.email || '').toLowerCase() !== cleanEmail);
  inMemoryAdmins.unshift(newAdmin);
  saveStoreToFile();
  return newAdmin;
}

async function deleteAdmin(id) {
  if (isConnected()) {
    try {
      await Admin.findByIdAndDelete(id);
    } catch (e) {}
  }
  inMemoryAdmins = inMemoryAdmins.filter(a => String(a.id) !== String(id) && String(a._id) !== String(id));
  saveStoreToFile();
  return true;
}

async function updateAdmin(id, updates) {
  if (isConnected()) {
    try {
      const doc = await Admin.findByIdAndUpdate(id, updates, { new: true }).lean();
      if (doc) {
        const res = { ...doc, id: doc._id.toString() };
        const idx = inMemoryAdmins.findIndex(a => String(a.id) === String(id) || String(a._id) === String(id));
        if (idx !== -1) inMemoryAdmins[idx] = res;
        saveStoreToFile();
        return res;
      }
    } catch (e) {}
  }
  const idx = inMemoryAdmins.findIndex(a => String(a.id) === String(id) || String(a._id) === String(id));
  if (idx !== -1) {
    inMemoryAdmins[idx] = { ...inMemoryAdmins[idx], ...updates };
    saveStoreToFile();
    return inMemoryAdmins[idx];
  }
  return null;
}

// ==========================================
// Notifications Operations
// ==========================================
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
  const newNotif = {
    id: Date.now(),
    _id: String(Date.now()),
    title,
    message,
    is_read: false,
    created_at: new Date()
  };

  if (isConnected()) {
    try {
      await Notification.create({ title, message });
    } catch (e) {}
  }

  inMemoryNotifications.unshift(newNotif);
  saveStoreToFile();
  return newNotif;
}

async function markNotificationRead(id) {
  if (isConnected()) {
    try {
      await Notification.findByIdAndUpdate(id, { is_read: true });
    } catch (e) {}
  }
  const notif = inMemoryNotifications.find(n => String(n.id) === String(id) || String(n._id) === String(id));
  if (notif) notif.is_read = true;
  saveStoreToFile();
}

async function markAllNotificationsRead() {
  if (isConnected()) {
    try {
      await Notification.updateMany({}, { is_read: true });
    } catch (e) {}
  }
  inMemoryNotifications.forEach(n => { n.is_read = true; });
  saveStoreToFile();
  return true;
}

async function clearAllNotifications() {
  if (isConnected()) {
    try {
      await Notification.deleteMany({});
    } catch (e) {}
  }
  inMemoryNotifications = [];
  saveStoreToFile();
  return true;
}

// ==========================================
// Statistics
// ==========================================
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

// ==========================================
// Enquiries Operations
// ==========================================
async function findEnquiries(filter = {}, sortOption = { created_at: -1 }) {
  if (isConnected()) {
    try {
      const docs = await Enquiry.find(filter).sort(sortOption).lean();
      return docs.map(d => ({ ...d, id: d._id.toString() }));
    } catch (e) {
      console.warn('[DB] Fallback to store enquiries:', e.message);
    }
  }

  let result = [...inMemoryEnquiries];
  if (filter.seller_name) {
    const s = String(filter.seller_name).toLowerCase().trim();
    result = result.filter(e => (e.seller_name || '').toLowerCase().trim() === s);
  }
  if (filter.enquiry_type) {
    result = result.filter(e => (e.enquiry_type || 'sale').toLowerCase() === filter.enquiry_type.toLowerCase());
  }
  if (filter.listing_id) {
    result = result.filter(e => String(e.listing_id) === String(filter.listing_id));
  }

  result.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  return result;
}

async function createEnquiry(enquiryData) {
  const newEnquiry = {
    id: `enq_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    ...enquiryData,
    created_at: enquiryData.created_at ? new Date(enquiryData.created_at) : new Date()
  };

  if (isConnected()) {
    try {
      const doc = new Enquiry(newEnquiry);
      await doc.save();
      const savedObj = doc.toObject();
      newEnquiry.id = doc._id.toString();
      newEnquiry._id = doc._id.toString();
    } catch (e) {
      console.warn('[DB] Could not save enquiry to MongoDB Atlas:', e.message);
    }
  }

  inMemoryEnquiries.unshift(newEnquiry);
  saveStoreToFile();
  return newEnquiry;
}

async function deleteEnquiry(id) {
  if (isConnected()) {
    try {
      await Enquiry.findByIdAndDelete(id);
    } catch (e) {}
  }
  inMemoryEnquiries = inMemoryEnquiries.filter(e => String(e.id) !== String(id) && String(e._id) !== String(id));
  saveStoreToFile();
  return true;
}

async function deleteEnquiriesBySeller(sellerName) {
  const s = (sellerName || '').toLowerCase().trim();
  if (isConnected()) {
    try {
      await Enquiry.deleteMany({ seller_name: new RegExp(`^${s}$`, 'i') });
    } catch (e) {}
  }
  inMemoryEnquiries = inMemoryEnquiries.filter(e => (e.seller_name || '').toLowerCase().trim() !== s);
  saveStoreToFile();
  return true;
}

async function getEnquiryStats() {
  const all = await findEnquiries({});
  const sellerMap = new Map();

  for (const item of all) {
    const sName = (item.seller_name || 'Binmar Motors').trim();
    if (!sellerMap.has(sName)) {
      sellerMap.set(sName, {
        seller: sName,
        seller_phone: item.seller_phone || '',
        total: 0,
        saleCount: 0,
        rentCount: 0,
        lastEnquiryAt: item.created_at
      });
    }

    const summary = sellerMap.get(sName);
    summary.total += 1;
    if ((item.enquiry_type || 'sale').toLowerCase() === 'rent') {
      summary.rentCount += 1;
    } else {
      summary.saleCount += 1;
    }

    if (new Date(item.created_at) > new Date(summary.lastEnquiryAt || 0)) {
      summary.lastEnquiryAt = item.created_at;
    }
  }

  // Convert to array and sort descending by total enquiries
  const sellerSummaries = Array.from(sellerMap.values()).sort((a, b) => b.total - a.total);

  const totalSale = all.filter(e => (e.enquiry_type || 'sale').toLowerCase() === 'sale').length;
  const totalRent = all.filter(e => (e.enquiry_type || 'sale').toLowerCase() === 'rent').length;

  return {
    totalEnquiries: all.length,
    totalSale,
    totalRent,
    totalSellers: sellerSummaries.length,
    sellerSummaries,
    enquiries: all
  };
}

async function findBlogPosts(filter = {}) {
  if (isConnected()) {
    try {
      const q = {};
      if (filter.status) q.status = filter.status;
      if (filter.category && filter.category !== 'All') q.category = filter.category;
      return await BlogPost.find(q).sort({ published_at: -1, created_at: -1 }).lean();
    } catch (e) {
      console.warn('[MongoDB findBlogPosts fallback]', e.message);
    }
  }

  let posts = [...inMemoryBlogPosts];
  if (filter.status) {
    posts = posts.filter(p => p.status === filter.status);
  }
  if (filter.category && filter.category !== 'All') {
    posts = posts.filter(p => p.category === filter.category);
  }
  return posts.sort((a, b) => new Date(b.published_at || b.created_at || 0) - new Date(a.published_at || a.created_at || 0));
}

async function findBlogPostBySlugOrId(slugOrId) {
  if (isConnected()) {
    try {
      const post = await BlogPost.findOne({
        $or: [{ slug: slugOrId }, { _id: mongoose.isValidObjectId(slugOrId) ? slugOrId : null }, { id: slugOrId }]
      }).lean();
      if (post) return post;
    } catch (e) {
      console.warn('[MongoDB findBlogPostBySlugOrId fallback]', e.message);
    }
  }

  const clean = String(slugOrId).toLowerCase().trim();
  return inMemoryBlogPosts.find(p => String(p.id) === clean || (p.slug || '').toLowerCase() === clean) || null;
}

async function saveBlogPost(data) {
  const isEdit = Boolean(data.id || data._id);
  const now = new Date();

  if (isConnected()) {
    try {
      if (isEdit) {
        const idVal = data._id || data.id;
        const updated = await BlogPost.findOneAndUpdate(
          { $or: [{ _id: mongoose.isValidObjectId(idVal) ? idVal : null }, { slug: data.slug }] },
          { ...data, updated_at: now },
          { new: true, lean: true }
        );
        if (updated) return updated;
      } else {
        const created = await BlogPost.create({
          ...data,
          created_at: now,
          updated_at: now
        });
        return created.toObject();
      }
    } catch (e) {
      console.warn('[MongoDB saveBlogPost fallback]', e.message);
    }
  }

  if (isEdit) {
    const idx = inMemoryBlogPosts.findIndex(p => String(p.id) === String(data.id) || p.slug === data.slug);
    if (idx !== -1) {
      inMemoryBlogPosts[idx] = { ...inMemoryBlogPosts[idx], ...data, updated_at: now.toISOString() };
      return inMemoryBlogPosts[idx];
    }
  }

  const newPost = {
    ...data,
    id: data.id || `post_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    created_at: now.toISOString(),
    updated_at: now.toISOString()
  };
  inMemoryBlogPosts.unshift(newPost);
  return newPost;
}

async function deleteBlogPost(idOrSlug) {
  if (isConnected()) {
    try {
      await BlogPost.deleteOne({
        $or: [{ slug: idOrSlug }, { _id: mongoose.isValidObjectId(idOrSlug) ? idOrSlug : null }, { id: idOrSlug }]
      });
    } catch (e) {
      console.warn('[MongoDB deleteBlogPost fallback]', e.message);
    }
  }

  const clean = String(idOrSlug).toLowerCase().trim();
  inMemoryBlogPosts = inMemoryBlogPosts.filter(p => String(p.id) !== clean && (p.slug || '').toLowerCase() !== clean);
  return { success: true };
}

module.exports = {
  connectMongoDB,
  isConnected,
  Listing,
  User,
  Admin,
  Notification,
  Enquiry,
  BlogPost,
  findListings,
  createListing,
  updateListing,
  deleteListing,
  findUsers,
  upsertUser,
  updateUser,
  deleteUser,
  findAdmins,
  createAdmin,
  deleteAdmin,
  updateAdmin,
  findNotifications,
  createNotification,
  markNotificationRead,
  markAllNotificationsRead,
  clearAllNotifications,
  findEnquiries,
  createEnquiry,
  deleteEnquiry,
  deleteEnquiriesBySeller,
  getEnquiryStats,
  findBlogPosts,
  findBlogPostBySlugOrId,
  saveBlogPost,
  deleteBlogPost,
  getStats
};
