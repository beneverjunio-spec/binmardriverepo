import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  ArrowLeft,
  Share2,
  Check,
  ChevronRight,
  Car,
  User,
  ShieldCheck,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { fetchBlogPostBySlug, fetchPublishedBlogPosts } from '../api/blog';
import { getBlogUrl, getBlogCanonicalUrl, generateBlogPostJsonLd } from '../utils/seo';
import MarkdownRenderer from '../utils/markdown';

export default function BlogPostPage({
  slug,
  onBackToBlog,
  onNavigateToPost,
  onNavigateToMarketplace,
  notify
}) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState([]);

  // Fetch post data by slug
  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const found = await fetchBlogPostBySlug(slug);
        if (active) {
          setPost(found);
        }

        // Fetch related posts
        const all = await fetchPublishedBlogPosts();
        if (active && all) {
          const others = all.filter(p => p.slug !== slug);
          setRelatedPosts(others.slice(0, 3));
        }
      } catch (err) {
        console.warn('Failed to load blog post:', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    if (slug) load();
    return () => {
      active = false;
    };
  }, [slug]);

  // Dynamic Technical SEO: Title, Meta, Canonical, Open Graph, Twitter & JSON-LD
  useEffect(() => {
    if (!post) return;

    const pageTitle = post.meta_title || `${post.title} | Binmar Drive Blog`;
    document.title = pageTitle;

    const pageDesc = post.meta_description || post.excerpt || '';
    const canonicalUrl = getBlogCanonicalUrl(post);
    const imageUrl = post.cover_image || 'https://binmardrive.binmargroup.com/binmardrive-logo-transparent.png';

    // Helper to set or create meta tag
    const setMeta = (nameOrProperty, value, isProperty = false) => {
      const selector = isProperty ? `meta[property="${nameOrProperty}"]` : `meta[name="${nameOrProperty}"]`;
      let tag = document.querySelector(selector);
      if (!tag) {
        tag = document.createElement('meta');
        if (isProperty) tag.setAttribute('property', nameOrProperty);
        else tag.setAttribute('name', nameOrProperty);
        document.head.appendChild(tag);
      }
      tag.content = value;
    };

    // Standard Meta
    setMeta('description', pageDesc);

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    // Open Graph for Facebook & WhatsApp previews
    setMeta('og:title', pageTitle, true);
    setMeta('og:description', pageDesc, true);
    setMeta('og:url', canonicalUrl, true);
    setMeta('og:type', 'article', true);
    setMeta('og:image', imageUrl, true);
    setMeta('og:site_name', 'Binmar Drive', true);
    if (post.published_at) {
      setMeta('article:published_time', post.published_at, true);
    }

    // Twitter Cards
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', pageTitle);
    setMeta('twitter:description', pageDesc);
    setMeta('twitter:image', imageUrl);

    // JSON-LD Schema: BlogPosting & BreadcrumbList
    let scriptTag = document.getElementById('json-ld-blog-post');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'json-ld-blog-post';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    const schemaData = generateBlogPostJsonLd(post);
    scriptTag.text = JSON.stringify(schemaData);

    return () => {
      // Clean up JSON-LD on unmount
      const existingScript = document.getElementById('json-ld-blog-post');
      if (existingScript) existingScript.remove();
    };
  }, [post]);

  const handleShareWhatsApp = () => {
    if (!post) return;
    const url = encodeURIComponent(getBlogCanonicalUrl(post));
    const text = encodeURIComponent(`Read "${post.title}" on Binmar Drive:\n${url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleShareTwitter = () => {
    if (!post) return;
    const url = encodeURIComponent(getBlogCanonicalUrl(post));
    const text = encodeURIComponent(post.title);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handleCopyLink = () => {
    if (!post) return;
    const url = getBlogCanonicalUrl(post);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      if (notify) notify('Article link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream, #f8f6f0)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: '#6b7280' }}>Loading article...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ minHeight: '70vh', padding: '4rem 1.5rem', textAlign: 'center', background: 'var(--cream, #f8f6f0)' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', background: '#ffffff', padding: '3rem 2rem', borderRadius: 16, border: '1px solid #e5e7eb' }}>
          <BookOpen size={48} style={{ color: '#9ca3af', margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.5rem', color: '#111827', margin: '0 0 0.5rem' }}>Article Not Found</h2>
          <p style={{ color: '#6b7280', margin: '0 0 1.5rem' }}>
            The article you are looking for may have been moved or removed.
          </p>
          <button className="btn-gold" onClick={onBackToBlog}>
            Return to Blog Index
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-post-view" style={{ minHeight: '80vh', background: 'var(--cream, #f8f6f0)', color: '#1f2937' }}>
      {/* Top Breadcrumb & Action Bar */}
      <div
        style={{
          background: '#071e16',
          borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
          padding: '1rem 1.5rem',
          color: '#ffffff'
        }}
      >
        <div
          style={{
            maxWidth: '920px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          {/* Breadcrumbs trail: Home > Blog > Post Title */}
          <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            <span
              onClick={onNavigateToMarketplace}
              style={{ color: '#9ca3af', cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.target.style.color = '#D4AF37'}
              onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
            >
              Home
            </span>
            <ChevronRight size={14} style={{ color: '#4b5563' }} />
            <span
              onClick={onBackToBlog}
              style={{ color: '#9ca3af', cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.target.style.color = '#D4AF37'}
              onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
            >
              Blog
            </span>
            <ChevronRight size={14} style={{ color: '#4b5563' }} />
            <span style={{ color: '#D4AF37', fontWeight: 500, maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {post.category || 'Article'}
            </span>
          </nav>

          <button
            type="button"
            onClick={onBackToBlog}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'transparent',
              border: 'none',
              color: '#d1d5db',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#D4AF37'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#d1d5db'}
          >
            <ArrowLeft size={15} />
            <span>All Articles</span>
          </button>
        </div>
      </div>

      {/* Article Container */}
      <article
        style={{
          maxWidth: '920px',
          margin: '2rem auto 4rem',
          padding: '0 1.5rem'
        }}
      >
        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            overflow: 'hidden'
          }}
        >
          {/* Article Header */}
          <header style={{ padding: '2.5rem 2.5rem 1.5rem' }}>
            {/* Category Pill */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 14px',
                borderRadius: '9999px',
                background: 'rgba(212, 175, 55, 0.12)',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                color: '#A87B2E',
                fontSize: '0.82rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '1.25rem'
              }}
            >
              <span>{post.category}</span>
            </div>

            {/* Single Semantic H1 for SEO */}
            <h1
              style={{
                fontFamily: 'Cinzel, Georgia, serif',
                fontSize: 'clamp(1.85rem, 3.5vw, 2.75rem)',
                fontWeight: 700,
                color: '#071e16',
                lineHeight: 1.25,
                margin: '0 0 1.5rem'
              }}
            >
              {post.title}
            </h1>

            {/* Metadata Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                paddingBottom: '1.5rem',
                borderBottom: '1px solid #e5e7eb'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: '#071e16',
                      color: '#D4AF37',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: 700
                    }}
                  >
                    BD
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#111827' }}>
                      {post.author || 'Binmar Drive Team'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Verified Editorial</div>
                  </div>
                </div>

                <span style={{ color: '#d1d5db' }}>|</span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#6b7280' }}>
                  <Calendar size={15} style={{ color: '#D4AF37' }} />
                  <span>{formatDate(post.published_at || post.created_at)}</span>
                </div>

                <span style={{ color: '#d1d5db' }}>|</span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#6b7280' }}>
                  <Clock size={15} style={{ color: '#D4AF37' }} />
                  <span>{post.reading_time || '5 min read'}</span>
                </div>
              </div>

              {/* Social Share Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  title="Share on WhatsApp"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #25D366',
                    background: 'rgba(37, 211, 102, 0.08)',
                    color: '#128C7E',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Share2 size={13} />
                  <span>WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareTwitter}
                  title="Share on X / Twitter"
                  style={{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    background: '#f9fafb',
                    color: '#374151',
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  X
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  title="Copy Article Link"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    background: copied ? '#071e16' : '#f9fafb',
                    color: copied ? '#D4AF37' : '#374151',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {copied ? <Check size={13} /> : <Share2 size={13} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </header>

          {/* Cover Image with proper alt text */}
          {post.cover_image && (
            <figure style={{ margin: '0 0 2rem', position: 'relative' }}>
              <img
                src={post.cover_image}
                alt={post.cover_image_alt || post.title}
                style={{
                  width: '100%',
                  maxHeight: '480px',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
              {post.cover_image_alt && (
                <figcaption
                  style={{
                    fontSize: '0.8rem',
                    color: '#6b7280',
                    padding: '8px 2.5rem 0',
                    fontStyle: 'italic'
                  }}
                >
                  {post.cover_image_alt}
                </figcaption>
              )}
            </figure>
          )}

          {/* Article Semantic Body */}
          <div
            style={{
              padding: '0 2.5rem 2.5rem',
              color: '#1f2937',
              fontSize: '1.1rem',
              lineHeight: 1.85
            }}
          >
            <MarkdownRenderer content={post.content} />
          </div>

          {/* Author Bio Box */}
          <div
            style={{
              margin: '0 2.5rem 2.5rem',
              padding: '1.75rem',
              borderRadius: '12px',
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#071e16',
                border: '2px solid #D4AF37',
                color: '#D4AF37',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1.1rem',
                flexShrink: 0
              }}
            >
              BD
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#111827' }}>
                  {post.author || 'Binmar Drive Team'}
                </h4>
                <ShieldCheck size={16} style={{ color: '#D4AF37' }} />
              </div>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#4b5563', lineHeight: 1.5 }}>
                Official automotive insights from the Binmar Drive verification and inspection operations team. We cover UAE automotive compliance, GCC valuation benchmarks, and vehicle transfer procedures.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action Banner: "Browse Verified Cars on Binmar Drive" */}
        <section
          style={{
            marginTop: '3.5rem',
            background: 'linear-gradient(135deg, #071e16 0%, #0d3b2b 100%)',
            borderRadius: '20px',
            padding: '3rem 2rem',
            color: '#ffffff',
            textAlign: 'center',
            border: '1px solid rgba(212, 175, 55, 0.4)',
            boxShadow: '0 12px 36px rgba(7, 30, 22, 0.25)'
          }}
        >
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <Car size={40} style={{ color: '#D4AF37', margin: '0 auto 1rem' }} />
            <h2
              style={{
                fontFamily: 'Cinzel, Georgia, serif',
                fontSize: '1.85rem',
                color: '#ffffff',
                margin: '0 0 0.75rem'
              }}
            >
              Browse Verified Cars on Binmar Drive
            </h2>
            <p style={{ color: '#d1d5db', fontSize: '1rem', lineHeight: 1.6, margin: '0 0 1.75rem' }}>
              Explore certified GCC-spec luxury sedans, sports cars, and SUVs from licensed dealerships across Dubai and the UAE with zero hidden commissions.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn-gold"
                onClick={onNavigateToMarketplace}
                style={{ padding: '12px 28px', fontSize: '1rem' }}
              >
                Browse Marketplace Listings
              </button>
              <button
                className="btn-outline-gold"
                onClick={onBackToBlog}
                style={{ padding: '12px 24px', fontSize: '1rem' }}
              >
                More Articles & Guides
              </button>
            </div>
          </div>
        </section>

        {/* Related Articles Section */}
        {relatedPosts.length > 0 && (
          <section style={{ marginTop: '4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#071e16', margin: 0 }}>
                Related Guides & Articles
              </h3>
              <button
                type="button"
                onClick={onBackToBlog}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#A87B2E',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                View all articles →
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1.5rem'
              }}
            >
              {relatedPosts.map(rel => (
                <div
                  key={rel.id}
                  onClick={() => onNavigateToPost(rel.slug)}
                  style={{
                    background: '#ffffff',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <img
                    src={rel.cover_image}
                    alt={rel.cover_image_alt || rel.title}
                    style={{ width: '100%', height: '140px', objectFit: 'cover' }}
                    loading="lazy"
                  />
                  <div style={{ padding: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', color: '#A87B2E', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      {rel.category}
                    </div>
                    <h4
                      style={{
                        fontSize: '0.98rem',
                        fontWeight: 600,
                        color: '#111827',
                        margin: '0 0 0.5rem',
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {rel.title}
                    </h4>
                    <span style={{ fontSize: '0.78rem', color: '#6b7280' }}>
                      {rel.reading_time || '5 min read'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}
