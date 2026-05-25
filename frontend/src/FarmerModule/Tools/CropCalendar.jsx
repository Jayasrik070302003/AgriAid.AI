import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Calendar, CheckCircle2, ChevronRight, Droplets, Thermometer, Leaf, Zap, AlertTriangle, TrendingUp, DollarSign, Sprout, CloudRain, Wind, Droplets as WaterDrop, Bug } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import useGPS from '../../hooks/useGPS';
import { useLanguage } from '../../Context/LanguageContext';

const API_BASE_URL = 'http://localhost:3001/api/farmer';
const apiClient = axios.create({ baseURL: API_BASE_URL, timeout: 60000 });

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

    // Close suggestions if clicked outside (simplified for React, wrapping inputs)
    return (
        <div className="min-h-screen bg-[#050B14] py-12 px-4 sm:px-6 font-sans crop-calendar-container">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-4 mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest">
                        <Zap className="w-4 h-4" />
                        {t('cal_badge') || 'AI Precision Scheduler'}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                        {t('cal_title') || 'Smart Crop Calendar'}
                    </h1>
                    <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base">
                        {t('cal_subtitle') || 'Dynamic, AI-generated cultivation lifecycle planner based on live Open-Meteo weather and localized crop biology.'}
                    </p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-8">
                    {/* Left Pane: Configuration */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-[#0A1525] border border-white/5 rounded-3xl p-6 lg:p-8 flex flex-col gap-6 sticky top-24 h-fit shadow-2xl"
                    >
                        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
                            <Leaf className="w-5 h-5 text-emerald-400" />
                            {t('timeline_parameters') || 'Configuration'}
                        </h2>

                        {/* AI Autocomplete Input */}
                        <div className="space-y-2 relative">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('cal_search_label') || 'Target Crop'}</label>
                            <div className="relative">
                                {isAutocompleteLoading ? (
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-slate-500/30 border-t-indigo-500 rounded-full animate-spin" />
                                ) : (
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                )}
                                <input
                                    type="text"
                                    value={cropInput}
                                    onChange={(e) => {
                                        setCropInput(e.target.value);
                                        setSelectedCrop('');
                                    }}
                                    onFocus={() => { if(suggestions.length) setShowSuggestions(true); }}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                    placeholder={t('cal_search_placeholder') || 'Type any crop or regional name (e.g. thakali)'}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600 text-sm"
                                />
                            </div>
                            
                            {/* Autocomplete Dropdown */}
                            <AnimatePresence>
                                {showSuggestions && suggestions.length > 0 && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                                        className="absolute top-full left-0 right-0 mt-2 bg-[#0A1525] border border-indigo-500/30 rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-50"
                                    >
                                        <div className="text-[10px] uppercase font-bold text-indigo-400 px-4 py-2 bg-indigo-500/10">AI Suggestions</div>
                                        {suggestions.map((sug, idx) => (
                                            <button 
                                                key={idx}
                                                onClick={() => handleSelectCrop(sug)}
                                                className="w-full text-left px-4 py-3 text-white text-sm hover:bg-indigo-600/20 transition-colors flex items-center justify-between"
                                            >
                                                <span>{sug}</span>
                                                <Zap className="w-3 h-3 text-indigo-500" />
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Date Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('cal_date_label') || 'Sowing Date'}</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="date"
                                    value={sowingDate}
                                    onChange={(e) => setSowingDate(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-colors [color-scheme:dark] text-sm"
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('cal_location_label') || 'Location'}</label>
                                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {gpsLoading ? (t('cal_location_detecting') || 'Detecting...') : 'Auto-Detected'}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    value={formData.state}
                                    readOnly
                                    placeholder={t('cal_state_placeholder') || 'State'}
                                    className="w-full bg-black/20 border border-white/5 rounded-xl py-3 px-4 text-slate-300 text-sm focus:outline-none cursor-not-allowed"
                                />
                                <input
                                    type="text"
                                    value={formData.district}
                                    readOnly
                                    placeholder={t('cal_district_placeholder') || 'District'}
                                    className="w-full bg-black/20 border border-white/5 rounded-xl py-3 px-4 text-slate-300 text-sm focus:outline-none cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || (!selectedCrop && !cropInput) || !formData.state}
                            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] disabled:shadow-none"
                        >
                            {isGenerating ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    {t('cal_generating') || 'Analyzing...'}
                                </>
                            ) : (
                                <>
                                    <Zap className="w-5 h-5" />
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
                                    className="h-full flex flex-col items-center justify-center min-h-[500px] border border-white/5 rounded-3xl p-8 text-center bg-gradient-to-b from-[#0A1525] to-[#050B14]"
                                >
                                    <div className="w-32 h-32 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/20 to-transparent rounded-full flex items-center justify-center mb-6">
                                        <Sprout className="w-12 h-12 text-indigo-400" />
                                    </div>
                                    <h3 className="text-2xl font-black text-white mb-3">{t('cal_empty_title') || 'Ready to Plan Your Season'}</h3>
                                    <p className="text-slate-400 text-sm max-w-md mb-8 leading-relaxed">
                                        Enter any crop name in your local language. Our AI will automatically identify the species, fetch live Open-Meteo data for your village, and generate a dynamic lifecycle plan.
                                    </p>
                                </motion.div>
                            )}

                            {isGenerating && (
                                <motion.div 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="h-full flex flex-col items-center justify-center min-h-[500px]"
                                >
                                    <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-6" />
                                    <p className="text-indigo-400 font-bold animate-pulse tracking-widest uppercase text-sm">
                                        {t('cal_generating') || 'AI Agronomist is building your plan...'}
                                    </p>
                                </motion.div>
                            )}

                            {calendarData && !isGenerating && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col gap-6"
                                >
                                    {/* AI Banner */}
                                    {calendarData.ai_warnings_banner && (
                                        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-center gap-4 animate-[pulse_3s_ease-in-out_infinite]">
                                            <AlertTriangle className="w-6 h-6 text-rose-500 flex-shrink-0" />
                                            <p className="text-rose-200 text-sm font-medium">{calendarData.ai_warnings_banner}</p>
                                        </div>
                                    )}

                                    {/* Core Metrics Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-[#0A1525] border border-white/5 rounded-2xl p-4">
                                            <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Duration</div>
                                            <div className="text-2xl font-black text-white">{calendarData.total_duration_days} <span className="text-xs text-slate-400 font-bold">days</span></div>
                                        </div>
                                        <div className="bg-[#0A1525] border border-white/5 rounded-2xl p-4">
                                            <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Yield Conf.</div>
                                            <div className="text-2xl font-black text-emerald-400">{calendarData.yield_confidence}%</div>
                                        </div>
                                        <div className="bg-[#0A1525] border border-white/5 rounded-2xl p-4">
                                            <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Difficulty</div>
                                            <div className={`text-lg font-black mt-1 ${getRiskColor(calendarData.farming_difficulty).split(' ')[0]}`}>{calendarData.farming_difficulty}</div>
                                        </div>
                                        <div className="bg-[#0A1525] border border-white/5 rounded-2xl p-4">
                                            <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Water Need</div>
                                            <div className="text-lg font-black text-blue-400 mt-1 flex items-center gap-1">
                                                <WaterDrop className="w-4 h-4" /> {calendarData.water_intensity}
                                            </div>
                                        </div>
                                    </div>

                                    {/* AI Summary */}
                                    <div className="bg-gradient-to-br from-indigo-500/10 to-[#0A1525] border border-indigo-500/20 rounded-3xl p-6 md:p-8">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-indigo-500/20 rounded-2xl shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                                                <TrendingUp className="w-6 h-6 text-indigo-400" />
                                            </div>
                                            <div>
                                                <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                                                    <h3 className="text-white font-bold text-lg">AI Agronomist Report</h3>
                                                    <div className="text-xs font-bold text-slate-500 bg-black/40 px-3 py-1 rounded-full w-fit">
                                                        {calendarData.scientific_name}
                                                    </div>
                                                </div>
                                                <p className="text-indigo-100/80 text-sm leading-relaxed mb-4">{calendarData.ai_summary}</p>
                                                
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/5">
                                                    <div>
                                                        <div className="text-[10px] text-slate-500 uppercase tracking-widest">Market Demand</div>
                                                        <div className={`text-sm font-bold ${getRiskColor(calendarData.market_demand).split(' ')[0]}`}>{calendarData.market_demand}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] text-slate-500 uppercase tracking-widest">Best Selling</div>
                                                        <div className="text-sm font-bold text-amber-400">{calendarData.best_selling_month}</div>
                                                    </div>
                                                    <div className="col-span-2 md:col-span-1">
                                                        <div className="text-[10px] text-slate-500 uppercase tracking-widest">Sowing Window</div>
                                                        <div className="text-sm font-bold text-emerald-400">{calendarData.recommended_sowing_window}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dynamic Smooth Scroll Timeline */}
                                    <div className="space-y-6 mt-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                                <Calendar className="w-5 h-5 text-emerald-400" />
                                                Dynamic Lifecycle Phases
                                            </h3>
                                            <div className="text-xs text-slate-500 font-bold">{calendarData.timeline.length} AI-Generated Stages</div>
                                        </div>
                                        
                                        <div className="relative pl-4 md:pl-0">
                                            {/* Mobile Vertical Line */}
                                            <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-white/10 md:hidden" />
                                            
                                            {calendarData.timeline.map((stage, idx) => (
                                                <motion.div 
                                                    key={idx}
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.1 }}
                                                    className="relative flex flex-col md:flex-row gap-6 mb-10 group"
                                                >
                                                    {/* Date & Stage Indicator */}
                                                    <div className="md:w-48 flex-shrink-0 flex md:flex-col items-center md:items-end md:text-right gap-4 md:gap-1 z-10">
                                                        <div className="w-6 h-6 rounded-full bg-[#0A1525] border-2 border-indigo-500 flex items-center justify-center md:absolute md:left-[212px] md:top-6 shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                                                            <div className="w-2 h-2 rounded-full bg-indigo-400" />
                                                        </div>
                                                        <div className="md:pt-4">
                                                            <div className="text-indigo-400 font-black text-lg">
                                                                {new Date(stage.start_date).toLocaleDateString(language === 'TA' ? 'ta-IN' : 'en-IN', { month: 'short', day: 'numeric' })}
                                                            </div>
                                                            <div className="text-slate-500 text-xs font-bold uppercase">{stage.duration_days} days</div>
                                                        </div>
                                                    </div>

                                                    {/* Desktop Vertical Line */}
                                                    <div className="hidden md:block absolute left-[223px] top-12 bottom-[-60px] w-0.5 bg-white/10 group-last:hidden" />

                                                    {/* Stage Content Card */}
                                                    <div className="flex-1 bg-[#0A1525] border border-white/5 rounded-3xl p-6 ml-10 md:ml-12 shadow-xl hover:shadow-[0_0_30px_rgba(99,102,241,0.05)] transition-all relative overflow-hidden group-hover:border-white/10">
                                                        {/* Stage Progress Bar (Visual flair) */}
                                                        <div className="absolute top-0 left-0 h-1 bg-indigo-500/50" style={{ width: `${((idx+1)/calendarData.timeline.length)*100}%` }} />
                                                        
                                                        <h4 className="text-xl font-bold text-white mb-2 mt-1">{stage.stage}</h4>
                                                        <p className="text-slate-400 text-sm mb-6 leading-relaxed">{stage.description}</p>
                                                        
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            <div className="bg-white/[0.02] rounded-2xl p-4 flex gap-3 border border-white/5">
                                                                <Droplets className="w-5 h-5 text-blue-400 flex-shrink-0" />
                                                                <div>
                                                                    <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Irrigation</div>
                                                                    <div className="text-sm text-slate-300">{stage.advisory.irrigation}</div>
                                                                </div>
                                                            </div>
                                                            <div className="bg-white/[0.02] rounded-2xl p-4 flex gap-3 border border-white/5">
                                                                <Leaf className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                                                <div>
                                                                    <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Fertilizer</div>
                                                                    <div className="text-sm text-slate-300">{stage.advisory.fertilizer}</div>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className={`rounded-2xl p-4 flex gap-3 border ${getRiskColor(stage.advisory.risk_level)}`}>
                                                                <Bug className="w-5 h-5 flex-shrink-0" />
                                                                <div>
                                                                    <div className="text-[10px] font-bold uppercase mb-1 opacity-70">Pest Risk: {stage.advisory.risk_level}</div>
                                                                    <div className="text-sm font-medium">{stage.advisory.pest}</div>
                                                                </div>
                                                            </div>

                                                            <div className="bg-white/[0.02] rounded-2xl p-4 flex gap-3 border border-white/5">
                                                                <CloudRain className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                                                                <div>
                                                                    <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Weather Impact</div>
                                                                    <div className="text-sm text-slate-300">{stage.weather_suggestion}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Market & Warnings Bottom Panels */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                        <div className="bg-[#080F1E] border border-white/5 rounded-3xl p-6 flex items-start gap-4 shadow-xl">
                                            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400"><DollarSign className="w-6 h-6"/></div>
                                            <div>
                                                <h4 className="text-white font-bold mb-1">Market Outlook</h4>
                                                <p className="text-slate-400 text-sm leading-relaxed">{calendarData.market_outlook}</p>
                                            </div>
                                        </div>
                                        <div className="bg-[#080F1E] border border-white/5 rounded-3xl p-6 flex items-start gap-4 shadow-xl">
                                            <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-400"><AlertTriangle className="w-6 h-6"/></div>
                                            <div>
                                                <h4 className="text-white font-bold mb-2">Critical Warnings</h4>
                                                <ul className="text-slate-400 text-sm list-disc pl-4 space-y-2">
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
