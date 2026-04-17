const OpenAI = require('openai');

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

/**
 * Helper function to call OpenRouter (Gemini models primarily)
 * @param {string} prompt - The user prompt to send
 * @param {string} systemInstruction - The system instructions
 * @param {string} model - The model to use (default: google/gemini-1.5-flash)
 * @returns {Promise<string>} The response content from the AI
 */
const generateResponse = async (prompt, systemInstruction = "You are a helpful learning assistant.", model = "google/gemini-1.5-flash") => {
  try {
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: prompt }
      ]
    });
    
    return completion.choices[0].message.content;
  } catch (error) {
    console.error("OpenRouter AI Service Error:", error);
    throw error;
  }
};

module.exports = {
  generateResponse,
  openai // Exported in case deeper manipulation is needed elsewhere
};
