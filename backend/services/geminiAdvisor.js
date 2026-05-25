const axios = require('axios');
const { groqChat: groqChatRaw } = require('./groqAnalyzer');

const GEMINI_MODEL = 'gemini-2.0-flash';
const BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Groq-compatible wrapper — converts system+user to messages array
async function groqChatCompat(systemPrompt, userMessage, opts) {
    const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
    ];
    return groqChatRaw(messages, opts);
}

async function geminiChatDirect(systemPrompt, userMessage, { temperature = 0.7, maxTokens = 1024 } = {}, key = process.env.GEMINI_API_KEY) {
    if (!key) throw new Error('GEMINI_API_KEY not set');
    const body = {
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { temperature, maxOutputTokens: maxTokens }
    };
    const res = await axios.post(`${BASE_URL}?key=${key}`, body, { timeout: 30000 });
    return res.data.candidates[0].content.parts[0].text;
}

// Main chat — Groq first, fallback Gemini keys rotation
async function geminiChat(systemPrompt, userMessage, opts = {}) {
    if (process.env.GROQ_API_KEY) {
        try {
            return await groqChatCompat(systemPrompt, userMessage, { temperature: opts.temperature || 0.7, maxTokens: opts.maxTokens || 1024 });
        } catch (e) {
            console.warn('[AI] Groq failed, trying Gemini:', e.message);
        }
    }

    // Collect all available Gemini keys
    const geminiKeys = [
        process.env.GEMINI_API_KEY,
        process.env.GEMINI_API_KEY_2,
        process.env.GEMINI_API_KEY_3,
    ].filter(Boolean);

    if (geminiKeys.length === 0) throw new Error('No AI API keys available');

    let lastError;
    for (const key of geminiKeys) {
        try {
            return await geminiChatDirect(systemPrompt, userMessage, opts, key);
        } catch (e) {
            lastError = e;
            if (e.response?.status === 429) {
                console.warn(`[AI] Gemini key ...${key.slice(-6)} rate limited, trying next key`);
                continue;
            }
            throw e;
        }
    }
    throw lastError;
}

function parseJSON(raw) {
    return JSON.parse(raw.replace(/```json|```/g, '').trim());
}

async function geminiTreatmentAdvice(disease, severity, cropType, farmingType, weather) {
    const systemPrompt = `You are an elite agricultural scientist and AI agronomist. Provide highly practical, detailed, farmer-friendly advice. Respond ONLY with a valid JSON object.`;
    const userMessage = `Crop: ${cropType}, Disease: ${disease}, Severity: ${severity}, Farming Category: ${farmingType}.
Weather Context: Temp ${weather?.temp || '28'}°C, Humidity ${weather?.humidity || '64'}%, Condition: ${weather?.condition || 'Partly Cloudy'}.

Return ONLY this JSON schema (do not wrap in markdown or backticks):
{
  "treatment": {
    "fertilizer": "chemical remedy or fertilizer recommendation name",
    "quantity": "precise dosage (e.g., 2.5 ml per litre of water)",
    "instructions": "step-by-step preparation and application guidelines"
  },
  "prevention": "preventative actions for future cycles",
  "organicAlternative": "organic or biological solution alternatives",
  "urgency": "Immediate|Within 3 days|Within a week",
  "farmerNote": "encouraging summary agronomist expert note",
  
  "diseaseName": "${disease}",
  "severityLevel": "${severity}",
  "confidence": 92.50,
  "affectedAreas": "detailed description of leaves, stems, or fruits showing lesions/discoloration",
  "cureMethods": "precise cure methods and cultural actions",
  "organicSolutions": "organic control agents (e.g. neem cake, trichoderma, pseudomonas)",
  "fertilizerSuggestions": "NPK adjustments, micro-nutrients correction based on crop status",
  "irrigationAdvice": "irrigation scheduling, timing, and watering techniques to limit spore spread",
  "weatherRisks": "micro-climate risk assessments (humidity, wind, temperature influence)",
  "preventionTips": "cultural practices, cleaning, crop rotation, and hygiene",
  "yieldProtectionAdvice": "actionable tactics to prevent crop yield collapse (e.g. isolation, companion plants)",
  "soilRecommendations": "pH adjustments, composting, biological additions, and aerification",
  "recoveryTimeline": [
    { "day": "Day 1", "milestone": "critical Day 1 intervention milestone" },
    { "day": "Day 3", "milestone": "Day 3 response checklist milestone" },
    { "day": "Day 7", "milestone": "Day 7 recovery index check milestone" }
  ],
  "marketInsights": "estimated supply impact, local harvest price dynamics, and advice on whether to harvest early",
  "chatSuggestions": [
    "suggested question 1",
    "suggested question 2",
    "suggested question 3"
  ]
}`;

    const raw = await geminiChat(systemPrompt, userMessage, { temperature: 0.3, maxTokens: 2048 });
    return parseJSON(raw);
}

async function geminiWeatherAdvisory(location, weatherData) {
    const systemPrompt = `You are an agricultural weather advisor for Indian farmers. Return ONLY valid JSON.`;
    const current = weatherData.current || weatherData;
    const daily = weatherData.daily || [];

    const userMessage = `Location: ${location}.
Current: Temp ${current.temp}°C, Condition: ${current.condition}, Humidity: ${current.humidity}%, Wind: ${current.wind} km/h, Precipitation: ${current.precipitation || 0}mm.
7-Day Forecast: ${JSON.stringify(daily.slice(0, 7))}.

Return ONLY this JSON:
{
  "location": "",
  "summary": "",
  "temperature": "",
  "condition": "",
  "humidity": "",
  "wind": "",
  "precipitation": "",
  "advisory": "",
  "alerts": "",
  "sprayRecommendation": "safe|avoid",
  "irrigationTip": "",
  "refined_forecast": [{ "day": "", "condition": "", "temperature": "" }]
}`;

    const raw = await geminiChat(systemPrompt, userMessage, { temperature: 0.4, maxTokens: 1024 });
    return parseJSON(raw);
}

async function geminiSpreadAnalysis(cropName, diseaseName, spreadData, weather) {
    const systemPrompt = `You are an agricultural disease spread analyst. Return ONLY valid JSON.`;
    const userMessage = `Crop: ${cropName}, Disease: ${diseaseName}.
7-day spread: ${spreadData.risk7}%, 14-day: ${spreadData.risk14}%, Mutation risk: ${spreadData.mutationRisk}%.
Weather: ${weather.temp?.toFixed(1)}°C, ${weather.humidity?.toFixed(1)}% humidity.
Return: {"status":"Diseased|Warning|Healthy","message":"farmer-friendly message","advice":"treatment steps"}`;

    const raw = await geminiChat(systemPrompt, userMessage, { temperature: 0.3, maxTokens: 512 });
    return parseJSON(raw);
}

async function geminiFallbackChat(userMessage) {
    const systemPrompt = `You are Farmer Assistant for AgriAid.AI. Help Indian farmers with crops, diseases, soil, fertilizers.
Use simple English with 2-3 emojis. Use Indian seasons (Kharif, Rabi, Zaid). Redirect non-agriculture questions politely.`;
    return geminiChat(systemPrompt, userMessage, { temperature: 0.7, maxTokens: 1024 });
}

async function downloadImageAsBase64(url) {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data, 'binary').toString('base64');
}

async function geminiVision(imageUrl, location) {
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set');

    const base64Data = await downloadImageAsBase64(imageUrl);

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

    const body = {
        contents: [
            {
                parts: [
                    { text: prompt },
                    {
                        inlineData: {
                            mimeType: "image/jpeg",
                            data: base64Data
                        }
                    }
                ]
            }
        ],
        generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json"
        }
    };

    const res = await axios.post(`${BASE_URL}?key=${process.env.GEMINI_API_KEY}`, body, { timeout: 30000 });
    const raw = res.data.candidates[0].content.parts[0].text.replace(/```json|```/g, '').trim();
    return JSON.parse(raw);
}

async function geminiParseSoilReport(base64Data, mimeType = "image/jpeg") {
    // Collect all available Gemini keys for rotation
    const geminiKeys = [
        process.env.GEMINI_API_KEY,
        process.env.GEMINI_API_KEY_2,
        process.env.GEMINI_API_KEY_3,
    ].filter(Boolean);

    if (geminiKeys.length === 0) throw new Error('No GEMINI_API_KEY available');

    const prompt = `You are a precision agriculture soil laboratory OCR engine. Analyze this soil health report document and extract all available parameters.
Verify if the document is actually a soil report, fertilizer/soil testing result, or a similar agricultural report.

- If it is NOT a soil report or contains no readable soil parameters, respond with ONLY this exact JSON (no extra text):
{"isValidReport": false}

- If it IS a valid soil report, extract the values below. Use null for any missing field. Classify soilType into one of: Alluvial, Red Soil, Black Soil, Laterite, Clay, Sandy, Loam.
Respond with ONLY this exact JSON structure (no markdown, no backticks, no explanation):
{"isValidReport":true,"ph":6.8,"nitrogen":280.5,"phosphorus":35.2,"potassium":210.0,"carbon":0.65,"soilType":"Alluvial"}`;

    const body = {
        contents: [
            {
                parts: [
                    { text: prompt },
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: base64Data
                        }
                    }
                ]
            }
        ],
        generationConfig: {
            temperature: 0.1
            // NOTE: responseMimeType is intentionally omitted for vision/multimodal calls
            // as it conflicts with image analysis and causes empty/invalid responses
        }
    };

    let lastError;
    for (const key of geminiKeys) {
        try {
            const res = await axios.post(`${BASE_URL}?key=${key}`, body, { timeout: 30000 });
            const candidate = res.data?.candidates?.[0];
            if (!candidate) throw new Error('No candidate returned from Gemini Vision');
            
            let raw = candidate.content?.parts?.[0]?.text || '';
            // Strip markdown wrappers aggressively
            raw = raw.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
            // Extract JSON object from response text (handles models that add trailing text)
            const jsonMatch = raw.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error(`Gemini returned non-JSON response: ${raw.substring(0, 100)}`);
            return JSON.parse(jsonMatch[0]);
        } catch (e) {
            lastError = e;
            console.warn(`[geminiParseSoilReport] Key rotation attempt failed:`, e.message);
        }
    }
    throw lastError;
}

async function geminiCropSuggestions(query) {
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set');
    const systemPrompt = `You are a botanical taxonomy engine. Given a partial crop search query (which may contain typos or regional names), return a JSON array containing up to 5 matching plants/crops.
Return ONLY a valid JSON array format, like this:
[
  { "name": "Tomato", "scientific": "Solanum lycopersicum", "category": "horticulture" },
  { "name": "Rice", "scientific": "Oryza sativa", "category": "field" }
]
Do not wrap in markdown or backticks. Return pure JSON.`;
    const userMessage = `Search query: "${query}"`;
    try {
        const raw = await geminiChat(systemPrompt, userMessage, { temperature: 0.2, maxTokens: 512 });
        return parseJSON(raw);
    } catch (e) {
        console.error("geminiCropSuggestions error:", e.message);
        return [];
    }
}

async function geminiNutrientGuidance(n, p, k, diseaseName, cropName) {
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set');
    const systemPrompt = `You are a precision soil nutrition expert. Given NPK values, a crop name, and a disease context, return a single concise farmer-friendly advisory string (1-2 sentences, no JSON, no markdown).`;
    const userMessage = `Crop: ${cropName || 'Unknown'}, Disease: ${diseaseName || 'Unknown'}, Nitrogen: ${n} kg/ha, Phosphorus: ${p} kg/ha, Potassium: ${k} kg/ha. What is the most critical NPK action the farmer should take right now?`;
    return geminiChat(systemPrompt, userMessage, { temperature: 0.3, maxTokens: 256 });
}

async function geminiLiveInsights(location, weather) {
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set');
    const systemPrompt = `You are an agricultural market and weather intelligence engine for Indian farmers. Return ONLY this JSON:
{
  "marketPrice": "e.g. ₹2,450",
  "marketCrop": "e.g. Grade A Paddy",
  "marketTrend": "e.g. ▲ +4.20%",
  "sprayWindow": "e.g. Spray window open for next 4 hours",
  "weatherNote": "e.g. Humidity optimal for foliar spray"
}
Do not wrap in markdown. Return pure JSON.`;
    const userMessage = `Location: ${JSON.stringify(location)}, Weather: Temp ${weather?.temp || 28}°C, Humidity ${weather?.humidity || 64}%, Condition: ${weather?.condition || 'Partly Cloudy'}, Wind: ${weather?.wind || 12} km/h.`;
    try {
        const raw = await geminiChat(systemPrompt, userMessage, { temperature: 0.4, maxTokens: 256 });
        return parseJSON(raw);
    } catch (e) {
        return { marketPrice: '₹2,450', marketCrop: 'Grade A Paddy', marketTrend: '▲ +4.20%', sprayWindow: 'Check local conditions', weatherNote: 'Weather data unavailable' };
    }
}

async function geminiSoilEstimation(location, weather) {
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set');
    const systemPrompt = `You are a precision agriculture soil intelligence engine. Given a location (with coordinates and address levels) and weather details, analyze and estimate the probable soil and moisture profile. Return ONLY this JSON format:
{
  "soilType": "Probable Soil Type (e.g., Red Sandy Loam / Clay Loam)",
  "rainfallZone": "Agro-Climatic / Rainfall Zone description",
  "landClassification": "Land classification (e.g., Dryland & Canal-Irrigated Deltaic Plain)",
  "organicMatter": "Organic Matter description (e.g., 0.48% (Low to Medium))",
  "phLevel": "pH range (e.g., 6.2 - 7.5)",
  "suitability": "Crop suitability summary",
  "moistureRange": "Moisture range (e.g., 18% - 24% (Moderate))"
}
Do not wrap in markdown or backticks. Return pure JSON.`;
    const userMessage = `Location: ${JSON.stringify(location)}, Weather: ${JSON.stringify(weather)}`;
    try {
        const raw = await geminiChat(systemPrompt, userMessage, { temperature: 0.2, maxTokens: 1024 });
        return parseJSON(raw);
    } catch (e) {
        console.error("geminiSoilEstimation error:", e.message);
        return {
            soilType: "Alluvial Clay Loam",
            rainfallZone: "Sub-Humid Zone",
            landClassification: "Cultivable Wetland Plain",
            organicMatter: "0.55% (Medium)",
            phLevel: "6.8 (Neutral)",
            suitability: "Rice, Wheat, Tomato, Sugarcane",
            moistureRange: "20% - 25% (Optimal)"
        };
    }
}

module.exports = { 
    geminiChat, 
    geminiTreatmentAdvice, 
    geminiWeatherAdvisory, 
    geminiSpreadAnalysis, 
    geminiFallbackChat,
    geminiVision,
    geminiParseSoilReport,
    geminiCropSuggestions,
    geminiSoilEstimation,
    geminiNutrientGuidance,
    geminiLiveInsights
};
