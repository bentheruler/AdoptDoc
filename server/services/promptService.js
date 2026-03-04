/**
 * @service promptService
 * @description Constructs dynamic prompts for document generation.
 * This service ensures that the AI's response is structured as a valid JSON object.
 */
class PromptService {
  /**
   * Constructs a prompt for generating a CV/Resume.
   * @param {Object} userData - User input data.
   * @returns {string} - The constructed prompt.
   */
  getResumePrompt(userData) {
    return `
Generate a complete and detailed professional CV, including sections like contact information, work experience, education, skills, and projects, using the following user data:
${JSON.stringify(userData, null, 2)}

Return ONLY a valid JSON object that strictly follows the JSON Resume schema (https://jsonresume.org/schema). Do not include any explanation or markdown.
    `.trim();
  }

  /**
   * Constructs a prompt for generating a Cover Letter.
   * @param {Object} userData - User input data.
   * @param {string} jobDescription - Target job description.
   * @returns {string} - The constructed prompt.
   */
  getCoverLetterPrompt(userData, jobDescription) {
    return `
Generate a complete and detailed professional cover letter, including date, recipient details, subject, salutation, a comprehensive body, closing, and signature, using the following user data and job description:
User Data: ${JSON.stringify(userData, null, 2)}
Job Description: ${jobDescription}

The cover letter should be tailored to the specific job description and formatted as a JSON object with fields like 'date', 'recipient', 'subject', 'salutation', 'body', 'closing', and 'signature'.
Return ONLY a valid JSON object. Do not include any explanation or markdown.
    `.trim();
  }

  /**
   * Constructs a prompt for generating a Project Proposal.
   * @param {Object} proposalData - Project details.
   * @returns {string} - The constructed prompt.
   */
  getProposalPrompt(proposalData) {
    return `
Generate a complete and detailed professional project proposal, including sections like title, executive summary, objective, methodology, timeline, budget, and conclusion, based on the following details:
${JSON.stringify(proposalData, null, 2)}

The proposal should be formatted as a JSON object with fields like 'title', 'objective', 'methodology', 'budget', 'timeline', and 'conclusion'.
Return ONLY a valid JSON object. Do not include any explanation or markdown.
    `.trim();
  }
}

module.exports = new PromptService();
