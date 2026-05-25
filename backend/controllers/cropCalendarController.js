const logger = require('../utils/logger');
const { groqChat } = require('../services/groqAnalyzer');
const { geminiChat } = require('../services/geminiAdvisor');
const { getWeatherByCoords } = require('../services/weatherEngine');

function parseJSON(raw) {
    try {
        const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
    } catch (e) {
        throw new Error('Failed to parse AI response as JSON');
    }
}

exports.autocompleteCrop = async (req, res) => {
    try {
        const { query, language = 'English' } = req.body;
        if (!query || query.length < 2) {
            return res.status(200).json({ success: true, suggestions: [] });
        }

        const prompt = `You are a crop transliteration and suggestion AI for AgriAid.AI.
The user typed: "${query}" in language context: ${language}.
This might be misspelled, in transliterated Hindi (e.g. tamatar), transliterated Tamil (e.g. thakali, nel), or English.
Return exactly a raw JSON array of up to 4 formalized crop names (e.g. ["Tomato", "Tomato Cherry", "Tomato Hybrid"]).
Do not include markdown or backticks. Just the raw array like ["Crop1", "Crop2"].`;

        const messages = [{ role: 'user', content: prompt }];
        const rawResponse = await groqChat(messages, { temperature: 0.2, maxTokens: 100 });
        const suggestions = parseJSON(rawResponse);

        res.status(200).json({ success: true, suggestions: Array.isArray(suggestions) ? suggestions : [] });
    } catch (error) {
        logger.error(`autocompleteCrop error: ${error.message}`);
        res.status(500).json({ success: false, message: 'Autocomplete failed' });
    }
};

exports.generateCropSchedule = async (req, res) => {
    try {
        const { crop, sowing_date, state, district, latitude, longitude, language = 'English' } = req.body;

        if (!crop || !sowing_date || !state) {
            return res.status(400).json({ success: false, message: 'crop, sowing_date and state are required' });
        }

        // Fetch live weather via exact coordinates
        let weather = null;
        if (latitude && longitude) {
            try {
                weather = await getWeatherByCoords(latitude, longitude);
            } catch (e) {
                logger.warn(`Exact coord weather fetch failed: ${e.message}`);
            }
        }

        const sowingDateStr = new Date(sowing_date).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'long', year: 'numeric'
        });

        const weatherContext = weather
            ? `LIVE WEATHER OVERRIDE (Lat: ${latitude}, Lon: ${longitude}): ${weather.temp}°C, ${weather.condition}, Humidity ${weather.humidity}%, Rainfall ${weather.precipitation || 0}mm.`
            : 'Live weather unavailable. Fallback to seasonal averages.';

        const systemPrompt = `You are AgriAid.AI's Chief Agronomist. 
You must act as a dynamic, intelligent lifecycle planner for the requested crop. 
DO NOT USE STATIC TEMPLATES. The number of biological stages and their descriptions must precisely match the real lifecycle of the crop requested.
Generate the response entirely in the language: ${language}.
Output ONLY valid JSON matching this exact schema:
{
  "crop": "Formalized Name",
  "scientific_name": "Botanical Name",
  "total_duration_days": Number,
  "yield_confidence": Number (0-100),
  "water_intensity": "High|Medium|Low",
  "farming_difficulty": "Easy|Moderate|Hard",
  "market_demand": "High|Medium|Low",
  "best_selling_month": "Month in ${language}",
  "recommended_sowing_window": "Timeframe in ${language}",
  "ai_warnings_banner": "Critical alert based on crop/weather in ${language}",
  "season": "Kharif|Rabi|Zaid",
  "harvest_window": { "early": "YYYY-MM-DD", "optimal": "YYYY-MM-DD", "late": "YYYY-MM-DD" },
  "ai_summary": "Intelligent paragraph evaluating the crop viability in this location with the current weather.",
  "timeline": [
    {
      "stage": "Dynamic Stage Name (e.g. Sprouting, Tillering, depending on crop)",
      "start_date": "YYYY-MM-DD",
      "end_date": "YYYY-MM-DD",
      "duration_days": Number,
      "description": "Biological description of this stage",
      "weather_suggestion": "How current weather affects this stage",
      "advisory": {
        "irrigation": "Specific watering tactic",
        "fertilizer": "Specific chemical/organic inputs",
        "pest": "Most likely pest and mitigation",
        "risk_level": "High|Medium|Low"
      }
    }
  ],
  "soil_requirements": "Soil needs in ${language}",
  "market_outlook": "Market outlook in ${language}",
  "critical_warnings": ["Warning 1", "Warning 2"]
}`;

        const userMessage = `Crop: ${crop}
Sowing Date: ${sowingDateStr}
Location: ${district}, ${state}, India
Requested Output Language: ${language}
${weatherContext}

Determine the EXACT number of biological stages this crop requires. Do not force it into a 5-stage or 8-stage template.
Translate ALL string values (except keys, YYYY-MM-DD dates, and enums High|Medium|Low, Easy|Moderate|Hard, Kharif|Rabi|Zaid) into ${language}.
Return raw JSON only.`;

        let rawResponse = '';
        try {
            logger.info(`Generating intelligent calendar for ${crop} via Groq`);
            const messages = [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage }
            ];
            rawResponse = await groqChat(messages, { temperature: 0.3, maxTokens: 5000 });
        } catch (groqError) {
            logger.warn(`Groq failed, falling back to Gemini: ${groqError.message}`);
            rawResponse = await geminiChat(systemPrompt, userMessage, { temperature: 0.3, maxTokens: 5000 });
        }

        const schedule = parseJSON(rawResponse);
        res.status(200).json({ success: true, data: schedule });

    } catch (error) {
        logger.error(`generateCropSchedule error: ${error.message}`);
        res.status(500).json({ success: false, message: error.message || 'Failed to generate schedule' });
    }
};
