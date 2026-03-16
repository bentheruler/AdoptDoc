// client/src/services/aiService.js

export const sendCVMessage = async (userMessage, currentCVData) => {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: `You are an AI assistant helping users build and edit their CV/resume inside AdaptDoc.
The current CV data is:
${JSON.stringify(currentCVData, null, 2)}
When the user asks to update anything, respond with:
1. A short friendly confirmation message
2. A JSON block wrapped in <cv_update></cv_update> tags with the FULL updated CV object
The CV object structure must be exactly:
{"name":string,"title":string,"location":string,"email1":string,"email2":string,"summary":string,"skills":[strings],"experience":[{"company":string,"role":string,"period":string,"bullets":[strings]}]}
If the user is just chatting, respond conversationally without a <cv_update> block.`,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!response.ok) throw new Error(`AI request failed: ${response.status}`);

  const data     = await response.json();
  const fullText = data.content?.map((c) => c.text || '').join('') || 'Sorry, I could not process that.';
  const cvMatch  = fullText.match(/<cv_update>([\s\S]*?)<\/cv_update>/);

  let updatedCV = null;
  if (cvMatch) {
    try { updatedCV = JSON.parse(cvMatch[1].trim()); } catch (_) {}
  }

  const displayText = fullText.replace(/<cv_update>[\s\S]*?<\/cv_update>/g, '').trim();
  return { displayText, updatedCV };
};
