const supabase = require('../database/supabaseClient');
const logger = require('../utils/logger');
const { getSimulationExplanation } = require('../services/analysisEngine');

const BASE_YIELD = { Rice: 2500, Wheat: 2000, Corn: 3000, Tomato: 8000, Cotton: 800, Sugarcane: 35000 };
const BASE_PRICE = { Rice: 25, Wheat: 22, Corn: 20, Tomato: 15, Cotton: 60, Sugarcane: 3.5 };

exports.simulateImpact = async (req, res) => {
    try {
        const { crop, soilType, area, durationMonths, intensity, language = 'EN' } = req.body;

        if (!crop || !area || !durationMonths || !intensity) {
            return res.status(400).json({ success: false, message: 'Missing required parameters' });
        }

        const baseYield = BASE_YIELD[crop] || 1500;
        const basePrice = BASE_PRICE[crop] || 30;
        const intensityFactor = { Low: 0.8, Medium: 1.0, High: 1.3 }[intensity] || 1.0;
        const decayRate = { High: 2.5, Medium: 1.5, Low: 0.8 }[intensity] || 1.5;

        // Chemical
        const chemYield = baseYield * 1.2 * intensityFactor;
        const chemCost = (basePrice * chemYield * 0.3) + (intensityFactor * 5000);
        const chemProfit = (chemYield * basePrice) - chemCost;
        const chemSoilHealth = Math.max(20, 100 - (decayRate * durationMonths));

        // Organic
        const organicYield = baseYield * 0.9 * intensityFactor;
        const organicProfit = (organicYield * basePrice * 1.4) - ((basePrice * organicYield * 0.2) + 3000);
        const organicSoilHealth = Math.min(100, 100 + (durationMonths * 0.5));

        const langMap = { EN: 'English', HI: 'Hindi', TA: 'Tamil' };
        const selectedLang = langMap[language] || 'English';

        let explanation = '';
        try {
            explanation = await getSimulationExplanation(
                crop, area,
                { yield: organicYield * area, profit: organicProfit * area, soilHealth: organicSoilHealth },
                { yield: chemYield * area, profit: chemProfit * area, soilHealth: chemSoilHealth },
                selectedLang
            );
        } catch (e) {
            explanation = 'Organic farming improves soil health over time. Chemical farming gives higher short-term yield. 🌱🚜';
        }

        // Save to Supabase
        const { error } = await supabase.from('simulations').insert({
            sim_type: 'impact',
            crop_type: crop,
            soil_type: soilType,
            result_data: {
                area, durationMonths, intensity,
                organic: { yield: organicYield * area, profit: organicProfit * area, soilHealth: organicSoilHealth },
                chemical: { yield: chemYield * area, profit: chemProfit * area, soilHealth: chemSoilHealth },
                explanation
            }
        });
        if (error) logger.warn(`Simulation DB insert: ${error.message}`);

        res.status(200).json({
            success: true,
            organic: {
                yield: (organicYield * area).toFixed(0),
                profit: (organicProfit * area).toFixed(0),
                soilHealth: organicSoilHealth.toFixed(1),
                risk: 'Low',
                perMonthSoilTrend: Array.from({ length: durationMonths + 1 }, (_, i) => Math.min(100, 100 + i * 0.5)),
                perMonthYieldTrend: Array.from({ length: durationMonths + 1 }, (_, i) => Math.round((organicYield * area / durationMonths) * i))
            },
            chemical: {
                yield: (chemYield * area).toFixed(0),
                profit: (chemProfit * area).toFixed(0),
                soilHealth: chemSoilHealth.toFixed(1),
                risk: intensity === 'High' ? 'High' : 'Medium',
                perMonthSoilTrend: Array.from({ length: durationMonths + 1 }, (_, i) => Math.max(20, 100 - decayRate * i)),
                perMonthYieldTrend: Array.from({ length: durationMonths + 1 }, (_, i) => Math.round((chemYield * area / durationMonths) * i))
            },
            explanation
        });

    } catch (err) {
        logger.error(`simulateImpact error: ${err.message}`);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getSimulationHistory = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('simulations')
            .select('*')
            .eq('sim_type', 'impact')
            .order('created_at', { ascending: false })
            .limit(10);
        if (error) throw error;
        res.status(200).json({ success: true, data: { history: data } });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch history' });
    }
};
