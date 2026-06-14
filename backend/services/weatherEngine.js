const axios = require('axios');

const OWM_URL = 'https://api.openweathermap.org/data/2.5/weather';
const OWM_FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';
const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';

async function getWeatherByCoords(lat, lon) {
    const API_KEY = process.env.OPENWEATHER_API_KEY;
    if (!API_KEY) throw new Error('OPENWEATHER_API_KEY not set');

    const [currentRes, forecastRes] = await Promise.all([
        axios.get(OWM_URL, {
            params: { lat, lon, appid: API_KEY, units: 'metric' },
            timeout: 15000
        }),
        axios.get(OWM_FORECAST_URL, {
            params: { lat, lon, appid: API_KEY, units: 'metric', cnt: 40 },
            timeout: 15000
        })
    ]);

    const c = currentRes.data;
    const daily = buildDailyForecast(forecastRes.data.list);

    return {
        temp: c.main.temp,
        feelsLike: c.main.feels_like,
        humidity: c.main.humidity,
        wind: c.wind.speed,
        condition: c.weather[0].description,
        weatherCode: c.weather[0].id,
        pressure: c.main.pressure,
        precipitation: c.rain?.['1h'] || 0,
        daily
    };
}

function buildDailyForecast(list) {
    const map = {};
    for (const item of list) {
        const date = item.dt_txt.split(' ')[0];
        if (!map[date]) {
            map[date] = { date, temps: [], precip: 0, condition: item.weather[0].description, code: item.weather[0].id };
        }
        map[date].temps.push(item.main.temp);
        map[date].precip += item.rain?.['3h'] || 0;
    }
    return Object.values(map).slice(0, 7).map(d => ({
        date: d.date,
        condition: d.condition,
        tempMax: Math.max(...d.temps),
        tempMin: Math.min(...d.temps),
        precipitation: parseFloat(d.precip.toFixed(1)),
        uvIndex: null
    }));
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
