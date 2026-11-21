import { apiRequest } from './client';

// Initial blog store starts completely clean
export const DEFAULT_BLOG_POSTS = [];

const SAMPLE_BLOG_SLUGS = [
  'how-to-buy-used-car-in-dubai-uae-2026',
  'how-to-sell-luxury-car-gcc-maximum-value',
  'car-ownership-costs-dubai-salik-insurance-fuel',
  'essential-summer-car-maintenance-middle-east'
];

function sanitizePosts(posts) {
  if (!Array.isArray(posts)) return [];
  return posts.filter(p => {
    if (!p) return false;
    const isSampleSlug = SAMPLE_BLOG_SLUGS.includes(p.slug);
    const isSampleId = typeof p.id === 'string' && (
      p.id.startsWith('post_guide_') ||
      p.id.startsWith('post_sell_') ||
      p.id.startsWith('post_ownership_') ||
      p.id.startsWith('post_summer_')
    );
    return !isSampleSlug && !isSampleId;
  });
}

function getLocalPosts() {
  try {
    const raw = localStorage.getItem('binmar_blog_posts');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const cleaned = sanitizePosts(parsed);
    if (cleaned.length !== parsed.length) {
      localStorage.setItem('binmar_blog_posts', JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
}

// Convert post title into clean URL slug
export function slugifyTitle(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Calculate estimated reading time based on content word count (~200 words/min)
export function calculateReadingTime(content) {
  if (!content) return '3 min read';
  const text = content.replace(/<[^>]*>/g, '').replace(/[#*`_~[\]]/g, '');
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  return `${minutes} min read`;
}

// Fetch published blog posts for public /blog page
export async function fetchPublishedBlogPosts(options = {}) {
  let posts = [];

  try {
    const queryParams = new URLSearchParams();
    if (options.category) queryParams.set('category', options.category);
    if (options.search) queryParams.set('search', options.search);
    const qStr = queryParams.toString() ? `?${queryParams.toString()}` : '';

    const res = await apiRequest(`/api/blog/posts${qStr}`);
    if (res && res.success && Array.isArray(res.posts)) {
      posts = sanitizePosts(res.posts);
      try {
        // Sync local storage with latest server published posts
        const currentLocal = getLocalPosts();
        const drafts = currentLocal.filter(p => p.status === 'draft');
        localStorage.setItem('binmar_blog_posts', JSON.stringify([...posts, ...drafts]));
      } catch {}
    }
  } catch (err) {
    console.warn('[Blog API Note] Using local store fallback:', err?.message);
  }

  if (posts.length === 0) {
    posts = getLocalPosts();
  }

  // Filter only published
  let published = posts.filter(p => p.status === 'published');
  if (options.category && options.category !== 'All' && options.category !== 'all') {
    published = published.filter(p => (p.category || '').toLowerCase() === options.category.toLowerCase());
  }
  if (options.search) {
    const q = options.search.toLowerCase().trim();
    published = published.filter(p =>
      (p.title || '').toLowerCase().includes(q) ||
      (p.excerpt || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q)
    );
  }

  return published;
}

// Fetch a single blog post by slug
export async function fetchBlogPostBySlug(slug) {
  if (!slug) return null;
  const cleanSlug = String(slug).replace(/^\/blog\/?/, '').replace(/\/$/, '').trim();

  try {
    const res = await apiRequest(`/api/blog/posts/${encodeURIComponent(cleanSlug)}`);
    if (res && res.success && res.post) {
      return res.post;
    }
  } catch (err) {
    console.warn('[Blog API Note] Fetch single post warning:', err?.message);
  }

  // Fallback to local store
  const localPosts = getLocalPosts();
  return localPosts.find(p => p.slug === cleanSlug || String(p.id) === cleanSlug) || null;
}

// Fetch all posts for Admin Panel (including drafts)
export async function fetchAdminBlogPosts() {
  try {
    const res = await apiRequest('/api/admin/blog/posts');
    if (res && res.success && Array.isArray(res.posts)) {
      const cleaned = sanitizePosts(res.posts);
      try {
        localStorage.setItem('binmar_blog_posts', JSON.stringify(cleaned));
      } catch {}
      return cleaned;
    }
  } catch (err) {
    console.warn('[Admin Blog API Note] Using local store:', err?.message);
  }

  return getLocalPosts();
}

// Create or save a blog post
export async function saveBlogPost(postData) {
  const isEdit = Boolean(postData.id);
  const cleanTitle = (postData.title || '').trim();
  const cleanSlug = (postData.slug || slugifyTitle(cleanTitle)).trim();
  const now = new Date().toISOString();

  const payload = {
    ...postData,
    title: cleanTitle,
    slug: cleanSlug,
    reading_time: postData.reading_time || calculateReadingTime(postData.content),
    meta_title: (postData.meta_title || cleanTitle).slice(0, 60),
    meta_description: (postData.meta_description || postData.excerpt || cleanTitle).slice(0, 160),
    author: postData.author || 'Binmar Drive Team',
    status: postData.status || 'published',
    updated_at: now
  };

  if (!isEdit) {
    payload.id = `post_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    payload.created_at = now;
    if (payload.status === 'published' && !payload.published_at) {
      payload.published_at = now;
    }
  }

  // 1. Save to local storage first (instant responsiveness)
  try {
    let list = getLocalPosts();
    if (isEdit) {
      list = list.map(item => String(item.id) === String(payload.id) ? { ...item, ...payload } : item);
    } else {
      list.unshift(payload);
    }
    localStorage.setItem('binmar_blog_posts', JSON.stringify(list));
  } catch {}

  // 2. Dispatch reactive update event immediately so public and admin views update right away
  window.dispatchEvent(new CustomEvent('binmar_blog_updated'));

  // 3. Sync to server in background
  try {
    const endpoint = isEdit ? `/api/admin/blog/posts/${payload.id}` : '/api/admin/blog/posts';
    const method = isEdit ? 'PUT' : 'POST';
    const res = await apiRequest(endpoint, { method, body: payload });
    if (res && res.post) {
      try {
        let list = getLocalPosts();
        list = list.map(item => String(item.id) === String(payload.id) ? { ...item, ...res.post } : item);
        localStorage.setItem('binmar_blog_posts', JSON.stringify(list));
      } catch {}
    }
  } catch (err) {
    console.warn('[Blog Save Server Note]', err?.message);
  }

  return { success: true, post: payload };
}

// Delete a blog post
export async function deleteBlogPost(id) {
  try {
    let list = getLocalPosts().filter(item => String(item.id) !== String(id));
    localStorage.setItem('binmar_blog_posts', JSON.stringify(list));
  } catch {}

  window.dispatchEvent(new CustomEvent('binmar_blog_updated'));

  try {
    await apiRequest(`/api/admin/blog/posts/${id}`, { method: 'DELETE' });
  } catch (err) {
    console.warn('[Blog Delete Server Note]', err?.message);
  }

  return { success: true };
}
