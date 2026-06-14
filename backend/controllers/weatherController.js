const logger = require('../utils/logger');
const { geminiWeatherAdvisory } = require('../services/geminiAdvisor');
const axios = require('axios');

// ── Strip "District" suffix ──────────────────────────────────────────────────
function cleanDistrict(raw = '') {
    return raw.replace(/\s*district\s*/gi, '').trim();
}

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
