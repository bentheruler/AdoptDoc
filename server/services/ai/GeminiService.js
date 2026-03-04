const { GoogleGenerativeAI } = require('@google/generative-ai');
const AIProvider = require('./AIProvider');

/**
 * @class GeminiService
 * @description Implementation of AIProvider using Google's Gemini API.
 */
class GeminiService extends AIProvider {
  constructor() {
    super();
    this.model = null;
  }


  init() {
    if (!this.model) {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is missing in .env");
      }
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite", generationConfig: { temperature: 0.7 } });
    }
  }

  /**
   * Generates content using Gemini.
   * @param {string} prompt - The input prompt.
   * @returns {Promise<string>} - The raw text from Gemini.
   */
  async generate(prompt) {
    try {
      this.init();
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini Error:", error.message);
      throw error;
    }
  }
}

module.exports = GeminiService;
