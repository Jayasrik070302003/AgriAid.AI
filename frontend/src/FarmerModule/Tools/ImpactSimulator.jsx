import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
    Leaf, FlaskConical, AlertCircle, ShieldCheck,
    Info, RefreshCcw, ArrowRightLeft, Layers, Sprout,
    Volume2, StopCircle, Zap, BarChart3, Droplets, Wind
} from 'lucide-react';
import axios from 'axios';
import clsx from 'clsx';
import { useLanguage } from '../../Context/LanguageContext';

import { API_BASE_URL as BASE_URL } from '../../config';
const API_BASE_URL = `${BASE_URL}/api/farmer`;

const ImpactSimulator = () => {
    const { t, language } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const [baseData, setBaseData] = useState({
        crop: 'Rice',
        soilType: 'Alluvial',
        area: 1,
        weather: 'Normal'
    });
    const [scenarioA, setScenarioA] = useState({
        method: 'Organic',
        irrigation: 'Drip',
        fertilizer: 'Bio-Fertilizer'
    });
    const [scenarioB, setScenarioB] = useState({
        method: 'Chemical',
        irrigation: 'Flood',
        fertilizer: 'Synthetic'
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
    const weathers = ['Normal', 'Drought', 'Heavy Rain', 'Heatwave'];
    const methods = ['Organic', 'Chemical', 'Mixed'];
    const irrigations = ['Drip', 'Sprinkler', 'Flood', 'Rainfed'];
    const fertilizers = ['Bio-Fertilizer', 'Synthetic', 'Compost', 'None'];

    const handleSimulate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { base: baseData, scenarioA, scenarioB, language };
            const res = await axios.post(`${API_BASE_URL}/simulator/compare`, payload);
            if (res.data.success) setResults(res.data.data);
        } catch (error) {
            console.error('Simulation failed:', error);
            alert('Simulation failed. Please check connectivity.');
        } finally {
            setLoading(false);
        }
    };

    const getIndicatorColor = (value, inverse = false) => {
        const lowerVal = String(value).toLowerCase();
        if (lowerVal.includes('high') || lowerVal.includes('positive')) {
            return inverse ? 'text-rose-500 bg-rose-50 border-rose-200' : 'text-emerald-500 bg-emerald-50 border-emerald-200';
        }
        if (lowerVal.includes('low') || lowerVal.includes('negative')) {
            return inverse ? 'text-emerald-500 bg-emerald-50 border-emerald-200' : 'text-rose-500 bg-rose-50 border-rose-200';
        }
        return 'text-amber-500 bg-amber-50 border-amber-200'; // Moderate/Neutral
    };

    const renderCard = (title, scenarioData, theme = 'emerald') => (
        <div className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-${theme}-500/20 shadow-sm relative overflow-hidden group hover:shadow-md hover:-translate-y-0.5 transition-all p-4`}>
            <div className={`w-20 h-20 text-${theme}-50 dark:text-${theme}-900/30 absolute -right-4 -bottom-4 -rotate-12 transition-transform group-hover:scale-110`}>
                <Layers className="w-full h-full" />
            </div>
            
            <div className="flex items-start justify-between mb-4 relative z-10">
                <div>
                    <span className={`inline-block px-2 py-0.5 bg-${theme}-50 dark:bg-${theme}-900/40 text-${theme}-700 dark:text-${theme}-400 rounded border border-${theme}-100 dark:border-${theme}-800/50 text-[10px] font-bold uppercase tracking-wider mb-2`}>
                        {title}
                    </span>
                    <div className="flex items-center gap-1.5">
                        <ShieldCheck className={`w-3.5 h-3.5 text-${theme}-500`} />
                        <span className="text-[11px] font-semibold text-slate-500">{scenarioData.overallRisk} Risk</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
                {[
                    { label: 'Yield Effect', val: scenarioData.yieldEffect, inv: false },
                    { label: 'Soil Impact', val: scenarioData.soilImpact, inv: false },
                    { label: 'Water Use', val: scenarioData.waterConsumption, inv: true },
                    { label: 'Sustainability', val: scenarioData.sustainability, inv: false },
                    { label: 'Cost Efficiency', val: scenarioData.costEfficiency, inv: false },
                ].map((item, idx) => {
                    const colorClasses = getIndicatorColor(item.val, item.inv);
                    return (
                        <div key={idx} className={`rounded-lg p-2.5 border ${colorClasses} dark:bg-slate-700/50 dark:border-slate-600`}>
                            <p className="text-[9px] font-semibold uppercase opacity-70 tracking-wider mb-0.5">{item.label}</p>
                            <h4 className="text-[13px] font-bold">{item.val}</h4>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 pb-12 min-h-screen impact-simulator-container">
            
            {/* ── Hero ─────────────────────────────────────────── */}
            <div className="relative overflow-hidden rounded-2xl mt-4 mb-5 px-6 py-7
                bg-gradient-to-br from-slate-800 via-slate-900 to-black border border-emerald-500/20">
                <div className="absolute inset-0 opacity-10"
                    style={{backgroundImage:`url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 20L20 0H10L0 10M20 20V10L10 20'/%3E%3C/g%3E%3C/svg%3E")`}}/>
                <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"/>

                <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm shadow-inner shadow-white/5">
                            <ArrowRightLeft className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <h1 className="text-2xl font-bold text-white tracking-tight">
                                    AgriAid Simulator
                                </h1>
                                <span className="px-1.5 py-0.5 bg-emerald-500/20 backdrop-blur-md rounded-md text-[10px] font-bold text-emerald-400 uppercase tracking-wider border border-emerald-500/20 shadow-sm">
                                    AI Powered
                                </span>
                            </div>
                            <p className="text-[12px] text-slate-400 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
                                Compare practical farming strategies. No fake numbers, just research-backed insights.
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
                    className="lg:col-span-4 space-y-4"
                >
                    <form onSubmit={handleSimulate} className="space-y-4">
                        {/* Base Context */}
                        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-lg">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-1.5 bg-slate-100 dark:bg-slate-900/50 rounded-lg">
                                    <Layers className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                </div>
                                <h3 className="text-[14px] font-semibold text-slate-800 dark:text-white">
                                    Base Environment
                                </h3>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="flex items-center gap-1 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                        <Leaf className="w-3 h-3" /> Crop
                                    </label>
                                    <select value={baseData.crop} onChange={(e) => setBaseData({ ...baseData, crop: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-[12px] dark:text-white focus:ring-2 focus:ring-emerald-500/30">
                                        {crops.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="flex items-center gap-1 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                        <Sprout className="w-3 h-3" /> Soil
                                    </label>
                                    <select value={baseData.soilType} onChange={(e) => setBaseData({ ...baseData, soilType: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-[12px] dark:text-white focus:ring-2 focus:ring-emerald-500/30">
                                        {soilTypes.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="flex items-center gap-1 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                        <Wind className="w-3 h-3" /> Weather
                                    </label>
                                    <select value={baseData.weather} onChange={(e) => setBaseData({ ...baseData, weather: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-[12px] dark:text-white focus:ring-2 focus:ring-emerald-500/30">
                                        {weathers.map(w => <option key={w} value={w}>{w}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Acres</label>
                                    <input type="number" min="1" value={baseData.area} onChange={(e) => setBaseData({ ...baseData, area: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-[12px] dark:text-white focus:ring-2 focus:ring-emerald-500/30"/>
                                </div>
                            </div>
                        </div>

                        {/* Scenario A */}
                        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-lg border-l-4 border-l-emerald-500">
                            <h3 className="text-[13px] font-semibold text-emerald-600 dark:text-emerald-400 mb-3">Scenario A Setup</h3>
                            <div className="space-y-3">
                                <select value={scenarioA.method} onChange={(e) => setScenarioA({ ...scenarioA, method: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-[12px] dark:text-white">
                                    {methods.map(m => <option key={m} value={m}>{m} Farming</option>)}
                                </select>
                                <select value={scenarioA.irrigation} onChange={(e) => setScenarioA({ ...scenarioA, irrigation: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-[12px] dark:text-white">
                                    {irrigations.map(m => <option key={m} value={m}>{m} Irrigation</option>)}
                                </select>
                                <select value={scenarioA.fertilizer} onChange={(e) => setScenarioA({ ...scenarioA, fertilizer: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-[12px] dark:text-white">
                                    {fertilizers.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Scenario B */}
                        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-lg border-l-4 border-l-rose-500">
                            <h3 className="text-[13px] font-semibold text-rose-600 dark:text-rose-400 mb-3">Scenario B Setup</h3>
                            <div className="space-y-3">
                                <select value={scenarioB.method} onChange={(e) => setScenarioB({ ...scenarioB, method: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-[12px] dark:text-white">
                                    {methods.map(m => <option key={m} value={m}>{m} Farming</option>)}
                                </select>
                                <select value={scenarioB.irrigation} onChange={(e) => setScenarioB({ ...scenarioB, irrigation: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-[12px] dark:text-white">
                                    {irrigations.map(m => <option key={m} value={m}>{m} Irrigation</option>)}
                                </select>
                                <select value={scenarioB.fertilizer} onChange={(e) => setScenarioB({ ...scenarioB, fertilizer: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-[12px] dark:text-white">
                                    {fertilizers.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-11 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold text-[14px] tracking-wide
                                    shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40
                                    hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200
                                    flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading
                                    ? <><RefreshCcw className="w-4 h-4 animate-spin" /> Simulating Impacts...</>
                                    : <><Zap className="w-4 h-4" /> Compare Scenarios</>
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
                                    {renderCard("Scenario A", results.scenarioA, "emerald")}
                                    {renderCard("Scenario B", results.scenarioB, "rose")}
                                </div>

                                {/* AI Insight */}
                                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden">
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                                    <div className="flex items-center justify-between mb-4 mt-1">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-emerald-500/20 rounded-lg text-emerald-400">
                                                <Info className="w-4 h-4" />
                                            </div>
                                            <h3 className="text-[14px] font-bold text-white">AI Conclusion</h3>
                                        </div>
                                        <button
                                            onClick={() => speakText(results.explanation)}
                                            className={clsx(
                                                "px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider",
                                                isSpeaking
                                                    ? "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
                                                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                            )}
                                        >
                                            {isSpeaking ? <><StopCircle className="w-3.5 h-3.5" /> Stop</> : <><Volume2 className="w-3.5 h-3.5" /> Listen</>}
                                        </button>
                                    </div>
                                    <div className="prose prose-sm dark:prose-invert prose-p:text-[13px] prose-p:leading-relaxed max-w-none text-slate-300">
                                        <ReactMarkdown
                                            components={{
                                                strong: ({ node, ...props }) => <span className="font-semibold text-emerald-400" {...props} />,
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
                                className="h-full min-h-[460px] bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center p-8 text-center"
                            >
                                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900/50 rounded-full flex items-center justify-center mb-6 border border-slate-100 dark:border-slate-800">
                                    <FlaskConical className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                                </div>
                                <h3 className="text-[18px] font-bold text-slate-700 dark:text-slate-300 mb-2">Ready to Simulate</h3>
                                <p className="text-[14px] text-slate-500 dark:text-slate-400 max-w-md leading-relaxed mb-8">
                                    Configure your Base Environment on the left, then define two Scenarios to compare. The AI will evaluate yield, soil, water, and costs without generating fake numeric guarantees.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default ImpactSimulator;
