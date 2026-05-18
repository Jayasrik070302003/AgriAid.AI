const db = require('../config/database');
const logger = require('../utils/logger');
const { getChatResponse } = require('../services/mlService');

/**
 * AI Organic vs Chemical Impact Simulator Logic
 * Formulas are based on realistic agricultural heuristics for India.
 */
exports.simulateImpact = async (req, res) => {
    try {
        const { crop, soilType, area, durationMonths, intensity, userId = 1, language = 'EN' } = req.body;

        if (!crop || !area || !durationMonths || !intensity) {
            return res.status(400).json({ success: false, message: 'Missing required parameters' });
        }

        // --- HEURISTICS & CONSTANTS ---
        const baseYieldPerAcre = {
            'Rice': 2500, // kg
            'Wheat': 2000,
            'Corn': 3000,
            'Tomato': 8000,
            'Cotton': 800,
            'Sugarcane': 35000
        }[crop] || 1500;

        const basePricePerKg = {
            'Rice': 25,
            'Wheat': 22,
            'Corn': 20,
            'Tomato': 15,
            'Cotton': 60,
            'Sugarcane': 3.5
        }[crop] || 30;

        const intensityFactor = { 'Low': 0.8, 'Medium': 1.0, 'High': 1.3 }[intensity];

        // --- CHEMICAL SIMULATION ---
        // Chemical yield is higher initially but soil health drops
        const chemYield = baseYieldPerAcre * 1.2 * intensityFactor;
        const chemCostPerAcre = (basePricePerKg * chemYield * 0.3) + (intensityFactor * 5000); // 30% revenue + fixed
        const chemProfit = (chemYield * basePricePerKg) - chemCostPerAcre;

        // Soil health: 100 - (intensity * months * decay_rate)
        const decayRate = intensity === 'High' ? 2.5 : intensity === 'Medium' ? 1.5 : 0.8;
        const chemSoilHealth = Math.max(20, 100 - (decayRate * durationMonths));
        const chemRisk = intensity === 'High' ? 'High' : 'Medium';

        // --- ORGANIC SIMULATION ---
        // Organic yield is lower initially, soil health improves/stabilizes
        const organicYield = baseYieldPerAcre * 0.9 * intensityFactor;
        const organicPricePremium = 1.4; // 40% higher price for organic
        const organicCostPerAcre = (basePricePerKg * organicYield * 0.2) + 3000; // Lower input cost
        const organicProfit = (organicYield * basePricePerKg * organicPricePremium) - organicCostPerAcre;

        const organicSoilHealth = Math.min(100, 100 + (durationMonths * 0.5));
        const organicRisk = 'Low';

        // --- GENERATE AI EXPLANATION ---
        const languageMapping = {
            'EN': 'English',
            'HI': 'Hindi',
            'TA': 'Tamil'
        };
        const selectedLanguage = languageMapping[language] || 'mix of Tamil and English (Tanglish)';

        const prompt = `Act as an expert agriculture consultant. Compare these two scenarios for ${crop} farming on ${area} acres for ${durationMonths} months in ${soilType} soil:
        
        Scenario A (Chemical):
        - Yield: ${chemYield.toFixed(0)} kg/acre
        - Profit: ₹${chemProfit.toFixed(0)}
        - Soil Health Score: ${chemSoilHealth.toFixed(1)}/100
        - Risk: ${chemRisk}

        Scenario B (Organic):
        - Yield: ${organicYield.toFixed(0)} kg/acre
        - Profit: ₹${organicProfit.toFixed(0)}
        - Soil Health Score: ${organicSoilHealth.toFixed(1)}/100
        - Risk: ${organicRisk}

        Provide a short, farmer-friendly explanation in ${selectedLanguage} using emojis. Explain why organic is better for long term but chemical gives more weight now.`;

        let explanation = "";
        try {
            explanation = await getChatResponse(prompt);
        } catch (err) {
            explanation = "Calculation complete. Organic farming improves soil health significantly over time whereas High Chemical usage leads to soil degradation. Choice depends on long-term sustainability vs short-term bulk yield. 🌱🚜";
        }

        // --- SAVE TO DATABASE ---
        const [result] = await db.query(`
            INSERT INTO impact_simulations 
            (user_id, crop, soil_type, area, duration_months, intensity, organic_yield, chemical_yield, organic_profit, chemical_profit, organic_soil_health, chemical_soil_health, explanation)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            userId, crop, soilType, area, durationMonths, intensity,
            organicYield * area, chemYield * area,
            organicProfit * area, chemProfit * area,
            organicSoilHealth, chemSoilHealth,
            explanation
        ]);

        res.status(200).json({
            success: true,
            id: result.insertId,
            organic: {
                yield: (organicYield * area).toFixed(0),
                profit: (organicProfit * area).toFixed(0),
                soilHealth: organicSoilHealth.toFixed(1),
                risk: organicRisk,
                perMonthSoilTrend: Array.from({ length: durationMonths + 1 }, (_, i) => Math.min(100, 100 + (i * 0.5))),
                perMonthYieldTrend: Array.from({ length: parseInt(durationMonths) + 1 }, (_, i) => Math.round((organicYield * area / durationMonths) * i))
            },
            chemical: {
                yield: (chemYield * area).toFixed(0),
                profit: (chemProfit * area).toFixed(0),
                soilHealth: chemSoilHealth.toFixed(1),
                risk: chemRisk,
                perMonthSoilTrend: Array.from({ length: durationMonths + 1 }, (_, i) => Math.max(20, 100 - (decayRate * i))),
                perMonthYieldTrend: Array.from({ length: parseInt(durationMonths) + 1 }, (_, i) => Math.round((chemYield * area / durationMonths) * i))
            },
            explanation
        });

    } catch (err) {
        logger.error(`Simulator Error: ${err.message}`);
        res.status(500).json({ success: false, message: 'Internal Server Error', details: err.message });
    }
};

exports.getSimulationHistory = async (req, res) => {
    try {
        const userId = req.query.userId || 1;
        const [rows] = await db.query('SELECT * FROM impact_simulations WHERE user_id = ? ORDER BY created_at DESC LIMIT 10', [userId]);
        res.status(200).json({ success: true, data: { history: rows } });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch history' });
    }
};
