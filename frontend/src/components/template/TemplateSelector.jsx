// client/src/components/template/TemplateSelector.jsx
import { useState, useRef } from 'react';
import { THEME_LIST, THEME_CONFIGS, FONT_SIZES, COLOR_SCHEMES } from '../../constants';

/* ─── font families the user can choose ─── */
const FONT_OPTIONS = [
  { label: 'Inter',            value: "'Inter', sans-serif",                   preview: 'Inter'            },
  { label: 'Playfair Display', value: "'Playfair Display', Georgia, serif",     preview: 'Playfair Display' },
  { label: 'Lato',             value: "'Lato', sans-serif",                    preview: 'Lato'             },
  { label: 'EB Garamond',      value: "'EB Garamond', Georgia, serif",          preview: 'EB Garamond'      },
  { label: 'DM Sans',          value: "'DM Sans', sans-serif",                 preview: 'DM Sans'          },
  { label: 'Barlow',           value: "'Barlow', sans-serif",                  preview: 'Barlow'           },
  { label: 'Merriweather',     value: "'Merriweather', Georgia, serif",         preview: 'Merriweather'     },
  { label: 'Source Code Pro',  value: "'Source Code Pro', monospace",           preview: 'Source Code Pro'  },
];

/* ─── spacing presets ─── */
const SPACING_PRESETS = [
  { id: 'compact', label: 'Compact', desc: 'Dense · more content per page' },
  { id: 'normal',  label: 'Normal',  desc: 'Balanced whitespace'           },
  { id: 'relaxed', label: 'Relaxed', desc: 'Airy · easy to scan'           },
];

/* ─── paper sizes ─── */
const PAPER_SIZES = ['A4', 'Letter', 'Legal'];

/* ─── quick colour swatches (preset palette) ─── */
const PRESET_COLORS = [
  '#1e3a5f', '#2563eb', '#6366f1', '#7c3aed', '#db2777',
  '#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#0f766e',
  '#0891b2', '#64748b', '#374151', '#000000',
];

/* ════════════ tiny helpers ════════════ */

const ChevronIcon = ({ open }) => (
  <svg width={12} height={12} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const DownloadIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const LinkIcon = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);

const CheckIcon = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

/* ─── collapsible section ─── */
const Section = ({ title, icon, defaultOpen = true, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: '1px solid #f1f5f9' }}>
      <button
        onClick={() => setOpen(p => !p)}
        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14 }}>{icon}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</span>
        </span>
        <ChevronIcon open={open} />
      </button>
      {open && <div style={{ padding: '2px 18px 16px' }}>{children}</div>}
    </div>
  );
};

/* ─── toggle switch ─── */
const Toggle = ({ label, desc, value, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '6px 0' }}>
    <div>
      <div style={{ fontSize: 12, color: '#334155', fontWeight: 500 }}>{label}</div>
      {desc && <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>{desc}</div>}
    </div>
    <button
      onClick={() => onChange(!value)}
      style={{
        flexShrink: 0, width: 38, height: 22, borderRadius: 11, border: 'none',
        cursor: 'pointer', padding: '3px',
        background: value ? '#1e3a5f' : '#e2e8f0',
        display: 'flex', alignItems: 'center',
        justifyContent: value ? 'flex-end' : 'flex-start',
        transition: 'background 0.2s',
      }}
    >
      <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', display: 'block', boxShadow: '0 1px 3px rgba(0,0,0,0.25)', transition: 'all 0.18s' }} />
    </button>
  </div>
);

/* ─── pill button group ─── */
const PillGroup = ({ options, value, onChange }) => (
  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
    {options.map(opt => {
      const id    = typeof opt === 'string' ? opt : opt.id;
      const label = typeof opt === 'string' ? opt : opt.label;
      const desc  = typeof opt === 'object' ? opt.desc : null;
      const active = value === id;
      return (
        <button
          key={id}
          onClick={() => onChange(id)}
          title={desc || label}
          style={{
            padding: '6px 11px', borderRadius: 8, border: '1.5px solid',
            cursor: 'pointer', fontSize: 11, fontWeight: 600, lineHeight: 1,
            transition: 'all 0.13s',
            borderColor: active ? '#1e3a5f' : '#e2e8f0',
            background:  active ? '#eef2f9' : '#f8fafc',
            color:       active ? '#1e3a5f' : '#64748b',
          }}
        >
          {label}
        </button>
      );
    })}
  </div>
);

/* ─── section label ─── */
const Label = ({ children }) => (
  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
    {children}
  </div>
);

/* ─── theme mini-card ─── */
const ThemeCard = ({ name, selected, onClick }) => {
  const cfg = THEME_CONFIGS[name] || {};
  const isBold = name === 'Bold';
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left',
        marginBottom: 7, borderRadius: 10, overflow: 'hidden',
        outline: selected ? '2px solid #3b82f6' : '2px solid transparent',
        outlineOffset: 2, transition: 'outline-color 0.15s, box-shadow 0.15s',
        boxShadow: selected ? '0 0 0 4px #bfdbfe' : '0 1px 3px rgba(0,0,0,0.08)',
      }}
    >
      {/* mini doc mockup */}
      <div style={{ background: isBold ? '#0f172a' : '#fff', padding: '7px 9px', position: 'relative' }}>
        {(isBold || name === 'Modern') && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: isBold ? '#1e3a5f' : '#1e3a5f' }} />
        )}
        <div style={{ marginTop: isBold ? 4 : 0 }}>
          <div style={{ height: 5, width: '50%', borderRadius: 3, background: isBold ? '#fff' : '#1e3a5f', marginBottom: 3, opacity: name === 'Classic' ? 0.5 : 0.9 }} />
          <div style={{ height: 2.5, width: '32%', borderRadius: 2, background: '#94a3b8', marginBottom: 5, opacity: 0.6 }} />
          <div style={{ height: '0.5px', background: isBold ? '#334155' : '#e2e8f0', marginBottom: 5 }} />
          {[88, 72, 80, 58].map((w, i) => (
            <div key={i} style={{ height: 2, width: `${w}%`, borderRadius: 1, background: isBold ? '#4b5563' : '#e2e8f0', marginBottom: 2.5 }} />
          ))}
        </div>
      </div>
      <div style={{ background: selected ? '#eff6ff' : '#f8fafc', padding: '5px 9px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: selected ? '#1e40af' : '#334155' }}>{name}</div>
          <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 1 }}>{cfg.desc}</div>
        </div>
        {selected && (
          <span style={{ fontSize: 9, fontWeight: 700, color: '#2563eb', background: '#dbeafe', padding: '1px 6px', borderRadius: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active</span>
        )}
      </div>
    </button>
  );
};

/* ─── colour picker ─── */
const ColorPicker = ({ value, onChange }) => {
  const wheelRef = useRef(null);

  return (
    <div>
      {/* preset swatches */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
        {PRESET_COLORS.map(c => (
          <button
            key={c}
            onClick={() => onChange(c)}
            title={c}
            style={{
              width: 24, height: 24, borderRadius: 6, background: c,
              border: '2px solid',
              borderColor: value === c ? '#3b82f6' : 'transparent',
              outline: value === c ? '2px solid #bfdbfe' : 'none',
              outlineOffset: 1,
              cursor: 'pointer', padding: 0, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.13s',
            }}
          >
            {value === c && (
              <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
        ))}
      </div>

      {/* colour wheel via native input[type=color] */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ position: 'relative' }}>
          {/* Colourful ring around the wheel */}
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
            padding: 3, cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
          }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <input
                ref={wheelRef}
                type="color"
                value={value}
                onChange={e => onChange(e.target.value)}
                style={{ width: 36, height: 36, border: 'none', padding: 0, cursor: 'pointer', background: 'none', borderRadius: '50%' }}
              />
            </div>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Custom colour</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 20, height: 20, borderRadius: 5, background: value, border: '1.5px solid #e2e8f0', flexShrink: 0 }} />
            <input
              type="text"
              value={value}
              onChange={e => {
                const v = e.target.value;
                if (/^#[0-9a-fA-F]{6}$/.test(v)) onChange(v);
              }}
              placeholder="#1e3a5f"
              style={{ flex: 1, padding: '5px 8px', border: '1.5px solid #e2e8f0', borderRadius: 7, fontSize: 12, fontFamily: 'monospace', color: '#0f172a', background: '#f8fafc', outline: 'none' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── loading dots animation ─── */
const Dots = () => (
  <>
    <style>{`@keyframes _b{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}`}</style>
    {[0, 1, 2].map(i => (
      <span key={i} style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: '#fff', margin: '0 2px', animation: `_b 0.8s ${i * 0.14}s infinite ease-in-out` }} />
    ))}
  </>
);

/* ════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════ */
const TemplateSelector = ({
  /* theme */
  theme, onThemeChange,
  /* typography */
  fontSize, onFontSizeChange,
  fontFamily = 'Inter', onFontFamilyChange,
  /* colour */
  accentColor, onAccentChange,
  /* spacing / layout */
  spacing = 'normal',     onSpacingChange,
  paperSize = 'A4',       onPaperSizeChange,
  /* toggles */
  showPageNumbers = false, onShowPageNumbersChange,
  showWatermark = false,   onShowWatermarkChange,
  /* export */
  onDownloadPDF, pdfLoading,
  onDownloadWord, wordLoading,
  /* thumbnail */
  thumbnail,
}) => {
  const [exportFormat, setExportFormat] = useState('pdf');
  const [copyDone,     setCopyDone]     = useState(false);

  const isExporting = pdfLoading || wordLoading;

  const handleExport = () => {
    if (exportFormat === 'pdf'  || exportFormat === 'both') onDownloadPDF?.();
    if (exportFormat === 'word' || exportFormat === 'both') onDownloadWord?.();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopyDone(true);
      setTimeout(() => setCopyDone(false), 2000);
    });
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#fff', display: 'flex', flexDirection: 'column', fontFamily: "'Inter','Segoe UI',sans-serif" }}>

      {/* ── live thumbnail ── */}
      {thumbnail && (
        <div style={{ padding: '14px 18px 0', flexShrink: 0 }}>
          <Label>Live Preview</Label>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', height: 120, position: 'relative', background: '#f8fafc' }}>
            <div style={{ transform: 'scale(0.30)', transformOrigin: 'top left', width: '333%', pointerEvents: 'none' }}>
              {thumbnail}
            </div>
            <div style={{ position: 'absolute', bottom: 6, right: 8, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {theme}
            </div>
          </div>
        </div>
      )}

      {/* ── THEME ── */}
      <Section title="Theme" icon="🎨" defaultOpen>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {THEME_LIST.map(t => (
            <ThemeCard key={t} name={t} selected={theme === t} onClick={() => onThemeChange(t)} />
          ))}
        </div>
      </Section>

      {/* ── ACCENT COLOUR ── */}
      <Section title="Accent Colour" icon="🖌️" defaultOpen>
        <ColorPicker value={accentColor} onChange={onAccentChange} />
      </Section>

      {/* ── TYPOGRAPHY ── */}
      <Section title="Typography" icon="🔤" defaultOpen={false}>
        <div style={{ marginBottom: 14 }}>
          <Label>Font Size</Label>
          <PillGroup
            options={FONT_SIZES}
            value={fontSize}
            onChange={onFontSizeChange}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <Label>Font Family</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {FONT_OPTIONS.map(f => (
              <button
                key={f.value}
                onClick={() => onFontFamilyChange?.(f.value)}
                style={{
                  width: '100%', textAlign: 'left',
                  padding: '8px 11px', borderRadius: 8, border: '1.5px solid',
                  cursor: 'pointer', transition: 'all 0.13s',
                  borderColor: fontFamily === f.value ? '#1e3a5f' : '#e2e8f0',
                  background:  fontFamily === f.value ? '#eef2f9' : '#f8fafc',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}
              >
                <span style={{ fontFamily: f.preview, fontSize: 13, color: fontFamily === f.value ? '#1e3a5f' : '#334155', fontWeight: fontFamily === f.value ? 600 : 400 }}>
                  {f.label}
                </span>
                <span style={{ fontSize: 10, color: '#94a3b8', fontFamily: f.preview }}>Aa</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label>Line Spacing</Label>
          <PillGroup
            options={SPACING_PRESETS}
            value={spacing}
            onChange={v => onSpacingChange?.(v)}
          />
        </div>
      </Section>

      {/* ── PAGE SETTINGS ── */}
      <Section title="Page Settings" icon="📄" defaultOpen={false}>
        <div style={{ marginBottom: 14 }}>
          <Label>Paper Size</Label>
          <PillGroup
            options={PAPER_SIZES}
            value={paperSize}
            onChange={v => onPaperSizeChange?.(v)}
          />
        </div>
        <Toggle
          label="Page numbers"
          desc="Show page number at footer"
          value={showPageNumbers}
          onChange={v => onShowPageNumbersChange?.(v)}
        />
        <Toggle
          label="Draft watermark"
          desc="Diagonal 'DRAFT' watermark"
          value={showWatermark}
          onChange={v => onShowWatermarkChange?.(v)}
        />
      </Section>

      {/* ── EXPORT ── */}
      <Section title="Export" icon="⬇" defaultOpen>

        {/* format */}
        <div style={{ marginBottom: 12 }}>
          <Label>Format</Label>
          <div style={{ display: 'flex', gap: 5 }}>
            {[
              { id: 'pdf',  label: '📄 PDF'  },
              { id: 'word', label: '📝 Word' },
              { id: 'both', label: '⬇ Both' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setExportFormat(f.id)}
                style={{
                  flex: 1, padding: '7px 4px', borderRadius: 8, border: '1.5px solid',
                  cursor: 'pointer', fontSize: 11, fontWeight: 600,
                  transition: 'all 0.13s',
                  borderColor: exportFormat === f.id ? '#1e3a5f' : '#e2e8f0',
                  background:  exportFormat === f.id ? '#eef2f9' : '#f8fafc',
                  color:       exportFormat === f.id ? '#1e3a5f' : '#64748b',
                }}
              >{f.label}</button>
            ))}
          </div>
        </div>

        {/* main download button */}
        <button
          onClick={handleExport}
          disabled={isExporting}
          style={{
            width: '100%', border: 'none', borderRadius: 9,
            padding: '12px 0', cursor: isExporting ? 'not-allowed' : 'pointer',
            fontSize: 13, fontWeight: 700, color: '#fff',
            background: isExporting ? '#94a3b8' : '#1e3a5f',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            boxShadow: isExporting ? 'none' : '0 2px 8px rgba(30,58,95,0.3)',
            transition: 'all 0.18s', opacity: isExporting ? 0.75 : 1,
          }}
        >
          {isExporting ? (
            <><Dots />{pdfLoading ? ' Exporting PDF…' : ' Exporting Word…'}</>
          ) : (
            <><DownloadIcon />
              {exportFormat === 'pdf'  ? 'Download PDF'
               : exportFormat === 'word' ? 'Download Word'
               : 'Download PDF & Word'}
            </>
          )}
        </button>

        {/* individual buttons when both selected */}
        {exportFormat === 'both' && (
          <div style={{ display: 'flex', gap: 6, marginTop: 7 }}>
            <button onClick={() => onDownloadPDF?.()} disabled={pdfLoading}
              style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#334155', fontSize: 11, fontWeight: 600, cursor: pdfLoading ? 'not-allowed' : 'pointer', opacity: pdfLoading ? 0.6 : 1 }}>
              {pdfLoading ? '…' : '📄 PDF only'}
            </button>
            <button onClick={() => onDownloadWord?.()} disabled={wordLoading}
              style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#334155', fontSize: 11, fontWeight: 600, cursor: wordLoading ? 'not-allowed' : 'pointer', opacity: wordLoading ? 0.6 : 1 }}>
              {wordLoading ? '…' : '📝 Word only'}
            </button>
          </div>
        )}

        {/* copy link */}
        <button
          onClick={handleCopyLink}
          style={{
            width: '100%', marginTop: 8, borderRadius: 9,
            padding: '9px 0', cursor: 'pointer', fontSize: 12, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            transition: 'all 0.18s',
            background: copyDone ? '#f0fdf4' : '#f8fafc',
            color:      copyDone ? '#16a34a' : '#475569',
            border:     `1.5px solid ${copyDone ? '#bbf7d0' : '#e2e8f0'}`,
          }}
        >
          {copyDone ? <><CheckIcon /> Copied!</> : <><LinkIcon /> Copy Link</>}
        </button>
      </Section>

      <div style={{ height: 24 }} />
    </div>
  );
};

export default TemplateSelector;
