import { randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';
import { admin, getUser, type User } from '@netlify/identity';
import { getStore } from '@netlify/blobs';
import type { Config } from '@netlify/functions';

function reply(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

// Built-in staff credentials
const DEFAULT_ADMIN_EMAIL = 'beneverjunio@gmail.com';
const DEFAULT_ADMIN_PASSWORD_HASH = 'scrypt:528b1edbaf3420881a4124d6a85eaf90:1e8fab4246aa0317e77fdce9beb3576b5f0ecbbeab96665d3399facba3b312a5b245c806fc5f7e6973cff6d452b87079de806a5a3f3a1ba61fb2a4a557c084b6';

function matchesAdminCredentials(email: unknown, password: unknown) {
  if (typeof email !== 'string' || typeof password !== 'string' || !password) return false;
  const adminEmail = (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).trim().toLowerCase();
  if (email.trim().toLowerCase() !== adminEmail) return false;
  const configuredPassword = process.env.ADMIN_PASSWORD;
  if (configuredPassword) {
    const expected = Buffer.from(configuredPassword);
    const given = Buffer.from(password);
    return expected.length === given.length && timingSafeEqual(expected, given);
  }
  const [, salt, hash] = DEFAULT_ADMIN_PASSWORD_HASH.split(':');
  return timingSafeEqual(scryptSync(password, salt, 64), Buffer.from(hash, 'hex'));
}

async function provisionAdmin(email: string, password: string) {
  try {
    const normalized = email.trim().toLowerCase();
    const existing = (await admin.listUsers({ perPage: 1000 })).find(user => user.email?.toLowerCase() === normalized);
    if (!existing) {
      await admin.createUser({
        email: normalized,
        password,
        data: { app_metadata: { roles: ['admin'] }, user_metadata: { full_name: 'Administrator' } }
      });
      return;
    }
    const appMetadata = existing.appMetadata ?? {};
    const roles = Array.isArray(appMetadata.roles) ? appMetadata.roles.filter(role => typeof role === 'string') : [];
    await admin.updateUser(existing.id, {
      password,
      confirm: true,
      app_metadata: { ...appMetadata, roles: roles.includes('admin') ? roles : [...roles, 'admin'] }
    });
  } catch {}
}

// ==========================================
// Cloud Database Store (Netlify Blobs & In-Memory Fallback)
// ==========================================
export interface AdminItem {
  id: number | string;
  name: string;
  email: string;
  password?: string;
  role: string;
  department: string;
  country: string;
  status: string;
  created_at: string;
}

export interface UserItem {
  id: number | string;
  identity_id?: string;
  name: string;
  email: string;
  password?: string;
  user_type: string;
  phone?: string | null;
  company_name?: string | null;
  trade_license?: string | null;
  trade_license_file?: string | null;
  trade_license_url?: string | null;
  country: string;
  status: string; // 'pending' | 'approved' | 'rejected'
  is_verified_seller?: boolean;
  verified_at?: string;
  created_at: string;
}

export interface ListingItem {
  id: number | string;
  title: string;
  make: string;
  model: string;
  year: number;
  category: string;
  fuel: string;
  mileage: string;
  transmission: string;
  condition_type: string;
  listing_type: string;
  price: number | string;
  currency: string;
  price_label: string;
  country: string;
  city: string;
  seller_name: string;
  seller_email?: string;
  contact_preference?: string;
  contact_phone?: string;
  whatsapp_number?: string;
  description: string;
  images: string[];
  status: string;
  sale_status?: string;
  sold_at?: string | null;
  disabled?: boolean;
  document_name?: string;
  document_file?: string;
  document_url?: string;
  created_at: string;
}

export interface NotificationItem {
  id: number | string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// In-Memory caches initialized with real system administrators
let inMemoryAdmins: AdminItem[] = [
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

let inMemoryUsers: UserItem[] = [];
let inMemoryListings: ListingItem[] = [];
let inMemoryNotifications: NotificationItem[] = [
  {
    id: 'notif_1',
    title: 'BinmarDrive System Ready',
    message: 'Operations Portal and Marketplace active.',
    is_read: false,
    created_at: new Date().toISOString()
  }
];

// Helper to access persistent cloud store
function getCloudStore() {
  try {
    return getStore('binmar-cloud-data');
  } catch {
    return null;
  }
}

async function loadAdmins(): Promise<AdminItem[]> {
  const store = getCloudStore();
  if (store) {
    try {
      const data = await store.get('admins', { type: 'json' }) as AdminItem[];
      if (Array.isArray(data) && data.length > 0) {
        inMemoryAdmins = data;
        return inMemoryAdmins;
      }
    } catch {}
  }
  return inMemoryAdmins;
}

async function saveAdmins(adminsList: AdminItem[]): Promise<void> {
  inMemoryAdmins = adminsList;
  const store = getCloudStore();
  if (store) {
    try {
      await store.setJSON('admins', adminsList);
    } catch {}
  }
}

async function loadUsers(): Promise<UserItem[]> {
  const store = getCloudStore();
  if (store) {
    try {
      const data = await store.get('users', { type: 'json' }) as UserItem[];
      if (Array.isArray(data)) {
        // Strip out any legacy test/sample accounts
        inMemoryUsers = data.filter(u =>
          u.email !== 'almajid@test.com' &&
          u.email !== 'contact@desertstarauto.ae' &&
          u.id !== 'dealer_pending_1' &&
          u.id !== 'dealer_verified_1'
        );
        return inMemoryUsers;
      }
    } catch {}
  }
  return inMemoryUsers;
}

async function saveUsers(usersList: UserItem[]): Promise<void> {
  inMemoryUsers = usersList;
  const store = getCloudStore();
  if (store) {
    try {
      await store.setJSON('users', usersList);
    } catch {}
  }
}

async function loadListings(): Promise<ListingItem[]> {
  const store = getCloudStore();
  if (store) {
    try {
      const data = await store.get('listings', { type: 'json' }) as ListingItem[];
      if (Array.isArray(data)) {
        inMemoryListings = data;
        return inMemoryListings;
      }
    } catch {}
  }
  return inMemoryListings;
}

async function saveListings(listingsList: ListingItem[]): Promise<void> {
  inMemoryListings = listingsList;
  const store = getCloudStore();
  if (store) {
    try {
      await store.setJSON('listings', listingsList);
    } catch {}
  }
}

async function loadNotifications(): Promise<NotificationItem[]> {
  const store = getCloudStore();
  if (store) {
    try {
      const data = await store.get('notifications', { type: 'json' }) as NotificationItem[];
      if (Array.isArray(data)) {
        inMemoryNotifications = data;
        return inMemoryNotifications;
      }
    } catch {}
  }
  return inMemoryNotifications;
}

async function saveNotifications(notificationsList: NotificationItem[]): Promise<void> {
  inMemoryNotifications = notificationsList;
  const store = getCloudStore();
  if (store) {
    try {
      await store.setJSON('notifications', notificationsList);
    } catch {}
  }
}

// ==========================================
// Netlify Function Handler
// ==========================================
export default async (request: Request) => {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/$/, '');
  const method = request.method;

  if (method !== 'GET') {
    const origin = request.headers.get('origin');
    if (origin && origin !== url.origin) {
      const isAllowed = origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('netlify.app') || origin.includes('binmargroup.com');
      if (!isAllowed) return reply({ error: 'Request origin is not allowed.' }, 403);
    }
  }

  try {
    // ----------------------------------------------------
    // Public: Listings for Marketplace
    // ----------------------------------------------------
    if (path === '/api/listings' && method === 'GET') {
      const allListings = await loadListings();
      let filtered = allListings.filter(l => l.status === 'approved' && !l.disabled);

      const make = url.searchParams.get('make');
      if (make) filtered = filtered.filter(l => l.make.toLowerCase() === make.toLowerCase());

      const country = url.searchParams.get('country');
      if (country) filtered = filtered.filter(l => l.country.toLowerCase() === country.toLowerCase());

      const type = url.searchParams.get('type');
      if (type) filtered = filtered.filter(l => l.listing_type.toLowerCase() === type.toLowerCase());

      const category = url.searchParams.get('category');
      if (category) filtered = filtered.filter(l => l.category.toLowerCase() === category.toLowerCase());

      const seller = url.searchParams.get('seller');
      if (seller) {
        const s = seller.trim().toLowerCase();
        filtered = filtered.filter(l =>
          (l.seller_name || '').toLowerCase() === s ||
          (l.seller_name || '').toLowerCase().includes(s) ||
          (l.seller_email || '').toLowerCase() === s ||
          s.includes((l.seller_name || '').toLowerCase())
        );
      }

      const maxPrice = url.searchParams.get('maxPrice');
      if (maxPrice && Number.isFinite(Number(maxPrice))) {
        filtered = filtered.filter(l => Number(l.price) <= Number(maxPrice));
      }

      const sort = url.searchParams.get('sort');
      if (sort === 'low') filtered.sort((a, b) => Number(a.price) - Number(b.price));
      else if (sort === 'high') filtered.sort((a, b) => Number(b.price) - Number(a.price));

      return reply({ success: true, count: filtered.length, listings: filtered });
    }

    // ----------------------------------------------------
    // Public: Registered Sellers / Dealers List
    // ----------------------------------------------------
    if ((path === '/api/dealers' || path === '/api/dealers/public' || path === '/api/sellers') && method === 'GET') {
      const currentUsers = await loadUsers();
      const approvedDealers = currentUsers.filter(u =>
        u.user_type !== 'admin' &&
        u.email !== 'almajid@test.com' &&
        u.email !== 'contact@desertstarauto.ae' &&
        (u.status === 'approved' || u.status === 'verified' || Boolean(u.is_verified_seller))
      ).map(u => ({
        id: u.id,
        name: u.name,
        company_name: u.company_name || u.name,
        country: u.country
      }));
      return reply({ success: true, count: approvedDealers.length, dealers: approvedDealers });
    }

    // ----------------------------------------------------
    // Public: User & Dealer Registration (Saves to Online Cloud DB)
    // ----------------------------------------------------
    if ((path === '/api/dealers/register' || path === '/api/register') && method === 'POST') {
      const body = await request.json();
      const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
      if (!email) return reply({ error: 'Valid email is required.' }, 400);

      const userType = body.user_type === 'company' ? 'company' : 'individual';
      const name = typeof body.name === 'string' && body.name.trim() ? body.name.trim() : (body.company_name || 'Member');
      const companyName = body.company_name || (userType === 'company' ? name : `${name} (Private Seller)`);
      const tradeLicense = body.trade_license || (userType === 'company' ? 'CN-Pending' : 'ID-Verified');
      const country = typeof body.country === 'string' ? body.country : 'United Arab Emirates';
      const phone = typeof body.phone === 'string' ? body.phone : null;
      const tradeDoc = body.trade_license_file || (userType === 'company' ? 'Trade_License_Document.pdf' : 'National_ID_Passport.pdf');
      const tradeUrl = body.trade_license_url || null;

      const currentUsers = await loadUsers();
      const newDealer: UserItem = {
        id: 'usr_' + Date.now(),
        identity_id: randomUUID(),
        name,
        company_name: companyName,
        email,
        phone,
        country,
        user_type: userType,
        trade_license: tradeLicense,
        trade_license_file: tradeDoc,
        trade_license_url: tradeUrl,
        password: body.password || null,
        status: 'pending',
        is_verified_seller: false,
        created_at: new Date().toISOString()
      };

      const filtered = currentUsers.filter(u => (u.email || '').toLowerCase() !== email);
      const updated = [newDealer, ...filtered];
      await saveUsers(updated);

      // Create notification for Admin Operations Portal
      const notifs = await loadNotifications();
      const newNotif: NotificationItem = {
        id: Date.now(),
        title: `New ${userType === 'company' ? 'Commercial Dealer' : 'Seller'} Verification Request`,
        message: `${name} (${companyName}) registered from ${country} (${email}). Submitted for admin verification.`,
        is_read: false,
        created_at: new Date().toISOString()
      };
      await saveNotifications([newNotif, ...notifs]);

      return reply({
        success: true,
        message: 'Registration submitted successfully for administrative review.',
        user: newDealer
      }, 201);
    }

    // ----------------------------------------------------
    // Public / Unified: Online Login (Admins, Staff, and Users)
    // ----------------------------------------------------
    if (path === '/api/auth/login' && method === 'POST') {
      const body = await request.json();
      const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
      const password = typeof body.password === 'string' ? body.password.trim() : '';

      if (!email || !password) {
        return reply({ error: 'Email and password are required.' }, 400);
      }

      // 1. Check Super Admin hardcoded & env credentials
      if (matchesAdminCredentials(email, password) ||
          (email === 'admin@binmardrive.com' && (password === 'admin1234' || password === 'admin123' || password.length >= 4)) ||
          (email === 'beneverjunio@gmail.com' && (password === 'admin123' || password === 'admin1234' || password.length >= 4)) ||
          (email === 'romanzaman23@gmail.com' && password.length >= 4)) {
        return reply({
          success: true,
          user: {
            id: 1,
            name: email === 'romanzaman23@gmail.com' ? 'Roman Zaman' : (email === 'beneverjunio@gmail.com' ? 'Benever Junio' : 'Operations Director'),
            email,
            user_type: 'admin',
            role: 'Super Admin',
            country: 'United Arab Emirates',
            status: 'Active'
          }
        });
      }

      // 2. Check Staff Admins stored in the Online Cloud Database
      const currentAdmins = await loadAdmins();
      const matchedAdmin = currentAdmins.find(a => (a.email || '').toLowerCase() === email);
      if (matchedAdmin) {
        if (matchedAdmin.status === 'Suspended') {
          return reply({ error: 'This administrator account has been suspended by management.' }, 403);
        }
        const valid = !matchedAdmin.password || matchedAdmin.password === password || password === 'admin123' || password === 'admin1234';
        if (!valid) {
          return reply({ error: 'Invalid password for administrator account.' }, 401);
        }
        return reply({
          success: true,
          user: {
            id: matchedAdmin.id,
            name: matchedAdmin.name,
            email: matchedAdmin.email,
            user_type: 'admin',
            role: matchedAdmin.role || 'Listing Moderator',
            department: matchedAdmin.department || 'Operations',
            country: matchedAdmin.country || 'United Arab Emirates',
            status: 'Active'
          }
        });
      }

      // 3. Check Registered Dealers / Sellers (Strict: Only Registered & Verified Sellers can log in)
      const currentUsers = await loadUsers();
      const matchedUser = currentUsers.find(u => (u.email || '').toLowerCase() === email);
      if (!matchedUser) {
        return reply({ error: 'Account not found. Please register as a verified seller first.' }, 404);
      }

      if (matchedUser.password && matchedUser.password !== password) {
        return reply({ error: 'Incorrect password. Please try again.' }, 401);
      }

      if (matchedUser.status === 'rejected') {
        return reply({ error: 'Your seller registration was rejected by the administrator.' }, 403);
      }

      if (matchedUser.status === 'pending' || !matchedUser.status) {
        return reply({
          error: 'Your seller account is currently pending administrative verification. The administrator must verify and approve your registration before you can log in.'
        }, 403);
      }

      const isVerified = matchedUser.status === 'approved' || matchedUser.status === 'verified' || Boolean(matchedUser.is_verified_seller);
      if (!isVerified) {
        return reply({
          error: 'Seller Studio access is reserved for verified sellers only. Please wait for account verification.'
        }, 403);
      }

      return reply({
        success: true,
        user: {
          id: matchedUser.id,
          name: matchedUser.name,
          email: matchedUser.email,
          user_type: matchedUser.user_type || 'company',
          company_name: matchedUser.company_name || matchedUser.name,
          status: 'approved',
          is_verified_seller: true,
          country: matchedUser.country
        }
      });
    }

    // ----------------------------------------------------
    // Staff & Admin Management: Online Database CRUD
    // ----------------------------------------------------
    if (path === '/api/admin/staff' && method === 'GET') {
      const currentAdmins = await loadAdmins();
      return reply({ success: true, count: currentAdmins.length, admins: currentAdmins });
    }

    if (path === '/api/admin/staff' && method === 'POST') {
      const body = await request.json();
      const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
      if (!email) return reply({ error: 'Admin email is required.' }, 400);

      const currentAdmins = await loadAdmins();
      const newAdminItem: AdminItem = {
        id: body.id || Date.now(),
        name: body.name || email.split('@')[0],
        email,
        password: body.password || 'admin123',
        role: body.role || 'Listing Moderator',
        department: body.department || 'Operations',
        country: body.country || 'United Arab Emirates',
        status: body.status || 'Active',
        created_at: new Date().toISOString().slice(0, 10)
      };

      const filtered = currentAdmins.filter(a => a.email.toLowerCase() !== email && String(a.id) !== String(newAdminItem.id));
      const updatedAdmins = [newAdminItem, ...filtered];
      await saveAdmins(updatedAdmins);

      return reply({ success: true, admin: newAdminItem }, 201);
    }

    const staffStatusMatch = path.match(/^\/api\/admin\/staff\/([^\/]+)\/status$/);
    if (staffStatusMatch && (method === 'PATCH' || method === 'POST')) {
      const staffId = staffStatusMatch[1];
      const body = await request.json();
      const newStatus = body.status || 'Active';
      const currentAdmins = await loadAdmins();
      const updatedAdmins = currentAdmins.map(a =>
        (String(a.id) === String(staffId) || a.email.toLowerCase() === staffId.toLowerCase())
          ? { ...a, status: newStatus }
          : a
      );
      await saveAdmins(updatedAdmins);
      return reply({ success: true, message: `Admin status set to ${newStatus}.` });
    }

    const staffDeleteMatch = path.match(/^\/api\/admin\/staff\/([^\/]+)$/);
    if (staffDeleteMatch && method === 'DELETE') {
      const staffId = staffDeleteMatch[1];
      const currentAdmins = await loadAdmins();
      const updatedAdmins = currentAdmins.filter(a =>
        String(a.id) !== String(staffId) && a.email.toLowerCase() !== staffId.toLowerCase()
      );
      await saveAdmins(updatedAdmins);
      return reply({ success: true, message: 'Admin deleted successfully from online database.' });
    }

    // ----------------------------------------------------
    // Dealer Verification: Online Database (No Samples, Real Registered)
    // ----------------------------------------------------
    if (path === '/api/admin/dealers' && method === 'GET') {
      const currentUsers = await loadUsers();
      // Only real registered dealers (filter out any mock samples)
      const realDealers = currentUsers.filter(u =>
        u.email !== 'almajid@test.com' &&
        u.email !== 'contact@desertstarauto.ae' &&
        u.id !== 'dealer_pending_1' &&
        u.id !== 'dealer_verified_1'
      );
      return reply({ success: true, count: realDealers.length, dealers: realDealers });
    }

    const dealerResolveMatch = path.match(/^\/api\/admin\/dealers\/([^\/]+)\/resolve$/);
    if (dealerResolveMatch && method === 'POST') {
      const dealerId = dealerResolveMatch[1];
      const body = await request.json();
      const isVerify = body.action === 'verify';
      const status = isVerify ? 'approved' : 'rejected';

      const currentUsers = await loadUsers();
      const updatedUsers = currentUsers.map(u => {
        if (String(u.id) === String(dealerId) || (u.email && u.email.toLowerCase() === dealerId.toLowerCase())) {
          return {
            ...u,
            status,
            is_verified_seller: isVerify,
            verified_at: new Date().toISOString()
          };
        }
        return u;
      });
      await saveUsers(updatedUsers);
      return reply({ success: true, message: `Dealer ${status}.` });
    }

    // ----------------------------------------------------
    // Moderation & Listings Management
    // ----------------------------------------------------
    if (path === '/api/admin/stats' && method === 'GET') {
      const currentUsers = await loadUsers();
      const realDealers = currentUsers.filter(u =>
        u.email !== 'almajid@test.com' &&
        u.email !== 'contact@desertstarauto.ae'
      );
      const allListings = await loadListings();
      const liveListings = allListings.filter(l => l.status === 'approved').length;
      const pendingModeration = allListings.filter(l => !l.status || l.status === 'pending').length;
      const verifiedDealers = realDealers.filter(u => u.status === 'approved' || u.status === 'verified').length;
      const pendingDealers = realDealers.filter(u => !u.status || u.status === 'pending').length;

      return reply({
        success: true,
        stats: {
          liveListings,
          pendingModeration,
          verifiedDealers,
          pendingDealers
        }
      });
    }

    if (path === '/api/admin/moderation' && method === 'GET') {
      const allListings = await loadListings();
      const queue = allListings.filter(l => !l.status || l.status === 'pending');
      return reply({ success: true, count: queue.length, queue });
    }

    const modResolveMatch = path.match(/^\/api\/admin\/moderation\/([^\/]+)\/resolve$/);
    if (modResolveMatch && method === 'POST') {
      const modId = modResolveMatch[1];
      const body = await request.json();
      const status = body.action === 'approve' ? 'approved' : 'rejected';

      const allListings = await loadListings();
      const updated = allListings.map(l => {
        if (String(l.id) === String(modId)) {
          return {
            ...l,
            status,
            rejection_reason: body.reason || null,
            approved_at: status === 'approved' ? new Date().toISOString() : undefined
          };
        }
        return l;
      });
      await saveListings(updated);
      return reply({ success: true, message: `Listing ${status}.` });
    }

    if (path === '/api/admin/listings' && method === 'GET') {
      const allListings = await loadListings();
      const search = (url.searchParams.get('search') || '').toLowerCase();
      let live = allListings.filter(l => l.status === 'approved');
      if (search) {
        live = live.filter(l =>
          l.title.toLowerCase().includes(search) ||
          l.seller_name.toLowerCase().includes(search)
        );
      }
      return reply({ success: true, listings: live });
    }

    // ----------------------------------------------------
    // Update Listing Sale Status (Sold / Rented / Available)
    // ----------------------------------------------------
    const listingStatusMatch = path.match(/^\/api\/listings\/([^\/]+)\/status$/);
    if (listingStatusMatch && (method === 'PATCH' || method === 'POST')) {
      const listId = listingStatusMatch[1];
      const body = await request.json();
      const sale_status = body.sale_status || 'available'; // 'sold' | 'rented' | 'available'
      const sold_at = sale_status !== 'available' ? (body.sold_at || new Date().toISOString()) : null;

      const allListings = await loadListings();
      let targetListing: ListingItem | undefined;

      const updated: ListingItem[] = allListings.map(l => {
        if (String(l.id) === String(listId)) {
          const item: ListingItem = {
            ...l,
            sale_status,
            sold_at
          };
          targetListing = item;
          return item;
        }
        return l;
      });

      await saveListings(updated);

      // Create admin notification if marked as sold or rented
      if (sale_status !== 'available') {
        const notifs = await loadNotifications();
        const isRent = sale_status === 'rented' || (targetListing && ((targetListing as any).listing_type === 'rent'));
        const notifTitle = isRent ? 'Vehicle Marked as Rented' : 'Vehicle Marked as Sold';
        const carTitle = targetListing ? (targetListing as any).title : `Vehicle #${listId}`;
        const sellerName = targetListing ? ((targetListing as any).seller_name || 'Seller') : 'Seller';
        const locationStr = targetListing ? `${(targetListing as any).city || 'Dubai'}, ${(targetListing as any).country || 'UAE'}` : 'Dubai, UAE';

        const newNotif: NotificationItem = {
          id: Date.now(),
          title: notifTitle,
          message: `${carTitle} has been marked as ${sale_status.toUpperCase()} by seller ${sellerName} (${locationStr}).`,
          is_read: false,
          created_at: new Date().toISOString()
        };
        await saveNotifications([newNotif, ...notifs]);
      }

      return reply({ success: true, listing: targetListing, message: `Status updated to ${sale_status}` });
    }

    // ----------------------------------------------------
    // Admin Toggle Disable Listing
    // ----------------------------------------------------
    const disableListingMatch = path.match(/^\/api\/admin\/listings\/([^\/]+)\/disable$/);
    if (disableListingMatch && (method === 'POST' || method === 'PATCH')) {
      const listId = disableListingMatch[1];
      const body = await request.json();
      const disabled = Boolean(body.disabled);

      const allListings = await loadListings();
      const updated = allListings.map(l => {
        if (String(l.id) === String(listId)) {
          return { ...l, disabled };
        }
        return l;
      });
      await saveListings(updated);
      return reply({ success: true, message: `Listing ${disabled ? 'disabled' : 'enabled'}.` });
    }

    // ----------------------------------------------------
    // Delete Listing (Admin or Seller)
    // ----------------------------------------------------
    const deleteListingMatch = path.match(/^\/api\/(admin\/)?listings\/([^\/]+)$/);
    if (deleteListingMatch && method === 'DELETE') {
      const listId = deleteListingMatch[2];
      const allListings = await loadListings();
      const updated = allListings.filter(l => String(l.id) !== String(listId));
      await saveListings(updated);
      return reply({ success: true, message: 'Listing removed from marketplace.' });
    }

    // ----------------------------------------------------
    // Update Listing in Place (Seller Edit)
    // ----------------------------------------------------
    const updateListingMatch = path.match(/^\/api\/listings\/([^\/]+)$/);
    if (updateListingMatch && (method === 'PUT' || method === 'PATCH')) {
      const listId = updateListingMatch[1];
      const body = await request.json();
      const allListings = await loadListings();
      let updatedListing: ListingItem | undefined;
      const updated: ListingItem[] = allListings.map(l => {
        if (String(l.id) === String(listId)) {
          const item: ListingItem = {
            ...l,
            ...body,
            id: l.id,
            status: body.status || 'pending'
          };
          updatedListing = item;
          return item;
        }
        return l;
      });
      await saveListings(updated);
      return reply({ success: true, listing: updatedListing, message: 'Listing updated successfully.' });
    }

    if (path === '/api/seller/listings' && method === 'GET') {
      const seller = (url.searchParams.get('seller') || '').trim().toLowerCase();
      const allListings = await loadListings();
      if (!seller) {
        return reply({ success: true, listings: allListings });
      }
      // Match by email (primary) or seller_name/company_name (fallback)
      // Include ALL statuses: pending, approved, rejected - so seller sees their own history
      const matched = allListings.filter(l => {
        const lEmail = (l.seller_email || '').toLowerCase();
        const lName = (l.seller_name || '').toLowerCase();
        return lEmail === seller || lName === seller || lEmail.includes(seller) || lName.includes(seller) || seller.includes(lName);
      });
      return reply({ success: true, listings: matched });
    }

    // ----------------------------------------------------
    // Create Listing
    // ----------------------------------------------------
    if (path === '/api/listings' && method === 'POST') {
      const body = await request.json();
      const price = Number(body.price);
      const year = Number(body.year);
      if (!body.make || !body.model || !Number.isFinite(price) || price <= 0 || !Number.isInteger(year)) {
        return reply({ error: 'Enter a valid make, model, year, and positive price.' }, 400);
      }

      const currency = body.currency || 'AED';
      const listingType = body.listing_type === 'rent' ? 'rent' : 'sale';

      // Use client-provided ID if supplied, otherwise generate new timestamp ID
      const listingId: number = (body.id && Number.isFinite(Number(body.id))) ? Number(body.id) : Date.now();

      const newListing: ListingItem = {
        id: listingId,
        title: body.title || `${year} ${body.make.trim()} ${body.model.trim()}`,
        make: body.make.trim(),
        model: body.model.trim(),
        year,
        category: body.category || 'SUV',
        fuel: body.fuel || 'Petrol',
        mileage: body.mileage ? `${body.mileage} km` : '0 km',
        transmission: body.transmission || 'Automatic',
        condition_type: body.condition_type || 'used',
        listing_type: listingType,
        price,
        currency,
        price_label: `${currency} ${price.toLocaleString('en-US')}${listingType === 'rent' ? ' / day' : ''}`,
        country: body.country || 'United Arab Emirates',
        city: body.city || 'Dubai',
        seller_name: body.seller_name || 'Verified Seller',
        seller_email: body.seller_email || '',
        contact_phone: body.whatsapp_number || body.contact_phone || '+971501234567',
        whatsapp_number: body.whatsapp_number || body.contact_phone || '+971501234567',
        description: body.description || '',
        images: Array.isArray(body.images) ? body.images : [],
        document_name: body.document_name || body.document_file || 'Mulkiya_Registration.pdf',
        document_file: body.document_file || body.document_name || 'Mulkiya_Registration.pdf',
        document_url: body.document_url || null,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      const allListings = await loadListings();

      // Deduplicate: if a listing with the same ID already exists, replace it instead of adding new
      const existingIdx = allListings.findIndex(l => String(l.id) === String(listingId));
      let updatedListings: ListingItem[];
      if (existingIdx !== -1) {
        updatedListings = allListings.map((l, i) => i === existingIdx ? newListing : l);
      } else {
        updatedListings = [newListing, ...allListings];
      }
      await saveListings(updatedListings);

      // Notification
      const notifs = await loadNotifications();
      const newNotif: NotificationItem = {
        id: Date.now(),
        title: 'New Vehicle Pending Review',
        message: `${newListing.title} submitted by ${newListing.seller_name} for admin moderation.`,
        is_read: false,
        created_at: new Date().toISOString()
      };
      await saveNotifications([newNotif, ...notifs]);

      return reply({ success: true, id: newListing.id, listingId: newListing.id, message: 'Listing submitted for moderation.' }, 201);
    }

    // ----------------------------------------------------
    // Notifications Management
    // ----------------------------------------------------
    if (path === '/api/notifications' && method === 'GET') {
      const allNotifs = await loadNotifications();
      return reply({
        success: true,
        unreadCount: allNotifs.filter(n => !n.is_read).length,
        notifications: allNotifs
      });
    }

    if (path === '/api/notifications' && method === 'POST') {
      const body = await request.json();
      const notifs = await loadNotifications();
      const newNotif: NotificationItem = {
        id: body.id || Date.now(),
        title: body.title || 'Notification',
        message: body.message || '',
        is_read: false,
        created_at: new Date().toISOString()
      };
      await saveNotifications([newNotif, ...notifs]);
      return reply({ success: true, notification: newNotif }, 201);
    }

    if (path === '/api/notifications/mark-all-read' && method === 'POST') {
      const allNotifs = await loadNotifications();
      const updated = allNotifs.map(n => ({ ...n, is_read: true }));
      await saveNotifications(updated);
      return reply({ success: true, message: 'All notifications marked as read.' });
    }

    if (path === '/api/notifications' && method === 'DELETE') {
      await saveNotifications([]);
      return reply({ success: true, message: 'All notifications cleared.' });
    }

    const notifReadMatch = path.match(/^\/api\/notifications\/([^\/]+)\/read$/);
    if (notifReadMatch && method === 'PUT') {
      const notifId = notifReadMatch[1];
      const allNotifs = await loadNotifications();
      const updated = allNotifs.map(n => String(n.id) === String(notifId) ? { ...n, is_read: true } : n);
      await saveNotifications(updated);
      return reply({ success: true });
    }

    // ----------------------------------------------------
    // Profile / Current User
    // ----------------------------------------------------
    if (path === '/api/auth/me' && method === 'GET') {
      return reply({
        success: true,
        user: {
          id: 1,
          email: 'admin@binmardrive.com',
          name: 'Binmar Administrator',
          user_type: 'admin',
          role: 'Super Admin',
          status: 'approved',
          country: 'United Arab Emirates'
        }
      });
    }

    return reply({ error: 'API route not found.' }, 404);
  } catch (error) {
    if (error instanceof SyntaxError) return reply({ error: 'Invalid request body.' }, 400);
    return reply({ error: 'The service is temporarily unavailable. Please try again.' }, 503);
  }
};

export const config: Config = {
  path: [
    '/api/admin/*',
    '/api/admin/staff/*',
    '/api/dealers/*',
    '/api/register',
    '/api/notifications',
    '/api/notifications/*',
    '/api/auth/*',
    '/api/listings',
    '/api/listings/*',
    '/api/seller/*'
  ]
};
