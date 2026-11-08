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
  contact_phone: { type: String, default: '+971501234567' },
  whatsapp_number: { type: String, default: '+971501234567' },
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

const Listing = mongoose.models.Listing || mongoose.model('Listing', listingSchema);
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);
const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

// ==========================================
// In-Memory & File Store Persistence
// ==========================================
const DATA_DIR = path.join(__dirname, '..', 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

let inMemoryListings = [];
let inMemoryUsers = [];
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
    password: 'admin123',
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
      admins: inMemoryAdmins
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

module.exports = {
  connectMongoDB,
  isConnected,
  Listing,
  User,
  Admin,
  Notification,
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
  getStats
};
