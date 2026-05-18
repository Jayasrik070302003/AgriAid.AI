const { groqVision, groqChatResponse, groqSimulationSummary } = require('./groqAnalyzer');
const { geminiTreatmentAdvice, geminiWeatherAdvisory, geminiSpreadAnalysis, geminiFallbackChat } = require('./geminiAdvisor');

// STEP 1: Groq analyzes image → disease detection
// STEP 2: Gemini generates treatment + advice
async function analyzeCropImage(imageUrl, cropType, farmingType, location, weather = null) {
    // Step 1 — Groq Vision: detect disease
    let detection;
    try {
        detection = await groqVision(imageUrl, cropType, `${location.district}, ${location.state}`);
    } catch (err) {
        console.warn('[Groq Vision] Failed, using fallback detection:', err.message);
        detection = { crop: cropType, disease: 'Unknown', severity: 'Medium', confidence: 60, status: 'Warning' };
    }

    // Step 2 — Gemini: generate treatment advice
    let treatment;
    try {
        treatment = await geminiTreatmentAdvice(detection.disease, detection.severity, cropType, farmingType, weather);
    } catch (err) {
        console.warn('[Gemini Treatment] Failed, using fallback:', err.message);
        treatment = {
            treatment: { fertilizer: 'Consult local agronomist', quantity: 'As advised', instructions: 'Seek expert guidance.' },
            prevention: 'Monitor crop regularly.',
            organicAlternative: 'Neem oil spray',
            urgency: 'Within 3 days',
            farmerNote: 'Please consult your local agriculture officer for specific advice.'
        };
    }

    return { ...detection, ...treatment };
}

async function getChatResponse(userMessage) {
    try {
        return await groqChatResponse(userMessage);
    } catch (err) {
        console.warn('[Groq Chat] Failed, falling back to Gemini:', err.message);
        return geminiFallbackChat(userMessage);
    }
}

async function getSimulationExplanation(crop, area, organic, chemical, language = 'English') {
    return groqSimulationSummary(crop, area, organic, chemical, language);
}

async function getSpreadAnalysis(cropName, diseaseName, spreadData, weather) {
    return geminiSpreadAnalysis(cropName, diseaseName, spreadData, weather);
}

async function getWeatherAdvisory(location, weatherData) {
    return geminiWeatherAdvisory(location, weatherData);
}

module.exports = { analyzeCropImage, getChatResponse, getSimulationExplanation, getSpreadAnalysis, getWeatherAdvisory };
