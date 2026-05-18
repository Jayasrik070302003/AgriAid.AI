const logger = require('../utils/logger');
const { geminiWeatherAdvisory } = require('../services/geminiAdvisor');

exports.refineWeather = async (req, res) => {
    try {
        const { location, current, daily } = req.body;
        if (!location || !current) {
            return res.status(400).json({ success: false, message: 'location and current weather required' });
        }

        const advisory = await geminiWeatherAdvisory(location, { current, daily });

        res.json({ success: true, data: advisory });
    } catch (error) {
        logger.error(`refineWeather error: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
};
