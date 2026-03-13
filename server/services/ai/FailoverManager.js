const GeminiService = require('./GeminiService');
const OpenAIService = require('./OpenAIService');

/**
 * @class FailoverManager
 * @description Manages AI service selection and handles failover logic.
 * It prioritizes Gemini and switches to OpenAI if Gemini fails or times out.
 */
class FailoverManager {
  constructor() {
    this.primary = new GeminiService();
    this.secondary = new OpenAIService();
    this.timeoutLimit = 60000; // 60 seconds for AI response
  }

  /**
   * Helper function to race the AI call against a timeout.
   * @param {AIProvider} provider - The AI provider to call.
   * @param {string} prompt - The input prompt.
   * @returns {Promise<string>}
   */
  async callWithTimeout(provider, prompt) {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("AI response timeout")), this.timeoutLimit)
    );
    return Promise.race([provider.generate(prompt), timeoutPromise]);
  }

  /**
   * Main function to generate content with automatic failover.
   * @param {string} prompt - The prompt to send.
   * @returns {Promise<string>} - The AI generated content.
   */
  async generate(prompt) {
    console.log("Attempting generation with Primary (Gemini)...");
    try {
      return await this.callWithTimeout(this.primary, prompt);
    } catch (error) {
      console.warn("Primary AI failed or timed out. Switching to Secondary (OpenAI)...", error.message);
      try {
        return await this.callWithTimeout(this.secondary, prompt);
      } catch (secondaryError) {
        console.error("Secondary AI also failed:", secondaryError.message);
        throw new Error("All AI providers failed. Please try again later.");
      }
    }
  }
}

module.exports = new FailoverManager();
