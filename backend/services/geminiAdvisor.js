const axios = require('axios');

const GEMINI_MODEL = 'gemini-2.0-flash';
const BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

async function geminiChat(systemPrompt, userMessage, { temperature = 0.7, maxTokens = 1024 } = {}) {
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set');

    const body = {
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { temperature, maxOutputTokens: maxTokens }
    };

    const res = await axios.post(`${BASE_URL}?key=${process.env.GEMINI_API_KEY}`, body, { timeout: 30000 });
    return res.data.candidates[0].content.parts[0].text;
}

function parseJSON(raw) {
    return JSON.parse(raw.replace(/```json|```/g, '').trim());
}

async function geminiTreatmentAdvice(disease, severity, cropType, farmingType, weather) {
    const systemPrompt = `You are an expert agricultural advisor for Indian farmers. Respond ONLY with valid JSON.`;
    const userMessage = `Crop: ${cropType}, Disease: ${disease}, Severity: ${severity}, Farming: ${farmingType}.
Weather: Temp ${weather?.temp || 'N/A'}°C, Humidity ${weather?.humidity || 'N/A'}%.

Return ONLY this JSON:
{
  "treatment": { "fertilizer": "", "quantity": "", "instructions": "" },
  "prevention": "",
  "organicAlternative": "",
  "urgency": "Immediate|Within 3 days|Within a week",
  "farmerNote": ""
}`;

    const raw = await geminiChat(systemPrompt, userMessage, { temperature: 0.3, maxTokens: 1024 });
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

module.exports = { geminiChat, geminiTreatmentAdvice, geminiWeatherAdvisory, geminiSpreadAnalysis, geminiFallbackChat };
