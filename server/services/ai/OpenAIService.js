const OpenAI = require('openai');
const AIProvider = require('./AIProvider');

/**
 * @class OpenAIService
 * @description Implementation of AIProvider using OpenAI's GPT models.
 */
class OpenAIService extends AIProvider {
  constructor() {
    super();
    this.openai = null;
  }

  /**
   * Initializes the OpenAI client lazily.
   */
  init() {
    if (!this.openai) {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY is missing in .env");
      }
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  /**
   * Generates content using OpenAI.
   * @param {string} prompt - The input prompt.
   * @returns {Promise<string>} - The raw text from GPT.
   */
  async generate(prompt) {
    try {
      this.init();
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,      });
      return response.choices[0].message.content;
    } catch (error) {
      console.error("OpenAI Error:", error.message);
      throw error;
    }
  }
}

module.exports = OpenAIService;
