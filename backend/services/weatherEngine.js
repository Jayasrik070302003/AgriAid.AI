const axios = require('axios');

const OWM_CURRENT  = 'https://api.openweathermap.org/data/2.5/weather';
const OWM_FORECAST = 'https://api.openweathermap.org/data/2.5/forecast';

// ── Primary: fetch by coordinates (always used) ──────────────────────────────
async function getWeatherByCoords(lat, lon) {
    const API_KEY = process.env.OPENWEATHER_API_KEY;
    if (!API_KEY) throw new Error('OPENWEATHER_API_KEY not set');

    console.log('[Weather] Fetch by Coordinates', { lat, lon });

    const [currentRes, forecastRes] = await Promise.all([
        axios.get(OWM_CURRENT,  { params: { lat, lon, appid: API_KEY, units: 'metric' }, timeout: 15000 }),
        axios.get(OWM_FORECAST, { params: { lat, lon, appid: API_KEY, units: 'metric', cnt: 40 }, timeout: 15000 })
    ]);

    const c = currentRes.data;
    console.log('[Weather] Success', { temp: c.main.temp, condition: c.weather[0].description });

    return {
        temp:          c.main.temp,
        feelsLike:     c.main.feels_like,
        humidity:      c.main.humidity,
        wind:          c.wind.speed,
        condition:     c.weather[0].description,
        weatherCode:   c.weather[0].id,
        pressure:      c.main.pressure,
        precipitation: c.rain?.['1h'] || 0,
        daily:         buildDailyForecast(forecastRes.data.list)
    };
}

function buildDailyForecast(list) {
    const map = {};
    for (const item of list) {
        const date = item.dt_txt.split(' ')[0];
        if (!map[date]) {
            map[date] = { date, temps: [], precip: 0, condition: item.weather[0].description };
        }
        map[date].temps.push(item.main.temp);
        map[date].precip += item.rain?.['3h'] || 0;
    }
    return Object.values(map).slice(0, 7).map(d => ({
        date:          d.date,
        condition:     d.condition,
        tempMax:       Math.max(...d.temps),
        tempMin:       Math.min(...d.temps),
        precipitation: parseFloat(d.precip.toFixed(1)),
        uvIndex:       null
    }));
}

// ── Geocode city → coords → weather (used only when no GPS coords available) ─
async function getWeatherByCity(city) {
    console.log('[Weather] Geocoding city to coords:', city);
    const geoRes = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
        params: { name: city, count: 1, language: 'en', format: 'json' },
        timeout: 10000
    });

    if (!geoRes.data.results?.length) throw new Error(`City not found: ${city}`);
    const { latitude, longitude, name, admin1, country } = geoRes.data.results[0];

    const weather = await getWeatherByCoords(latitude, longitude);
    return { ...weather, location: `${name}, ${admin1 || country}`, lat: latitude, lon: longitude };
}

module.exports = { getWeatherByCoords, getWeatherByCity };
