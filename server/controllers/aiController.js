const FailoverManager = require('../services/ai/FailoverManager');
const promptService = require('../services/promptService');

/**
 * @controller AIController
 * @description Handles requests for AI content generation.
 */
class AIController {
  /**
   * Generates document content based on type and user input.
   * POST /api/ai/generate
   */
  async generateContent(req, res) {
    const { docType, userData, jobDescription } = req.body;

    if (!docType || !userData) {
      return res.status(400).json({ error: "Missing required fields: docType, userData" });
    }

    try {
      let prompt;
      switch (docType.toLowerCase()) {
        case 'cv':
        case 'resume':
          prompt = promptService.getResumePrompt(userData);
          break;
        case 'coverletter':
          prompt = promptService.getCoverLetterPrompt(userData, jobDescription || "");
          break;
        case 'proposal':
          prompt = promptService.getProposalPrompt(userData);
          break;
        default:
          return res.status(400).json({ error: `Unsupported docType: ${docType}` });
      }

      // Use the FailoverManager to handle the AI generation with Gemni as primary
      const resultRaw = await FailoverManager.generate(prompt);

      // Attempt to parse the AI output as JSON
      try {
        const resultJson = JSON.parse(resultRaw.replace(/```json|```/g, '').trim());
        return res.json({ success: true, content: resultJson });
      } catch (parseError) {
        console.error("AI JSON Parse Error:", parseError.message);
        return res.json({ 
          success: true, 
          content: resultRaw, 
          warning: "AI response was not a valid JSON. Check raw text." 
        });
      }

    } catch (error) {
      console.error("AI Generation Endpoint Error:", error.message);
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new AIController();
