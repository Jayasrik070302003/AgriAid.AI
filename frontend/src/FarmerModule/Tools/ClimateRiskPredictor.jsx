import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CloudRain, ThermometerSun, Droplets, MapPin, AlertTriangle,
    Leaf, Info, RefreshCw, Zap, TrendingUp, Search, Microscope, ChevronDown
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import useGPS, { DISTRICT_COORDS } from '../../hooks/useGPS';
import { API_BASE_URL } from '../../config';

const apiClient = axios.create({ baseURL: `${API_BASE_URL}/api/farmer`, timeout: 60000 });

// ── Tamil Nadu state/district list for manual fallback ───────────────────────
const STATES_DISTRICTS = {
    'Tamil Nadu': Object.keys(DISTRICT_COORDS).filter(d => ![
        'Bengaluru','Mysuru','Hyderabad','Pune','Mumbai','Delhi','Kolkata','Ahmedabad','Jaipur','Lucknow'
    ].includes(d)),
    'Karnataka': ['Bengaluru', 'Mysuru'],
    'Telangana': ['Hyderabad'],
    'Maharashtra': ['Pune', 'Mumbai'],
    'Delhi': ['Delhi'],
    'West Bengal': ['Kolkata'],
    'Gujarat': ['Ahmedabad'],
    'Rajasthan': ['Jaipur'],
    'Uttar Pradesh': ['Lucknow'],
};

// ── Severity meter ───────────────────────────────────────────────────────────
const SeverityMeter = ({ title, severity, icon: Icon }) => {
    const map = {
        low:      { idx: 0, color: 'text-emerald-500', bg: 'bg-emerald-500', label: 'Low Risk' },
        moderate: { idx: 1, color: 'text-amber-500',   bg: 'bg-amber-500',   label: 'Moderate Risk' },
        high:     { idx: 2, color: 'text-orange-500',  bg: 'bg-orange-500',  label: 'High Risk' },
        critical: { idx: 3, color: 'text-rose-500',    bg: 'bg-rose-500',    label: 'Critical' },
    };
    const { idx, color, bg, label } = map[(severity || 'low').toLowerCase()] || map.low;

    return (
        <div className="bg-[#0A1525] border border-white/5 rounded-2xl p-4 flex flex-col gap-4 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-32 h-32 ${bg} opacity-[0.03] blur-3xl rounded-full group-hover:opacity-10 transition-opacity`} />
            <div className="flex items-center gap-2 z-10">
                <div className={`p-2 rounded-lg ${bg} bg-opacity-10 border border-white/5`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{title}</span>
            </div>
            <div className="z-10">
                <span className={`text-lg font-black ${color} tracking-tight`}>{label}</span>
                <div className="flex gap-1.5 mt-3">
                    {[0,1,2,3].map(i => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className={`h-1.5 flex-1 rounded-full ${
                                i === idx ? bg : i < idx ? `${bg} opacity-30` : 'bg-white/5'
                            }`}
                        />
                    ))}
                </div>
                <div className="flex justify-between text-[8px] text-slate-500 font-bold uppercase mt-2 px-0.5">
                    <span>Safe</span><span>Crit</span>
                </div>
            </div>
        </div>
    );
};

// ── Manual district/state selector ──────────────────────────────────────────
const ManualLocationPicker = ({ onSelect }) => {
    const [selState, setSelState]       = useState('Tamil Nadu');
    const [selDistrict, setSelDistrict] = useState('');

    const districts = STATES_DISTRICTS[selState] || [];

    return (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <p className="text-amber-300 text-xs font-bold">
                    Unable to access GPS location. Please select your district.
                </p>
            </div>

            {/* State */}
            <div className="relative">
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1 block">State</label>
                <div className="relative">
                    <select
                        value={selState}
                        onChange={e => { setSelState(e.target.value); setSelDistrict(''); }}
                        className="w-full bg-[#050B14] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white appearance-none focus:border-amber-500/50 outline-none"
                    >
                        {Object.keys(STATES_DISTRICTS).map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
            </div>

            {/* District */}
            <div className="relative">
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1 block">District</label>
                <div className="relative">
                    <select
                        value={selDistrict}
                        onChange={e => setSelDistrict(e.target.value)}
                        className="w-full bg-[#050B14] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white appearance-none focus:border-amber-500/50 outline-none"
                    >
                        <option value="">Select District</option>
                        {districts.map(d => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
            </div>

            <button
                type="button"
                disabled={!selDistrict}
                onClick={() => onSelect(selDistrict, selState)}
                className="w-full py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 font-bold text-sm transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            >
                <MapPin className="w-4 h-4" />
                Use {selDistrict || 'Selected'} Location
            </button>
        </div>
    );
};

// ── Main component ───────────────────────────────────────────────────────────
export default function ClimateRiskPredictor() {
    const [formData, setFormData] = useState({
        crop: '', state: '', district: '', temperature: '', humidity: '', rainfall: ''
    });
    const [isAnalyzing, setIsAnalyzing]         = useState(false);
    const [result, setResult]                   = useState(null);
    const [isFetchingWeather, setIsFetchingWeather] = useState(false);

    const {
        location, loading: gpsLoading, error: gpsError,
        needsManual, detect: detectGPS, selectDistrict
    } = useGPS();

    // Sync GPS/manual location into form + auto-fetch weather
    useEffect(() => {
        if (!location.lat || !location.lon) return;

        setFormData(prev => ({
            ...prev,
            state:    location.state    || prev.state,
            district: location.district || prev.district,
        }));

        fetchLiveWeather(location.lat, location.lon);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.lat, location.lon]);

    const fetchLiveWeather = async (lat, lon) => {
        setIsFetchingWeather(true);
        try {
            console.log('[Weather] Fetch by Coordinates', { lat, lon });
            const res = await apiClient.get(`/simulator/weather-live?lat=${lat}&lng=${lon}`);
            if (res.data.success) {
                const w = res.data.data;
                setFormData(prev => ({
                    ...prev,
                    temperature: w.temp,
                    humidity:    w.humidity,
                    rainfall:    w.precipitation || 0
                }));
                console.log('[Weather] Success');
                toast.success('Live weather applied!');
            }
        } catch {
            console.error('[Weather] Failed');
            toast.error('Could not fetch live weather. Enter manually.');
        } finally {
            setIsFetchingWeather(false);
        }
    };

    const handleAnalyze = async (e) => {
        e.preventDefault();
        if (!location.lat || !location.lon) {
            toast.error('Location required. Use GPS or select a district.');
            return;
        }
        setIsAnalyzing(true);
        setResult(null);
        try {
            const payload = {
                crop:     formData.crop,
                state:    formData.state,
                district: formData.district,
                lat:      location.lat,
                lon:      location.lon,
            };
            if (formData.temperature !== '') payload.temperature = parseFloat(formData.temperature);
            if (formData.humidity    !== '') payload.humidity    = parseFloat(formData.humidity);
            if (formData.rainfall    !== '') payload.rainfall    = parseFloat(formData.rainfall);

            const res = await apiClient.post('/simulator/climate-risk', payload);
            if (res.data.success) {
                setResult(res.data.data);
                toast.success(res.data.data.autoFetchedWeather
                    ? `Analysis complete — weather auto-fetched: ${res.data.data.weatherData.temperature}°C`
                    : 'AI Analysis Complete!');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to analyze. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050B14] p-4 lg:p-8 flex flex-col lg:flex-row gap-6 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-600/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

            {/* ── Left: Form ── */}
            <div className="w-full lg:w-[420px] flex-shrink-0 flex flex-col gap-5 z-10">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        Climate Risk <Zap className="w-6 h-6 text-teal-400" />
                    </h1>
                    <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                        AI crop risk analysis using live GPS + OpenWeatherMap data.
                    </p>
                </div>

                <form onSubmit={handleAnalyze} className="bg-[#080F1E] border border-white/5 rounded-3xl p-6 shadow-2xl flex flex-col gap-4">

                    {/* GPS Button */}
                    <button
                        type="button"
                        onClick={detectGPS}
                        disabled={gpsLoading || isFetchingWeather}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 text-teal-400 font-bold text-sm transition-all disabled:opacity-50"
                    >
                        {gpsLoading || isFetchingWeather
                            ? <RefreshCw className="w-4 h-4 animate-spin" />
                            : <MapPin className="w-4 h-4" />}
                        {gpsLoading ? 'Getting GPS...' : isFetchingWeather ? 'Fetching Weather...' : 'Auto-Detect Location & Weather'}
                    </button>

                    {/* Location status badge */}
                    {location.lat && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-teal-500/5 border border-teal-500/10 rounded-xl">
                            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse flex-shrink-0" />
                            <p className="text-teal-300 text-[11px] font-medium truncate">
                                {location.source === 'manual' ? '📍 Manual: ' : '🛰 GPS: '}
                                {location.district || location.city}{location.state ? `, ${location.state}` : ''}
                                <span className="text-teal-500/60 ml-1">({location.lat.toFixed(3)}, {location.lon.toFixed(3)})</span>
                            </p>
                        </div>
                    )}

                    {/* Manual fallback picker */}
                    {needsManual && (
                        <ManualLocationPicker onSelect={selectDistrict} />
                    )}

                    <div className="h-px w-full bg-white/5" />

                    {/* Crop */}
                    <div className="relative">
                        <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1 block">Crop Name</label>
                        <input
                            required
                            name="crop"
                            value={formData.crop}
                            onChange={e => setFormData(p => ({ ...p, crop: e.target.value }))}
                            placeholder="e.g. Paddy, Tomato"
                            className="w-full bg-[#050B14] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all outline-none"
                        />
                        <Leaf className="absolute right-4 bottom-3.5 w-4 h-4 text-slate-600" />
                    </div>

                    {/* State + District (auto-filled, still editable) */}
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1 block">State</label>
                            <input
                                required
                                name="state"
                                value={formData.state}
                                onChange={e => setFormData(p => ({ ...p, state: e.target.value }))}
                                placeholder="Auto-filled"
                                className="w-full bg-[#050B14] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-teal-500/50 transition-all outline-none"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1 block">District</label>
                            <input
                                required
                                name="district"
                                value={formData.district}
                                onChange={e => setFormData(p => ({ ...p, district: e.target.value }))}
                                placeholder="Auto-filled"
                                className="w-full bg-[#050B14] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-teal-500/50 transition-all outline-none"
                            />
                        </div>
                    </div>

                    {/* Weather fields (auto-filled, optional override) */}
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1 block">
                                Temp °C <span className="text-teal-400/40">(auto)</span>
                            </label>
                            <input
                                type="number" step="0.1" name="temperature"
                                value={formData.temperature}
                                onChange={e => setFormData(p => ({ ...p, temperature: e.target.value }))}
                                placeholder="Auto"
                                className="w-full bg-[#050B14] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-teal-500/50 transition-all outline-none"
                            />
                            <ThermometerSun className="absolute right-3 bottom-3.5 w-4 h-4 text-slate-600" />
                        </div>
                        <div className="flex-1 relative">
                            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1 block">
                                Humidity % <span className="text-teal-400/40">(auto)</span>
                            </label>
                            <input
                                type="number" step="1" name="humidity"
                                value={formData.humidity}
                                onChange={e => setFormData(p => ({ ...p, humidity: e.target.value }))}
                                placeholder="Auto"
                                className="w-full bg-[#050B14] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-teal-500/50 transition-all outline-none"
                            />
                            <Droplets className="absolute right-3 bottom-3.5 w-4 h-4 text-slate-600" />
                        </div>
                    </div>

                    <div className="relative">
                        <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1 block">
                            Rainfall mm/day <span className="text-teal-400/40">(auto)</span>
                        </label>
                        <input
                            type="number" step="0.1" name="rainfall"
                            value={formData.rainfall}
                            onChange={e => setFormData(p => ({ ...p, rainfall: e.target.value }))}
                            placeholder="Auto"
                            className="w-full bg-[#050B14] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-teal-500/50 transition-all outline-none"
                        />
                        <CloudRain className="absolute right-3 bottom-3.5 w-4 h-4 text-slate-600" />
                    </div>

                    <button
                        type="submit"
                        disabled={isAnalyzing || !location.lat}
                        className="relative w-full mt-2 overflow-hidden group rounded-2xl disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        <div className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
                            isAnalyzing
                                ? 'bg-gradient-to-r from-teal-700 to-blue-700'
                                : 'bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 group-hover:from-teal-400 group-hover:via-cyan-400 group-hover:to-blue-500'
                        }`} />
                        <div className="absolute inset-0 rounded-2xl shadow-[0_0_20px_rgba(20,184,166,0.35)] group-hover:shadow-[0_0_30px_rgba(6,182,212,0.55)] transition-shadow" />
                        <div className="relative z-10 flex items-center justify-center gap-3 py-4 text-white">
                            {isAnalyzing
                                ? <><RefreshCw className="w-5 h-5 animate-spin" /><span className="font-extrabold text-sm tracking-wide">Analyzing...</span></>
                                : <><Search className="w-5 h-5" /><span className="font-extrabold text-sm tracking-wide">Predict Risks</span></>
                            }
                        </div>
                    </button>

                    {!location.lat && !gpsLoading && !needsManual && (
                        <p className="text-center text-[11px] text-slate-600">
                            Tap "Auto-Detect" or wait — GPS starts automatically on page load.
                        </p>
                    )}
                </form>
            </div>

            {/* ── Right: Results ── */}
            <div className="flex-1 z-10 flex flex-col">
                <AnimatePresence mode="wait">
                    {!result && !isAnalyzing && (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl p-8 text-center min-h-[300px]"
                        >
                            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
                                <AlertTriangle className="w-10 h-10 text-slate-600" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Awaiting Parameters</h3>
                            <p className="text-slate-500 text-sm max-w-sm mb-6">
                                Auto-detect location or select district, then fill crop name to start.
                            </p>
                            <div className="flex gap-4 items-center justify-center text-[10px] uppercase font-bold text-slate-600 tracking-wider">
                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> GPS</span>
                                <span className="flex items-center gap-1"><CloudRain className="w-3 h-3" /> OpenWeatherMap</span>
                                <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> LLaMA-3</span>
                            </div>
                        </motion.div>
                    )}

                    {isAnalyzing && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex-1 flex flex-col items-center justify-center rounded-3xl bg-[#080F1E] border border-white/5 p-8 text-center"
                        >
                            <RefreshCw className="w-12 h-12 text-teal-500 animate-spin mb-6" />
                            <h3 className="text-lg font-bold text-white mb-2">AI analyzing climate data...</h3>
                            <p className="text-teal-400/60 text-sm">Running Groq LLaMA-3 engine</p>
                        </motion.div>
                    )}

                    {result && !isAnalyzing && (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col gap-6"
                        >
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <SeverityMeter title="Disease Risk"  severity={result.diseaseRisk}    icon={AlertTriangle}  />
                                <SeverityMeter title="Drought Risk"  severity={result.droughtRisk}    icon={ThermometerSun} />
                                <SeverityMeter title="Flood Risk"    severity={result.floodRisk}      icon={CloudRain}      />
                                <SeverityMeter title="Heat Stress"   severity={result.heatStressRisk} icon={Zap}            />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-[#080F1E] border border-white/5 rounded-3xl p-6 flex flex-col shadow-lg relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-indigo-500/50 to-transparent" />
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                                            <Microscope className="w-5 h-5 text-indigo-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold text-base">Scientific Analysis</h3>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">LLaMA-3 Engine</p>
                                        </div>
                                    </div>
                                    <p className="text-slate-300 text-[13px] leading-relaxed whitespace-pre-wrap bg-white/[0.02] p-4 rounded-xl border border-white/5 font-medium">
                                        {result.scientificAnalysis}
                                    </p>
                                </div>

                                <div className="bg-[#080F1E] border border-white/5 rounded-3xl p-6 flex flex-col shadow-lg relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-emerald-500/50 to-transparent" />
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold text-base">Actionable Precautions</h3>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Crop-Specific</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        {result.actionablePrecautions?.map((rec, i) => (
                                            <div key={i} className="flex gap-4 items-start bg-white/[0.02] p-4 rounded-xl border border-white/5">
                                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs mt-0.5">
                                                    {i + 1}
                                                </div>
                                                <p className="text-slate-300 text-[13px] font-medium leading-snug">{rec}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Weather used badge */}
                            <div className="flex items-center justify-center gap-3 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                                <Info className="w-3 h-3" />
                                Weather: {result.weatherData.temperature}°C · {result.weatherData.humidity}% humidity · {result.weatherData.rainfall}mm rain
                                {result.autoFetchedWeather && <span className="text-teal-600">(auto-fetched via coords)</span>}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
