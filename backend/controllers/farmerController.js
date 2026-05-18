const supabase = require('../database/supabaseClient');
const logger = require('../utils/logger');
const { analyzeCropImage, getChatResponse } = require('../services/analysisEngine');
const { getWeatherByCity } = require('../services/weatherEngine');

exports.analyzeCrop = async (req, res) => {
    try {
        const { cropType, farmingType, district, state } = req.body;
        const imageFile = req.file;

        if (!imageFile) return res.status(400).json({ success: false, message: 'Image is required' });
        if (!cropType) return res.status(400).json({ success: false, message: 'Crop type is required' });

        // 1. Upload image to Supabase Storage
        const fileName = `${Date.now()}_${imageFile.originalname.replace(/\s/g, '_')}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('crop-images')
            .upload(fileName, imageFile.buffer, { contentType: imageFile.mimetype });

        if (uploadError) {
            logger.warn(`Supabase upload failed: ${uploadError.message}`);
            return res.status(500).json({ success: false, message: 'Image upload failed' });
        }

        const { data: { publicUrl } } = supabase.storage.from('crop-images').getPublicUrl(fileName);

        // 2. Fetch weather for context
        let weather = null;
        try {
            weather = await getWeatherByCity(`${district}, ${state}`);
        } catch (e) {
            logger.warn(`Weather fetch skipped: ${e.message}`);
        }

        // 3. Groq Vision → Gemini Treatment
        const analysis = await analyzeCropImage(
            publicUrl,
            cropType,
            farmingType || 'field',
            { district: district || 'Unknown', state: state || 'Unknown' },
            weather
        );

        // 4. Save to Supabase DB
        const { data: scanRecord, error: dbError } = await supabase
            .from('crop_scans')
            .insert({
                crop_name: cropType,
                disease_name: analysis.disease,
                severity: analysis.severity,
                confidence: analysis.confidence,
                image_url: publicUrl,
                recommendation: {
                    fertilizer: analysis.treatment?.fertilizer,
                    quantity: analysis.treatment?.quantity,
                    instructions: analysis.treatment?.instructions,
                    prevention: analysis.prevention,
                    organicAlternative: analysis.organicAlternative,
                    urgency: analysis.urgency,
                    farmerNote: analysis.farmerNote
                },
                weather_summary: weather ? `${weather.temp}°C, ${weather.condition}, Humidity ${weather.humidity}%` : null,
                district: district || null,
                state: state || null
            })
            .select()
            .single();

        if (dbError) logger.warn(`DB insert failed: ${dbError.message}`);

        res.status(200).json({
            success: true,
            diseaseAnalysis: {
                crop: analysis.crop,
                disease: analysis.disease,
                severity: analysis.severity,
                confidence: analysis.confidence,
                status: analysis.status
            },
            recommendation: {
                fertilizer: analysis.treatment?.fertilizer || 'Consult local agronomist',
                quantity: analysis.treatment?.quantity || 'As advised',
                instructions: analysis.treatment?.instructions || 'Seek expert guidance.',
                prevention: analysis.prevention,
                organicAlternative: analysis.organicAlternative,
                urgency: analysis.urgency,
                farmerNote: analysis.farmerNote
            },
            weatherNote: weather ? `${weather.temp}°C, ${weather.condition}, Humidity ${weather.humidity}%` : null,
            imageUrl: publicUrl,
            scanId: scanRecord?.id || null
        });

    } catch (error) {
        logger.error(`analyzeCrop error: ${error.message}`);
        res.status(500).json({ success: false, message: error.message || 'Analysis failed' });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const { data: history, error } = await supabase
            .from('crop_scans')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;

        const total = history.length;
        const healthy = history.filter(h => h.disease_name?.toLowerCase().includes('healthy')).length;
        const issues = total - healthy;

        const diseaseCounts = history.reduce((acc, curr) => {
            const name = curr.disease_name || 'Unknown';
            acc[name] = (acc[name] || 0) + 1;
            return acc;
        }, {});

        const chartData = Object.entries(diseaseCounts).map(([name, value]) => ({ name, value }));

        res.status(200).json({
            success: true,
            data: { history, stats: { total, healthy, issues }, chartData }
        });
    } catch (err) {
        logger.error(`getHistory error: ${err.message}`);
        res.status(500).json({ success: false, message: 'Failed to fetch history' });
    }
};

exports.getCropGroups = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('crop_scans')
            .select('crop_name, disease_name');
        if (error) throw error;
        const groups = data.reduce((acc, row) => {
            const crop = row.crop_name || 'Unknown';
            if (!acc[crop]) acc[crop] = [];
            if (row.disease_name && !acc[crop].includes(row.disease_name))
                acc[crop].push(row.disease_name);
            return acc;
        }, {});
        res.status(200).json({ success: true, data: groups });
    } catch (err) {
        logger.error(`getCropGroups error: ${err.message}`);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase.from('crop_scans').delete().eq('id', id);
        if (error) throw error;
        res.status(200).json({ success: true, message: 'Record deleted' });
    } catch (err) {
        logger.error(`deleteHistory error: ${err.message}`);
        res.status(500).json({ success: false, message: 'Failed to delete record' });
    }
};

exports.chatWithFarmer = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ success: false, message: 'Message is required' });
        const reply = await getChatResponse(message);
        res.status(200).json({ success: true, reply });
    } catch (err) {
        logger.error(`chat error: ${err.message}`);
        res.status(500).json({ success: false, message: err.message || 'Chat failed' });
    }
};
