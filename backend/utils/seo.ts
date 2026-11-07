export interface SeoListingInput {
  id: number | string;
  title?: string;
  make?: string;
  model?: string;
  year?: number | string;
  city?: string;
  country?: string;
  listing_type?: string;
  type?: string;
  price?: number | string;
  currency?: string;
  price_label?: string;
  category?: string;
  mileage?: string;
  transmission?: string;
  fuel?: string;
  condition_type?: string;
  condition?: string;
  description?: string;
  images?: string[] | string;
  seller_name?: string;
  seller?: string;
  contact_phone?: string;
  whatsapp_number?: string;
  sale_status?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Clean and slugify a string segment
 */
export function slugifySegment(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD') // decompose accented letters
    .replace(/[\u0300-\u036f]/g, '') // remove accent marks
    .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric with hyphen
    .replace(/^-+|-+$/g, ''); // trim leading/trailing hyphens
}

/**
 * Automatically generates a unique, SEO-friendly slug for a vehicle.
 * Pattern: {make}-{model}-{year}-{location}-{id}
 * Example: toyota-land-cruiser-2022-abu-dhabi-12345
 */
export function generateVehicleSlug(listing: SeoListingInput): string {
  const make = slugifySegment(listing.make || '');
  const model = slugifySegment(listing.model || '');
  const year = listing.year ? String(listing.year).trim() : '';
  const city = slugifySegment(listing.city || listing.country || 'uae');
  const id = String(listing.id || '').trim();

  // Build slug parts
  const parts: string[] = [];
  if (make) parts.push(make);
  if (model) parts.push(model);
  if (year && !parts.includes(year)) parts.push(year);
  if (city && !parts.includes(city)) parts.push(city);
  if (id) parts.push(id);

  const slug = parts.join('-').replace(/-+/g, '-');
  return slug || `vehicle-${id || 'detail'}`;
}

/**
 * Returns the canonical URL path for a vehicle: /car/{slug}/
 */
export function getVehicleUrl(listing: SeoListingInput): string {
  const slug = generateVehicleSlug(listing);
  return `/car/${slug}/`;
}

/**
 * Returns the absolute canonical URL
 */
export function getVehicleCanonicalUrl(listing: SeoListingInput, baseUrl = 'https://binmardrive.binmargroup.com'): string {
  const urlPath = getVehicleUrl(listing);
  return `${baseUrl.replace(/\/$/, '')}${urlPath}`;
}

/**
 * Extracts the listing ID from a vehicle slug or URL.
 * Handles:
 *  - "toyota-land-cruiser-2022-abu-dhabi-12345" -> "12345"
 *  - "/car/toyota-land-cruiser-2022-abu-dhabi-12345/" -> "12345"
 *  - "12345" -> "12345"
 */
export function extractListingIdFromSlug(slugOrPath: string): string | null {
  if (!slugOrPath) return null;
  // Clean path
  const cleaned = slugOrPath.replace(/^\/car\//, '').replace(/\/$/, '').trim();
  if (!cleaned) return null;

  // If already purely an ID
  if (/^[a-zA-Z0-9_-]+$/.test(cleaned) && !cleaned.includes('-')) {
    return cleaned;
  }

  // The ID is the segment after the last hyphen
  const segments = cleaned.split('-');
  const lastSegment = segments[segments.length - 1];
  if (lastSegment) {
    return lastSegment;
  }

  return cleaned;
}

/**
 * Generate Schema.org JSON-LD structured data for Car & Product & Offer
 */
export function generateVehicleSchema(listing: SeoListingInput, canonicalUrl: string) {
  const isRent = (listing.listing_type || listing.type) === 'rent';
  const isSold = listing.sale_status === 'sold';
  const isRented = listing.sale_status === 'rented';
  const isNew = (listing.condition_type || listing.condition) === 'new';

  const rawImages = typeof listing.images === 'string'
    ? JSON.parse(listing.images || '[]')
    : (Array.isArray(listing.images) ? listing.images : []);
  const images = (rawImages || []).filter((u: any) => typeof u === 'string' && u.trim().length > 0);

  const priceVal = Number(listing.price || 0);

  let availability = 'https://schema.org/InStock';
  if (isSold || isRented) {
    availability = 'https://schema.org/SoldOut';
  }

  const title = listing.title || `${listing.year || ''} ${listing.make || ''} ${listing.model || ''}`.trim();
  const description = listing.description ||
    `${title} for ${isRent ? 'rent' : 'sale'} in ${listing.city || 'Dubai'}, ${listing.country || 'UAE'}. Verified vehicle on BinmarDrive.`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Car', 'Product'],
        '@id': `${canonicalUrl}#vehicle`,
        name: title,
        description,
        image: images.length > 0 ? images : ['https://binmardrive.binmargroup.com/binmardrive-logo-transparent.png'],
        brand: {
          '@type': 'Brand',
          name: listing.make || 'Vehicle'
        },
        model: listing.model || '',
        productionDate: listing.year ? String(listing.year) : undefined,
        modelDate: listing.year ? String(listing.year) : undefined,
        vehicleTransmission: listing.transmission || 'Automatic',
        fuelType: listing.fuel || 'Petrol',
        mileageFromOdometer: {
          '@type': 'QuantitativeValue',
          value: parseFloat(String(listing.mileage || '0').replace(/[^0-9.]/g, '')) || 0,
          unitCode: 'KMT'
        },
        itemCondition: isNew ? 'https://schema.org/NewCondition' : 'https://schema.org/UsedCondition',
        offers: {
          '@type': 'Offer',
          url: canonicalUrl,
          priceCurrency: listing.currency || 'AED',
          price: priceVal > 0 ? priceVal : undefined,
          priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          availability,
          itemCondition: isNew ? 'https://schema.org/NewCondition' : 'https://schema.org/UsedCondition',
          seller: {
            '@type': 'Organization',
            name: listing.seller_name || listing.seller || 'BinmarDrive Verified Dealer'
          }
        }
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://binmardrive.binmargroup.com/'
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: isRent ? 'Cars for Rent' : 'Cars for Sale',
            item: `https://binmardrive.binmargroup.com/?type=${isRent ? 'rent' : 'sale'}`
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: listing.make || 'Vehicles',
            item: `https://binmardrive.binmargroup.com/?make=${encodeURIComponent(listing.make || '')}`
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: title,
            item: canonicalUrl
          }
        ]
      }
    ]
  };
}
