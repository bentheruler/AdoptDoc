// client/src/pages/dashboard/DashboardPage.jsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';
import { useAuth } from '../../context/AuthContext';

// Layout components (in structure ✓)
import Sidebar             from '../../components/common/Sidebar';
import Navbar              from '../../components/common/Navbar';

// Feature components (in structure ✓)
import CustomizationPanel  from '../../components/customization/CustomizationPanel';
import DocumentEditor      from '../../components/document/DocumentEditor';
import DocumentPreview     from '../../components/document/DocumentPreview';
import TemplateSelector    from '../../components/template/TemplateSelector';

// Document renderers (in structure ✓)
import CVPreview           from '../../components/document/CVPreview';
import CoverLetterPreview  from '../../components/document/CoverLetterPreview';
import ProposalPreview     from '../../components/document/ProposalPreview';

// Home tab — NEW file (see comment in HomeTab.jsx)
import HomeTab             from '../../pages/dashboard/HomeTab';

// Default data & constants
import { DEFAULT_CV, DEFAULT_COVER_LETTER, DEFAULT_PROPOSAL } from '../../constants';

// ── PDF lib loader ────────────────────────────────────────────
async function loadPdfLibs() {
  const load = (src) => new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = src; s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });
  if (!window.html2canvas) await load('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
  if (!window.jspdf)       await load('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
}

// ── Component ─────────────────────────────────────────────────
const DashboardPage = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  
  // Layout state
  const [activeTab,   setActiveTab]   = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const previewRef = useRef(null);

  // Document state
  const [category,        setCategory]        = useState('CV');
  const [theme,           setTheme]           = useState('Modern');
  const [fontSize,        setFontSize]        = useState('12 pt');
  const [accentColor,     setAccentColor]     = useState('#1e3a5f');
  const [editMode,        setEditMode]        = useState(false);
  const [cvData,          setCvData]          = useState(DEFAULT_CV);
  const [coverLetterData, setCoverLetterData] = useState(DEFAULT_COVER_LETTER);
  const [proposalData,    setProposalData]    = useState(DEFAULT_PROPOSAL);
  const [pdfLoading,      setPdfLoading]      = useState(false);
  const [wordLoading,     setWordLoading]     = useState(false);

  // Load documents from localStorage on mount
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = () => {
    try {
      setLoadingDocuments(true);
      const saved = JSON.parse(localStorage.getItem('adaptdoc_documents') || '[]');
      setDocuments(saved);
    } catch (err) {
      console.error('Failed to load documents:', err);
      setDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  };

  // ── Save draft ──────────────────────────────────────────────
  const handleSaveDraft = () => {
    const draft = { 
      id: Date.now().toString(),
      cvData, 
      coverLetterData, 
      proposalData, 
      theme, 
      fontSize, 
      accentColor, 
      category, 
      savedAt: new Date().toLocaleString(),
      type: category.toLowerCase().replace(' ', '-'),
      title: `${category} - ${new Date().toLocaleDateString()}`
    };
    
    // Save to localStorage
    const existing = JSON.parse(localStorage.getItem('adaptdoc_documents') || '[]');
    const updated = [draft, ...existing];
    localStorage.setItem('adaptdoc_documents', JSON.stringify(updated));
    setDocuments(updated);
    
    // Show success message (in real app, would be a toast)
    alert(`${category} draft saved successfully!`);
  };

  // ── PDF export ──────────────────────────────────────────────
  const handleDownloadPDF = async () => {
    const el = previewRef.current;
    if (!el) return;
    setPdfLoading(true);
    // Hide edit badge if present
    const badge = el.querySelector('[data-edit-badge]');
    if (badge) badge.style.display = 'none';
    try {
      await loadPdfLibs();
      const canvas  = await window.html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      if (badge) badge.style.display = '';
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pw  = pdf.internal.pageSize.getWidth();
      const ph  = pdf.internal.pageSize.getHeight();
      const ih  = (canvas.height * pw) / canvas.width;
      let hl = ih, pos = 0;
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, pos, pw, ih);
      hl -= ph;
      while (hl > 0) { pos -= ph; pdf.addPage(); pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, pos, pw, ih); hl -= ph; }
      const name = (cvData.name || 'document').replace(/\s+/g, '_');
      pdf.save(`${name}_${category.replace(' ', '_')}.pdf`);
    } catch { alert('PDF export failed.'); }
    setPdfLoading(false);
  };

  // ── Word export ─────────────────────────────────────────────
  const handleDownloadWord = async () => {
    setWordLoading(true);
    try {
      const ac  = accentColor.replace('#', '');
      const doc = new Document({ sections: [{ properties: {}, children: [
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: cvData.name, bold: true, size: 36, color: '1e3a5f' })], spacing: { after: 80 } }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: cvData.title, size: 22, color: '555555' })], spacing: { after: 60 } }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${cvData.location}  |  ${cvData.email1}  |  ${cvData.email2}`, size: 18, color: '777777' })], spacing: { after: 200 } }),
        new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '1e3a5f' } }, spacing: { after: 160 } }),
        new Paragraph({ children: [new TextRun({ text: 'SUMMARY', bold: true, size: 22, color: '1e3a5f' })], spacing: { after: 80 } }),
        new Paragraph({ children: [new TextRun({ text: cvData.summary, size: 20, color: '333333' })], spacing: { after: 200 } }),
        new Paragraph({ children: [new TextRun({ text: 'KEY SKILLS', bold: true, size: 22, color: '1e3a5f' })], spacing: { after: 100 } }),
        new Paragraph({ children: [new TextRun({ text: cvData.skills.join('   •   '), size: 20, color: '333333' })], spacing: { after: 200 } }),
        new Paragraph({ children: [new TextRun({ text: 'PROFESSIONAL EXPERIENCE', bold: true, size: 22, color: '1e3a5f' })], spacing: { after: 120 } }),
        ...cvData.experience.flatMap((exp) => [
          new Paragraph({ children: [new TextRun({ text: exp.company, bold: true, size: 22 }), new TextRun({ text: `   ${exp.period}`, size: 18, color: '777777' })], spacing: { after: 60 } }),
          new Paragraph({ children: [new TextRun({ text: exp.role, size: 20, color: ac, italics: true })], spacing: { after: 80 } }),
          ...exp.bullets.map((b) => new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: b, size: 19, color: '444444' })], spacing: { after: 60 } })),
          new Paragraph({ spacing: { after: 120 } }),
        ]),
      ] }] });
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${(cvData.name || 'document').replace(/\s+/g, '_')}_CV.docx`);
    } catch { alert('Word export failed.'); }
    setWordLoading(false);
  };

  // ── Active document preview renderer ───────────────────────
  const sharedPreviewProps = { theme, fontSize, accentColor, editMode };

  const renderPreview = (overrideEditMode = editMode) => {
    const props = { ...sharedPreviewProps, editMode: overrideEditMode };
    if (category === 'Cover Letter') return <CoverLetterPreview data={coverLetterData} onDataChange={setCoverLetterData} {...props} />;
    if (category === 'Proposal')     return <ProposalPreview    data={proposalData}     onDataChange={setProposalData}     {...props} />;
    return                                  <CVPreview          data={cvData}           onDataChange={setCvData}           {...props} />;
  };

  // ── Layout ──────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Segoe UI',system-ui,sans-serif", background: '#f1f5f9', overflow: 'hidden' }}>
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onNavigate={setActiveTab}
        isOpen={sidebarOpen}
        user={user}
        onLogout={logoutUser}
      />

      {/* Main column */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Navbar onToggleSidebar={() => setSidebarOpen((p) => !p)} user={user} onLogout={logoutUser} />

        {/* Tab content */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

          {/* ── HOME TAB ── */}
          {activeTab === 'home' && (
            <HomeTab
              user={user}
              documents={documents}
              onNavigate={setActiveTab}
              loadingDocuments={loadingDocuments}
            />
          )}

          {/* ── CREATE TAB (main editor) ── */}
          {activeTab === 'create' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
              {/* Breadcrumb / category / save bar */}
              <DocumentEditor
                category={category}
                onCategoryChange={setCategory}
                editMode={editMode}
                onToggleEditMode={() => setEditMode((p) => !p)}
                onSaveDraft={handleSaveDraft}
              />

              {/* 3-column workspace */}
              <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
                {/* AI chat */}
                <CustomizationPanel cvData={cvData} onCVUpdate={setCvData} />

                {/* Live preview (middle) */}
                <DocumentPreview
                  ref={previewRef}
                  editMode={editMode}
                  onToggleEditMode={() => setEditMode((p) => !p)}
                >
                  {renderPreview()}
                </DocumentPreview>

                {/* Export / theme panel */}
                <TemplateSelector
                  theme={theme}             onThemeChange={setTheme}
                  fontSize={fontSize}       onFontSizeChange={setFontSize}
                  accentColor={accentColor} onAccentChange={setAccentColor}
                  onDownloadPDF={handleDownloadPDF}   pdfLoading={pdfLoading}
                  onDownloadWord={handleDownloadWord} wordLoading={wordLoading}
                  thumbnail={renderPreview(false)}
                />
              </div>
            </div>
          )}

          {/* ── DOCUMENTS TAB ── */}
          {activeTab === 'documents' && (
            <div style={{ padding: 40, overflow: 'auto', flex: 1 }}>
              <div style={{ maxWidth: 1200 }}>
                <h2 style={{ color: '#1e3a5f', marginBottom: 8, fontSize: 24, fontWeight: 700 }}>My Documents</h2>
                <p style={{ color: '#64748b', marginBottom: 28 }}>Manage all your saved documents</p>
                
                {loadingDocuments && <p style={{ color: '#94a3b8' }}>Loading documents...</p>}
                
                {!loadingDocuments && documents.length === 0 && (
                  <div style={{ 
                    background: '#fff', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: 12, 
                    padding: 40, 
                    textAlign: 'center',
                    color: '#64748b'
                  }}>
                    <p>No documents yet. <button onClick={() => setActiveTab('create')} style={{ background: 'none', border: 'none', color: '#1e3a5f', fontWeight: 600, cursor: 'pointer' }}>Create one to get started →</button></p>
                  </div>
                )}

                {!loadingDocuments && documents.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
                    {documents.map((doc) => (
                      <div key={doc.id} style={{ 
                        background: '#fff', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: 10, 
                        padding: 16,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        boxShadow: '0 1px 3px #0001'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px #0004'}
                      onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 3px #0001'}
                      >
                        <div>
                          <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 14, marginBottom: 4 }}>{doc.title}</div>
                          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>Type: {doc.type}</div>
                          <div style={{ fontSize: 12, color: '#94a3b8' }}>Saved: {doc.savedAt}</div>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            // Delete document logic here
                            const updated = documents.filter(d => d.id !== doc.id);
                            localStorage.setItem('adaptdoc_documents', JSON.stringify(updated));
                            setDocuments(updated);
                          }}
                          style={{ 
                            marginTop: 12,
                            background: '#fef2f2', 
                            border: '1px solid #fee2e2', 
                            borderRadius: 6, 
                            padding: '6px 12px', 
                            cursor: 'pointer', 
                            fontSize: 12, 
                            color: '#dc2626',
                            fontWeight: 500
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── SETTINGS TAB ── */}
          {activeTab === 'settings' && (
            <div style={{ padding: 40, overflow: 'auto', flex: 1 }}>
              <div style={{ maxWidth: 600 }}>
                <h2 style={{ color: '#1e3a5f', marginBottom: 8, fontSize: 24, fontWeight: 700 }}>Settings</h2>
                
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 24, marginBottom: 16 }}>
                  <h3 style={{ color: '#1e3a5f', marginBottom: 16, fontWeight: 600 }}>Account Information</h3>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 4, color: '#475569', fontWeight: 500, fontSize: 14 }}>Name</label>
                    <input 
                      type="text" 
                      value={user?.name || user?.email || 'User'}
                      readOnly
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 14 }}
                    />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 4, color: '#475569', fontWeight: 500, fontSize: 14 }}>Email</label>
                    <input 
                      type="email" 
                      value={user?.email || ''}
                      readOnly
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 14 }}
                    />
                  </div>
                </div>

                <button 
                  onClick={() => {
                    logoutUser();
                    navigate('/login');
                  }}
                  style={{ 
                    background: '#dc2626', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: 8, 
                    padding: '10px 20px', 
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 14
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
