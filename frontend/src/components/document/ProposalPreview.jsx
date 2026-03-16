// client/src/components/document/ProposalPreview.jsx
import EditableField from '../common/EditableField';

const BODY_FONT = {
  Classic: "'EB Garamond',Georgia,serif",
  Minimal: "'DM Sans','Helvetica Neue',sans-serif",
  Bold:    "'Barlow','Helvetica Neue',sans-serif",
};

const ProposalPreview = ({ data, onDataChange, theme, fontSize, accentColor, editMode }) => {
  const accent = accentColor || '#1e3a5f';
  const fz     = parseInt(fontSize) || 12;
  const dark   = '#0f172a';
  const eb     = editMode ? '1px dashed #f59e0b40' : 'none';
  const font   = BODY_FONT[theme] || "'Lato',sans-serif";

  const update            = (f, v) => onDataChange({ ...data, [f]: v });
  const updateDeliverable = (i, v) => { const d = [...data.deliverables]; d[i] = v; onDataChange({ ...data, deliverables: d }); };
  const updateTimeline    = (i, f, v) => onDataChange({ ...data, timeline: data.timeline.map((x, j) => j === i ? { ...x, [f]: v } : x) });

  return (
    <div style={{ fontFamily: font, fontSize: fz, background: '#fff', minHeight: 700, position: 'relative' }}>
      {/* Dark header */}
      <div style={{ background: dark, padding: '32px 40px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 5, background: accent }} />
        <EditableField value={data.title}    onChange={(v) => update('title', v)}    editMode={editMode} style={{ fontSize: fz * 2.0, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1.1, display: 'block' }} inputStyle={{ color: '#fff', background: 'rgba(255,255,255,0.1)', border: '1px dashed rgba(255,255,255,0.4)' }} />
        <EditableField value={data.subtitle} onChange={(v) => update('subtitle', v)} editMode={editMode} style={{ fontSize: fz * 0.9, color: accent, fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', display: 'block', marginTop: 6 }} inputStyle={{ color: accent, background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.3)' }} />
        <div style={{ marginTop: 16, display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: fz * 0.8 }}>
          {[['Prepared by', 'preparedBy'], ['Prepared for', 'preparedFor'], ['Date', 'date'], ['Version', 'version']].map(([label, field]) => (
            <div key={field}>
              <div style={{ fontSize: fz * 0.68, textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>{label}</div>
              <EditableField value={data[field]} onChange={(v) => update(field, v)} editMode={editMode} style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }} inputStyle={{ color: '#fff', background: 'rgba(255,255,255,0.1)', border: '1px dashed rgba(255,255,255,0.4)' }} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '28px 40px' }}>
        {/* Text sections */}
        {[{ label: 'Executive Summary', field: 'executiveSummary' }, { label: 'Problem Statement', field: 'problemStatement' }, { label: 'Proposed Solution', field: 'proposedSolution' }].map(({ label, field }) => (
          <div key={field} style={{ marginBottom: 22 }}>
            <SectionHeader label={label} accent={accent} fz={fz} />
            <div style={{ border: eb, borderRadius: 4 }}>
              <EditableField value={data[field]} onChange={(v) => update(field, v)} editMode={editMode} multiline style={{ fontSize: fz * 0.9, color: '#374151', lineHeight: 1.7 }} />
            </div>
          </div>
        ))}

        {/* Deliverables */}
        <div style={{ marginBottom: 22 }}>
          <SectionHeader label="Deliverables" accent={accent} fz={fz} />
          {data.deliverables.map((d, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 6, border: eb, borderRadius: 4 }}>
              <div style={{ width: 20, height: 20, borderRadius: 4, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}><span style={{ color: '#fff', fontSize: 8, fontWeight: 700 }}>✓</span></div>
              <EditableField value={d} onChange={(v) => updateDeliverable(i, v)} editMode={editMode} style={{ fontSize: fz * 0.9, color: '#374151', flex: 1, lineHeight: 1.6 }} />
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div style={{ marginBottom: 22 }}>
          <SectionHeader label="Project Timeline" accent={accent} fz={fz} />
          {data.timeline.map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 10, background: '#f8fafc', borderLeft: `3px solid ${accent}`, borderRadius: '0 8px 8px 0', padding: '10px 14px', border: eb }}>
              <div style={{ flex: 1 }}>
                <EditableField value={t.phase} onChange={(v) => updateTimeline(i, 'phase', v)} editMode={editMode} style={{ fontWeight: 700, fontSize: fz * 0.9, color: '#111', display: 'block' }} />
                <EditableField value={t.desc}  onChange={(v) => updateTimeline(i, 'desc',  v)} editMode={editMode} style={{ fontSize: fz * 0.82, color: '#64748b', display: 'block', marginTop: 2 }} />
              </div>
              <div style={{ background: accent, color: '#fff', borderRadius: 6, padding: '3px 10px', fontSize: fz * 0.78, fontWeight: 700, whiteSpace: 'nowrap', alignSelf: 'flex-start' }}>
                <EditableField value={t.duration} onChange={(v) => updateTimeline(i, 'duration', v)} editMode={editMode} style={{ color: '#fff', fontSize: fz * 0.78, fontWeight: 700 }} inputStyle={{ color: '#fff', background: 'rgba(255,255,255,0.15)', border: '1px dashed rgba(255,255,255,0.5)' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Budget + validity */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 22 }}>
          {[['Total Budget', 'budget'], ['Proposal Validity', 'validity']].map(([label, field]) => (
            <div key={field} style={{ flex: 1, background: `${accent}08`, border: `1.5px solid ${accent}30`, borderRadius: 10, padding: '14px 18px' }}>
              <div style={{ fontSize: fz * 0.72, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: accent, marginBottom: 4 }}>{label}</div>
              <EditableField value={data[field]} onChange={(v) => update(field, v)} editMode={editMode} style={{ fontSize: fz * 1.1, fontWeight: 700, color: '#111' }} />
            </div>
          ))}
        </div>

        {/* Closing */}
        <div style={{ marginBottom: 22, border: eb, borderRadius: 4 }}>
          <EditableField value={data.closingNote} onChange={(v) => update('closingNote', v)} editMode={editMode} multiline style={{ fontSize: fz * 0.9, color: '#374151', lineHeight: 1.7, fontStyle: 'italic' }} />
        </div>
        <div style={{ borderTop: `1px solid ${accent}30`, paddingTop: 14 }}>
          <EditableField value={data.contactName}  onChange={(v) => update('contactName', v)}  editMode={editMode} style={{ fontWeight: 700, fontSize: fz * 1.05, color: accent, display: 'block' }} />
          <EditableField value={data.contactEmail} onChange={(v) => update('contactEmail', v)} editMode={editMode} style={{ fontSize: fz * 0.85, color: '#64748b', display: 'block', marginTop: 2 }} />
        </div>
      </div>
    </div>
  );
};

const SectionHeader = ({ label, accent, fz }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
    <div style={{ background: accent, color: '#fff', fontSize: fz * 0.68, fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', padding: '3px 12px', borderRadius: 3 }}>{label}</div>
    <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
  </div>
);

export default ProposalPreview;
