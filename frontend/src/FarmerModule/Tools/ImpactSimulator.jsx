import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
    Leaf, FlaskConical, TrendingUp, AlertCircle, ShieldCheck,
    Info, RefreshCcw, ArrowRightLeft, Layers, Sprout,
    Volume2, StopCircle, Zap, Activity, CheckCircle, BarChart3
} from 'lucide-react';
import axios from 'axios';
import clsx from 'clsx';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useLanguage } from '../../Context/LanguageContext';

const API_BASE_URL = 'http://localhost:3001/api/farmer';

const ImpactSimulator = () => {
    const { t, language } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [formData, setFormData] = useState({
        crop: 'Rice',
        soilType: 'Alluvial',
        area: 1,
        durationMonths: 6,
        intensity: 'Medium'
    });

    useEffect(() => {
        return () => {
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        };
    }, []);

    const speakText = (text) => {
        if ('speechSynthesis' in window) {
            const synth = window.speechSynthesis;
            if (isSpeaking) {
                synth.cancel();
                setIsSpeaking(false);
                return;
            }
            const cleanText = text.replace(/[*#]/g, '');
            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.rate = 1.1;
            utterance.pitch = 1.0;
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);
            synth.speak(utterance);
            setIsSpeaking(true);
        }
    };

    const crops = ['Rice', 'Wheat', 'Corn', 'Tomato', 'Cotton', 'Sugarcane'];
    const soilTypes = ['Alluvial', 'Red Soil', 'Black Soil', 'Laterite', 'Desert Soil'];
    const intensities = ['Low', 'Medium', 'High'];

    const handleSimulate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { ...formData, language };
            const res = await axios.post(`${API_BASE_URL}/simulator/compare`, payload);
            if (res.data.success) setResults(res.data);
        } catch (error) {
            console.error('Simulation failed:', error);
            alert('Simulation failed. Please check connectivity.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 pb-12 min-h-screen">
            
            {/* ── Hero ─────────────────────────────────────────── */}
            <div className="relative overflow-hidden rounded-2xl mt-4 mb-5 px-6 py-7
                bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 border border-emerald-500/20">
                {/* mesh overlay */}
                <div className="absolute inset-0 opacity-10"
                    style={{backgroundImage:`url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 20L20 0H10L0 10M20 20V10L10 20'/%3E%3C/g%3E%3C/svg%3E")`}}/>
                <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"/>

                <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm shadow-inner shadow-white/10">
                            <ArrowRightLeft className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <h1 className="text-2xl font-bold text-white tracking-tight">
                                    {t('impact_title')}
                                </h1>
                                <span className="px-1.5 py-0.5 bg-white/20 backdrop-blur-md rounded-md text-[10px] font-bold text-white uppercase tracking-wider border border-white/20 shadow-sm">
                                    AI Model v4.2
                                </span>
                            </div>
                            <p className="text-[12px] text-white/80 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse"/>
                                {t('impact_subtitle')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                {/* ── Left Panel ────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-lg"
                >
                    <div className="flex items-center gap-2 mb-5">
                        <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                            <Layers className="w-4 h-4 text-emerald-500" />
                        </div>
                        <h3 className="text-[14px] font-semibold text-slate-800 dark:text-white">
                            {t('impact_parameters')}
                        </h3>
                    </div>

                    <form onSubmit={handleSimulate} className="space-y-4">
                        
                        {/* Target Crop */}
                        <div>
                            <label className="flex items-center gap-1 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                <Leaf className="w-3 h-3 text-emerald-500" /> {t('impact_target_crop')}
                            </label>
                            <select
                                value={formData.crop}
                                onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                                className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-[13px] text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                            >
                                {crops.map(c => <option key={c} value={c}>{t(`crop_${c.toLowerCase()}`) || c}</option>)}
                            </select>
                        </div>

                        {/* Soil Profile */}
                        <div>
                            <label className="flex items-center gap-1 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                <Sprout className="w-3 h-3 text-emerald-500" /> {t('impact_soil_profile')}
                            </label>
                            <select
                                value={formData.soilType}
                                onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                                className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-[13px] text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                            >
                                {soilTypes.map(s => <option key={s} value={s}>{t(`soil_${s.toLowerCase().replace(' ', '_')}`) || s}</option>)}
                            </select>
                        </div>

                        {/* Area & Duration */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{t('impact_area')}</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.area}
                                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-[13px] text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                                />
                            </div>
                            <div>
                                <label className="block mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{t('impact_cycle')}</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.durationMonths}
                                    onChange={(e) => setFormData({ ...formData, durationMonths: e.target.value })}
                                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-[13px] text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                                />
                            </div>
                        </div>

                        {/* Intensity Toggle */}
                        <div className="pt-1">
                            <label className="block mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{t('impact_intensity')}</label>
                            <div className="flex p-1 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 relative">
                                {intensities.map(i => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, intensity: i })}
                                        className="relative flex-1 py-1 px-2 rounded-md transition-all outline-none"
                                    >
                                        {formData.intensity === i && (
                                            <motion.div
                                                layoutId="impact-intensity-pill"
                                                className="absolute inset-0 bg-white dark:bg-slate-700 rounded-md shadow-sm border border-slate-100 dark:border-slate-600"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                                            />
                                        )}
                                        <span className={clsx(
                                            "relative z-10 text-[11px] font-bold uppercase tracking-wider transition-colors duration-200",
                                            formData.intensity === i ? "text-emerald-700 dark:text-white" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                        )}>
                                            {t(`impact_${i.toLowerCase()}`) || i}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-10 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400
                                    text-white rounded-xl font-semibold text-[13px] tracking-wide
                                    shadow-md shadow-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/30
                                    hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200
                                    flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading
                                    ? <><RefreshCcw className="w-4 h-4 animate-spin" /> {t('impact_simulating')}</>
                                    : <><Zap className="w-4 h-4" /> {t('impact_run_sim')}</>
                                }
                            </button>
                        </div>
                    </form>
                </motion.div>

                {/* ── Right Panel ───────────────────────────── */}
                <div className="lg:col-span-8 min-w-0">
                    <AnimatePresence mode="wait">
                        {results ? (
                            <motion.div
                                key="results"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-4"
                            >
                                {/* Results Cards Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    
                                    {/* Organic Card */}
                                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-emerald-500/20 shadow-sm relative overflow-hidden group hover:shadow-md hover:-translate-y-0.5 transition-all p-4">
                                        <Leaf className="w-20 h-20 text-emerald-50 dark:text-emerald-900/30 absolute -right-4 -bottom-4 -rotate-12 transition-transform group-hover:scale-110" />
                                        
                                        <div className="flex items-start justify-between mb-4 relative z-10">
                                            <div>
                                                <span className="inline-block px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded border border-emerald-100 dark:border-emerald-800/50 text-[10px] font-bold uppercase tracking-wider mb-2">
                                                    {t('impact_organic_protocol')}
                                                </span>
                                                <div className="flex items-center gap-1.5">
                                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                                    <span className="text-[11px] font-semibold text-slate-500">{t('impact_safe_yield')}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
                                            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2.5">
                                                <p className="text-[9px] font-semibold uppercase text-slate-400 tracking-wider mb-0.5">{t('impact_est_yield')}</p>
                                                <h4 className="text-[15px] font-bold text-slate-800 dark:text-white">{results.organic.yield} <span className="text-[10px] text-slate-400">kg</span></h4>
                                            </div>
                                            <div className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-lg p-2.5 border border-emerald-100 dark:border-emerald-800/30">
                                                <p className="text-[9px] font-semibold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider mb-0.5">{t('impact_proj_profit')}</p>
                                                <h4 className="text-[15px] font-bold text-emerald-600 dark:text-emerald-400">₹{results.organic.profit}</h4>
                                            </div>
                                        </div>

                                        <div className="relative z-10">
                                            <div className="flex justify-between items-end mb-1">
                                                <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">{t('impact_soil_health')}</span>
                                                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">{results.organic.soilHealth}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${results.organic.soilHealth}%` }}
                                                    transition={{ duration: 0.8 }}
                                                    className="h-full bg-emerald-500 rounded-full"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Chemical Card */}
                                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-rose-500/20 shadow-sm relative overflow-hidden group hover:shadow-md hover:-translate-y-0.5 transition-all p-4">
                                        <FlaskConical className="w-20 h-20 text-rose-50 dark:text-rose-900/20 absolute -right-4 -bottom-4 rotate-12 transition-transform group-hover:scale-110" />
                                        
                                        <div className="flex items-start justify-between mb-4 relative z-10">
                                            <div>
                                                <span className="inline-block px-2 py-0.5 bg-rose-50 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 rounded border border-rose-100 dark:border-rose-800/50 text-[10px] font-bold uppercase tracking-wider mb-2">
                                                    {t('impact_chemical_protocol')}
                                                </span>
                                                <div className="flex items-center gap-1.5">
                                                    <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                                                    <span className="text-[11px] font-semibold text-slate-500">{t('impact_high_risk')}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
                                            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2.5">
                                                <p className="text-[9px] font-semibold uppercase text-slate-400 tracking-wider mb-0.5">{t('impact_est_yield')}</p>
                                                <h4 className="text-[15px] font-bold text-slate-800 dark:text-white">{results.chemical.yield} <span className="text-[10px] text-slate-400">kg</span></h4>
                                            </div>
                                            <div className="bg-rose-50/50 dark:bg-rose-900/10 rounded-lg p-2.5 border border-rose-100 dark:border-rose-800/30">
                                                <p className="text-[9px] font-semibold uppercase text-rose-600 dark:text-rose-400 tracking-wider mb-0.5">{t('impact_proj_profit')}</p>
                                                <h4 className="text-[15px] font-bold text-rose-600 dark:text-rose-400">₹{results.chemical.profit}</h4>
                                            </div>
                                        </div>

                                        <div className="relative z-10">
                                            <div className="flex justify-between items-end mb-1">
                                                <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">{t('impact_soil_health')}</span>
                                                <span className="text-[11px] font-bold text-rose-500">{results.chemical.soilHealth}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${results.chemical.soilHealth}%` }}
                                                    transition={{ duration: 0.8 }}
                                                    className="h-full bg-rose-500 rounded-full"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Graph Area */}
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                    <div className="flex items-center gap-2 mb-3">
                                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                                        <h3 className="text-[13px] font-semibold text-slate-800 dark:text-white">{t('impact_yield_journey')}</h3>
                                    </div>
                                    <div className="h-48 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart
                                                data={results.organic.perMonthYieldTrend?.map((val, idx) => ({
                                                    name: `Mo ${idx}`,
                                                    Organic: val,
                                                    Chemical: results.chemical.perMonthYieldTrend?.[idx] || 0
                                                })) || []}
                                                margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.6} />
                                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}kg`} width={40} />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '0.75rem', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)', fontSize: '11px' }}
                                                />
                                                <Legend wrapperStyle={{ fontSize: '10px', fontWeight: '600' }} iconType="circle" iconSize={6} />
                                                <Line type="monotone" dataKey="Organic" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                                                <Line type="monotone" dataKey="Chemical" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* AI Insight */}
                                <div className="bg-gradient-to-br from-slate-50 to-emerald-50/30 dark:from-slate-800 dark:to-slate-800/80 p-4 rounded-xl border border-emerald-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1 bg-emerald-500 rounded text-white">
                                                <Info className="w-3.5 h-3.5" />
                                            </div>
                                            <h3 className="text-[13px] font-semibold text-slate-800 dark:text-white">{t('impact_ai_insight')}</h3>
                                        </div>
                                        <button
                                            onClick={() => speakText(results.explanation)}
                                            className={clsx(
                                                "px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider border",
                                                isSpeaking
                                                    ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/30 dark:border-rose-800"
                                                    : "bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-50"
                                            )}
                                        >
                                            {isSpeaking ? <><StopCircle className="w-3 h-3" /> {t('impact_stop')}</> : <><Volume2 className="w-3 h-3" /> {t('impact_listen')}</>}
                                        </button>
                                    </div>
                                    <div className="prose prose-sm dark:prose-invert prose-p:text-[12px] prose-li:text-[12px] prose-p:leading-relaxed max-w-none text-slate-600 dark:text-slate-300">
                                        <ReactMarkdown
                                            components={{
                                                strong: ({ node, ...props }) => <span className="font-semibold text-emerald-600 dark:text-emerald-400" {...props} />,
                                                ul: ({ node, ...props }) => <ul className="space-y-1.5 mt-2" {...props} />,
                                                li: ({ node, ...props }) => (
                                                    <li className="flex gap-2 items-start">
                                                        <span className="text-emerald-500 mt-1">•</span>
                                                        <span {...props} />
                                                    </li>
                                                ),
                                                p: ({ node, ...props }) => <p className="mb-2" {...props} />,
                                            }}
                                        >
                                            {results.explanation}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-full min-h-[460px] bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col"
                            >
                                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-[13px] font-medium text-slate-600 dark:text-slate-300">
                                        <BarChart3 className="w-4 h-4 text-emerald-400" />
                                        {t('impact_ws_title')}
                                    </div>
                                    <span className="text-[11px] text-slate-300 dark:text-slate-600 flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700"/>
                                        {t('impact_ws_awaiting')}
                                    </span>
                                </div>

                                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                                    <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mb-5 border border-emerald-100/50 dark:border-emerald-800/30">
                                        <Sprout className="w-8 h-8 text-emerald-400 dark:text-emerald-500" />
                                    </div>
                                    <h3 className="text-[16px] font-semibold text-slate-500 dark:text-slate-400 mb-2">{t('impact_ws_ready')}</h3>
                                    <p className="text-[13px] text-slate-400 max-w-sm leading-relaxed mb-8">
                                        {t('impact_ws_desc')}
                                    </p>

                                    <div className="grid grid-cols-3 gap-3 w-full max-w-sm text-left">
                                        {[
                                            { step: '01', label: t('impact_ws_step1'),      sub: t('impact_ws_step1_desc') },
                                            { step: '02', label: t('impact_ws_step2'),    sub: t('impact_ws_step2_desc') },
                                            { step: '03', label: t('impact_ws_step3'),     sub: t('impact_ws_step3_desc') },
                                        ].map(s => (
                                            <div key={s.step} className="bg-slate-50 dark:bg-slate-700/40 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
                                                <p className="text-[10px] font-bold text-emerald-400 mb-1">{s.step}</p>
                                                <p className="text-[12px] font-medium text-slate-700 dark:text-slate-200">{s.label}</p>
                                                <p className="text-[11px] text-slate-400">{s.sub}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default ImpactSimulator;
