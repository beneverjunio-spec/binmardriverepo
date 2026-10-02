import { getUser, type User } from '@netlify/identity';
import { and, count, desc, eq, ilike, lte, or } from 'drizzle-orm';
import type { Config } from '@netlify/functions';
import { getDatabase } from '../../db/index.js';
import { listings, notifications, users } from '../../db/schema.js';

function reply(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

async function syncProfile(identity: User) {
  const database = getDatabase();
  const metadata = identity.userMetadata ?? {};
  const accountType = metadata.user_type === 'company' ? 'company' : 'individual';
  const [profile] = await database.insert(users).values({
    identity_id: identity.id,
    email: identity.email ?? '',
    name: identity.name ?? identity.email ?? 'Member',
    user_type: accountType,
    phone: typeof metadata.phone === 'string' ? metadata.phone : null,
    company_name: accountType === 'company' && typeof metadata.company_name === 'string' ? metadata.company_name : null,
    trade_license: accountType === 'company' && typeof metadata.trade_license === 'string' ? metadata.trade_license : null,
    country: typeof metadata.country === 'string' ? metadata.country : 'United Arab Emirates',
    status: accountType === 'company' ? 'pending' : 'approved'
  }).onConflictDoUpdate({
    target: users.identity_id,
    set: { email: identity.email ?? '', name: identity.name ?? identity.email ?? 'Member' }
  }).returning();
  return profile;
}

export default async (request: Request) => {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/$/, '');
  const method = request.method;

  if (method !== 'GET') {
    const origin = request.headers.get('origin');
    if (origin && origin !== url.origin) return reply({ error: 'Request origin is not allowed.' }, 403);
  }

  try {
    if (path === '/api/listings' && method === 'GET') {
      const conditions = [eq(listings.status, 'approved')];
      for (const [parameter, column] of [
        ['make', listings.make], ['country', listings.country],
        ['type', listings.listing_type], ['category', listings.category]
      ] as const) {
        const value = url.searchParams.get(parameter);
        if (value) conditions.push(eq(column, value));
      }
      const maxPrice = url.searchParams.get('maxPrice');
      if (maxPrice && Number.isFinite(Number(maxPrice))) conditions.push(lte(listings.price, maxPrice));
      const rows = await getDatabase().select().from(listings).where(and(...conditions)).orderBy(desc(listings.id));
      const sort = url.searchParams.get('sort');
      if (sort === 'low') rows.sort((first, second) => Number(first.price) - Number(second.price));
      if (sort === 'high') rows.sort((first, second) => Number(second.price) - Number(first.price));
      return reply({ success: true, count: rows.length, listings: rows });
    }

    const identity = await getUser();
    if (!identity) return reply({ error: 'Your session has expired. Please sign in again.' }, 401);
    const isAdmin = identity.roles?.includes('admin') === true;

    if (path === '/api/auth/me' && method === 'GET') {
      const profile = await syncProfile(identity);
      return reply({ success: true, user: { ...profile, user_type: isAdmin ? 'admin' : profile.user_type } });
    }

    if (path.startsWith('/api/admin/') || path.startsWith('/api/notifications')) {
      if (!isAdmin) return reply({ error: 'This account is not authorized for the admin portal.' }, 403);
      const database = getDatabase();

      if (path === '/api/admin/stats' && method === 'GET') {
        const [live, pending, verified, dealers] = await Promise.all([
          database.select({ value: count() }).from(listings).where(eq(listings.status, 'approved')),
          database.select({ value: count() }).from(listings).where(eq(listings.status, 'pending')),
          database.select({ value: count() }).from(users).where(and(eq(users.user_type, 'company'), eq(users.status, 'approved'))),
          database.select({ value: count() }).from(users).where(and(eq(users.user_type, 'company'), eq(users.status, 'pending')))
        ]);
        return reply({ success: true, stats: {
          liveListings: live[0].value, pendingModeration: pending[0].value,
          verifiedDealers: verified[0].value, pendingDealers: dealers[0].value
        } });
      }

      if (path === '/api/admin/moderation' && method === 'GET') {
        const queue = await database.select().from(listings).where(eq(listings.status, 'pending')).orderBy(desc(listings.id));
        return reply({ success: true, count: queue.length, queue });
      }

      if (path === '/api/admin/dealers' && method === 'GET') {
        const dealers = await database.select().from(users).where(and(eq(users.user_type, 'company'), eq(users.status, 'pending'))).orderBy(desc(users.id));
        return reply({ success: true, count: dealers.length, dealers });
      }

      if (path === '/api/admin/listings' && method === 'GET') {
        const search = url.searchParams.get('search');
        const rows = await database.select().from(listings).where(and(
          eq(listings.status, 'approved'),
          search ? or(ilike(listings.title, `%${search}%`), ilike(listings.seller_name, `%${search}%`)) : undefined
        )).orderBy(desc(listings.id));
        return reply({ success: true, listings: rows });
      }

      const moderationMatch = path.match(/^\/api\/admin\/(moderation|dealers)\/([1-9]\d*)\/resolve$/);
      if (moderationMatch && method === 'POST') {
        const body = await request.json();
        const isDealer = moderationMatch[1] === 'dealers';
        const positiveAction = isDealer ? 'verify' : 'approve';
        if (![positiveAction, 'reject'].includes(body.action)) return reply({ error: 'Invalid moderation action.' }, 400);
        const status = body.action === positiveAction ? 'approved' : 'rejected';
        const id = Number(moderationMatch[2]);
        const updated = isDealer
          ? await database.update(users).set({ status }).where(and(eq(users.id, id), eq(users.user_type, 'company'))).returning({ id: users.id })
          : await database.update(listings).set({ status }).where(eq(listings.id, id)).returning({ id: listings.id });
        if (!updated.length) return reply({ error: 'Item not found.' }, 404);
        return reply({ success: true, message: `${isDealer ? 'Dealer' : 'Listing'} ${status}.` });
      }

      const deleteMatch = path.match(/^\/api\/admin\/listings\/([1-9]\d*)$/);
      if (deleteMatch && method === 'DELETE') {
        const removed = await database.delete(listings).where(eq(listings.id, Number(deleteMatch[1]))).returning({ id: listings.id });
        return removed.length ? reply({ success: true, message: 'Listing removed from marketplace.' }) : reply({ error: 'Listing not found.' }, 404);
      }

      if (path === '/api/notifications' && method === 'GET') {
        const rows = await database.select().from(notifications).orderBy(desc(notifications.id));
        return reply({ success: true, unreadCount: rows.filter(notification => !notification.is_read).length, notifications: rows });
      }

      const notificationMatch = path.match(/^\/api\/notifications\/([1-9]\d*)\/read$/);
      if (notificationMatch && method === 'PUT') {
        const updated = await database.update(notifications).set({ is_read: true }).where(eq(notifications.id, Number(notificationMatch[1]))).returning({ id: notifications.id });
        return updated.length ? reply({ success: true }) : reply({ error: 'Notification not found.' }, 404);
      }
    }

    if (path === '/api/listings' && method === 'POST') {
      const profile = await syncProfile(identity);
      if (!isAdmin && profile.status !== 'approved') return reply({ error: 'Your account must be approved before posting listings.' }, 403);
      const body = await request.json();
      const price = Number(body.price);
      const year = Number(body.year);
      if (typeof body.make !== 'string' || !body.make.trim() || typeof body.model !== 'string' || !body.model.trim()
        || !Number.isFinite(price) || price <= 0 || !Number.isInteger(year) || year < 1900 || year > new Date().getFullYear() + 1) {
        return reply({ error: 'Enter a make, model, valid year, and positive price.' }, 400);
      }
      const images = body.images ?? [];
      if (!Array.isArray(images) || images.length > 12 || images.some(image => typeof image !== 'string' || !image.startsWith(`/uploads/${identity.id}/`))) {
        return reply({ error: 'Upload your photos before submitting the listing.' }, 400);
      }
      const currency = typeof body.currency === 'string' ? body.currency : 'AED';
      const listingType = body.listing_type === 'rent' ? 'rent' : 'sale';
      const database = getDatabase();
      const [listing] = await database.insert(listings).values({
        user_id: profile.id,
        title: `${year} ${body.make.trim()} ${body.model.trim()}`,
        make: body.make.trim(), model: body.model.trim(), year,
        category: body.category || 'SUV', fuel: body.fuel || 'Petrol',
        mileage: body.mileage ? `${body.mileage} km` : '0 km',
        transmission: body.transmission || 'Automatic',
        condition_type: body.condition_type === 'new' ? 'new' : 'used',
        listing_type: listingType, price: price.toFixed(2), currency,
        price_label: `${currency} ${price.toLocaleString('en-US')}${listingType === 'rent' ? ' / day' : ''}`,
        country: body.country || profile.country, city: body.city || '',
        seller_name: profile.name, contact_preference: body.contact_preference || 'WhatsApp',
        contact_phone: profile.phone, description: body.description || '', images
      }).returning({ id: listings.id });
      return reply({ success: true, listingId: listing.id, message: 'Listing submitted for moderation.' }, 201);
    }

    return reply({ error: 'API route not found.' }, 404);
  } catch (error) {
    if (error instanceof SyntaxError) return reply({ error: 'Invalid request body.' }, 400);
    return reply({ error: 'The service is temporarily unavailable. Please try again.' }, 503);
  }
};

export const config: Config = {
  path: ['/api/admin/*', '/api/notifications', '/api/notifications/*', '/api/auth/me', '/api/listings']
};
