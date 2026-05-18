const axios = require('axios');

const OW_BASE = 'https://api.openweathermap.org/data/2.5';

async function getWeather(lat, lon) {
    const key = process.env.OPENWEATHER_API_KEY;
    if (!key) throw new Error('OPENWEATHER_API_KEY not configured');
    const [current, forecast] = await Promise.all([
        axios.get(`${OW_BASE}/weather`, { params: { lat, lon, appid: key, units: 'metric' } }),
        axios.get(`${OW_BASE}/forecast`, { params: { lat, lon, appid: key, units: 'metric', cnt: 7 } })
    ]);
    const c = current.data;
    return {
        temp: c.main.temp, feelsLike: c.main.feels_like, humidity: c.main.humidity,
        wind: c.wind.speed, condition: c.weather[0].main, description: c.weather[0].description,
        pressure: c.main.pressure, visibility: (c.visibility / 1000).toFixed(1),
        precipitation: c.rain?.['1h'] || 0,
        daily: forecast.data.list.slice(0, 7).map(d => ({ time: d.dt_txt, temp: d.main.temp, condition: d.weather[0].main }))
    };
}

async function getWeatherByCity(city) {
    const key = process.env.OPENWEATHER_API_KEY;
    if (!key) throw new Error('OPENWEATHER_API_KEY not configured');
    const geo = await axios.get('http://api.openweathermap.org/geo/1.0/direct', { params: { q: `${city},IN`, limit: 1, appid: key } });
    if (!geo.data.length) throw new Error(`City not found: ${city}`);
    const { lat, lon } = geo.data[0];
    return getWeather(lat, lon);
}

module.exports = { getWeather, getWeatherByCity };
