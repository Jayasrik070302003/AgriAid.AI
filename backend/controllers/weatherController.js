const logger = require('../utils/logger');
const { geminiWeatherAdvisory } = require('../services/geminiAdvisor');
const axios = require('axios');

exports.reverseGeocode = async (req, res) => {
    try {
        const { lat, lng } = req.query;
        if (!lat || !lng) return res.status(400).json({ success: false, message: 'lat and lng required' });

        const key = process.env.OPENCAGE_API_KEY;
        if (!key) return res.status(500).json({ success: false, message: 'OPENCAGE_API_KEY not set' });

        const { data } = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
            params: { q: `${lat}+${lng}`, key, language: 'en', limit: 1, countrycode: 'in' }
        });

        const result = data.results?.[0];
        if (!result) return res.status(404).json({ success: false, message: 'Location not found' });

        const comp = result.components;
        res.json({
            success: true,
            data: {
                city: comp.city || comp.town || comp.village || comp.suburb || '',
                district: comp.state_district || comp.county || comp.city || '',
                state: comp.state || '',
                country: comp.country || '',
                formatted: result.formatted || ''
            }
        });
    } catch (error) {
        logger.error(`reverseGeocode error: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
};

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
