const { groqChat }          = require('../services/groqAnalyzer');
const { geminiChat }        = require('../services/geminiAdvisor');
const { getWeatherByCoords } = require('../services/weatherEngine');

// ── GET /api/farmer/simulator/weather-live?lat=&lng= ─────────────────────────
async function getLiveWeather(req, res) {
    try {
        const { lat, lng } = req.query;
        if (!lat || !lng) {
            return res.status(400).json({ success: false, message: 'lat and lng required' });
        }
        console.log('[Weather] Fetch by Coordinates', { lat, lng });
        const weather = await getWeatherByCoords(parseFloat(lat), parseFloat(lng));
        console.log('[Weather] Success');
        res.json({ success: true, data: weather });
    } catch (error) {
        console.error('[Weather] Failed:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch weather data.' });
    }
}

// ── POST /api/farmer/simulator/climate-risk ──────────────────────────────────
// Expects: { crop, state, district, lat, lon, temperature?, humidity?, rainfall? }
// lat/lon are REQUIRED — frontend always sends them (from GPS or district coords)
async function predictClimateRisk(req, res) {
    try {
        const { crop, state, district, lat, lon, temperature, humidity, rainfall } = req.body;

        if (!crop || !state || !district) {
            return res.status(400).json({ success: false, message: 'crop, state, district required' });
        }

        let temp  = temperature;
        let humid = humidity;
        let rain  = rainfall;
        let autoFetched = false;

        // Always prefer coords for weather — never use district name string
        const hasCoords   = lat != null && lon != null;
        const hasWeather  = temp != null && temp !== '' && humid != null && humid !== '';

        if (!hasWeather) {
            if (!hasCoords) {
                console.warn('[ClimateRisk] No coords and no weather — using defaults');
                temp = 28; humid = 65; rain = 0;
            } else {
                console.log('[Weather] Fetch by Coordinates', { lat, lon });
                try {
                    const w = await getWeatherByCoords(parseFloat(lat), parseFloat(lon));
                    temp  = w.temp;
                    humid = w.humidity;
                    rain  = w.precipitation || 0;
                    autoFetched = true;
                    console.log('[Weather] Success', { temp, humid, rain });
                } catch (wErr) {
                    console.error('[Weather] Failed:', wErr.message);
                    temp = 28; humid = 65; rain = 0;
                }
            }
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
  "scientificAnalysis": "3-sentence scientific analysis specific to this crop/location/weather combination.",
  "actionablePrecautions": [
    "Specific chemical or biological intervention",
    "Specific irrigation or shade management tactic",
    "Specific soil or nutrient adjustment"
  ]
}`;

        let aiResponse;
        try {
            aiResponse = await groqChat([{ role: 'user', content: prompt }], { temperature: 0.2, maxTokens: 800 });
        } catch (groqErr) {
            console.warn('[ClimateRisk] Groq failed, falling back to Gemini:', groqErr.message);
            aiResponse = await geminiChat('You are a strict JSON-only API.', prompt, { temperature: 0.2, maxTokens: 800 });
        }

        const parsed = JSON.parse(aiResponse.replace(/```json|```/g, '').trim());

        res.json({
            success: true,
            data: {
                ...parsed,
                autoFetchedWeather: autoFetched,
                weatherData: { temperature: temp, humidity: humid, rainfall: rain }
            }
        });

    } catch (error) {
        console.error('[ClimateRisk] predictClimateRisk Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to generate climate risk prediction' });
    }
}

module.exports = { getLiveWeather, predictClimateRisk };
