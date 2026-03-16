// client/src/components/document/CoverLetterPreview.jsx
import EditableField from '../common/EditableField';

const BODY_FONT = {
  Classic: "'EB Garamond',Georgia,serif",
  Minimal: "'DM Sans','Helvetica Neue',sans-serif",
  Bold:    "'Barlow','Helvetica Neue',sans-serif",
};
const BG = { Classic: '#fffef9', Minimal: '#fafafa' };

const CoverLetterPreview = ({ data, onDataChange, theme, fontSize, accentColor, editMode }) => {
  const accent     = accentColor || '#1e3a5f';
  const fz         = parseInt(fontSize) || 12;
  const update     = (f, v) => onDataChange({ ...data, [f]: v });
  const eb         = editMode ? '1px dashed #f59e0b40' : 'none';
  const bodyFont   = BODY_FONT[theme] || "'Lato',sans-serif";
  const bg         = BG[theme] || '#fff';

  return (
    <div style={{ fontFamily: bodyFont, fontSize: fz, background: bg, padding: '44px 52px', minHeight: 620, color: '#1a1a1a', lineHeight: 1.7, position: 'relative' }}>
      {/* Sender header */}
      <div style={{ marginBottom: 28, borderBottom: `2px solid ${accent}`, paddingBottom: 16 }}>
        <EditableField value={data.senderName}  onChange={(v) => update('senderName', v)}  editMode={editMode} style={{ fontSize: fz * 1.6, fontWeight: 700, color: accent, display: 'block', letterSpacing: '-0.3px' }} />
        <EditableField value={data.senderTitle} onChange={(v) => update('senderTitle', v)} editMode={editMode} style={{ fontSize: fz * 0.9, color: '#666', display: 'block', marginTop: 2 }} />
        <div style={{ marginTop: 6, fontSize: fz * 0.82, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <EditableField value={data.senderLocation} onChange={(v) => update('senderLocation', v)} editMode={editMode} style={{ color: '#888' }} />
          <EditableField value={data.senderEmail}    onChange={(v) => update('senderEmail', v)}    editMode={editMode} style={{ color: '#888' }} />
        </div>
      </div>

      {/* Recipient */}
      <div style={{ marginBottom: 20 }}>
        <EditableField value={data.date}              onChange={(v) => update('date', v)}              editMode={editMode} style={{ fontSize: fz * 0.88, color: '#888', display: 'block', marginBottom: 14 }} />
        <EditableField value={data.recipientName}     onChange={(v) => update('recipientName', v)}     editMode={editMode} style={{ fontWeight: 600, fontSize: fz * 0.95, color: '#111', display: 'block' }} />
        <EditableField value={data.recipientTitle}    onChange={(v) => update('recipientTitle', v)}    editMode={editMode} style={{ fontSize: fz * 0.88, color: '#555', display: 'block' }} />
        <EditableField value={data.companyName}       onChange={(v) => update('companyName', v)}       editMode={editMode} style={{ fontSize: fz * 0.88, color: '#555', display: 'block' }} />
        <EditableField value={data.companyLocation}   onChange={(v) => update('companyLocation', v)}   editMode={editMode} style={{ fontSize: fz * 0.88, color: '#555', display: 'block' }} />
      </div>

      {/* Subject line */}
      <div style={{ marginBottom: 18, padding: '8px 14px', background: `${accent}10`, borderLeft: `3px solid ${accent}`, borderRadius: '0 6px 6px 0', border: eb }}>
        <span style={{ fontSize: fz * 0.8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: accent }}>Re: </span>
        <EditableField value={data.subject} onChange={(v) => update('subject', v)} editMode={editMode} style={{ fontSize: fz * 0.92, fontWeight: 600, color: '#1a1a1a' }} />
      </div>

      {/* Body */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <EditableField value={data.opening} onChange={(v) => update('opening', v)} editMode={editMode} style={{ fontSize: fz * 0.92, color: '#1a1a1a', fontWeight: 500 }} />
        {['body1', 'body2', 'body3', 'closing'].map((field) => (
          <div key={field} style={{ border: eb, borderRadius: 4 }}>
            <EditableField value={data[field]} onChange={(v) => update(field, v)} editMode={editMode} multiline style={{ fontSize: fz * 0.92, color: '#333', lineHeight: 1.75 }} />
          </div>
        ))}
      </div>

      {/* Sign-off */}
      <div style={{ marginTop: 28 }}>
        <EditableField value={data.signoff}   onChange={(v) => update('signoff', v)}   editMode={editMode} style={{ fontSize: fz * 0.92, color: '#333', display: 'block', marginBottom: 20 }} />
        <div style={{ borderTop: `1px solid ${accent}40`, paddingTop: 8, display: 'inline-block', minWidth: 160 }}>
          <EditableField value={data.signature} onChange={(v) => update('signature', v)} editMode={editMode} style={{ fontSize: fz * 1.1, fontWeight: 700, color: accent }} />
        </div>
      </div>
    </div>
  );
};

export default CoverLetterPreview;
