import React from 'react';

export function WhatsAppIcon({ size = 18, color = 'currentColor', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ flexShrink: 0, display: 'inline-block', verticalAlign: 'middle' }}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function getWhatsAppUrl(listing) {
  if (!listing) return '#';
  const rawNumber = listing.whatsapp_number || listing.contact_phone || '+971501234567';
  const cleanNumber = String(rawNumber).replace(/[^0-9]/g, '');
  const title = listing.title || `${listing.year || ''} ${listing.make || ''} ${listing.model || ''}`.trim() || 'Vehicle';
  const typeText = (listing.listing_type || listing.type) === 'rent' ? 'For Rent' : 'For Sale';
  const price = listing.price_label || `${listing.currency || 'AED'} ${Number(listing.price || 0).toLocaleString()}`;
  const location = [listing.city, listing.country].filter(Boolean).join(', ');

  const text = `Hello! I am inquiring about your vehicle listed on BinmarDrive:
🚗 *${title}* (${typeText})
💰 Price: ${price}
📍 Location: ${location || 'Middle East'}

Is this vehicle still available?`;

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
}

export function openWhatsApp(listing, e) {
  if (e && e.stopPropagation) {
    e.stopPropagation();
  }
  const url = getWhatsAppUrl(listing);
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function getGoogleMapsUrl(target) {
  if (!target) return 'https://www.google.com/maps/search/?api=1&query=Dubai';
  if (typeof target === 'string') {
    if (target.startsWith('http')) return target;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(target)}`;
  }
  if (target.maps_url) {
    return target.maps_url;
  }
  if (target.latitude && target.longitude) {
    return `https://www.google.com/maps?q=${target.latitude},${target.longitude}`;
  }
  const loc = target.location || [target.city, target.country].filter(Boolean).join(', ') || 'Dubai, United Arab Emirates';
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}`;
}

export function openGoogleMaps(target, e) {
  if (e && e.stopPropagation) {
    e.stopPropagation();
  }
  const url = getGoogleMapsUrl(target);
  window.open(url, '_blank', 'noopener,noreferrer');
}


