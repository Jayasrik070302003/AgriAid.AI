const supabase = require('../database/supabaseClient');
const logger = require('../utils/logger');
const { analyzeCropImage, getChatResponse } = require('../services/analysisEngine');
const { getWeatherByCity } = require('../services/weatherEngine');
const { geminiCropSuggestions, geminiSoilEstimation } = require('../services/geminiAdvisor');

exports.analyzeCrop = async (req, res) => {
    try {
        const { district, state, country, taluk, village, latitude, longitude, pincode, elevation } = req.body;
        const imageFile = req.file;
        // Extract user_id from Supabase JWT if present
        const authHeader = req.headers.authorization;
        let userId = null;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const token = authHeader.split(' ')[1];
                const { data: { user } } = await supabase.auth.getUser(token);
                userId = user?.id || null;
            } catch (e) { /* anonymous scan */ }
        }

        if (!imageFile) return res.status(400).json({ success: false, message: 'Image is required' });

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

        const locationContext = {
            district: district || 'Unknown',
            state: state || 'Unknown',
            country: country || 'India',
            taluk: taluk || '',
            village: village || '',
            latitude: latitude || '',
            longitude: longitude || '',
            pincode: pincode || '',
            elevation: elevation || ''
        };

        // 3. Vision Validator & Classifier → Gemini Treatment Advisor
        const analysis = await analyzeCropImage(
            publicUrl,
            locationContext,
            weather
        );

        // 3.1 Check if specimen image validation failed
        if (analysis.isValidPlant === false) {
            return res.status(400).json({ 
                success: false, 
                isValidPlant: false, 
                message: 'Please upload a valid crop or plant image.' 
            });
        }

        // 4. Save to Supabase DB using auto-detected species details
        const { data: scanRecord, error: dbError } = await supabase
            .from('crop_scans')
            .insert({
                user_id: userId,
                crop_name: analysis.crop || 'Unknown',
                disease_name: analysis.disease || 'Healthy',
                severity: analysis.severity || 'Low',
                confidence: analysis.confidence || 85.00,
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
            isValidPlant: true,
            diseaseAnalysis: {
                crop: analysis.crop || 'Unknown',
                scientificName: analysis.scientificName || 'N/A',
                category: analysis.category || 'field',
                disease: analysis.disease || 'Healthy',
                severity: analysis.severity || 'Low',
                confidence: analysis.confidence || 85.00,
                status: analysis.status || 'Healthy'
            },
            recommendation: {
                fertilizer: analysis.treatment?.fertilizer || 'Consult local agronomist',
                quantity: analysis.treatment?.quantity || 'As advised',
                instructions: analysis.treatment?.instructions || 'Seek expert guidance.',
                prevention: analysis.prevention,
                organicAlternative: analysis.organicAlternative,
                urgency: analysis.urgency,
                farmerNote: analysis.farmerNote,

                diseaseName: analysis.diseaseName || analysis.disease || 'Unknown',
                severityLevel: analysis.severityLevel || analysis.severity || 'Low',
                affectedAreas: analysis.affectedAreas || 'Leaves and surrounding stems.',
                cureMethods: analysis.cureMethods || analysis.treatment?.instructions || 'Apply treatment guidelines.',
                organicSolutions: analysis.organicSolutions || analysis.organicAlternative || 'Neem oil or biological agents.',
                fertilizerSuggestions: analysis.fertilizerSuggestions || 'Balance mineral applications.',
                irrigationAdvice: analysis.irrigationAdvice || 'Drip irrigate at regular intervals, avoid logging.',
                weatherRisks: analysis.weatherRisks || 'High moisture promotes mycelial growth.',
                preventionTips: analysis.preventionTips || analysis.prevention || 'Sanitize tools and rotate crops.',
                yieldProtectionAdvice: analysis.yieldProtectionAdvice || 'Protect borders and harvest when dry.',
                soilRecommendations: analysis.soilRecommendations || 'Adjust pH levels and add compost.',
                recoveryTimeline: analysis.recoveryTimeline || [
                    { "day": "Day 1", "milestone": "Initiate target remediation application" },
                    { "day": "Day 3", "milestone": "Inspect progress indicators and spore arrest" },
                    { "day": "Day 7", "milestone": "Verify recovery and execute re-scan checklist" }
                ],
                marketInsights: analysis.marketInsights || 'Local pricing indicates stable trends.',
                chatSuggestions: analysis.chatSuggestions || [
                    "What chemical fungicide works best?",
                    "How can I organic-prevent this next season?",
                    "What are the soil parameters to check?"
                ]
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
        const authHeader = req.headers.authorization;
        let userId = null;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const token = authHeader.split(' ')[1];
                const { data: { user } } = await supabase.auth.getUser(token);
                userId = user?.id || null;
            } catch (e) { /* skip */ }
        }

        let query = supabase.from('crop_scans').select('*').order('created_at', { ascending: false }).limit(50);
        if (userId) query = query.eq('user_id', userId);

        const { data: history, error } = await query;

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
        const authHeader = req.headers.authorization;
        let userId = null;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const token = authHeader.split(' ')[1];
                const { data: { user } } = await supabase.auth.getUser(token);
                userId = user?.id || null;
            } catch (e) { /* skip */ }
        }

        let query = supabase.from('crop_scans').delete().eq('id', id);
        if (userId) {
            query = query.eq('user_id', userId);
        }
        const { error } = await query;
        if (error) throw error;
        res.status(200).json({ success: true, message: 'Record deleted' });
    } catch (err) {
        logger.error(`deleteHistory error: ${err.message}`);
        res.status(500).json({ success: false, message: 'Failed to delete record' });
    }
};

exports.chatWithFarmer = async (req, res) => {
    try {
        const { message, language = 'EN' } = req.body;
        if (!message) return res.status(400).json({ success: false, message: 'Message is required' });
        const reply = await getChatResponse(message, language);
        res.status(200).json({ success: true, reply });
    } catch (err) {
        logger.error(`chat error: ${err.message}`);
        res.status(500).json({ success: false, message: err.message || 'Chat failed' });
    }
};

const CROP_LIST = [
    { name: 'Rice', scientific: 'Oryza sativa', category: 'field' },
    { name: 'Wheat', scientific: 'Triticum aestivum', category: 'field' },
    { name: 'Maize', scientific: 'Zea mays', category: 'field' },
    { name: 'Sorghum', scientific: 'Sorghum bicolor', category: 'field' },
    { name: 'Pearl Millet', scientific: 'Pennisetum glaucum', category: 'field' },
    { name: 'Finger Millet', scientific: 'Eleusine coracana', category: 'field' },
    { name: 'Barley', scientific: 'Hordeum vulgare', category: 'field' },
    { name: 'Chickpea', scientific: 'Cicer arietinum', category: 'pulse' },
    { name: 'Pigeon Pea', scientific: 'Cajanus cajan', category: 'pulse' },
    { name: 'Black Gram', scientific: 'Vigna mungo', category: 'pulse' },
    { name: 'Green Gram', scientific: 'Vigna radiata', category: 'pulse' },
    { name: 'Lentil', scientific: 'Lens culinaris', category: 'pulse' },
    { name: 'Cowpea', scientific: 'Vigna unguiculata', category: 'pulse' },
    { name: 'Groundnut', scientific: 'Arachis hypogaea', category: 'oilseed' },
    { name: 'Mustard', scientific: 'Brassica juncea', category: 'oilseed' },
    { name: 'Sunflower', scientific: 'Helianthus annuus', category: 'oilseed' },
    { name: 'Sesame', scientific: 'Sesamum indicum', category: 'oilseed' },
    { name: 'Soybean', scientific: 'Glycine max', category: 'oilseed' },
    { name: 'Castor', scientific: 'Ricinus communis', category: 'oilseed' },
    { name: 'Cotton', scientific: 'Gossypium hirsutum', category: 'cash' },
    { name: 'Sugarcane', scientific: 'Saccharum officinarum', category: 'cash' },
    { name: 'Jute', scientific: 'Corchorus olitorius', category: 'cash' },
    { name: 'Tobacco', scientific: 'Nicotiana tabacum', category: 'cash' },
    { name: 'Tomato', scientific: 'Solanum lycopersicum', category: 'vegetable' },
    { name: 'Potato', scientific: 'Solanum tuberosum', category: 'vegetable' },
    { name: 'Onion', scientific: 'Allium cepa', category: 'vegetable' },
    { name: 'Brinjal', scientific: 'Solanum melongena', category: 'vegetable' },
    { name: 'Chilli', scientific: 'Capsicum annuum', category: 'vegetable' },
    { name: 'Capsicum', scientific: 'Capsicum annuum', category: 'vegetable' },
    { name: 'Okra', scientific: 'Abelmoschus esculentus', category: 'vegetable' },
    { name: 'Cabbage', scientific: 'Brassica oleracea', category: 'vegetable' },
    { name: 'Cauliflower', scientific: 'Brassica oleracea', category: 'vegetable' },
    { name: 'Spinach', scientific: 'Spinacia oleracea', category: 'vegetable' },
    { name: 'Carrot', scientific: 'Daucus carota', category: 'vegetable' },
    { name: 'Radish', scientific: 'Raphanus sativus', category: 'vegetable' },
    { name: 'Bitter Gourd', scientific: 'Momordica charantia', category: 'vegetable' },
    { name: 'Bottle Gourd', scientific: 'Lagenaria siceraria', category: 'vegetable' },
    { name: 'Ridge Gourd', scientific: 'Luffa acutangula', category: 'vegetable' },
    { name: 'Snake Gourd', scientific: 'Trichosanthes cucumerina', category: 'vegetable' },
    { name: 'Pumpkin', scientific: 'Cucurbita moschata', category: 'vegetable' },
    { name: 'Cucumber', scientific: 'Cucumis sativus', category: 'vegetable' },
    { name: 'Banana', scientific: 'Musa acuminata', category: 'fruit' },
    { name: 'Mango', scientific: 'Mangifera indica', category: 'fruit' },
    { name: 'Papaya', scientific: 'Carica papaya', category: 'fruit' },
    { name: 'Guava', scientific: 'Psidium guajava', category: 'fruit' },
    { name: 'Pomegranate', scientific: 'Punica granatum', category: 'fruit' },
    { name: 'Grapes', scientific: 'Vitis vinifera', category: 'fruit' },
    { name: 'Watermelon', scientific: 'Citrullus lanatus', category: 'fruit' },
    { name: 'Muskmelon', scientific: 'Cucumis melo', category: 'fruit' },
    { name: 'Pineapple', scientific: 'Ananas comosus', category: 'fruit' },
    { name: 'Coconut', scientific: 'Cocos nucifera', category: 'plantation' },
    { name: 'Arecanut', scientific: 'Areca catechu', category: 'plantation' },
    { name: 'Cashew', scientific: 'Anacardium occidentale', category: 'plantation' },
    { name: 'Coffee', scientific: 'Coffea arabica', category: 'plantation' },
    { name: 'Tea', scientific: 'Camellia sinensis', category: 'plantation' },
    { name: 'Rubber', scientific: 'Hevea brasiliensis', category: 'plantation' },
    { name: 'Turmeric', scientific: 'Curcuma longa', category: 'spice' },
    { name: 'Ginger', scientific: 'Zingiber officinale', category: 'spice' },
    { name: 'Garlic', scientific: 'Allium sativum', category: 'spice' },
    { name: 'Coriander', scientific: 'Coriandrum sativum', category: 'spice' },
    { name: 'Cumin', scientific: 'Cuminum cyminum', category: 'spice' },
    { name: 'Fenugreek', scientific: 'Trigonella foenum-graecum', category: 'spice' },
    { name: 'Black Pepper', scientific: 'Piper nigrum', category: 'spice' },
    { name: 'Cardamom', scientific: 'Elettaria cardamomum', category: 'spice' },
    { name: 'Mint', scientific: 'Mentha spicata', category: 'herb' },
    { name: 'Curry Leaf', scientific: 'Murraya koenigii', category: 'herb' },
];

// In-memory cache: query → { data, ts } — avoids repeat AI calls for same/similar queries
const _suggestCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;

// Tamil & Hindi crop name map + typo corrections — zero API cost
const MULTILINGUAL_MAP = {
    // Tamil
    'தக்காளி':'Tomato','நெல்':'Rice','அரிசி':'Rice','கோதுமை':'Wheat',
    'வெங்காயம்':'Onion','உருளைக்கிழங்கு':'Potato','மிளகாய்':'Chilli',
    'கத்தரிக்காய்':'Brinjal','வாழை':'Banana','மாம்பழம்':'Mango',
    'தேங்காய்':'Coconut','கரும்பு':'Sugarcane','பருத்தி':'Cotton',
    'நிலக்கடலை':'Groundnut','சோளம்':'Maize','கொத்தமல்லி':'Coriander',
    'மஞ்சள்':'Turmeric','இஞ்சி':'Ginger','பூண்டு':'Garlic',
    'முந்திரி':'Cashew','திராட்சை':'Grapes','பப்பாளி':'Papaya',
    // Hindi
    'टमाटर':'Tomato','चावल':'Rice','धान':'Rice','गेहूं':'Wheat',
    'प्याज':'Onion','आलू':'Potato','मिर्च':'Chilli','मिर्ची':'Chilli',
    'बैंगन':'Brinjal','केला':'Banana','आम':'Mango','नारियल':'Coconut',
    'गन्ना':'Sugarcane','कपास':'Cotton','मूंगफली':'Groundnut',
    'मक्का':'Maize','धनिया':'Coriander','हल्दी':'Turmeric',
    'अदरक':'Ginger','लहसुन':'Garlic','काजू':'Cashew',
    'अंगूर':'Grapes','पपीता':'Papaya','सरसों':'Mustard',
    // Typo corrections
    'pady':'Rice','paddy':'Rice','tamato':'Tomato','tometo':'Tomato',
    'mirchi':'Chilli','mirci':'Chilli','brinjel':'Brinjal',
    'chilly':'Chilli','chili':'Chilli','potatoe':'Potato',
    'whete':'Wheat','wheet':'Wheat','sugercane':'Sugarcane',
    'groundnuts':'Groundnut','maiz':'Maize','onoin':'Onion',
};

exports.getCropSuggestions = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.length < 1) return res.status(200).json({ success: true, data: [] });
        const rawQuery = q.trim();

        // Multilingual + typo map lookup
        const mapped = MULTILINGUAL_MAP[rawQuery] || MULTILINGUAL_MAP[rawQuery.toLowerCase()];
        const query = (mapped || rawQuery).toLowerCase().trim();

        // 1. Fast local match — zero API cost
        const localResults = CROP_LIST.filter(c =>
            c.name.toLowerCase().includes(query) ||
            c.scientific.toLowerCase().includes(query)
        ).slice(0, 6);

        if (localResults.length > 0) {
            return res.status(200).json({ success: true, data: localResults, source: 'local' });
        }

        // 2. Require ≥3 chars before hitting AI
        if (query.length < 3) {
            return res.status(200).json({ success: true, data: [] });
        }

        // 3. Cache check — serve cached result if fresh
        const cached = _suggestCache.get(query);
        if (cached && (Date.now() - cached.ts) < CACHE_TTL_MS) {
            return res.status(200).json({ success: true, data: cached.data, source: 'cache' });
        }

        // 4. AI correction — Groq first, Gemini fallback
        const { geminiCropSuggestions } = require('../services/geminiAdvisor');
        const aiResults = await geminiCropSuggestions(query);
        const sliced = aiResults.slice(0, 6);

        // Store in cache
        _suggestCache.set(query, { data: sliced, ts: Date.now() });
        // Evict old entries if cache grows large
        if (_suggestCache.size > 200) {
            const oldest = [..._suggestCache.entries()].sort((a, b) => a[1].ts - b[1].ts)[0][0];
            _suggestCache.delete(oldest);
        }

        res.status(200).json({ success: true, data: sliced, source: 'ai' });
    } catch (error) {
        logger.error(`getCropSuggestions error: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getSoilProfile = async (req, res) => {
    try {
        const { district, state, country, taluk, village, latitude, longitude, elevation } = req.body;
        const location = { district, state, country, taluk, village, latitude, longitude, elevation };
        
        let weather = null;
        try {
            weather = await getWeatherByCity(`${district}, ${state}`);
        } catch (e) {
            logger.warn(`Weather fetch skipped for soil profile: ${e.message}`);
        }

        const profile = await geminiSoilEstimation(location, weather);
        res.status(200).json({ success: true, data: profile });
    } catch (error) {
        logger.error(`getSoilProfile error: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
};
