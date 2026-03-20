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
Generate a complete, detailed, and professional CV using the user data below.

USER DATA:
${JSON.stringify(userData, null, 2)}

Follow this exact CV structure:

1. basics
- name
- phone
- email
- linkedin
- title
- location
- summary

2. work
- reverse chronological order
- each work item must contain:
  - role
  - company
  - period
  - bullets (array of at least 3 concise achievement/responsibility statements)

3. education
- most recent first
- each education item must contain:
  - degree
  - institution
  - graduationDate

4. skills
- array of relevant technical and professional skills

5. projects
- optional array of project names or short project descriptions

6. certifications
- optional array of certifications

7. references
- string, default to "Available upon request"

Rules:
- Do not include birth date or marital status.
- The summary must be 3 to 4 lines.
- The CV must be realistic, detailed, and professionally written.
- Include projects and certifications only if relevant or inferable from the input.
- Return ONLY valid JSON.
- Do not return markdown.
- Do not return explanations.

Return JSON in this exact format:

{
  "basics": {
    "name": "",
    "phone": "",
    "email": "",
    "linkedin": "",
    "title": "",
    "location": "",
    "summary": ""
  },
  "work": [
    {
      "role": "",
      "company": "",
      "period": "",
      "bullets": ["", "", ""]
    }
  ],
  "education": [
    {
      "degree": "",
      "institution": "",
      "graduationDate": ""
    }
  ],
  "skills": ["", ""],
  "projects": ["", ""],
  "certifications": ["", ""],
  "references": "Available upon request"
}
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
