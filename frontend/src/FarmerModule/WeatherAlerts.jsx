import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CloudRain, Wind, ThermometerSun, AlertTriangle, Droplets,
    MapPin, RefreshCw, Zap, Clock, CheckCircle2, ChevronDown, Navigation
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import useGPS from '../hooks/useGPS';
import { STATES_DISTRICTS } from '../services/locationService';
import apiClient from '../services/apiClient';

// ── Manual district/state picker ─────────────────────────────────────────────
const ManualPicker = ({ onSelect }) => {
    const [selState, setSelState]       = useState('Tamil Nadu');
    const [selDistrict, setSelDistrict] = useState('');
    const districts = STATES_DISTRICTS[selState] || [];

    return (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-4 flex flex-col gap-3 mb-4">
            <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                <p className="text-amber-700 dark:text-amber-300 text-xs font-semibold">
                    GPS unavailable. Select your district to continue.
                </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">State</label>
                    <select
                        value={selState}
                        onChange={e => { setSelState(e.target.value); setSelDistrict(''); }}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                    >
                        {Object.keys(STATES_DISTRICTS).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-[30px] h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                </div>
                <div className="relative">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">District</label>
                    <select
                        value={selDistrict}
                        onChange={e => setSelDistrict(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                    >
                        <option value="">Select district</option>
                        {districts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-[30px] h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                </div>
            </div>
            <button
                disabled={!selDistrict}
                onClick={() => onSelect(selDistrict, selState)}
                className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
            >
                <MapPin className="h-4 w-4" />
                Use {selDistrict || 'Selected'} Location
            </button>
        </div>
    );
};

// ── Google Maps preview card ──────────────────────────────────────────────────
const MapPreview = ({ lat, lon, source }) => {
    const src = `https://maps.google.com/maps?q=${lat},${lon}&z=15&output=embed`;
    console.log('[MAP] Google Maps Loaded', { lat, lon });
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-xl overflow-hidden border border-emerald-200 dark:border-emerald-900/40 shadow-sm"
        >
            <div className="bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                        Location Detected Successfully
                    </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                    {source === 'manual' ? 'Manual' : 'GPS'}
                </span>
            </div>
            <div className="px-4 py-2 bg-white dark:bg-slate-800 flex items-center gap-6 text-sm text-slate-600 dark:text-slate-300 border-b border-gray-100 dark:border-slate-700">
                <span className="flex items-center gap-1.5">
                    <Navigation className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="font-medium">Latitude:</span> {lat.toFixed(4)}
                </span>
                <span className="flex items-center gap-1.5">
                    <Navigation className="h-3.5 w-3.5 text-blue-500" />
                    <span className="font-medium">Longitude:</span> {lon.toFixed(4)}
                </span>
            </div>
            <iframe
                title="Farm Location"
                width="100%"
                height="280"
                src={src}
                style={{ border: 0, display: 'block' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
            />
        </motion.div>
    );
};

// ── Alert generator ───────────────────────────────────────────────────────────
function generateAlerts(weather) {
    const alerts = [];
    if (weather.temp > 35)
        alerts.push({ id: 'heat', type: 'critical', title: 'Heat Wave Alert', description: `High temperature of ${weather.temp}°C. Increase irrigation and provide shade for sensitive crops.`, icon: ThermometerSun, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-900/30' });
    else if (weather.temp < 10)
        alerts.push({ id: 'cold', type: 'warning', title: 'Cold Temperature Alert', description: `Low temperature of ${weather.temp}°C. Protect frost-sensitive crops.`, icon: ThermometerSun, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-900/30' });
    if (weather.wind > 30)
        alerts.push({ id: 'wind', type: 'warning', title: 'High Wind Warning', description: `Strong winds at ${weather.wind} km/h. Secure equipment and support young plants.`, icon: Wind, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-900/30' });
    if (weather.humidity > 85)
        alerts.push({ id: 'humidity', type: 'caution', title: 'High Humidity Alert', description: `Humidity at ${weather.humidity}%. Increased risk of fungal diseases. Monitor crops closely.`, icon: Droplets, color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-900/20', border: 'border-teal-200 dark:border-teal-900/30' });
    if (weather.precipitation > 20)
        alerts.push({ id: 'rain', type: 'warning', title: 'Heavy Rainfall', description: `${weather.precipitation}mm rainfall. Ensure proper drainage to prevent waterlogging.`, icon: CloudRain, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-900/30' });
    if (alerts.length === 0)
        alerts.push({ id: 'safe', type: 'info', title: 'Favorable Conditions', description: 'Weather conditions are currently favorable for farming. No active alerts.', icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-900/30' });
    return alerts;
}

// ── Main component ────────────────────────────────────────────────────────────
const WeatherAlerts = () => {
    const [alerts, setAlerts]         = useState([]);
    const [weatherLoading, setWeatherLoading] = useState(false);
    const [weatherData, setWeatherData]   = useState(null);

    const { location, loading: gpsLoading, error: gpsError, needsManual, detect, selectDistrict } = useGPS();

    // Auto-fetch weather whenever coords become available
    useEffect(() => {
        if (location.lat && location.lon) {
            fetchWeather(location.lat, location.lon);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.lat, location.lon]);

    const fetchWeather = async (lat, lon) => {
        setWeatherLoading(true);
        console.log('[WEATHER] Fetch Started', { lat, lon });
        try {
            const res = await apiClient.get(`/weather/by-coords?lat=${lat}&lon=${lon}`);
            if (res.data.success) {
                const w = res.data.data;
                console.log('[WEATHER] Success', { temp: w.temp, condition: w.condition });
                setWeatherData(w);
                setAlerts(generateAlerts(w));
                toast.success('Weather data updated!');
            }
        } catch {
            console.error('[WEATHER] Failed');
            toast.error('Failed to fetch weather data');
        } finally {
            setWeatherLoading(false);
        }
    };

    const isLoading = gpsLoading || weatherLoading;

    return (
        <div className="max-w-4xl mx-auto px-4 py-4">
            {/* Header */}
            <div className="mb-5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2 dark:text-white">
                        Weather Alerts <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-farm-green shrink-0" />
                    </h1>
                    <p className="text-gray-500 text-[11px] mt-0.5 dark:text-slate-400">Real-time GPS-based weather warnings</p>
                </div>
                <button
                    onClick={detect}
                    disabled={isLoading}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 bg-farm-green text-white rounded-lg text-xs font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-sm shrink-0"
                >
                    {isLoading
                        ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        : <MapPin className="h-3.5 w-3.5" />}
                    {isLoading ? 'Loading...' : 'Use My Location'}
                </button>
            </div>

            {/* GPS error message */}
            {gpsError && !needsManual && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-300 text-sm font-medium">
                    {gpsError}
                </div>
            )}

            {/* Manual fallback picker */}
            {needsManual && <ManualPicker onSelect={selectDistrict} />}

            {/* Google Maps preview */}
            {location.lat && location.lon && (
                <MapPreview lat={location.lat} lon={location.lon} source={location.source} />
            )}

            {/* Weather summary card */}
            {weatherData && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-4 rounded-xl bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-800 dark:to-slate-800/50 border border-gray-200 dark:border-slate-700 shadow-sm"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Current Weather</p>
                            <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mt-0.5 flex items-center gap-1.5">
                                <MapPin className="h-3 w-3" />
                                {weatherData.locationName || `${location.lat.toFixed(3)}, ${location.lon.toFixed(3)}`}
                            </p>
                        </div>
                        <div className="flex items-center gap-4 text-[11px] font-semibold">
                            <div className="text-center">
                                <ThermometerSun className="h-4 w-4 text-orange-500 mx-auto mb-1" />
                                <span className="text-gray-700 dark:text-slate-300">{weatherData.temp}°C</span>
                            </div>
                            <div className="text-center">
                                <Droplets className="h-4 w-4 text-blue-500 mx-auto mb-1" />
                                <span className="text-gray-700 dark:text-slate-300">{weatherData.humidity}%</span>
                            </div>
                            <div className="text-center">
                                <Wind className="h-4 w-4 text-teal-500 mx-auto mb-1" />
                                <span className="text-gray-700 dark:text-slate-300">{weatherData.wind}km/h</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Alerts list */}
            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center py-12">
                        <RefreshCw className="h-8 w-8 text-farm-green animate-spin" />
                    </motion.div>
                ) : alerts.length > 0 ? (
                    <motion.div key="alerts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                        {alerts.map(alert => {
                            const Icon = alert.icon;
                            return (
                                <motion.div
                                    key={alert.id}
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className={`flex flex-col md:flex-row items-start md:items-center gap-3 p-4 rounded-xl border ${alert.border} ${alert.bg} shadow-sm`}
                                >
                                    <div className={`p-2 rounded-lg bg-white shadow-sm ${alert.color} dark:bg-slate-800/50`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={`text-sm font-bold ${alert.color} mb-0.5`}>{alert.title}</h3>
                                        <p className="text-gray-700 text-[12px] font-medium leading-relaxed dark:text-slate-300">{alert.description}</p>
                                    </div>
                                    <div className="md:border-l md:border-gray-200/50 md:pl-4 pt-2 md:pt-0 dark:border-slate-600/50">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/60 text-gray-500 shadow-sm border border-white/50 dark:bg-slate-800/60 dark:text-slate-400">
                                            <Clock className="h-3 w-3" /> Active
                                        </span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                ) : (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 text-gray-500 dark:text-slate-400">
                        <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm font-medium">Click "Use My Location" to fetch weather alerts</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WeatherAlerts;
