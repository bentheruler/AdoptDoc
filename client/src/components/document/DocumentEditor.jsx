// client/src/components/document/DocumentEditor.jsx
// Component for editing document content.
// DocumentEditor.jsx
// client/src/components/document/DocumentEditor.jsx
// Owners: Gabriel Maina (S13/07828/22) · Michael Ochieng (S17/03120/23)
//
// Deliverables covered:
//  ✓ Document input form
//  ✓ Generate button → AI result display
//  ✓ Edit functionality + auto-save
//  ✓ PDF export
//  ✓ DOCX export
//  ✓ Markdown export

import { useState, useRef, useCallback, useEffect } from "react";
import { useDocument } from "../../hooks/useDocument";
import { useExport }   from "../../hooks/useExport";
import { DocType, Tone, DocLength, ExportFormat, SaveStatus } from "../../types/document.types";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const LENGTH_HINT = {
  [DocLength.Short]:  "~300 words",
  [DocLength.Medium]: "~600 words",
  [DocLength.Long]:   "~1000 words",
};

const TABS = [
  { id: "editor",  label: "Editor"  },
  { id: "preview", label: "Preview" },
  { id: "api-ref", label: "API Ref" },
];

const FORMAT_ACTIONS = [
  { key: "bold",    label: "B", title: "Bold",        prefix: "**", suffix: "**" },
  { key: "italic",  label: "I", title: "Italic",      prefix: "_",  suffix: "_"  },
  { key: "heading", label: "H", title: "Heading",     prefix: "## ", suffix: ""  },
  { key: "bullet",  label: "•", title: "Bullet list", prefix: "• ", suffix: ""  },
  { key: "quote",   label: '"', title: "Block quote",  prefix: "> ", suffix: ""  },
];

const API_ENDPOINTS = [
  { method: "POST",   color: "#a5b4fc", path: "/api/auth/login",           body: "{ email, password }",                        resp: "{ token, user }"              },
  { method: "POST",   color: "#a5b4fc", path: "/api/documents/generate",   body: "{ topic, docType, tones, length, context }", resp: "{ documentId, title, content }"},
  { method: "GET",    color: "#2dd4bf", path: "/api/documents/:id",        body: null,                                          resp: "Document object"              },
  { method: "PUT",    color: "#fbbf24", path: "/api/documents/:id",        body: "{ title, content }",                         resp: "{ ok, updatedAt }"            },
  { method: "DELETE", color: "#f87171", path: "/api/documents/:id",        body: null,                                          resp: "{ ok }"                       },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const wordCount = (text) => (text.trim() ? text.trim().split(/\s+/).length : 0);

const formatTime = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

// Applies markdown wrapping to selected text in a textarea
const wrapSelection = (textarea, content, prefix, suffix) => {
  const { selectionStart: s, selectionEnd: e } = textarea;
  const selected = content.slice(s, e);
  if (!selected) return null;

  // For line-based actions (bullet, quote) wrap every line
  if (!suffix) {
    const wrapped = selected.split("\n").map((l) => `${prefix}${l}`).join("\n");
    return content.slice(0, s) + wrapped + content.slice(e);
  }

  return content.slice(0, s) + prefix + selected + suffix + content.slice(e);
};

// ─────────────────────────────────────────────────────────────────────────────
// Small presentational components
// ─────────────────────────────────────────────────────────────────────────────

function Toast({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 999, display: "flex", flexDirection: "column", gap: 8 }}>
      {toasts.map((t) => (
        <div key={t.id} style={{
          padding: "11px 18px", borderRadius: 10, fontSize: 13, fontWeight: 500,
          display: "flex", alignItems: "center", gap: 9,
          fontFamily: "'Outfit', sans-serif",
          boxShadow: "0 8px 32px rgba(0,0,0,.5)",
          background: t.type === "success" ? "rgba(20,184,166,.14)" : t.type === "error" ? "rgba(239,68,68,.12)" : "rgba(99,102,241,.14)",
          border:     t.type === "success" ? "1px solid rgba(20,184,166,.3)"  : t.type === "error" ? "1px solid rgba(239,68,68,.25)"  : "1px solid rgba(99,102,241,.3)",
          color:      t.type === "success" ? "#2dd4bf" : t.type === "error"  ? "#f87171" : "#a5b4fc",
        }}>
          <span>{t.icon}</span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      <label style={{
        fontSize: 10, fontWeight: 700, color: "#334155",
        textTransform: "uppercase", letterSpacing: 1.1, fontFamily: "monospace",
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Chip({ label, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 500,
        cursor: "pointer", transition: "all .15s", fontFamily: "'Outfit', sans-serif",
        border:     selected ? "1px solid #6366f1"        : "1px solid #1e2a3a",
        background: selected ? "rgba(99,102,241,.18)"     : "transparent",
        color:      selected ? "#a5b4fc"                  : "#475569",
      }}
    >
      {label}
    </button>
  );
}

function ExportButton({ label, icon, onClick, hoverColor }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "5px 13px", borderRadius: 7, cursor: "pointer",
        fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 600,
        display: "flex", alignItems: "center", gap: 6, transition: "all .17s",
        border:     hovered ? `1px solid ${hoverColor}` : "1px solid #1e2a3a",
        background: hovered ? `${hoverColor}18`         : "transparent",
        color:      hovered ? hoverColor                : "#475569",
      }}
    >
      <span style={{ fontSize: 13 }}>{icon}</span>
      {label}
    </button>
  );
}

function Spinner({ size = 16, color = "#fff" }) {
  return (
    <span style={{
      display: "inline-block",
      width: size, height: size,
      border: `2px solid ${color}30`,
      borderTopColor: color,
      borderRadius: "50%",
      animation: "de-spin .7s linear infinite",
      flexShrink: 0,
    }} />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab panels
// ─────────────────────────────────────────────────────────────────────────────

function EditorCanvas({ doc, isGenerating, saveStatus, wc, contentRef, onTitleChange, onContentChange }) {
  if (!doc && !isGenerating) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 460, gap: 16, padding: 48, textAlign: "center" }}>
        <div style={{ fontSize: 44, opacity: .12 }}>✦</div>
        <div style={{ fontFamily: "'Lora', serif", fontSize: 22, color: "#334155" }}>Your document will appear here</div>
        <div style={{ fontSize: 13, color: "#1e2a3a", lineHeight: 1.7, maxWidth: 280 }}>
          Configure the form on the left, then click Generate.
        </div>
        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8, width: "100%", maxWidth: 300 }}>
          {["Enter your topic", "Choose type & tone", "Click Generate", "Edit & export"].map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, background: "#0a0d14", border: "1px solid #141c28", borderRadius: 8, padding: "9px 14px" }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                {i + 1}
              </div>
              <span style={{ fontSize: 12.5, color: "#475569" }}>{step}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Generating overlay */}
      {isGenerating && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(6,8,16,.87)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, backdropFilter: "blur(4px)", borderRadius: 14, zIndex: 5 }}>
          <div style={{ width: 40, height: 40, border: "3px solid rgba(99,102,241,.2)", borderTopColor: "#6366f1", borderRadius: "50%", animation: "de-spin .85s linear infinite" }} />
          <p style={{ fontFamily: "monospace", fontSize: 13, color: "#64748b" }}>AI is writing your document…</p>
          <span style={{ fontFamily: "monospace", fontSize: 11, color: "#334155" }}>{wc} words so far</span>
        </div>
      )}

      {/* Doc header */}
      {doc && (
        <>
          <div style={{ padding: "30px 42px 22px", borderBottom: "1px solid #141c28" }}>
            {/* Type tag */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 10.5, fontWeight: 700, fontFamily: "monospace", letterSpacing: 1, color: "#a5b4fc", textTransform: "uppercase", marginBottom: 14 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366f1" }} />
              {doc.docType} · AI Generated
            </div>

            {/* Editable title */}
            <textarea
              style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontFamily: "'Lora', serif", fontSize: 27, color: "#e2e8f0", lineHeight: 1.28, resize: "none", overflow: "hidden" }}
              value={doc.title}
              rows={1}
              placeholder="Document title…"
              onChange={(e) => onTitleChange(e.target.value)}
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height = e.target.scrollHeight + "px";
              }}
            />

            {/* Meta row */}
            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 18, fontSize: 11.5, color: "#1e2a3a", fontFamily: "monospace", flexWrap: "wrap" }}>
              <span>📄 {doc.docType}</span>
              <span>🕐 {formatTime()}</span>
              <span>📝 {wc} words</span>
              <span style={{
                marginLeft: "auto",
                color: saveStatus === SaveStatus.Saved ? "#2dd4bf"
                     : saveStatus === SaveStatus.Error ? "#f87171"
                     : "#475569",
              }}>
                {saveStatus}
              </span>
            </div>
          </div>

          {/* Editable body */}
          <div style={{ padding: "26px 42px 48px" }}>
            <textarea
              ref={contentRef}
              style={{ width: "100%", minHeight: 340, background: "transparent", border: "none", outline: "none", color: "#94a3b8", fontFamily: "'Outfit', sans-serif", fontSize: 15, lineHeight: 1.85, resize: "none" }}
              value={doc.content}
              placeholder="Generated content will appear here…"
              onChange={(e) => onContentChange(e.target.value)}
            />
          </div>
        </>
      )}
    </>
  );
}

function PreviewPanel({ doc, wc }) {
  if (!doc) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 360, gap: 12, color: "#1e2a3a", textAlign: "center" }}>
        <div style={{ fontSize: 40, opacity: .12 }}>👁</div>
        <div style={{ fontFamily: "'Lora', serif", fontSize: 20, color: "#2d3a4a" }}>Nothing to preview yet</div>
        <div style={{ fontSize: 13, color: "#1e2a3a" }}>Generate a document first.</div>
      </div>
    );
  }

  return (
    <>
      <div style={{ fontFamily: "'Lora', serif", fontSize: 28, color: "#e2e8f0", marginBottom: 12, lineHeight: 1.25 }}>
        {doc.title}
      </div>
      <div style={{ fontFamily: "monospace", fontSize: 11, color: "#1e2a3a", marginBottom: 28, letterSpacing: .5 }}>
        {doc.docType.toUpperCase()} · {wc} words · {formatTime()}
      </div>
      {doc.content.split("\n\n").map((para, i) => (
        <p key={i} style={{ marginBottom: 18, fontSize: 15, lineHeight: 1.85, color: "#94a3b8", whiteSpace: "pre-wrap" }}>
          {para}
        </p>
      ))}
    </>
  );
}

function ApiRefPanel() {
  return (
    <>
      <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 2.2, color: "#4f46e5", marginBottom: 22, textTransform: "uppercase", fontFamily: "monospace" }}>
        API Reference — src/api/document.service.js
      </div>

      {API_ENDPOINTS.map((ep, i) => (
        <div key={i} style={{ marginBottom: 12, background: "#080c12", borderRadius: 8, padding: "13px 16px", border: "1px solid #141c28" }}>
          <div style={{ display: "flex", gap: 9, alignItems: "center", marginBottom: ep.body ? 5 : 0 }}>
            <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 9.5, fontWeight: 700, background: `${ep.color}18`, color: ep.color }}>
              {ep.method}
            </span>
            <span style={{ fontFamily: "monospace", fontSize: 12.5, color: "#94a3b8" }}>{ep.path}</span>
          </div>
          {ep.body && (
            <div style={{ fontSize: 11, color: "#334155", fontFamily: "monospace" }}>
              body: <span style={{ color: "#7dd3fc" }}>{ep.body}</span>
            </div>
          )}
          <div style={{ fontSize: 11, color: "#334155", fontFamily: "monospace", marginTop: 2 }}>
            returns: <span style={{ color: "#6ee7b7" }}>{ep.resp}</span>
          </div>
        </div>
      ))}

      {/* Axios setup snippet */}
      <div style={{ marginTop: 10, background: "rgba(99,102,241,.07)", border: "1px solid rgba(99,102,241,.2)", borderRadius: 8, padding: "16px 18px" }}>
        <div style={{ color: "#a5b4fc", marginBottom: 10, fontWeight: 700, fontSize: 9.5, letterSpacing: 1.3, textTransform: "uppercase", fontFamily: "monospace" }}>
          Axios — JWT auto-attached on every request
        </div>
        <pre style={{ fontSize: 11.5, color: "#475569", lineHeight: 2, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>{`const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = \`Bearer \${token}\`;
  return cfg;
});`}</pre>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function DocumentEditor() {
  const {
    document: doc,
    config,
    isGenerating,
    saveStatus,
    toasts,
    setTitle,
    setContent,
    patchConfig,
    generate,
    addToast,
  } = useDocument();

  const { exportAs } = useExport();

  const [activeTab, setActiveTab] = useState("editor");
  const contentRef = useRef(null);

  // ── Config helpers ────────────────────────────────────────────────────────

  const toggleTone = (tone) => {
    const next = config.tones.includes(tone)
      ? config.tones.filter((t) => t !== tone)
      : [...config.tones, tone];
    patchConfig({ tones: next });
  };

  // ── Toolbar formatting ────────────────────────────────────────────────────

  const applyFormat = useCallback((action) => {
    const ta = contentRef.current;
    if (!ta || !doc) return;

    const found = FORMAT_ACTIONS.find((f) => f.key === action);
    if (!found) return;

    const result = wrapSelection(ta, doc.content, found.prefix, found.suffix);
    if (result) setContent(result);
  }, [doc, setContent]);

  // ── Export ────────────────────────────────────────────────────────────────

  const handleExport = (format) => {
    if (!doc) {
      addToast("Generate a document first", "error", "✕");
      return;
    }
    exportAs(format, doc);
    const labels = {
      [ExportFormat.PDF]:      "PDF ready to print / save",
      [ExportFormat.DOCX]:     "DOCX downloaded",
      [ExportFormat.Markdown]: "Markdown downloaded",
    };
    addToast(labels[format] || "Exported", "success", "⬇");
  };

  const wc = doc ? wordCount(doc.content) : 0;

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Global keyframe animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Outfit:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes de-spin  { to { transform: rotate(360deg); } }
        @keyframes de-pulse { 0%,100% { opacity: 1 } 50% { opacity: .2 } }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e2a3a; border-radius: 3px; }
      `}</style>

      <div style={{ display: "grid", gridTemplateRows: "54px 1fr", height: "100vh", overflow: "hidden", background: "#060810", fontFamily: "'Outfit', sans-serif" }}>

        {/* ════ TOP NAV ════ */}
        <nav style={{ background: "#0a0d14", borderBottom: "1px solid #141c28", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", gap: 12 }}>

          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4f46e5" }} />
            <span style={{ fontFamily: "'Lora', serif", fontSize: 18, letterSpacing: -0.3, color: "#e2e8f0" }}>
              AdoptDoc
            </span>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 2 }}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "6px 14px", borderRadius: 6, fontSize: 13, fontWeight: 500,
                  cursor: "pointer", border: "none", transition: "all .17s",
                  fontFamily: "'Outfit', sans-serif",
                  background: activeTab === tab.id ? "#141c28" : "transparent",
                  color:      activeTab === tab.id ? "#e2e8f0" : "#475569",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Badges */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: "monospace", background: "rgba(99,102,241,.13)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,.28)" }}>
              Editor &amp; Export
            </span>
            <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: "monospace", background: "rgba(20,184,166,.1)", color: "#2dd4bf", border: "1px solid rgba(20,184,166,.25)" }}>
              ● Live
            </span>
          </div>
        </nav>

        {/* ════ WORKSPACE ════ */}
        <div style={{ display: "grid", gridTemplateColumns: "310px 1fr", overflow: "hidden" }}>

          {/* ── LEFT: FORM PANEL ── */}
          <aside style={{ background: "#0a0d14", borderRight: "1px solid #141c28", display: "flex", flexDirection: "column", overflow: "hidden" }}>

            {/* Panel header */}
            <div style={{ padding: "16px 20px 13px", borderBottom: "1px solid #141c28", flexShrink: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.4, color: "#334155", textTransform: "uppercase", fontFamily: "monospace" }}>
                Document Config
              </div>
              <div style={{ fontSize: 11.5, color: "#1e2a3a", marginTop: 3, fontFamily: "monospace" }}>
                POST /api/documents/generate
              </div>
            </div>

            {/* Form fields */}
            <div style={{ flex: 1, overflowY: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Topic */}
              <Field label="Topic / Subject">
                <input
                  type="text"
                  placeholder="e.g. Renewable energy in East Africa"
                  value={config.topic}
                  onChange={(e) => patchConfig({ topic: e.target.value })}
                  onKeyDown={(e) => { if (e.key === "Enter" && !isGenerating) generate(); }}
                  style={{ background: "#060810", border: "1px solid #1e2a3a", borderRadius: 8, padding: "9px 12px", color: "#e2e8f0", fontFamily: "'Outfit', sans-serif", fontSize: 13.5, outline: "none", width: "100%" }}
                />
              </Field>

              {/* Document Type */}
              <Field label="Document Type">
                <select
                  value={config.docType}
                  onChange={(e) => patchConfig({ docType: e.target.value })}
                  style={{ background: "#060810", border: "1px solid #1e2a3a", borderRadius: 8, padding: "9px 12px", color: "#e2e8f0", fontFamily: "'Outfit', sans-serif", fontSize: 13.5, outline: "none", width: "100%", cursor: "pointer" }}
                >
                  {Object.entries(DocType).map(([label, value]) => (
                    <option key={value} value={value} style={{ background: "#0a0d14" }}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>

              {/* Tone */}
              <Field label="Tone (multi-select)">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {Object.values(Tone).map((t) => (
                    <Chip key={t} label={t} selected={config.tones.includes(t)} onClick={() => toggleTone(t)} />
                  ))}
                </div>
              </Field>

              {/* Length */}
              <Field label={`Length — ${LENGTH_HINT[config.length]}`}>
                <div style={{ display: "flex", gap: 6 }}>
                  {Object.values(DocLength).map((l) => (
                    <Chip key={l} label={l} selected={config.length === l} onClick={() => patchConfig({ length: l })} />
                  ))}
                </div>
              </Field>

              {/* Context */}
              <Field label="Extra Context (optional)">
                <textarea
                  placeholder="Key points, audience, structure preferences…"
                  value={config.context}
                  onChange={(e) => patchConfig({ context: e.target.value })}
                  style={{ background: "#060810", border: "1px solid #1e2a3a", borderRadius: 8, padding: "9px 12px", color: "#e2e8f0", fontFamily: "'Outfit', sans-serif", fontSize: 13.5, outline: "none", width: "100%", minHeight: 80, resize: "vertical", lineHeight: 1.65 }}
                />
              </Field>

              {/* API hint box */}
              <div style={{ background: "rgba(99,102,241,.07)", border: "1px solid rgba(99,102,241,.18)", borderRadius: 8, padding: "10px 13px", fontSize: 11.5, fontFamily: "monospace", lineHeight: 2 }}>
                <span style={{ color: "#6366f1" }}>POST</span>{" "}
                <span style={{ color: "#64748b" }}>/api/documents/generate</span><br />
                <span style={{ color: "#1e2a3a" }}>{"{ topic, docType, tones, length, context }"}</span><br />
                <span style={{ color: "#6366f1" }}>auth:</span>{" "}
                <span style={{ color: "#334155" }}>Bearer JWT</span>
              </div>
            </div>

            {/* Generate button */}
            <div style={{ padding: "14px 18px", borderTop: "1px solid #141c28", flexShrink: 0 }}>
              <button
                onClick={generate}
                disabled={isGenerating}
                style={{
                  width: "100%", padding: "13px 20px", borderRadius: 10, border: "none",
                  background: isGenerating ? "#3730a3" : "#4f46e5",
                  color: "#fff", cursor: isGenerating ? "not-allowed" : "pointer",
                  fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600,
                  letterSpacing: 0.3, transition: "all .2s",
                  opacity: isGenerating ? 0.75 : 1,
                  boxShadow: isGenerating ? "none" : "0 4px 20px rgba(79,70,229,.4)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
                }}
              >
                {isGenerating
                  ? <><Spinner /> Generating…</>
                  : doc
                  ? "↺  Regenerate Document"
                  : "✦  Generate Document"
                }
              </button>
            </div>
          </aside>

          {/* ── RIGHT: EDITOR PANEL ── */}
          <main style={{ display: "flex", flexDirection: "column", overflow: "hidden", background: "#060810" }}>

            {/* Toolbar */}
            <div style={{ background: "#0a0d14", borderBottom: "1px solid #141c28", padding: "7px 16px", display: "flex", alignItems: "center", gap: 5, flexShrink: 0, flexWrap: "wrap" }}>

              {/* Format buttons */}
              {FORMAT_ACTIONS.map(({ key, label, title }) => (
                <button
                  key={key}
                  title={title}
                  onClick={() => applyFormat(key)}
                  style={{ width: 32, height: 32, borderRadius: 6, border: "none", background: "transparent", color: "#475569", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}
                >
                  {label}
                </button>
              ))}

              <div style={{ width: 1, height: 20, background: "#1e2a3a", margin: "0 6px" }} />

              {wc > 0 && (
                <span style={{ fontSize: 11, color: "#334155", fontFamily: "monospace" }}>
                  {wc} words
                </span>
              )}

              <div style={{ flex: 1 }} />

              {/* Export buttons */}
              <ExportButton label="Markdown" icon="MD" hoverColor="#2dd4bf" onClick={() => handleExport(ExportFormat.Markdown)} />
              <ExportButton label="DOCX"     icon="W"  hoverColor="#38bdf8" onClick={() => handleExport(ExportFormat.DOCX)}     />
              <ExportButton label="PDF"      icon="↓"  hoverColor="#f87171" onClick={() => handleExport(ExportFormat.PDF)}      />
            </div>

            {/* Canvas */}
            <div style={{ flex: 1, overflowY: "auto", padding: "32px 28px" }}>

              {/* Editor tab */}
              {activeTab === "editor" && (
                <div style={{ maxWidth: 720, margin: "0 auto" }}>
                  <div style={{ background: "#0a0d14", border: "1px solid #141c28", borderRadius: 14, minHeight: 520, boxShadow: "0 4px 48px rgba(0,0,0,.5)", position: "relative", overflow: "hidden" }}>
                    <EditorCanvas
                      doc={doc}
                      isGenerating={isGenerating}
                      saveStatus={saveStatus}
                      wc={wc}
                      contentRef={contentRef}
                      onTitleChange={setTitle}
                      onContentChange={setContent}
                    />
                  </div>
                </div>
              )}

              {/* Preview tab */}
              {activeTab === "preview" && (
                <div style={{ maxWidth: 720, margin: "0 auto" }}>
                  <div style={{ background: "#0a0d14", border: "1px solid #141c28", borderRadius: 14, padding: "38px 46px", minHeight: 460, boxShadow: "0 4px 48px rgba(0,0,0,.5)" }}>
                    <PreviewPanel doc={doc} wc={wc} />
                  </div>
                </div>
              )}

              {/* API ref tab */}
              {activeTab === "api-ref" && (
                <div style={{ maxWidth: 720, margin: "0 auto" }}>
                  <div style={{ background: "#0a0d14", border: "1px solid #141c28", borderRadius: 14, padding: "30px 38px", boxShadow: "0 4px 48px rgba(0,0,0,.5)" }}>
                    <ApiRefPanel />
                  </div>
                </div>
              )}
            </div>

            {/* Status bar */}
            <div style={{ background: "#0a0d14", borderTop: "1px solid #141c28", padding: "5px 18px", display: "flex", alignItems: "center", gap: 10, fontSize: 11, fontFamily: "monospace", color: "#1e2a3a", flexShrink: 0 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: isGenerating ? "#f59e0b" : "#2dd4bf", animation: isGenerating ? "de-pulse 1s ease-in-out infinite" : "none" }} />
              <span style={{ color: "#334155" }}>{isGenerating ? "Generating…" : "Ready"}</span>
              <div style={{ width: 1, height: 14, background: "#141c28", margin: "0 4px" }} />
              <span>Tone: {config.tones.join(", ") || "—"}</span>
              <div style={{ width: 1, height: 14, background: "#141c28", margin: "0 4px" }} />
              <span>{LENGTH_HINT[config.length]}</span>
              <div style={{ flex: 1 }} />
              <span>{wc > 0 ? `${wc} words · ${doc?.content?.length ?? 0} chars` : "No content"}</span>
            </div>
          </main>
        </div>
      </div>

      <Toast toasts={toasts} />
    </>
  );
}
