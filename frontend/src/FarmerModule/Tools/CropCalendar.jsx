import React, { useState, useEffect } from 'react';
import { useTheme } from '../../Context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar as CalendarIcon, ChevronLeft, ChevronRight, Sprout, Droplets,
    Sun, Wind, CheckCircle2, AlertCircle, Info, Clock, ArrowRight,
    ChevronDown, MapPin, Activity, ShieldAlert, TrendingUp, Gauge
} from 'lucide-react';
import { Select, MenuItem, FormControl, InputLabel, TextField, ListSubheader } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { STATES, STATE_DISTRICTS } from '../locationData';

import { useGlobalState } from '../../Context/GlobalStateContext';
import { API_BASE_URL } from '../../config';

const CropCalendar = () => {
    const { isDarkMode } = useTheme();
    const { cropGroups } = useGlobalState();

    // Form States
    const [selectedCrop, setSelectedCrop] = useState('');
    const [sowingDate, setSowingDate] = useState(null);
    const [state, setState] = useState('');
    const [district, setDistrict] = useState('');

    // Result States
    const [schedule, setSchedule] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeStage, setActiveStage] = useState(0);

    // Initial Selection Sync Removed (User requested no auto-fill)
    /* 
    useEffect(() => {
        if (cropGroups && !selectedCrop) {
            ...
        }
    }, [cropGroups]);
    */

    const generateSchedule = async () => {
        if (!selectedCrop || !sowingDate || !state || !district) return;

        setLoading(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/api/farmer/crop-schedule`, {
                crop: selectedCrop,
                sowing_date: sowingDate.toISOString(),
                state,
                district
            });
            const sData = res.data.data || res.data;
            setSchedule(sData);
            setActiveStage(0);
            toast.success("Schedule Updated");
        } catch (err) {
            console.error("Schedule generation error:", err);
            toast.error("Failed to generate schedule");
        } finally {
            setLoading(false);
        }
    };

    // Auto-generate on change if all fields are valid
    useEffect(() => {
        if (selectedCrop && sowingDate && state && district) {
            generateSchedule();
        } else {
            setSchedule(null);
        }
    }, [selectedCrop, sowingDate, state, district]);

    const menuProps = {
        PaperProps: {
            style: { maxHeight: 300 },
            sx: {
                borderRadius: 3,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                bgcolor: isDarkMode ? '#1e293b' : 'background.paper',
                color: isDarkMode ? '#f1f5f9' : 'text.primary',
                '& .MuiMenuItem-root': {
                    padding: '12px 16px',
                    margin: '4px 8px',
                    borderRadius: 2,
                    '&:hover': { bgcolor: isDarkMode ? '#334155' : 'rgba(0, 0, 0, 0.04)' },
                    '&.Mui-selected': { bgcolor: 'rgba(16, 185, 129, 0.15) !important' }
                }
            }
        }
    };

    return (
        <div className="max-w-[1920px] mx-auto px-4 py-8 relative min-h-screen font-sans">
            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 md:mb-12 text-center max-w-5xl mx-auto relative z-10"
            >
                <div className="inline-flex items-center gap-2 px-3 md:px-5 py-1.5 md:py-2 bg-white/80 backdrop-blur-md border border-emerald-100/50 rounded-full shadow-sm text-emerald-700 font-bold text-[10px] md:text-xs mb-4 md:mb-6 tracking-wider uppercase dark:bg-slate-800/80 dark:border-emerald-900/30 dark:text-emerald-400">
                    <CalendarIcon className="h-3 w-3 md:h-3.5 md:w-3.5" />
                    <span>Dynamic Precision Scheduler</span>
                </div>
                <h1 className="text-2xl md:text-5xl font-black text-slate-900 tracking-tight mb-2 md:mb-4 dark:text-white md:whitespace-nowrap">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">
                        Smart Farming
                    </span>
                    {" "}Timeline
                </h1>
                <p className="text-slate-500 text-sm md:text-lg leading-relaxed font-medium max-w-3xl mx-auto px-4 dark:text-slate-400">
                    Region-aware, ML-optimized crop lifecycle tracking with real-time advisories.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* LEFT: Parameters Panel */}
                <div className="lg:col-span-3 space-y-3">
                    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl md:rounded-[2.5rem] p-3 md:p-6 shadow-xl border border-white/50 dark:border-slate-700">
                        <h3 className="text-[9px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3 md:mb-6 flex items-center gap-2">
                            <Gauge className="w-3 h-3 md:w-4 h-4 text-emerald-500" /> Deployment Params
                        </h3>

                        <div className="space-y-3 md:space-y-5">
                            {/* Grouped Crop Selector */}
                            <FormControl fullWidth size="small">
                                <label className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 md:mb-2 ml-1">Select Crop</label>
                                <Select
                                    value={selectedCrop}
                                    onChange={(e) => setSelectedCrop(e.target.value)}
                                    MenuProps={menuProps}
                                    displayEmpty
                                    className="rounded-xl"
                                    sx={{
                                        borderRadius: { xs: '0.5rem', md: '1rem' },
                                        bgcolor: isDarkMode ? '#1e293b' : '#f8fafc',
                                        '& .MuiSelect-select': { py: { xs: 0.8, md: 1.5 }, fontSize: { xs: '0.75rem', md: '0.875rem' } }
                                    }}
                                >
                                    <MenuItem value="" disabled>
                                        <span className="text-slate-400 font-medium">Choose Crop...</span>
                                    </MenuItem>
                                    {cropGroups && typeof cropGroups === 'object' && Object.entries(cropGroups).flatMap(([group, crops]) => [
                                        <ListSubheader key={`header-${group}`} className="font-black text-emerald-600 dark:text-emerald-400 dark:bg-slate-700">{group}</ListSubheader>,
                                        Array.isArray(crops) ? crops.map(c => (
                                            <MenuItem key={c} value={c}>{c}</MenuItem>
                                        )) : null
                                    ])}
                                </Select>
                            </FormControl>

                            {/* Sowing Date */}
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <div className="flex flex-col">
                                    <label className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 md:mb-2 ml-1">Sowing Date</label>
                                    <DatePicker
                                        value={sowingDate}
                                        onChange={(v) => setSowingDate(v)}
                                        format="DD/MM/YYYY"
                                        slotProps={{
                                            textField: {
                                                size: 'small',
                                                sx: {
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: { xs: '0.5rem', md: '1rem' },
                                                        bgcolor: isDarkMode ? '#1e293b' : '#f8fafc',
                                                        '& input': { py: { xs: 0.8, md: 1.2 }, fontSize: { xs: '0.75rem', md: '0.875rem' } }
                                                    }
                                                }
                                            },
                                            mobilePaper: {
                                                sx: {
                                                    '& .MuiPickersLayout-root': {
                                                        scale: { xs: '0.85', sm: '1' },
                                                        transformOrigin: 'top center'
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </LocalizationProvider>

                            {/* Region */}
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                <FormControl fullWidth size="small">
                                    <label className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 md:mb-2 ml-1">State</label>
                                    <Select
                                        value={state}
                                        onChange={(e) => {
                                            setState(e.target.value);
                                            setDistrict('');
                                        }}
                                        MenuProps={menuProps}
                                        displayEmpty
                                        className="rounded-xl"
                                        sx={{
                                            borderRadius: { xs: '0.5rem', md: '1rem' },
                                            bgcolor: isDarkMode ? '#1e293b' : '#f8fafc',
                                            '& .MuiSelect-select': { py: { xs: 0.8, md: 1.5 }, fontSize: { xs: '0.75rem', md: '0.875rem' } }
                                        }}
                                    >
                                        <MenuItem value="" disabled>
                                            <span className="text-slate-400 text-[10px] md:text-sm">State</span>
                                        </MenuItem>
                                        {STATES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                                    </Select>
                                </FormControl>
                                <FormControl fullWidth size="small">
                                    <label className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 md:mb-2 ml-1">District</label>
                                    <Select
                                        value={district}
                                        onChange={(e) => setDistrict(e.target.value)}
                                        MenuProps={menuProps}
                                        displayEmpty
                                        disabled={!state}
                                        className="rounded-xl"
                                        sx={{
                                            borderRadius: { xs: '0.5rem', md: '1rem' },
                                            bgcolor: isDarkMode ? '#1e293b' : '#f8fafc',
                                            '& .MuiSelect-select': { py: { xs: 0.8, md: 1.5 }, fontSize: { xs: '0.75rem', md: '0.875rem' } }
                                        }}
                                    >
                                        <MenuItem value="" disabled>
                                            <span className="text-slate-400 text-[10px] md:text-sm">District</span>
                                        </MenuItem>
                                        {(STATE_DISTRICTS[state] || []).map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </div>
                        </div>
                    </div>

                    {/* Stats Summary */}
                    {schedule && (
                        <div className="bg-slate-900 rounded-2xl md:rounded-[2.5rem] p-4 md:p-6 text-white overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
                            <div className="space-y-4 relative z-10">
                                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Yield Confidence</span>
                                    <span className="text-emerald-400 font-black">{schedule.yield_confidence}%</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Water Intensity</span>
                                    <span className="text-blue-400 font-black">{schedule.water_intensity}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Harvest Window</span>
                                    <div className="grid grid-cols-3 gap-1">
                                        <div className="text-[9px] text-center p-1 bg-white/5 rounded">
                                            <div className="opacity-50">Early</div>
                                            <div className="font-bold">{schedule.harvest_window?.early ? dayjs(schedule.harvest_window.early).format('MMM D') : '-'}</div>
                                        </div>
                                        <div className="text-[9px] text-center p-1 bg-emerald-500/20 rounded border border-emerald-500/30">
                                            <div className="text-emerald-400">Optimal</div>
                                            <div className="font-bold">{schedule.harvest_window?.optimal ? dayjs(schedule.harvest_window.optimal).format('MMM D') : '-'}</div>
                                        </div>
                                        <div className="text-[9px] text-center p-1 bg-white/5 rounded">
                                            <div className="opacity-50">Late</div>
                                            <div className="font-bold">{schedule.harvest_window?.late ? dayjs(schedule.harvest_window.late).format('MMM D') : '-'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT: Timeline Content */}
                <div className="lg:col-span-9">
                    {loading ? (
                        <div className="h-96 flex items-center justify-center bg-white/50 dark:bg-slate-800/50 rounded-[3rem] backdrop-blur-xl">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full"
                            />
                        </div>
                    ) : schedule ? (
                        <div className="space-y-6">
                            {/* Stage Navigation */}
                            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-[2.5rem] p-3 border border-white/50 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar shadow-sm">
                                        {schedule.timeline && schedule.timeline.map((step, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveStage(idx)}
                                        className={`flex-1 min-w-[200px] flex items-center justify-center gap-3 px-6 py-4 rounded-2xl transition-all duration-300 ${activeStage === idx
                                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                                            : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-emerald-50'
                                            }`}
                                    >
                                        <span className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-[10px] font-black ${activeStage === idx ? 'bg-white text-emerald-600' : 'bg-slate-100 dark:bg-slate-600'
                                            }`}>
                                            {idx + 1}
                                        </span>
                                        <span className="text-xs font-black uppercase tracking-wider whitespace-nowrap">{step.stage}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Active Content */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                {/* Focus Card */}
                                <motion.div
                                    key={activeStage}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="md:col-span-7 bg-white dark:bg-slate-800 rounded-[3rem] p-8 shadow-xl border border-white dark:border-slate-700 relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20" />

                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="px-4 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                                                Active Phase
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-tighter">
                                                <CalendarIcon className="w-3.5 h-3.5" />
                                                {schedule.timeline?.[activeStage]?.start_date && dayjs(schedule.timeline[activeStage].start_date).format('DD MMM')} — {schedule.timeline?.[activeStage]?.end_date && dayjs(schedule.timeline[activeStage].end_date).format('DD MMM YYYY')}
                                            </div>
                                        </div>

                                        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter">
                                            {schedule.timeline?.[activeStage]?.stage}
                                        </h2>

                                        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-700 mb-8">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center">
                                                    <Sun className="w-4 h-4 text-orange-500" />
                                                </div>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Weather Adjustment</span>
                                            </div>
                                            <p className="text-slate-600 dark:text-slate-300 font-bold italic leading-relaxed">
                                                "{schedule.timeline?.[activeStage]?.weather_suggestion}"
                                            </p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-start gap-4 p-5 bg-white dark:bg-slate-700/50 rounded-2xl border border-slate-100 dark:border-slate-600 shadow-sm">
                                                <Droplets className="w-5 h-5 text-blue-500 mt-1" />
                                                <div>
                                                    <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase mb-1">Irrigation Advisory</h4>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{schedule.timeline?.[activeStage]?.advisory?.irrigation}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-4 p-5 bg-white dark:bg-slate-700/50 rounded-2xl border border-slate-100 dark:border-slate-600 shadow-sm">
                                                <Sprout className="w-5 h-5 text-emerald-500 mt-1" />
                                                <div>
                                                    <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase mb-1">Fertilizer Schedule</h4>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{schedule.timeline?.[activeStage]?.advisory?.fertilizer}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Side Panel: Risk & Alerts */}
                                <div className="md:col-span-5 space-y-6">
                                    <div className="bg-rose-50 dark:bg-rose-900/20 rounded-[2.5rem] p-8 border border-rose-100 dark:border-rose-900/30">
                                        <div className="flex items-center gap-3 mb-6">
                                            <ShieldAlert className="w-6 h-6 text-rose-500" />
                                            <h3 className="text-sm font-black text-rose-900 dark:text-rose-400 uppercase tracking-wider">Pathogen Alert</h3>
                                        </div>
                                        <p className="text-rose-800 dark:text-rose-300 font-bold text-lg mb-4 leading-snug">
                                            Critical Risk: {schedule.timeline?.[activeStage]?.advisory?.pest}
                                        </p>
                                        <div className="flex gap-2">
                                            <span className="px-3 py-1 bg-rose-500 text-white text-[10px] font-black rounded-full uppercase">
                                                {schedule.timeline?.[activeStage]?.advisory?.risk_level === 'High' ? 'Extreme Risk' :
                                                    schedule.timeline?.[activeStage]?.advisory?.risk_level === 'Medium' ? 'Moderate Risk' : 'Low Risk'}
                                            </span>
                                            <span className="px-3 py-1 bg-white dark:bg-rose-900/50 text-rose-500 text-[10px] font-black rounded-full border border-rose-200 uppercase">Prevention Mode</span>
                                        </div>
                                    </div>

                                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/50 dark:border-slate-700 shadow-xl overflow-hidden relative group">
                                        <motion.div
                                            animate={{ opacity: [0.1, 0.2, 0.1] }}
                                            className="absolute inset-0 bg-emerald-500 pointer-events-none"
                                        />
                                        <TrendingUp className="w-8 h-8 text-emerald-500 mb-6 relative z-10" />
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">Economic Insight</h3>
                                        <p className="text-xl font-black text-slate-900 dark:text-white leading-tight relative z-10 transition-transform group-hover:translate-x-1">
                                            {schedule.timeline?.[activeStage]?.advisory?.economic_insight}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-96 flex flex-col items-center justify-center bg-white/30 dark:bg-slate-800/30 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
                            <Info className="w-12 h-12 text-slate-300 mb-4" />
                            <p className="text-slate-400 font-bold">Adjust parameters to generate your precision calendar</p>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default CropCalendar;
