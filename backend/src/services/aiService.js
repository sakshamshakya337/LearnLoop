const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');
const OpenAI = require('openai');

// Initialize AI clients if keys are present
const genAI = process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('sk-or') ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const openRouter = process.env.OPENROUTER_API_KEY ? new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
}) : null;
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

/**
 * Extract text from a local PDF buffer
 */
async function parsePdf(fileBuffer) {
  try {
    const data = await pdfParse(fileBuffer);
    return data.text;
  } catch (err) {
    console.error('Error parsing PDF:', err);
    throw new Error('Failed to parse PDF document.');
  }
}

/**
 * Generate Structured Notes using Gemini 1.5 Flash
 */
async function generateNotes(text) {
  if (!genAI && !openRouter) {
    console.warn('GEMINI/OPENROUTER_API_KEY is missing. Using mock notes generation.');
    return _getMockNotes();
  }

  try {
    const prompt = `
      You are an expert tutor. Analyze the following text and generate comprehensive, structured study notes.
      Format the output as a strict JSON object matching this schema:
      {
        "title": "A short, descriptive title for these notes",
        "sections": [
          {
            "heading": "String heading",
            "points": ["string point 1", "string point 2"]
          }
        ],
        "summary": "A 2-sentence summary of the entire document.",
        "diagram": "Mermaid flowchart code (graph TD). RULES: 1. Use ONLY square brackets [] for nodes. 2. ALWAYS wrap every label in double quotes: id[\"Label\"]. 3. No nested brackets or special shapes."
      }
      Do not include markdown blocks like \`\`\`json around the output. Only return valid JSON.

      TEXT TO ANALYZE:
      ${text}
    `;

    let responseText = '';

    if (openRouter) {
      console.log('Using OpenRouter for Gemini');
      const response = await openRouter.chat.completions.create({
        model: 'google/gemini-2.5-flash',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }]
      });
      responseText = response.choices[0].message.content.trim();
    } else {
      console.log('Using direct Gemini SDK');
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      responseText = result.response.text().trim();
    }
    
    // Clean up potential markdown blocks the LLM might have added anyway
    const cleanedJson = responseText.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
    const notes = JSON.parse(cleanedJson);
    
    if (notes.diagram) {
      notes.diagram = sanitizeMermaid(notes.diagram);
    }
    
    return notes;
  } catch (err) {
    console.error('AI generateNotes error:', err);
    throw new Error('Failed to generate notes via Gemini/OpenRouter: ' + err.message);
  }
}

/**
 * Generate Flashcards using Groq LLaMA 3 (for speed) 
 */
async function generateFlashcards(text) {
  if (!groq) {
    console.warn('GROQ_API_KEY is missing. Using mock flashcards generation.');
    return _getMockFlashcards();
  }

  try {
    const prompt = `
      Generate 10 high-quality flashcards based on the following text.
      Return strictly a JSON array of objects with "question" and "answer" keys.
      Do not include any other text or markdown block wrapping.

      Example: [{"question": "What is Mitochondria?", "answer": "Powerhouse of the cell."}]

      TEXT TO ANALYZE:
      ${text}
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      temperature: 0.3,
    });

    let rawJson = chatCompletion.choices[0]?.message?.content || "[]";
    const cleaned = rawJson.replace(/```json|```/g, "").trim();
    
    let parsed = JSON.parse(cleaned);
    if (parsed.flashcards && Array.isArray(parsed.flashcards)) return parsed.flashcards;
    if (Array.isArray(parsed)) return parsed;
    
    throw new Error('Groq did not return a recognizable array format.');
  } catch (err) {
    console.error('AI generateFlashcards error:', err);
    throw new Error('Failed to generate flashcards via Groq: ' + err.message);
  }
}

/**
 * Generate Quizzes using Groq LLaMA 3
 */
async function generateQuizzes(text, count = 5) {
  // Logic: 
  // - If count <= 20 and Groq is available: Use Groq for speed.
  // - If count > 20 or Groq isn't available: Use Gemini (via OpenRouter) which handles long-form JSON better.

  const useGroq = count <= 20 && groq;
  const prompt = `
    Generate exactly ${count} multiple-choice questions based on the following text.
    Return strictly a JSON array of objects with these keys: "question", "options" (array of exactly 4 strings), "correct_answer", and "explanation".
    Ensure the questions are high-quality and cover different parts of the text.
    Do not include any other text or markdown blocks.
    
    TEXT TO ANALYZE:
    ${text.slice(0, 10000)}
  `;

  try {
    let rawJson = '';

    if (useGroq) {
      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.1-8b-instant',
        temperature: 0.3,
      });
      rawJson = chatCompletion.choices[0]?.message?.content || "[]";
    } else if (openRouter) {
      const response = await openRouter.chat.completions.create({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: prompt }]
      });
      rawJson = response.choices[0].message.content.trim();
    } else if (genAI) {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      rawJson = result.response.text().trim();
    } else {
      return _getMockQuizzes().slice(0, count);
    }

    const cleanedJson = rawJson.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleanedJson);
    
    const questions = Array.isArray(parsed) ? parsed : (parsed.quizzes || parsed.questions || []);
    return questions.slice(0, count);
  } catch (err) {
    console.error('AI generateQuizzes error:', err);
    throw new Error('Failed to generate quizzes: ' + err.message);
  }
}

function sanitizeMermaid(raw) {
  if (!raw) return '';
  return raw
    .replace(/^```mermaid\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
    .split('\n')
    .map(line =>
      line
        .replace(/\[([^\]]+)\]/g, (_, t) => `[${t.replace(/\//g,' ').replace(/[<>"\\]/g,' ')}]`)
        .replace(/\(([^)]+)\)/g, (_, t) => `(${t.replace(/\//g,' ').replace(/[<>"\\]/g,' ')})`)
    ).join('\n');
}

/**
 * Generate a standalone Mermaid Diagram from text
 */
async function generateDiagram(text) {
  if (!openRouter && !genAI) return "graph TD\nA[Content] --> B[Summary]";

  try {
    const prompt = `
      Based on the following study notes, create a professional Mermaid.js flowchart (graph TD).
      Return ONLY the mermaid code. Do not include markdown blocks or any other text.
      
      STRICT RULES:
      1. Start with 'graph TD'.
      2. Use ONLY square brackets [] for ALL nodes (no cylinders, circles, or decisions).
      3. ALWAYS wrap every node label in double quotes: node_id["Full Label Content"].
      4. Ensure node IDs are simple alphanumeric strings (e.g., A1, B2).
      5. Do not use the word 'end' as a node ID.
      
      NOTES:
      ${text.slice(0, 5000)}
    `;

    let diagramCode = '';
    if (openRouter) {
      const response = await openRouter.chat.completions.create({
        model: 'google/gemini-2.5-flash',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }]
      });
      diagramCode = response.choices[0].message.content.trim();
    } else {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      diagramCode = result.response.text().trim();
    }

    return sanitizeMermaid(diagramCode);
  } catch (err) {
    console.error('Diagram gen error:', err);
    return "graph TD\nA[Error generating diagram] --> B[Check content]";
  }
}

/* ─────────────────────────────────────────────────────────────
   MOCK GENERATORS (Fallback when API tokens aren't configured) 
   ───────────────────────────────────────────────────────────── */

function _getMockNotes() {
  return {
    title: "Understanding Uploaded Documents",
    summary: "This is an auto-generated summary because API keys are missing. It demonstrates the structural capability of the app.",
    sections: [
      {
        heading: "Introduction to the Topic",
        points: ["First important point parsed from OCR.", "Second important contextual element."]
      },
      {
        heading: "Advanced Concepts",
        points: ["OCR stands for Optical Character Recognition.", "LLMs are Large Language Models like LLaMA and Gemini."]
      }
    ]
  };
}

function _getMockFlashcards() {
  return [
    { question: "What does OCR stand for?", answer: "Optical Character Recognition." },
    { question: "Which API is recommended for fast short-burst generation?", answer: "Groq (LLaMA)." },
    { question: "What database does this project use?", answer: "Supabase (PostgreSQL)." }
  ];
}

function _getMockQuizzes() {
  return [
    {
      question: "Which LLM model is best for massive context windows in this architecture?",
      options: ["Groq LLaMA 3", "Gemini 1.5 Flash", "GPT-3.5", "Claude 3 Haiku"],
      correct_answer: "Gemini 1.5 Flash",
      explanation: "Gemini 1.5 Flash supports a 1M token context window natively via the free tier."
    },
    {
      question: "What is the primary function of Supabase in this project?",
      options: ["Frontend Rendering", "Database & Auth", "AI Text Generation", "Payment Processing"],
      correct_answer: "Database & Auth",
      explanation: "Supabase acts as the PostgreSQL backend as a service, managing tables and sessions."
    }
  ];
}

module.exports = {
  parsePdf,
  generateNotes,
  generateFlashcards,
  generateQuizzes,
  generateDiagram
};
