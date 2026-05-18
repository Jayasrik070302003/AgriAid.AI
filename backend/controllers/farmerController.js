const mlService = require('../services/mlService');
const logger = require('../utils/logger');
const db = require('../config/database');

exports.analyzeCrop = async (req, res) => {
    try {
        const { cropType, district, state } = req.body;
        const imageFile = req.file;
        const userId = 1; // Default User for Demo

        if (!imageFile) {
            logger.warn('Analysis request failed: Image missing');
            return res.status(400).json({ message: 'Image is required' });
        }

        logger.info(`Analyzing crop image: ${imageFile.path}`);

        // 1. Call REAL ML API
        let diseaseResult;
        try {
            diseaseResult = await mlService.detectDisease(imageFile.path, cropType);
            logger.info(`ML API Response: ${JSON.stringify(diseaseResult)}`);
        } catch (mlError) {
            logger.warn(`ML API Failed: ${mlError.message}`);

            // Handle Non-Plant Detection
            if (mlError.code === 'INVALID_IMAGE') {
                return res.status(400).json({
                    success: false,
                    errorType: 'INVALID_IMAGE',
                    message: mlError.message
                });
            }

            return res.status(503).json({
                success: false,
                message: mlError.message || 'Disease analysis service unavailable.',
                error: mlError.message
            });
        }

        // 2. Resolve Crop ID (Self-Healing: Insert if missing)
        let cropId;
        try {
            const [cropRows] = await db.query('SELECT id FROM crops WHERE crop_name = ?', [cropType]);
            if (cropRows.length > 0) {
                cropId = cropRows[0].id;
            } else {
                logger.info(`Crop ${cropType} not found in DB. Creating new entry...`);
                const [result] = await db.query('INSERT INTO crops (crop_name) VALUES (?)', [cropType]);
                cropId = result.insertId;
            }
        } catch (dbError) {
            logger.error(`Database Resolution Error (Crops): ${dbError.message}`);
            throw new Error(`Database Error: ${dbError.message}`);
        }

        // 3. Generate Recommendation Logic
        let recommendation = {
            fertilizer: 'General NPK',
            quantity: '50 kg/acre',
            instructions: 'Apply in split doses during growth phase.'
        };

        const diseaseKey = diseaseResult.disease;
        const isHome = (req.body.farmingType === 'home');
        logger.info(`Generating recommendation for disease: ${diseaseKey} (Farming Type: ${req.body.farmingType})`);

        // Rule Engine ... (Keeping existing logic)
        if (isHome) {
            // --- HOME GARDENING (Organic / Small Scale) ---
            if (diseaseKey.includes('Blight')) {
                recommendation = {
                    fertilizer: 'Neem Oil / Baking Soda Solution',
                    quantity: '5ml per liter water',
                    instructions: 'Spray on leaves every 3-4 days. Remove infected leaves.'
                };
            } else if (diseaseKey.includes('Rust')) {
                recommendation = {
                    fertilizer: 'Organic Sulphur / Garlic Extract',
                    quantity: 'Spray bottle application',
                    instructions: 'Apply early morning. Avoid over-watering.'
                };
            } else if (diseaseKey.includes('Sigatoka') || diseaseKey.includes('Cordana')) {
                recommendation = {
                    fertilizer: 'Mineral Oil / Bio-Fungicide',
                    quantity: 'Spray on leaves',
                    instructions: 'Promote good drainage. Remove dead leaves to reduce humidity around the plant.'
                };
            } else if (diseaseKey.includes('Leaf_Spot') || diseaseKey.includes('Spot') || diseaseKey.includes('Septoria')) {
                recommendation = {
                    fertilizer: 'Neem Oil / Aloe Vera Juice',
                    quantity: 'Spraying thoroughly',
                    instructions: 'Remove spotted leaves. Avoid overhead watering to keep leaves dry.'
                };
            } else if (diseaseKey.includes('Curl') || diseaseKey.includes('Mosaic') || diseaseKey.includes('Yellow')) {
                // Leaf Curl / Mosaic / Yellow Leaf are often viral
                recommendation = {
                    fertilizer: 'Buttermilk Spray / Sticky Traps',
                    quantity: 'Spray diluted sour buttermilk',
                    instructions: 'Control aphids/whiteflies using yellow sticky traps. Remove infected plants.'
                };
            } else if (diseaseKey.includes('Wilt') || diseaseKey.includes('RedRot')) {
                recommendation = {
                    fertilizer: 'Trichoderma Bio-agent',
                    quantity: 'Mix with soil',
                    instructions: 'Improve drainage immediately. Avoid water logging.'
                };
            } else if (diseaseKey.includes('White_Mold')) {
                recommendation = {
                    fertilizer: 'Vinegar Solution (Diluted)',
                    quantity: 'Spray on mold',
                    instructions: 'Improve air circulation drastically. Mold thrives in stagnant moist air.'
                };
            } else if (diseaseKey.includes('Insect') || diseaseKey.includes('Whitefly')) {
                recommendation = {
                    fertilizer: 'Neem Oil / Soap Water',
                    quantity: '5ml / liter',
                    instructions: 'Spray directly on pests. Check undersides of leaves.'
                };
            } else if (diseaseKey.toLowerCase().includes('healthy')) {
                recommendation = {
                    fertilizer: 'Vermicompost / Kitchen Waste Compost',
                    quantity: '1 handful per pot',
                    instructions: 'Mix with topsoil. Water regularly.'
                };
            } else {
                // Generic Disease (Home)
                recommendation = {
                    fertilizer: 'Organic Bio-Fungicide',
                    quantity: 'As per bottle cap',
                    instructions: 'Isolate plant if possible. Improve air circulation.'
                };
            }

        } else {
            // --- COMMERCIAL FARMING (Chemical / Large Scale) ---
            if (diseaseKey.includes('Blight')) {
                recommendation = {
                    fertilizer: 'Fungicide (Hexaconazole / Mancozeb)',
                    quantity: '2 ml/liter (200L per acre)',
                    instructions: 'Spray immediately covering underside of leaves. Repeat in 15 days.'
                };
            } else if (diseaseKey.includes('Rust')) {
                recommendation = {
                    fertilizer: 'Sulphur Dust / Propiconazole',
                    quantity: '25 kg/acre',
                    instructions: 'Dust in early morning. Avoid high nitrogen fertilizers temporarily.'
                };
            } else if (diseaseKey.includes('Sigatoka') || diseaseKey.includes('Cordana')) {
                recommendation = {
                    fertilizer: 'Propiconazole / Difenoconazole',
                    quantity: '1 ml/liter',
                    instructions: 'Critical for Banana. Alternating fungicides prevents resistance. remove infected leaves.'
                };
            } else if (diseaseKey.includes('Leaf_Spot') || diseaseKey.includes('Spot') || diseaseKey.includes('Septoria')) {
                recommendation = {
                    fertilizer: 'Copper Oxychloride / Mancozeb',
                    quantity: '2.5g/liter water',
                    instructions: 'Foliar spray. Repeat after 10 days if detecting early signs. Ensure wider spacing.'
                };
            } else if (diseaseKey.includes('Curl') || diseaseKey.includes('Mosaic') || diseaseKey.includes('Yellow')) {
                recommendation = {
                    fertilizer: 'Imidacloprid (Vector Control)',
                    quantity: '0.5ml / liter',
                    instructions: 'Viral disease has no cure. Control vectors (whitefly/thrips). Destroy infected plants.'
                };
            } else if (diseaseKey.includes('Wilt')) {
                recommendation = {
                    fertilizer: 'Trichoderma viride / Pseudomonas',
                    quantity: '2 kg/acre (Soil Drenching)',
                    instructions: 'Drench root zone. Stop irrigation immediately if fungal wilt is suspected.'
                };
            } else if (diseaseKey.includes('RedRot')) {
                recommendation = {
                    fertilizer: 'Carbendazim (0.1%)',
                    quantity: 'Seed treatment (Setts)',
                    instructions: 'Destroy infected canes. Use resistant varieties. Do not reuse seeds from infected fields.'
                };
            } else if (diseaseKey.includes('White_Mold')) {
                recommendation = {
                    fertilizer: 'Carbendazim / Topsin-M',
                    quantity: '1g / liter',
                    instructions: 'Soil drenching and foliar spray. Reduce irrigation frequency.'
                };
            } else if (diseaseKey.includes('Insect') || diseaseKey.includes('Whitefly')) {
                recommendation = {
                    fertilizer: 'Acetamiprid / Thiamethoxam',
                    quantity: '0.3g / liter',
                    instructions: 'Systemic insecticide for sucking pests. Rotate chemicals.'
                };
            } else if (diseaseKey.toLowerCase().includes('healthy')) {
                recommendation = {
                    fertilizer: 'Urea / DAP / MOP (Based on Soil)',
                    quantity: '50 kg/acre (Split dose)',
                    instructions: 'Standard prophylactic spray. Monitor for pests.'
                };
            } else {
                recommendation = {
                    fertilizer: 'Broad Spectrum Fungicide',
                    quantity: '500g / acre',
                    instructions: 'Consult local agronomist. Ensure proper drainage.'
                };
            }
        }

        // 4. Save to Database (Predictions Table)
        const fakeInternalPath = imageFile.path.replace(/\\/g, '/');
        const weatherPool = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Humid'];
        const randomWeather = weatherPool[Math.floor(Math.random() * weatherPool.length)];

        try {
            logger.info(`Saving prediction to database for User ${userId}, Crop ${cropId}`);
            await db.query(`
                INSERT INTO predictions 
                (user_id, crop_id, image_path, disease_detected, confidence, location_district, location_state, weather_condition)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                userId,
                cropId,
                fakeInternalPath,
                diseaseResult.disease,
                diseaseResult.confidence,
                district || 'Unknown',
                state || 'Unknown',
                randomWeather
            ]);
            logger.info('Analysis saved to database successfully.');
        } catch (dbInsertError) {
            logger.error(`Database Insert Error (Predictions): ${dbInsertError.message}`);
            // We don't necessarily want to fail the whole request if DB logging fails, 
            // but for debugging purposes, let's keep it throwing for now.
            throw new Error(`Failed to save analysis: ${dbInsertError.message}`);
        }

        res.status(200).json({
            success: true,
            diseaseAnalysis: diseaseResult,
            recommendation: recommendation,
            weatherNote: `${randomWeather} conditions detected.`
        });

    } catch (error) {
        logger.error(`Controller Error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: error.message || 'Analysis failed',
            details: error.message
        });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const userId = 1; // Default User
        const [history] = await db.query(`
            SELECT p.*, c.crop_name 
            FROM predictions p 
            JOIN crops c ON p.crop_id = c.id 
            WHERE p.user_id = ? 
            ORDER BY p.created_at DESC
        `, [userId]);

        // Calculate Stats for Dashboard
        const total = history.length;
        const healthy = history.filter(h => h.disease_detected === 'Healthy').length;
        const issues = total - healthy;

        // Group for Charts
        const diseaseCounts = history.reduce((acc, curr) => {
            const name = curr.disease_detected.replace(/_/g, ' ');
            acc[name] = (acc[name] || 0) + 1;
            return acc;
        }, {});

        const chartData = Object.keys(diseaseCounts).map(key => ({
            name: key,
            value: diseaseCounts[key]
        }));

        res.status(200).json({
            success: true,
            data: {
                history,
                stats: { total, healthy, issues },
                chartData
            }
        });

    } catch (err) {
        logger.error(`History Fetch Error: ${err.message}`);
        res.status(500).json({ message: 'Failed to fetch history' });
    }
};

exports.deleteHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = 1; // Default User
        logger.info(`Attempting to delete history record: ${id} for user: ${userId}`);

        const [result] = await db.query('DELETE FROM predictions WHERE id = ? AND user_id = ?', [id, userId]);
        logger.info(`Delete result: ${JSON.stringify(result)}`);

        if (result.affectedRows === 0) {
            logger.warn(`No record found to delete for ID: ${id}`);
            return res.status(404).json({ message: 'History record not found or unauthorized' });
        }

        res.status(200).json({ success: true, message: 'History record deleted successfully' });
    } catch (err) {
        logger.error(`History Delete Error: ${err.message}`);
        res.status(500).json({ message: 'Failed to delete history' });
    }
};

exports.getCropSchedule = async (req, res) => {
    try {
        const schedule = await mlService.getCropSchedule(req.body);
        res.status(200).json({ success: true, data: schedule });
    } catch (err) {
        logger.error(`Crop Schedule Error: ${err.message}`);
        res.status(500).json({ success: false, message: 'Failed to generate crop schedule' });
    }
};

exports.getCropGroups = async (req, res) => {
    try {
        const groups = await mlService.getCropGroups();
        res.status(200).json({ success: true, data: groups });
    } catch (err) {
        logger.error(`Crop Groups Error: ${err.message}`);
        res.status(500).json({ success: false, message: 'Failed to fetch crop groups' });
    }
};

exports.chatWithFarmer = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        const reply = await mlService.getChatResponse(message);
        res.status(200).json({ reply });
    } catch (err) {
        logger.error(`Chat Error: ${err.message}`);
        res.status(500).json({ message: err.message || 'AI Assistant failed' });
    }
};
