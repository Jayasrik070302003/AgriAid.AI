const axios = require('axios');

// Free Groq models — no billing required
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const GROQ_VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct'; // supports images

async function groqChat(messages, { temperature = 0.4, maxTokens = 1024 } = {}) {
    if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY not set in .env');

    const res = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        { model: GROQ_MODEL, messages, temperature, max_tokens: maxTokens },
        {
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        }
    );
    return res.data.choices[0].message.content;
}

async function groqVision(imageUrl, cropType, location) {
    if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY not set in .env');

    const prompt = `You are an expert agricultural AI. Analyze this ${cropType} crop image from ${location}.

Return ONLY this JSON (no markdown, no extra text):
{
  "crop": "${cropType}",
  "disease": "disease name or Healthy",
  "severity": "Low|Medium|High",
  "confidence": 85,
  "status": "Healthy|Diseased|Warning"
}`;

    const res = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
            model: GROQ_VISION_MODEL,
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: prompt },
                        { type: 'image_url', image_url: { url: imageUrl } }
                    ]
                }
            ],
            temperature: 0.3,
            max_tokens: 512
        },
        {
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        }
    );

    const raw = res.data.choices[0].message.content.replace(/```json|```/g, '').trim();
    return JSON.parse(raw);
}

async function groqSimulationSummary(crop, area, organic, chemical, language = 'English') {
    const messages = [
        { role: 'system', content: 'You are an expert agriculture consultant. Be concise and data-backed.' },
        {
            role: 'user',
            content: `Compare farming methods for ${crop} on ${area} acres in ${language}:
Chemical: Yield ${chemical.yield}kg, Profit Rs${chemical.profit}, Soil Health ${chemical.soilHealth}%.
Organic: Yield ${organic.yield}kg, Profit Rs${organic.profit}, Soil Health ${organic.soilHealth}%.
Give exactly 3 bullet points of specific advice. Mention profit difference of Rs${Math.abs(organic.profit - chemical.profit).toFixed(0)}.`
        }
    ];
    return groqChat(messages, { temperature: 0.6, maxTokens: 512 });
}

async function groqChatResponse(userMessage) {
    const messages = [
        {
            role: 'system',
            content: `You are Farmer Assistant for AgriAid.AI. Help Indian farmers with crops, diseases, soil, fertilizers, and farming practices.
Use simple English with 2-3 relevant emojis. Use Indian seasons (Kharif, Rabi, Zaid) and regional context.
For non-agriculture questions, politely redirect.`
        },
        { role: 'user', content: userMessage }
    ];
    return groqChat(messages, { temperature: 0.7, maxTokens: 1024 });
}

module.exports = { groqChat, groqVision, groqSimulationSummary, groqChatResponse };
