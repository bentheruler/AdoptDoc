const resumeRenderService = require('../services/resumeRenderService');
// const Document = require('../models/Document'); // Placeholder for when model is ready

/**
 * @controller DocumentController
 * @description Handles document-related operations including preview and download.
 */
class DocumentController {
  /**
   * Generates a preview HTML for a document.
   * GET /api/documents/:id/preview
   */
  async getPreview(req, res) {
    const { id } = req.params;
    const { theme = 'classic' } = req.query;

    try {
      // In a real scenario, we'd fetch from DB:
      // const doc = await Document.findById(id);
      // if (!doc) return res.status(404).json({ error: "Document not found" });
      
      // Mock data for school project demonstration:
      const mockContent = {
        cv: { basics: { name: "Samuel Waweru", summary: "Software Engineering Student" } },
        coverletter: { body: "This is a mock cover letter body from the API." },
        proposal: { title: "School Project Proposal", objective: "Build an AI document generator." }
      };

      // For testing, we'll assume the ID tells us the doc type or just use CV
      const docType = id.includes('letter') ? 'coverletter' : id.includes('prop') ? 'proposal' : 'cv';
      const content = mockContent[docType];

      const html = resumeRenderService.renderDocument(docType, content, theme);
      return res.send(html);

    } catch (error) {
      console.error("Document Preview Error:", error.message);
      return res.status(500).send(`<h1>Preview Error</h1><p>${error.message}</p>`);
    }
  }

  /**
   * Generates a PDF download for a document.
   * GET /api/documents/:id/download
   */
  async downloadPDF(req, res) {
    // This will use pdfService once fully implemented
    return res.status(501).json({ message: "PDF generation is still in development." });
  }
}

module.exports = new DocumentController();
