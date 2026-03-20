import { useEffect, useRef, useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';
import HomeTab from './HomeTab';
import CVPreview from '../../components/document/CVPreview';
import { generateDocumentAI } from '../../services/aiService';
import {
  createDocument,
  getDocuments,
  deleteDocument
} from '../../services/documentService';

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

const defaultFormState = {
cv: {
  name: '',
  phone: '',
  email1: '',
  email2: '',
  linkedin: '',
  title: '',
  location: '',
  skills: [],
  education: [],
  experience: [],
  summary: '',
  projects: [],
  certifications: [],
  references: 'Available upon request'
},
  cover_letter: {
    name: '',
    email: '',
    company: '',
    position: '',
    skills: '',
    experience: ''
  },
  business_proposal: {
    business: '',
    market: '',
    problem: '',
    solution: ''
  }
};

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
      ? content.education.map((edu) => {
          if (typeof edu === 'string') return edu;
          return [
            safe(edu.degree),
            safe(edu.institution || edu.school || edu.university),
            safe(edu.date || edu.year || edu.graduationDate)
          ]
            .filter(Boolean)
            .join(' - ');
        }).filter(Boolean)
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
  const [activeTab, setActiveTab] = useState('create');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [docType, setDocType] = useState('cv');
  const [formState, setFormState] = useState(defaultFormState);

  const [generatedText, setGeneratedText] = useState('');
  const [documents, setDocuments] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [docsLoading, setDocsLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const previewRef = useRef(null);

  const currentFields = formState[docType];

  const updateField = (field, value) => {
    setFormState((prev) => ({
      ...prev,
      [docType]: {
        ...prev[docType],
        [field]: value
      }
    }));
  };

  const handleGenerate = async () => {
    try {
      setAiLoading(true);

      const res = await generateDocumentAI(docType, currentFields);
      console.log('AI response:', res);

      if (docType === 'cv' && res.content) {
        const mappedCv = mapAICvToPreview(res.content);
        console.log('Mapped CV:', mappedCv);

        setFormState((prev) => ({
          ...prev,
          cv: mappedCv
        }));

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

  const handleSaveDraft = async () => {
    try {
      const titleMap = {
        cv: 'CV Draft',
        cover_letter: 'Cover Letter Draft',
        business_proposal: 'Business Proposal Draft'
      };

      const contentToSave =
        docType === 'cv'
          ? formState.cv
          : generatedText
          ? { generatedText }
          : currentFields;

      await createDocument({
        title: titleMap[docType],
        type: docType,
        content: contentToSave
      });

      alert('Draft saved successfully');
    } catch (error) {
      console.error('Save draft error:', error.response?.data || error.message);
      alert('Failed to save draft');
    }
  };

  const loadDocuments = async () => {
    try {
      setDocsLoading(true);
      const data = await getDocuments();
      console.log('Documents loaded:', data);
      setDocuments(data);
    } catch (error) {
      console.error('Load documents error:', error.response?.data || error.message);
      alert('Failed to load documents');
    } finally {
      setDocsLoading(false);
    }
  };

  const handleOpenDocument = (doc) => {
    const type = doc.type || 'cv';
    setDocType(type);

    if (type === 'cv') {
      setFormState((prev) => ({
        ...prev,
        cv: {
          ...defaultFormState.cv,
          ...doc.content
        }
      }));
      setGeneratedText('');
    } else if (doc.content?.generatedText) {
      setGeneratedText(doc.content.generatedText);
    } else {
      setGeneratedText('');
      setFormState((prev) => ({
        ...prev,
        [type]: {
          ...prev[type],
          ...doc.content
        }
      }));
    }

    setActiveTab('create');
  };

  const handleDeleteDocument = async (id) => {
    try {
      await deleteDocument(id);
      await loadDocuments();
    } catch (error) {
      console.error('Delete document error:', error.response?.data || error.message);
      alert('Failed to delete document');
    }
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

  useEffect(() => {
    if (activeTab === 'documents') {
      loadDocuments();
    }
  }, [activeTab]);

  useEffect(() => {
    setGeneratedText('');
  }, [docType]);

  const renderForm = () => {
    if (docType === 'cv') {
      return (
        <div style={styles.formGrid}>
          <input
            style={styles.input}
            placeholder="Full Name"
            value={currentFields.name || ''}
            onChange={(e) => updateField('name', e.target.value)}
          />

          <input
            style={styles.input}
            placeholder="Email"
            value={currentFields.email1 || ''}
            onChange={(e) => updateField('email1', e.target.value)}
          />

          <input
            style={styles.input}
            placeholder="Job Title"
            value={typeof currentFields.title === 'string' ? currentFields.title : ''}
            onChange={(e) => updateField('title', e.target.value)}
          />

          <input
            style={styles.input}
            placeholder="Location"
            value={typeof currentFields.location === 'string' ? currentFields.location : ''}
            onChange={(e) => updateField('location', e.target.value)}
          />

          <input
            style={styles.input}
            placeholder="Skills (comma separated)"
            value={
              Array.isArray(currentFields.skills)
                ? currentFields.skills.join(', ')
                : typeof currentFields.skills === 'string'
                ? currentFields.skills
                : ''
            }
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
            value={
              Array.isArray(currentFields.education)
                ? currentFields.education.join(', ')
                : typeof currentFields.education === 'string'
                ? currentFields.education
                : ''
            }
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
            value={typeof currentFields.summary === 'string' ? currentFields.summary : ''}
            onChange={(e) => updateField('summary', e.target.value)}
          />

          <textarea
            style={styles.textareaFull}
            placeholder="Experience"
            value={
              Array.isArray(currentFields.experience)
                ? currentFields.experience
                    .map((exp) =>
                      typeof exp === 'string'
                        ? exp
                        : `${exp.role || ''} at ${exp.company || ''}`.trim()
                    )
                    .join(', ')
                : typeof currentFields.experience === 'string'
                ? currentFields.experience
                : ''
            }
            onChange={(e) => updateField('experience', e.target.value)}
          />
        </div>
      );
    }

    if (docType === 'cover_letter') {
      return (
        <div style={styles.formGrid}>
          <input
            style={styles.input}
            placeholder="Full Name"
            value={currentFields.name || ''}
            onChange={(e) => updateField('name', e.target.value)}
          />
          <input
            style={styles.input}
            placeholder="Email"
            value={currentFields.email || ''}
            onChange={(e) => updateField('email', e.target.value)}
          />
          <input
            style={styles.input}
            placeholder="Company"
            value={currentFields.company || ''}
            onChange={(e) => updateField('company', e.target.value)}
          />
          <input
            style={styles.input}
            placeholder="Position"
            value={currentFields.position || ''}
            onChange={(e) => updateField('position', e.target.value)}
          />
          <textarea
            style={styles.textareaFull}
            placeholder="Skills"
            value={currentFields.skills || ''}
            onChange={(e) => updateField('skills', e.target.value)}
          />
          <textarea
            style={styles.textareaFull}
            placeholder="Experience"
            value={currentFields.experience || ''}
            onChange={(e) => updateField('experience', e.target.value)}
          />
        </div>
      );
    }

    return (
      <div style={styles.formGrid}>
        <input
          style={styles.input}
          placeholder="Business Name"
          value={currentFields.business || ''}
          onChange={(e) => updateField('business', e.target.value)}
        />
        <input
          style={styles.input}
          placeholder="Target Market"
          value={currentFields.market || ''}
          onChange={(e) => updateField('market', e.target.value)}
        />
        <textarea
          style={styles.textareaFull}
          placeholder="Problem Statement"
          value={currentFields.problem || ''}
          onChange={(e) => updateField('problem', e.target.value)}
        />
        <textarea
          style={styles.textareaFull}
          placeholder="Proposed Solution"
          value={currentFields.solution || ''}
          onChange={(e) => updateField('solution', e.target.value)}
        />
      </div>
    );
  };

  return (
    <div style={styles.page}>
      <Sidebar
        activeTab={activeTab}
        onNavigate={setActiveTab}
        isOpen={sidebarOpen}
        user={null}
      />

      <div style={styles.main}>
        <Navbar onToggleSidebar={() => setSidebarOpen((p) => !p)} />

        <div style={styles.content}>
          {activeTab === 'home' && (
            <HomeTab
              user={null}
              stats={null}
              documents={documents}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'create' && (
            <div style={styles.createWrap}>
              <div style={styles.headerBar}>
                <div>
                  <h2 style={styles.heading}>Create Document</h2>
                  <p style={styles.subtext}>Fill the form, generate with AI, preview, then save.</p>
                </div>

                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  style={styles.select}
                >
                  <option value="cv">CV</option>
                  <option value="cover_letter">Cover Letter</option>
                  <option value="business_proposal">Business Proposal</option>
                </select>
              </div>

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

              <div ref={previewRef} style={styles.previewBox}>
                <h3 style={styles.previewTitle}>Preview</h3>

                {docType === 'cv' ? (
                  <CVPreview
                    data={formState.cv}
                    onDataChange={(updated) =>
                      setFormState((prev) => ({
                        ...prev,
                        cv: updated
                      }))
                    }
                    theme="Modern"
                    fontSize="12 pt"
                    accentColor="#1e3a5f"
                    editMode={false}
                  />
                ) : generatedText ? (
                  <div style={styles.previewText}>{generatedText}</div>
                ) : (
                  <p style={styles.placeholder}>No document generated yet.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div style={styles.documentsWrap}>
              <h2 style={styles.heading}>My Documents</h2>

              {docsLoading ? (
                <p style={styles.subtext}>Loading documents...</p>
              ) : documents.length === 0 ? (
                <p style={styles.subtext}>No saved documents yet.</p>
              ) : (
                <div style={styles.docList}>
                  {documents.map((doc) => (
                    <div key={doc._id} style={styles.docCard}>
                      <div>
                        <h4 style={{ margin: 0, color: '#1e3a5f' }}>{doc.title}</h4>
                        <p style={{ margin: '6px 0 0', color: '#64748b' }}>{doc.type}</p>
                      </div>

                      <div style={styles.docActions}>
                        <button style={styles.smallBtn} onClick={() => handleOpenDocument(doc)}>
                          Open
                        </button>
                        <button style={styles.deleteBtn} onClick={() => handleDeleteDocument(doc._id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div style={styles.documentsWrap}>
              <h2 style={styles.heading}>Settings</h2>
              <p style={styles.subtext}>Account settings and preferences.</p>
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
  createWrap: {
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
    gap: 16
  },
  headerBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap'
  },
  heading: {
    margin: 0,
    color: '#1e3a5f'
  },
  subtext: {
    margin: '6px 0 0',
    color: '#64748b'
  },
  select: {
    padding: 10,
    borderRadius: 8,
    border: '1px solid #cbd5e1',
    minWidth: 220
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
    flexWrap: 'wrap'
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
  },
  deleteBtn: {
    background: '#dc2626',
    color: '#fff',
    border: 'none',
    padding: '8px 12px',
    borderRadius: 8,
    cursor: 'pointer'
  },
  smallBtn: {
    background: '#1e3a5f',
    color: '#fff',
    border: 'none',
    padding: '8px 12px',
    borderRadius: 8,
    cursor: 'pointer'
  },
  previewBox: {
    background: '#fff',
    borderRadius: 12,
    border: '1px solid #e2e8f0',
    padding: 20,
    minHeight: 350
  },
  previewTitle: {
    marginTop: 0,
    color: '#1e3a5f'
  },
  previewText: {
    whiteSpace: 'pre-wrap',
    lineHeight: 1.7,
    color: '#0f172a'
  },
  placeholder: {
    color: '#64748b'
  },
  documentsWrap: {
    padding: 24
  },
  docList: {
    display: 'grid',
    gap: 16,
    marginTop: 20
  },
  docCard: {
    background: '#fff',
    padding: 20,
    borderRadius: 12,
    border: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16
  },
  docActions: {
    display: 'flex',
    gap: 8
  }
};

export default DashboardPage;
