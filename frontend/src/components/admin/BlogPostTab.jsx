import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  Sparkles,
  Search,
  Upload,
  Globe,
  FileText,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Save,
  Send,
  AlertCircle,
  HelpCircle,
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link2,
  Image as ImageIcon,
  Quote
} from 'lucide-react';
import {
  fetchAdminBlogPosts,
  saveBlogPost,
  deleteBlogPost,
  slugifyTitle,
  calculateReadingTime,
  DEFAULT_BLOG_POSTS
} from '../../api/blog';
import { getBlogUrl, getBlogCanonicalUrl } from '../../utils/seo';
import MarkdownRenderer from '../../utils/markdown';

const PRESET_CATEGORIES = [
  'Buying Guides',
  'Selling Tips',
  'UAE Car Market',
  'Maintenance',
  'Regulations & RTA',
  'Electric & Hybrid'
];

export default function BlogPostTab({ notify }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeEditorTab, setActiveEditorTab] = useState('write'); // 'write' | 'preview'
  const [seoOpen, setSeoOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [id, setId] = useState('');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [category, setCategory] = useState('Buying Guides');
  const [customCategory, setCustomCategory] = useState('');
  const [author, setAuthor] = useState('Binmar Drive Team');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [coverImageAlt, setCoverImageAlt] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [status, setStatus] = useState('published');
  const [formError, setFormError] = useState('');

  // Protect Admin SEO: Ensure noindex is present while in admin
  useEffect(() => {
    let tag = document.querySelector('meta[name="robots"]');
    if (!tag) {
      tag = document.createElement('meta');
      tag.name = 'robots';
      document.head.appendChild(tag);
    }
    tag.content = 'noindex, nofollow';

    return () => {
      // Restore standard indexation on leaving admin tab
      if (tag) tag.content = 'index, follow';
    };
  }, []);

  // Load all posts for admin
  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminBlogPosts();
      setPosts(data || []);
    } catch (err) {
      console.warn('Error loading admin posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  // Handle title change & auto-generate slug unless user typed custom slug
  const handleTitleChange = (val) => {
    setTitle(val);
    if (!slugManuallyEdited) {
      setSlug(slugifyTitle(val));
    }
    if (!metaTitle) {
      setMetaTitle(val.slice(0, 60));
    }
  };

  // Open empty form for new post
  const handleNewPost = () => {
    setId('');
    setTitle('');
    setSlug('');
    setSlugManuallyEdited(false);
    setCategory('Buying Guides');
    setCustomCategory('');
    setAuthor('Binmar Drive Team');
    setExcerpt('');
    setContent('');
    setCoverImage('');
    setCoverImageAlt('');
    setMetaTitle('');
    setMetaDescription('');
    setStatus('published');
    setFormError('');
    setIsEditing(false);
    setActiveEditorTab('write');
    setSeoOpen(false);
    setIsFormOpen(true);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // Open existing post for editing
  const handleEditPost = (post) => {
    setId(post.id);
    setTitle(post.title || '');
    setSlug(post.slug || '');
    setSlugManuallyEdited(true);
    if (PRESET_CATEGORIES.includes(post.category)) {
      setCategory(post.category);
      setCustomCategory('');
    } else {
      setCategory('Custom');
      setCustomCategory(post.category || '');
    }
    setAuthor(post.author || 'Binmar Drive Team');
    setExcerpt(post.excerpt || '');
    setContent(post.content || '');
    setCoverImage(post.cover_image || '');
    setCoverImageAlt(post.cover_image_alt || '');
    setMetaTitle(post.meta_title || post.title || '');
    setMetaDescription(post.meta_description || post.excerpt || '');
    setStatus(post.status || 'published');
    setFormError('');
    setIsEditing(true);
    setActiveEditorTab('write');
    setIsFormOpen(true);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // Handle Cover Image Upload
  const handleImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress with canvas to max 1280px width
        const canvas = document.createElement('canvas');
        const maxW = 1280;
        let w = img.width;
        let h = img.height;
        if (w > maxW) {
          h = Math.round((h * maxW) / w);
          w = maxW;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        setCoverImage(dataUrl);
        if (!coverImageAlt && title) {
          setCoverImageAlt(`${title} banner illustration`);
        }
      };
      img.src = event.target?.result;
    };
    reader.readAsDataURL(file);
  };

  // Quick Markdown toolbar inserter
  const insertFormatting = (before, after = '') => {
    const textarea = document.getElementById('blog-content-textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end) || 'text';
    const replacement = `${before}${selected}${after}`;
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 10);
  };

  // Save handler
  const handleSave = async (forceStatus) => {
    const postStatus = forceStatus || status;
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setFormError('Post Title is required.');
      return;
    }

    const effectiveCategory = category === 'Custom' ? (customCategory.trim() || 'General') : category;
    const cleanSlug = (slug || slugifyTitle(cleanTitle)).trim();

    if (!content.trim()) {
      setFormError('Content cannot be empty.');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      const payload = {
        id: id || undefined,
        title: cleanTitle,
        slug: cleanSlug,
        category: effectiveCategory,
        author: author.trim() || 'Binmar Drive Team',
        excerpt: excerpt.trim() || content.replace(/^[#>-]\s+/gm, '').replace(/\n+/g, ' ').slice(0, 160).trim(),
        content: content,
        cover_image: coverImage.trim() || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
        cover_image_alt: coverImageAlt.trim() || cleanTitle,
        meta_title: (metaTitle || cleanTitle).slice(0, 60),
        meta_description: (metaDescription || excerpt || cleanTitle).slice(0, 160),
        status: postStatus,
        reading_time: calculateReadingTime(content)
      };

      await saveBlogPost(payload);
      if (notify) {
        notify(postStatus === 'published' ? 'Blog post published successfully!' : 'Blog post saved as draft!');
      }

      await loadPosts();
      setIsFormOpen(false);
    } catch (err) {
      setFormError(err.message || 'Error saving post.');
    } finally {
      setSaving(false);
    }
  };

  // Toggle publish / unpublish
  const handleTogglePublish = async (post) => {
    const nextStatus = post.status === 'published' ? 'draft' : 'published';
    await saveBlogPost({
      ...post,
      status: nextStatus,
      published_at: nextStatus === 'published' ? (post.published_at || new Date().toISOString()) : post.published_at
    });
    if (notify) notify(`Post "${post.title}" set to ${nextStatus}.`);
    loadPosts();
  };

  // Delete post
  const handleDeletePost = async (post) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${post.title}"?`)) {
      return;
    }
    await deleteBlogPost(post.id);
    if (notify) notify('Post deleted successfully.');
    loadPosts();
  };

  // Filtered post list
  const filteredPosts = useMemo(() => {
    return posts.filter(p => {
      const matchCat = filterCategory === 'All' || p.category === filterCategory;
      const matchStatus = filterStatus === 'All' || p.status === filterStatus;
      const search = searchQuery.toLowerCase().trim();
      const matchSearch = !search ||
        (p.title || '').toLowerCase().includes(search) ||
        (p.category || '').toLowerCase().includes(search);
      return matchCat && matchStatus && matchSearch;
    });
  }, [posts, filterCategory, filterStatus, searchQuery]);

  return (
    <div className="admin-blog-manager" style={{ padding: '1rem 0' }}>
      {/* Top Action Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem'
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: 'Cinzel, Georgia, serif',
              fontSize: '1.75rem',
              color: '#071e16',
              margin: '0 0 0.25rem'
            }}
          >
            Blog Management & Editorial
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>
            Publish SEO-optimized articles in under 1 minute directly to <code style={{ color: '#D4AF37' }}>binmardrive.binmargroup.com/blog</code>
          </p>
        </div>

        <button
          type="button"
          className="btn-gold"
          onClick={handleNewPost}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            fontSize: '0.92rem'
          }}
        >
          <Plus size={16} />
          <span>Write New Article</span>
        </button>
      </div>

      {/* Editor Drawer / Modal Section */}
      {isFormOpen && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '2px solid #D4AF37',
            boxShadow: '0 12px 40px rgba(7, 30, 22, 0.15)',
            padding: '2rem',
            marginBottom: '3rem'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid #e5e7eb'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: '#071e16',
                  color: '#D4AF37',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FileText size={18} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.35rem', color: '#071e16' }}>
                {isEditing ? 'Edit Blog Article' : 'Fast Paste-and-Publish Article'}
              </h3>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsFormOpen(false)}
                style={{ padding: '6px 14px', fontSize: '0.85rem' }}
              >
                Cancel
              </button>
            </div>
          </div>

          {formError && (
            <div
              style={{
                background: '#fee2e2',
                border: '1px solid #ef4444',
                color: '#b91c1c',
                padding: '10px 14px',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <AlertCircle size={16} />
              <span>{formError}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
            {/* Title */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Article Title <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Complete Guide: How to Buy a Used Car in Dubai & the UAE (2026)"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '1.05rem',
                  fontWeight: 600,
                  color: '#111827'
                }}
              />
            </div>

            {/* Slug */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                URL Slug <span style={{ color: '#6b7280', fontWeight: 400 }}>(e.g. how-to-buy-used-car-uae)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlug(slugifyTitle(e.target.value));
                    setSlugManuallyEdited(true);
                  }}
                  placeholder="auto-generated-from-title"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '0.88rem',
                    fontFamily: 'monospace',
                    color: '#071e16'
                  }}
                />
              </div>
              <small style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                Canonical URL: <code>binmardrive.binmargroup.com/blog/{slug || '...'}</code>
              </small>
            </div>

            {/* Category */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.88rem'
                }}
              >
                {PRESET_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="Custom">+ Other / Custom Category...</option>
              </select>
              {category === 'Custom' && (
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Enter custom category name"
                  style={{
                    width: '100%',
                    marginTop: '6px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '0.85rem'
                  }}
                />
              )}
            </div>

            {/* Author */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                Author Name
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Binmar Drive Team"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.88rem'
                }}
              />
            </div>
          </div>

          {/* Excerpt */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
              Short Excerpt / Summary <span style={{ color: '#6b7280', fontWeight: 400 }}>(shown on blog grid cards and social cards)</span>
            </label>
            <textarea
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A brief 1-2 sentence overview of the article..."
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '0.88rem',
                lineHeight: 1.5
              }}
            />
          </div>

          {/* Cover Image */}
          <div
            style={{
              background: '#f9fafb',
              padding: '1.25rem',
              borderRadius: '10px',
              border: '1px solid #e5e7eb',
              marginBottom: '1.5rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1rem',
              alignItems: 'center'
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                Cover Image (Upload or Web URL)
              </label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="Paste image URL (https://...)"
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '0.85rem'
                  }}
                />
                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: '#071e16',
                    color: '#D4AF37',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Upload size={14} />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFile}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              <input
                type="text"
                value={coverImageAlt}
                onChange={(e) => setCoverImageAlt(e.target.value)}
                placeholder="Image alt text for Google Image SEO..."
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.82rem'
                }}
              />
            </div>

            {coverImage && (
              <div style={{ textAlign: 'center' }}>
                <img
                  src={coverImage}
                  alt={coverImageAlt || 'Preview'}
                  style={{
                    maxHeight: '110px',
                    maxWidth: '100%',
                    borderRadius: '8px',
                    objectFit: 'cover',
                    border: '1px solid #d1d5db'
                  }}
                />
              </div>
            )}
          </div>

          {/* Content Editor Toolbar & Tabs */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: '8px'
              }}
            >
              {/* Write vs Preview Tabs */}
              <div style={{ display: 'inline-flex', borderRadius: '8px', border: '1px solid #d1d5db', overflow: 'hidden' }}>
                <button
                  type="button"
                  onClick={() => setActiveEditorTab('write')}
                  style={{
                    padding: '6px 16px',
                    fontSize: '0.85rem',
                    fontWeight: activeEditorTab === 'write' ? 600 : 400,
                    background: activeEditorTab === 'write' ? '#071e16' : '#ffffff',
                    color: activeEditorTab === 'write' ? '#D4AF37' : '#4b5563',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Write / Paste
                </button>
                <button
                  type="button"
                  onClick={() => setActiveEditorTab('preview')}
                  style={{
                    padding: '6px 16px',
                    fontSize: '0.85rem',
                    fontWeight: activeEditorTab === 'preview' ? 600 : 400,
                    background: activeEditorTab === 'preview' ? '#071e16' : '#ffffff',
                    color: activeEditorTab === 'preview' ? '#D4AF37' : '#4b5563',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Live Preview
                </button>
              </div>

              {/* Formatting Toolbar */}
              {activeEditorTab === 'write' && (
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => insertFormatting('## ', '')}
                    title="Heading 2"
                    style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}
                  >
                    <Heading2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('### ', '')}
                    title="Heading 3"
                    style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}
                  >
                    <Heading3 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('**', '**')}
                    title="Bold"
                    style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}
                  >
                    <Bold size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('*', '*')}
                    title="Italic"
                    style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}
                  >
                    <Italic size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('> ', '')}
                    title="Blockquote"
                    style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}
                  >
                    <Quote size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('- ', '')}
                    title="Bullet List"
                    style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}
                  >
                    <List size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('1. ', '')}
                    title="Numbered List"
                    style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}
                  >
                    <ListOrdered size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('[Link Text](', 'https://...)')}
                    title="Insert Link"
                    style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}
                  >
                    <Link2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('![Image Description](', 'https://...)')}
                    title="Insert Inline Image"
                    style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}
                  >
                    <ImageIcon size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Editor Textarea or Live Preview */}
            {activeEditorTab === 'write' ? (
              <textarea
                id="blog-content-textarea"
                rows={16}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your article directly from Google Docs or ChatGPT here... Markdown (#, ##, **, -, 1.) and clean HTML are automatically rendered."
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.95rem',
                  lineHeight: '1.7',
                  fontFamily: 'inherit',
                  color: '#111827'
                }}
              />
            ) : (
              <div
                style={{
                  minHeight: '380px',
                  padding: '24px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  background: '#fafafa',
                  maxHeight: '500px',
                  overflowY: 'auto'
                }}
              >
                <MarkdownRenderer content={content} />
              </div>
            )}
          </div>

          {/* Collapsible SEO Box */}
          <div
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: '10px',
              marginBottom: '2rem',
              overflow: 'hidden'
            }}
          >
            <div
              onClick={() => setSeoOpen(!seoOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 18px',
                background: '#f9fafb',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe size={16} style={{ color: '#D4AF37' }} />
                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#111827' }}>
                  Search Engine Optimization (SEO) & Google SERP Preview
                </span>
              </div>
              {seoOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>

            {seoOpen && (
              <div style={{ padding: '18px', background: '#ffffff', borderTop: '1px solid #e5e7eb' }}>
                {/* Meta Title */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151' }}>
                      Google Meta Title
                    </label>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        color: metaTitle.length > 60 ? '#ef4444' : '#10b981',
                        fontWeight: 600
                      }}
                    >
                      {metaTitle.length} / 60 characters
                    </span>
                  </div>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="Defaults to post title (optimal: 50-60 chars)"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: `1px solid ${metaTitle.length > 60 ? '#ef4444' : '#d1d5db'}`,
                      fontSize: '0.88rem'
                    }}
                  />
                </div>

                {/* Meta Description */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151' }}>
                      Google Meta Description
                    </label>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        color: metaDescription.length > 160 ? '#ef4444' : '#10b981',
                        fontWeight: 600
                      }}
                    >
                      {metaDescription.length} / 160 characters
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="Concise overview snippet shown in Google search results (optimal: 120-160 chars)"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: `1px solid ${metaDescription.length > 160 ? '#ef4444' : '#d1d5db'}`,
                      fontSize: '0.88rem'
                    }}
                  />
                </div>

                {/* Live Google Search Preview Card */}
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#6b7280', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Google Search Result Snippet Preview
                  </div>
                  <div
                    style={{
                      padding: '16px',
                      borderRadius: '8px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      maxWidth: '600px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <div
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: '#071e16',
                          color: '#D4AF37',
                          fontSize: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700
                        }}
                      >
                        B
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#202124' }}>Binmar Drive</span>
                      <span style={{ fontSize: '0.75rem', color: '#5f6368' }}>
                        https://binmardrive.binmargroup.com &gt; blog &gt; {slug || '...'}
                      </span>
                    </div>

                    <h4
                      style={{
                        color: '#1a0dab',
                        fontSize: '1.15rem',
                        margin: '2px 0 4px',
                        fontWeight: 400,
                        textDecoration: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {metaTitle || title || 'Post Title | Binmar Drive Blog'}
                    </h4>

                    <p style={{ margin: 0, fontSize: '0.84rem', color: '#4d5156', lineHeight: 1.4 }}>
                      {metaDescription || excerpt || 'Complete step-by-step automotive checklist and verified insights from Binmar Drive.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Action Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid #e5e7eb'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="post_status"
                  value="published"
                  checked={status === 'published'}
                  onChange={() => setStatus('published')}
                />
                <span style={{ fontWeight: 600, color: '#10b981' }}>Publish Immediately</span>
              </label>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="post_status"
                  value="draft"
                  checked={status === 'draft'}
                  onChange={() => setStatus('draft')}
                />
                <span style={{ color: '#6b7280' }}>Save as Draft</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn-secondary"
                disabled={saving}
                onClick={() => handleSave('draft')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Save size={15} />
                <span>Save Draft</span>
              </button>

              <button
                type="button"
                className="btn-gold"
                disabled={saving}
                onClick={() => handleSave(status)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Send size={15} />
                <span>{saving ? 'Publishing...' : status === 'published' ? 'Publish Article' : 'Save Article'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar for Posts Table */}
      <div
        style={{
          background: '#ffffff',
          padding: '1.25rem',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          marginBottom: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Search posts by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 32px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '0.88rem'
              }}
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.88rem' }}
          >
            <option value="All">All Categories</option>
            {PRESET_CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.88rem' }}
          >
            <option value="All">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        <div style={{ fontSize: '0.88rem', color: '#6b7280' }}>
          Showing <strong>{filteredPosts.length}</strong> of {posts.length} articles
        </div>
      </div>

      {/* Posts Table */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.02)'
        }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem' }} />
            <p style={{ color: '#6b7280' }}>Loading blog articles...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#6b7280' }}>
            <FileText size={40} style={{ color: '#9ca3af', margin: '0 auto 0.75rem' }} />
            <h4 style={{ margin: '0 0 0.5rem', color: '#111827' }}>No articles match your filter</h4>
            <p style={{ margin: 0, fontSize: '0.88rem' }}>Create a new post or adjust your filters above.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb', color: '#4b5563', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '12px 16px' }}>Article</th>
                  <th style={{ padding: '12px 16px' }}>Category</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px' }}>Published</th>
                  <th style={{ padding: '12px 16px' }}>Read Time</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map(post => {
                  const isPub = post.status === 'published';
                  return (
                    <tr
                      key={post.id}
                      style={{
                        borderBottom: '1px solid #f3f4f6',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#fafafa'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                    >
                      {/* Thumbnail & Title */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={post.cover_image}
                            alt=""
                            style={{
                              width: '54px',
                              height: '40px',
                              borderRadius: '6px',
                              objectFit: 'cover',
                              background: '#f3f4f6'
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, color: '#111827', maxWidth: '340px' }}>
                              {post.title}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: 'monospace' }}>
                              /blog/{post.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '9999px',
                            background: 'rgba(212, 175, 55, 0.12)',
                            color: '#A87B2E',
                            fontWeight: 600,
                            fontSize: '0.75rem'
                          }}
                        >
                          {post.category}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            background: isPub ? 'rgba(16, 185, 129, 0.12)' : 'rgba(107, 114, 128, 0.12)',
                            color: isPub ? '#059669' : '#6b7280'
                          }}
                        >
                          {isPub ? <CheckCircle size={12} /> : <Clock size={12} />}
                          <span>{isPub ? 'Published' : 'Draft'}</span>
                        </span>
                      </td>

                      {/* Published Date */}
                      <td style={{ padding: '14px 16px', color: '#6b7280', whiteSpace: 'nowrap' }}>
                        {post.published_at ? new Date(post.published_at).toLocaleDateString() : '—'}
                      </td>

                      {/* Read Time */}
                      <td style={{ padding: '14px 16px', color: '#6b7280' }}>
                        {post.reading_time || '5 min'}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => window.open(getBlogUrl(post), '_blank')}
                            title="Preview Public Article"
                            style={{
                              padding: '5px 8px',
                              borderRadius: '6px',
                              border: '1px solid #d1d5db',
                              background: '#fff',
                              color: '#374151',
                              cursor: 'pointer'
                            }}
                          >
                            <ExternalLink size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleTogglePublish(post)}
                            title={isPub ? 'Unpublish post' : 'Publish post'}
                            style={{
                              padding: '5px 8px',
                              borderRadius: '6px',
                              border: '1px solid #d1d5db',
                              background: '#fff',
                              color: isPub ? '#d97706' : '#059669',
                              cursor: 'pointer'
                            }}
                          >
                            {isPub ? 'Unpublish' : 'Publish'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEditPost(post)}
                            title="Edit Post"
                            style={{
                              padding: '5px 8px',
                              borderRadius: '6px',
                              border: '1px solid #d1d5db',
                              background: '#fff',
                              color: '#2563eb',
                              cursor: 'pointer'
                            }}
                          >
                            <Edit2 size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeletePost(post)}
                            title="Delete Post"
                            style={{
                              padding: '5px 8px',
                              borderRadius: '6px',
                              border: '1px solid #fee2e2',
                              background: '#fff',
                              color: '#dc2626',
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
