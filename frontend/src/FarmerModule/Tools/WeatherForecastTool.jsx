import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CloudSun, Wind, Droplets, MapPin, Sun, CloudRain,
    Thermometer, Umbrella, CloudLightning, Eye,
    CheckCircle2, Navigation, Waves, ThermometerSun, ChevronDown, RefreshCw, AlertTriangle
} from 'lucide-react';
import clsx from 'clsx';
import { toast } from 'react-hot-toast';
import useGPS from '../../hooks/useGPS';
import { STATES_DISTRICTS } from '../../services/locationService';
import apiClient from '../../services/apiClient';

// ── Weather code → icon/label ─────────────────────────────────────────────────
function getWeatherDetails(code) {
    if (!code) return { label: 'Unknown', icon: CloudSun, color: 'text-slate-400', bg: 'bg-slate-50' };
    const id = parseInt(code, 10);
    if (id === 800)                   return { label: 'Clear Sky',     icon: Sun,          color: 'text-amber-500',  bg: 'bg-amber-50'  };
    if (id >= 801 && id <= 804)       return { label: 'Partly Cloudy', icon: CloudSun,     color: 'text-blue-500',   bg: 'bg-blue-50'   };
    if (id >= 300 && id <= 321)       return { label: 'Drizzle',       icon: CloudRain,    color: 'text-indigo-400', bg: 'bg-indigo-50' };
    if (id >= 500 && id <= 531)       return { label: 'Rain',          icon: CloudRain,    color: 'text-indigo-600', bg: 'bg-indigo-50' };
    if (id >= 200 && id <= 232)       return { label: 'Thunderstorm',  icon: CloudLightning,color: 'text-purple-600',bg: 'bg-purple-50' };
    if (id >= 600 && id <= 622)       return { label: 'Snow',          icon: CloudRain,    color: 'text-sky-400',    bg: 'bg-sky-50'    };
    if (id >= 701 && id <= 781)       return { label: 'Foggy',         icon: Wind,         color: 'text-slate-400',  bg: 'bg-slate-50'  };
    return { label: 'Cloudy', icon: CloudSun, color: 'text-slate-400', bg: 'bg-slate-50' };
}

// ── Manual picker ─────────────────────────────────────────────────────────────
const ManualPicker = ({ onSelect }) => {
    const [selState, setSelState]       = useState('Tamil Nadu');
    const [selDistrict, setSelDistrict] = useState('');
    const districts = STATES_DISTRICTS[selState] || [];
    return (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-4 flex flex-col gap-3 mb-6">
            <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                <p className="text-amber-700 dark:text-amber-300 text-xs font-semibold">GPS unavailable. Select your district.</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">State</label>
                    <select value={selState} onChange={e => { setSelState(e.target.value); setSelDistrict(''); }}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-700 dark:text-white appearance-none focus:outline-none">
                        {Object.keys(STATES_DISTRICTS).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-[28px] h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                </div>
                <div className="relative">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">District</label>
                    <select value={selDistrict} onChange={e => setSelDistrict(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-700 dark:text-white appearance-none focus:outline-none">
                        <option value="">Select district</option>
                        {districts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-[28px] h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                </div>
            </div>
            <button disabled={!selDistrict} onClick={() => onSelect(selDistrict, selState)}
                className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
                <MapPin className="h-4 w-4" /> Use {selDistrict || 'Selected'} Location
            </button>
        </div>
    );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const WeatherForecastTool = () => {
    const [loading, setLoading]           = useState(false);
    const [advisory, setAdvisory]         = useState('Click "Use My Location" to get a personalised farming advisory.');
    const [weatherData, setWeatherData]   = useState(null);
    const [weeklyForecast, setWeeklyForecast] = useState([]);
    const [mapLoaded, setMapLoaded]       = useState(false);

    const { location, loading: gpsLoading, error: gpsError, needsManual, detect, selectDistrict } = useGPS();

    // Fetch weather when coords arrive
    useEffect(() => {
        if (location.lat && location.lon) {
            fetchWeatherData(location.lat, location.lon);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.lat, location.lon]);

    const fetchWeatherData = async (lat, lon) => {
        setLoading(true);
        console.log('[WEATHER] Fetch Started', { lat, lon });
        try {
            const res = await apiClient.get(`/weather/by-coords?lat=${lat}&lon=${lon}`);
            if (!res.data.success) throw new Error('API error');
            const w = res.data.data;
            console.log('[WEATHER] Success', { temp: w.temp, condition: w.condition });

            const det = getWeatherDetails(w.weatherCode);
            setWeatherData({
                temp:          w.temp,
                feelsLike:     w.feelsLike,
                humidity:      w.humidity,
                wind:          w.wind,
                pressure:      w.pressure,
                visibility:    w.visibility,
                precipitation: w.precipitation,
                condition:     w.condition || det.label,
                icon:          det.icon,
                location:      w.locationName || `${lat.toFixed(3)}, ${lon.toFixed(3)}`,
                summary:       (w.condition || det.label).toUpperCase(),
            });

            if (w.daily?.length) {
                setWeeklyForecast(w.daily.slice(0, 5).map((d, i) => {
                    const date = new Date(d.date);
                    const dets = getWeatherDetails(d.weatherCode);
                    return {
                        day:       i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'long' }),
                        date:      date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        high:      d.tempMax,
                        low:       d.tempMin,
                        condition: d.condition || dets.label,
                        icon:      dets.icon,
                        color:     dets.color,
                        bg:        dets.bg,
                    };
                }));
            }

            // AI advisory (optional)
            try {
                const refRes = await apiClient.post('/weather/refine', {
                    location: w.locationName || `${lat},${lon}`,
                    current:  { temp: w.temp, humidity: w.humidity },
                    daily:    w.daily,
                });
                if (refRes.data.success) {
                    setAdvisory(refRes.data.data.advisory || advisory);
                    if (refRes.data.data.summary)
                        setWeatherData(prev => ({ ...prev, summary: refRes.data.data.summary.toUpperCase() }));
                }
            } catch { /* advisory is optional */ }

            setMapLoaded(true);
            toast.success('Weather loaded!');
        } catch (e) {
            console.error('[WEATHER] Failed', e.message);
            toast.error('Failed to fetch weather');
        } finally {
            setLoading(false);
        }
    };

    const isLoading = gpsLoading || loading;

    return (
        <div className="w-full max-w-[1600px] mx-auto p-4 md:p-8 pb-24 relative min-h-screen font-sans">

            {/* Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[40%] bg-blue-500/5 rounded-full blur-[100px] animate-pulse delay-700" />
            </div>

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
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
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                            </span>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {weatherData ? `Live · ${weatherData.location}` : 'GPS Coordinate-Based Weather'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Use My Location button */}
                <button
                    onClick={detect}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50"
                >
                    {isLoading
                        ? <RefreshCw className="h-4 w-4 animate-spin" />
                        : <MapPin className="h-4 w-4" />}
                    {isLoading ? 'Detecting...' : 'Use My Location'}
                </button>
            </div>

            {/* GPS error */}
            {gpsError && !needsManual && (
                <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-300 text-sm font-semibold">
                    {gpsError}
                </div>
            )}

            {/* Manual picker fallback */}
            {needsManual && <ManualPicker onSelect={selectDistrict} />}

            {/* Google Maps preview */}
            {location.lat && location.lon && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-8 rounded-[2rem] overflow-hidden border border-blue-200 dark:border-blue-900/40 shadow-lg">
                    <div className="bg-blue-50 dark:bg-blue-900/20 px-5 py-3 flex items-center justify-between border-b border-blue-100 dark:border-blue-900/40">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            <span className="text-sm font-bold text-blue-700 dark:text-blue-300">Location Detected Successfully</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-bold text-blue-600 dark:text-blue-400">
                            <span className="flex items-center gap-1"><Navigation className="h-3 w-3" /> Lat: {location.lat.toFixed(4)}</span>
                            <span className="flex items-center gap-1"><Navigation className="h-3 w-3" /> Lon: {location.lon.toFixed(4)}</span>
                            <span className="uppercase tracking-wider opacity-60">{location.source === 'manual' ? 'Manual' : 'GPS'}</span>
                        </div>
                    </div>
                    <iframe
                        title="Farm Location Preview"
                        width="100%"
                        height="280"
                        src={`https://maps.google.com/maps?q=${location.lat},${location.lon}&z=15&output=embed`}
                        style={{ border: 0, display: 'block' }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        onLoad={() => console.log('[MAP] Google Maps Loaded')}
                    />
                </motion.div>
            )}

            {/* Empty state */}
            {!location.lat && !isLoading && (
                <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-4">
                    <div className="p-5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                        <MapPin className="h-10 w-10 text-slate-300" />
                    </div>
                    <p className="text-sm font-semibold">Click "Use My Location" to get started</p>
                    <p className="text-xs text-slate-300">Browser GPS → Coordinates → OpenWeatherMap</p>
                </div>
            )}

            {/* Weather dashboard */}
            {weatherData && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Main weather card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="lg:col-span-4 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden flex flex-col justify-between min-h-[480px]"
                    >
                        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/5 rounded-full blur-[60px] -ml-24 -mb-24 pointer-events-none" />

                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md border border-white/20 rounded-full">
                                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-wider">Live</span>
                                </div>
                                <MapPin className="h-5 w-5 opacity-50" />
                            </div>
                            <div className="text-center">
                                <motion.div animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}>
                                    <weatherData.icon className="h-28 w-28 mx-auto mb-4 text-yellow-300 drop-shadow-[0_10px_30px_rgba(253,224,71,0.4)]" />
                                </motion.div>
                                <h2 className="text-[90px] font-black tracking-tighter leading-none mb-2 select-none">
                                    {weatherData.temp}<span className="text-5xl text-white/50">°</span>
                                </h2>
                                <p className="text-xl font-black tracking-tight">{weatherData.condition}</p>
                                <span className="text-xs font-bold text-white/40 uppercase tracking-[0.2em] mt-2 block">Feels like {weatherData.feelsLike}°</span>
                            </div>
                        </div>

                        <div className="relative z-10 grid grid-cols-2 gap-4 mt-8">
                            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/5">
                                <div className="flex items-center gap-2 mb-1.5 opacity-60">
                                    <Wind className="h-4 w-4" /><span className="text-[10px] font-black uppercase tracking-widest">Wind</span>
                                </div>
                                <span className="text-2xl font-black">{weatherData.wind}</span>
                                <span className="text-[10px] font-bold opacity-40 ml-1">km/h</span>
                            </div>
                            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/5">
                                <div className="flex items-center gap-2 mb-1.5 opacity-60">
                                    <Droplets className="h-4 w-4" /><span className="text-[10px] font-black uppercase tracking-widest">Humidity</span>
                                </div>
                                <span className="text-2xl font-black">{weatherData.humidity}</span>
                                <span className="text-[10px] font-bold opacity-40 ml-1">%</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right column */}
                    <div className="lg:col-span-8 flex flex-col gap-6">

                        {/* Metric cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: 'PRESSURE', value: weatherData.pressure, unit: 'hPa', icon: Waves,         color: 'text-blue-500',    bg: 'bg-blue-50'    },
                                { label: 'VISIBILITY', value: weatherData.visibility, unit: 'km', icon: Eye,         color: 'text-emerald-500', bg: 'bg-emerald-50' },
                                { label: 'RAIN', value: weatherData.precipitation, unit: 'mm', icon: Umbrella,      color: 'text-purple-500',  bg: 'bg-purple-50'  },
                                { label: 'FEELS LIKE', value: weatherData.feelsLike, unit: '°C', icon: ThermometerSun, color: 'text-orange-500', bg: 'bg-orange-50' },
                            ].map((m, i) => (
                                <motion.div key={i} whileHover={{ scale: 1.03 }}
                                    className="p-3.5 rounded-[14px] border bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 flex items-center gap-3 shadow-sm">
                                    <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', m.bg)}>
                                        <m.icon className={clsx('h-4 w-4', m.color)} />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-tight mb-0.5">{m.label}</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-[17px] font-black text-slate-800 dark:text-white leading-none">{m.value ?? '—'}</span>
                                            <span className="text-[11px] font-bold text-slate-400">{m.unit}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* 5-day forecast */}
                        {weeklyForecast.length > 0 && (
                            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                                <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-3 tracking-tight mb-6">
                                    <div className="p-1.5 bg-slate-900 rounded-lg text-white">
                                        <CalendarIcon className="h-4 w-4" />
                                    </div>
                                    5-Day Forecast
                                </h3>
                                <div className="space-y-2">
                                    {weeklyForecast.map((day, i) => (
                                        <motion.div key={i}
                                            initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.05 }}
                                            className={clsx('flex items-center justify-between p-4 rounded-2xl transition-all group',
                                                day.day === 'Today' ? 'bg-blue-50/50 dark:bg-blue-500/5 ring-1 ring-blue-500/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50')}
                                        >
                                            <div className="flex items-center gap-5 w-1/3">
                                                <div className={clsx('w-11 h-11 rounded-[14px] flex items-center justify-center transition-transform group-hover:rotate-[10deg]', day.bg)}>
                                                    <day.icon className={clsx('h-5 w-5', day.color)} />
                                                </div>
                                                <div>
                                                    <p className="text-[13px] font-black text-slate-800 dark:text-white tracking-tight">{day.day}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{day.date}</p>
                                                </div>
                                            </div>
                                            <span className="hidden md:block px-3 py-1 rounded-full text-[10px] font-black bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-500 uppercase tracking-widest shadow-sm">
                                                {day.condition}
                                            </span>
                                            <div className="flex items-center gap-4 w-[100px] justify-end">
                                                <span className="text-base font-black text-slate-800 dark:text-white tabular-nums">{day.high}°</span>
                                                <span className="text-xs font-bold text-slate-300 dark:text-slate-600 tabular-nums">{day.low}°</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* AI Advisory */}
            {weatherData && (
                <div className="mt-8 bg-amber-50 rounded-[2rem] p-8 border-l-[6px] border-amber-400 flex flex-col md:flex-row items-center md:items-start gap-6 shadow-xl shadow-amber-200/10 dark:bg-amber-950/20 dark:border-amber-900/50">
                    <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl text-amber-500 shadow-sm ring-1 ring-amber-100 dark:ring-amber-900/40 transform -rotate-6">
                        <Sun className="h-7 w-7" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h4 className="font-black text-amber-900 dark:text-amber-100 text-lg mb-2 uppercase tracking-tight">Smart Farming Advisory</h4>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                            <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-black rounded-lg uppercase tracking-wider border border-amber-200 dark:border-amber-800">
                                {weatherData.summary}
                            </span>
                        </div>
                        <p className="text-amber-800/80 leading-relaxed font-semibold dark:text-amber-200/80 max-w-4xl italic">
                            "{advisory}"
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

const CalendarIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
    </svg>
);

export default WeatherForecastTool;
