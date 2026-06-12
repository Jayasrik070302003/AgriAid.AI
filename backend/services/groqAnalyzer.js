const axios = require('axios');

// Free Groq models — no billing required
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const GROQ_VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct'; // supports images

async function groqChat(messages, { temperature = 0.4, maxTokens = 1024 } = {}) {
    const groqKeys = [
        process.env.GROQ_API_KEY,
        process.env.GROQ_API_KEY_2,
    ].filter(Boolean);

    if (groqKeys.length === 0) throw new Error('GROQ_API_KEY not set in .env');

    let lastError;
    for (const key of groqKeys) {
        try {
            const res = await axios.post(
                'https://api.groq.com/openai/v1/chat/completions',
                { model: GROQ_MODEL, messages, temperature, max_tokens: maxTokens },
                {
                    headers: {
                        'Authorization': `Bearer ${key}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000
                }
            );
            return res.data.choices[0].message.content;
        } catch (e) {
            lastError = e;
            if (e.response?.status === 429) {
                console.warn(`[Groq] Key ...${key.slice(-6)} rate limited, trying next key`);
                continue;
            }
            throw e;
        }
    }
    throw lastError;
}

async function groqVision(imageUrl, location) {
    const groqKeys = [
        process.env.GROQ_API_KEY,
        process.env.GROQ_API_KEY_2,
    ].filter(Boolean);

    if (groqKeys.length === 0) throw new Error('GROQ_API_KEY not set in .env');

    const prompt = `You are an expert agricultural AI specializing in universal plant intelligence.
Analyze this image from location: ${location}.

Step 1: Check if the image contains a valid plant, crop, leaf, or agriculture-related content.
- If it does NOT (e.g. it is a human, a selfie, a vehicle, a logo, a document, UI, text, or a random object), return exactly this JSON:
{
  "isValidPlant": false
}

Step 2: If valid, identify the crop/plant species, scientific name, category, and check for diseases.
Return exactly this JSON format:
{
  "isValidPlant": true,
  "crop": "Detected crop/plant name (e.g., Tomato)",
  "scientificName": "Scientific botanical name (e.g., Solanum lycopersicum)",
  "category": "horticulture|field|medicinal|vegetable|fruit|flower|herb|tree",
  "confidence": 95,
  "disease": "Specific identified disease name (or 'Healthy')",
  "severity": "Low|Medium|High",
  "status": "Healthy|Diseased|Warning"
}

Do NOT write any markdown, no wrapping backticks (such as \`\`\`json), and no extra text. Return pure JSON.`;

    let lastError;
    for (const key of groqKeys) {
        try {
            const res = await axios.post(
                'https://api.groq.com/openai/v1/chat/completions',
                {
                    model: GROQ_VISION_MODEL,
                    max_tokens: 512,
                    temperature: 0.2,
                    response_format: { type: "json_object" },
                    messages: [
                        {
                            role: 'user',
                            content: [
                                { type: 'text', text: prompt },
                                { type: 'image_url', image_url: { url: imageUrl } }
                            ]
                        }
                    ]
                },
                {
                    headers: {
                        'Authorization': `Bearer ${key}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000
                }
            );
            const raw = res.data.choices[0].message.content.replace(/```json|```/g, '').trim();
            return JSON.parse(raw);
        } catch (e) {
            lastError = e;
            if (e.response?.status === 429) {
                console.warn(`[Groq Vision] Key ...${key.slice(-6)} rate limited, trying next key`);
                continue;
            }
            throw e;
        }
    }
    throw lastError;
}

async function groqCompareScenarios(base, scenarioA, scenarioB, language = 'English') {
    const groqKeys = [
        process.env.GROQ_API_KEY,
        process.env.GROQ_API_KEY_2,
    ].filter(Boolean);

    if (groqKeys.length === 0) throw new Error('GROQ_API_KEY not set in .env');

    const prompt = `You are an expert agriculture consultant.
Compare two farming scenarios for a ${base.area} acre farm growing ${base.crop} on ${base.soilType} soil under ${base.weather} conditions.

Scenario A: ${scenarioA.method} farming, ${scenarioA.irrigation} irrigation, ${scenarioA.fertilizer} fertilizer.
Scenario B: ${scenarioB.method} farming, ${scenarioB.irrigation} irrigation, ${scenarioB.fertilizer} fertilizer.

Evaluate the likely qualitative outcomes. Do NOT use fake exact numbers (e.g., no "2500 kg").
Use ONLY "Low", "Moderate", "High", "Positive", "Neutral", or "Negative".

Return exactly this JSON format:
{
  "scenarioA": {
    "yieldEffect": "Low|Moderate|High",
    "soilImpact": "Negative|Neutral|Positive",
    "waterConsumption": "Low|Moderate|High",
    "sustainability": "Low|Moderate|High",
    "costEfficiency": "Low|Moderate|High",
    "overallRisk": "Low|Moderate|High"
  },
  "scenarioB": {
    "yieldEffect": "Low|Moderate|High",
    "soilImpact": "Negative|Neutral|Positive",
    "waterConsumption": "Low|Moderate|High",
    "sustainability": "Low|Moderate|High",
    "costEfficiency": "Low|Moderate|High",
    "overallRisk": "Low|Moderate|High"
  },
  "explanation": "Provide a practical, research-based 3-sentence summary in ${language} comparing these scenarios."
}
Do NOT write any markdown, no wrapping backticks, and no extra text. Return pure JSON.`;

    let lastError;
    for (const key of groqKeys) {
        try {
            const res = await axios.post(
                'https://api.groq.com/openai/v1/chat/completions',
                {
                    model: GROQ_MODEL,
                    max_tokens: 600,
                    temperature: 0.2,
                    response_format: { type: "json_object" },
                    messages: [{ role: 'user', content: prompt }]
                },
                {
                    headers: {
                        'Authorization': `Bearer ${key}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000
                }
            );
            const raw = res.data.choices[0].message.content.replace(/```json|```/g, '').trim();
            return JSON.parse(raw);
        } catch (e) {
            lastError = e;
            if (e.response?.status === 429) {
                console.warn(`[Groq Compare] Key ...${key.slice(-6)} rate limited, trying next key`);
                continue;
            }
            throw e;
        }
    }
    throw lastError;
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

module.exports = { groqChat, groqVision, groqCompareScenarios, groqChatResponse };
