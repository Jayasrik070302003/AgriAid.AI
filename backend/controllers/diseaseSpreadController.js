const db = require('../config/database');

const MOCK_WEATHER = {
    'Tamil Nadu': { temp: 30, humidity: 75, rain: 0.2, wind: 12 },
    'Kerala': { temp: 28, humidity: 85, rain: 0.8, wind: 10 },
    'Unknown': { temp: 25, humidity: 60, rain: 0.0, wind: 5 }
};

const DISEASE_R0 = {
    'Blast': 1.8,
    'Rust': 2.2,
    'Blight': 1.5,
    'Mosaic': 1.2,
    'Default': 1.4
};

const allowedDiseases = {
    Rice: ["Rice Brown Spot", "Rice Blast", "Bacterial Leaf Blight", "Healthy"],
    Tomato: ["Tomato Early Blight", "Tomato Leaf Curl Virus", "Tomato Septoria Leaf Spot", "Healthy"],
    Potato: ["Potato Early Blight", "Potato Late Blight", "Healthy"]
};

function getStatusByConfidence(confidence, prediction) {
    if (prediction === "Healthy" || prediction.toLowerCase().includes("healthy")) return "Healthy";
    if (confidence >= 0.80) return "Diseased";
    if (confidence >= 0.60) return "Warning";
    return "Healthy";
}

exports.predictSpread = async (req, res) => {
    try {
        const { cropName, diseaseName, severity, farmSize, state, district } = req.body;
        console.log(`Analyzing spread for ${diseaseName} on ${cropName} in ${state}, ${district}`);

        // 1. Weather Simulation (Mock based on location)
        const baseWeather = MOCK_WEATHER[state] || MOCK_WEATHER['Unknown'];
        // Add some random variance
        const weather = {
            temp: baseWeather.temp + (Math.random() * 4 - 2),
            humidity: Math.min(100, baseWeather.humidity + (Math.random() * 10 - 5)),
            rain: Math.max(0, baseWeather.rain + (Math.random() * 0.5 - 0.2)),
            wind: baseWeather.wind + (Math.random() * 5 - 2)
        };

        // 2. Spread Factor Calculation for Grid Simulation
        // Base R0
        let r0 = DISEASE_R0['Default'];
        for (const key in DISEASE_R0) {
            if (diseaseName.includes(key)) r0 = DISEASE_R0[key];
        }

        // Environmental Modifiers
        let spreadModifier = 1.0;
        if (weather.humidity > 80) spreadModifier += 0.3; // Fungal loves humidity
        if (weather.wind > 15) spreadModifier += 0.2; // Wind carries spores
        if (weather.temp > 25 && weather.temp < 32) spreadModifier += 0.15; // Optimal temp

        const spreadProb = (r0 * spreadModifier) / 8.0; // Normalize for 8 neighbors

        // 3. Grid Simulation (Cellular Automata)
        const gridSize = 20;
        let grid = Array(gridSize).fill().map(() => Array(gridSize).fill(0));

        // Initial Infection Centers based on severity (0-1)
        const numCenters = Math.max(1, Math.ceil(severity * 5));
        for (let k = 0; k < numCenters; k++) {
            const cx = Math.floor(Math.random() * gridSize);
            const cy = Math.floor(Math.random() * gridSize);
            grid[cx][cy] = Math.max(0.5, Math.random()); // Initial intensity
        }

        const riskTimeline = [];
        let infectionCount7 = 0;
        let infectionCount14 = 0;

        // Run 14 Days simulation
        for (let day = 1; day <= 14; day++) {
            const newGrid = grid.map(row => [...row]); // Deep copy
            let infectedCells = 0;

            for (let i = 0; i < gridSize; i++) {
                for (let j = 0; j < gridSize; j++) {
                    if (grid[i][j] > 0) {
                        // Grow existing infection
                        newGrid[i][j] = Math.min(1.0, grid[i][j] + 0.1);

                        // Spread to neighbors
                        // 8 neighbors
                        for (let dx = -1; dx <= 1; dx++) {
                            for (let dy = -1; dy <= 1; dy++) {
                                if (dx === 0 && dy === 0) continue;
                                const nx = i + dx;
                                const ny = j + dy;
                                if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize) {
                                    // Probabilistic spread
                                    if (Math.random() < spreadProb * grid[i][j]) {
                                        // Infect neighbor if not already high
                                        if (newGrid[nx][ny] < 0.2) {
                                            newGrid[nx][ny] += 0.1; // New infection starts low
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (newGrid[i][j] > 0.1) infectedCells++;
                }
            }
            grid = newGrid;

            if (day === 7) infectionCount7 = infectedCells;
            if (day === 14) infectionCount14 = infectedCells;
        }

        const totalCells = gridSize * gridSize;
        const prediction = {
            risk7: Math.round((infectionCount7 / totalCells) * 100),
            risk14: Math.round((infectionCount14 / totalCells) * 100),
            heatmap: grid
        };

        // 4. Mutation Risk Calculation
        // Proxy Score: High variance in weather stress + High Infection Load = High Mutation Risk
        const weatherStress = (Math.abs(weather.temp - 25) + (weather.humidity > 80 ? 10 : 0)) / 20; // 0-1
        const infectionLoad = prediction.risk14 / 100; // 0-1
        const mutationRisk = Math.round((weatherStress * 0.4 + infectionLoad * 0.6) * 100);

        // 5. Strictly Enforced AI Analysis (Gemini Integration)
        let aiResult = {
            status: "Healthy",
            message: "Simulation ready.",
            advice: "Maintain monitor."
        };

        const confidence = req.body.confidence || (0.5 + Math.random() * 0.4); // Use provided or generate realistic fallback
        
        try {
            console.log("Generating Strict Outbreak AI Assessment...");
            const strictPrompt = `You are an agricultural AI assistant for AgriAid.AI.

STRICT RULES (MUST FOLLOW):
1. You MUST always respect the selected crop type.
2. You MUST NEVER output diseases from other crops.
3. You MUST use the given model prediction and confidence — DO NOT override it.
4. You MUST NOT hallucinate diseases.
5. You MUST always return a result (never empty).
6. You MUST classify output into one of 3 categories: Diseased, Warning, Healthy.

DECISION LOGIC:
- If confidence >= 0.80 → status = "Diseased"
- If confidence >= 0.60 and < 0.80 → status = "Warning"
- If confidence < 0.60 → status = "Healthy"

CROP DISEASE LIST:
Rice: [Rice Brown Spot, Rice Blast, Bacterial Leaf Blight, Healthy]
Tomato: [Tomato Early Blight, Tomato Leaf Curl Virus, Tomato Septoria Leaf Spot, Healthy]
Potato: [Potato Early Blight, Potato Late Blight, Healthy]

VALIDATION:
- If predicted disease does not belong to selected crop → mark as "Mismatch"
- If prediction is "Healthy" → always set status = "Healthy"

OUTPUT FORMAT (STRICT JSON ONLY):
{
  "crop": "",
  "prediction": "",
  "confidence": "",
  "status": "",
  "message": "",
  "advice": ""
}

EXPLANATION RULES:
- Keep message simple and farmer-friendly
- If status = Warning → say "possible early-stage disease"
- If status = Healthy → reassure user
- If status = Diseased → suggest treatment`;

            const userInput = `
Input Data:
Crop: ${cropName}
Predicted Disease: ${diseaseName}
Confidence: ${confidence.toFixed(2)}
Simulation Results: 7-day spread ${prediction.risk7}%, 14-day spread ${prediction.risk14}%, Mutation Risk ${mutationRisk}%.
Weather: ${weather.temp.toFixed(1)}C, ${weather.humidity.toFixed(1)}% Humidity.
`;

            const { GoogleGenerativeAI } = require("@google/generative-ai");
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            
            const result = await model.generateContent(strictPrompt + "\n" + userInput);
            const response = await result.response;
            const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
            
            aiResult = JSON.parse(text);
        } catch (aiError) {
            console.error("Gemini Spread error:", aiError.message);
            // Fallback to manual logic if AI fails
            const status = getStatusByConfidence(confidence, diseaseName);
            aiResult = {
                crop: cropName,
                prediction: diseaseName,
                confidence: confidence.toFixed(2),
                status: status,
                message: status === "Warning" ? "Possible early-stage disease detected." : status === "Healthy" ? "Your crop looks healthy." : "Action required to manage disease.",
                advice: "Monitor closely."
            };
        }

        const explanation = aiResult.message + " " + aiResult.advice;

        // 6. DB Storage
        const inputParams = { severity, farmSize, weather };
        const query = `
            INSERT INTO disease_spread_predictions 
            (user_id, crop_name, disease_name, location, farm_size, risk_7_days, risk_14_days, mutation_risk_score, heatmap_data, input_params)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await db.query(query, [
            1, // Default User
            cropName,
            diseaseName,
            `${district}, ${state}`,
            farmSize,
            prediction.risk7,
            prediction.risk14,
            mutationRisk,
            JSON.stringify(grid),
            JSON.stringify(inputParams)
        ]);

        res.json({
            success: true,
            data: {
                ...prediction,
                mutationRisk,
                explanation,
                aiResult,
                weather
            }
        });

    } catch (error) {
        console.error("Spread Prediction Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM disease_spread_predictions ORDER BY created_at DESC LIMIT 20');
        res.json({ success: true, data: { history: rows } });
    } catch (error) {
        console.error("Fetch History Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
