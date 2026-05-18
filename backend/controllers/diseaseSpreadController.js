const supabase = require('../database/supabaseClient');
const logger = require('../utils/logger');
const { getSpreadAnalysis } = require('../services/analysisEngine');
const { getWeatherByCity } = require('../services/weatherEngine');

const DISEASE_R0 = { Blast: 1.8, Rust: 2.2, Blight: 1.5, Mosaic: 1.2 };

exports.predictSpread = async (req, res) => {
    try {
        const { cropName, diseaseName, severity = 0.5, farmSize, state, district } = req.body;

        // 1. Fetch real weather
        let weather = { temp: 28, humidity: 70, wind: 10 };
        try {
            const w = await getWeatherByCity(`${district}, ${state}`);
            weather = { temp: w.temp, humidity: w.humidity, wind: w.wind };
        } catch (e) {
            logger.warn(`Weather fetch skipped: ${e.message}`);
        }

        // 2. Spread factor
        let r0 = DISEASE_R0.Blast;
        for (const key of Object.keys(DISEASE_R0)) {
            if (diseaseName?.includes(key)) { r0 = DISEASE_R0[key]; break; }
        }

        let spreadModifier = 1.0;
        if (weather.humidity > 80) spreadModifier += 0.3;
        if (weather.wind > 15) spreadModifier += 0.2;
        if (weather.temp > 25 && weather.temp < 32) spreadModifier += 0.15;

        const spreadProb = (r0 * spreadModifier) / 8.0;

        // 3. Cellular automata grid simulation
        const gridSize = 20;
        let grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
        const numCenters = Math.max(1, Math.ceil(severity * 5));
        for (let k = 0; k < numCenters; k++) {
            grid[Math.floor(Math.random() * gridSize)][Math.floor(Math.random() * gridSize)] = Math.max(0.5, Math.random());
        }

        let infectionCount7 = 0, infectionCount14 = 0;
        for (let day = 1; day <= 14; day++) {
            const newGrid = grid.map(row => [...row]);
            let infected = 0;
            for (let i = 0; i < gridSize; i++) {
                for (let j = 0; j < gridSize; j++) {
                    if (grid[i][j] > 0) {
                        newGrid[i][j] = Math.min(1.0, grid[i][j] + 0.1);
                        for (let dx = -1; dx <= 1; dx++) {
                            for (let dy = -1; dy <= 1; dy++) {
                                if (dx === 0 && dy === 0) continue;
                                const nx = i + dx, ny = j + dy;
                                if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize) {
                                    if (Math.random() < spreadProb * grid[i][j] && newGrid[nx][ny] < 0.2) {
                                        newGrid[nx][ny] += 0.1;
                                    }
                                }
                            }
                        }
                    }
                    if (newGrid[i][j] > 0.1) infected++;
                }
            }
            grid = newGrid;
            if (day === 7) infectionCount7 = infected;
            if (day === 14) infectionCount14 = infected;
        }

        const totalCells = gridSize * gridSize;
        const risk7 = Math.round((infectionCount7 / totalCells) * 100);
        const risk14 = Math.round((infectionCount14 / totalCells) * 100);

        const weatherStress = (Math.abs(weather.temp - 25) + (weather.humidity > 80 ? 10 : 0)) / 20;
        const mutationRisk = Math.round((weatherStress * 0.4 + (risk14 / 100) * 0.6) * 100);

        // 4. Gemini AI analysis
        let aiResult = { status: 'Warning', message: 'Monitor crop closely.', advice: 'Apply preventive treatment.' };
        try {
            aiResult = await getSpreadAnalysis(cropName, diseaseName, { risk7, risk14, mutationRisk }, weather);
        } catch (e) {
            logger.warn(`Spread AI analysis failed: ${e.message}`);
        }

        // 5. Save to Supabase
        const { error } = await supabase.from('simulations').insert({
            sim_type: 'disease_spread',
            crop_type: cropName,
            risk_level: risk14 > 60 ? 'High' : risk14 > 30 ? 'Medium' : 'Low',
            result_data: {
                diseaseName, farmSize, state, district,
                risk7, risk14, mutationRisk,
                weather, aiResult
            }
        });
        if (error) logger.warn(`Spread sim DB insert: ${error.message}`);

        res.json({
            success: true,
            data: { risk7, risk14, mutationRisk, heatmap: grid, explanation: `${aiResult.message} ${aiResult.advice}`, aiResult, weather }
        });

    } catch (error) {
        logger.error(`predictSpread error: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('simulations')
            .select('*')
            .eq('sim_type', 'disease_spread')
            .order('created_at', { ascending: false })
            .limit(20);
        if (error) throw error;
        res.json({ success: true, data: { history: data } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
