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
    this.timeoutLimit = 60000;
  }

  /**
   * Helper function to race the AI call against a timeout.
   * @param {Object} provider
   * @param {string} docType
   * @param {Object} userData
   * @returns {Promise<Object>}
   */
  async callWithTimeout(provider, docType, userData) {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('AI response timeout')), this.timeoutLimit)
    );

    return Promise.race([
      provider.generateDocument(docType, userData),
      timeoutPromise
    ]);
  }

  /**
   * Main function to generate document content with automatic failover.
   * @param {string} docType
   * @param {Object} userData
   * @returns {Promise<Object>}
   */
  async generateDocument(docType, userData) {
    console.log(`Attempting ${docType} generation with Primary (Gemini)...`);

    try {
      return await this.callWithTimeout(this.primary, docType, userData);
    } catch (error) {
      console.warn(
        'Primary AI failed or timed out. Switching to Secondary (OpenAI)...',
        error.message
      );

      try {
        return await this.callWithTimeout(this.secondary, docType, userData);
      } catch (secondaryError) {
        console.error('Secondary AI also failed:', secondaryError.message);
        throw new Error('All AI providers failed. Please try again later.');
      }
    }
  }
}

module.exports = new FailoverManager();
