const { groqChat } = require('../services/groqAnalyzer');
const { geminiChat } = require('../services/geminiAdvisor');
const { getWeatherByCoords } = require('../services/weatherEngine');

async function getLiveWeather(req, res) {
    try {
        const { lat, lng } = req.query;
        if (!lat || !lng) {
            return res.status(400).json({ success: false, message: 'Latitude and longitude are required' });
        }
        const weather = await getWeatherByCoords(lat, lng);
        res.json({ success: true, data: weather });
    } catch (error) {
        console.error('[ClimateRiskController] getLiveWeather Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch weather data.' });
    }
}

async function predictClimateRisk(req, res) {
    try {
        const { crop, state, district, temperature, humidity, rainfall } = req.body;

        console.log('[ClimateRisk] Received request:', { crop, state, district, temperature, humidity, rainfall });

        if (!crop || !state || !district) {
            return res.status(400).json({ success: false, message: 'Crop, state, and district are required' });
        }

        // Auto-fetch weather if not provided (check for empty, null, or undefined)
        let temp = temperature;
        let humid = humidity;
        let rain = rainfall;

        const needsWeatherFetch = 
            temp === undefined || temp === null || temp === '' || 
            humid === undefined || humid === null || humid === '' || 
            rain === undefined || rain === null || rain === '';

        if (needsWeatherFetch) {
            console.log('[ClimateRisk] Weather data missing, attempting auto-fetch...');
            try {
                const { getWeatherByCity } = require('../services/weatherEngine');
                const locationQuery = `${district}, ${state}, India`;
                console.log('[ClimateRisk] Fetching weather for:', locationQuery);
                const weatherData = await getWeatherByCity(locationQuery);
                
                temp = (temp === undefined || temp === null || temp === '') ? weatherData.temp : temp;
                humid = (humid === undefined || humid === null || humid === '') ? weatherData.humidity : humid;
                rain = (rain === undefined || rain === null || rain === '') ? (weatherData.precipitation || 0) : rain;
                
                console.log(`[ClimateRisk] Auto-fetched weather: ${temp}°C, ${humid}%, ${rain}mm`);
            } catch (weatherErr) {
                console.error('[ClimateRisk] Weather fetch error:', weatherErr.message);
                // Use default values instead of failing
                temp = temp || 28;
                humid = humid || 65;
                rain = rain || 0;
                console.log(`[ClimateRisk] Using default weather values: ${temp}°C, ${humid}%, ${rain}mm`);
            }
        } else {
            console.log('[ClimateRisk] Using provided weather data:', { temp, humid, rain });
        }

        const prompt = `You are AgriAid.AI's expert Agricultural Climate Scientist.
Analyze the following environmental conditions and evaluate the biological risks for the specified crop.

Location: ${district}, ${state}, India
Crop: ${crop}
Current Temperature: ${temp}°C
Relative Humidity: ${humid}%
Rainfall/Precipitation: ${rain}mm

Evaluate the specific risks based on the biological thresholds of this crop and the provided weather metrics.
You MUST output exactly one raw JSON object matching the schema below.
No markdown, no backticks, no extra text.

{
  "diseaseRisk": "Low" | "Moderate" | "High" | "Critical",
  "droughtRisk": "Low" | "Moderate" | "High" | "Critical",
  "floodRisk": "Low" | "Moderate" | "High" | "Critical",
  "heatStressRisk": "Low" | "Moderate" | "High" | "Critical",
  "scientificAnalysis": "Write a highly specific, scientific 3-sentence analysis explaining the exact interaction between the current weather (temp/humidity/rain) and the crop's biological needs in this specific region. e.g., 'Tomato crops in Chennai currently face high fungal disease risk due to elevated 90% humidity combined with 35C heat.'",
  "actionablePrecautions": [
    "Highly specific chemical or biological intervention",
    "Specific irrigation or shade management tactic",
    "Specific soil or nutrient adjustment"
  ]
}`;

        let aiResponse;
        try {
            const messages = [{ role: 'user', content: prompt }];
            aiResponse = await groqChat(messages, { temperature: 0.2, maxTokens: 800 });
        } catch (groqError) {
            console.warn('[ClimateRiskController] Groq failed, falling back to Gemini', groqError.message);
            aiResponse = await geminiChat("You are a strict JSON responding API.", prompt, { temperature: 0.2, maxTokens: 800 });
        }

        // Clean up markdown block if the AI ignored the instruction
        const cleanJson = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedResponse = JSON.parse(cleanJson);

        res.json({
            success: true,
            data: {
                ...parsedResponse,
                autoFetchedWeather: !temperature || !humidity || !rainfall,
                weatherData: { temperature: temp, humidity: humid, rainfall: rain }
            }
        });

    } catch (error) {
        console.error('[ClimateRiskController] predictClimateRisk Error:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to generate climate risk prediction'
        });
    }
}

module.exports = { getLiveWeather, predictClimateRisk };
