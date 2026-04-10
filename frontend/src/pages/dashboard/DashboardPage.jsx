// client/src/pages/dashboard/DashboardPage.jsx
import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';
import { useAuth } from '../../context/AuthContext';

import Sidebar      from '../../components/common/Sidebar';
import Navbar        from '../../components/common/Navbar';
import CustomizationPanel from '../../components/customization/CustomizationPanel';
import DocumentEditor     from '../../components/document/DocumentEditor';
import DocumentPreview    from '../../components/document/DocumentPreview';
import TemplateSelector   from '../../components/template/TemplateSelector';

import CVPreview           from '../../components/document/CVPreview';
import CoverLetterPreview  from '../../components/document/CoverLetterPreview';
import ProposalPreview     from '../../components/document/ProposalPreview';

import HomeTab from '../../pages/dashboard/HomeTab';
import { generateDocumentAI } from '../../services/aiService';

/* ─── global keyframe injection ─── */
 

/* ─── PDF loader ─── */
async function loadPdfLibs() {
  const load = src => new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s);
  });
  if (!window.html2canvas) await load('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
  if (!window.jspdf)       await load('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
}

/* ─── safe helper ─── */
const safe = v => {
  if (!v) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'object') return v.label || v.value || v.name || v.school || v.degree || '';
  return String(v);
};

const mapAICvToPreview = (content) => ({
  name: safe(content?.basics?.name), phone: safe(content?.basics?.phone),
  email1: safe(content?.basics?.email), email2: safe(content?.basics?.email2),
  linkedin: safe(content?.basics?.linkedin),
  title: safe(content?.basics?.title || content?.basics?.role || content?.basics?.headline),
  location: safe(content?.basics?.location || content?.basics?.address || content?.basics?.city),
  summary: safe(content?.basics?.summary),
  skills: Array.isArray(content?.skills) ? content.skills.map(safe).filter(Boolean) : [],
  education: Array.isArray(content?.education) ? content.education.map(edu => typeof edu==='string'?edu:[safe(edu.degree),safe(edu.institution||edu.school||edu.university),safe(edu.date||edu.year||edu.graduationDate)].filter(Boolean).join(' - ')).filter(Boolean) : [],
  experience: Array.isArray(content?.work) ? content.work.map(job => ({ company:safe(job.company), period:safe(job.period||job.duration||job.dates), role:safe(job.role||job.position||job.jobTitle), bullets:Array.isArray(job.bullets)?job.bullets.map(safe).filter(Boolean):Array.isArray(job.achievements)?job.achievements.map(safe).filter(Boolean):job.description?[safe(job.description)]:[] })) : [],
  projects: Array.isArray(content?.projects) ? content.projects.map(safe).filter(Boolean) : [],
  certifications: Array.isArray(content?.certifications) ? content.certifications.map(safe).filter(Boolean) : [],
  references: safe(content?.references) || 'Available upon request',
});

/* ══════════════════════════════════════════════════
   FIELD CATALOGUE
══════════════════════════════════════════════════ */
const FIELD_CATALOGUE = {
  cv: [
    { key:'name',          label:'Full Name',      icon:'👤', placeholder:'e.g. Jane Doe',                 type:'input',    core:true  },
    { key:'email1',        label:'Email',          icon:'📧', placeholder:'jane@example.com',              type:'input',    core:true  },
    { key:'phone',         label:'Phone',          icon:'📞', placeholder:'+254 700 000 000',              type:'input',    core:false },
    { key:'linkedin',      label:'LinkedIn',       icon:'🔗', placeholder:'linkedin.com/in/janedoe',       type:'input',    core:false },
    { key:'title',         label:'Job Title',      icon:'💼', placeholder:'e.g. Senior Designer',          type:'input',    core:false },
    { key:'location',      label:'Location',       icon:'📍', placeholder:'e.g. Nairobi, Kenya',           type:'input',    core:false },
    { key:'summary',       label:'Summary',        icon:'📝', placeholder:'Professional summary…',         type:'textarea', core:false },
    { key:'skills',        label:'Skills',         icon:'⚡', placeholder:'React, Figma, Node.js…',        type:'tags',     core:false },
    { key:'education',     label:'Education',      icon:'🎓', placeholder:'BSc CS - MIT - 2020',           type:'tags',     core:false },
    { key:'experience',    label:'Experience',     icon:'🏢', placeholder:'Role · Company · Period\nbullets…', type:'textarea', core:false },
    { key:'projects',      label:'Projects',       icon:'🚀', placeholder:'Project name, description…',   type:'tags',     core:false },
    { key:'certifications',label:'Certifications', icon:'🏅', placeholder:'AWS Certified, PMP…',          type:'tags',     core:false },
    { key:'references',    label:'References',     icon:'👥', placeholder:'Available upon request',        type:'input',    core:false },
  ],
  cover_letter: [
    { key:'senderName',     label:'Your Name',       icon:'👤', placeholder:'e.g. Jane Doe',              type:'input',    core:true  },
    { key:'senderEmail',    label:'Your Email',      icon:'📧', placeholder:'jane@example.com',           type:'input',    core:true  },
    { key:'senderTitle',    label:'Your Title',      icon:'💼', placeholder:'e.g. Software Engineer',     type:'input',    core:false },
    { key:'senderLocation', label:'Your Location',   icon:'📍', placeholder:'e.g. Nairobi, Kenya',        type:'input',    core:false },
    { key:'companyName',    label:'Company',         icon:'🏢', placeholder:'Company applying to…',      type:'input',    core:false },
    { key:'recipientName',  label:'Hiring Manager',  icon:'🤝', placeholder:'e.g. Hiring Manager',       type:'input',    core:false },
    { key:'subject',        label:'Subject Line',    icon:'📌', placeholder:'Application for…',          type:'input',    core:false },
    { key:'body1',          label:'Opening Paragraph',icon:'✍️', placeholder:'Introduce yourself…',      type:'textarea', core:false },
    { key:'body2',          label:'Main Paragraph',  icon:'📝', placeholder:'Your key experience…',     type:'textarea', core:false },
    { key:'body3',          label:'Closing Paragraph',icon:'🎯', placeholder:'Why this role/company…',  type:'textarea', core:false },
    { key:'date',           label:'Date',            icon:'📅', placeholder:'e.g. March 2026',           type:'input',    core:false },
    { key:'signature',      label:'Signature Name',  icon:'✒️', placeholder:'Your full name',            type:'input',    core:false },
  ],
  business_proposal: [
    { key:'title',            label:'Project Title',     icon:'📋', placeholder:'e.g. AI Platform Development', type:'input',    core:true  },
    { key:'preparedFor',      label:'Prepared For',      icon:'🏢', placeholder:'Client / company name',        type:'input',    core:true  },
    { key:'preparedBy',       label:'Prepared By',       icon:'👤', placeholder:'Your name or company',         type:'input',    core:false },
    { key:'executiveSummary', label:'Executive Summary', icon:'📝', placeholder:'High-level overview…',         type:'textarea', core:false },
    { key:'problemStatement', label:'Problem Statement', icon:'❓', placeholder:'Problem being solved…',        type:'textarea', core:false },
    { key:'proposedSolution', label:'Proposed Solution', icon:'💡', placeholder:'Your solution…',               type:'textarea', core:false },
    { key:'budget',           label:'Budget',            icon:'💰', placeholder:'e.g. KES 850,000',             type:'input',    core:false },
    { key:'validity',         label:'Validity',          icon:'📅', placeholder:'e.g. 30 days from issue',      type:'input',    core:false },
    { key:'closingNote',      label:'Closing Note',      icon:'✒️', placeholder:'Closing remarks…',             type:'textarea', core:false },
    { key:'contactName',      label:'Contact Name',      icon:'🤝', placeholder:'Your contact name',            type:'input',    core:false },
    { key:'contactEmail',     label:'Contact Email',     icon:'📧', placeholder:'contact@example.com',          type:'input',    core:false },
  ],
};

/* ══════════════════════════════════════════════════
   ICONS
══════════════════════════════════════════════════ */
const SparkleIcon = () => <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>;
const SaveIcon   = () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const PdfIcon    = () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>;
const EyeIcon    = () => <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const EditIcon   = () => <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const ThemeIcon  = () => <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20"/><path d="M12 8a4 4 0 0 1 0 8"/></svg>;

/* ══════════════════════════════════════════════════
   FIELD PICKER
══════════════════════════════════════════════════ */
const FieldPicker = ({ catalogue, activeKeys, onToggle }) => {
  const optional = catalogue.filter(f => !f.core);
  return (
    <div style={{ padding: '12px 18px 14px', borderBottom: '1px solid #0f172a', background: '#080c14' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 9, fontFamily: "'DM Mono',monospace" }}>Add fields</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {optional.map(f => {
          const on = activeKeys.includes(f.key);
          return (
            <button key={f.key} className="field-chip" onClick={() => onToggle(f.key)}
              style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 9px 4px 7px', borderRadius:20, border:'1px solid', cursor:'pointer', fontSize:11, fontWeight:500, lineHeight:1, userSelect:'none', transition:'all 0.14s', borderColor: on?'#6366f1':'#1e293b', background: on?'#1e2047':'#0f172a', color: on?'#818cf8':'#475569' }}>
              <span style={{ fontSize:12 }}>{f.icon}</span>
              <span>{f.label}</span>
              <span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:14, height:14, borderRadius:'50%', fontSize:9, fontWeight:700, background: on?'#6366f1':'#1e293b', color:'#fff' }}>{on?'✓':'+'}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════
   FIELD ROW
══════════════════════════════════════════════════ */
const FieldRow = ({ field, value, onChange, onRemove }) => {
  const isTextarea = field.type === 'textarea';
  const isTags     = field.type === 'tags';
  const toRaw = v => Array.isArray(v) ? v.join(', ') : (v || '');
  const [rawTags, setRawTags] = useState(() => toRaw(value));
  const prev = useRef(value);
  useEffect(() => {
    if (isTags && prev.current !== value) { setRawTags(toRaw(value)); prev.current = value; }
  }, [value, isTags]);
  const commitTags = () => onChange(rawTags.split(',').map(s => s.trim()).filter(Boolean));

  const inputStyle = { width:'100%', padding:'8px 12px', border:'1px solid #1e293b', borderRadius:8, fontSize:12, color:'#e2e8f0', background:'#0a0e1a', outline:'none', boxSizing:'border-box', fontFamily:'inherit', transition:'border-color 0.15s' };
  const taStyle    = { ...inputStyle, resize:'vertical', minHeight:80 };

  return (
    <div style={{ padding:'11px 18px', borderBottom:'1px solid #0d111c' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
        <label style={{ display:'flex', alignItems:'center', fontSize:11, fontWeight:600, color:'#64748b', gap:6 }}>
          <span style={{ fontSize:13 }}>{field.icon}</span>
          {field.label}
          {field.core && <span style={{ marginLeft:5, fontSize:9, fontWeight:700, color:'#6366f1', background:'#1e2047', padding:'1px 6px', borderRadius:8, textTransform:'uppercase', letterSpacing:'0.05em' }}>required</span>}
        </label>
        {!field.core && (
          <button onClick={onRemove} style={{ background:'none', border:'none', cursor:'pointer', color:'#334155', fontSize:12, padding:'1px 4px', lineHeight:1, transition:'color 0.12s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
            onMouseLeave={e => e.currentTarget.style.color = '#334155'}>✕</button>
        )}
      </div>
      {isTextarea ? (
        <textarea className="field-row-input" style={taStyle} placeholder={field.placeholder} value={value||''} onChange={e => onChange(e.target.value)} />
      ) : isTags ? (
        <>
          <input className="field-row-input" style={inputStyle} placeholder={field.placeholder} value={rawTags} onChange={e => setRawTags(e.target.value)} onBlur={commitTags} />
          <p style={{ margin:'4px 0 0', fontSize:10, color:'#334155' }}>Separate with commas</p>
        </>
      ) : (
        <input className="field-row-input" style={inputStyle} placeholder={field.placeholder} value={value||''} onChange={e => onChange(e.target.value)} />
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════
   RIGHT PANEL TABS
══════════════════════════════════════════════════ */
const RightPanelTabs = ({ active, onChange }) => {
  const tabs = [
    { id:'preview',   label:'Preview',   icon:<EyeIcon />   },
    { id:'style',     label:'AI Edit',   icon:<EditIcon />  },
    { id:'templates', label:'Templates', icon:<ThemeIcon /> },
  ];
  return (
    <div style={{ display:'flex', borderBottom:'1px solid #0f172a', background:'#080c14', padding:'0 20px', gap:0, flexShrink:0 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'12px 16px', fontSize:12, fontWeight:500, border:'none', background:'none', cursor:'pointer', borderBottom: active===t.id ? '2px solid #6366f1' : '2px solid transparent', color: active===t.id ? '#818cf8' : '#475569', marginBottom:-1, transition:'color 0.15s, border-color 0.15s', fontFamily:'inherit' }}>
          {t.icon}{t.label}
        </button>
      ))}
    </div>
  );
};

/* ══════════════════════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════════════════ */
const DashboardPage = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { injectStyles(); }, []);

  const [activeTab,        setActiveTab]        = useState('home');
  const [sidebarVisible,   setSidebarVisible]   = useState(false);
  const [documents,        setDocuments]        = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const previewRef = useRef(null);

  /* doc state */
  const [category,    setCategory]    = useState('CV');
  const [theme,       setTheme]       = useState('Modern');
  const [fontSize,    setFontSize]    = useState('12 pt');
  const [fontFamily,  setFontFamily]  = useState('Inter');
  const [accentColor, setAccentColor] = useState('#6366f1');
  const [spacing,     setSpacing]     = useState('normal');
  const [paperSize,   setPaperSize]   = useState('A4');
  const [showPageNumbers, setShowPageNumbers] = useState(false);
  const [showWatermark,   setShowWatermark]   = useState(false);
  const [editMode,    setEditMode]    = useState(false);
  const [rightTab,    setRightTab]    = useState('preview');

  const [cvData, setCvData] = useState({ name:'',phone:'',email1:'',email2:'',linkedin:'',title:'',location:'',summary:'',skills:[],education:[],experience:[],projects:[],certifications:[],references:'' });
  const [coverLetterData, setCoverLetterData] = useState({ senderName:'',senderTitle:'',senderLocation:'',senderEmail:'',date:'',recipientName:'',recipientTitle:'',companyName:'',companyLocation:'',subject:'',opening:'',body1:'',body2:'',body3:'',closing:'',signoff:'Sincerely,',signature:'' });
  const [proposalData, setProposalData] = useState({ title:'',subtitle:'Technical Proposal',preparedBy:'',preparedFor:'',date:'',version:'v1.0',executiveSummary:'',problemStatement:'',proposedSolution:'',deliverables:[],timeline:[],budget:'',validity:'',closingNote:'',contactName:'',contactEmail:'' });

  const [aiLoading,  setAiLoading]  = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [wordLoading,setWordLoading]= useState(false);

  const [activeFieldKeys, setActiveFieldKeys] = useState({ cv:[], cover_letter:[], business_proposal:[] });

  /* sidebar auto-hide on scroll */
  const scrollRef = useRef(null);
  const hideTimer = useRef(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      setSidebarVisible(false);
      clearTimeout(hideTimer.current);
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const docType = category==='CV' ? 'cv' : category==='Cover Letter' ? 'cover_letter' : 'business_proposal';
  const currentFields = docType==='cv' ? cvData : docType==='cover_letter' ? coverLetterData : proposalData;

  const updateField = (field, value) => {
    if      (docType==='cv')           setCvData(p=>({...p,[field]:value}));
    else if (docType==='cover_letter') setCoverLetterData(p=>({...p,[field]:value}));
    else                                setProposalData(p=>({...p,[field]:value}));
  };

  const toggleField = key => {
    setActiveFieldKeys(prev => {
      const cur = prev[docType]||[];
      const next = cur.includes(key) ? cur.filter(k=>k!==key) : [...cur, key];
      return {...prev,[docType]:next};
    });
  };

  useEffect(() => { loadDocuments(); }, []);
  useEffect(() => { if (activeTab==='documents') loadDocuments(); }, [activeTab]);

  const loadDocuments = () => {
    try { setLoadingDocuments(true); setDocuments(JSON.parse(localStorage.getItem('adaptdoc_documents')||'[]')); }
    catch { setDocuments([]); } finally { setLoadingDocuments(false); }
  };

  /* ── handlers ── */
  const handleGenerate = async () => {
    try {
      setAiLoading(true);
      const res = await generateDocumentAI(docType, currentFields);
      if (docType==='cv' && res.content) {
        setCvData(p=>({...p,...mapAICvToPreview(res.content)}));
      } else if (docType==='cover_letter') {
        const text = res.document||res.generatedText||res.message||'';
        const parts = text.split('\n\n').filter(Boolean);
        setCoverLetterData(p=>({ ...p, body1:parts[0]||p.body1, body2:parts[1]||p.body2, body3:parts[2]||p.body3, closing:parts[3]||p.closing }));
      } else {
        const text = res.document||res.generatedText||res.message||'';
        setProposalData(p=>({...p, executiveSummary:text}));
      }
    } catch (e) { alert(e.response?.data?.error||'AI generation failed'); }
    finally { setAiLoading(false); }
  };

  const handleSaveDraft = () => {
    const draft = { id:Date.now().toString(), cvData, coverLetterData, proposalData, theme, fontSize, accentColor, category, savedAt:new Date().toLocaleString(), type:category.toLowerCase().replace(' ','_'), title:`${category} — ${new Date().toLocaleDateString()}` };
    const existing = JSON.parse(localStorage.getItem('adaptdoc_documents')||'[]');
    const updated  = [draft,...existing];
    localStorage.setItem('adaptdoc_documents', JSON.stringify(updated));
    setDocuments(updated);
    alert(`${category} draft saved!`);
  };

  const handleDeleteDocument = id => {
    const updated = documents.filter(d=>d.id!==id);
    localStorage.setItem('adaptdoc_documents', JSON.stringify(updated));
    setDocuments(updated);
  };

  const handleOpenDocument = doc => {
    if (doc.category)        setCategory(doc.category);
    if (doc.cvData)          setCvData(doc.cvData);
    if (doc.coverLetterData) setCoverLetterData(doc.coverLetterData);
    if (doc.proposalData)    setProposalData(doc.proposalData);
    setActiveTab('create');
  };

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;
    try {
      setPdfLoading(true);
      await loadPdfLibs();
      const canvas = await window.html2canvas(previewRef.current, { scale:2, useCORS:true, backgroundColor:'#ffffff' });
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('p','mm','a4');
      const pw=pdf.internal.pageSize.getWidth(), ph=pdf.internal.pageSize.getHeight();
      const ih=(canvas.height*pw)/canvas.width;
      let left=ih, pos=0;
      pdf.addImage(canvas.toDataURL('image/png'),'PNG',0,pos,pw,ih); left-=ph;
      while(left>0){ pos-=ph; pdf.addPage(); pdf.addImage(canvas.toDataURL('image/png'),'PNG',0,pos,pw,ih); left-=ph; }
      pdf.save(`${docType}_document.pdf`);
    } catch { alert('PDF export failed'); }
    finally { setPdfLoading(false); }
  };

  const handleDownloadWord = async () => {
    try {
      setWordLoading(true);
      const doc = new Document({ sections:[{ properties:{}, children:[
        new Paragraph({ alignment:AlignmentType.CENTER, children:[new TextRun({text:cvData.name||'',bold:true,size:36,color:'1e3a5f'})], spacing:{after:80} }),
        new Paragraph({ alignment:AlignmentType.CENTER, children:[new TextRun({text:cvData.title||'',size:22,color:'555555'})], spacing:{after:60} }),
        new Paragraph({ alignment:AlignmentType.CENTER, children:[new TextRun({text:`${cvData.location||''} | ${cvData.email1||''} | ${cvData.phone||''}`,size:18,color:'777777'})], spacing:{after:200} }),
        new Paragraph({ border:{bottom:{style:BorderStyle.SINGLE,size:6,color:'1e3a5f'}}, spacing:{after:160} }),
        new Paragraph({ children:[new TextRun({text:'SUMMARY',bold:true,size:22,color:'1e3a5f'})], spacing:{after:80} }),
        new Paragraph({ children:[new TextRun({text:cvData.summary||'',size:20,color:'333333'})], spacing:{after:200} }),
      ]}]});
      saveAs(await Packer.toBlob(doc), `${(cvData.name||'document').replace(/\s+/g,'_')}_CV.docx`);
    } catch { alert('Word export failed'); }
    finally { setWordLoading(false); }
  };

  /* renderPreview — accepts optional override theme so TemplateSelector can render any theme */
  const renderPreview = useCallback((overrideTheme) => {
    const t = overrideTheme || theme;
    if (category==='Cover Letter') return <CoverLetterPreview data={coverLetterData} onDataChange={setCoverLetterData} theme={t} fontSize={fontSize} accentColor={accentColor} editMode={false} />;
    if (category==='Proposal')     return <ProposalPreview    data={proposalData}    onDataChange={setProposalData}    theme={t} fontSize={fontSize} accentColor={accentColor} editMode={false} />;
    return                                <CVPreview           data={cvData}          onDataChange={setCvData}          theme={t} fontSize={fontSize} accentColor={accentColor} editMode={false} />;
  }, [category, cvData, coverLetterData, proposalData, theme, fontSize, accentColor]);

  /* renderForm */
  const renderForm = () => {
    const catalogue  = FIELD_CATALOGUE[docType]||[];
    const activeKeys = activeFieldKeys[docType]||[];
    const visible    = catalogue.filter(f=>f.core||activeKeys.includes(f.key));
    const getVal     = key => {
      const v = currentFields[key];
      if (v===undefined||v===null) return '';
      if (key==='experience'&&Array.isArray(v)) {
        return v.map(e=>{ const h=[e.role,e.company,e.period].filter(Boolean).join(' · '); const b=Array.isArray(e.bullets)?e.bullets.join('\n'):''; return [h,b].filter(Boolean).join('\n'); }).join('\n\n');
      }
      return v;
    };
    const handleChange = (field, raw) => {
      if (field.key==='experience'&&docType==='cv'&&typeof raw==='string') {
        const blocks = raw.split(/\n\n+/).filter(Boolean);
        const parsed = blocks.map(block => { const lines=block.split('\n').filter(Boolean); const parts=(lines[0]||'').split('·').map(p=>p.trim()); return { role:parts[0]||'', company:parts[1]||'', period:parts[2]||'', bullets:lines.slice(1) }; });
        updateField('experience', parsed.length ? parsed : [{ role:raw, company:'', period:'', bullets:[] }]);
      } else { updateField(field.key, raw); }
    };
    return (
      <div>
        <FieldPicker catalogue={catalogue} activeKeys={activeKeys} onToggle={toggleField} />
        {visible.map(field => (
          <FieldRow key={field.key} field={field} value={getVal(field.key)} onChange={v=>handleChange(field,v)} onRemove={()=>toggleField(field.key)} />
        ))}
        {visible.length===catalogue.filter(f=>f.core).length && (
          <div style={{ padding:'22px 18px', textAlign:'center', color:'#334155', fontSize:12, fontStyle:'italic' }}>
            ↑ Add fields above to build your document
          </div>
        )}
      </div>
    );
  };

  /* ── RENDER ── */
  return (
    <div style={s.page}>

      {/* ── Floating sidebar trigger strip ── */}
      <div
        style={{ position:'fixed', left:0, top:0, bottom:0, width:16, zIndex:50, cursor:'pointer' }}
        onMouseEnter={() => setSidebarVisible(true)}
      />

      {/* ── Floating sidebar ── */}
      <div
        className={`dash-sidebar${sidebarVisible ? '' : ' hidden'}`}
        style={s.sidebar}
        onMouseLeave={() => { hideTimer.current = setTimeout(()=>setSidebarVisible(false), 600); }}
        onMouseEnter={() => clearTimeout(hideTimer.current)}
      >
        {/* Logo */}
        <div style={s.sidebarLogo}>
          <div style={s.logoMark}>AD</div>
          <span style={s.logoText}>AdaptDoc</span>
        </div>

        {/* Nav items */}
        <nav style={{ flex:1, padding:'8px 12px' }}>
          {[
            { id:'home',      icon:'⊞', label:'Dashboard'      },
            { id:'create',    icon:'✦', label:'Create Document' },
            { id:'documents', icon:'📄', label:'My Documents'   },
            { id:'settings',  icon:'⚙', label:'Settings'       },
          ].map(item => (
            <button key={item.id} onClick={()=>{ setActiveTab(item.id); setSidebarVisible(false); }}
              style={{ ...s.navItem, ...(activeTab===item.id ? s.navItemActive : {}) }}>
              <span style={{ fontSize:15 }}>{item.icon}</span>
              <span>{item.label}</span>
              {activeTab===item.id && <div style={s.navDot}/>}
            </button>
          ))}
        </nav>

        {/* User footer */}
        <div style={s.sidebarFooter}>
          <div style={s.userAvatar}>{user?.name?.[0]?.toUpperCase()||user?.email?.[0]?.toUpperCase()||'U'}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'#e2e8f0', truncate:true, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name||user?.email||'User'}</div>
            <div style={{ fontSize:10, color:'#475569' }}>Pro Plan</div>
          </div>
        </div>
      </div>

      {/* Sidebar backdrop */}
      {sidebarVisible && (
        <div style={{ position:'fixed', inset:0, zIndex:49, background:'rgba(0,0,0,0.4)', backdropFilter:'blur(2px)' }}
          onClick={() => setSidebarVisible(false)} />
      )}

      {/* ── Main area ── */}
      <div style={s.main} ref={scrollRef}>

        {/* Top bar */}
        <div style={s.topbar}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <button onClick={()=>setSidebarVisible(p=>!p)} style={s.menuBtn}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <span style={{ fontSize:14, fontWeight:600, color:'#64748b', fontFamily:"'DM Mono',monospace" }}>
              <span style={{ color:'#334155' }}>adaptdoc</span>
              <span style={{ color:'#1e293b' }}> /</span>
              <span style={{ color:'#6366f1' }}> {activeTab}</span>
            </span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {activeTab==='create' && (
              <button onClick={handleSaveDraft} style={s.topbarBtn}>
                <SaveIcon /> Save Draft
              </button>
            )}
            <div style={s.userChip}>
              <div style={s.userChipAvatar}>{user?.name?.[0]?.toUpperCase()||'U'}</div>
              <span style={{ fontSize:11, color:'#64748b' }}>{user?.name||user?.email||'User'}</span>
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div style={s.content}>

          {/* HOME */}
          {activeTab==='home' && (
            <div className="dash-tab" style={s.tabPage}>
              <HomeTab user={user} documents={documents} onNavigate={setActiveTab} loadingDocuments={loadingDocuments} />
            </div>
          )}

          {/* CREATE */}
          {activeTab==='create' && (
            <div className="dash-tab" style={s.createLayout}>

              {/* LEFT: type selector + field picker + fields + action bar */}
              <div style={s.leftPanel}>
                <div style={s.leftHeader}>
                  <DocumentEditor
                    category={category}
                    onCategoryChange={setCategory}
                    editMode={editMode}
                    onToggleEditMode={() => setEditMode(p=>!p)}
                    onSaveDraft={handleSaveDraft}
                  />
                </div>
                <div style={s.formScroll}>
                  {renderForm()}
                </div>
                <div style={s.actionBar}>
                  <button style={{ ...s.btnGenerate, ...(aiLoading?s.btnDisabled:{}) }} onClick={handleGenerate} disabled={aiLoading}>
                    <SparkleIcon />{aiLoading ? 'Generating…' : 'Generate with AI'}
                  </button>
                  <div style={{ display:'flex', gap:7, marginLeft:'auto' }}>
                    <button style={s.btnGhost} onClick={handleSaveDraft}><SaveIcon /><span>Save</span></button>
                    <button style={{ ...s.btnGhost, ...(pdfLoading?s.btnDisabled:{}) }} onClick={handleDownloadPDF} disabled={pdfLoading}>
                      <PdfIcon /><span>{pdfLoading?'…':'PDF'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT: tabbed panel */}
              <div style={s.rightPanel}>
                <RightPanelTabs active={rightTab} onChange={setRightTab} />
                <div style={s.rightContent}>

                  {rightTab==='preview' && (
                    <div style={s.previewWrap}>
                      <DocumentPreview ref={previewRef} editMode={editMode} onToggleEditMode={()=>setEditMode(p=>!p)}>
                        {renderPreview()}
                      </DocumentPreview>
                    </div>
                  )}

                  {rightTab==='style' && (
                    <div style={s.panelScroll}>
                      <CustomizationPanel
                        cvData={cvData}           onCVUpdate={setCvData}
                        coverLetterData={coverLetterData} onCoverLetterUpdate={setCoverLetterData}
                        proposalData={proposalData}       onProposalUpdate={setProposalData}
                        docType={docType}
                      />
                    </div>
                  )}

                  {rightTab==='templates' && (
                    <div style={s.panelScroll}>
                      <TemplateSelector
                        theme={theme}            onThemeChange={setTheme}
                        fontSize={fontSize}      onFontSizeChange={setFontSize}
                        fontFamily={fontFamily}  onFontFamilyChange={setFontFamily}
                        accentColor={accentColor} onAccentChange={setAccentColor}
                        spacing={spacing}        onSpacingChange={setSpacing}
                        paperSize={paperSize}    onPaperSizeChange={setPaperSize}
                        showPageNumbers={showPageNumbers} onShowPageNumbersChange={setShowPageNumbers}
                        showWatermark={showWatermark}     onShowWatermarkChange={setShowWatermark}
                        onDownloadPDF={handleDownloadPDF} pdfLoading={pdfLoading}
                        onDownloadWord={handleDownloadWord} wordLoading={wordLoading}
                        thumbnail={renderPreview()}
                        renderPreview={renderPreview}
                      />
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* DOCUMENTS */}
          {activeTab==='documents' && (
            <div className="dash-tab" style={s.tabPage}>
              <div style={s.tabHeader}>
                <div>
                  <h2 style={s.tabTitle}>My Documents</h2>
                  <p style={s.tabSubtitle}>Manage and resume your saved work</p>
                </div>
                <button style={s.btnGenerate} onClick={()=>setActiveTab('create')}>+ New Document</button>
              </div>
              {loadingDocuments && <div style={s.emptyState}><div style={s.spinner}/><p style={{ color:'#475569', marginTop:14 }}>Loading…</p></div>}
              {!loadingDocuments && documents.length===0 && (
                <div style={s.emptyState}>
                  <div style={{ fontSize:42, marginBottom:14 }}>📄</div>
                  <h3 style={{ color:'#94a3b8', fontWeight:600, margin:'0 0 8px' }}>No documents yet</h3>
                  <p style={{ color:'#475569', fontSize:13, margin:'0 0 20px' }}>Create your first document to get started</p>
                  <button style={s.btnGenerate} onClick={()=>setActiveTab('create')}>Create one →</button>
                </div>
              )}
              {!loadingDocuments && documents.length>0 && (
                <div style={s.docGrid}>
                  {documents.map(doc => {
                    const dt = doc.type||'cv';
                    const badgePalette = { cv:['#1e2047','#818cf8'], cover_letter:['#052e16','#4ade80'], business_proposal:['#422006','#fbbf24'] };
                    const [badgeBg, badgeFg] = badgePalette[dt]||['#1e293b','#94a3b8'];
                    return (
                      <div key={doc.id} className="dash-card" style={s.docCard} onClick={()=>handleOpenDocument(doc)}>
                        <div style={{ height:70, background:`linear-gradient(135deg,${accentColor}22,${accentColor}08)`, display:'flex', alignItems:'center', justifyContent:'center', borderBottom:'1px solid #0f172a' }}>
                          <span style={{ fontSize:28 }}>{dt==='cv'?'📋':dt==='cover_letter'?'✉️':'💼'}</span>
                        </div>
                        <div style={{ padding:'12px 14px', flex:1 }}>
                          <div style={{ display:'inline-block', padding:'2px 7px', borderRadius:16, fontSize:10, fontWeight:700, background:badgeBg, color:badgeFg, marginBottom:7, textTransform:'uppercase', letterSpacing:'0.05em' }}>{dt.replace('_',' ')}</div>
                          <div style={{ fontWeight:600, color:'#e2e8f0', fontSize:13, marginBottom:4 }}>{doc.title}</div>
                          <div style={{ fontSize:11, color:'#334155' }}>Saved {doc.savedAt}</div>
                        </div>
                        <div style={{ display:'flex', gap:7, padding:'10px 14px', borderTop:'1px solid #0f172a' }}>
                          <button style={s.btnOpenDoc}   onClick={e=>{e.stopPropagation();handleOpenDocument(doc);}}>Open</button>
                          <button style={s.btnDeleteDoc} onClick={e=>{e.stopPropagation();handleDeleteDocument(doc.id);}}>Delete</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SETTINGS */}
          {activeTab==='settings' && (
            <div className="dash-tab" style={s.tabPage}>
              <div style={s.tabHeader}>
                <div>
                  <h2 style={s.tabTitle}>Settings</h2>
                  <p style={s.tabSubtitle}>Manage your account preferences</p>
                </div>
              </div>
              <div style={s.settingsCard}>
                <h3 style={{ color:'#e2e8f0', fontWeight:700, fontSize:15, margin:'0 0 20px' }}>Account Information</h3>
                {[{ label:'Name', type:'text', value:user?.name||user?.email||'User' },{ label:'Email', type:'email', value:user?.email||'' }].map(f => (
                  <div key={f.label} style={{ marginBottom:18 }}>
                    <label style={{ display:'block', marginBottom:5, color:'#64748b', fontWeight:600, fontSize:12 }}>{f.label}</label>
                    <input type={f.type} value={f.value} readOnly style={{ width:'100%', padding:'9px 13px', border:'1px solid #1e293b', borderRadius:8, fontSize:13, color:'#64748b', background:'#080c14', boxSizing:'border-box' }} />
                  </div>
                ))}
                <div style={{ height:1, background:'#0f172a', margin:'20px 0' }} />
                <button onClick={()=>{logoutUser();navigate('/login');}} style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#1a0505', color:'#ef4444', border:'1px solid #3d0a0a', padding:'9px 16px', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:600 }}>
                  Sign Out
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════
   STYLES
══════════════════════════════════════════════════ */
const s = {
  page:  { display:'flex', minHeight:'100vh', fontFamily:"'Outfit','Segoe UI',system-ui,sans-serif", background:'#080c14', color:'#e2e8f0', overflow:'hidden' },

  /* ── Floating sidebar ── */
  sidebar: { position:'fixed', left:0, top:0, bottom:0, width:220, zIndex:50, background:'#0a0e1a', borderRight:'1px solid #0f172a', display:'flex', flexDirection:'column', boxShadow:'4px 0 32px rgba(0,0,0,0.6)' },
  sidebarLogo: { padding:'18px 18px 14px', borderBottom:'1px solid #0f172a', display:'flex', alignItems:'center', gap:10 },
  logoMark:    { width:32, height:32, borderRadius:9, background:'linear-gradient(135deg,#6366f1,#4f46e5)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:'#fff', letterSpacing:'-0.5px', fontFamily:"'DM Mono',monospace", flexShrink:0 },
  logoText:    { fontSize:15, fontWeight:700, color:'#e2e8f0', letterSpacing:'-0.3px' },
  navItem:     { width:'100%', display:'flex', alignItems:'center', gap:10, padding:'10px 12px', marginBottom:2, background:'transparent', border:'none', borderRadius:9, cursor:'pointer', color:'#475569', fontSize:13, fontWeight:500, textAlign:'left', whiteSpace:'nowrap', transition:'all 0.15s', position:'relative', fontFamily:'inherit' },
  navItemActive:{ background:'#1e2047', color:'#7cf390' },
  navDot:      { position:'absolute', right:10, width:5, height:5, borderRadius:'50%', background:'#6df185' },
  sidebarFooter:{ padding:'12px 14px', borderTop:'1px solid #0f172a', display:'flex', alignItems:'center', gap:10 },
  userAvatar:   { width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:12, fontWeight:700, flexShrink:0 },

  /* ── Main ── */
  main:    { flex:1, display:'flex', flexDirection:'column', overflow:'hidden' },
  topbar:  { height:50, background:'#080c14', borderBottom:'1px solid #0f172a', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 20px', flexShrink:0 },
  menuBtn: { width:34, height:34, borderRadius:8, border:'1px solid #1e293b', background:'#0f172a', cursor:'pointer', color:'#64748b', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s' },
  topbarBtn:{ display:'inline-flex', alignItems:'center', gap:5, background:'#0f172a', color:'#64748b', border:'1px solid #1e293b', padding:'7px 12px', borderRadius:8, cursor:'pointer', fontSize:12, fontWeight:500, fontFamily:'inherit' },
  userChip: { display:'flex', alignItems:'center', gap:7, background:'#0f172a', border:'1px solid #1e293b', borderRadius:20, padding:'4px 12px 4px 5px' },
  userChipAvatar:{ width:22, height:22, borderRadius:'50%', background:'#6366f1', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700 },

  content: { flex:1, overflow:'hidden', display:'flex', flexDirection:'column' },

  /* ── Create ── */
  createLayout: { display:'flex', flex:1, minHeight:0, height:'100%' },
  leftPanel:    { width:400, minWidth:320, maxWidth:460, display:'flex', flexDirection:'column', borderRight:'1px solid #0f172a', background:'#080c14', overflow:'hidden' },
  leftHeader:   { flexShrink:0 },
  formScroll:   { flex:1, overflowY:'auto', paddingBottom:8 },
  actionBar:    { display:'flex', alignItems:'center', gap:8, padding:'12px 18px', borderTop:'1px solid #0f172a', background:'#080c14', flexShrink:0 },
  rightPanel:   { flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden', background:'#0a0e1a' },
  rightContent: { flex:1, minHeight:0, overflow:'hidden', display:'flex', flexDirection:'column' },
  previewWrap:  { flex:1, overflow:'auto', padding:'24px', display:'flex', alignItems:'flex-start', justifyContent:'center', background:'#080c14' },
  panelScroll:  { flex:1, overflow:'auto' },

  /* ── Buttons ── */
  btnGenerate: { display:'inline-flex', alignItems:'center', gap:6, background:'linear-gradient(135deg,#6366f1,#4f46e5)', color:'#fff', border:'none', padding:'9px 16px', borderRadius:9, cursor:'pointer', fontSize:13, fontWeight:600, whiteSpace:'nowrap', flexShrink:0, fontFamily:'inherit' },
  btnGhost:    { display:'inline-flex', alignItems:'center', gap:5, background:'transparent', color:'#475569', border:'1px solid #1e293b', padding:'7px 12px', borderRadius:8, cursor:'pointer', fontSize:12, fontWeight:500, whiteSpace:'nowrap', fontFamily:'inherit' },
  btnDisabled: { opacity:0.45, cursor:'not-allowed' },

  /* ── Tab pages ── */
  tabPage:     { padding:'32px 36px', flex:1, overflow:'auto' },
  tabHeader:   { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28, gap:16, flexWrap:'wrap' },
  tabTitle:    { color:'#f1f5f9', fontSize:22, fontWeight:700, margin:'0 0 4px', letterSpacing:'-0.02em' },
  tabSubtitle: { color:'#475569', fontSize:13, margin:0 },

  /* ── Doc cards ── */
  docGrid:    { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))', gap:14 },
  docCard:    { background:'#0f172a', border:'1px solid #1e293b', borderRadius:12, overflow:'hidden', cursor:'pointer', transition:'transform 0.18s, box-shadow 0.18s', boxShadow:'0 2px 8px rgba(0,0,0,0.3)', display:'flex', flexDirection:'column' },
  btnOpenDoc: { flex:1, background:'#1e2047', color:'#818cf8', border:'none', borderRadius:6, padding:'6px 0', fontSize:11, fontWeight:600, cursor:'pointer' },
  btnDeleteDoc:{ flex:1, background:'#1a0505', color:'#ef4444', border:'1px solid #3d0a0a', borderRadius:6, padding:'6px 0', fontSize:11, fontWeight:500, cursor:'pointer' },

  /* ── Empty + spinner ── */
  emptyState: { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'60px 20px', background:'#0f172a', borderRadius:16, border:'1px dashed #1e293b', textAlign:'center' },
  spinner:    { width:28, height:28, border:'2.5px solid #1e293b', borderTop:'2.5px solid #6366f1', borderRadius:'50%', animation:'spin 0.8s linear infinite' },

  /* ── Settings ── */
  settingsCard: { background:'#0f172a', border:'1px solid #1e293b', borderRadius:14, padding:28, maxWidth:500 },
};

export default DashboardPage;