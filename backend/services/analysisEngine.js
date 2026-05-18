const { chat } = require('./openrouterService');

async function analyzeCropImage(imageUrl, cropType, farmingType, location) {
    const messages = [
        { role: 'system', content: 'You are AgriAid.AI, an expert agricultural AI. Always respond in valid JSON only.' },
        { role: 'user', content: [
            { type: 'text', text: `Analyze this ${cropType} crop image from ${location.district}, ${location.state}. Farming: ${farmingType}.\nReturn ONLY JSON:\n{"crop":"${cropType}","disease":"name or Healthy","severity":"Low|Medium|High","confidence":0-100,"status":"Healthy|Diseased|Warning","treatment":{"fertilizer":"","quantity":"","instructions":""},"prevention":"","message":""}` },
            { type: 'image_url', image_url: { url: imageUrl } }
        ]}
    ];
    const raw = await chat(messages, { temperature: 0.3, maxTokens: 1024 });
    return JSON.parse(raw.replace(/```json|```/g, '').trim());
}

async function getChatResponse(userMessage) {
    const messages = [
        { role: 'system', content: 'You are Farmer Assistant for AgriAid.AI. Help Indian farmers with crops, diseases, soil, fertilizers. Use simple English with 2-3 emojis. Use Indian seasons (Kharif, Rabi, Zaid). For non-agriculture questions, politely redirect.' },
        { role: 'user', content: userMessage }
    ];
    return chat(messages, { temperature: 0.7, maxTokens: 1024 });
}

async function getSimulationExplanation(crop, area, organic, chemical, language = 'English') {
    const messages = [
        { role: 'system', content: 'You are an expert agriculture consultant. Be concise and data-backed.' },
        { role: 'user', content: `Compare farming for ${crop} on ${area} acres in ${language}:\nChemical: Yield ${chemical.yield}kg, Profit Rs${chemical.profit}, Soil ${chemical.soilHealth}%.\nOrganic: Yield ${organic.yield}kg, Profit Rs${organic.profit}, Soil ${organic.soilHealth}%.\nGive 3 bullet points mentioning profit difference of Rs${Math.abs(organic.profit - chemical.profit).toFixed(0)}.` }
    ];
    return chat(messages, { temperature: 0.6, maxTokens: 512 });
}

async function getSpreadAnalysis(cropName, diseaseName, spreadData, weather) {
    const messages = [
        { role: 'system', content: 'You are an agricultural AI. Return ONLY valid JSON.' },
        { role: 'user', content: `Disease spread for ${cropName} with ${diseaseName}.\n7-day: ${spreadData.risk7}%, 14-day: ${spreadData.risk14}%, Mutation: ${spreadData.mutationRisk}%.\nWeather: ${weather.temp?.toFixed(1)}C, ${weather.humidity?.toFixed(1)}% humidity.\nReturn: {"status":"Diseased|Warning|Healthy","message":"farmer-friendly message","advice":"treatment"}` }
    ];
    const raw = await chat(messages, { temperature: 0.3, maxTokens: 512 });
    return JSON.parse(raw.replace(/```json|```/g, '').trim());
}

async function refineWeatherData(location, weatherData) {
    const messages = [
        { role: 'system', content: 'You are an agricultural weather advisor. Return ONLY valid JSON.' },
        { role: 'user', content: `Refine weather for ${location} and give farming advisory.\nData: ${JSON.stringify(weatherData)}\nReturn: {"location":"","summary":"","temperature":"","condition":"","humidity":"","wind":"","precipitation":"","uv_index":"","advisory":"","alerts":"","refined_forecast":[]}` }
    ];
    const raw = await chat(messages, { temperature: 0.4, maxTokens: 1024 });
    return JSON.parse(raw.replace(/```json|```/g, '').trim());
}

module.exports = { analyzeCropImage, getChatResponse, getSimulationExplanation, getSpreadAnalysis, refineWeatherData };
