import React, { useRef, useEffect, useState } from 'react';
import {
  Bold, Italic, Underline, Heading2, Heading3,
  List, ListOrdered, Quote, Eraser, Sparkles, FileText
} from 'lucide-react';

const ARCHAEOLOGY_TEMPLATES = [
  {
    label: 'Trench Stratigraphy',
    content: `<h3>Trench Stratigraphy & Soil Context</h3><p><strong>Trench / Locus:</strong> Trench A-1 (Grid 4E / 6N)</p><p><strong>Soil Texture & Color:</strong> Compact brownish-grey silty clay (Munsell 10YR 5/3) with dispersed ash lenses and charcoal flecks.</p><p><strong>Stratum:</strong> Layer 3 — Mature Occupation Horizon (depth 1.4m - 1.8m below datum).</p><p><strong>Structural Features:</strong> Aligned burnt mud-brick wall stub exposed along western baulk line.</p>`,
  },
  {
    label: 'Diagnostic Finds & In-Situ Record',
    content: `<h3>Artifact Recovery & In-Situ Documentation</h3><p><strong>Find Context:</strong> Found lying horizontally directly above tamped clay floor surface.</p><p><strong>Specimen Description:</strong> Intact ceramic rim sherd with black-painted concentric bands and geometric register.</p><p><strong>Field Conservation:</strong> Dry-brushed gently with natural bristle brush; packed in cushioned acid-free specimen bag.</p><p><strong>Samples Collected:</strong> Flotation soil bag (10L) and charcoal for AMS radiocarbon dating.</p>`,
  },
  {
    label: 'Daily Field Summary',
    content: `<h3>Daily Excavation Operations</h3><p><strong>Personnel on Site:</strong> Trench Supervisor, 2 Assistant Archaeologists, 6 excavation team members.</p><p><strong>Daily Objectives:</strong> Complete excavation of Sector B test pit to bedrock and establish stratigraphic column.</p><p><strong>Progress Summary:</strong> Cleared 0.45m of loose rubble fill. Exposed contiguous stone paving slab at south end of trench.</p><p><strong>Next Steps:</strong> Prepare baulk section drawings and photogrammetric baseline before lifting stones tomorrow.</p>`,
  },
];

export default function RichTextEditor({ value = '', onChange, placeholder = 'Write your field excavation notes here...', minHeight = 240 }) {
  const editorRef = useRef(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  const calculateCounts = (text) => {
    const cleanText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    setCharCount(cleanText.length);
    setWordCount(cleanText ? cleanText.split(' ').length : 0);
  };

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
      calculateCounts(value || '');
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      calculateCounts(html);
      onChange?.(html);
    }
  };

  const exec = (cmd, val = null) => {
    document.execCommand(cmd, false, val);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  };

  const insertTemplate = (templateContent) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const currentHTML = editorRef.current.innerHTML;
    const newHTML = (currentHTML && currentHTML !== '<br>' && currentHTML !== '<p><br></p>')
      ? `${currentHTML}<hr style="margin:16px 0; border:none; border-top:1px dashed #D5DDD7;" />${templateContent}`
      : templateContent;
    editorRef.current.innerHTML = newHTML;
    handleInput();
  };

  const toolbarBtnStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    background: 'transparent',
    border: '1px solid transparent',
    borderRadius: 5,
    cursor: 'pointer',
    color: '#414942',
    transition: 'all 0.15s ease',
  };

  return (
    <div
      style={{
        border: isFocused ? '1.5px solid #31543D' : '1px solid #D5DDD7',
        borderRadius: 8,
        background: '#FFFFFF',
        boxShadow: isFocused ? '0 0 0 3px rgba(49, 84, 61, 0.1)' : '0 1px 2px rgba(0,0,0,0.03)',
        transition: 'all 0.15s ease',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ─── Toolbar ────────────────────────────────────────── */}
      <div
        style={{
          padding: '8px 12px',
          background: '#F9F8F5',
          borderBottom: '1px solid #E8E5DF',
          borderTopLeftRadius: 7,
          borderTopRightRadius: 7,
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 4,
        }}
      >
        {/* Text styling */}
        <button
          type="button"
          onClick={() => exec('bold')}
          title="Bold (Ctrl+B)"
          style={toolbarBtnStyle}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#EAE5DC')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <Bold size={15} />
        </button>

        <button
          type="button"
          onClick={() => exec('italic')}
          title="Italic (Ctrl+I)"
          style={toolbarBtnStyle}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#EAE5DC')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <Italic size={15} />
        </button>

        <button
          type="button"
          onClick={() => exec('underline')}
          title="Underline (Ctrl+U)"
          style={toolbarBtnStyle}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#EAE5DC')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <Underline size={15} />
        </button>

        <div style={{ width: 1, height: 20, background: '#D5DDD7', margin: '0 4px' }} />

        {/* Headings */}
        <button
          type="button"
          onClick={() => exec('formatBlock', '<h2>')}
          title="Heading 2"
          style={{ ...toolbarBtnStyle, width: 'auto', padding: '0 8px', fontSize: 13, fontWeight: 700 }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#EAE5DC')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          H2
        </button>

        <button
          type="button"
          onClick={() => exec('formatBlock', '<h3>')}
          title="Heading 3"
          style={{ ...toolbarBtnStyle, width: 'auto', padding: '0 8px', fontSize: 13, fontWeight: 700 }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#EAE5DC')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          H3
        </button>

        <button
          type="button"
          onClick={() => exec('formatBlock', '<p>')}
          title="Paragraph Text"
          style={{ ...toolbarBtnStyle, width: 'auto', padding: '0 8px', fontSize: 12, fontWeight: 500 }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#EAE5DC')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          Paragraph
        </button>

        <div style={{ width: 1, height: 20, background: '#D5DDD7', margin: '0 4px' }} />

        {/* Lists */}
        <button
          type="button"
          onClick={() => exec('insertUnorderedList')}
          title="Bullet List"
          style={toolbarBtnStyle}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#EAE5DC')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <List size={16} />
        </button>

        <button
          type="button"
          onClick={() => exec('insertOrderedList')}
          title="Numbered List"
          style={toolbarBtnStyle}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#EAE5DC')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <ListOrdered size={16} />
        </button>

        <button
          type="button"
          onClick={() => exec('formatBlock', '<blockquote>')}
          title="Quote / Callout"
          style={toolbarBtnStyle}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#EAE5DC')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <Quote size={15} />
        </button>

        <button
          type="button"
          onClick={() => exec('removeFormat')}
          title="Clear Formatting"
          style={toolbarBtnStyle}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#EAE5DC')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <Eraser size={15} />
        </button>

        {/* Templates insertion */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11.5, color: '#738077', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Sparkles size={13} color="#31543D" /> Insert Template:
          </span>
          {ARCHAEOLOGY_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.label}
              type="button"
              onClick={() => insertTemplate(tmpl.content)}
              style={{
                fontSize: 11.5,
                padding: '4px 9px',
                borderRadius: 4,
                border: '1px solid #D5DDD7',
                background: '#FFFFFF',
                color: '#31543D',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#31543D';
                e.currentTarget.style.color = '#FFFFFF';
                e.currentTarget.style.borderColor = '#31543D';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#FFFFFF';
                e.currentTarget.style.color = '#31543D';
                e.currentTarget.style.borderColor = '#D5DDD7';
              }}
            >
              + {tmpl.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Editable Area ──────────────────────────────────── */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        data-placeholder={placeholder}
        style={{
          minHeight,
          padding: '16px 20px',
          outline: 'none',
          fontSize: 14.5,
          lineHeight: 1.65,
          color: '#1A1D20',
          fontFamily: 'var(--font-sans)',
          overflowY: 'auto',
        }}
        className="field-log-rich-content"
      />

      {/* ─── Editor Footer ──────────────────────────────────── */}
      <div
        style={{
          padding: '6px 16px',
          background: '#FAF9F6',
          borderTop: '1px solid #F0EDE6',
          borderBottomLeftRadius: 7,
          borderBottomRightRadius: 7,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 11.5,
          color: '#8A948E',
        }}
      >
        <span>Rich Text Field Journal</span>
        <div style={{ display: 'flex', gap: 12 }}>
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
        </div>
      </div>

      <style>{`
        .field-log-rich-content:empty:before {
          content: attr(data-placeholder);
          color: #9CA3AF;
          pointer-events: none;
          display: block;
        }
        .field-log-rich-content h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1A1D20;
          margin: 12px 0 6px 0;
        }
        .field-log-rich-content h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: #31543D;
          margin: 10px 0 4px 0;
        }
        .field-log-rich-content p {
          margin: 0 0 8px 0;
        }
        .field-log-rich-content blockquote {
          border-left: 3px solid #31543D;
          margin: 8px 0;
          padding: 6px 12px;
          background: #FAF9F6;
          color: #4B5563;
          font-style: italic;
        }
        .field-log-rich-content ul, .field-log-rich-content ol {
          margin: 6px 0 10px 20px;
        }
        .field-log-rich-content li {
          margin-bottom: 3px;
        }
      `}</style>
    </div>
  );
}
