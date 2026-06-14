import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Map, Wind, Droplets, Thermometer, AlertTriangle,
    TrendingUp, Activity, History, Info, CheckCircle,
    Loader2, Zap, Shield, Calendar
} from 'lucide-react';
import axios from 'axios';
import clsx from 'clsx';

import { API_BASE_URL as BASE_URL } from '../../config';
const API_BASE_URL = `${BASE_URL}/api/farmer/spread-risk`;

const cropOptions    = ['Rice', 'Wheat', 'Corn', 'Tomato', 'Potato', 'Cotton', 'Sugarcane'];
const diseaseOptions = [
    'Rice Brown Spot', 'Rice Blast', 'Bacterial Leaf Blight',
    'Tomato Early Blight', 'Tomato Leaf Curl Virus', 'Tomato Septoria Leaf Spot',
    'Potato Early Blight', 'Potato Late Blight', 'Healthy',
];
const states = ['Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'Maharashtra', 'Punjab'];

/* ── Slider component with value badge ─────────────────────────────── */
const Slider = ({ label, min, max, step = 1, value, onChange, format, accent = '#f43f5e', warn }) => {
    const pct = ((value - min) / (max - min)) * 100;
    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
                <span className={clsx(
                    "text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1",
                    warn ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400"
                         : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                )}>
                    {format(value)}
                    {warn && <AlertTriangle className="w-3 h-3" />}
                </span>
            </div>
            <div className="relative h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                {/* Filled track */}
                <div
                    className="absolute left-0 top-0 h-full rounded-full transition-all duration-150"
                    style={{ width: `${pct}%`, background: `linear-gradient(to right, #fb923c, ${accent})` }}
                />
                <input
                    type="range"
                    min={min} max={max} step={step} value={value}
                    onChange={e => onChange(step < 1 ? parseFloat(e.target.value) : parseInt(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {/* Thumb indicator */}
                <div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 shadow-md pointer-events-none transition-all duration-150"
                    style={{ left: `calc(${pct}% - 8px)`, borderColor: accent }}
                />
            </div>
            <div className="flex justify-between mt-1 text-[9px] text-slate-400">
                <span>{min}{step < 1 ? '%' : ''}</span>
                <span>{max}{step < 1 ? '%' : ''}</span>
            </div>
        </div>
    );
};

/* ── Cell color helper ──────────────────────────────────────────────── */
const getCellColor = (v) => {
    if (v === 0)   return 'bg-emerald-50 dark:bg-emerald-900/10';
    if (v < 0.3)   return 'bg-yellow-200 dark:bg-yellow-800/40';
    if (v < 0.6)   return 'bg-orange-400 dark:bg-orange-600';
    return 'bg-rose-600 dark:bg-rose-700';
};

/* ═══════════════════════════════════════════════════════════════════ */
const DiseaseSpreadSimulator = () => {
    const [activeTab, setActiveTab] = useState('simulate');
    const [loading, setLoading]     = useState(false);
    const [results, setResults]     = useState(null);
    const [history, setHistory]     = useState([]);

    const [formData, setFormData] = useState({
        cropName:    'Rice',
        diseaseName: 'Rice Blast',
        farmSize:    10,
        severity:    0.3,
        state:       'Tamil Nadu',
        district:    '',
        confidence:  0.85,
    });

    useEffect(() => {
        if (activeTab === 'history') fetchHistory();
    }, [activeTab]);

    const fetchHistory = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/history`);
            if (res.data.success) setHistory(res.data.history);
        } catch (e) { console.error('History fetch error', e); }
    };

    const handleSimulate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/predict`, formData);
            if (res.data.success) setResults(res.data.data);
        } catch (e) {
            console.error('Simulation error', e);
            alert('Simulation failed');
        } finally {
            setLoading(false);
        }
    };

    const set = (key) => (val) => setFormData(f => ({ ...f, [key]: val }));

    return (
        <div className="max-w-7xl mx-auto px-4 pb-12 min-h-screen">

            {/* ── Hero ─────────────────────────────────────────── */}
            <div className="relative overflow-hidden rounded-2xl mt-4 mb-5 px-6 py-7
                bg-gradient-to-br from-rose-600 via-orange-500 to-amber-500">
                {/* grid overlay */}
                <div className="absolute inset-0 opacity-10"
                    style={{backgroundImage:`url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3Ccircle cx='13' cy='13' r='1'/%3E%3C/g%3E%3C/svg%3E")`}}/>
                <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"/>

                <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                            <Activity className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">
                                Outbreak <span className="text-rose-200">Radar</span>
                            </h1>
                            <p className="text-[12px] text-white/70 mt-0.5 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"/>
                                Research-Grade Disease Propagation Model
                            </p>
                        </div>
                    </div>

                    {/* Toggle Tabs */}
                    <div className="flex items-center gap-1 p-1 bg-white/15 backdrop-blur-sm rounded-xl border border-white/20">
                        {[
                            { id: 'simulate', label: 'Simulate',  icon: Map     },
                            { id: 'history',  label: 'History',   icon: History },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={clsx(
                                    "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200",
                                    activeTab === tab.id
                                        ? "bg-white text-rose-600 shadow-sm"
                                        : "text-white/70 hover:text-white hover:bg-white/10"
                                )}
                            >
                                <tab.icon className="w-3.5 h-3.5" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Simulate Tab ─────────────────────────────────── */}
            {activeTab === 'simulate' ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                    {/* ── Left Panel ────────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-4"
                    >
                        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-white/60 dark:border-slate-700/60 shadow-lg p-5 space-y-5">

                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-rose-50 dark:bg-rose-900/30 rounded-lg text-rose-600 dark:text-rose-400">
                                    <Shield className="w-4 h-4" />
                                </div>
                                <h3 className="text-[14px] font-semibold text-slate-800 dark:text-white">Simulation Parameters</h3>
                            </div>

                            <form onSubmit={handleSimulate} className="space-y-5">

                                {/* Target Analysis */}
                                <div>
                                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Target Analysis</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[10px] text-slate-400 mb-1 block">Crop</label>
                                            <select
                                                value={formData.cropName}
                                                onChange={e => setFormData(f => ({ ...f, cropName: e.target.value }))}
                                                className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-[13px] text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                                            >
                                                {cropOptions.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-slate-400 mb-1 block">Disease</label>
                                            <select
                                                value={formData.diseaseName}
                                                onChange={e => setFormData(f => ({ ...f, diseaseName: e.target.value }))}
                                                className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-[13px] text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/30 truncate"
                                            >
                                                {diseaseOptions.map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Geographic Scope */}
                                <div>
                                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Geographic Scope</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[10px] text-slate-400 mb-1 block">State</label>
                                            <select
                                                value={formData.state}
                                                onChange={e => setFormData(f => ({ ...f, state: e.target.value }))}
                                                className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-[13px] text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                                            >
                                                {states.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-slate-400 mb-1 block">District</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Madurai"
                                                value={formData.district}
                                                onChange={e => setFormData(f => ({ ...f, district: e.target.value }))}
                                                className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-[13px] text-slate-700 dark:text-slate-200 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Sliders */}
                                <div className="space-y-4 pt-3 border-t border-dashed border-slate-200 dark:border-slate-700">
                                    <Slider
                                        label="Farm Coverage"
                                        min={1} max={100} step={1}
                                        value={formData.farmSize}
                                        onChange={set('farmSize')}
                                        format={v => `${v} Acres`}
                                        accent="#f43f5e"
                                    />
                                    <Slider
                                        label="Initial Viral Load"
                                        min={0} max={1} step={0.1}
                                        value={formData.severity}
                                        onChange={set('severity')}
                                        format={v => `${(v * 100).toFixed(0)}%`}
                                        accent="#f43f5e"
                                        warn={formData.severity > 0.6}
                                    />
                                    <Slider
                                        label="Model Confidence"
                                        min={0} max={1} step={0.01}
                                        value={formData.confidence}
                                        onChange={set('confidence')}
                                        format={v => `${(v * 100).toFixed(0)}%`}
                                        accent="#6366f1"
                                    />
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-10 bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-500 hover:to-orange-400
                                        text-white rounded-xl font-semibold text-[13px] tracking-wide
                                        shadow-md shadow-rose-500/30 hover:shadow-lg hover:shadow-rose-500/40
                                        hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200
                                        flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading
                                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Running Radar…</>
                                        : <><Activity className="w-4 h-4" /> Run Simulation</>
                                    }
                                </button>
                            </form>
                        </div>
                    </motion.div>

                    {/* ── Right Panel ───────────────────────────── */}
                    <div className="lg:col-span-8">
                        <AnimatePresence mode="wait">

                            {/* Results */}
                            {results ? (
                                <motion.div
                                    key="results"
                                    initial={{ opacity: 0, x: 16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-4"
                                >
                                    {/* Risk + Mutation cards */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {/* 7-Day */}
                                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">7-Day Spread Risk</p>
                                            <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-rose-500 to-orange-500 mb-2">
                                                {results.risk7}%
                                            </p>
                                            <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${results.risk7}%` }}
                                                    transition={{ duration: 0.8 }}
                                                    className="h-full bg-gradient-to-r from-rose-500 to-orange-400 rounded-full"
                                                />
                                            </div>
                                        </div>

                                        {/* 14-Day */}
                                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">14-Day Spread Risk</p>
                                            <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-orange-500 to-amber-400 mb-2">
                                                {results.risk14}%
                                            </p>
                                            <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${results.risk14}%` }}
                                                    transition={{ duration: 0.8, delay: 0.1 }}
                                                    className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
                                                />
                                            </div>
                                        </div>

                                        {/* Mutation Index */}
                                        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-xl p-4 text-white relative overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                                            <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/20 rounded-full blur-2xl"/>
                                            <p className="text-[10px] font-semibold text-indigo-300 uppercase tracking-wider mb-2">Mutation Index</p>
                                            <p className="text-3xl font-bold text-white mb-1">{results.mutationRisk}<span className="text-sm text-slate-400 font-normal">/100</span></p>
                                            <span className={clsx(
                                                "inline-block text-[11px] font-bold px-2 py-0.5 rounded-full border",
                                                results.mutationRisk > 70
                                                    ? "border-rose-500 bg-rose-500/20 text-rose-400"
                                                    : "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                                            )}>
                                                {results.mutationRisk > 70 ? 'HIGH RISK' : 'LOW RISK'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Heatmap + Analysis */}
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                        {/* Heatmap */}
                                        <div className="md:col-span-7 bg-slate-900 rounded-xl p-3 shadow-xl border border-slate-800">
                                            <div className="bg-slate-800 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1.5 bg-rose-500/20 rounded-lg">
                                                            <Map className="w-3.5 h-3.5 text-rose-500" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[13px] font-semibold text-white">Live Grid Projection</p>
                                                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Day 14 Estimate</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1.5">
                                                        {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-600"/>)}
                                                    </div>
                                                </div>

                                                <div className="aspect-square w-full bg-slate-900 rounded-lg p-1
                                                    grid grid-cols-[repeat(20,minmax(0,1fr))] gap-[1px] overflow-hidden">
                                                    {results.heatmap.map((row, i) =>
                                                        row.map((cell, j) => (
                                                            <motion.div
                                                                key={`${i}-${j}`}
                                                                initial={{ scale: 0, opacity: 0 }}
                                                                animate={{ scale: 1, opacity: 1 }}
                                                                transition={{ delay: (i + j) * 0.001 }}
                                                                className={`w-full h-full rounded-[1px] ${getCellColor(cell)}`}
                                                                title={`Risk: ${(cell * 100).toFixed(0)}%`}
                                                            />
                                                        ))
                                                    )}
                                                </div>

                                                <div className="mt-3 flex items-center justify-center gap-3">
                                                    <div className="h-1.5 w-28 bg-gradient-to-r from-emerald-100 via-orange-400 to-rose-600 rounded-full"/>
                                                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Risk Gradient</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* AI Assessment + Weather */}
                                        <div className="md:col-span-5 space-y-4">
                                            {/* AI Card */}
                                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 relative overflow-hidden">
                                                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"/>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="p-1.5 bg-indigo-500 rounded-lg text-white">
                                                        <Info className="w-3.5 h-3.5" />
                                                    </div>
                                                    <h4 className="text-[13px] font-semibold text-slate-800 dark:text-white">AI Assessment</h4>
                                                    <span className={clsx(
                                                        "ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full",
                                                        results.aiResult?.status === 'Diseased' ? "bg-rose-100 text-rose-700" :
                                                        results.aiResult?.status === 'Warning'  ? "bg-amber-100 text-amber-700" :
                                                                                                  "bg-emerald-100 text-emerald-700"
                                                    )}>
                                                        {results.aiResult?.status || 'Active'}
                                                    </span>
                                                </div>
                                                <p className="text-[12px] text-slate-600 dark:text-slate-300 leading-relaxed italic border-l-2 border-indigo-400 pl-3 py-1 bg-indigo-50/50 dark:bg-slate-900/50 rounded-r-lg mb-3">
                                                    "{results.aiResult?.message}"
                                                </p>
                                                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                                                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                                                        <Zap className="w-3 h-3 text-amber-500" /> Recommendation
                                                    </p>
                                                    <p className="text-[12px] text-slate-700 dark:text-slate-200 font-medium">{results.aiResult?.advice}</p>
                                                </div>
                                            </div>

                                            {/* Weather Grid */}
                                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
                                                <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Ambient Conditions</h4>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {[
                                                        { icon: Thermometer, val: `${results.weather.temp.toFixed(1)}°C`, label: 'Temp',     color: 'text-rose-500'  },
                                                        { icon: Droplets,    val: `${results.weather.humidity.toFixed(0)}%`, label: 'Humidity', color: 'text-sky-500'   },
                                                        { icon: Wind,        val: `${results.weather.wind.toFixed(1)}`,    label: 'Wind km/h', color: 'text-indigo-500'},
                                                    ].map(w => (
                                                        <div key={w.label} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2.5 text-center">
                                                            <w.icon className={`w-4 h-4 ${w.color} mx-auto mb-1`} />
                                                            <p className="text-[13px] font-bold text-slate-700 dark:text-white">{w.val}</p>
                                                            <p className="text-[9px] text-slate-400 uppercase tracking-wide">{w.label}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                /* ── Empty / Ready State ─────────────────── */
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="h-full min-h-[460px] bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col"
                                >
                                    {/* Header bar */}
                                    <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-[13px] font-medium text-slate-600 dark:text-slate-300">
                                            <Map className="w-4 h-4 text-rose-400" />
                                            Radar Projection
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[11px] text-slate-300 dark:text-slate-600">
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700"/>
                                            Standby
                                        </div>
                                    </div>

                                    {/* Guide content */}
                                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                                        <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/20 rounded-2xl flex items-center justify-center mb-5">
                                            <Activity className="w-8 h-8 text-rose-300 dark:text-rose-600" />
                                        </div>
                                        <h3 className="text-[16px] font-semibold text-slate-500 dark:text-slate-400 mb-2">Simulation Ready</h3>
                                        <p className="text-[13px] text-slate-400 max-w-xs leading-relaxed mb-8">
                                            Configure propagation parameters on the left to generate a research-grade visual outbreak projection.
                                        </p>

                                        {/* Step guide */}
                                        <div className="grid grid-cols-3 gap-3 w-full max-w-sm text-left">
                                            {[
                                                { step: '01', label: 'Select Target',    sub: 'Crop + disease' },
                                                { step: '02', label: 'Set Scope',        sub: 'Location + area' },
                                                { step: '03', label: 'Run Radar',        sub: 'Get heatmap' },
                                            ].map(s => (
                                                <div key={s.step} className="bg-slate-50 dark:bg-slate-700/40 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
                                                    <p className="text-[10px] font-bold text-rose-400 mb-1">{s.step}</p>
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

            ) : (
                /* ── History Tab ─────────────────────────────────── */
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {history.length === 0 ? (
                        <div className="py-24 flex flex-col items-center justify-center text-center text-slate-400">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl mb-4 border border-slate-100 dark:border-slate-700">
                                <History className="w-8 h-8 text-slate-300" />
                            </div>
                            <p className="text-[14px] font-medium">No History Available</p>
                            <p className="text-[12px] mt-1 text-slate-300">Run a simulation to archive it here.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {history.map(record => (
                                <motion.div
                                    key={record.id}
                                    initial={{ opacity: 0, scale: 0.97 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
                                >
                                    {/* accent bar */}
                                    <div className="h-1 bg-gradient-to-r from-rose-500 to-orange-400"/>
                                    <div className="p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <div className="flex items-center gap-1.5 mb-0.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"/>
                                                    <h4 className="text-[14px] font-semibold text-slate-800 dark:text-white">{record.disease_name}</h4>
                                                </div>
                                                <p className="text-[11px] text-slate-400 pl-3">{record.crop_name} · {record.location}</p>
                                            </div>
                                            <span className="text-[10px] text-slate-400 flex items-center gap-1 bg-slate-50 dark:bg-slate-700/50 px-2 py-1 rounded-full">
                                                <Calendar className="w-3 h-3"/>
                                                {new Date(record.created_at).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mb-3">
                                            <div className="bg-rose-50 dark:bg-rose-900/20 rounded-lg p-2.5">
                                                <p className="text-[10px] text-rose-500 dark:text-rose-400 mb-0.5">7-Day Risk</p>
                                                <p className="text-[15px] font-bold text-rose-600">{record.risk_7_days.toFixed(0)}%</p>
                                            </div>
                                            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-2.5">
                                                <p className="text-[10px] text-indigo-500 dark:text-indigo-400 mb-0.5">Mutation Score</p>
                                                <p className="text-[15px] font-bold text-indigo-600">{record.mutation_risk_score}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-700 pt-3">
                                            <Wind className="w-3 h-3" />
                                            Wind: <span className="font-semibold text-slate-600 dark:text-slate-300">
                                                {JSON.parse(record.input_params).weather.wind.toFixed(1)} km/h
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
};

export default DiseaseSpreadSimulator;
