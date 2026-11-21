import React, { useState, useEffect, useMemo } from 'react';
import { Search, Clock, Calendar, ArrowRight, Tag, BookOpen, Sparkles, Car } from 'lucide-react';
import { fetchPublishedBlogPosts } from '../api/blog';
import { getBlogUrl, getBlogCanonicalUrl } from '../utils/seo';

export default function BlogIndexPage({ onNavigateToPost, onNavigateToMarketplace, onPostListingClick }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Load published posts
  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchPublishedBlogPosts();
        if (active) setPosts(data || []);
      } catch (err) {
        console.warn('Failed to load blog posts:', err);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();

    const handleUpdate = () => load();
    window.addEventListener('binmar_blog_updated', handleUpdate);
    return () => {
      active = false;
      window.removeEventListener('binmar_blog_updated', handleUpdate);
    };
  }, []);

  // Update document title, description, and canonical
  useEffect(() => {
    document.title = 'Binmar Drive Blog | UAE Automotive Insights, Buying Guides & Market Trends';
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = 'Explore authoritative guides, market pricing trends, RTA inspection tips, and UAE automotive industry news from the verified team at Binmar Drive.';

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = 'https://binmardrive.binmargroup.com/blog';

    return () => {
      // Clean up or keep
    };
  }, []);

  // Compute unique categories
  const categories = useMemo(() => {
    const set = new Set();
    posts.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return ['All', ...Array.from(set)];
  }, [posts]);

  // Filtered posts
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchCategory = selectedCategory === 'All' || post.category === selectedCategory;
      const search = searchTerm.toLowerCase().trim();
      const matchSearch = !search ||
        (post.title || '').toLowerCase().includes(search) ||
        (post.excerpt || '').toLowerCase().includes(search) ||
        (post.category || '').toLowerCase().includes(search);
      return matchCategory && matchSearch;
    });
  }, [posts, selectedCategory, searchTerm]);

  // Featured post (first post)
  const featuredPost = filteredPosts.length > 0 ? filteredPosts[0] : null;
  const remainingPosts = filteredPosts.slice(1);

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="blog-index-page" style={{ minHeight: '80vh', background: 'var(--cream, #f8f6f0)', color: '#1f2937' }}>
      {/* Hero Banner with Dark Green & Gold luxury aesthetic */}
      <section
        style={{
          background: 'linear-gradient(135deg, #071e16 0%, #0d3829 60%, #071e16 100%)',
          padding: '4rem 1.5rem 3.5rem',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '2px solid rgba(212, 175, 55, 0.3)'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.12) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}
        />

        <div style={{ maxWidth: '1120px', margin: '0 auto', position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '9999px',
              background: 'rgba(212, 175, 55, 0.15)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              color: '#D4AF37',
              fontSize: '0.85rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: '1rem'
            }}
          >
            <Sparkles size={14} />
            <span>Binmar Drive Automotive Journal</span>
          </div>

          <h1
            style={{
              fontFamily: 'Cinzel, Georgia, serif',
              fontSize: 'clamp(2rem, 4vw, 3.2rem)',
              fontWeight: 700,
              color: '#ffffff',
              margin: '0 0 1rem',
              lineHeight: 1.2
            }}
          >
            Insights & Guides for UAE Car Buyers & Sellers
          </h1>

          <p
            style={{
              maxWidth: '680px',
              margin: '0 auto 2rem',
              color: '#d1d5db',
              fontSize: '1.05rem',
              lineHeight: 1.6
            }}
          >
            Expert advice on vehicle inspections, GCC specifications, ownership costs, and luxury market trends across Dubai, Abu Dhabi, and the Emirates.
          </p>

          {/* Search Bar */}
          <div
            style={{
              maxWidth: '560px',
              margin: '0 auto',
              position: 'relative'
            }}
          >
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#D4AF37'
              }}
            />
            <input
              type="text"
              placeholder="Search articles, guides, or maintenance tips..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 18px 14px 46px',
                borderRadius: '9999px',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#ffffff',
                fontSize: '0.95rem',
                outline: 'none',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#D4AF37';
                e.target.style.background = 'rgba(255, 255, 255, 0.12)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(212, 175, 55, 0.4)';
                e.target.style.background = 'rgba(255, 255, 255, 0.08)';
              }}
            />
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>
        {/* Category Pills Filter */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            marginBottom: '2.5rem',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {categories.map(cat => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '9999px',
                  border: active ? '1px solid #D4AF37' : '1px solid #d1d5db',
                  background: active ? '#071e16' : '#ffffff',
                  color: active ? '#D4AF37' : '#4b5563',
                  fontSize: '0.88rem',
                  fontWeight: active ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: active ? '0 2px 8px rgba(7, 30, 22, 0.2)' : 'none'
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#6b7280' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem' }} />
            <p>Loading articles...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredPosts.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 1.5rem',
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px dashed #d1d5db',
              maxWidth: '540px',
              margin: '0 auto'
            }}
          >
            <BookOpen size={48} style={{ color: '#9ca3af', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', color: '#111827', margin: '0 0 0.5rem' }}>
              {posts.length === 0 ? 'No articles published yet' : 'No articles found'}
            </h3>
            <p style={{ color: '#6b7280', margin: '0 0 1.5rem' }}>
              {posts.length === 0
                ? 'Check back soon for the latest automotive buying guides, market trends, and vehicle tips from Binmar Drive.'
                : "We couldn't find any articles matching your search or category filter."}
            </p>
            {posts.length === 0 ? (
              <button
                className="btn-gold"
                onClick={onNavigateToMarketplace}
              >
                Explore Marketplace
              </button>
            ) : (
              <button
                className="btn-outline-gold"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                }}
              >
                Reset Filters
              </button>
            )}
          </div>
        )}

        {/* Featured Post Card */}
        {!loading && featuredPost && (
          <div
            className="blog-featured-card"
            onClick={() => onNavigateToPost(featuredPost.slug)}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.06)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              marginBottom: '3rem',
              cursor: 'pointer',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
          >
            <div style={{ position: 'relative', minHeight: '320px', overflow: 'hidden' }}>
              <img
                src={featuredPost.cover_image}
                alt={featuredPost.cover_image_alt || featuredPost.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
                loading="lazy"
              />
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  background: '#071e16',
                  color: '#D4AF37',
                  border: '1px solid #D4AF37',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}
              >
                Featured • {featuredPost.category}
              </div>
            </div>

            <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  fontSize: '0.82rem',
                  color: '#6b7280',
                  marginBottom: '1rem'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={14} style={{ color: '#D4AF37' }} />
                  {formatDate(featuredPost.published_at)}
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={14} style={{ color: '#D4AF37' }} />
                  {featuredPost.reading_time || '5 min read'}
                </span>
              </div>

              <h2
                style={{
                  fontSize: '1.65rem',
                  fontWeight: 700,
                  color: '#071e16',
                  margin: '0 0 1rem',
                  lineHeight: 1.3
                }}
              >
                {featuredPost.title}
              </h2>

              <p
                style={{
                  color: '#4b5563',
                  fontSize: '1rem',
                  lineHeight: 1.6,
                  margin: '0 0 1.5rem',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {featuredPost.excerpt}
              </p>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#071e16',
                  fontWeight: 600,
                  fontSize: '0.95rem'
                }}
              >
                <span>Read Full Article</span>
                <ArrowRight size={16} style={{ color: '#D4AF37' }} />
              </div>
            </div>
          </div>
        )}

        {/* Grid of Remaining Posts */}
        {!loading && remainingPosts.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '2rem'
            }}
          >
            {remainingPosts.map(post => (
              <article
                key={post.id}
                onClick={() => onNavigateToPost(post.slug)}
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 28px rgba(0, 0, 0, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.04)';
                  e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.08)';
                }}
              >
                <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                  <img
                    src={post.cover_image}
                    alt={post.cover_image_alt || post.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                    loading="lazy"
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      background: '#071e16',
                      color: '#D4AF37',
                      border: '1px solid rgba(212, 175, 55, 0.6)',
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      textTransform: 'uppercase'
                    }}
                  >
                    {post.category}
                  </div>
                </div>

                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      fontSize: '0.78rem',
                      color: '#6b7280',
                      marginBottom: '0.75rem'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={13} style={{ color: '#D4AF37' }} />
                      {formatDate(post.published_at)}
                    </span>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} style={{ color: '#D4AF37' }} />
                      {post.reading_time || '5 min read'}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      color: '#071e16',
                      margin: '0 0 0.75rem',
                      lineHeight: 1.35
                    }}
                  >
                    {post.title}
                  </h3>

                  <p
                    style={{
                      color: '#4b5563',
                      fontSize: '0.92rem',
                      lineHeight: 1.55,
                      margin: '0 0 1.25rem',
                      flex: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {post.excerpt}
                  </p>

                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#071e16',
                      fontWeight: 600,
                      fontSize: '0.88rem',
                      marginTop: 'auto'
                    }}
                  >
                    <span>Read Article</span>
                    <ArrowRight size={14} style={{ color: '#D4AF37' }} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Bottom CTA Banner */}
        <section
          style={{
            marginTop: '4.5rem',
            background: 'linear-gradient(135deg, #071e16 0%, #0c3627 100%)',
            borderRadius: '20px',
            padding: '3rem 2rem',
            color: '#ffffff',
            textAlign: 'center',
            border: '1px solid rgba(212, 175, 55, 0.4)',
            boxShadow: '0 12px 40px rgba(7, 30, 22, 0.25)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ maxWidth: '640px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <Car size={36} style={{ color: '#D4AF37', margin: '0 auto 1rem' }} />
            <h2
              style={{
                fontFamily: 'Cinzel, Georgia, serif',
                fontSize: '1.85rem',
                margin: '0 0 0.75rem',
                color: '#ffffff'
              }}
            >
              Browse Verified Cars on Binmar Drive
            </h2>
            <p
              style={{
                color: '#d1d5db',
                fontSize: '1rem',
                lineHeight: 1.6,
                margin: '0 0 1.75rem'
              }}
            >
              Ready to find your next luxury sedan, sports coupe, or GCC-spec family SUV? Explore verified inventory from licensed dealerships with transparent inspection records.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn-gold"
                onClick={onNavigateToMarketplace}
                style={{ padding: '12px 28px', fontSize: '1rem' }}
              >
                Browse Car Listings
              </button>
              {onPostListingClick && (
                <button
                  className="btn-outline-gold"
                  onClick={onPostListingClick}
                  style={{ padding: '12px 28px', fontSize: '1rem' }}
                >
                  Post Your Vehicle
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
