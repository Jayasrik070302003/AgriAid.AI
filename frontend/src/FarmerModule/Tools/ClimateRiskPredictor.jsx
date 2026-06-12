import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudRain, ThermometerSun, Droplets, MapPin, AlertTriangle, Leaf, Info, RefreshCw, Zap, TrendingUp, Search, Microscope } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import useGPS from '../../hooks/useGPS';
import { API_BASE_URL } from '../../config';

const apiClient = axios.create({ baseURL: `${API_BASE_URL}/api/farmer`, timeout: 60000 });

// ─── Reusable Severity Meter ──────────────────────────────────────────────────
const SeverityMeter = ({ title, severity, icon: Icon }) => {
    const getLevels = () => {
        const s = severity || 'Low';
        switch (s.toLowerCase()) {
            case 'low': return { activeIdx: 0, color: 'text-emerald-500', bg: 'bg-emerald-500', label: 'Low Risk' };
            case 'moderate': return { activeIdx: 1, color: 'text-amber-500', bg: 'bg-amber-500', label: 'Moderate Risk' };
            case 'high': return { activeIdx: 2, color: 'text-orange-500', bg: 'bg-orange-500', label: 'High Risk' };
            case 'critical': return { activeIdx: 3, color: 'text-rose-500', bg: 'bg-rose-500', label: 'Critical' };
            default: return { activeIdx: 0, color: 'text-emerald-500', bg: 'bg-emerald-500', label: 'Low Risk' };
        }
    };
    
    const { activeIdx, color, bg, label } = getLevels();

    return (
        <div className="bg-[#0A1525] border border-white/5 rounded-2xl p-4 flex flex-col gap-4 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-32 h-32 ${bg} opacity-[0.03] blur-3xl rounded-full group-hover:opacity-10 transition-opacity`} />
            
            <div className="flex justify-between items-start z-10">
                <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${bg} bg-opacity-10 border border-white/5`}>
                        <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{title}</span>
                </div>
            </div>
            
            <div className="z-10 mt-1">
                <span className={`text-lg font-black ${color} tracking-tight`}>{label}</span>
                
                {/* Segmented Meter */}
                <div className="flex gap-1.5 mt-3">
                    {[0, 1, 2, 3].map((idx) => {
                        const isActive = idx === activeIdx;
                        const isPast = idx < activeIdx;
                        const blockBg = isActive ? bg : isPast ? `${bg} opacity-30` : 'bg-white/5';
                        const shadow = isActive ? `shadow-[0_0_10px_rgba(255,255,255,0.1)]` : '';
                        
                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className={`h-1.5 flex-1 rounded-full ${blockBg} ${shadow}`}
                            />
                        );
                    })}
                </div>
                <div className="flex justify-between text-[8px] text-slate-500 font-bold uppercase mt-2 px-0.5">
                    <span>Safe</span>
                    <span>Crit</span>
                </div>
            </div>
        </div>
    );
};

export default function ClimateRiskPredictor() {
    // State
    const [formData, setFormData] = useState({
        crop: '', state: '', district: '', temperature: '', humidity: '', rainfall: ''
    });
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [isFetchingWeather, setIsFetchingWeather] = useState(false);

    // GPS Hook
    const { location, loading: gpsLoading, error: gpsError, detect: detectGPS } = useGPS();

    // Update form when GPS completes
    useEffect(() => {
        if (location.lat && location.district && location.state) {
            setFormData(prev => ({
                ...prev,
                state: location.state,
                district: location.district
            }));
            fetchLiveWeather(location.lat, location.lng);
        }
        if (gpsError) {
            toast.error(gpsError);
        }
    }, [location, gpsError]);

    // Handle inputs
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Fetch live weather from backend
    const fetchLiveWeather = async (lat, lng) => {
        setIsFetchingWeather(true);
        try {
            const res = await apiClient.get(`/simulator/weather-live?lat=${lat}&lng=${lng}`);
            if (res.data.success && res.data.data) {
                const weather = res.data.data;
                setFormData(prev => ({
                    ...prev,
                    temperature: weather.temp,
                    humidity: weather.humidity,
                    rainfall: weather.precipitation || 0
                }));
                toast.success('Live weather applied automatically!');
            }
        } catch (error) {
            toast.error('Failed to fetch live weather. Please enter manually.');
        } finally {
            setIsFetchingWeather(false);
        }
    };

    const handleAutoDetect = () => {
        detectGPS();
    };

    // Submit for AI Analysis
    const handleAnalyze = async (e) => {
        e.preventDefault();
        setIsAnalyzing(true);
        setResult(null);
        try {
            // Clean payload - don't send empty strings
            const payload = {
                crop: formData.crop,
                state: formData.state,
                district: formData.district
            };
            
            // Only include weather fields if they have values
            if (formData.temperature !== '' && formData.temperature !== null) {
                payload.temperature = parseFloat(formData.temperature);
            }
            if (formData.humidity !== '' && formData.humidity !== null) {
                payload.humidity = parseFloat(formData.humidity);
            }
            if (formData.rainfall !== '' && formData.rainfall !== null) {
                payload.rainfall = parseFloat(formData.rainfall);
            }

            const res = await apiClient.post('/simulator/climate-risk', payload);
            if (res.data.success) {
                setResult(res.data.data);
                if (res.data.data.autoFetchedWeather) {
                    toast.success(`AI Analysis Complete! Weather auto-fetched: ${res.data.data.weatherData.temperature}°C`);
                } else {
                    toast.success('AI Analysis Complete!');
                }
            }
        } catch (error) {
            console.error('[Climate Risk Error]', error.response?.data);
            toast.error(error.response?.data?.message || 'Failed to analyze climate risk. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050B14] p-4 lg:p-8 flex flex-col lg:flex-row gap-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-600/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

            {/* ── Left Column: Form ── */}
            <div className="w-full lg:w-[400px] flex-shrink-0 flex flex-col gap-6 z-10">
                {/* Header */}
                <div>
                    <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        Climate Risk <Zap className="w-6 h-6 text-teal-400" />
                    </h1>
                    <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                        Predict drought, flood, and disease risks for your crops using live weather data and AI.
                    </p>
                </div>

                <form onSubmit={handleAnalyze} className="bg-[#080F1E] border border-white/5 rounded-3xl p-6 shadow-2xl flex flex-col gap-5">
                    
                    {/* Auto Detect Button */}
                    <button
                        type="button"
                        onClick={handleAutoDetect}
                        disabled={gpsLoading || isFetchingWeather}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 text-teal-400 font-bold text-sm transition-all disabled:opacity-50"
                    >
                        {gpsLoading || isFetchingWeather ? <RefreshCw className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                        {gpsLoading ? 'Locating...' : isFetchingWeather ? 'Fetching Weather...' : 'Auto-Detect Location & Weather'}
                    </button>

                    <div className="h-px w-full bg-white/5" />

                    <div className="bg-teal-500/5 border border-teal-500/10 rounded-xl p-3 flex items-start gap-2">
                        <Info className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                        <p className="text-teal-300/80 text-[11px] leading-relaxed">
                            Weather fields are <span className="font-bold text-teal-400">optional</span>. If left empty, system will auto-fetch live data from Open-Meteo based on your location.
                        </p>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-4">
                        <div className="relative">
                            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1 block">Crop Name</label>
                            <input
                                required
                                name="crop"
                                value={formData.crop}
                                onChange={handleChange}
                                placeholder="e.g. Paddy, Tomato"
                                className="w-full bg-[#050B14] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all outline-none"
                            />
                            <Leaf className="absolute right-4 bottom-3.5 w-4 h-4 text-slate-600" />
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1 block">State</label>
                                <input
                                    required
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    className="w-full bg-[#050B14] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-teal-500/50 transition-all outline-none"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1 block">District</label>
                                <input
                                    required
                                    name="district"
                                    value={formData.district}
                                    onChange={handleChange}
                                    className="w-full bg-[#050B14] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-teal-500/50 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1 relative">
                                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1 block">
                                    Temp (°C) <span className="text-teal-400/50 text-[8px]">(Optional - Auto)</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    name="temperature"
                                    value={formData.temperature}
                                    onChange={handleChange}
                                    placeholder="Auto-fill"
                                    className="w-full bg-[#050B14] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-teal-500/50 transition-all outline-none"
                                />
                                <ThermometerSun className="absolute right-3 bottom-3.5 w-4 h-4 text-slate-600" />
                            </div>
                            <div className="flex-1 relative">
                                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1 block">
                                    Humidity (%) <span className="text-teal-400/50 text-[8px]">(Optional - Auto)</span>
                                </label>
                                <input
                                    type="number"
                                    step="1"
                                    name="humidity"
                                    value={formData.humidity}
                                    onChange={handleChange}
                                    placeholder="Auto-fill"
                                    className="w-full bg-[#050B14] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-teal-500/50 transition-all outline-none"
                                />
                                <Droplets className="absolute right-3 bottom-3.5 w-4 h-4 text-slate-600" />
                            </div>
                        </div>
                        
                        <div className="relative">
                            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1 block">
                                Rainfall (mm/day) <span className="text-teal-400/50 text-[8px]">(Optional - Auto)</span>
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                name="rainfall"
                                value={formData.rainfall}
                                onChange={handleChange}
                                placeholder="Auto-fill"
                                className="w-full bg-[#050B14] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-teal-500/50 transition-all outline-none"
                            />
                            <CloudRain className="absolute right-3 bottom-3.5 w-4 h-4 text-slate-600" />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isAnalyzing}
                        className="w-full py-4 mt-2 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 text-white font-black uppercase tracking-widest text-xs hover:shadow-lg hover:shadow-teal-500/25 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                        {isAnalyzing ? (
                            <><RefreshCw className="w-4 h-4 animate-spin" /> Analyzing Risks...</>
                        ) : (
                            <><Search className="w-4 h-4" /> Predict Risks</>
                        )}
                    </button>
                </form>
            </div>

            {/* ── Right Column: Results ── */}
            <div className="flex-1 z-10 flex flex-col">
                <AnimatePresence mode="wait">
                    {!result && !isAnalyzing ? (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl p-8 text-center"
                        >
                            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
                                <AlertTriangle className="w-10 h-10 text-slate-600" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Awaiting Parameters</h3>
                            <p className="text-slate-500 text-sm max-w-sm mb-6">Enter your crop and location details, or use auto-detect to fetch live Open-Meteo weather data for AI risk prediction.</p>
                            <div className="flex gap-4 items-center justify-center text-[10px] uppercase font-bold text-slate-600 tracking-wider">
                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> GPS Auth</span>
                                <span className="flex items-center gap-1"><CloudRain className="w-3 h-3" /> Open-Meteo</span>
                                <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> LLaMA-3 Engine</span>
                            </div>
                        </motion.div>
                    ) : isAnalyzing ? (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex-1 flex flex-col items-center justify-center rounded-3xl bg-[#080F1E] border border-white/5 p-8 text-center"
                        >
                            <RefreshCw className="w-12 h-12 text-teal-500 animate-spin mb-6" />
                            <h3 className="text-lg font-bold text-white mb-2">AI is analyzing climate data...</h3>
                            <p className="text-teal-400/60 text-sm">Running Groq intelligence models</p>
                        </motion.div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col gap-6"
                        >
                            {/* Top Stats - Severity Meters */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <SeverityMeter title="Disease Risk" severity={result.diseaseRisk} icon={AlertTriangle} />
                                <SeverityMeter title="Drought Risk" severity={result.droughtRisk} icon={ThermometerSun} />
                                <SeverityMeter title="Flood Risk" severity={result.floodRisk} icon={CloudRain} />
                                <SeverityMeter title="Heat Stress" severity={result.heatStressRisk} icon={Zap} />
                            </div>

                            {/* Detailed Analysis */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
                                {/* Scientific Analysis */}
                                <div className="bg-[#080F1E] border border-white/5 rounded-3xl p-6 flex flex-col h-full shadow-lg relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-indigo-500/50 to-transparent" />
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                                                <Microscope className="w-5 h-5 text-indigo-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-white font-bold text-base">Scientific Analysis</h3>
                                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Generated by LLaMA-3</p>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-slate-300 text-[13px] leading-relaxed whitespace-pre-wrap flex-1 bg-white/[0.02] p-4 rounded-xl border border-white/5 font-medium">
                                        {result.scientificAnalysis || result.aiExplanation}
                                    </p>
                                </div>

                                {/* Actionable Precautions */}
                                <div className="bg-[#080F1E] border border-white/5 rounded-3xl p-6 flex flex-col h-full shadow-lg relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-emerald-500/50 to-transparent" />
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold text-base">Actionable Precautions</h3>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Crop-Specific Directives</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        {(result.actionablePrecautions || result.recommendations)?.map((rec, i) => (
                                            <div key={i} className="flex gap-4 items-start bg-white/[0.02] p-4 rounded-xl border border-white/5 hover:bg-white/[0.04] transition-colors">
                                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs mt-0.5">
                                                    {i + 1}
                                                </div>
                                                <p className="text-slate-300 text-[13px] font-medium leading-snug">{rec}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex justify-center mt-2">
                                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest flex items-center gap-2">
                                    <Info className="w-3 h-3" /> Analysis powered by real-time Open-Meteo telemetry and AgriAid AI Models
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
