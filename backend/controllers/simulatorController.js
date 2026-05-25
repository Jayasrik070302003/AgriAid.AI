const supabase = require('../database/supabaseClient');
const logger = require('../utils/logger');
const { getSimulationExplanation } = require('../services/analysisEngine');

const BASE_YIELD = { Rice: 2500, Wheat: 2000, Corn: 3000, Tomato: 8000, Cotton: 800, Sugarcane: 35000 };
const BASE_PRICE = { Rice: 25, Wheat: 22, Corn: 20, Tomato: 15, Cotton: 60, Sugarcane: 3.5 };

exports.simulateImpact = async (req, res) => {
    try {
        const { base, scenarioA, scenarioB, language = 'EN' } = req.body;

        if (!base || !scenarioA || !scenarioB) {
            return res.status(400).json({ success: false, message: 'Missing required parameters: base, scenarioA, scenarioB' });
        }

        const langMap = { EN: 'English', HI: 'Hindi', TA: 'Tamil' };
        const selectedLang = langMap[language] || 'English';

        let simulationResult = null;
        try {
            simulationResult = await getSimulationExplanation(
                base,
                scenarioA,
                scenarioB,
                selectedLang
            );
        } catch (e) {
            logger.error(`AI Simulation failed: ${e.message}`);
            // Safe fallback if Groq/Gemini fails
            simulationResult = {
                scenarioA: { yieldEffect: "Moderate", soilImpact: "Neutral", waterConsumption: "Moderate", sustainability: "Moderate", costEfficiency: "Moderate", overallRisk: "Moderate" },
                scenarioB: { yieldEffect: "Moderate", soilImpact: "Neutral", waterConsumption: "Moderate", sustainability: "Moderate", costEfficiency: "Moderate", overallRisk: "Moderate" },
                explanation: "Simulation encountered a network issue. Please rely on general agricultural best practices for now. 🌱🚜"
            };
        }

        // Save to Supabase
        const { error } = await supabase.from('simulations').insert({
            sim_type: 'impact',
            crop_type: base.crop,
            soil_type: base.soilType,
            result_data: {
                base, scenarioA, scenarioB,
                outcomes: simulationResult
            }
        });
        if (error) logger.warn(`Simulation DB insert: ${error.message}`);

        res.status(200).json({
            success: true,
            data: simulationResult
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
