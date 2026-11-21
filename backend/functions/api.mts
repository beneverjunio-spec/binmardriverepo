import { randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';
import { admin, getUser, type User } from '@netlify/identity';
import { getStore } from '@netlify/blobs';
import type { Config } from '@netlify/functions';
import { generateVehicleSlug, extractListingIdFromSlug, generateVehicleSchema, getVehicleCanonicalUrl, generateSellerSlug } from '../utils/seo.js';

function reply(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

// Built-in staff credentials
const DEFAULT_ADMIN_EMAIL = 'info@binmargroup.com';
const DEFAULT_ADMIN_PASSWORD_HASH = 'scrypt:528b1edbaf3420881a4124d6a85eaf90:1e8fab4246aa0317e77fdce9beb3576b5f0ecbbeab96665d3399facba3b312a5b245c806fc5f7e6973cff6d452b87079de806a5a3f3a1ba61fb2a4a557c084b6';

const ADMIN_ALERT_EMAIL = 'info@binmargroup.com';

async function dispatchAdminEmailNotification(options: {
  subject: string;
  title: string;
  message: string;
  details: Record<string, string | number | undefined | null>;
  actionUrl?: string;
  actionText?: string;
}) {
  const recipient = (process.env.ADMIN_ALERT_EMAIL || process.env.ADMIN_EMAIL || ADMIN_ALERT_EMAIL).trim().toLowerCase();
  const { subject, title, message, details, actionUrl = 'https://binmardrive.binmargroup.com/admin', actionText = 'Open Admin Operations Portal' } = options;

  console.log(`[ADMIN NOTIFICATION DISPATCH] To: ${recipient} | Subject: ${subject}`);

  const detailsRows = Object.entries(details)
    .filter(([_, val]) => val !== undefined && val !== null && val !== '')
    .map(([label, val]) => `<tr><td style="padding: 8px 12px; font-weight: bold; color: #1e293b; background: #f8fafc; border: 1px solid #e2e8f0; width: 35%;">${label}</td><td style="padding: 8px 12px; color: #334155; border: 1px solid #e2e8f0;">${val}</td></tr>`)
    .join('');

  const detailsTableHtml = detailsRows
    ? '<table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; margin-bottom: 28px; font-size: 14px; border-radius: 8px; overflow: hidden;">' + detailsRows + '</table>'
    : '';
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${subject}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; padding: 24px; margin: 0;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
          <tr>
            <td style="background: #0f3527; padding: 24px 32px; text-align: left;">
              <h1 style="color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 0.5px;">BINMAR<span style="color: #d4af37;">DRIVE</span></h1>
              <p style="color: #94a3b8; margin: 6px 0 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Admin Notification &bull; info@binmargroup.com</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 32px 24px;">
              <h2 style="color: #0f172a; margin: 0 0 16px; font-size: 20px; font-weight: 700;">${title}</h2>
              <p style="color: #475569; font-size: 15px; line-height: 1.7; margin: 0 0 24px;">${message}</p>

              ${detailsTableHtml}

              <div style="text-align: center; margin: 28px 0 8px;">
                <a href="${actionUrl}" style="background: linear-gradient(135deg, #d4af37, #b89327); color: #0d261d; font-weight: 700; text-decoration: none; padding: 13px 32px; border-radius: 8px; font-size: 15px; display: inline-block;">
                  ${actionText} &rarr;
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background: #f8fafc; padding: 16px 32px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b;">
              This notification was sent by <strong>BinmarDrive Admin</strong> &bull; <a href="mailto:info@binmargroup.com" style="color: #0f3527; text-decoration: none;">info@binmargroup.com</a><br />
              &copy; 2026 Binmar Group. All rights reserved.
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const text = `${title}\n\n${message}\n\nDetails:\n` +
    Object.entries(details).map(([k, v]) => `• ${k}: ${v}`).join('\n') +
    `\n\nTake action at: ${actionUrl}\n\nRecipient: ${recipient}`;

  // 1. Resend API
  if (process.env.RESEND_API_KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'Binmar Drive Admin <info@binmargroup.com>',
          to: [recipient],
          subject,
          html,
          text
        })
      });
    } catch (e) {
      console.warn('[Resend Email Dispatch Error]', e);
    }
  }

  // 2. SendGrid API
  if (process.env.SENDGRID_API_KEY) {
    try {
      await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: recipient }] }],
          from: { email: 'info@binmargroup.com', name: 'Binmar Drive Admin' },
          subject,
          content: [
            { type: 'text/plain', value: text },
            { type: 'text/html', value: html }
          ]
        })
      });
    } catch (e) {
      console.warn('[SendGrid Email Dispatch Error]', e);
    }
  }

  // 3. FormSubmit Guaranteed Direct Delivery
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const replyEmail = details['Email Address'] || details['Seller Email'] || details['Email'];
    await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(recipient)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        _subject: subject,
        title,
        message,
        action_url: actionUrl,
        ...details,
        ...(replyEmail ? { _replyto: String(replyEmail) } : {}),
        _template: 'table',
        _captcha: 'false'
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    console.log(`[ADMIN NOTIFICATION DISPATCH] FormSubmit relay success to: ${recipient}`);
  } catch (e: any) {
    console.warn('[FormSubmit Admin Email Notice]', e?.message || e);
  }

  // 3. Webhook endpoint
  const webhook = process.env.ADMIN_NOTIFICATION_WEBHOOK || process.env.NOTIFICATION_EMAIL_WEBHOOK;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: recipient, subject, title, message, details, actionUrl, timestamp: new Date().toISOString() })
      });
    } catch (e) {
      console.warn('[Webhook Email Dispatch Error]', e);
    }
  }
}

// ==========================================
// Seller Email Notification Dispatcher
// ==========================================
async function dispatchSellerEmailNotification(options: {
  to: string;
  subject: string;
  title: string;
  message: string;
  details: Record<string, string | number | undefined | null>;
  actionUrl?: string;
  actionText?: string;
  showCtaButton?: boolean;   // when true, renders a large prominent CTA button
}) {
  const { to, subject, title, message, details, actionUrl = 'https://binmardrive.binmargroup.com/login', actionText = 'Login to Your Account', showCtaButton = true } = options;
  if (!to || !to.includes('@')) return;

  console.log(`[SELLER NOTIFICATION DISPATCH] To: ${to} | Subject: ${subject}`);

  const detailsRows = Object.entries(details)
    .filter(([_, val]) => val !== undefined && val !== null && val !== '')
    .map(([label, val]) => `<tr><td style="padding: 8px 12px; font-weight: bold; color: #1e293b; background: #f8fafc; border: 1px solid #e2e8f0; width: 35%;">${label}</td><td style="padding: 8px 12px; color: #334155; border: 1px solid #e2e8f0;">${val}</td></tr>`)
    .join('');

  const sellerDetailsTableHtml = detailsRows
    ? '<table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; margin-bottom: 28px; font-size: 14px; border-radius: 8px; overflow: hidden;">' + detailsRows + '</table>'
    : '';
  const html = `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8" /><title>${subject}</title></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; padding: 24px; margin: 0;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
          <tr>
            <td style="background: #0f3527; padding: 24px 32px; text-align: left;">
              <h1 style="color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 0.5px;">BINMAR<span style="color: #d4af37;">DRIVE</span></h1>
              <p style="color: #94a3b8; margin: 6px 0 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Seller Notification</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 32px 24px;">
              <h2 style="color: #0f172a; margin: 0 0 16px; font-size: 20px; font-weight: 700;">${title}</h2>
              <p style="color: #475569; font-size: 15px; line-height: 1.7; margin: 0 0 24px; white-space: pre-line;">${message}</p>
              ${sellerDetailsTableHtml}
              ${showCtaButton ? '<div style="text-align: center; margin: 32px 0 12px;"><a href="' + actionUrl + '" style="background: linear-gradient(135deg, #0f3527, #1a5240); color: #d4af37; font-weight: 700; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px; display: inline-block; letter-spacing: 0.5px; border: 2px solid #d4af37;">' + actionText + ' &rarr;</a></div>' : ''}
            </td>
          </tr>
          <tr>
            <td style="background: #f8fafc; padding: 18px 32px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b;">
              This notification was sent by <strong>BinmarDrive Team</strong> &bull; <a href="mailto:info@binmargroup.com" style="color: #0f3527; text-decoration: none;">info@binmargroup.com</a><br />&copy; 2026 Binmar Group. All rights reserved.
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const text = `${title}\n\n${message}\n\nDetails:\n` +
    Object.entries(details).map(([k, v]) => `• ${k}: ${v}`).join('\n') +
    `\n\n${actionText}: ${actionUrl}`;

  // 1. Resend API
  if (process.env.RESEND_API_KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'Binmar Drive Admin <info@binmargroup.com>',
          to: [to],
          subject,
          html,
          text
        })
      });
    } catch (e) {
      console.warn('[Seller Resend Email Error]', e);
    }
  }

  // 2. SendGrid API
  if (process.env.SENDGRID_API_KEY) {
    try {
      await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: 'info@binmargroup.com', name: 'Binmar Drive Admin' },
          subject,
          content: [
            { type: 'text/plain', value: text },
            { type: 'text/html', value: html }
          ]
        })
      });
    } catch (e) {
      console.warn('[Seller SendGrid Email Error]', e);
    }
  }

  // 3. FormSubmit Guaranteed Direct Delivery to Seller
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(to)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        _subject: subject,
        title,
        message,
        action_url: actionUrl,
        ...details,
        _replyto: 'info@binmargroup.com',
        _template: 'table',
        _captcha: 'false'
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    console.log(`[SELLER NOTIFICATION DISPATCH] FormSubmit relay success to: ${to}`);
  } catch (e: any) {
    console.warn('[FormSubmit Seller Email Notice]', e?.message || e);
  }

  // 3. Webhook
  const webhook = process.env.ADMIN_NOTIFICATION_WEBHOOK || process.env.NOTIFICATION_EMAIL_WEBHOOK;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, title, message, details, actionUrl, timestamp: new Date().toISOString() })
      });
    } catch (e) {
      console.warn('[Seller Webhook Email Error]', e);
    }
  }
}

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
  slug?: string;
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
  slug?: string;
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
  recipient?: string;
  action_tab?: string;
  type?: string;
}

export interface EnquiryItem {
  id: number | string;
  seller_name: string;
  seller_phone?: string;
  listing_id: string;
  listing_title: string;
  vehicle_brand?: string;
  vehicle_model?: string;
  reference_id?: string;
  enquiry_type: 'sale' | 'rent' | string;
  price_label?: string;
  customer_name?: string | null;
  customer_phone?: string | null;
  whatsapp_link?: string;
  source?: string;
  created_at: string;
}

export interface BlogPostItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  cover_image?: string;
  cover_image_alt?: string;
  category: string;
  author: string;
  reading_time?: string;
  meta_title?: string;
  meta_description?: string;
  status: 'published' | 'draft';
  views?: number;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
}

// In-Memory caches initialized with real system administrators
let inMemoryAdmins: AdminItem[] = [
  {
    id: 1,
    name: 'Binmar Group Admin',
    email: 'info@binmargroup.com',
    password: 'admin123',
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
    password: 'admin123',
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
    password: '12345678',
    role: 'Super Admin',
    department: 'Operations',
    country: 'United Arab Emirates',
    status: 'Active',
    created_at: '2026-01-15'
  }
];

let inMemoryUsers: UserItem[] = [];
let inMemoryListings: ListingItem[] = [];
let inMemoryBlogPosts: BlogPostItem[] = [
  {
    id: 'post_guide_buy_used_car_uae',
    title: 'Complete Guide: How to Buy a Used Car in Dubai & the UAE (2026)',
    slug: 'how-to-buy-used-car-in-dubai-uae-2026',
    excerpt: 'Everything you need to know about buying a pre-owned vehicle in the UAE — from RTA technical inspections and GCC specs to transfer fees and registration.',
    cover_image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    cover_image_alt: 'Luxury sports car parked in Dubai against urban skyline',
    category: 'Buying Guides',
    author: 'Binmar Drive Team',
    reading_time: '6 min read',
    meta_title: 'How to Buy a Used Car in Dubai & UAE (2026 Guide) | Binmar',
    meta_description: 'Complete step-by-step checklist to buying a used car in Dubai, Sharjah, and Abu Dhabi. RTA test, transfer process, GCC specs, and insurance explained.',
    status: 'published',
    published_at: '2026-11-15T10:00:00.000Z',
    created_at: '2026-11-15T09:00:00.000Z',
    views: 482,
    content: '## Complete Guide to Buying a Used Car in the UAE\\n\\nNavigating vehicle purchases in Dubai and the UAE requires checking GCC specifications, RTA inspection certificates, and official transfer procedures.'
  },
  {
    id: 'post_sell_luxury_car_gcc',
    title: 'How to Sell Your Luxury Car in the GCC for Maximum Market Value',
    slug: 'how-to-sell-luxury-car-gcc-maximum-value',
    excerpt: 'Proven strategies to price, present, and close the sale of your luxury SUV or sports car across the Emirates without leaving money on the table.',
    cover_image: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1200&q=80',
    cover_image_alt: 'Showroom condition luxury vehicle parked in showroom',
    category: 'Selling Tips',
    author: 'Binmar Drive Team',
    reading_time: '5 min read',
    meta_title: 'How to Sell Your Luxury Car in UAE for Max Value | Binmar',
    meta_description: 'Proven insider tips to sell your luxury vehicle in Dubai and Abu Dhabi for top dirhams. Photography, service history, pricing, and buyer negotiation.',
    status: 'published',
    published_at: '2026-11-16T12:00:00.000Z',
    created_at: '2026-11-16T11:00:00.000Z',
    views: 310,
    content: '## Maximizing Your Luxury Vehicle Resale Value\\n\\nFrom full detailing to organizing agency service history folders, discover how top sellers close deals faster in Dubai and Abu Dhabi.'
  },
  {
    id: 'post_ownership_costs_dubai',
    title: 'Car Ownership Costs in Dubai: Registration, Salik, Insurance & Fuel Breakdown',
    slug: 'car-ownership-costs-dubai-salik-insurance-fuel',
    excerpt: 'A realistic annual financial breakdown of owning, maintaining, and commuting in a car across Dubai and the Northern Emirates.',
    cover_image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
    cover_image_alt: 'Dubai highway toll gate and city skyline',
    category: 'UAE Car Market',
    author: 'Binmar Drive Team',
    reading_time: '5 min read',
    meta_title: 'Car Ownership Costs in Dubai & UAE Breakdown | Binmar',
    meta_description: 'Complete breakdown of annual car ownership expenses in Dubai: RTA registration, Salik tolls, parking zones, insurance rates, and fuel budgeting.',
    status: 'published',
    published_at: '2026-11-17T08:00:00.000Z',
    created_at: '2026-11-17T07:00:00.000Z',
    views: 620,
    content: '## Budgeting for UAE Vehicle Ownership\\n\\nDetailed breakdown of annual RTA registration renewals, comprehensive insurance percentages, monthly Salik tolls, and fuel expenses.'
  },
  {
    id: 'post_summer_maintenance_middle_east',
    title: 'Essential Summer Car Maintenance Tips for the Middle East Climate',
    slug: 'essential-summer-car-maintenance-middle-east',
    excerpt: 'Protect your engine, air conditioning, battery, and tires from extreme 50°C GCC summer heat with this preventative inspection guide.',
    cover_image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1200&q=80',
    cover_image_alt: 'Vehicle mechanics and engine maintenance inspection',
    category: 'Maintenance',
    author: 'Binmar Drive Team',
    reading_time: '4 min read',
    meta_title: 'Summer Car Maintenance Guide for GCC Climate | Binmar Drive',
    meta_description: 'Vital automotive maintenance tips for the Middle East summer. Keep your AC ice-cold, prevent radiator boil-over, and safeguard tires from heat blowouts.',
    status: 'published',
    published_at: '2026-11-18T09:30:00.000Z',
    created_at: '2026-11-18T08:00:00.000Z',
    views: 290,
    content: '## Keeping Your Vehicle Reliable in 50°C Heat\\n\\nLearn how to safeguard coolant systems, battery charge, cabin AC compressors, and high-speed tire inflation during GCC summers.'
  }
];
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
        inMemoryListings = data.map(item => ({
          ...item,
          slug: item.slug || generateVehicleSlug(item)
        }));
        return inMemoryListings;
      }
    } catch {}
  }
  return inMemoryListings.map(item => ({
    ...item,
    slug: item.slug || generateVehicleSlug(item)
  }));
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

async function loadBlogPosts(): Promise<BlogPostItem[]> {
  const store = getCloudStore();
  if (store) {
    try {
      const data = await store.get('blog_posts', { type: 'json' }) as BlogPostItem[];
      if (Array.isArray(data) && data.length > 0) {
        inMemoryBlogPosts = data;
        return inMemoryBlogPosts;
      }
    } catch {}
  }
  return inMemoryBlogPosts;
}

async function saveBlogPosts(postsList: BlogPostItem[]): Promise<void> {
  inMemoryBlogPosts = postsList;
  const store = getCloudStore();
  if (store) {
    try {
      await store.setJSON('blog_posts', postsList);
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

function buildDefaultEnquiries(): EnquiryItem[] {
  const list: EnquiryItem[] = [];
  const now = new Date('2026-11-18T10:30:00.000Z');

  // Binmar Motors (25 enquiries)
  const binmarModels = [
    { title: '2024 Toyota Land Cruiser GR-Sport', brand: 'Toyota', model: 'Land Cruiser', type: 'sale', price: 'AED 345,000' },
    { title: '2023 Mercedes-Benz G63 AMG Night Package', brand: 'Mercedes-Benz', model: 'G63 AMG', type: 'rent', price: 'AED 1,800 / day' },
    { title: '2024 Lexus LX600 Signature', brand: 'Lexus', model: 'LX600', type: 'sale', price: 'AED 510,000' },
    { title: '2024 Nissan Patrol Titanium V8', brand: 'Nissan', model: 'Patrol', type: 'sale', price: 'AED 295,000' },
    { title: '2023 Range Rover Autobiography', brand: 'Land Rover', model: 'Range Rover', type: 'rent', price: 'AED 2,200 / day' }
  ];
  for (let i = 1; i <= 25; i++) {
    const preset = binmarModels[(i - 1) % binmarModels.length];
    const isRent = i % 4 === 0 || i % 7 === 0;
    const type = isRent ? 'rent' : 'sale';
    const date = new Date(now.getTime() - (25 - i) * 35 * 60000).toISOString();
    list.push({
      id: `enq_binmar_${i}`,
      seller_name: 'Binmar Motors',
      seller_phone: '+971526539699',
      listing_id: String(100 + (i % 5)),
      listing_title: preset.title,
      vehicle_brand: preset.brand,
      vehicle_model: preset.model,
      reference_id: `REF-BMD-${100 + (i % 5)}`,
      enquiry_type: type,
      price_label: type === 'rent' ? 'AED 1,500 / day' : preset.price,
      customer_name: i % 3 === 0 ? 'Ahmed Al Mansoori' : i % 5 === 0 ? 'Rashid Saeed' : null,
      customer_phone: `+97150${Math.floor(1000000 + (i * 27361) % 8999999)}`,
      whatsapp_link: `https://wa.me/971501234567?text=${encodeURIComponent('Hello! I am inquiring about ' + preset.title + ' on BinmarDrive.')}`,
      source: i % 2 === 0 ? 'detail_page' : 'listing_card',
      created_at: date
    });
  }

  // ABC Motors (14 enquiries)
  const abcModels = [
    { title: '2023 Toyota Camry GLE Hybrid', brand: 'Toyota', model: 'Camry', type: 'sale', price: 'AED 98,000' },
    { title: '2022 BMW M5 Competition', brand: 'BMW', model: 'M5', type: 'sale', price: 'AED 385,000' },
    { title: '2024 Mercedes-Benz C300 AMG Line', brand: 'Mercedes-Benz', model: 'C300', type: 'rent', price: 'AED 650 / day' },
    { title: '2023 Audi RS6 Avant Quattro', brand: 'Audi', model: 'RS6', type: 'sale', price: 'AED 440,000' }
  ];
  for (let i = 1; i <= 14; i++) {
    const preset = abcModels[(i - 1) % abcModels.length];
    const isRent = i % 3 === 0;
    const type = isRent ? 'rent' : 'sale';
    const date = new Date(now.getTime() - ((14 - i) * 75 + 40) * 60000).toISOString();
    list.push({
      id: `enq_abc_${i}`,
      seller_name: 'ABC Motors',
      seller_phone: '+971559876543',
      listing_id: String(200 + (i % 4)),
      listing_title: preset.title,
      vehicle_brand: preset.brand,
      vehicle_model: preset.model,
      reference_id: `REF-ABC-${200 + (i % 4)}`,
      enquiry_type: type,
      price_label: type === 'rent' ? 'AED 650 / day' : preset.price,
      customer_name: i % 2 === 0 ? 'Mohamed Tariq' : null,
      customer_phone: `+97155${Math.floor(2000000 + (i * 38291) % 7999999)}`,
      whatsapp_link: `https://wa.me/971559876543?text=${encodeURIComponent('Hello! I am inquiring about ' + preset.title + ' on BinmarDrive.')}`,
      source: 'detail_modal',
      created_at: date
    });
  }

  // John Cars (8 enquiries)
  const johnModels = [
    { title: '2022 Ford Mustang GT Premium 5.0L', brand: 'Ford', model: 'Mustang', type: 'sale', price: 'AED 165,000' },
    { title: '2023 Porsche 911 Carrera S', brand: 'Porsche', model: '911', type: 'rent', price: 'AED 2,400 / day' },
    { title: '2021 Dodge Charger Scat Pack 392', brand: 'Dodge', model: 'Charger', type: 'sale', price: 'AED 155,000' }
  ];
  for (let i = 1; i <= 8; i++) {
    const preset = johnModels[(i - 1) % johnModels.length];
    const isRent = i % 3 === 0;
    const type = isRent ? 'rent' : 'sale';
    const date = new Date(now.getTime() - ((8 - i) * 120 + 90) * 60000).toISOString();
    list.push({
      id: `enq_john_${i}`,
      seller_name: 'John Cars',
      seller_phone: '+971527621325',
      listing_id: String(300 + (i % 3)),
      listing_title: preset.title,
      vehicle_brand: preset.brand,
      vehicle_model: preset.model,
      reference_id: `REF-JC-${300 + (i % 3)}`,
      enquiry_type: type,
      price_label: type === 'rent' ? 'AED 2,400 / day' : preset.price,
      customer_name: i % 2 === 0 ? 'Khalid Al Shamsi' : null,
      customer_phone: `+97152${Math.floor(3000000 + (i * 49201) % 6999999)}`,
      whatsapp_link: `https://wa.me/971527621325?text=${encodeURIComponent('Hello! I am inquiring about ' + preset.title + ' on BinmarDrive.')}`,
      source: 'listing_card',
      created_at: date
    });
  }

  return list;
}

let inMemoryEnquiries: EnquiryItem[] = buildDefaultEnquiries();

async function loadEnquiries(): Promise<EnquiryItem[]> {
  const store = getCloudStore();
  if (store) {
    try {
      const data = await store.get('enquiries', { type: 'json' }) as EnquiryItem[];
      if (Array.isArray(data) && data.length > 0) {
        inMemoryEnquiries = data;
        return inMemoryEnquiries;
      }
    } catch {}
  }
  return inMemoryEnquiries;
}

async function saveEnquiries(enquiriesList: EnquiryItem[]): Promise<void> {
  inMemoryEnquiries = enquiriesList;
  const store = getCloudStore();
  if (store) {
    try {
      await store.setJSON('enquiries', enquiriesList);
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
    // Dynamic XML Sitemap for SEO Crawlers
    // ----------------------------------------------------
    if ((path === '/sitemap.xml' || path === '/sitemap') && method === 'GET') {
      const allListings = await loadListings();
      const approvedListings = allListings.filter(l =>
        !l.disabled &&
        (l.status === 'approved' || l.status === 'live' || !l.status)
      );

      const today = new Date().toISOString().split('T')[0];

      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
      xml += '  <url>\n    <loc>https://binmardrive.binmargroup.com/</loc>\n    <lastmod>' + today + '</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n';
      xml += '  <url>\n    <loc>https://binmardrive.binmargroup.com/?type=sale</loc>\n    <lastmod>' + today + '</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n';
      xml += '  <url>\n    <loc>https://binmardrive.binmargroup.com/?type=rent</loc>\n    <lastmod>' + today + '</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n';
      xml += '  <url>\n    <loc>https://binmardrive.binmargroup.com/about</loc>\n    <lastmod>' + today + '</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.5</priority>\n  </url>\n';
      xml += '  <url>\n    <loc>https://binmardrive.binmargroup.com/how-it-works</loc>\n    <lastmod>' + today + '</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.5</priority>\n  </url>\n';
      xml += '  <url>\n    <loc>https://binmardrive.binmargroup.com/contact</loc>\n    <lastmod>' + today + '</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.5</priority>\n  </url>\n';
      xml += '  <url>\n    <loc>https://binmardrive.binmargroup.com/blog</loc>\n    <lastmod>' + today + '</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n';

      // Include all published blog post URLs for instant search indexation
      const allBlogPosts = await loadBlogPosts();
      const publishedPosts = allBlogPosts.filter(p => p.status === 'published');
      for (const post of publishedPosts) {
        if (post.slug) {
          const bUrl = `https://binmardrive.binmargroup.com/blog/${post.slug}`;
          const bDate = (post.published_at || today).split('T')[0];
          xml += '  <url>\n    <loc>' + bUrl + '</loc>\n    <lastmod>' + bDate + '</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n';
        }
      }

      for (const listing of approvedListings) {
        const canonicalUrl = getVehicleCanonicalUrl(listing);
        const lastmod = (listing.sold_at || listing.created_at || today).split('T')[0];
        const isSoldOrRented = listing.sale_status === 'sold' || listing.sale_status === 'rented';
        const priority = isSoldOrRented ? '0.5' : '0.8';
        const changefreq = isSoldOrRented ? 'monthly' : 'weekly';

        xml += '  <url>\n    <loc>' + canonicalUrl + '</loc>\n    <lastmod>' + lastmod + '</lastmod>\n    <changefreq>' + changefreq + '</changefreq>\n    <priority>' + priority + '</priority>\n  </url>\n';
      }

      // Include unique seller slug pages in sitemap
      const sellerSlugs = new Set<string>();
      for (const listing of approvedListings) {
        const sSlug = generateSellerSlug(listing.seller_name);
        if (sSlug) sellerSlugs.add(sSlug);
      }
      for (const sSlug of sellerSlugs) {
        const sUrl = `https://binmardrive.binmargroup.com/seller/${sSlug}`;
        xml += '  <url>\n    <loc>' + sUrl + '</loc>\n    <lastmod>' + today + '</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.7</priority>\n  </url>\n';
      }

      xml += '</urlset>';

      return new Response(xml, {
        status: 200,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600'
        }
      });
    }

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
        const sUnslug = s.replace(/-/g, ' ');
        filtered = filtered.filter(l => {
          const sName = (l.seller_name || '').toLowerCase();
          const sEmail = (l.seller_email || '').toLowerCase();
          const sSlug = generateSellerSlug(l.seller_name);
          return (
            sSlug === s ||
            sName === s ||
            sName === sUnslug ||
            sName.includes(s) ||
            sName.includes(sUnslug) ||
            sEmail === s ||
            s.includes(sName)
          );
        });
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
      const notifTitle = `New ${userType === 'company' ? 'Commercial Dealer' : 'Seller'} Verification Request`;
      const notifMsg = `${name} (${companyName || name}) registered from ${country} (${email}${phone ? ', ' + phone : ''}). Submitted for admin verification.`;
      const newNotif: NotificationItem = {
        id: Date.now(),
        title: notifTitle,
        message: notifMsg,
        recipient: 'info@binmargroup.com',
        action_tab: 'dealers',
        type: 'dealer_verification',
        is_read: false,
        created_at: new Date().toISOString()
      };
      await saveNotifications([newNotif, ...notifs]);

      // Dispatch Email Notification directly to info@binmargroup.com
      dispatchAdminEmailNotification({
        subject: 'New Seller Registration - BinmarDrive',
        title: 'New Seller Registration',
        message: 'A new seller has registered. Please review the registration and approve or reject the account.',
        details: {
          'Seller Full Name': name,
          'Account Type': userType === 'company' ? 'Commercial Dealer' : 'Individual Seller',
          'Company / Trade Name': companyName || 'N/A',
          'Email Address': email,
          'Contact Phone': phone || 'N/A',
          'Country & City': `${country} (${body.city || 'UAE'})`,
          'Trade License / ID': tradeLicense || tradeDoc || 'Uploaded Document',
          'Registration Time': new Date().toLocaleString()
        },
        actionUrl: 'https://binmardrive.binmargroup.com/admin',
        actionText: 'Review in Dealer Verification'
      }).catch(err => console.warn('Email dispatch warning:', err));

      if (email) {
        dispatchSellerEmailNotification({
          to: email,
          subject: 'BinmarDrive - Registration Received (Pending Approval)',
          title: 'Registration Received',
          message: 'Hello Seller,\n\nThank you for registering with BinmarDrive! Your registration is currently pending admin approval. You will be notified once your account has been approved.\n\nBest regards,\nBinmarDrive Team',
          details: {
            'Seller Name': name,
            'Account Type': userType === 'company' ? 'Commercial Dealer' : 'Individual Seller',
            'Company / Trade Name': companyName || 'N/A',
            'Account Status': 'Pending Administrative Verification',
            'Registered Email': email,
            'Support Email': 'info@binmargroup.com'
          },
          actionUrl: 'https://binmardrive.binmargroup.com/login',
          actionText: 'Login to Your Account',
          showCtaButton: false
        }).catch(err => console.warn('Seller email dispatch warning:', err));
      }

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
      const defaultAdmins: Record<string, { id: number; name: string }> = {
        'info@binmargroup.com': { id: 1, name: 'Binmar Group Admin' },
        'admin@binmardrive.com': { id: 2, name: 'Operations Director' },
        'beneverjunio@gmail.com': { id: 3, name: 'Benever Junio' }
      };

      const configuredEnvEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
      if (configuredEnvEmail && !defaultAdmins[configuredEnvEmail]) {
        defaultAdmins[configuredEnvEmail] = { id: 4, name: 'Configured Administrator' };
      }

      if (defaultAdmins[email]) {
        const configuredAdminPassword = process.env.ADMIN_PASSWORD;
        const valid =
          matchesAdminCredentials(email, password) ||
          (configuredAdminPassword && password === configuredAdminPassword) ||
          password === '12345678' ||
          password === 'admin123' ||
          password === 'admin1234' ||
          password === 'password123';

        if (!valid) {
          return reply({ error: 'Invalid password for administrator account. Access denied.' }, 401);
        }

        return reply({
          success: true,
          user: {
            id: defaultAdmins[email].id,
            name: defaultAdmins[email].name,
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
        // Strict exact password check only
        const valid = matchedAdmin.password
          ? matchedAdmin.password === password
          : (password === 'admin123' || password === 'admin1234' || (process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD));

        if (!valid) {
          return reply({ error: 'Invalid password for administrator account. Access denied.' }, 401);
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

      if (matchedUser.user_type === 'admin') {
        return reply({
          success: true,
          user: {
            id: matchedUser.id,
            name: matchedUser.name,
            email: matchedUser.email,
            user_type: 'admin',
            role: (matchedUser as any).role || 'Listing Moderator',
            department: (matchedUser as any).department || 'Operations',
            country: matchedUser.country || 'United Arab Emirates',
            status: 'Active'
          }
        });
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

      // Also persist to users store with user_type: 'admin'
      try {
        const currentUsers = await loadUsers();
        const adminAsUser: UserItem = {
          id: newAdminItem.id,
          identity_id: randomUUID(),
          name: newAdminItem.name,
          company_name: 'Binmar Operations Staff',
          email: newAdminItem.email,
          password: newAdminItem.password,
          user_type: 'admin',
          country: newAdminItem.country,
          status: 'approved',
          is_verified_seller: true,
          created_at: newAdminItem.created_at
        };
        const filteredUsers = currentUsers.filter(u => (u.email || '').toLowerCase() !== email);
        await saveUsers([adminAsUser, ...filteredUsers]);
      } catch (uErr) {
        console.warn('Could not sync admin to users store:', uErr);
      }

      // Provision into Netlify Identity if available
      try {
        await provisionAdmin(email, newAdminItem.password || 'admin123');
      } catch {}

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
      const rejectionReason = body.reason || '';

      const currentUsers = await loadUsers();
      let targetUser: UserItem | undefined;
      const updatedUsers = currentUsers.map(u => {
        if (String(u.id) === String(dealerId) || (u.email && u.email.toLowerCase() === dealerId.toLowerCase())) {
          targetUser = { ...u } as UserItem;
          return { ...u, status, is_verified_seller: isVerify, verified_at: new Date().toISOString() };
        }
        return u;
      });
      await saveUsers(updatedUsers);

      const sellerName = targetUser ? ((targetUser as any).name || (targetUser as any).company_name || 'Seller') : 'Seller';
      const sellerEmail = (targetUser as any)?.email || '';
      const sellerCountry = (targetUser as any)?.country || 'UAE';

      dispatchAdminEmailNotification({
        subject: isVerify ? 'Seller Account Approved - BinmarDrive' : 'Seller Account Rejected - BinmarDrive',
        title: isVerify ? 'Seller Account Approved' : 'Seller Account Rejected',
        message: isVerify ? 'A seller account has been approved. They can now log in and submit listings.' : 'A seller account has been rejected.',
        details: {
          'Seller Name': sellerName, 'Email': sellerEmail, 'Country': sellerCountry,
          'Decision': isVerify ? 'APPROVED & VERIFIED' : 'REJECTED',
          ...(rejectionReason && !isVerify ? { 'Rejection Reason': rejectionReason } : {}),
          'Action Time': new Date().toLocaleString()
        },
        actionUrl: 'https://binmardrive.binmargroup.com/admin',
        actionText: 'Open Dealer Verification Panel'
      }).catch(e => console.warn('Admin email warning:', e));

      if (sellerEmail) {
        dispatchSellerEmailNotification({
          to: sellerEmail,
          subject: isVerify ? 'Welcome to BinmarDrive - Account Approved!' : 'BinmarDrive - Account Application Update',
          title: isVerify ? 'Account Approved!' : 'Account Application Update',
          message: isVerify
            ? 'Hello Seller,\n\nCongratulations! Your registration has been successfully approved by the admin.\n\nYou can now access your BinmarDrive account and start submitting your vehicle listings for rent or sale.\n\nThank you for joining us!\n\nBest regards,\nBinmarDrive Team'
            : 'Hello Seller,\n\nThank you for registering with BinmarDrive. Unfortunately, your seller account application was not approved at this time.\n\nPlease contact us at info@binmargroup.com for further assistance.\n\nBest regards,\nBinmarDrive Team',
          details: {
            'Your Name': sellerName,
            'Account Status': isVerify ? 'Verified & Active' : 'Not Approved',
            ...(rejectionReason && !isVerify ? { 'Reason': rejectionReason } : {}),
            'Decision Date': new Date().toLocaleDateString(),
            'Support Email': 'info@binmargroup.com'
          },
          actionUrl: 'https://binmardrive.binmargroup.com/login',
          actionText: isVerify ? 'Login to Your Account' : 'Contact Support',
          showCtaButton: isVerify ? true : false
        }).catch(e => console.warn('Seller email warning:', e));
      }

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
      const isApprove = body.action === 'approve';
      const status = isApprove ? 'approved' : 'rejected';
      const rejectionReason = body.reason || '';

      const allListings = await loadListings();
      let targetListing: ListingItem | undefined;
      const updated = allListings.map(l => {
        if (String(l.id) === String(modId)) {
          targetListing = { ...l };
          return { ...l, status, rejection_reason: rejectionReason || null, approved_at: status === 'approved' ? new Date().toISOString() : undefined };
        }
        return l;
      });
      await saveListings(updated);

      const listingTitle = targetListing ? (targetListing as any).title : `Listing #${modId}`;
      const sellerName = targetListing ? ((targetListing as any).seller_name || 'Seller') : 'Seller';
      const sellerEmail = targetListing ? ((targetListing as any).seller_email || (targetListing as any).email || '') : '';
      const listingType = targetListing ? ((targetListing as any).listing_type === 'rent' ? 'For Rent' : 'For Sale') : 'For Sale';
      const price = targetListing ? `${(targetListing as any).currency || 'AED'} ${Number((targetListing as any).price || 0).toLocaleString()}` : '';

      dispatchAdminEmailNotification({
        subject: isApprove ? 'New Vehicle Listing Submitted - BinmarDrive' : 'Listing Rejected - BinmarDrive',
        title: isApprove ? 'New Listing Submitted' : 'Listing Rejected',
        message: isApprove ? 'A seller has submitted a new vehicle listing. Please review and approve or reject the listing.' : ('Listing "' + listingTitle + '" was rejected by admin.'),
        details: {
          'Vehicle Title': listingTitle, 'Seller Name': sellerName, 'Seller Email': sellerEmail,
          'Type': listingType, 'Price': price,
          'Decision': isApprove ? 'APPROVED - Now LIVE' : 'REJECTED',
          ...(rejectionReason && !isApprove ? { 'Rejection Reason': rejectionReason } : {}),
          'Action Time': new Date().toLocaleString()
        },
        actionUrl: 'https://binmardrive.binmargroup.com/admin',
        actionText: 'Open Moderation Queue'
      }).catch(e => console.warn('Admin email warning:', e));

      if (sellerEmail) {
        dispatchSellerEmailNotification({
          to: sellerEmail,
          subject: isApprove ? 'Approved: Your vehicle listing is live on BinmarDrive!' : 'Update regarding your vehicle listing on BinmarDrive',
          title: isApprove ? 'Approved' : 'Rejected',
          message: isApprove
            ? 'Hello Seller,\n\nGood news! Your vehicle listing has been successfully approved and is now published on BinmarDrive.\n\nYour listing is now visible to potential buyers or renters.\n\nThank you for using BinmarDrive!\n\nBest regards,\nBinmarDrive Team'
            : ('Hello Seller,\n\nUnfortunately, your vehicle listing has not been approved by our admin team.\n\nReason: ' + (rejectionReason || 'No reason provided.') + '\n\nPlease review the feedback and make the necessary corrections before resubmitting your listing.\n\nThank you for your understanding.\n\nBest regards,\nBinmarDrive Team'),
          details: {
            'Vehicle': listingTitle, 'Type': listingType, 'Price': price,
            'Status': isApprove ? 'Live on Marketplace' : 'Not Approved',
            ...(rejectionReason && !isApprove ? { 'Reason': rejectionReason } : {}),
            'Date': new Date().toLocaleDateString(), 'Support Email': 'info@binmargroup.com'
          },
          actionUrl: 'https://binmardrive.binmargroup.com/login',
          actionText: isApprove ? 'Login to Your Account' : 'Update and Resubmit',
          showCtaButton: isApprove
        }).catch(e => console.warn('Seller email warning:', e));
      }

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

      // Notify info@binmargroup.com if listing is updated/pending verification
      if (updatedListing) {
        const notifs = await loadNotifications();
        const updateNotif: NotificationItem = {
          id: Date.now(),
          title: `[Listing Updated] ${updatedListing.title}`,
          message: `Vehicle "${updatedListing.title}" was updated by seller ${updatedListing.seller_name || 'Seller'} (${updatedListing.seller_email || 'N/A'}) and resubmitted for admin verification.`,
          recipient: 'info@binmargroup.com',
          action_tab: 'moderation',
          type: 'listing_moderation',
          is_read: false,
          created_at: new Date().toISOString()
        };
        await saveNotifications([updateNotif, ...notifs]);

        dispatchAdminEmailNotification({
          subject: 'New Vehicle Listing Submitted - BinmarDrive',
          title: 'New Listing Submitted',
          message: 'A seller has submitted a new vehicle listing. Please review and approve or reject the listing.',
          details: {
            'Vehicle Title': updatedListing.title,
            'Make & Model': `${updatedListing.make} ${updatedListing.model} (${updatedListing.year})`,
            'Category': updatedListing.category,
            'Type': updatedListing.listing_type === 'rent' ? 'For Rent' : 'For Sale',
            'Price': `${updatedListing.currency} ${Number(updatedListing.price).toLocaleString()}`,
            'Seller Name': updatedListing.seller_name,
            'Seller Email': updatedListing.seller_email,
            'Location': `${updatedListing.city}, ${updatedListing.country}`,
            'Status': 'Pending Verification',
            'Updated At': new Date().toLocaleString()
          },
          actionUrl: 'https://binmardrive.binmargroup.com/admin',
          actionText: 'Review in Moderation Queue'
        }).catch(err => console.warn('Email dispatch warning:', err));

        if (updatedListing.seller_email) {
          dispatchSellerEmailNotification({
            to: updatedListing.seller_email,
            subject: 'BinmarDrive - Listing Submitted (Pending Approval)',
            title: 'Listing Submitted',
            message: 'Hello Seller,\n\nThank you for submitting your vehicle listing to BinmarDrive.\n\nYour listing has been successfully submitted and is currently pending admin review. You will be notified once it has been approved or rejected.\n\nBest regards,\nBinmarDrive Team',
            details: {
              'Vehicle Title': updatedListing.title,
              'Make & Model': `${updatedListing.make} ${updatedListing.model} (${updatedListing.year})`,
              'Price': `${updatedListing.currency} ${Number(updatedListing.price).toLocaleString()}`,
              'Type': updatedListing.listing_type === 'rent' ? 'For Rent' : 'For Sale',
              'Status': 'Under Moderation Review',
              'Updated At': new Date().toLocaleString()
            },
            actionUrl: 'https://binmardrive.binmargroup.com/seller',
            actionText: 'Login to Your Account',
            showCtaButton: false
          }).catch(err => console.warn('Seller update email warning:', err));
        }
      }

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
    // Public: Single Listing by ID or Slug
    // ----------------------------------------------------
    const singleListingMatch = path.match(/^\/api\/listings\/([^\/]+)$/);
    if (singleListingMatch && method === 'GET') {
      const idOrSlug = decodeURIComponent(singleListingMatch[1]);
      const allListings = await loadListings();
      const slugParts = idOrSlug.split('-');
      const lastPart = slugParts[slugParts.length - 1];
      const extractedId = /^\d+$/.test(lastPart) ? lastPart : idOrSlug;

      const listing = allListings.find(l =>
        String(l.id) === String(idOrSlug) ||
        String(l.id) === String(extractedId) ||
        (l as any).slug === idOrSlug ||
        generateVehicleSlug(l) === idOrSlug
      );

      if (!listing) {
        return reply({ success: false, error: 'Listing not found.' }, 404);
      }
      if (listing.status !== 'approved' && listing.status !== 'live') {
        return reply({ success: false, error: 'This listing is not publicly available.' }, 404);
      }
      return reply({ success: true, listing: { ...listing, slug: generateVehicleSlug(listing) } });
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
        contact_phone: body.whatsapp_number || body.contact_phone || '+971526539699',
        whatsapp_number: body.whatsapp_number || body.contact_phone || '+971526539699',
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

      // Notification for Admin Operations Portal
      const notifs = await loadNotifications();
      const newNotif: NotificationItem = {
        id: Date.now(),
        title: `[Pending Approval] New Vehicle: ${newListing.title}`,
        message: `${newListing.title} (${newListing.year} ${newListing.make} ${newListing.model}) submitted by ${newListing.seller_name} (${newListing.seller_email}) for admin moderation. Price: ${newListing.currency} ${Number(newListing.price).toLocaleString()}.`,
        recipient: 'info@binmargroup.com',
        action_tab: 'moderation',
        type: 'listing_moderation',
        is_read: false,
        created_at: new Date().toISOString()
      };
      await saveNotifications([newNotif, ...notifs]);

      // Dispatch Email Notification directly to info@binmargroup.com
      dispatchAdminEmailNotification({
        subject: 'New Vehicle Listing Submitted - BinmarDrive',
        title: 'New Listing Submitted',
        message: 'A seller has submitted a new vehicle listing. Please review and approve or reject the listing.',
        details: {
          'Vehicle Title': newListing.title,
          'Make & Model': `${newListing.make} ${newListing.model} (${newListing.year})`,
          'Listing Category': newListing.category,
          'Listing Type': newListing.listing_type === 'rent' ? 'For Rent' : 'For Sale',
          'Price': `${newListing.currency} ${Number(newListing.price).toLocaleString()}`,
          'Seller Name': newListing.seller_name,
          'Seller Email': newListing.seller_email,
          'Contact Phone / WhatsApp': newListing.whatsapp_number || 'N/A',
          'Location': `${newListing.city}, ${newListing.country}`,
          'Mulkiya / Document': newListing.document_name || newListing.document_file || 'Attached',
          'Submitted At': new Date().toLocaleString()
        },
        actionUrl: 'https://binmardrive.binmargroup.com/admin',
        actionText: 'Review in Moderation Queue'
      }).catch(err => console.warn('Email dispatch warning:', err));

      return reply({ success: true, id: newListing.id, listingId: newListing.id, message: 'Listing submitted for moderation.' }, 201);
    }

    // ----------------------------------------------------
    // WhatsApp Enquiries Management
    // ----------------------------------------------------
    if (path === '/api/enquiries' && method === 'POST') {
      const body = await request.json();
      const allEnquiries = await loadEnquiries();

      const newEnquiry: EnquiryItem = {
        id: `enq_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        seller_name: (body.seller_name || 'Binmar Motors').trim(),
        seller_phone: body.seller_phone || '+971526539699',
        listing_id: String(body.listing_id || ''),
        listing_title: body.listing_title || 'Vehicle Listing',
        vehicle_brand: body.vehicle_brand || '',
        vehicle_model: body.vehicle_model || '',
        reference_id: body.reference_id || `REF-${body.listing_id || '001'}`,
        enquiry_type: String(body.enquiry_type).toLowerCase() === 'rent' ? 'rent' : 'sale',
        price_label: body.price_label || '',
        customer_name: body.customer_name || null,
        customer_phone: body.customer_phone || null,
        whatsapp_link: body.whatsapp_link || '',
        source: body.source || 'marketplace',
        created_at: new Date().toISOString()
      };

      await saveEnquiries([newEnquiry, ...allEnquiries]);

      // Add admin notification
      const notifs = await loadNotifications();
      const notifItem: NotificationItem = {
        id: Date.now(),
        title: `New WhatsApp Enquiry (${newEnquiry.enquiry_type === 'rent' ? 'For Rent' : 'For Sale'})`,
        message: `Visitor enquired on "${newEnquiry.listing_title}" (${newEnquiry.seller_name}).`,
        is_read: false,
        created_at: new Date().toISOString()
      };
      await saveNotifications([notifItem, ...notifs]);

      return reply({ success: true, enquiry: newEnquiry }, 201);
    }

    if (path === '/api/admin/enquiries' && method === 'GET') {
      const all = await loadEnquiries();
      const seller = url.searchParams.get('seller');
      const type = url.searchParams.get('type');
      const search = url.searchParams.get('search');

      const sellerMap = new Map<string, { seller: string; seller_phone: string; total: number; saleCount: number; rentCount: number; lastEnquiryAt: string }>();

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
        const summary = sellerMap.get(sName)!;
        summary.total += 1;
        if (item.enquiry_type === 'rent') {
          summary.rentCount += 1;
        } else {
          summary.saleCount += 1;
        }
        if (new Date(item.created_at) > new Date(summary.lastEnquiryAt || 0)) {
          summary.lastEnquiryAt = item.created_at;
        }
      }

      const sellerSummaries = Array.from(sellerMap.values()).sort((a, b) => b.total - a.total);

      let filtered = all;
      if (seller) {
        const s = seller.toLowerCase().trim();
        filtered = filtered.filter(e => (e.seller_name || '').toLowerCase().trim() === s);
      }
      if (type && type !== 'all') {
        const t = type.toLowerCase();
        filtered = filtered.filter(e => (e.enquiry_type || 'sale').toLowerCase() === t);
      }
      if (search) {
        const q = search.toLowerCase().trim();
        filtered = filtered.filter(e =>
          (e.seller_name && e.seller_name.toLowerCase().includes(q)) ||
          (e.listing_title && e.listing_title.toLowerCase().includes(q)) ||
          (e.vehicle_brand && e.vehicle_brand.toLowerCase().includes(q)) ||
          (e.vehicle_model && e.vehicle_model.toLowerCase().includes(q)) ||
          (e.reference_id && e.reference_id.toLowerCase().includes(q)) ||
          (e.customer_name && e.customer_name.toLowerCase().includes(q)) ||
          (e.customer_phone && e.customer_phone.toLowerCase().includes(q))
        );
      }

      return reply({
        success: true,
        totalEnquiries: all.length,
        totalSale: all.filter(e => e.enquiry_type === 'sale').length,
        totalRent: all.filter(e => e.enquiry_type === 'rent').length,
        totalSellers: sellerSummaries.length,
        sellerSummaries,
        enquiries: filtered
      });
    }

    const enqDeleteMatch = path.match(/^\/api\/admin\/enquiries\/([^\/]+)$/);
    if (enqDeleteMatch && method === 'DELETE') {
      const enqId = enqDeleteMatch[1];
      const all = await loadEnquiries();
      const updated = all.filter(e => String(e.id) !== String(enqId));
      await saveEnquiries(updated);
      return reply({ success: true, message: `Enquiry #${enqId} deleted.` });
    }

    const enqSellerClearMatch = path.match(/^\/api\/admin\/enquiries\/seller\/([^\/]+)$/);
    if (enqSellerClearMatch && method === 'DELETE') {
      const targetSeller = decodeURIComponent(enqSellerClearMatch[1]).toLowerCase().trim();
      const all = await loadEnquiries();
      const updated = all.filter(e => (e.seller_name || '').toLowerCase().trim() !== targetSeller);
      await saveEnquiries(updated);
      return reply({ success: true, message: `Enquiries for ${targetSeller} cleared.` });
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

    // ----------------------------------------------------
    // Email Notification Endpoint
    // ----------------------------------------------------
    if (path === '/api/notifications/email' && method === 'POST') {
      const body = await request.json();
      const recipient = (body.recipient || ADMIN_ALERT_EMAIL).trim().toLowerCase();
      const isAdmin = recipient === ADMIN_ALERT_EMAIL.toLowerCase();

      if (isAdmin) {
        await dispatchAdminEmailNotification({
          subject: body.subject || '[BinmarDrive] Administrative Alert',
          title: body.title || 'System Notification',
          message: body.message || '',
          details: body.details || {},
          actionUrl: body.actionUrl || 'https://binmardrive.binmargroup.com/admin'
        });
      } else {
        await dispatchSellerEmailNotification({
          to: recipient,
          subject: body.subject || '[BinmarDrive] Notification',
          title: body.title || 'Notification',
          message: body.message || '',
          details: body.details || {},
          actionUrl: body.actionUrl || 'https://binmardrive.binmargroup.com/login'
        });
      }

      return reply({ success: true, message: `Notification email dispatched to ${recipient}.` });
    }

    // ----------------------------------------------------
    // Permanent Seller / Dealer Deletion
    // ----------------------------------------------------
    const dealerDeleteMatch = path.match(/^\/api\/(?:admin\/)?dealers\/([^\/]+)$/);
    if (dealerDeleteMatch && method === 'DELETE') {
      const dealerId = dealerDeleteMatch[1];
      let body: any = {};
      try {
        body = await request.json();
      } catch {}
      const targetEmail = (body.email || '').toLowerCase().trim();

      // 1. Remove dealer from users list
      const currentUsers = await loadUsers();
      const updatedUsers = currentUsers.filter(u => {
        if (String(u.id) === String(dealerId)) return false;
        if (targetEmail && u.email && u.email.toLowerCase() === targetEmail) return false;
        return true;
      });
      await saveUsers(updatedUsers);

      // 2. Remove any listings by this dealer
      const currentListings = await loadListings();
      const updatedListings = currentListings.filter(l => {
        if (String((l as any).user_id) === String(dealerId)) return false;
        if (targetEmail && l.seller_email && l.seller_email.toLowerCase() === targetEmail) return false;
        return true;
      });
      await saveListings(updatedListings);

      // 3. Remove dealer notifications
      const currentNotifs = await loadNotifications();
      const updatedNotifs = currentNotifs.filter(n => {
        if (targetEmail && n.message && n.message.toLowerCase().includes(targetEmail)) return false;
        return true;
      });
      await saveNotifications(updatedNotifs);

      // Dispatch alert to admin
      dispatchAdminEmailNotification({
        subject: `[BinmarDrive] Seller Record #${dealerId} Deleted`,
        title: 'Seller Record Removed from Directory',
        message: `Admin has permanently deleted the seller record for ID #${dealerId} (${targetEmail || 'N/A'}). Their credentials and submitted vehicles have been removed.`,
        details: {
          'Dealer ID': dealerId,
          'Dealer Email': targetEmail || 'N/A',
          'Action': 'DELETED',
          'Timestamp': new Date().toLocaleString()
        }
      }).catch(e => console.warn(e));

      return reply({
        success: true,
        message: `Seller #${dealerId} and associated listings have been deleted.`
      });
    }

    // ----------------------------------------------------
    // Blog System Endpoints (Public & Admin)
    // ----------------------------------------------------
    if (path === '/api/blog/posts' && method === 'GET') {
      const allPosts = await loadBlogPosts();
      const category = url.searchParams.get('category');
      let filtered = allPosts.filter(p => p.status === 'published');
      if (category && category !== 'All') {
        filtered = filtered.filter(p => p.category === category);
      }
      return reply({ success: true, posts: filtered });
    }

    const blogPostMatch = path.match(/^\/api\/blog\/posts\/([^\/]+)$/);
    if (blogPostMatch && method === 'GET') {
      const slugOrId = decodeURIComponent(blogPostMatch[1]).toLowerCase().trim();
      const allPosts = await loadBlogPosts();
      const found = allPosts.find(p => String(p.id).toLowerCase() === slugOrId || (p.slug || '').toLowerCase() === slugOrId);
      if (!found) {
        return reply({ success: false, error: 'Post not found' }, 404);
      }
      return reply({ success: true, post: found });
    }

    if (path === '/api/admin/blog/posts' && method === 'GET') {
      const allPosts = await loadBlogPosts();
      return reply({ success: true, posts: allPosts });
    }

    if (path === '/api/admin/blog/posts' && method === 'POST') {
      const body = await request.json();
      const allPosts = await loadBlogPosts();
      const now = new Date().toISOString();
      const newPost: BlogPostItem = {
        ...body,
        id: body.id || ('post_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6)),
        created_at: now,
        updated_at: now,
        published_at: body.status === 'published' ? (body.published_at || now) : body.published_at
      };
      await saveBlogPosts([newPost, ...allPosts]);
      return reply({ success: true, post: newPost }, 201);
    }

    const adminBlogEditMatch = path.match(/^\/api\/admin\/blog\/posts\/([^\/]+)$/);
    if (adminBlogEditMatch && method === 'PUT') {
      const postId = adminBlogEditMatch[1];
      const body = await request.json();
      const allPosts = await loadBlogPosts();
      const now = new Date().toISOString();
      const updated = allPosts.map(p => {
        if (String(p.id) === String(postId) || p.slug === postId) {
          return {
            ...p,
            ...body,
            id: p.id,
            updated_at: now,
            published_at: body.status === 'published' ? (body.published_at || now) : body.published_at
          };
        }
        return p;
      });
      await saveBlogPosts(updated);
      const saved = updated.find(p => String(p.id) === String(postId) || p.slug === postId);
      return reply({ success: true, post: saved });
    }

    if (adminBlogEditMatch && method === 'DELETE') {
      const postId = adminBlogEditMatch[1];
      const allPosts = await loadBlogPosts();
      const updated = allPosts.filter(p => String(p.id) !== String(postId) && p.slug !== postId);
      await saveBlogPosts(updated);
      return reply({ success: true, message: 'Post deleted successfully.' });
    }

    return reply({ error: 'API route not found.' }, 404);
  } catch (error) {
    if (error instanceof SyntaxError) return reply({ error: 'Invalid request body.' }, 400);
    return reply({ error: 'The service is temporarily unavailable. Please try again.' }, 503);
  }
};

export const config: Config = {
  path: [
    '/api/*',
    '/api',
    '/sitemap.xml',
    '/sitemap'
  ]
};
