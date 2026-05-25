const { groqVision, groqChatResponse, groqCompareScenarios } = require('./groqAnalyzer');
const { geminiTreatmentAdvice, geminiWeatherAdvisory, geminiSpreadAnalysis, geminiFallbackChat, geminiVision } = require('./geminiAdvisor');

// STEP 1: Groq Vision / Gemini Vision analyzes image → validates botanical content & detects species/disease
// STEP 2: Gemini generates treatment + advice
async function analyzeCropImage(imageUrl, location, weather = null) {
    let detection;
    const locString = `${location.village ? location.village + ', ' : ''}${location.taluk ? location.taluk + ' Taluk, ' : ''}${location.district}, ${location.state}, ${location.country} (Coordinates: ${location.latitude || 'N/A'}, ${location.longitude || 'N/A'}, Elevation: ${location.elevation ? location.elevation + 'm' : 'N/A'}, Pincode: ${location.pincode || 'N/A'})`;
    
    try {
        detection = await groqVision(imageUrl, locString);
    } catch (err) {
        console.warn('[Groq Vision] Failed, trying fallback Gemini Vision:', err.message);
        try {
            detection = await geminiVision(imageUrl, locString);
        } catch (gErr) {
            console.error('[Gemini Vision] Fallback failed:', gErr.message);
            // Default safe fallback structure if both APIs fail to reach/parse
            detection = { 
                isValidPlant: true, 
                crop: 'Unknown', 
                scientificName: 'N/A', 
                category: 'field', 
                confidence: 50.00, 
                disease: 'Healthy', 
                severity: 'Low', 
                status: 'Healthy' 
            };
        }
    }

    // Step 1.1: If image is not a valid plant specimen, return early
    if (detection && detection.isValidPlant === false) {
        return { isValidPlant: false };
    }

    // Step 2 — Gemini: generate treatment advice based on auto-detected crop taxonomy
    let treatment;
    const detectedCrop = detection.crop || 'Unknown';
    const detectedCategory = detection.category || 'field';

    try {
        treatment = await geminiTreatmentAdvice(
            detection.disease, 
            detection.severity, 
            detectedCrop, 
            detectedCategory, 
            weather
        );
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

    return { ...detection, ...treatment, isValidPlant: true };
}

async function getChatResponse(userMessage, language = 'EN') {
    const langName = language === 'TA' ? 'Tamil' : language === 'HI' ? 'Hindi' : 'English';
    const langgedMessage = language !== 'EN'
        ? `[Respond ONLY in ${langName}] ${userMessage}`
        : userMessage;
    try {
        return await groqChatResponse(langgedMessage);
    } catch (err) {
        console.warn('[Groq Chat] Failed, falling back to Gemini:', err.message);
        return geminiFallbackChat(langgedMessage);
    }
}

async function getSimulationExplanation(base, scenarioA, scenarioB, language = 'English') {
    return groqCompareScenarios(base, scenarioA, scenarioB, language);
}

async function getSpreadAnalysis(cropName, diseaseName, spreadData, weather) {
    return geminiSpreadAnalysis(cropName, diseaseName, spreadData, weather);
}

async function getWeatherAdvisory(location, weatherData) {
    return geminiWeatherAdvisory(location, weatherData);
}

module.exports = { analyzeCropImage, getChatResponse, getSimulationExplanation, getSpreadAnalysis, getWeatherAdvisory };
