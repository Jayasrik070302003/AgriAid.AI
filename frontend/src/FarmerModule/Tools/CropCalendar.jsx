import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Calendar, CheckCircle2, ChevronRight, Droplets, Thermometer, Leaf, Zap, AlertTriangle, TrendingUp, DollarSign, Sprout, CloudRain, Wind, Droplets as WaterDrop, Bug } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import useGPS from '../../hooks/useGPS';
import { useLanguage } from '../../Context/LanguageContext';

import { API_BASE_URL as BASE_URL } from '../../config';
const apiClient = axios.create({ baseURL: `${BASE_URL}/api/farmer`, timeout: 60000 });

// Hook to debounce search
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

export default function CropCalendar() {
    const { t, language } = useLanguage();
    const { location, detect, loading: gpsLoading } = useGPS();

    // Form states
    const [cropInput, setCropInput] = useState('');
    const [selectedCrop, setSelectedCrop] = useState('');
    const debouncedCropQuery = useDebounce(cropInput, 800);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isAutocompleteLoading, setIsAutocompleteLoading] = useState(false);

    const [sowingDate, setSowingDate] = useState(new Date().toISOString().split('T')[0]);
    const [formData, setFormData] = useState({ state: '', district: '' });
    
    // Core states
    const [isGenerating, setIsGenerating] = useState(false);
    const [calendarData, setCalendarData] = useState(null);

    // AI Autocomplete effect
    useEffect(() => {
        const fetchAutocomplete = async () => {
            if (!debouncedCropQuery || debouncedCropQuery.length < 2 || debouncedCropQuery === selectedCrop) {
                setSuggestions([]);
                return;
            }
            setIsAutocompleteLoading(true);
            try {
                const res = await apiClient.post('/autocomplete-crop', { 
                    query: debouncedCropQuery,
                    language: language === 'TA' ? 'Tamil' : language === 'HI' ? 'Hindi' : 'English'
                });
                if (res.data.success && res.data.suggestions) {
                    setSuggestions(res.data.suggestions);
                    setShowSuggestions(true);
                }
            } catch (err) {
                console.error("Autocomplete error", err);
            } finally {
                setIsAutocompleteLoading(false);
            }
        };
        fetchAutocomplete();
    }, [debouncedCropQuery, language, selectedCrop]);

    // Auto-Location on load
    useEffect(() => {
        // Automatically attempt to find location on mount
        detect();
    }, []); // eslint-disable-line

    // Sync GPS to form
    useEffect(() => {
        if (location.state && location.district) {
            setFormData({ state: location.state, district: location.district });
        }
    }, [location]);

    const handleSelectCrop = (cropName) => {
        setCropInput(cropName);
        setSelectedCrop(cropName);
        setShowSuggestions(false);
    };

    const handleGenerate = async () => {
        if (!selectedCrop && !cropInput) {
            toast.error(t('cal_step1_desc') || "Please select or type a crop");
            return;
        }
        if (!sowingDate || !formData.state) {
            toast.error(t('cal_step1_desc') || "Please fill all required fields");
            return;
        }

        const finalCrop = selectedCrop || cropInput;
        setIsGenerating(true);
        setCalendarData(null);
        try {
            const payload = {
                crop: finalCrop,
                sowing_date: sowingDate,
                state: formData.state,
                district: formData.district,
                latitude: location.lat,
                longitude: location.lng,
                language: language === 'TA' ? 'Tamil' : language === 'HI' ? 'Hindi' : 'English'
            };

            const response = await apiClient.post('/crop-schedule', payload);
            
            if (response.data.success) {
                setCalendarData(response.data.data);
                toast.success(t('cal_generating') ? "Success" : "Calendar Generated Successfully!");
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate calendar. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const getRiskColor = (risk) => {
        const r = risk?.toLowerCase() || '';
        if (r.includes('high') || r.includes('hard')) return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
        if (r.includes('medium') || r.includes('moderate')) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
        return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    };

    return (
        <div className="min-h-screen dark:bg-[#050B14] bg-slate-50 py-6 px-4 sm:px-6 font-sans pb-24 sm:pb-6">
            <div className="max-w-[1600px] mx-auto space-y-4">
                {/* Header — left-aligned title, right-aligned subtitle */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 pb-3 border-b border-white/5 dark:border-white/5 border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-xl">
                            <Calendar className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-lg font-black dark:text-white text-slate-900 tracking-tight leading-none">
                                    {t('cal_title') || 'Crop Calendar'}
                                </h1>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-bold uppercase tracking-widest">
                                    <Zap className="w-2.5 h-2.5" />
                                    {t('cal_badge') || 'AI'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <p className="text-xs dark:text-slate-400 text-slate-500 max-w-sm text-right hidden sm:block">
                        {t('cal_subtitle') || 'AI-powered lifecycle planner with real-time weather, soil & market intelligence.'}
                    </p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr] gap-4">
                    {/* Left Pane: Configuration */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="dark:bg-[#0A1525] bg-white border dark:border-white/5 border-slate-200 rounded-2xl p-4 flex flex-col gap-3 xl:sticky xl:top-20 h-fit shadow-lg"
                    >
                        <h2 className="text-sm font-bold dark:text-white text-slate-800 flex items-center gap-1.5">
                            <Leaf className="w-3.5 h-3.5 text-emerald-500" />
                            {t('timeline_parameters') || 'Cultivation Details'}
                        </h2>

                        {/* AI Autocomplete Input */}
                        <div className="space-y-1 relative">
                            <label className="text-[10px] font-bold dark:text-slate-400 text-slate-500 uppercase tracking-wider">{t('cal_search_label') || 'Search Crop'}</label>
                            <div className="relative">
                                {isAutocompleteLoading ? (
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-slate-300/30 border-t-indigo-500 rounded-full animate-spin" />
                                ) : (
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 dark:text-slate-500 text-slate-400" />
                                )}
                                <input
                                    type="text"
                                    value={cropInput}
                                    onChange={(e) => { setCropInput(e.target.value); setSelectedCrop(''); }}
                                    onFocus={() => { if(suggestions.length) setShowSuggestions(true); }}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                    placeholder={t('cal_search_placeholder') || 'e.g. Groundnut, thakali...'}
                                    className="w-full dark:bg-black/40 bg-slate-50 dark:border-white/10 border-slate-200 border rounded-lg py-2.5 pl-9 pr-3 dark:text-white text-slate-900 focus:outline-none focus:border-indigo-500 transition-colors dark:placeholder:text-slate-600 placeholder:text-slate-400 text-xs"
                                />
                            </div>
                            <AnimatePresence>
                                {showSuggestions && suggestions.length > 0 && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                                        className="absolute top-full left-0 right-0 mt-1 dark:bg-[#0A1525] bg-white dark:border-indigo-500/30 border-indigo-300 border rounded-lg overflow-hidden shadow-xl z-50"
                                    >
                                        <div className="text-[9px] uppercase font-bold text-indigo-400 px-3 py-1.5 bg-indigo-500/10">AI Suggestions</div>
                                        {suggestions.map((sug, idx) => (
                                            <button 
                                                key={idx}
                                                onClick={() => handleSelectCrop(sug)}
                                                className="w-full text-left px-3 py-2 dark:text-white text-slate-700 text-xs hover:bg-indigo-500/10 transition-colors flex items-center justify-between"
                                            >
                                                <span>{sug}</span>
                                                <Zap className="w-2.5 h-2.5 text-indigo-500" />
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Date Input */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold dark:text-slate-400 text-slate-500 uppercase tracking-wider">{t('cal_date_label') || 'Sowing Date'}</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 dark:text-slate-500 text-slate-400" />
                                <input
                                    type="date"
                                    value={sowingDate}
                                    onChange={(e) => setSowingDate(e.target.value)}
                                    className="w-full dark:bg-black/40 bg-slate-50 dark:border-white/10 border-slate-200 border rounded-lg py-2.5 pl-9 pr-3 dark:text-white text-slate-900 focus:outline-none focus:border-indigo-500 transition-colors dark:[color-scheme:dark] text-xs"
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold dark:text-slate-400 text-slate-500 uppercase tracking-wider">{t('cal_location_label') || 'Location'}</label>
                                <div className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                                    <MapPin className="w-2.5 h-2.5" />
                                    {gpsLoading ? 'Detecting...' : 'Auto-Detected'}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="text"
                                    value={formData.state}
                                    readOnly
                                    placeholder={t('cal_state_placeholder') || 'State'}
                                    className="w-full dark:bg-black/20 bg-slate-100 dark:border-white/5 border-slate-200 border rounded-lg py-2 px-3 dark:text-slate-300 text-slate-600 text-xs focus:outline-none cursor-not-allowed"
                                />
                                <input
                                    type="text"
                                    value={formData.district}
                                    readOnly
                                    placeholder={t('cal_district_placeholder') || 'District'}
                                    className="w-full dark:bg-black/20 bg-slate-100 dark:border-white/5 border-slate-200 border rounded-lg py-2 px-3 dark:text-slate-300 text-slate-600 text-xs focus:outline-none cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || (!selectedCrop && !cropInput) || !formData.state}
                            className="w-full mt-1 bg-indigo-600 hover:bg-indigo-500 disabled:dark:bg-slate-800 disabled:bg-slate-200 disabled:dark:text-slate-500 disabled:text-slate-400 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-1.5 text-xs transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] disabled:shadow-none"
                        >
                            {isGenerating ? (
                                <>
                                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    {t('cal_generating') || 'Analyzing...'}
                                </>
                            ) : (
                                <>
                                    <Zap className="w-3.5 h-3.5" />
                                    {t('cal_generate_btn') || 'Generate AI Calendar'}
                                </>
                            )}
                        </button>
                    </motion.div>

                    {/* Right Pane: Results Timeline */}
                    <div className="flex-1">
                        <AnimatePresence mode="wait">
                            {!calendarData && !isGenerating && (
                                <motion.div 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="h-full flex flex-col items-center justify-center min-h-[380px] dark:border-white/5 border-slate-200 border rounded-2xl p-6 text-center dark:bg-gradient-to-b dark:from-[#0A1525] dark:to-[#050B14] bg-slate-50"
                                >
                                    <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mb-3">
                                        <Sprout className="w-7 h-7 text-indigo-400" />
                                    </div>
                                    <h3 className="text-base font-black dark:text-white text-slate-800 mb-1.5">{t('cal_empty_title') || 'Ready to Plan Your Season'}</h3>
                                    <p className="dark:text-slate-400 text-slate-500 text-xs max-w-sm leading-relaxed">
                                        Enter any crop name in your local language. Our AI will identify the species, fetch live weather data, and generate a dynamic lifecycle plan.
                                    </p>
                                </motion.div>
                            )}

                            {isGenerating && (
                                <motion.div 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="h-full flex flex-col items-center justify-center min-h-[380px]"
                                >
                                    <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
                                    <p className="text-indigo-400 font-bold animate-pulse tracking-widest uppercase text-xs">
                                        {t('cal_generating') || 'AI Agronomist is building your plan...'}
                                    </p>
                                </motion.div>
                            )}

                            {calendarData && !isGenerating && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col gap-3"
                                >
                                    {/* AI Banner */}
                                    {calendarData.ai_warnings_banner && (
                                        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 flex items-center gap-3">
                                            <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                                            <p className="dark:text-rose-200 text-rose-700 text-xs font-medium">{calendarData.ai_warnings_banner}</p>
                                        </div>
                                    )}

                                    {/* Core Metrics Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {[{ label: 'Duration', value: <>{calendarData.total_duration_days} <span className="text-[10px] dark:text-slate-400 text-slate-500 font-bold">days</span></>, cls: 'dark:text-white text-slate-900' },
                                          { label: 'Yield Conf.', value: `${calendarData.yield_confidence}%`, cls: 'text-emerald-500' },
                                          { label: 'Difficulty', value: calendarData.farming_difficulty, cls: getRiskColor(calendarData.farming_difficulty).split(' ')[0] },
                                          { label: 'Water Need', value: <span className="flex items-center gap-1"><WaterDrop className="w-3 h-3" />{calendarData.water_intensity}</span>, cls: 'text-blue-500' }
                                        ].map(({ label, value, cls }) => (
                                            <div key={label} className="dark:bg-[#0A1525] bg-white dark:border-white/5 border-slate-200 border rounded-xl p-3">
                                                <div className="dark:text-slate-500 text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-0.5">{label}</div>
                                                <div className={`text-lg font-black leading-none ${cls}`}>{value}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* AI Summary */}
                                    <div className="relative overflow-hidden dark:bg-[#0A1525] bg-indigo-50 dark:border-indigo-500/30 border-indigo-200 border rounded-2xl p-4 shadow-sm">
                                        {/* Premium Top Highlight */}
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 opacity-80" />
                                        
                                        <div className="flex items-start gap-3 mt-1">
                                            <div className="p-2 dark:bg-indigo-500/20 bg-indigo-500/10 rounded-xl shrink-0 dark:border dark:border-indigo-500/20">
                                                <TrendingUp className="w-4 h-4 dark:text-indigo-400 text-indigo-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-2">
                                                    <h3 className="dark:text-indigo-50 text-slate-900 font-black text-sm tracking-tight flex items-center gap-1.5">
                                                        AI Agronomist Report
                                                        <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
                                                    </h3>
                                                    <div className="text-[10px] font-bold dark:text-indigo-300 text-indigo-700 dark:bg-indigo-500/10 bg-indigo-100 px-2.5 py-1 rounded-full w-fit border dark:border-indigo-500/20 border-indigo-200">
                                                        {calendarData.scientific_name}
                                                    </div>
                                                </div>
                                                <p className="dark:text-slate-300 text-slate-700 text-xs leading-relaxed mb-4">{calendarData.ai_summary}</p>
                                                <div className="grid grid-cols-3 gap-3 p-3 dark:bg-black/30 bg-white/50 rounded-xl border dark:border-white/5 border-slate-200/50">
                                                    <div>
                                                        <div className="text-[9px] dark:text-slate-500 text-slate-500 font-bold uppercase tracking-widest mb-1">Market Demand</div>
                                                        <div className={`text-xs font-black ${getRiskColor(calendarData.market_demand).split(' ')[0]}`}>{calendarData.market_demand}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[9px] dark:text-slate-500 text-slate-500 font-bold uppercase tracking-widest mb-1">Best Selling</div>
                                                        <div className="text-xs font-black text-amber-500">{calendarData.best_selling_month}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[9px] dark:text-slate-500 text-slate-500 font-bold uppercase tracking-widest mb-1">Sowing Window</div>
                                                        <div className="text-xs font-black text-emerald-500">{calendarData.recommended_sowing_window}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Timeline */}
                                    <div className="space-y-3 mt-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-bold dark:text-white text-slate-800 flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                                                Dynamic Lifecycle Phases
                                            </h3>
                                            <div className="text-[10px] dark:text-slate-500 text-slate-400 font-bold">{calendarData.timeline.length} AI-Generated Stages</div>
                                        </div>
                                        
                                        <div className="relative pl-4 md:pl-0">
                                            <div className="absolute left-[19px] top-3 bottom-3 w-0.5 dark:bg-white/10 bg-slate-200 md:hidden" />
                                            
                                            {calendarData.timeline.map((stage, idx) => (
                                                <motion.div 
                                                    key={idx}
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.08 }}
                                                    className="relative flex flex-col md:flex-row gap-4 mb-6 group"
                                                >
                                                    <div className="md:w-36 flex-shrink-0 flex md:flex-col items-center md:items-end md:text-right gap-3 md:gap-0.5 z-10">
                                                        <div className="w-4 h-4 rounded-full dark:bg-[#0A1525] bg-white border-2 border-indigo-500 flex items-center justify-center md:absolute md:left-[152px] md:top-4 shadow-[0_0_10px_rgba(99,102,241,0.4)]">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                                        </div>
                                                        <div className="md:pt-3">
                                                            <div className="text-indigo-500 font-black text-sm">
                                                                {new Date(stage.start_date).toLocaleDateString(language === 'TA' ? 'ta-IN' : 'en-IN', { month: 'short', day: 'numeric' })}
                                                            </div>
                                                            <div className="dark:text-slate-500 text-slate-400 text-[10px] font-bold uppercase">{stage.duration_days} days</div>
                                                        </div>
                                                    </div>

                                                    <div className="hidden md:block absolute left-[160px] top-8 bottom-[-40px] w-0.5 dark:bg-white/10 bg-slate-200 group-last:hidden" />

                                                    <div className="flex-1 dark:bg-[#0A1525] bg-white dark:border-white/5 border-slate-200 border rounded-2xl p-4 ml-6 md:ml-8 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                                                        <div className="absolute top-0 left-0 h-0.5 bg-indigo-500/50" style={{ width: `${((idx+1)/calendarData.timeline.length)*100}%` }} />
                                                        <h4 className="text-sm font-bold dark:text-white text-slate-800 mb-1">{stage.stage}</h4>
                                                        <p className="dark:text-slate-400 text-slate-500 text-xs mb-3 leading-relaxed">{stage.description}</p>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                            <div className="dark:bg-white/[0.02] bg-slate-50 rounded-xl p-3 flex gap-2 dark:border-white/5 border-slate-200 border">
                                                                <Droplets className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                                                                <div>
                                                                    <div className="text-[9px] dark:text-slate-500 text-slate-400 font-bold uppercase mb-0.5">Irrigation</div>
                                                                    <div className="text-xs dark:text-slate-300 text-slate-600">{stage.advisory.irrigation}</div>
                                                                </div>
                                                            </div>
                                                            <div className="dark:bg-white/[0.02] bg-slate-50 rounded-xl p-3 flex gap-2 dark:border-white/5 border-slate-200 border">
                                                                <Leaf className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                                                <div>
                                                                    <div className="text-[9px] dark:text-slate-500 text-slate-400 font-bold uppercase mb-0.5">Fertilizer</div>
                                                                    <div className="text-xs dark:text-slate-300 text-slate-600">{stage.advisory.fertilizer}</div>
                                                                </div>
                                                            </div>
                                                            <div className={`rounded-xl p-3 flex gap-2 border ${getRiskColor(stage.advisory.risk_level)}`}>
                                                                <Bug className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                                                                <div>
                                                                    <div className="text-[9px] font-bold uppercase mb-0.5 opacity-70">Pest Risk: {stage.advisory.risk_level}</div>
                                                                    <div className="text-xs font-medium">{stage.advisory.pest}</div>
                                                                </div>
                                                            </div>
                                                            <div className="dark:bg-white/[0.02] bg-slate-50 rounded-xl p-3 flex gap-2 dark:border-white/5 border-slate-200 border">
                                                                <CloudRain className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5" />
                                                                <div>
                                                                    <div className="text-[9px] dark:text-slate-500 text-slate-400 font-bold uppercase mb-0.5">Weather Impact</div>
                                                                    <div className="text-xs dark:text-slate-300 text-slate-600">{stage.weather_suggestion}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Market & Warnings */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                                        <div className="dark:bg-[#080F1E] bg-white dark:border-white/5 border-slate-200 border rounded-2xl p-4 flex items-start gap-3">
                                            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500 shrink-0"><DollarSign className="w-4 h-4"/></div>
                                            <div>
                                                <h4 className="dark:text-white text-slate-800 font-bold text-xs mb-1">Market Outlook</h4>
                                                <p className="dark:text-slate-400 text-slate-500 text-xs leading-relaxed">{calendarData.market_outlook}</p>
                                            </div>
                                        </div>
                                        <div className="dark:bg-[#080F1E] bg-white dark:border-white/5 border-slate-200 border rounded-2xl p-4 flex items-start gap-3">
                                            <div className="p-2 bg-orange-500/10 rounded-xl text-orange-500 shrink-0"><AlertTriangle className="w-4 h-4"/></div>
                                            <div>
                                                <h4 className="dark:text-white text-slate-800 font-bold text-xs mb-1">Critical Warnings</h4>
                                                <ul className="dark:text-slate-400 text-slate-500 text-xs list-disc pl-3 space-y-1">
                                                    {calendarData.critical_warnings.map((w, i) => <li key={i}>{w}</li>)}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
