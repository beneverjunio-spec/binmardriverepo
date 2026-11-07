/**
 * BinmarDrive Unified Email Dispatch System
 * Dispatches live notification emails to info@binmargroup.com and sellers
 */

const ADMIN_EMAIL = 'info@binmargroup.com';

export async function sendAdminEmailNotification(options) {
  const {
    subject,
    title,
    message,
    details = {},
    actionUrl = 'https://binmardrive.binmargroup.com/admin'
  } = options;

  console.log('[CLIENT EMAIL DISPATCH] Admin alert to:', ADMIN_EMAIL, '| Subject:', subject);

  // 1. Send via Backend Netlify Function API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    await fetch('/api/notifications/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: ADMIN_EMAIL,
        subject,
        title,
        message,
        details,
        actionUrl
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
  } catch (err) {
    console.warn('Backend email API offline or error:', err.message);
  }

  // 2. Direct Guaranteed Delivery via FormSubmit AJAX (Zero-config direct SMTP relay)
  try {
    const payload = {
      _subject: subject,
      title,
      message,
      action_url: actionUrl,
      ...details,
      _template: 'table',
      _captcha: 'false'
    };
    if (details['Email Address'] || details['Seller Email']) {
      payload._replyto = details['Email Address'] || details['Seller Email'];
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);
    await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(ADMIN_EMAIL)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    console.log('[CLIENT EMAIL DISPATCH] Direct delivery dispatched to:', ADMIN_EMAIL);
  } catch (err) {
    console.warn('Direct email dispatch fallback note:', err.message);
  }
}

export async function sendSellerEmailNotification(options) {
  const {
    to,
    subject,
    title,
    message,
    details = {},
    actionUrl = 'https://binmardrive.binmargroup.com/login'
  } = options;

  if (!to || !to.includes('@')) return;

  console.log('[CLIENT EMAIL DISPATCH] Seller notification to:', to, '| Subject:', subject);

  // 1. Send via Backend Netlify Function API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    await fetch('/api/notifications/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: to,
        subject,
        title,
        message,
        details,
        actionUrl
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
  } catch (err) {
    console.warn('Backend seller email API error:', err.message);
  }

  // 2. Direct Delivery via FormSubmit AJAX to seller
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);
    await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(to)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        _subject: subject,
        title,
        message,
        action_url: actionUrl,
        ...details,
        _replyto: ADMIN_EMAIL,
        _template: 'table',
        _captcha: 'false'
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    console.log('[CLIENT EMAIL DISPATCH] Direct delivery dispatched to seller:', to);
  } catch (err) {
    console.warn('Direct seller email dispatch note:', err.message);
  }
}
