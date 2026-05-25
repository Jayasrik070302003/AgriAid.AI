const logger = require('../utils/logger');
const { geminiChat, geminiParseSoilReport } = require('../services/geminiAdvisor');

function parseJSON(raw) {
    return JSON.parse(raw.replace(/```json|```/g, '').trim());
}

// ── Soil Health Analysis ─────────────────────────────────────────
exports.soilAnalysis = async (req, res) => {
    try {
        const { 
            ph, 
            nitrogen, 
            phosphorus, 
            potassium, 
            carbon, 
            cropName = '', 
            soilType = '', 
            location = {}, 
            weather = {}, 
            language = 'EN' 
        } = req.body;

        if (!ph) return res.status(400).json({ success: false, message: 'pH is required' });

        const system = `You are a precision agronomist and soil scientist specializing in Indian agricultural soils.
You must analyze the provided soil parameters and contextual details and return ONLY a valid, raw JSON object matching the schema below.
No markdown wrappers, no backticks, no trailing explanation.

Your assessment must be realistic and scientifically explainable. Use these agronomic ranges for Indian farming soils as guidance:
- pH: 6.5 - 7.5 is Optimal. <6.0 is Acidic. >8.0 is Alkaline.
- Nitrogen (N): Low < 280 kg/ha, Medium 280-560 kg/ha, High > 560 kg/ha.
- Phosphorus (P): Low < 23 kg/ha, Medium 23-57 kg/ha, High > 57 kg/ha.
- Potassium (K): Low < 140 kg/ha, Medium 140-330 kg/ha, High > 330 kg/ha.
- Organic Carbon (OC): Low < 0.50%, Medium 0.50-0.75%, High > 0.75%.

Calculate the Soil Health Score (0-100) dynamically using the balance of N, P, K, Organic Carbon, and pH.

Return response in the language specified: ${language} (EN = English, TA = Tamil, HI = Hindi). Provide translation for all text properties inside the JSON object! Keep keys in English, but translate the values.

Return ONLY this JSON format:
{
  "score": 82,
  "status": "Optimal|Good|Fair|Poor",
  "summary": "Detailed professional agronomist summary of the soil profile.",
  "ph_interpretation": "pH interpretation text.",
  "nutrients": {
    "n": { "status": "Low|Medium|High", "value": 280, "ideal": "280-560 kg/ha", "suggestion": "Nitrogen recommendation description." },
    "p": { "status": "Low|Medium|High", "value": 35, "ideal": "23-57 kg/ha", "suggestion": "Phosphorus recommendation description." },
    "k": { "status": "Low|Medium|High", "value": 210, "ideal": "140-330 kg/ha", "suggestion": "Potassium recommendation description." },
    "carbon": { "status": "Low|Medium|High", "value": 0.6, "ideal": "0.50-0.75%", "suggestion": "Organic carbon suggestion description." }
  },
  "suitable_crops": [
    { "name": "Crop Name", "compatibility_pct": 92, "reason": "Reason for compatibility." }
  ],
  "fertility_suggestions": [
    { "title": "Recommendation Title", "desc": "Detailed chemical/npk/organic balancing suggestion.", "type": "urgent|warning|tip|good" }
  ],
  "organic_tips": [
    "Tip 1",
    "Tip 2"
  ],
  "irrigation_advice": "Detailed irrigation scheduling advice considering soil type and weather context.",
  "risks": [
    { "risk_name": "Salinity|Erosion|Compaction|Acidification|Leaching", "level": "Low|Medium|High", "description": "Specific risk warning details." }
  ]
}`;

        const user = `Soil Parameters:
pH: ${ph}
Nitrogen (N): ${nitrogen || 'not provided'} kg/ha
Phosphorus (P): ${phosphorus || 'not provided'} kg/ha
Potassium (K): ${potassium || 'not provided'} kg/ha
Organic Carbon (OC): ${carbon || 'not provided'} %
Target Crop: ${cropName || 'not provided'}
Soil Type: ${soilType || 'not provided'}
Location Context: ${JSON.stringify(location)}
Weather Context: ${JSON.stringify(weather)}`;

        const raw = await geminiChat(system, user, { temperature: 0.2, maxTokens: 1536 });
        const data = parseJSON(raw);
        res.json({ success: true, data });
    } catch (error) {
        logger.error(`soilAnalysis error: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ── Soil Report OCR Parsing ──────────────────────────────────────
exports.parseSoilReport = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Image file is required.' });
        }
        const imageBase64 = req.file.buffer.toString('base64');
        const mimeType = req.file.mimetype;

        const data = await geminiParseSoilReport(imageBase64, mimeType);
        res.json({ success: true, data });
    } catch (error) {
        logger.error(`parseSoilReport error: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ── Fertilizer Advisory ──────────────────────────────────────────
exports.fertilizerAdvisory = async (req, res) => {
    try {
        const { crop, area, unit, urea, dap, mop } = req.body;
        if (!crop) return res.status(400).json({ success: false, message: 'crop is required' });

        const system = `You are a precision agriculture fertilizer expert for Indian farming. Return ONLY valid JSON. No markdown.`;
        const user = `Crop: ${crop}
Area: ${area} ${unit}
Calculated Fertilizer: Urea ${urea}kg, DAP ${dap}kg, MOP ${mop}kg

Return ONLY this JSON:
{
  "application_schedule": [
    { "stage": "Basal (At Sowing)", "urea_pct": 30, "dap_pct": 100, "mop_pct": 100, "timing": "At the time of sowing", "method": "Broadcast and incorporate" },
    { "stage": "Top Dress 1", "urea_pct": 40, "dap_pct": 0, "mop_pct": 0, "timing": "specific timing for ${crop}", "method": "application method" },
    { "stage": "Top Dress 2", "urea_pct": 30, "dap_pct": 0, "mop_pct": 0, "timing": "specific timing for ${crop}", "method": "application method" }
  ],
  "crop_specific_tips": ["tip1 specific to ${crop}", "tip2", "tip3"],
  "deficiency_signs": "what deficiency looks like in ${crop}",
  "best_time_to_apply": "morning|evening with reason",
  "water_requirement": "irrigation advice after fertilizer application",
  "organic_alternative": "organic substitute recommendation",
  "caution": "important warning for this crop"
}`;

        const raw = await geminiChat(system, user, { temperature: 0.3, maxTokens: 1024 });
        const data = parseJSON(raw);
        res.json({ success: true, data });
    } catch (error) {
        logger.error(`fertilizerAdvisory error: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ── Market Sentiment ─────────────────────────────────────────────
exports.marketSentiment = async (req, res) => {
    try {
        const { state = 'India' } = req.query;
        const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

        const system = `You are an agricultural market intelligence AI for Indian Mandi prices. Return ONLY valid JSON. No markdown.`;
        const user = `Generate current Indian agricultural market intelligence for ${state} as of ${today}.

Return ONLY this JSON:
{
  "sentiment": "Bullish|Bearish|Neutral",
  "sentiment_score": 72,
  "summary": "2 sentence market overview",
  "top_gainer": { "crop": "crop name", "price": 2500, "change_pct": 8.2, "location": "APMC location", "reason": "why price rose" },
  "top_loser": { "crop": "crop name", "price": 1800, "change_pct": -3.1, "location": "APMC location", "reason": "why price fell" },
  "market_data": [
    { "crop": "Tomato", "price": 2500, "previous": 2350, "unit": "Quintal", "category": "Vegetables", "location": "Pune APMC", "trend": "up", "ai_insight": "one line insight" },
    { "crop": "Onion", "price": 1800, "previous": 1850, "unit": "Quintal", "category": "Vegetables", "location": "Nashik APMC", "trend": "down", "ai_insight": "one line insight" },
    { "crop": "Wheat", "price": 2100, "previous": 2080, "unit": "Quintal", "category": "Grains", "location": "Delhi Mandi", "trend": "up", "ai_insight": "one line insight" },
    { "crop": "Rice (Basmati)", "price": 4500, "previous": 4100, "unit": "Quintal", "category": "Grains", "location": "Karnal APMC", "trend": "up", "ai_insight": "one line insight" },
    { "crop": "Cotton", "price": 6200, "previous": 6300, "unit": "Quintal", "category": "Commercial", "location": "Nagpur APMC", "trend": "down", "ai_insight": "one line insight" },
    { "crop": "Soybean", "price": 3800, "previous": 3650, "unit": "Quintal", "category": "Pulses", "location": "Indore APMC", "trend": "up", "ai_insight": "one line insight" },
    { "crop": "Potato", "price": 1200, "previous": 1180, "unit": "Quintal", "category": "Vegetables", "location": "Agra Mandi", "trend": "up", "ai_insight": "one line insight" },
    { "crop": "Apple", "price": 8500, "previous": 8200, "unit": "Quintal", "category": "Fruits", "location": "Shimla APMC", "trend": "up", "ai_insight": "one line insight" }
  ],
  "sector_analysis": [
    { "sector": "Vegetables", "performance": "+15.2%", "trend": "Bullish" },
    { "sector": "Grains", "performance": "+2.1%", "trend": "Neutral" },
    { "sector": "Fruits", "performance": "+8.4%", "trend": "Bullish" },
    { "sector": "Pulses", "performance": "-1.2%", "trend": "Bearish" },
    { "sector": "Commercial", "performance": "-0.8%", "trend": "Bearish" }
  ],
  "advisory": "actionable advice for farmers on what to sell or hold",
  "next_week_outlook": "brief prediction for next week prices"
}`;

        const raw = await geminiChat(system, user, { temperature: 0.5, maxTokens: 2048 });
        const data = parseJSON(raw);
        res.json({ success: true, data });
    } catch (error) {
        logger.error(`marketSentiment error: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
};
