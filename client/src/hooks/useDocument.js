// client/src/hooks/useDocument.js
// useDocument.js
// Central hook — owns document state, generation, and auto-save.
// Authors: Gabriel Maina · Michael Ochieng

import { useState, useRef, useCallback, useEffect } from "react";
import { documentService } from "../api/document.service";
import { DocType, DocLength, Tone, SaveStatus } from "../types/document.types";

// ── Default form values ───────────────────────────────────────────────────────

const defaultConfig = {
  topic:   "",
  docType: DocType.Report,
  tones:   [Tone.Professional],
  length:  DocLength.Medium,
  context: "",
};

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useDocument() {
  const [document, setDocument]   = useState(null);
  const [config, setConfig]       = useState(defaultConfig);
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveStatus, setSaveStatus]     = useState(SaveStatus.Unsaved);
  const [toasts, setToasts]       = useState([]);

  const autoSaveTimer  = useRef(null);
  const documentIdRef  = useRef(null);

  // ── Toast ─────────────────────────────────────────────────────────────────

  const addToast = useCallback((msg, type = "success", icon = "✓") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg, type, icon }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Auto-save (PUT /api/documents/:id after 1.5s idle) ────────────────────

  const scheduleAutoSave = useCallback((title, content) => {
    if (!documentIdRef.current) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);

    setSaveStatus(SaveStatus.Unsaved);

    autoSaveTimer.current = setTimeout(async () => {
      setSaveStatus(SaveStatus.Saving);
      try {
        await documentService.update(documentIdRef.current, { title, content });
        setSaveStatus(SaveStatus.Saved);
      } catch {
        setSaveStatus(SaveStatus.Error);
        addToast("Auto-save failed — check your connection", "error", "✕");
      }
    }, 1500);
  }, [addToast]);

  // ── Setters ───────────────────────────────────────────────────────────────

  const setTitle = useCallback((title) => {
    setDocument((prev) => {
      if (!prev) return prev;
      scheduleAutoSave(title, prev.content);
      return { ...prev, title };
    });
  }, [scheduleAutoSave]);

  const setContent = useCallback((content) => {
    setDocument((prev) => {
      if (!prev) return prev;
      scheduleAutoSave(prev.title, content);
      return { ...prev, content };
    });
  }, [scheduleAutoSave]);

  const patchConfig = useCallback((patch) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  }, []);

  // ── Generate ──────────────────────────────────────────────────────────────

  const generate = useCallback(async () => {
    if (!config.topic.trim()) {
      addToast("Please enter a topic first", "error", "✕");
      return;
    }

    setIsGenerating(true);
    setSaveStatus(SaveStatus.Unsaved);

    try {
     
      const result = await documentService.generate({
        topic:   config.topic,
        docType: config.docType,
        tones:   config.tones,
        length:  config.length,
        context: config.context,
      });

      documentIdRef.current = result.documentId;

      const now = new Date().toISOString();
      setDocument({
        id:        result.documentId,
        title:     result.title,
        content:   result.content,
        docType:   config.docType,
        config:    { ...config },
        createdAt: now,
        updatedAt: now,
        authorId:  "current-user",
      });

      setSaveStatus(SaveStatus.Saved);
      addToast("Document generated", "success", "✦");
    } catch (err) {
      addToast(err.message || "Generation failed", "error", "✕");
      setSaveStatus(SaveStatus.Error);
    } finally {
      setIsGenerating(false);
    }
  }, [config, addToast]);

  // ── Reset ─────────────────────────────────────────────────────────────────

  const resetDoc = useCallback(() => {
    setDocument(null);
    setConfig(defaultConfig);
    documentIdRef.current = null;
    setSaveStatus(SaveStatus.Unsaved);
  }, []);

  // ── Cleanup ───────────────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, []);

  return {
    document,
    config,
    isGenerating,
    saveStatus,
    toasts,
    setTitle,
    setContent,
    patchConfig,
    generate,
    resetDoc,
    addToast,
    dismissToast,
  };
}
