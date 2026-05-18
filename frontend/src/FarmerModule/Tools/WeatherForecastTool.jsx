import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CloudSun, Wind, Droplets, MapPin, Sun, CloudRain, 
    Thermometer, Umbrella, CloudLightning, Eye, 
    CheckCircle2, AlertCircle, XCircle, Search,
    Navigation, Waves, ThermometerSun
} from 'lucide-react';
import axios from 'axios';
import clsx from 'clsx';

const WeatherForecastTool = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [advisory, setAdvisory] = useState('Enter a location to get a personalized farming advisory.');
    const [notification, setNotification] = useState(null);
    const searchRef = useRef(null);

    const [weatherData, setWeatherData] = useState({
        temp: 29,
        condition: 'Partly Cloudy',
        humidity: 71,
        wind: 5.3,
        feelsLike: 34,
        uvIndex: 4,
        visibility: 10,
        pressure: 1012,
        location: 'Cuddalore, Tamil Nadu',
        icon: CloudSun,
        precipitation: 12,
        summary: 'LOADING REFINED WEATHER...'
    });

    const [weeklyForecast, setWeeklyForecast] = useState([
        { day: 'Today', date: 'Mar 20', high: 33, low: 24, condition: 'Thunderstorm', icon: CloudLightning, color: 'text-purple-500', bg: 'bg-purple-50' },
        { day: 'Tomorrow', date: 'Mar 21', high: 34, low: 24, condition: 'Foggy', icon: Wind, color: 'text-slate-400', bg: 'bg-slate-50' },
        { day: 'Sunday', date: 'Mar 22', high: 35, low: 24, condition: 'Foggy', icon: Wind, color: 'text-slate-400', bg: 'bg-slate-50' },
        { day: 'Monday', date: 'Mar 23', high: 34, low: 24, condition: 'Foggy', icon: Wind, color: 'text-slate-400', bg: 'bg-slate-50' },
        { day: 'Tuesday', date: 'Mar 24', high: 35, low: 23, condition: 'Foggy', icon: Wind, color: 'text-slate-400', bg: 'bg-slate-50' },
    ]);

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const getWeatherDetails = (code) => {
        if (code === 0) return { label: 'Clear Sky', icon: Sun, color: 'text-amber-500', bg: 'bg-amber-50' };
        if (code >= 1 && code <= 3) return { label: 'Partly Cloudy', icon: CloudSun, color: 'text-blue-500', bg: 'bg-blue-50' };
        if (code >= 45 && code <= 48) return { label: 'Foggy', icon: Wind, color: 'text-slate-400', bg: 'bg-slate-50' };
        if (code >= 51 && code <= 55) return { label: 'Drizzle', icon: CloudRain, color: 'text-indigo-400', bg: 'bg-indigo-50' };
        if (code >= 61 && code <= 67) return { label: 'Rain', icon: CloudRain, color: 'text-indigo-600', bg: 'bg-indigo-50' };
        if (code >= 80 && code <= 82) return { label: 'Showers', icon: Droplets, color: 'text-blue-600', bg: 'bg-blue-50' };
        if (code >= 95) return { label: 'Thunderstorm', icon: CloudLightning, color: 'text-purple-600', bg: 'bg-purple-50' };
        return { label: 'Unknown', icon: CloudSun, color: 'text-slate-400', bg: 'bg-slate-50' };
    };

    const fetchSuggestions = async (query) => {
        if (!query || query.length < 3) return;
        try {
            const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=5&language=en&format=json`);
            const data = await res.json();
            setSuggestions(data.results || []);
        } catch (error) { console.error(error); }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchQuery.trim()) fetchSuggestions(searchQuery);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const fetchWeatherData = async (locationData) => {
        setLoading(true);
        setShowSuggestions(false);
        try {
            let lat, lon, locName, name, admin, country;
            if (typeof locationData === 'string') {
                const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${locationData}&count=1&language=en&format=json`);
                const data = await res.json();
                if (!data.results?.[0]) {
                    showNotification('error', 'Location not found');
                    return;
                }
                ({ latitude: lat, longitude: lon, name, admin1: admin, country } = data.results[0]);
            } else {
                ({ latitude: lat, longitude: lon, name, admin1: admin, country } = locationData);
            }
            locName = `${name}, ${admin || country || ''}`;
            
            const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,surface_pressure,wind_speed_10m,apparent_temperature,precipitation&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max&timezone=auto`);
            const data = await weatherRes.json();
            const curr = data.current;
            const details = getWeatherDetails(curr.weather_code);

            setWeatherData(prev => ({
                ...prev,
                temp: Math.round(curr.temperature_2m),
                condition: details.label,
                humidity: curr.relative_humidity_2m,
                wind: curr.wind_speed_10m,
                feelsLike: Math.round(curr.apparent_temperature),
                uvIndex: Math.round(data.daily.uv_index_max[0]),
                pressure: Math.round(curr.surface_pressure),
                location: locName,
                icon: details.icon,
                precipitation: curr.precipitation || 0
            }));

            const daily = data.daily;
            setWeeklyForecast(daily.time.slice(0, 5).map((date, i) => {
                const d = new Date(date);
                const det = getWeatherDetails(daily.weather_code[i]);
                return {
                    day: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'long' }),
                    date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    high: Math.round(daily.temperature_2m_max[i]),
                    low: Math.round(daily.temperature_2m_min[i]),
                    condition: det.label,
                    icon: det.icon,
                    color: det.color,
                    bg: det.bg
                };
            }));

            // Optional Refinement
            try {
                const refRes = await axios.post('http://localhost:3001/api/farmer/weather/refine', {
                    location: locName,
                    current: { temp: Math.round(curr.temperature_2m), humidity: curr.relative_humidity_2m }
                });
                if (refRes.data.success) {
                    setAdvisory(refRes.data.data.advisory);
                    setWeatherData(prev => ({ ...prev, summary: refRes.data.data.summary.toUpperCase() }));
                }
            } catch (e) { console.warn("AI Refinement unavailable"); }

        } catch (e) { showNotification('error', 'Failed to fetch weather'); }
        finally { setLoading(false); }
    };

    return (
        <div className="w-full max-w-[1600px] mx-auto p-4 md:p-8 pb-24 relative min-h-screen font-sans selection:bg-blue-200">
            
            {/* ── Background Decorative ────────────────────────── */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[40%] bg-blue-500/5 rounded-full blur-[100px] animate-pulse delay-700" />
            </div>

            {/* ── Header & Search ─────────────────────────────── */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[1.2rem] shadow-sm">
                        <CloudSun className="h-7 w-7 text-blue-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            Weather <span className="text-blue-600">Forecast</span>
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Live Updates for {weatherData.location}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="relative w-full lg:w-[400px]" ref={searchRef}>
                    <form onSubmit={(e) => { e.preventDefault(); fetchWeatherData(searchQuery); }} className="flex gap-2">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search city..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-xl py-2.5 pl-10 pr-4 text-sm font-semibold focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 outline-none transition-all shadow-sm"
                            />
                            
                            {/* Suggestions Dropdown */}
                            <AnimatePresence>
                                {showSuggestions && suggestions.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl z-[50] overflow-hidden"
                                    >
                                        {suggestions.map((loc, i) => (
                                            <div key={i} onClick={() => { fetchWeatherData(loc); setSearchQuery(''); setSuggestions([]); }}
                                                 className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors flex items-center gap-3 border-b border-slate-50 dark:border-slate-800 last:border-0">
                                                <Navigation className="h-3 w-3 text-blue-500" />
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-800 dark:text-white">{loc.name}</span>
                                                    <span className="text-[9px] text-slate-400 font-medium">{loc.admin1}, {loc.country}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <button type="submit" className="px-6 py-2.5 bg-slate-900 dark:bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 active:scale-95 transition-all">
                            {loading ? '...' : 'Check'}
                        </button>
                    </form>
                </div>
            </div>

            {/* ── Main Dashboard Grid ─────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* ZONE 1: MAIN WEATHER CARD (Left) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="lg:col-span-4 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden flex flex-col justify-between min-h-[550px]"
                >
                    {/* Glass Decorations */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/5 rounded-full blur-[60px] -ml-24 -mb-24 pointer-events-none" />
                    
                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-10">
                            <div className="flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md border border-white/20 rounded-full">
                                <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-wider">Live</span>
                            </div>
                            <MapPin className="h-5 w-5 opacity-50" />
                        </div>

                        <div className="text-center">
                            <motion.div 
                                animate={{ y: [0, -12, 0] }}
                                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                            >
                                <weatherData.icon className="h-36 w-36 mx-auto mb-6 text-yellow-300 drop-shadow-[0_10px_30px_rgba(253,224,71,0.4)]" />
                            </motion.div>
                            <h2 className="text-[100px] font-black tracking-tighter leading-none mb-2 select-none">
                                {weatherData.temp}<span className="text-6xl text-white/50">°</span>
                            </h2>
                            <p className="text-2xl font-black tracking-tight">{weatherData.condition}</p>
                            <span className="text-xs font-bold text-white/40 uppercase tracking-[0.2em] mt-3 block">Feels like {weatherData.feelsLike}°</span>
                        </div>
                    </div>

                    <div className="relative z-10 grid grid-cols-2 gap-4 mt-12">
                        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/5 group hover:bg-white/15 transition-all">
                            <div className="flex items-center gap-2 mb-2 opacity-60">
                                <Wind className="h-4 w-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Wind</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black">{weatherData.wind}</span>
                                <span className="text-[10px] font-bold opacity-40">km/h</span>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/5 group hover:bg-white/15 transition-all">
                            <div className="flex items-center gap-2 mb-2 opacity-60">
                                <Droplets className="h-4 w-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Humidity</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black">{weatherData.humidity}</span>
                                <span className="text-[10px] font-bold opacity-40">%</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ZONE 2: METRICS & FORECAST (Right) */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    
                    {/* Metric Cards Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'UV INDEX', value: weatherData.uvIndex, unit: 'Mod', icon: Sun, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
                            { label: 'PRESSURE', value: weatherData.pressure, unit: 'hPa', icon: Waves, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
                            { label: 'VISIBILITY', value: weatherData.visibility, unit: 'km', icon: Eye, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                            { label: 'RAIN', value: weatherData.precipitation, unit: '%', icon: Umbrella, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-100' },
                        ].map((metric, i) => (
                            <motion.div
                                key={i} whileHover={{ scale: 1.03 }}
                                className={clsx(
                                    "p-3.5 rounded-[14px] border transition-all duration-300 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 flex items-center gap-3 shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.06)]"
                                )}
                            >
                                <div className={clsx("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", metric.bg)}>
                                    <metric.icon className={clsx("h-4 w-4", metric.color)} />
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-tight mb-0.5">{metric.label}</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-[17px] font-black text-slate-800 dark:text-white leading-none">{metric.value}</span>
                                        <span className="text-[11px] font-bold text-slate-400">{metric.unit}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* 7-Day Forecast */}
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-3 tracking-tight">
                                <div className="p-1.5 bg-slate-900 rounded-lg text-white">
                                    <CalendarIcon className="h-4 w-4" />
                                </div>
                                7-Day Forecast
                            </h3>
                            <div className="h-px flex-1 mx-6 bg-slate-100 dark:bg-slate-800" />
                        </div>

                        {loading ? (
                            <div className="space-y-4 animate-pulse">
                                {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl" />)}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {weeklyForecast.map((day, i) => (
                                    <motion.div
                                        key={i} initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.05 }}
                                        className={clsx(
                                            "flex items-center justify-between p-4 rounded-2xl transition-all group",
                                            day.day === 'Today' ? "bg-blue-50/50 dark:bg-blue-500/5 ring-1 ring-blue-500/10" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                        )}
                                    >
                                        <div className="flex items-center gap-5 w-1/3">
                                            <div className={clsx("w-11 h-11 rounded-[14px] flex items-center justify-center transition-transform group-hover:rotate-[10deg]", day.bg)}>
                                                <day.icon className={clsx("h-5 w-5", day.color)} />
                                            </div>
                                            <div>
                                                <p className="text-[13px] font-black text-slate-800 dark:text-white tracking-tight">{day.day}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{day.date}</p>
                                            </div>
                                        </div>

                                        <div className="hidden md:block">
                                            <span className="px-3 py-1 rounded-full text-[10px] font-black bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 shadow-sm uppercase tracking-widest group-hover:border-blue-500/30 transition-colors">
                                                {day.condition}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-4 w-[100px] justify-end">
                                            <span className="text-base font-black text-slate-800 dark:text-white tabular-nums">{day.high}°</span>
                                            <span className="text-xs font-bold text-slate-300 dark:text-slate-600 tabular-nums">{day.low}°</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Smart Farming Advisory ─────────────────────── */}
            <div className="mt-8 bg-amber-50 rounded-[2rem] p-8 border-l-[6px] border-amber-400 flex flex-col md:flex-row items-center md:items-start gap-6 shadow-xl shadow-amber-200/10 dark:bg-amber-950/20 dark:border-amber-900/50 transition-all hover:scale-[1.01]">
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl text-amber-500 shadow-sm ring-1 ring-amber-100 dark:ring-amber-900/40 transform -rotate-6">
                    <Sun className="h-7 w-7" />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h4 className="font-black text-amber-900 dark:text-amber-100 text-lg mb-2 uppercase tracking-tight">Smart Farming Advisory</h4>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                        <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-black rounded-lg uppercase tracking-wider border border-amber-200 dark:border-amber-800">
                            {weatherData.summary}
                        </span>
                        {weatherData.precipitation > 20 && (
                            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-black rounded-lg uppercase tracking-wider border border-blue-200">
                                High Moisture
                            </span>
                        )}
                    </div>
                    <p className="text-amber-800/80 leading-relaxed font-semibold dark:text-amber-200/80 max-w-4xl italic">
                        "{advisory}"
                    </p>
                </div>
            </div>

            <div className="mt-12 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-50">
                    © 2026 AgriAid AI Systems. Built for Indian Farmers.
                </p>
            </div>
        </div>
    );
};

// Helper Icon
const CalendarIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
);

export default WeatherForecastTool;
