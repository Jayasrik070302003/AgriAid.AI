const axios = require('axios');

// Priority: GROQ_API_KEY → OPENROUTER_API_KEY → GEMINI_API_KEY
const GROQ_MODEL   = 'llama-3.3-70b-versatile';
const GEMINI_MODEL = 'gemini-2.0-flash';
const OR_PRIMARY   = 'meta-llama/llama-3.3-70b-instruct';
const OR_FALLBACK  = 'google/gemini-pro';

async function callGroq(messages, temperature, maxTokens) {
    const res = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        { model: GROQ_MODEL, messages, temperature, max_tokens: maxTokens },
        { headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' }, timeout: 30000 }
    );
    return res.data.choices[0].message.content;
}

async function callGemini(messages, temperature, maxTokens) {
    const systemMsg = messages.find(m => m.role === 'system');
    const userMsgs  = messages.filter(m => m.role !== 'system');
    const contents  = userMsgs.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: Array.isArray(m.content)
            ? m.content.map(c => c.type === 'image_url' ? { inline_data: { mime_type: 'image/jpeg', data: c.image_url.url } } : { text: c.text })
            : [{ text: m.content }]
    }));
    const body = { contents, generationConfig: { temperature, maxOutputTokens: maxTokens } };
    if (systemMsg) body.systemInstruction = { parts: [{ text: systemMsg.content }] };
    const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
        body, { timeout: 30000 }
    );
    return res.data.candidates[0].content.parts[0].text;
}

async function callOpenRouter(messages, model, temperature, maxTokens) {
    const res = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        { model, messages, temperature, max_tokens: maxTokens },
        { headers: { 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`, 'HTTP-Referer': process.env.APP_URL || 'http://localhost:3001', 'X-Title': 'AgriAid.AI', 'Content-Type': 'application/json' }, timeout: 30000 }
    );
    return res.data.choices[0].message.content;
}

async function chat(messages, { temperature = 0.7, maxTokens = 2048 } = {}) {
    if (process.env.GROQ_API_KEY) {
        try { return await callGroq(messages, temperature, maxTokens); }
        catch (e) { console.warn('[Groq] Failed:', e.message); }
    }
    if (process.env.OPENROUTER_API_KEY) {
        try { return await callOpenRouter(messages, OR_PRIMARY, temperature, maxTokens); }
        catch (e) {
            console.warn('[OpenRouter] Primary failed:', e.message);
            try { return await callOpenRouter(messages, OR_FALLBACK, temperature, maxTokens); }
            catch (e2) { console.warn('[OpenRouter] Fallback failed:', e2.message); }
        }
    }
    if (process.env.GEMINI_API_KEY) {
        try { return await callGemini(messages, temperature, maxTokens); }
        catch (e) { console.warn('[Gemini] Failed:', e.message); }
    }
    throw new Error('No AI API key configured. Set GROQ_API_KEY, OPENROUTER_API_KEY, or GEMINI_API_KEY in .env');
}

module.exports = { chat };
