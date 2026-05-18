const supabase = require('../database/supabaseClient');
const logger = require('../utils/logger');
const { analyzeCropImage } = require('../services/analysisEngine');
const { getWeatherByCity } = require('../services/weatherEngine');

const calculateRisk = (health, severity) => {
    if (health < 40 || severity === 'High') return 'High';
    if (health < 70 || severity === 'Medium') return 'Medium';
    return 'Low';
};

exports.simulateGrowth = async (req, res) => {
    try {
        const { cropName, state, district, soilType, sowingDate } = req.body;
        const imageFile = req.file;

        if (!imageFile) return res.status(400).json({ success: false, message: 'Image is required' });

        // 1. Upload image to Supabase Storage
        const fileName = `growth_${Date.now()}_${imageFile.originalname.replace(/\s/g, '_')}`;
        const { error: uploadError } = await supabase.storage
            .from('crop-images')
            .upload(fileName, imageFile.buffer, { contentType: imageFile.mimetype });

        if (uploadError) return res.status(500).json({ success: false, message: 'Image upload failed' });

        const { data: { publicUrl } } = supabase.storage.from('crop-images').getPublicUrl(fileName);

        // 2. Fetch weather
        let weather = null;
        try {
            weather = await getWeatherByCity(`${district}, ${state}`);
        } catch (e) {
            logger.warn(`Weather fetch skipped: ${e.message}`);
        }

        // 3. Groq Vision + Gemini analysis
        const analysis = await analyzeCropImage(
            publicUrl, cropName, 'field',
            { district: district || 'Unknown', state: state || 'Unknown' },
            weather
        );

        // 4. Rule-based 90-day simulation
        const weatherImpact = weather
            ? ((weather.temp < 15 || weather.temp > 35) ? -5 : 0) + (weather.humidity > 80 ? -5 : 0)
            : 0;

        const initialHealth = analysis.disease?.toLowerCase().includes('healthy') ? 95
            : analysis.severity === 'High' ? 60 : 80;

        const diseaseDecay = { High: 10, Medium: 5, Low: 0 }[analysis.severity] || 0;
        const soilBoost = ['Alluvial', 'Red Soil', 'Loamy'].includes(soilType) ? 2 : 0;
        const growthRate = soilBoost + (weatherImpact > 0 ? 2 : 0) - diseaseDecay;

        let h = initialHealth;
        const futureHealth = [
            Math.round(Math.min(100, Math.max(0, h += growthRate))),
            Math.round(Math.min(100, Math.max(0, h += growthRate * 1.5))),
            Math.round(Math.min(100, Math.max(0, h += growthRate * 2)))
        ];

        const riskLevel = calculateRisk(futureHealth[1], analysis.severity);
        const yieldPrediction = riskLevel === 'High' ? 'Low' : futureHealth[2] > 80 ? 'High' : 'Medium';

        // 5. Save to Supabase
        const { error: dbError } = await supabase.from('simulations').insert({
            sim_type: 'future_growth',
            crop_type: cropName,
            soil_type: soilType,
            yield_prediction: yieldPrediction,
            risk_level: riskLevel,
            result_data: {
                disease: analysis.disease,
                severity: analysis.severity,
                confidence: analysis.confidence,
                futureHealth,
                riskLevel,
                yieldPrediction,
                advice: analysis.farmerNote,
                imageUrl: publicUrl,
                sowingDate,
                state,
                district
            }
        });
        if (dbError) logger.warn(`Growth sim DB insert: ${dbError.message}`);

        res.json({
            success: true,
            data: {
                crop: cropName,
                disease: analysis.disease,
                status: analysis.status,
                severity: analysis.severity,
                confidence: analysis.confidence,
                advice: analysis.farmerNote || analysis.prevention,
                futureHealth,
                yieldPrediction,
                riskLevel,
                chartData: [
                    { day: 'Day 0', health: initialHealth },
                    { day: 'Day 30', health: futureHealth[0] },
                    { day: 'Day 60', health: futureHealth[1] },
                    { day: 'Day 90', health: futureHealth[2] }
                ]
            }
        });

    } catch (error) {
        logger.error(`simulateGrowth error: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('simulations')
            .select('*')
            .eq('sim_type', 'future_growth')
            .order('created_at', { ascending: false })
            .limit(20);
        if (error) throw error;
        res.json({ success: true, data: { history: data } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching history' });
    }
};
