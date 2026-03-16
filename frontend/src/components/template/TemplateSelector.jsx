// client/src/components/template/TemplateSelector.jsx
import { useState } from 'react';
import { THEME_LIST, THEME_CONFIGS, FONT_SIZES, COLOR_SCHEMES } from '../../constants';

const TemplateSelector = ({
  theme, onThemeChange,
  fontSize, onFontSizeChange,
  accentColor, onAccentChange,
  onDownloadPDF, pdfLoading,
  onDownloadWord, wordLoading,
  thumbnail,
}) => {
  const [open, setOpen] = useState(true);

  if (!open) {
    return (
      <CollapsedTab onOpen={() => setOpen(true)} accentColor={accentColor} />
    );
  }

  return (
    <div style={{ width: 230, background: '#fff', borderLeft: '1px solid #e2e8f0', padding: '20px 16px', flexShrink: 0, overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: '#1e293b' }}>Export</span>
        <button
          onClick={() => setOpen(false)}
          style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 6, width: 26, height: 26, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#64748b', padding: 0 }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
        >▶</button>
      </div>

      {/* Theme cards */}
      <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Theme</div>
      {THEME_LIST.map((t) => (
        <div
          key={t}
          onClick={() => onThemeChange(t)}
          style={{ border: theme === t ? '2px solid #1e3a5f' : '1.5px solid #e2e8f0', borderRadius: 8, padding: '8px 10px', cursor: 'pointer', background: theme === t ? '#eff6ff' : '#fafafa', transition: 'all 0.15s', marginBottom: 6, outline: theme === t ? '2px solid #93c5fd' : 'none' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: 12, color: theme === t ? '#1e3a5f' : '#374151' }}>{t}</span>
            {theme === t && <span style={{ fontSize: 10, color: '#3b82f6', fontWeight: 700 }}>✓ Active</span>}
          </div>
          <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{THEME_CONFIGS[t].desc}</div>
        </div>
      ))}

      {/* Font size */}
      <div style={{ marginBottom: 10, marginTop: 4 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Font Size</div>
        <select value={fontSize} onChange={(e) => onFontSizeChange(e.target.value)} style={{ width: '100%', padding: '7px 10px', borderRadius: 7, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 12, color: '#1e293b', cursor: 'pointer' }}>
          {FONT_SIZES.map((f) => <option key={f}>{f}</option>)}
        </select>
      </div>

      {/* Accent color */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Accent Color</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {COLOR_SCHEMES.map((c) => (
            <div
              key={c}
              onClick={() => onAccentChange(c)}
              style={{ width: 24, height: 24, borderRadius: 6, background: c, cursor: 'pointer', border: accentColor === c ? '2.5px solid #1e3a5f' : '2px solid transparent', outline: accentColor === c ? '2px solid #93c5fd' : 'none', transition: 'all 0.15s' }}
            />
          ))}
        </div>
      </div>

      {/* Mini thumbnail */}
      {thumbnail && (
        <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden', marginBottom: 14, height: 110, position: 'relative' }}>
          <div style={{ transform: 'scale(0.33)', transformOrigin: 'top left', width: '303%', pointerEvents: 'none' }}>
            {thumbnail}
          </div>
        </div>
      )}

      {/* Download PDF */}
      <button
        onClick={onDownloadPDF}
        disabled={pdfLoading}
        style={{ width: '100%', background: pdfLoading ? '#d94949' : '#b6180a', color: '#fff', border: 'none', borderRadius: 8, padding: '11px 0', cursor: pdfLoading ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'background 0.2s' }}
      >
        {pdfLoading ? '⏳ Downloading...' : '⬇ Download PDF'}
      </button>

      {/* Download Word */}
      <button
        onClick={onDownloadWord}
        disabled={wordLoading}
        style={{ width: '100%', background: wordLoading ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '11px 0', cursor: wordLoading ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8, transition: 'background 0.2s' }}
      >
        {wordLoading ? '⏳ Downloading...' : '📝 Download Word'}
      </button>
    </div>
  );
};

// Collapsed state tab
const CollapsedTab = ({ onOpen, accentColor }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title="Open Export Panel"
      style={{ width: 36, background: hovered ? '#1e3a5f' : '#fff', borderLeft: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', flexShrink: 0, transition: 'background 0.18s' }}
    >
      <div style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: hovered ? '#93c5fd' : '#64748b', transition: 'color 0.18s', userSelect: 'none', marginBottom: 6 }}>Export</div>
      <div style={{ width: 26, height: 26, borderRadius: 7, background: hovered ? '#3b82f6' : `${accentColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, transition: 'background 0.18s' }}>⬇</div>
      <div style={{ fontSize: 10, color: hovered ? '#60a5fa' : '#94a3b8', transition: 'color 0.18s' }}>◀</div>
    </div>
  );
};

export default TemplateSelector;
