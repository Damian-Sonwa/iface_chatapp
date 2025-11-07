const fetch = require('node-fetch');

// Google Vertex AI Gemini REST (placeholder). Expects env: VERTEX_PROJECT, VERTEX_LOCATION, VERTEX_MODEL, VERTEX_API_KEY
async function getAIResponse(prompt, context = '') {
  const project = process.env.VERTEX_PROJECT;
  const location = process.env.VERTEX_LOCATION || 'us-central1';
  const model = process.env.VERTEX_MODEL || 'gemini-1.5-flash';
  const apiKey = process.env.VERTEX_API_KEY;

  if (!project || !apiKey) {
    return {
      text: 'AI not configured. Please set VERTEX_PROJECT and VERTEX_API_KEY.',
      choices: [],
      metadata: { configured: false }
    };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const contents = [
    { role: 'user', parts: [{ text: context ? `${context}\n\n${prompt}` : prompt }] }
  ];

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents })
  });

  if (!resp.ok) {
    const errText = await resp.text();
    return { text: `AI error: ${resp.status} ${errText}`, choices: [], metadata: { configured: true, status: resp.status } };
  }

  const data = await resp.json();
  const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text).join(' ') || '';
  return {
    text,
    choices: data?.candidates?.map(c => ({ text: c.content?.parts?.map(p => p.text).join(' ') || '' })) || [],
    metadata: { model }
  };
}

module.exports = { getAIResponse };











