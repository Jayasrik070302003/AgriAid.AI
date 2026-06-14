const logger = require('../utils/logger');
const { geminiWeatherAdvisory } = require('../services/geminiAdvisor');
const { getWeatherByCoords } = require('../services/weatherEngine');
const axios = require('axios');

// ── Strip "District" suffix ──────────────────────────────────────────────────
function cleanDistrict(raw = '') {
    return raw.replace(/\s*district\s*/gi, '').trim();
}

// ── GET /api/farmer/weather/by-coords?lat=&lon= ───────────────────────────────
// ALWAYS coordinate-based. Never city name. Never IP.
exports.getWeather = async (req, res) => {
    try {
        const { lat, lon } = req.query;
        if (!lat || !lon) return res.status(400).json({ success: false, message: 'lat and lon required' });
        console.log('[WEATHER] Fetch Started', { lat, lon });
        const weather = await getWeatherByCoords(parseFloat(lat), parseFloat(lon));
        console.log('[WEATHER] Success', { temp: weather.temp, condition: weather.condition });
        res.json({ success: true, data: weather });
    } catch (error) {
        console.error('[WEATHER] Failed:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch weather.' });
    }
};

// ── Reverse Geocode via Nominatim (free, no API key) ─────────────────────────
exports.reverseGeocode = async (req, res) => {
    try {
        const { lat, lng } = req.query;
        if (!lat || !lng) return res.status(400).json({ success: false, message: 'lat and lng required' });

        console.log('[Nominatim] Reverse geocoding started', { lat, lng });

        const { data } = await axios.get('https://nominatim.openstreetmap.org/reverse', {
            params: { format: 'jsonv2', lat, lon: lng },
            headers: { 'Accept-Language': 'en', 'User-Agent': 'AgriAid.AI/1.0' },
            timeout: 10000
        });

        const addr = data.address || {};
        const city     = addr.city || addr.town || addr.village || addr.suburb || '';
        const district = cleanDistrict(addr.county || addr.state_district || addr.city || city);
        const state    = addr.state || '';
        const country  = addr.country || '';

        console.log('[Nominatim] Reverse geocoding success', { city, district, state });

        res.json({
            success: true,
            data: {
                city,
                district,
                state,
                country,
                formatted: data.display_name || `${city}, ${state}, ${country}`
            }
        });
    } catch (error) {
        logger.error(`reverseGeocode error: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ── AI Weather Advisory (unchanged) ─────────────────────────────────────────
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
