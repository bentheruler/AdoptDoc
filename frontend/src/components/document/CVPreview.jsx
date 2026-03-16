// client/src/components/document/CVPreview.jsx
// Dispatcher + all 4 theme renderers in one file.
// Each theme is a focused function component; CVPreview routes to the right one.

import EditableField from '../common/EditableField';

// ── Helpers shared by all themes ─────────────────────────────
const buildOps = (data, onDataChange) => ({
  update:       (f, v) => onDataChange({ ...data, [f]: v }),
  updateExp:    (ei, f, v) => onDataChange({ ...data, experience: data.experience.map((x, i) => i === ei ? { ...x, [f]: v } : x) }),
  updateBullet: (ei, bi, v) => onDataChange({ ...data, experience: data.experience.map((x, i) => { if (i !== ei) return x; return { ...x, bullets: x.bullets.map((b, j) => j === bi ? v : b) }; }) }),
  updateSkill:  (idx, v) => onDataChange({ ...data, skills: data.skills.map((x, i) => i === idx ? v : x) }),
  addSkill:     () => onDataChange({ ...data, skills: [...data.skills, 'New Skill'] }),
  removeSkill:  (idx) => onDataChange({ ...data, skills: data.skills.filter((_, i) => i !== idx) }),
  addBullet:    (ei) => onDataChange({ ...data, experience: data.experience.map((x, i) => i === ei ? { ...x, bullets: [...x.bullets, 'New achievement'] } : x) }),
  removeBullet: (ei, bi) => onDataChange({ ...data, experience: data.experience.map((x, i) => { if (i !== ei) return x; return { ...x, bullets: x.bullets.filter((_, j) => j !== bi) }; }) }),
});

// ── CVPreview dispatcher ─────────────────────────────────────
const CVPreview = ({ data, onDataChange, theme, fontSize, accentColor, editMode }) => {
  const accent = accentColor || '#1e3a5f';
  const fz     = parseInt(fontSize) || 12;
  const ops    = buildOps(data, onDataChange);
  const props  = { data, ...ops, accent, fz, editMode };

  if (theme === 'Classic') return <ClassicCV  {...props} />;
  if (theme === 'Minimal') return <MinimalCV  {...props} />;
  if (theme === 'Bold')    return <BoldCV     {...props} />;
  return                          <ModernCV   {...props} />;
};

export default CVPreview;

// ── MODERN ───────────────────────────────────────────────────
function ModernCV({ data, update, updateExp, updateBullet, updateSkill, addSkill, removeSkill, addBullet, removeBullet, accent, fz, editMode }) {
  const eb = editMode ? '1px dashed #f59e0b40' : 'none';
  return (
    <div style={{ fontFamily: "'Lato',sans-serif", fontSize: fz, display: 'flex', minHeight: 520, background: '#fff' }}>
      {/* Sidebar */}
      <div style={{ width: '34%', background: accent, color: '#fff', padding: '28px 18px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ borderBottom: '2px solid rgba(255,255,255,0.3)', paddingBottom: 16 }}>
          <EditableField value={data.name} onChange={(v) => update('name', v)} editMode={editMode}
            style={{ fontSize: fz * 1.6, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px', fontFamily: "'Playfair Display',Georgia,serif", lineHeight: 1.2 }}
            inputStyle={{ color: '#fff', background: 'rgba(255,255,255,0.15)', border: '1px dashed rgba(255,255,255,0.5)' }} />
          <EditableField value={data.title} onChange={(v) => update('title', v)} editMode={editMode}
            style={{ fontSize: fz * 0.88, color: 'rgba(255,255,255,0.85)', fontWeight: 400, letterSpacing: '0.5px', textTransform: 'uppercase', marginTop: 6 }}
            inputStyle={{ color: '#fff', background: 'rgba(255,255,255,0.1)', border: '1px dashed rgba(255,255,255,0.4)' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: fz * 0.72, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>Contact</div>
          {[['📍', data.location, (v) => update('location', v)], ['✉', data.email1, (v) => update('email1', v)], ['✉', data.email2, (v) => update('email2', v)]].map(([icon, val, fn], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: fz * 0.8 }}>
              <span style={{ flexShrink: 0, opacity: 0.7, marginTop: 1 }}>{icon}</span>
              <EditableField value={val} onChange={fn} editMode={editMode}
                style={{ color: 'rgba(255,255,255,0.9)', wordBreak: 'break-all' }}
                inputStyle={{ color: '#fff', background: 'rgba(255,255,255,0.1)', border: '1px dashed rgba(255,255,255,0.4)', fontSize: fz * 0.8 }} />
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: fz * 0.72, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>Skills</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {data.skills.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.6)', flexShrink: 0 }} />
                {editMode
                  ? <><input value={s} onChange={(e) => updateSkill(i, e.target.value)} style={{ background: 'rgba(255,255,255,0.15)', border: '1px dashed rgba(255,255,255,0.5)', borderRadius: 3, padding: '1px 5px', color: '#fff', fontSize: fz * 0.82, fontFamily: 'inherit', outline: 'none', flex: 1 }} /><span onClick={() => removeSkill(i)} style={{ cursor: 'pointer', color: 'rgba(255,100,100,0.9)', fontWeight: 700, fontSize: 12 }}>×</span></>
                  : <span style={{ fontSize: fz * 0.82, color: 'rgba(255,255,255,0.9)' }}>{s}</span>}
              </div>
            ))}
            {editMode && <button onClick={addSkill} style={{ background: 'rgba(255,255,255,0.15)', border: '1px dashed rgba(255,255,255,0.5)', borderRadius: 4, padding: '3px 8px', color: '#fff', cursor: 'pointer', fontSize: fz * 0.78, fontFamily: 'inherit', marginTop: 4 }}>+ Add Skill</button>}
          </div>
        </div>
      </div>
      {/* Main */}
      <div style={{ flex: 1, padding: '28px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Section label="Summary" accent={accent} fz={fz}>
          <div style={{ border: eb, borderRadius: 4 }}>
            <EditableField value={data.summary} onChange={(v) => update('summary', v)} editMode={editMode} multiline style={{ fontSize: fz * 0.88, color: '#444', lineHeight: 1.6 }} />
          </div>
        </Section>
        <Section label="Experience" accent={accent} fz={fz}>
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: 12, paddingLeft: 10, borderLeft: `2px solid ${accent}20`, border: eb }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 4 }}>
                <EditableField value={exp.company} onChange={(v) => updateExp(i, 'company', v)} editMode={editMode} style={{ fontWeight: 700, fontSize: fz, color: '#1a1a2e' }} />
                <EditableField value={exp.period}  onChange={(v) => updateExp(i, 'period',  v)} editMode={editMode} style={{ fontSize: fz * 0.8, color: '#999', whiteSpace: 'nowrap' }} />
              </div>
              <EditableField value={exp.role} onChange={(v) => updateExp(i, 'role', v)} editMode={editMode} style={{ fontSize: fz * 0.88, color: accent, fontWeight: 600, marginBottom: 6, display: 'block' }} />
              <ul style={{ margin: 0, paddingLeft: 16, listStyle: 'none' }}>
                {exp.bullets.map((b, j) => (
                  <li key={j} style={{ fontSize: fz * 0.85, color: '#555', marginBottom: 4, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <span style={{ color: accent, flexShrink: 0, marginTop: 2, fontSize: 10 }}>▸</span>
                    <EditableField value={b} onChange={(v) => updateBullet(i, j, v)} editMode={editMode} multiline style={{ fontSize: fz * 0.85, color: '#555', flex: 1 }} />
                    {editMode && <span onClick={() => removeBullet(i, j)} style={{ cursor: 'pointer', color: '#ef4444', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>×</span>}
                  </li>
                ))}
              </ul>
              {editMode && <button onClick={() => addBullet(i)} style={{ marginTop: 6, marginLeft: 22, background: 'transparent', border: `1px dashed ${accent}`, color: accent, borderRadius: 4, padding: '2px 10px', cursor: 'pointer', fontSize: fz * 0.78, fontFamily: 'inherit' }}>+ Add bullet</button>}
            </div>
          ))}
        </Section>
      </div>
    </div>
  );
}

// ── CLASSIC ──────────────────────────────────────────────────
function ClassicCV({ data, update, updateExp, updateBullet, updateSkill, addSkill, removeSkill, addBullet, removeBullet, accent, fz, editMode }) {
  const eb = editMode ? '1px dashed #f59e0b40' : 'none';
  return (
    <div style={{ fontFamily: "'EB Garamond',Garamond,Georgia,serif", fontSize: fz, background: '#fffef9', padding: '36px 40px', minHeight: 520, color: '#1a1a1a' }}>
      <div style={{ textAlign: 'center', borderBottom: `1.5px solid ${accent}`, paddingBottom: 16, marginBottom: 20 }}>
        <EditableField value={data.name} onChange={(v) => update('name', v)} editMode={editMode} style={{ fontSize: fz * 2.1, fontWeight: 400, color: '#1a1a1a', letterSpacing: '2px', fontVariant: 'small-caps', display: 'block', textAlign: 'center' }} />
        <EditableField value={data.title} onChange={(v) => update('title', v)} editMode={editMode} style={{ fontSize: fz * 0.95, color: '#666', fontStyle: 'italic', marginTop: 4 }} />
        <div style={{ marginTop: 8, fontSize: fz * 0.82, color: '#888', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0 16px' }}>
          <EditableField value={data.location} onChange={(v) => update('location', v)} editMode={editMode} style={{ color: '#888' }} />
          <span style={{ color: '#ccc' }}>|</span>
          <EditableField value={data.email1}   onChange={(v) => update('email1', v)}   editMode={editMode} style={{ color: '#888' }} />
        </div>
      </div>
      {[
        { label: 'Professional Summary',  content: <div style={{ border: eb, borderRadius: 4 }}><EditableField value={data.summary} onChange={(v) => update('summary', v)} editMode={editMode} multiline style={{ fontSize: fz * 0.92, color: '#333', lineHeight: 1.7, fontStyle: 'italic' }} /></div> },
        { label: 'Core Competencies', content: (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, border: eb, padding: editMode ? 4 : 0, borderRadius: 4 }}>
            {data.skills.map((s, i) => (
              <span key={i} style={{ fontSize: fz * 0.88, color: '#444' }}>
                {editMode
                  ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><input value={s} onChange={(e) => updateSkill(i, e.target.value)} style={{ background: '#fffbeb', border: '1px dashed #f59e0b', borderRadius: 3, padding: '0 4px', color: '#444', fontSize: fz * 0.88, fontFamily: 'inherit', outline: 'none', width: Math.max(50, s.length * 7) }} /><span onClick={() => removeSkill(i)} style={{ cursor: 'pointer', color: '#ef4444', fontWeight: 700 }}>×</span></span>
                  : s}
                {i < data.skills.length - 1 && <span style={{ color: '#bbb', margin: '0 6px' }}>✦</span>}
              </span>
            ))}
            {editMode && <button onClick={addSkill} style={{ background: 'transparent', border: '1px dashed #94a3b8', borderRadius: 3, padding: '0 8px', cursor: 'pointer', fontSize: fz * 0.82, fontFamily: 'inherit', color: '#64748b', marginLeft: 6 }}>+ Add</button>}
          </div>
        )},
      ].map(({ label, content }) => (
        <ClassicSection key={label} label={label} accent={accent} fz={fz}>{content}</ClassicSection>
      ))}
      <ClassicSection label="Professional Experience" accent={accent} fz={fz}>
        {data.experience.map((exp, i) => (
          <div key={i} style={{ marginBottom: 14, border: eb, padding: editMode ? 6 : 0, borderRadius: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <EditableField value={exp.company} onChange={(v) => updateExp(i, 'company', v)} editMode={editMode} style={{ fontWeight: 600, fontSize: fz * 1.02, color: '#1a1a1a' }} />
              <EditableField value={exp.period}  onChange={(v) => updateExp(i, 'period',  v)} editMode={editMode} style={{ fontSize: fz * 0.82, color: '#888', fontStyle: 'italic' }} />
            </div>
            <EditableField value={exp.role} onChange={(v) => updateExp(i, 'role', v)} editMode={editMode} style={{ fontSize: fz * 0.9, color: accent, fontStyle: 'italic', marginBottom: 6, display: 'block' }} />
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {exp.bullets.map((b, j) => (
                <li key={j} style={{ fontSize: fz * 0.88, color: '#444', marginBottom: 3, lineHeight: 1.6, display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                  <EditableField value={b} onChange={(v) => updateBullet(i, j, v)} editMode={editMode} multiline style={{ fontSize: fz * 0.88, color: '#444', flex: 1 }} />
                  {editMode && <span onClick={() => removeBullet(i, j)} style={{ cursor: 'pointer', color: '#ef4444', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>×</span>}
                </li>
              ))}
            </ul>
            {editMode && <button onClick={() => addBullet(i)} style={{ marginTop: 6, marginLeft: 20, background: 'transparent', border: `1px dashed ${accent}`, color: accent, borderRadius: 4, padding: '2px 10px', cursor: 'pointer', fontSize: fz * 0.78, fontFamily: 'inherit' }}>+ Add bullet</button>}
          </div>
        ))}
      </ClassicSection>
    </div>
  );
}

// ── MINIMAL ──────────────────────────────────────────────────
function MinimalCV({ data, update, updateExp, updateBullet, updateSkill, addSkill, removeSkill, addBullet, removeBullet, accent, fz, editMode }) {
  const eb = editMode ? '1px dashed #f59e0b40' : 'none';
  const sections = [
    { label: 'About', content: (
      <div style={{ border: eb, borderRadius: 4 }}><EditableField value={data.summary} onChange={(v) => update('summary', v)} editMode={editMode} multiline style={{ fontSize: fz * 0.9, color: '#444', lineHeight: 1.8, fontWeight: 300 }} /></div>
    )},
    { label: 'Skills', content: (
      <div style={{ border: eb, padding: editMode ? 4 : 0, borderRadius: 4 }}>
        {data.skills.map((s, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', fontSize: fz * 0.85, color: '#555', fontWeight: 300 }}>
            {editMode
              ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><input value={s} onChange={(e) => updateSkill(i, e.target.value)} style={{ background: '#fffbeb', border: '1px dashed #f59e0b', borderRadius: 3, padding: '0 4px', color: '#444', fontSize: fz * 0.85, fontFamily: 'inherit', outline: 'none', width: Math.max(50, s.length * 7) }} /><span onClick={() => removeSkill(i)} style={{ cursor: 'pointer', color: '#ef4444', fontWeight: 700, marginRight: 8 }}>×</span></span>
              : <>{s}{i < data.skills.length - 1 && <span style={{ color: '#ccc', margin: '0 10px' }}>—</span>}</>}
          </span>
        ))}
        {editMode && <button onClick={addSkill} style={{ background: 'transparent', border: '1px dashed #94a3b8', borderRadius: 3, padding: '0 8px', cursor: 'pointer', fontSize: fz * 0.78, fontFamily: 'inherit', color: '#64748b', marginLeft: 6 }}>+ Add</button>}
      </div>
    )},
    { label: 'Experience', content: (
      <div>
        {data.experience.map((exp, i) => (
          <div key={i} style={{ marginBottom: 20, border: eb, padding: editMode ? 6 : 0, borderRadius: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <EditableField value={exp.company} onChange={(v) => updateExp(i, 'company', v)} editMode={editMode} style={{ fontWeight: 500, fontSize: fz * 0.95, color: '#111' }} />
              <EditableField value={exp.period}  onChange={(v) => updateExp(i, 'period',  v)} editMode={editMode} style={{ fontSize: fz * 0.78, color: '#aaa', whiteSpace: 'nowrap' }} />
            </div>
            <EditableField value={exp.role} onChange={(v) => updateExp(i, 'role', v)} editMode={editMode} style={{ fontSize: fz * 0.82, color: accent, fontWeight: 400, marginBottom: 8, display: 'block' }} />
            {exp.bullets.map((b, j) => (
              <div key={j} style={{ display: 'flex', gap: 10, marginBottom: 4, alignItems: 'flex-start' }}>
                <span style={{ color: '#ddd', fontSize: fz * 0.7, flexShrink: 0, marginTop: 3 }}>—</span>
                <EditableField value={b} onChange={(v) => updateBullet(i, j, v)} editMode={editMode} multiline style={{ fontSize: fz * 0.84, color: '#555', flex: 1, lineHeight: 1.6, fontWeight: 300 }} />
                {editMode && <span onClick={() => removeBullet(i, j)} style={{ cursor: 'pointer', color: '#ef4444', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>×</span>}
              </div>
            ))}
            {editMode && <button onClick={() => addBullet(i)} style={{ marginTop: 6, background: 'transparent', border: `1px dashed ${accent}`, color: accent, borderRadius: 4, padding: '2px 10px', cursor: 'pointer', fontSize: fz * 0.78, fontFamily: 'inherit' }}>+ Add bullet</button>}
          </div>
        ))}
      </div>
    )},
  ];
  return (
    <div style={{ fontFamily: "'DM Sans','Helvetica Neue',sans-serif", fontSize: fz, background: '#fafafa', padding: '44px 48px', minHeight: 520, color: '#111' }}>
      <div style={{ marginBottom: 36 }}>
        <EditableField value={data.name} onChange={(v) => update('name', v)} editMode={editMode} style={{ fontSize: fz * 2.4, fontWeight: 300, color: '#111', letterSpacing: '-1px', lineHeight: 1.1, display: 'block' }} />
        <EditableField value={data.title} onChange={(v) => update('title', v)} editMode={editMode} style={{ fontSize: fz * 0.88, color: accent, fontWeight: 500, marginTop: 8 }} />
        <div style={{ marginTop: 10, display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: fz * 0.78, color: '#888' }}>
          <EditableField value={data.location} onChange={(v) => update('location', v)} editMode={editMode} style={{ color: '#888', fontSize: fz * 0.78 }} />
          <EditableField value={data.email1}   onChange={(v) => update('email1', v)}   editMode={editMode} style={{ color: '#888', fontSize: fz * 0.78 }} />
        </div>
      </div>
      {sections.map(({ label, content }) => (
        <div key={label} style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: fz * 0.68, fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', color: '#bbb' }}>{label}</span>
            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
          </div>
          {content}
        </div>
      ))}
    </div>
  );
}

// ── BOLD ─────────────────────────────────────────────────────
function BoldCV({ data, update, updateExp, updateBullet, updateSkill, addSkill, removeSkill, addBullet, removeBullet, accent, fz, editMode }) {
  const eb   = editMode ? '1px dashed #f59e0b40' : 'none';
  const dark = '#0f172a';
  return (
    <div style={{ fontFamily: "'Barlow','Helvetica Neue',sans-serif", fontSize: fz, background: '#fff', minHeight: 520 }}>
      {/* Dark header band */}
      <div style={{ background: dark, padding: '28px 32px 22px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 5, background: accent }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <EditableField value={data.name} onChange={(v) => update('name', v)} editMode={editMode}
              style={{ fontSize: fz * 2.3, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', textTransform: 'uppercase', lineHeight: 1, fontFamily: "'Barlow Condensed','Barlow',sans-serif" }}
              inputStyle={{ color: '#fff', background: 'rgba(255,255,255,0.1)', border: '1px dashed rgba(255,255,255,0.4)' }} />
            <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 24, height: 3, background: accent, borderRadius: 2 }} />
              <EditableField value={data.title} onChange={(v) => update('title', v)} editMode={editMode}
                style={{ fontSize: fz * 0.9, color: accent, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase' }}
                inputStyle={{ color: accent, background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.3)' }} />
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: fz * 0.78, color: 'rgba(255,255,255,0.6)', display: 'flex', flexDirection: 'column', gap: 3 }}>
            <EditableField value={data.location} onChange={(v) => update('location', v)} editMode={editMode} style={{ color: 'rgba(255,255,255,0.6)' }} inputStyle={{ color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.3)' }} />
            <EditableField value={data.email1}   onChange={(v) => update('email1', v)}   editMode={editMode} style={{ color: 'rgba(255,255,255,0.6)' }} inputStyle={{ color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.3)' }} />
          </div>
        </div>
      </div>
      {/* Skills strip */}
      <div style={{ background: accent, padding: '10px 32px', display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
        {data.skills.map((s, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            {editMode
              ? <><input value={s} onChange={(e) => updateSkill(i, e.target.value)} style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.5)', borderRadius: 3, padding: '1px 6px', color: '#fff', fontSize: fz * 0.78, fontFamily: 'inherit', outline: 'none', fontWeight: 600, letterSpacing: '0.5px' }} /><span onClick={() => removeSkill(i)} style={{ cursor: 'pointer', color: 'rgba(255,100,100,0.9)', fontWeight: 700, fontSize: 12 }}>×</span></>
              : <span style={{ fontSize: fz * 0.78, color: '#fff', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{s}</span>}
            {i < data.skills.length - 1 && <span style={{ color: 'rgba(255,255,255,0.4)', marginLeft: 6 }}>·</span>}
          </span>
        ))}
        {editMode && <button onClick={addSkill} style={{ background: 'rgba(255,255,255,0.2)', border: '1px dashed rgba(255,255,255,0.6)', borderRadius: 3, padding: '1px 10px', color: '#fff', cursor: 'pointer', fontSize: fz * 0.78, fontFamily: 'inherit', fontWeight: 600, marginLeft: 4 }}>+ Add</button>}
      </div>
      {/* Body */}
      <div style={{ padding: '24px 32px' }}>
        {[['Summary', 'summary'], ['Experience', null]].map(([label]) => (
          <div key={label} style={{ marginBottom: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: label === 'Summary' ? 10 : 12 }}>
              <div style={{ background: dark, color: '#fff', fontSize: fz * 0.7, fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 3 }}>{label}</div>
              <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            </div>
            {label === 'Summary' && <div style={{ border: eb, borderRadius: 4 }}><EditableField value={data.summary} onChange={(v) => update('summary', v)} editMode={editMode} multiline style={{ fontSize: fz * 0.9, color: '#374151', lineHeight: 1.7 }} /></div>}
            {label === 'Experience' && data.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: 16, border: eb, padding: editMode ? 6 : 0, borderRadius: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '8px 12px', borderLeft: `4px solid ${accent}`, borderRadius: '0 6px 6px 0', marginBottom: 8 }}>
                  <div>
                    <EditableField value={exp.company} onChange={(v) => updateExp(i, 'company', v)} editMode={editMode} style={{ fontWeight: 700, fontSize: fz * 1.02, color: '#111', textTransform: 'uppercase', letterSpacing: '0.5px' }} />
                    <EditableField value={exp.role}    onChange={(v) => updateExp(i, 'role',    v)} editMode={editMode} style={{ fontSize: fz * 0.82, color: accent, fontWeight: 600, display: 'block', marginTop: 2 }} />
                  </div>
                  <EditableField value={exp.period} onChange={(v) => updateExp(i, 'period', v)} editMode={editMode} style={{ fontSize: fz * 0.8, color: '#888', whiteSpace: 'nowrap', fontWeight: 500 }} />
                </div>
                <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none' }}>
                  {exp.bullets.map((b, j) => (
                    <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 5, padding: '3px 0' }}>
                      <div style={{ width: 18, height: 18, borderRadius: 4, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}><span style={{ color: '#fff', fontSize: 8, fontWeight: 700 }}>✓</span></div>
                      <EditableField value={b} onChange={(v) => updateBullet(i, j, v)} editMode={editMode} multiline style={{ fontSize: fz * 0.87, color: '#444', flex: 1, lineHeight: 1.6 }} />
                      {editMode && <span onClick={() => removeBullet(i, j)} style={{ cursor: 'pointer', color: '#ef4444', fontWeight: 700, fontSize: 13, flexShrink: 0, marginTop: 2 }}>×</span>}
                    </li>
                  ))}
                </ul>
                {editMode && <button onClick={() => addBullet(i)} style={{ marginTop: 6, background: 'transparent', border: `1px dashed ${accent}`, color: accent, borderRadius: 4, padding: '2px 10px', cursor: 'pointer', fontSize: fz * 0.78, fontFamily: 'inherit' }}>+ Add bullet</button>}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Shared section header helpers ─────────────────────────────
function Section({ label, accent, fz, children }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{ width: 3, height: 16, background: accent, borderRadius: 2 }} />
        <span style={{ fontSize: fz * 0.78, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: accent }}>{label}</span>
      </div>
      {children}
    </div>
  );
}

function ClassicSection({ label, accent, fz, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: fz * 1.05, fontWeight: 400, fontVariant: 'small-caps', letterSpacing: '2px', color: accent, borderBottom: `1px solid ${accent}50`, paddingBottom: 3, marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}
