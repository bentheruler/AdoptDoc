import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';
import { useAuth } from '../../context/AuthContext';

import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';

import CustomizationPanel from '../../components/customization/CustomizationPanel';
import DocumentEditor from '../../components/document/DocumentEditor';
import DocumentPreview from '../../components/document/DocumentPreview';
import TemplateSelector from '../../components/template/TemplateSelector';

import CVPreview from '../../components/document/CVPreview';
import CoverLetterPreview from '../../components/document/CoverLetterPreview';
import ProposalPreview from '../../components/document/ProposalPreview';

import HomeTab from '../../pages/dashboard/HomeTab';

import { DEFAULT_CV, DEFAULT_COVER_LETTER, DEFAULT_PROPOSAL } from '../../constants';
import { generateDocumentAI } from '../../services/aiService';

async function loadPdfLibs() {
  const load = (src) =>
    new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = res;
      s.onerror = rej;
      document.head.appendChild(s);
    });

  if (!window.html2canvas) {
    await load('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
  }

  if (!window.jspdf) {
    await load('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
  }
}

const safe = (val) => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    return val.label || val.value || val.name || val.school || val.degree || '';
  }
  return String(val);
};

const mapAICvToPreview = (content) => {
  return {
    name: safe(content?.basics?.name),
    phone: safe(content?.basics?.phone),
    email1: safe(content?.basics?.email),
    email2: safe(content?.basics?.email2),
    linkedin: safe(content?.basics?.linkedin),
    title: safe(content?.basics?.title || content?.basics?.role || content?.basics?.headline),
    location: safe(
      content?.basics?.location ||
        content?.basics?.address ||
        content?.basics?.city
    ),
    summary: safe(content?.basics?.summary),

    skills: Array.isArray(content?.skills)
      ? content.skills.map((s) => safe(s)).filter(Boolean)
      : [],

    education: Array.isArray(content?.education)
      ? content.education
          .map((edu) => {
            if (typeof edu === 'string') return edu;
            return [
              safe(edu.degree),
              safe(edu.institution || edu.school || edu.university),
              safe(edu.date || edu.year || edu.graduationDate)
            ]
              .filter(Boolean)
              .join(' - ');
          })
          .filter(Boolean)
      : [],

    experience: Array.isArray(content?.work)
      ? content.work.map((job) => ({
          company: safe(job.company),
          period: safe(job.period || job.duration || job.dates),
          role: safe(job.role || job.position || job.jobTitle),
          bullets: Array.isArray(job.bullets)
            ? job.bullets.map((b) => safe(b)).filter(Boolean)
            : Array.isArray(job.achievements)
            ? job.achievements.map((a) => safe(a)).filter(Boolean)
            : job.description
            ? [safe(job.description)]
            : []
        }))
      : [],

    projects: Array.isArray(content?.projects)
      ? content.projects.map((p) => safe(p)).filter(Boolean)
      : [],

    certifications: Array.isArray(content?.certifications)
      ? content.certifications.map((c) => safe(c)).filter(Boolean)
      : [],

    references: safe(content?.references) || 'Available upon request'
  };
};

const DashboardPage = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  const previewRef = useRef(null);

  const [category, setCategory] = useState('CV');
  const [theme, setTheme] = useState('Modern');
  const [fontSize, setFontSize] = useState('12 pt');
  const [accentColor, setAccentColor] = useState('#1e3a5f');
  const [editMode, setEditMode] = useState(false);

  const [cvData, setCvData] = useState({
    ...DEFAULT_CV,
    phone: DEFAULT_CV.phone || '',
    linkedin: DEFAULT_CV.linkedin || '',
    education: DEFAULT_CV.education || [],
    projects: DEFAULT_CV.projects || [],
    certifications: DEFAULT_CV.certifications || [],
    references: DEFAULT_CV.references || 'Available upon request'
  });

  const [coverLetterData, setCoverLetterData] = useState(DEFAULT_COVER_LETTER);
  const [proposalData, setProposalData] = useState(DEFAULT_PROPOSAL);

  const [generatedText, setGeneratedText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [wordLoading, setWordLoading] = useState(false);

  const docType =
    category === 'CV'
      ? 'cv'
      : category === 'Cover Letter'
      ? 'cover_letter'
      : 'business_proposal';

  const currentFields =
    docType === 'cv'
      ? cvData
      : docType === 'cover_letter'
      ? coverLetterData
      : proposalData;

  const updateField = (field, value) => {
    if (docType === 'cv') {
      setCvData((prev) => ({ ...prev, [field]: value }));
    } else if (docType === 'cover_letter') {
      setCoverLetterData((prev) => ({ ...prev, [field]: value }));
    } else {
      setProposalData((prev) => ({ ...prev, [field]: value }));
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    if (activeTab === 'documents') {
      loadDocuments();
    }
  }, [activeTab]);

  useEffect(() => {
    setGeneratedText('');
  }, [category]);

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

  const handleGenerate = async () => {
    try {
      setAiLoading(true);

      const res = await generateDocumentAI(docType, currentFields);
      console.log('AI response:', res);

      if (docType === 'cv' && res.content) {
        const mappedCv = mapAICvToPreview(res.content);
        console.log('Mapped CV:', mappedCv);
        setCvData((prev) => ({ ...prev, ...mappedCv }));
        setGeneratedText('');
      } else {
        const generated =
          res.document ||
          res.generatedText ||
          res.message ||
          '';
        setGeneratedText(generated);
      }
    } catch (error) {
      console.error('AI generation error:', error.response?.data || error.message);
      alert(error.response?.data?.error || 'AI generation failed');
    } finally {
      setAiLoading(false);
    }
  };

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
      type: category.toLowerCase().replace(' ', '_'),
      title: `${category} - ${new Date().toLocaleDateString()}`
    };

    const existing = JSON.parse(localStorage.getItem('adaptdoc_documents') || '[]');
    const updated = [draft, ...existing];
    localStorage.setItem('adaptdoc_documents', JSON.stringify(updated));
    setDocuments(updated);

    alert(`${category} draft saved successfully!`);
  };

  const handleDeleteDocument = (id) => {
    const updated = documents.filter((d) => d.id !== id);
    localStorage.setItem('adaptdoc_documents', JSON.stringify(updated));
    setDocuments(updated);
  };

  const handleOpenDocument = (doc) => {
    if (doc.category) {
      setCategory(doc.category);
    }

    if (doc.cvData) setCvData(doc.cvData);
    if (doc.coverLetterData) setCoverLetterData(doc.coverLetterData);
    if (doc.proposalData) setProposalData(doc.proposalData);

    setActiveTab('create');
  };

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;

    try {
      setPdfLoading(true);
      await loadPdfLibs();

      const canvas = await window.html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, pageWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, pageWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${docType}_document.pdf`);
    } catch (error) {
      console.error(error);
      alert('PDF export failed');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDownloadWord = async () => {
    try {
      setWordLoading(true);

      const ac = accentColor.replace('#', '');
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: cvData.name || '', bold: true, size: 36, color: '1e3a5f' })],
                spacing: { after: 80 }
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: cvData.title || '', size: 22, color: '555555' })],
                spacing: { after: 60 }
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `${cvData.location || ''} | ${cvData.email1 || ''} | ${cvData.phone || ''}`,
                    size: 18,
                    color: '777777'
                  })
                ],
                spacing: { after: 200 }
              }),
              new Paragraph({
                border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '1e3a5f' } },
                spacing: { after: 160 }
              }),
              new Paragraph({
                children: [new TextRun({ text: 'SUMMARY', bold: true, size: 22, color: '1e3a5f' })],
                spacing: { after: 80 }
              }),
              new Paragraph({
                children: [new TextRun({ text: cvData.summary || '', size: 20, color: '333333' })],
                spacing: { after: 200 }
              })
            ]
          }
        ]
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${(cvData.name || 'document').replace(/\s+/g, '_')}_CV.docx`);
    } catch (error) {
      console.error(error);
      alert('Word export failed');
    } finally {
      setWordLoading(false);
    }
  };

  const renderForm = () => {
    if (docType === 'cv') {
      return (
        <div style={styles.formGrid}>
          <input style={styles.input} placeholder="Full Name" value={cvData.name || ''} onChange={(e) => updateField('name', e.target.value)} />
          <input style={styles.input} placeholder="Phone" value={cvData.phone || ''} onChange={(e) => updateField('phone', e.target.value)} />
          <input style={styles.input} placeholder="Email" value={cvData.email1 || ''} onChange={(e) => updateField('email1', e.target.value)} />
          <input style={styles.input} placeholder="LinkedIn" value={cvData.linkedin || ''} onChange={(e) => updateField('linkedin', e.target.value)} />
          <input style={styles.input} placeholder="Job Title" value={typeof cvData.title === 'string' ? cvData.title : ''} onChange={(e) => updateField('title', e.target.value)} />
          <input style={styles.input} placeholder="Location" value={typeof cvData.location === 'string' ? cvData.location : ''} onChange={(e) => updateField('location', e.target.value)} />

          <input
            style={styles.input}
            placeholder="Skills (comma separated)"
            value={Array.isArray(cvData.skills) ? cvData.skills.join(', ') : ''}
            onChange={(e) =>
              updateField(
                'skills',
                e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
              )
            }
          />

          <input
            style={styles.input}
            placeholder="Education (comma separated)"
            value={Array.isArray(cvData.education) ? cvData.education.join(', ') : ''}
            onChange={(e) =>
              updateField(
                'education',
                e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
              )
            }
          />

          <textarea
            style={styles.textareaFull}
            placeholder="Professional Summary"
            value={typeof cvData.summary === 'string' ? cvData.summary : ''}
            onChange={(e) => updateField('summary', e.target.value)}
          />

          <textarea
            style={styles.textareaFull}
            placeholder="Experience"
            value={
              Array.isArray(cvData.experience)
                ? cvData.experience
                    .map((exp) =>
                      typeof exp === 'string'
                        ? exp
                        : `${exp.role || ''} at ${exp.company || ''}`.trim()
                    )
                    .join(', ')
                : ''
            }
            onChange={(e) =>
              updateField('experience', [
                {
                  company: '',
                  period: '',
                  role: e.target.value,
                  bullets: []
                }
              ])
            }
          />
        </div>
      );
    }

    if (docType === 'cover_letter') {
      return (
        <div style={styles.formGrid}>
          <input style={styles.input} placeholder="Full Name" value={coverLetterData.name || ''} onChange={(e) => updateField('name', e.target.value)} />
          <input style={styles.input} placeholder="Email" value={coverLetterData.email || ''} onChange={(e) => updateField('email', e.target.value)} />
          <input style={styles.input} placeholder="Company" value={coverLetterData.company || ''} onChange={(e) => updateField('company', e.target.value)} />
          <input style={styles.input} placeholder="Position" value={coverLetterData.position || ''} onChange={(e) => updateField('position', e.target.value)} />
          <textarea style={styles.textareaFull} placeholder="Skills" value={coverLetterData.skills || ''} onChange={(e) => updateField('skills', e.target.value)} />
          <textarea style={styles.textareaFull} placeholder="Experience" value={coverLetterData.experience || ''} onChange={(e) => updateField('experience', e.target.value)} />
        </div>
      );
    }

    return (
      <div style={styles.formGrid}>
        <input style={styles.input} placeholder="Business Name" value={proposalData.business || ''} onChange={(e) => updateField('business', e.target.value)} />
        <input style={styles.input} placeholder="Target Market" value={proposalData.market || ''} onChange={(e) => updateField('market', e.target.value)} />
        <textarea style={styles.textareaFull} placeholder="Problem Statement" value={proposalData.problem || ''} onChange={(e) => updateField('problem', e.target.value)} />
        <textarea style={styles.textareaFull} placeholder="Proposed Solution" value={proposalData.solution || ''} onChange={(e) => updateField('solution', e.target.value)} />
      </div>
    );
  };

  const renderPreview = () => {
    if (category === 'Cover Letter') {
      return (
        <CoverLetterPreview
          data={coverLetterData}
          onDataChange={setCoverLetterData}
          theme={theme}
          fontSize={fontSize}
          accentColor={accentColor}
          editMode={editMode}
        />
      );
    }

    if (category === 'Proposal') {
      return (
        <ProposalPreview
          data={proposalData}
          onDataChange={setProposalData}
          theme={theme}
          fontSize={fontSize}
          accentColor={accentColor}
          editMode={editMode}
        />
      );
    }

    return (
      <CVPreview
        data={cvData}
        onDataChange={setCvData}
        theme={theme}
        fontSize={fontSize}
        accentColor={accentColor}
        editMode={editMode}
      />
    );
  };

  return (
    <div style={styles.page}>
      <Sidebar
        activeTab={activeTab}
        onNavigate={setActiveTab}
        isOpen={sidebarOpen}
        user={user}
        onLogout={logoutUser}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Navbar onToggleSidebar={() => setSidebarOpen((p) => !p)} user={user} onLogout={logoutUser} />

        <div style={styles.content}>
          {activeTab === 'home' && (
            <HomeTab
              user={user}
              documents={documents}
              onNavigate={setActiveTab}
              loadingDocuments={loadingDocuments}
            />
          )}

          {activeTab === 'create' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
              <DocumentEditor
                category={category}
                onCategoryChange={setCategory}
                editMode={editMode}
                onToggleEditMode={() => setEditMode((p) => !p)}
                onSaveDraft={handleSaveDraft}
              />

              {renderForm()}

              <div style={styles.buttonRow}>
                <button style={styles.primaryBtn} onClick={handleGenerate} disabled={aiLoading}>
                  {aiLoading ? 'Generating...' : 'Generate with AI'}
                </button>

                <button style={styles.secondaryBtn} onClick={handleSaveDraft}>
                  Save Draft
                </button>

                <button style={styles.secondaryBtn} onClick={handleDownloadPDF} disabled={pdfLoading}>
                  {pdfLoading ? 'Exporting...' : 'Download PDF'}
                </button>
              </div>

              <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
                <CustomizationPanel cvData={cvData} onCVUpdate={setCvData} />

                <DocumentPreview
                  ref={previewRef}
                  editMode={editMode}
                  onToggleEditMode={() => setEditMode((p) => !p)}
                >
                  {renderPreview()}
                </DocumentPreview>

                <TemplateSelector
                  theme={theme}
                  onThemeChange={setTheme}
                  fontSize={fontSize}
                  onFontSizeChange={setFontSize}
                  accentColor={accentColor}
                  onAccentChange={setAccentColor}
                  onDownloadPDF={handleDownloadPDF}
                  pdfLoading={pdfLoading}
                  onDownloadWord={handleDownloadWord}
                  wordLoading={wordLoading}
                  thumbnail={renderPreview()}
                />
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div style={{ padding: 40, overflow: 'auto', flex: 1 }}>
              <div style={{ maxWidth: 1200 }}>
                <h2 style={{ color: '#1e3a5f', marginBottom: 8, fontSize: 24, fontWeight: 700 }}>My Documents</h2>
                <p style={{ color: '#64748b', marginBottom: 28 }}>Manage all your saved documents</p>

                {loadingDocuments && <p style={{ color: '#94a3b8' }}>Loading documents...</p>}

                {!loadingDocuments && documents.length === 0 && (
                  <div
                    style={{
                      background: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: 12,
                      padding: 40,
                      textAlign: 'center',
                      color: '#64748b'
                    }}
                  >
                    <p>
                      No documents yet.
                      <button
                        onClick={() => setActiveTab('create')}
                        style={{ background: 'none', border: 'none', color: '#1e3a5f', fontWeight: 600, cursor: 'pointer' }}
                      >
                        {' '}Create one to get started →
                      </button>
                    </p>
                  </div>
                )}

                {!loadingDocuments && documents.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        style={{
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
                        onClick={() => handleOpenDocument(doc)}
                        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 12px #0004')}
                        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 1px 3px #0001')}
                      >
                        <div>
                          <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 14, marginBottom: 4 }}>{doc.title}</div>
                          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>Type: {doc.type}</div>
                          <div style={{ fontSize: 12, color: '#94a3b8' }}>Saved: {doc.savedAt}</div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDocument(doc.id);
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

const styles = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: "'Segoe UI',system-ui,sans-serif",
    background: '#f1f5f9'
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto'
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 12,
    background: '#fff',
    padding: 16,
    borderRadius: 12,
    border: '1px solid #e2e8f0'
  },
  input: {
    padding: 10,
    border: '1px solid #cbd5e1',
    borderRadius: 8
  },
  textareaFull: {
    gridColumn: '1 / -1',
    padding: 10,
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    minHeight: 90
  },
  buttonRow: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
    padding: '12px 24px',
    background: '#fff',
    borderBottom: '1px solid #e2e8f0'
  },
  primaryBtn: {
    background: '#1e3a5f',
    color: '#fff',
    border: 'none',
    padding: '10px 16px',
    borderRadius: 8,
    cursor: 'pointer'
  },
  secondaryBtn: {
    background: '#e2e8f0',
    color: '#0f172a',
    border: 'none',
    padding: '10px 16px',
    borderRadius: 8,
    cursor: 'pointer'
  }
};

export default DashboardPage;