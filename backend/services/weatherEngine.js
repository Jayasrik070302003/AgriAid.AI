const axios = require('axios');

// Open-Meteo — 100% FREE, no API key, no credit card
const GEO_URL     = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

const WMO_CONDITIONS = {
    0: 'Clear Sky', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
    45: 'Foggy', 48: 'Icy Fog',
    51: 'Light Drizzle', 53: 'Drizzle', 55: 'Heavy Drizzle',
    61: 'Light Rain', 63: 'Rain', 65: 'Heavy Rain',
    80: 'Showers', 81: 'Heavy Showers', 82: 'Violent Showers',
    95: 'Thunderstorm', 96: 'Thunderstorm with Hail', 99: 'Heavy Thunderstorm'
};

async function getWeatherByCoords(lat, lon) {
    const res = await axios.get(WEATHER_URL, {
        params: {
            latitude: lat, longitude: lon,
            current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation,surface_pressure',
            daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,uv_index_max',
            timezone: 'auto',
            forecast_days: 7
        },
        timeout: 15000
    });

    const c = res.data.current;
    const d = res.data.daily;

    return {
        temp: c.temperature_2m,
        feelsLike: c.apparent_temperature,
        humidity: c.relative_humidity_2m,
        wind: c.wind_speed_10m,
        condition: WMO_CONDITIONS[c.weather_code] || 'Unknown',
        weatherCode: c.weather_code,
        pressure: c.surface_pressure,
        precipitation: c.precipitation,
        daily: d.time.map((date, i) => ({
            date,
            condition: WMO_CONDITIONS[d.weather_code[i]] || 'Unknown',
            tempMax: d.temperature_2m_max[i],
            tempMin: d.temperature_2m_min[i],
            precipitation: d.precipitation_sum[i],
            uvIndex: d.uv_index_max[i]
        }))
    };
}

async function getWeatherByCity(city) {
    const geo = await axios.get(GEO_URL, {
        params: { name: city, count: 1, language: 'en', format: 'json' },
        timeout: 10000
    });

    if (!geo.data.results?.length) throw new Error(`City not found: ${city}`);
    const { latitude, longitude, name, admin1, country } = geo.data.results[0];
    const weather = await getWeatherByCoords(latitude, longitude);
    return { ...weather, location: `${name}, ${admin1 || country}`, lat: latitude, lon: longitude };
}

module.exports = { getWeatherByCoords, getWeatherByCity };
