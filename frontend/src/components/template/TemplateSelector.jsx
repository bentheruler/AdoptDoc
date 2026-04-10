// client/src/components/template/TemplateSelector.jsx
import { useState, useRef, useEffect } from 'react';
import { THEME_LIST, THEME_CONFIGS, FONT_SIZES } from '../../constants';

const PRESET_COLORS = [
  '#6366f1','#3b82f6','#0f766e','#16a34a','#ca8a04',
  '#ea580c','#dc2626','#db2777','#7c3aed','#1e3a5f',
  '#64748b','#0891b2','#374151','#000000',
];

const SPACING_PRESETS = [
  { id:'compact', label:'Compact' },
  { id:'normal',  label:'Normal'  },
  { id:'relaxed', label:'Relaxed' },
];

const PAPER_SIZES = ['A4','Letter','Legal'];

/* ══ Icons ══ */
const X = () => <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const Check = () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
const Download = () => <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;

/* ══ Theme card mini-mockup ══ */
const ThemeMockup = ({ name, accent }) => {
  const isBold = name === 'Bold' || name === 'Corporate' || name === 'Chicago';
  const isDark = name === 'Tech';
  const bg = isDark ? '#0d1117' : isBold ? '#0f172a' : '#fff';
  const textColor = isDark || isBold ? '#e6edf3' : '#111';
  const lineColor = isDark ? '#30363d' : '#e2e8f0';

  return (
    <div style={{ width: '100%', height: '100%', background: bg, overflow: 'hidden', position: 'relative', fontFamily: 'sans-serif' }}>
      {/* accent top bar */}
      <div style={{ height: 3, background: accent, width: '100%' }} />

      {/* header area */}
      <div style={{ padding: '8px 10px', borderBottom: `1px solid ${lineColor}20` }}>
        <div style={{ height: 6, width: '55%', borderRadius: 2, background: isBold || isDark ? 'rgba(255,255,255,0.7)' : accent, marginBottom: 3 }} />
        <div style={{ height: 3, width: '35%', borderRadius: 2, background: isDark ? '#8b949e' : '#94a3b8', opacity: 0.7 }} />
      </div>

      {/* body lines */}
      <div style={{ padding: '6px 10px', display: 'flex', gap: 6 }}>
        {(name === 'Modern' || name === 'Creative' || name === 'Timeline' || name === 'Infographic' || name === 'Sunset') && (
          <div style={{ width: '32%', background: accent, borderRadius: 2, padding: '6px 4px' }}>
            {[70,55,80,60].map((w,i) => <div key={i} style={{ height: 2, width: `${w}%`, background: 'rgba(255,255,255,0.4)', borderRadius: 1, marginBottom: 3 }} />)}
          </div>
        )}
        <div style={{ flex: 1 }}>
          {[90,75,85,65,80,70,55].map((w,i) => (
            <div key={i} style={{ height: 2, width: `${w}%`, borderRadius: 1, background: isDark ? '#30363d' : lineColor, marginBottom: 3 }} />
          ))}
        </div>
      </div>
    </div>
  );
};

/* ══ Live preview modal ══ */
const ThemeBrowserModal = ({ isOpen, onClose, currentTheme, onSelect, accentColor, renderPreview }) => {
  const [hovered, setHovered] = useState(currentTheme);
  const [previewTheme, setPreviewTheme] = useState(currentTheme);

  useEffect(() => { if (isOpen) setPreviewTheme(currentTheme); }, [isOpen, currentTheme]);

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
      {/* Left: theme grid */}
      <div style={{ width: 320, background: '#0d1117', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '20px 20px 14px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.3px' }}>Choose Template</div>
            <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{THEME_LIST.length} themes available</div>
          </div>
          <button onClick={onClose} style={{ background: '#1e293b', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X /></button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {THEME_LIST.map(name => {
            const cfg = THEME_CONFIGS[name] || {};
            const isActive = name === currentTheme;
            const isHov = name === hovered;
            return (
              <div
                key={name}
                onMouseEnter={() => { setHovered(name); setPreviewTheme(name); }}
                onClick={() => { onSelect(name); onClose(); }}
                style={{
                  borderRadius: 10, overflow: 'hidden', cursor: 'pointer',
                  border: isActive ? `2px solid #6366f1` : isHov ? `2px solid #475569` : '2px solid #1e293b',
                  transition: 'border-color 0.15s, transform 0.12s',
                  transform: isHov ? 'scale(1.02)' : 'scale(1)',
                  background: '#0f172a',
                }}
              >
                {/* mini mockup */}
                <div style={{ height: 72, position: 'relative' }}>
                  <ThemeMockup name={name} accent={accentColor} />
                  {isActive && (
                    <div style={{ position: 'absolute', top: 5, right: 5, width: 18, height: 18, borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check />
                    </div>
                  )}
                </div>
                {/* label */}
                <div style={{ padding: '6px 8px', background: isHov ? '#1e293b' : '#0f172a', transition: 'background 0.15s' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: isActive ? '#818cf8' : '#e2e8f0' }}>{name}</div>
                  <div style={{ fontSize: 9, color: '#475569', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cfg.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Apply button */}
        <div style={{ padding: '12px 14px', borderTop: '1px solid #1e293b' }}>
          <button
            onClick={() => { onSelect(hovered || currentTheme); onClose(); }}
            style={{ width: '100%', background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: '#fff', border: 'none', borderRadius: 9, padding: '11px 0', cursor: 'pointer', fontSize: 13, fontWeight: 600, letterSpacing: '0.01em' }}
          >
            Apply {hovered || currentTheme} Theme
          </button>
        </div>
      </div>

      {/* Right: live rendered preview */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '14px 24px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1' }} />
          <span style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>live preview — {previewTheme}</span>
          <div style={{ marginLeft: 'auto', fontSize: 11, color: '#475569' }}>Hover a theme to preview · Click to apply</div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '24px', background: '#080c14', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
          <div style={{
            width: '100%', maxWidth: 680,
            background: '#fff', borderRadius: 8,
            boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 24px 80px rgba(0,0,0,0.6)',
            overflow: 'hidden',
            transform: 'scale(1)',
            transition: 'none',
          }}>
            {/* render actual preview component with previewTheme */}
            {renderPreview(previewTheme)}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════ */
const TemplateSelector = ({
  theme, onThemeChange,
  fontSize, onFontSizeChange,
  accentColor, onAccentChange,
  spacing = 'normal',     onSpacingChange,
  paperSize = 'A4',       onPaperSizeChange,
  showPageNumbers = false, onShowPageNumbersChange,
  showWatermark = false,   onShowWatermarkChange,
  onDownloadPDF, pdfLoading,
  onDownloadWord, wordLoading,
  thumbnail,
  renderPreview, // NEW — function(themeName) => ReactNode
}) => {
  const [browserOpen,  setBrowserOpen]  = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [copyDone,     setCopyDone]     = useState(false);
  const [openSections, setOpenSections] = useState({ color: true, typography: false, page: false, export: true });

  const toggle = (k) => setOpenSections(p => ({ ...p, [k]: !p[k] }));

  const isExporting = pdfLoading || wordLoading;

  const handleExport = () => {
    if (exportFormat === 'pdf'  || exportFormat === 'both') onDownloadPDF?.();
    if (exportFormat === 'word' || exportFormat === 'both') onDownloadWord?.();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopyDone(true); setTimeout(() => setCopyDone(false), 2000);
    });
  };

  const cfg = THEME_CONFIGS[theme] || {};

  return (
    <>
      {/* Template browser modal */}
      <ThemeBrowserModal
        isOpen={browserOpen}
        onClose={() => setBrowserOpen(false)}
        currentTheme={theme}
        onSelect={onThemeChange}
        accentColor={accentColor}
        renderPreview={renderPreview}
      />

      <div style={ts.wrap}>
        {/* ── Live thumbnail ── */}
        {thumbnail && (
          <div style={ts.thumbnailWrap}>
            <div style={ts.thumbnailLabel}>Live Preview</div>
            <div style={ts.thumbnailFrame}>
              <div style={{ transform: 'scale(0.29)', transformOrigin: 'top left', width: '345%', pointerEvents: 'none' }}>
                {thumbnail}
              </div>
              <div style={ts.thumbnailBadge}>{theme}</div>
            </div>
          </div>
        )}

        {/* ── Theme selector button ── */}
        <div style={ts.section}>
          <button onClick={() => setBrowserOpen(true)} style={ts.themeBtn}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{theme}</div>
              <div style={{ fontSize: 10, color: '#475569', marginTop: 1 }}>{cfg.desc}</div>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 10, color: '#6366f1', fontWeight: 600, background: '#1e2047', padding: '2px 7px', borderRadius: 5 }}>Browse</span>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </button>
        </div>

        {/* ── Accent color ── */}
        <div style={ts.section}>
          <button style={ts.sectionHeader} onClick={() => toggle('color')}>
            <span style={ts.sectionTitle}>🖌 Accent Colour</span>
            <span style={{ ...ts.chevron, transform: openSections.color ? 'rotate(180deg)' : 'none' }}>▾</span>
          </button>
          {openSections.color && (
            <div style={{ padding: '10px 16px 14px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 10 }}>
                {PRESET_COLORS.map(c => (
                  <button key={c} onClick={() => onAccentChange(c)} style={{ width: 24, height: 24, borderRadius: 6, background: c, border: 'none', cursor: 'pointer', outline: accentColor === c ? `3px solid #6366f1` : '3px solid transparent', outlineOffset: 2, transition: 'all 0.13s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {accentColor === c && <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </button>
                ))}
              </div>
              {/* colour wheel */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'conic-gradient(red,yellow,lime,aqua,blue,magenta,red)', padding: 3, flexShrink: 0 }}>
                  <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#0d1117', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <input type="color" value={accentColor} onChange={e => onAccentChange(e.target.value)} style={{ width: 30, height: 30, border: 'none', padding: 0, cursor: 'pointer', background: 'none', borderRadius: '50%' }} />
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 18, height: 18, borderRadius: 4, background: accentColor, border: '1px solid #1e293b', flexShrink: 0 }} />
                    <input type="text" value={accentColor} onChange={e => { if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) onAccentChange(e.target.value); }}
                      style={{ flex: 1, padding: '5px 8px', border: '1px solid #1e293b', borderRadius: 6, fontSize: 12, fontFamily: 'monospace', color: '#e2e8f0', background: '#0f172a', outline: 'none' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Typography ── */}
        <div style={ts.section}>
          <button style={ts.sectionHeader} onClick={() => toggle('typography')}>
            <span style={ts.sectionTitle}>🔤 Typography</span>
            <span style={{ ...ts.chevron, transform: openSections.typography ? 'rotate(180deg)' : 'none' }}>▾</span>
          </button>
          {openSections.typography && (
            <div style={{ padding: '10px 16px 14px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Font Size</div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 14 }}>
                {FONT_SIZES.map(f => (
                  <button key={f} onClick={() => onFontSizeChange(f)} style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid', fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.13s', borderColor: fontSize === f ? '#6366f1' : '#1e293b', background: fontSize === f ? '#1e2047' : '#0f172a', color: fontSize === f ? '#818cf8' : '#64748b' }}>
                    {f}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Line Spacing</div>
              <div style={{ display: 'flex', gap: 5 }}>
                {SPACING_PRESETS.map(sp => (
                  <button key={sp.id} onClick={() => onSpacingChange?.(sp.id)} style={{ flex: 1, padding: '6px 4px', borderRadius: 7, border: '1px solid', fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.13s', borderColor: spacing === sp.id ? '#6366f1' : '#1e293b', background: spacing === sp.id ? '#1e2047' : '#0f172a', color: spacing === sp.id ? '#818cf8' : '#64748b' }}>
                    {sp.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Page settings ── */}
        <div style={ts.section}>
          <button style={ts.sectionHeader} onClick={() => toggle('page')}>
            <span style={ts.sectionTitle}>📄 Page Settings</span>
            <span style={{ ...ts.chevron, transform: openSections.page ? 'rotate(180deg)' : 'none' }}>▾</span>
          </button>
          {openSections.page && (
            <div style={{ padding: '10px 16px 14px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Paper Size</div>
              <div style={{ display: 'flex', gap: 5, marginBottom: 14 }}>
                {PAPER_SIZES.map(p => (
                  <button key={p} onClick={() => onPaperSizeChange?.(p)} style={{ flex: 1, padding: '6px 4px', borderRadius: 7, border: '1px solid', fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.13s', borderColor: paperSize === p ? '#6366f1' : '#1e293b', background: paperSize === p ? '#1e2047' : '#0f172a', color: paperSize === p ? '#818cf8' : '#64748b' }}>
                    {p}
                  </button>
                ))}
              </div>
              <Toggle label="Page numbers" value={showPageNumbers} onChange={v => onShowPageNumbersChange?.(v)} />
              <Toggle label="Draft watermark" value={showWatermark} onChange={v => onShowWatermarkChange?.(v)} />
            </div>
          )}
        </div>

        {/* ── Export ── */}
        <div style={ts.section}>
          <button style={ts.sectionHeader} onClick={() => toggle('export')}>
            <span style={ts.sectionTitle}>⬇ Export</span>
            <span style={{ ...ts.chevron, transform: openSections.export ? 'rotate(180deg)' : 'none' }}>▾</span>
          </button>
          {openSections.export && (
            <div style={{ padding: '10px 16px 14px' }}>
              <div style={{ display: 'flex', gap: 5, marginBottom: 12 }}>
                {[{ id:'pdf', label:'📄 PDF' },{ id:'word', label:'📝 Word' },{ id:'both', label:'⬇ Both' }].map(f => (
                  <button key={f.id} onClick={() => setExportFormat(f.id)} style={{ flex: 1, padding: '6px 4px', borderRadius: 7, border: '1px solid', fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.13s', borderColor: exportFormat === f.id ? '#6366f1' : '#1e293b', background: exportFormat === f.id ? '#1e2047' : '#0f172a', color: exportFormat === f.id ? '#818cf8' : '#64748b' }}>
                    {f.label}
                  </button>
                ))}
              </div>

              <button onClick={handleExport} disabled={isExporting} style={{ width: '100%', background: isExporting ? '#1e293b' : 'linear-gradient(135deg,#6366f1,#4f46e5)', color: isExporting ? '#475569' : '#fff', border: 'none', borderRadius: 9, padding: '11px 0', cursor: isExporting ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginBottom: 8, transition: 'all 0.18s' }}>
                {isExporting ? '⏳ Exporting…' : <><Download />{exportFormat === 'pdf' ? 'Download PDF' : exportFormat === 'word' ? 'Download Word' : 'Download Both'}</>}
              </button>

              {exportFormat === 'both' && (
                <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                  <button onClick={() => onDownloadPDF?.()} disabled={pdfLoading} style={{ flex: 1, padding: '7px 0', borderRadius: 8, border: '1px solid #1e293b', background: '#0f172a', color: '#64748b', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                    {pdfLoading ? '…' : '📄 PDF only'}
                  </button>
                  <button onClick={() => onDownloadWord?.()} disabled={wordLoading} style={{ flex: 1, padding: '7px 0', borderRadius: 8, border: '1px solid #1e293b', background: '#0f172a', color: '#64748b', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                    {wordLoading ? '…' : '📝 Word only'}
                  </button>
                </div>
              )}

              <button onClick={handleCopyLink} style={{ width: '100%', padding: '9px 0', borderRadius: 9, border: `1px solid ${copyDone ? '#166534' : '#1e293b'}`, background: copyDone ? '#052e16' : '#0f172a', color: copyDone ? '#4ade80' : '#64748b', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.18s' }}>
                {copyDone ? '✓ Link copied!' : '🔗 Copy Link'}
              </button>
            </div>
          )}
        </div>

        <div style={{ height: 20 }} />
      </div>
    </>
  );
};

const Toggle = ({ label, value, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
    <span style={{ fontSize: 12, color: '#94a3b8' }}>{label}</span>
    <button onClick={() => onChange(!value)} style={{ width: 36, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer', padding: 2, background: value ? '#6366f1' : '#1e293b', display: 'flex', alignItems: 'center', justifyContent: value ? 'flex-end' : 'flex-start', transition: 'background 0.2s' }}>
      <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', display: 'block', boxShadow: '0 1px 3px rgba(0,0,0,0.4)', transition: 'all 0.18s' }} />
    </button>
  </div>
);

const ts = {
  wrap:           { height: '100%', overflowY: 'auto', background: '#0a0e1a', display: 'flex', flexDirection: 'column', fontFamily: "'Inter','Segoe UI',sans-serif" },
  thumbnailWrap:  { padding: '14px 16px 0', flexShrink: 0 },
  thumbnailLabel: { fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 },
  thumbnailFrame: { border: '1px solid #1e293b', borderRadius: 9, overflow: 'hidden', height: 115, position: 'relative', background: '#0f172a' },
  thumbnailBadge: { position: 'absolute', bottom: 6, right: 8, background: 'rgba(0,0,0,0.7)', color: '#818cf8', fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 5, letterSpacing: '0.05em', textTransform: 'uppercase' },
  section:        { borderBottom: '1px solid #0f172a' },
  sectionHeader:  { width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' },
  sectionTitle:   { fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' },
  chevron:        { color: '#475569', fontSize: 13, transition: 'transform 0.2s' },
  themeBtn:       { width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#0f172a', border: 'none', borderBottom: '1px solid #1e293b', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' },
};

export default TemplateSelector;
