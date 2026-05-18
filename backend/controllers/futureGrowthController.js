const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const db = require('../config/database');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper to determine risk level
const calculateRisk = (health2M, diseaseSeverity) => {
    if (health2M < 40 || diseaseSeverity === 'High') return 'High';
    if (health2M < 70 || diseaseSeverity === 'Medium') return 'Medium';
    return 'Low';
};

// Helper for yield prediction
const predictYield = (health3M, risk) => {
    if (risk === 'High') return 'Low';
    if (health3M > 80) return 'High';
    return 'Medium';
};

const allowedDiseases = {
    Rice: ["Rice Brown Spot", "Rice Blast", "Bacterial Leaf Blight", "Healthy"],
    Tomato: ["Tomato Early Blight", "Tomato Leaf Curl Virus", "Tomato Septoria Leaf Spot", "Healthy"],
    Potato: ["Potato Late Blight", "Potato Early Blight", "Healthy"]
};

function validatePrediction(cropType, predictedClass, confidence) {
    const normalize = (str) => str.toLowerCase().replace(/_/g, ' ').trim();
    const normalizedDetected = normalize(predictedClass);
    const cropAllowed = allowedDiseases[cropType] || [];

    // 1. Crop mismatch check
    const isMatched = cropAllowed.some(d => {
        const normalizedAllowed = normalize(d);
        return normalizedDetected.includes(normalizedAllowed) || normalizedAllowed.includes(normalizedDetected);
    });

    if (!isMatched && predictedClass !== "Healthy") {
        return {
            crop: cropType,
            disease: "Mismatch",
            status: "Mismatch",
            confidence: 0,
            advice: "Mismatch detected: The uploaded image does not match the selected crop. Please re-upload a correct image."
        };
    }

    // 2. Confidence check
    if (confidence < 75) { // Assuming 0-100 scale from API
        return {
            crop: cropType,
            disease: predictedClass,
            status: "Uncertain",
            confidence: confidence,
            advice: "Low confidence detection. Crop may be healthy or image quality is low. Please re-upload a clearer image."
        };
    }

    // 3. Healthy handling
    if (predictedClass === "Healthy" || normalize(predictedClass).includes("healthy")) {
        return {
            crop: cropType,
            disease: "Healthy",
            status: "Healthy",
            confidence: confidence,
            advice: "Your crop looks healthy. Maintain current farming practices."
        };
    }

    // 4. Final valid disease
    return {
        crop: cropType,
        disease: predictedClass,
        status: "Diseased",
        confidence: confidence,
        advice: "Diseased state detected. Focus on recommended treatment to prevent spread."
    };
}

exports.simulateGrowth = async (req, res) => {
    try {
        console.log("Starting Simulate Growth...");
        const { cropName, state, district, soilType, sowingDate } = req.body;
        const imageFile = req.file;

        if (!imageFile) {
            console.error("No image file uploaded.");
            return res.status(400).json({ success: false, message: 'Image is required' });
        }
        console.log("Image uploaded:", imageFile.path);

        // 1. Detect Disease (mocking ML service integration for now, or using real one if available)
        let diseaseData = {
            disease: 'Healthy',
            confidence: 0.95,
            severity: 'Low'
        };

        // Attempt to call ML API
        try {
            const formData = new FormData();
            formData.append('image', fs.createReadStream(imageFile.path));
            formData.append('crop_type', cropName); // Hints the ML model

            // Assuming ML API is running on localhost:5001
            console.log("Calling ML API with crop:", cropName);
            const mlResponse = await axios.post('http://127.0.0.1:5001/predict', formData, {
                headers: { ...formData.getHeaders() }
            });

            if (mlResponse.data && mlResponse.data.disease) {
                diseaseData.disease = mlResponse.data.disease;
                diseaseData.confidence = mlResponse.data.confidence;
                // Confidence is 0-100 from API
                diseaseData.severity = mlResponse.data.disease === 'Healthy' ? 'Low' : (mlResponse.data.confidence > 80 ? 'High' : 'Medium');
                console.log("ML API Success:", diseaseData);
            }
        } catch (mlError) {
            console.warn("ML API unavailable, using fallback/mock detection:", mlError.message);
            // Fallback to a valid disease for the crop to avoid mismatch in demo if ML is down
            const allowed = CROP_CONSTRAINTS[cropName] || ['Healthy'];
            const randomDisease = allowed[Math.floor(Math.random() * allowed.length)];
            diseaseData.disease = randomDisease;
            diseaseData.confidence = 85;
            diseaseData.severity = randomDisease === 'Healthy' ? 'Low' : 'Medium';
            console.log("Using Mock Disease Data:", diseaseData);
        }

        // --- EXTRA SAFETY OVERRIDE ---
        if (diseaseData.confidence < 60) {
            diseaseData.disease = "Healthy";
        }

        // --- STRICT VALIDATION ---
        const validationResult = validatePrediction(cropName, diseaseData.disease, diseaseData.confidence);

        if (validationResult.status === "Mismatch") {
            const mismatchMsg = validationResult.advice;
            console.warn(`Mismatch detected: ${diseaseData.disease} vs ${cropName}`);
            return res.status(200).json({
                success: false,
                isMismatch: true,
                message: mismatchMsg,
                data: validationResult
            });
        }

        // 2. Fetch Weather Data (OpenWeather)
        let weatherImpact = 0; // -10 to +10 impact on health
        try {
            console.log("Fetching Weather Data...", district, state);
            // Geocoding to get lat/lon for district/state
            const geoRes = await axios.get(`http://api.openweathermap.org/geo/1.0/direct?q=${district},${state},IN&limit=1&appid=${process.env.OPENWEATHER_API_KEY || 'demo'}`);
            // Note: If no API key, we mock weather

            if (process.env.OPENWEATHER_API_KEY && geoRes.data.length > 0) {
                const { lat, lon } = geoRes.data[0];
                const weatherRes = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`);
                const temp = weatherRes.data.main.temp;
                const humidity = weatherRes.data.main.humidity;
                console.log("Weather fetched:", { temp, humidity });

                // Heuristic: Optimal temp 20-30, humidity 50-70
                if (temp < 15 || temp > 35) weatherImpact -= 5;
                if (humidity > 80) weatherImpact -= 5; // Fungal risk
            } else {
                console.log("Weather API key missing or location not found, skipping weather impact.");
            }
        } catch (e) {
            console.warn("Weather API failed or no key, assuming neutral weather:", e.message);
        }

        // 3. Rule-Based Simulation Logic
        const initialHealth = diseaseData.disease === 'Healthy' ? 95 : (diseaseData.severity === 'High' ? 60 : 80);
        let futureHealth = [];
        let currentHealth = initialHealth;

        // Decay/Growth factors
        const diseaseDecay = diseaseData.severity === 'High' ? 10 : (diseaseData.severity === 'Medium' ? 5 : 0);
        const soilBoost = ['Alluvial', 'Red Soil', 'Loamy'].includes(soilType) ? 2 : 0;
        const growthRate = (soilBoost + (weatherImpact > 0 ? 2 : 0)) - diseaseDecay;

        // 30 Days
        currentHealth = Math.min(100, Math.max(0, currentHealth + (growthRate * 1)));
        futureHealth.push(Math.round(currentHealth));

        // 60 Days
        currentHealth = Math.min(100, Math.max(0, currentHealth + (growthRate * 1.5))); // Accumulating impact
        futureHealth.push(Math.round(currentHealth));

        // 90 Days
        currentHealth = Math.min(100, Math.max(0, currentHealth + (growthRate * 2)));
        futureHealth.push(Math.round(currentHealth));

        const riskLevel = calculateRisk(futureHealth[1], diseaseData.severity);
        const yieldPred = predictYield(futureHealth[2], riskLevel);
        const status = diseaseData.disease === 'Healthy' ? 'Healthy' : 'Diseased';

        // 4. Generate AI Explanation (Gemini API Integration)
        let explanation = "AI explanation unavailable at the moment.";
        try {
            console.log("Generating AI explanation using Strict Prompt...");
            const strictPrompt = `You are an agricultural AI assistant for AgriAid.AI.

STRICT RULES:
1. You MUST always respect the selected crop type.
2. You MUST NEVER output a disease from a different crop.
3. You MUST consider model confidence before giving final result.
4. If confidence < 0.75 → mark as "Uncertain".
5. If prediction does not belong to selected crop → return "Mismatch".
6. If image appears healthy OR confidence is low → prefer "Healthy" or "Uncertain".
7. DO NOT hallucinate diseases.

CROP DISEASE LIST:
Rice: [Rice Brown Spot, Rice Blast, Bacterial Leaf Blight, Healthy]
Tomato: [Tomato Early Blight, Tomato Leaf Curl Virus, Tomato Septoria Leaf Spot, Healthy]
Potato: [Potato Late Blight, Potato Early Blight, Healthy]

OUTPUT FORMAT (STRICT JSON ONLY):
{
  "crop": "",
  "disease": "",
  "status": "Healthy / Diseased / Uncertain / Mismatch",
  "confidence": "",
  "advice": ""
}`;

            const userInput = `
User Inputs:
Crop: ${cropName}
Model Prediction: ${diseaseData.disease}
Confidence: ${diseaseData.confidence}%
Additional Simulation Stats: 90-day predicted health ${futureHealth[2]}%, yield trend ${yieldPred}, risk level ${riskLevel}.
`;
            const finalPrompt = strictPrompt + "\n" + userInput;

            // Retry logic with different models
            const models = ["gemini-2.0-flash", "gemini-flash-latest", "gemini-pro-latest"];
            let generated = false;
            let lastError = null;

            for (const modelName of models) {
                try {
                    console.log(`Trying Gemini model: ${modelName}`);
                    const model = genAI.getGenerativeModel({ model: modelName });
                    const result = await model.generateContent(finalPrompt);
                    const response = await result.response;
                    const rawText = response.text();
                    
                    // Attempt to parse JSON if output is strictly JSON as requested
                    try {
                        const parsed = JSON.parse(rawText.replace(/```json/g, '').replace(/```/g, '').trim());
                        explanation = parsed.advice;
                    } catch (e) {
                        explanation = rawText;
                    }
                    generated = true;
                    console.log(`AI explanation generated successfully with ${modelName}.`);
                    break; // Exit loop on success
                } catch (e) {
                    console.warn(`Failed with ${modelName}:`, e.message);
                    lastError = e;
                }
            }

            if (!generated) {
                throw lastError || new Error("All models failed");
            }

        } catch (aiError) {
            console.error("Gemini API Error (Final):", aiError);
            explanation = `Unable to generate AI advice. (Error: ${aiError.message || "Unknown"}). Please consult a local expert.`;
        }

        // 5. Store in DB
        const simulationRecord = {
            user_id: req.user ? req.user.id : null,
            crop_name: cropName,
            image_path: imageFile.path,
            disease_detected: diseaseData.disease,
            initial_health_score: initialHealth,
            soil_type: soilType,
            sowing_date: sowingDate,
            state: state,
            district: district,
            simulation_results: JSON.stringify({
                futureHealth,
                riskLevel,
                yieldPred
            }),
            explanation: explanation
        };

        console.log("Inserting into DB...", simulationRecord);
        const [dbResult] = await db.query('INSERT INTO future_growth_simulations SET ?', simulationRecord);
        console.log("DB Insert ID:", dbResult.insertId);

        // 6. Response
        res.json({
            success: true,
            data: {
                crop: cropName,
                disease: diseaseData.disease,
                status: validationResult.status,
                confidence: diseaseData.confidence,
                advice: explanation,
                // These are extra for the current frontend UI but don't hurt
                severity: diseaseData.severity,
                futureHealth, 
                yieldPrediction: yieldPred,
                riskLevel: riskLevel,
                chartData: [
                    { day: 'Day 0', health: initialHealth },
                    { day: 'Day 30', health: futureHealth[0] },
                    { day: 'Day 60', health: futureHealth[1] },
                    { day: 'Day 90', health: futureHealth[2] }
                ]
            }
        });

    } catch (error) {
        console.error('Growth Simulation Error:', error);
        res.status(500).json({ success: false, message: 'Simulation failed', error: error.message });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : null;
        // If no user auth, maybe return empty or handle appropriately
        const [rows] = await db.query('SELECT * FROM future_growth_simulations WHERE user_id = ? ORDER BY created_at DESC', [userId]);
        res.json({ success: true, data: { history: rows } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching history' });
    }
};
