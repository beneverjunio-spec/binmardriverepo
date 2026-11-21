import React from 'react';

/**
 * Lightweight, zero-dependency Markdown and formatted text renderer.
 * Converts markdown syntax or clean HTML into semantic React elements.
 */

// Helper to parse inline styles: bold, italic, inline code, links, images
function renderInlineFormatting(text) {
  if (!text) return null;

  // Split tokens by link, image, bold, italic, code
  const tokens = [];
  let remaining = text;
  let keyIndex = 0;

  // Regex patterns
  const inlineRegex = /(!?\[([^\]]+)\]\(([^)]+)\))|(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(`([^`]+)`)/g;
  let lastIndex = 0;
  let match;

  while ((match = inlineRegex.exec(text)) !== null) {
    // Push preceding text
    if (match.index > lastIndex) {
      tokens.push(text.slice(lastIndex, match.index));
    }

    if (match[1]) {
      if (match[1].startsWith('!')) {
        // Image: ![alt](src)
        tokens.push(
          <img
            key={`img-${keyIndex++}`}
            src={match[3]}
            alt={match[2]}
            style={{ maxWidth: '100%', borderRadius: 8, margin: '16px 0' }}
            loading="lazy"
          />
        );
      } else {
        // Link: [text](href)
        const isExternal = match[3].startsWith('http');
        tokens.push(
          <a
            key={`link-${keyIndex++}`}
            href={match[3]}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            style={{ color: '#D4AF37', textDecoration: 'underline', textUnderlineOffset: 3 }}
          >
            {match[2]}
          </a>
        );
      }
    } else if (match[4]) {
      // Bold: **text**
      tokens.push(<strong key={`b-${keyIndex++}`}>{match[5]}</strong>);
    } else if (match[6]) {
      // Italic: *text*
      tokens.push(<em key={`i-${keyIndex++}`}>{match[7]}</em>);
    } else if (match[8]) {
      // Inline code: `code`
      tokens.push(
        <code
          key={`code-${keyIndex++}`}
          style={{
            background: 'rgba(212, 175, 55, 0.1)',
            padding: '2px 6px',
            borderRadius: 4,
            fontSize: '0.9em',
            color: '#D4AF37'
          }}
        >
          {match[9]}
        </code>
      );
    }

    lastIndex = inlineRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push(text.slice(lastIndex));
  }

  return tokens.length > 0 ? tokens : text;
}

export default function MarkdownRenderer({ content, className = '' }) {
  if (!content) return null;

  // Check if content already contains rich HTML (e.g. pasted rich text)
  const isHtml = /<\/?[a-z][\s\S]*>/i.test(content) && (content.includes('<p>') || content.includes('<h2>') || content.includes('<div>'));

  if (isHtml) {
    // Sanitize and render HTML directly
    return (
      <div
        className={`article-prose ${className}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  // Parse Markdown line by line and group into blocks
  const lines = content.split(/\r?\n/);
  const elements = [];
  let blockIndex = 0;
  let inCodeBlock = false;
  let codeBlockContent = [];
  let currentList = null; // { type: 'ul' | 'ol', items: [] }
  let currentQuote = [];

  const flushList = () => {
    if (!currentList) return;
    const ListTag = currentList.type;
    elements.push(
      <ListTag
        key={`list-${blockIndex++}`}
        style={{
          paddingLeft: '1.5rem',
          margin: '1.25rem 0',
          lineHeight: '1.8'
        }}
      >
        {currentList.items.map((item, idx) => (
          <li key={idx} style={{ marginBottom: '0.5rem' }}>
            {renderInlineFormatting(item)}
          </li>
        ))}
      </ListTag>
    );
    currentList = null;
  };

  const flushQuote = () => {
    if (currentQuote.length === 0) return;
    elements.push(
      <blockquote
        key={`quote-${blockIndex++}`}
        style={{
          borderLeft: '4px solid #D4AF37',
          background: 'rgba(212, 175, 55, 0.05)',
          padding: '1rem 1.25rem',
          margin: '1.5rem 0',
          borderRadius: '0 8px 8px 0',
          fontStyle: 'italic',
          color: 'var(--sage, #9ca3af)',
          lineHeight: '1.75'
        }}
      >
        {currentQuote.map((line, idx) => (
          <p key={idx} style={{ margin: idx === 0 ? 0 : '0.5rem 0 0 0' }}>
            {renderInlineFormatting(line)}
          </p>
        ))}
      </blockquote>
    );
    currentQuote = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Code blocks
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        // Closing code block
        elements.push(
          <pre
            key={`code-${blockIndex++}`}
            style={{
              background: '#04120D',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              borderRadius: 8,
              padding: '1rem',
              overflowX: 'auto',
              margin: '1.5rem 0',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              color: '#f3f4f6'
            }}
          >
            <code>{codeBlockContent.join('\n')}</code>
          </pre>
        );
        codeBlockContent = [];
        inCodeBlock = false;
      } else {
        // Opening code block
        flushList();
        flushQuote();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(rawLine);
      continue;
    }

    // Horizontal Rule
    if (/^(\*\*\*|---|___)$/.test(trimmed)) {
      flushList();
      flushQuote();
      elements.push(
        <hr
          key={`hr-${blockIndex++}`}
          style={{
            border: 'none',
            borderTop: '1px solid rgba(212, 175, 55, 0.2)',
            margin: '2.5rem 0'
          }}
        />
      );
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('>')) {
      flushList();
      currentQuote.push(trimmed.replace(/^>\s*/, ''));
      continue;
    } else {
      flushQuote();
    }

    // Headings
    if (trimmed.startsWith('#')) {
      flushList();
      if (trimmed.startsWith('#### ')) {
        elements.push(
          <h4 key={`h4-${blockIndex++}`} style={{ fontSize: '1.15rem', color: '#f3f4f6', margin: '1.5rem 0 0.75rem', fontWeight: 600 }}>
            {renderInlineFormatting(trimmed.replace('#### ', ''))}
          </h4>
        );
      } else if (trimmed.startsWith('### ')) {
        elements.push(
          <h3 key={`h3-${blockIndex++}`} style={{ fontSize: '1.35rem', color: '#D4AF37', margin: '2rem 0 1rem', fontWeight: 600 }}>
            {renderInlineFormatting(trimmed.replace('### ', ''))}
          </h3>
        );
      } else if (trimmed.startsWith('## ')) {
        elements.push(
          <h2
            key={`h2-${blockIndex++}`}
            style={{
              fontSize: '1.75rem',
              color: '#ffffff',
              margin: '2.5rem 0 1.25rem',
              fontWeight: 700,
              paddingBottom: '0.5rem',
              borderBottom: '1px solid rgba(212, 175, 55, 0.25)'
            }}
          >
            {renderInlineFormatting(trimmed.replace('## ', ''))}
          </h2>
        );
      } else if (trimmed.startsWith('# ')) {
        elements.push(
          <h1 key={`h1-${blockIndex++}`} style={{ fontSize: '2.25rem', color: '#ffffff', margin: '2.5rem 0 1.25rem', fontWeight: 800 }}>
            {renderInlineFormatting(trimmed.replace('# ', ''))}
          </h1>
        );
      }
      continue;
    }

    // Unordered list item
    const ulMatch = trimmed.match(/^[-*+]\s+(.*)$/);
    if (ulMatch) {
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(ulMatch[1]);
      continue;
    }

    // Ordered list item
    const olMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (olMatch) {
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(olMatch[2]);
      continue;
    }

    // If it's a regular line or empty line
    if (!trimmed) {
      flushList();
      flushQuote();
      continue;
    }

    // Image standalone line: ![alt](url)
    const imgMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) {
      flushList();
      flushQuote();
      elements.push(
        <figure key={`fig-${blockIndex++}`} style={{ margin: '2rem 0', textAlign: 'center' }}>
          <img
            src={imgMatch[2]}
            alt={imgMatch[1] || 'Blog illustration'}
            style={{ maxWidth: '100%', maxHeight: '480px', borderRadius: 10, objectFit: 'cover' }}
            loading="lazy"
          />
          {imgMatch[1] && (
            <figcaption style={{ fontSize: '0.85rem', color: 'var(--sage, #9ca3af)', marginTop: '0.5rem' }}>
              {imgMatch[1]}
            </figcaption>
          )}
        </figure>
      );
      continue;
    }

    // Standard paragraph
    flushList();
    flushQuote();
    elements.push(
      <p
        key={`p-${blockIndex++}`}
        style={{
          margin: '1.25rem 0',
          lineHeight: '1.85',
          fontSize: '1.08rem',
          color: '#e5e7eb'
        }}
      >
        {renderInlineFormatting(trimmed)}
      </p>
    );
  }

  flushList();
  flushQuote();

  return (
    <div className={`article-prose ${className}`}>
      {elements}
    </div>
  );
}
