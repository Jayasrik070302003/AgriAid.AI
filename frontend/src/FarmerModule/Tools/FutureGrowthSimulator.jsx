import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload, Zap, AlertTriangle, CheckCircle, TrendingUp,
    Calendar, Loader2, Info, History, Sprout, BarChart3,
    ChevronRight, RefreshCcw, FlaskConical
} from 'lucide-react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import clsx from 'clsx';

const API_BASE_URL = 'http://localhost:3001/api/farmer/future-growth';

const cropOptions = ['Rice', 'Wheat', 'Corn', 'Tomato', 'Potato', 'Cotton', 'Sugarcane', 'Tea'];
const soilOptions = ['Alluvial', 'Red Soil', 'Black Soil', 'Laterite', 'Desert Soil', 'Loamy'];
const states = ['Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'Maharashtra', 'Punjab', 'Uttar Pradesh'];

const FutureGrowthSimulator = () => {
    const [activeTab, setActiveTab] = useState('simulate');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [history, setHistory] = useState([]);
    const [mismatch, setMismatch] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [formData, setFormData] = useState({
        cropName: 'Rice',
        state: 'Tamil Nadu',
        district: '',
        soilType: 'Alluvial',
        sowingDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (activeTab === 'history') fetchHistory();
    }, [activeTab]);

    const fetchHistory = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/history`);
            if (res.data.success) setHistory(res.data.history);
        } catch (error) {
            console.error('Failed to fetch history:', error);
        }
    };

    const handleImageChange = (file) => {
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) handleImageChange(file);
    };

    const handleSimulate = async (e) => {
        e.preventDefault();
        if (!image) { alert('Please upload a plant image!'); return; }
        setMismatch(null);
        setResults(null);
        setLoading(true);
        const data = new FormData();
        data.append('image', image);
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        try {
            const res = await axios.post(`${API_BASE_URL}/simulate`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                setResults(res.data.data);
                setMismatch(null);
            } else if (res.data.isMismatch) {
                setMismatch(res.data.message);
                setResults(null);
            }
        } catch (error) {
            console.error('Simulation failed:', error);
            alert('Simulation failed. Check console for details.');
        } finally {
            setLoading(false);
        }
    };

    // ── Status helpers ──────────────────────────────────────────
    const statusConfig = {
        Healthy:  { icon: CheckCircle,    bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-100', badge: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
        Uncertain:{ icon: Info,            bg: 'bg-amber-50 dark:bg-amber-950/30',   border: 'border-amber-100',   badge: 'bg-amber-500',   text: 'text-amber-700 dark:text-amber-400',   dot: 'bg-amber-500'   },
        Diseased: { icon: AlertTriangle,   bg: 'bg-rose-50 dark:bg-rose-950/30',     border: 'border-rose-100',    badge: 'bg-rose-500',    text: 'text-rose-700 dark:text-rose-400',     dot: 'bg-rose-500'    },
    };
    const riskConfig = {
        High:   { color: 'text-rose-600 dark:text-rose-400',    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400' },
        Medium: { color: 'text-amber-600 dark:text-amber-400',  badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' },
        Low:    { color: 'text-emerald-600 dark:text-emerald-400', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' },
    };

    return (
        <div className="max-w-7xl mx-auto px-4 pb-12 min-h-screen">

            {/* ── Hero ─────────────────────────────────────────── */}
            <div className="relative overflow-hidden rounded-2xl mt-4 mb-5 px-6 py-7
                bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600">
                <div className="absolute inset-0 opacity-10"
                    style={{backgroundImage:`url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`}}/>
                <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"/>

                <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                            <TrendingUp className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">
                                Growth <span className="text-violet-200">Simulator</span>
                            </h1>
                            <p className="text-[12px] text-white/70 mt-0.5 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
                                AI-Powered 90-Day Yield Trajectory
                            </p>
                        </div>
                    </div>

                    {/* Toggle Tabs */}
                    <div className="flex items-center gap-1 p-1 bg-white/15 backdrop-blur-sm rounded-xl border border-white/20">
                        {[
                            { id: 'simulate', label: 'New Simulation', icon: Zap },
                            { id: 'history',  label: 'History',        icon: History },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={clsx(
                                    "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200",
                                    activeTab === tab.id
                                        ? "bg-white text-indigo-700 shadow-sm"
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

            {/* ── Simulate Tab ────────────────────────────────── */}
            {activeTab === 'simulate' ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                    {/* ── Left Panel ─────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-4"
                    >
                        {/* Glassmorphism card */}
                        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-white/60 dark:border-slate-700/60 shadow-lg p-5 space-y-5">

                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                                    <Upload className="w-4 h-4" />
                                </div>
                                <h3 className="text-[14px] font-semibold text-slate-800 dark:text-white">Crop Parameters</h3>
                            </div>

                            {/* ── Upload Box ───────────────────── */}
                            <div
                                className={clsx(
                                    "relative group rounded-xl border-2 border-dashed transition-all duration-200 overflow-hidden",
                                    isDragging
                                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 scale-[1.01]"
                                        : preview
                                            ? "border-indigo-400 bg-indigo-50/30 dark:bg-indigo-900/10"
                                            : "border-slate-200 dark:border-slate-600 hover:border-indigo-400 hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10"
                                )}
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={handleDrop}
                            >
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageChange(e.target.files[0])}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                />
                                <div className="aspect-[16/9] flex flex-col items-center justify-center">
                                    {preview ? (
                                        <>
                                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                <span className="text-white text-[13px] font-medium bg-black/50 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                                                    Change Image
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center text-center p-4">
                                            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
                                                <Upload className="w-5 h-5 text-indigo-500" />
                                            </div>
                                            <p className="text-[13px] font-medium text-slate-700 dark:text-slate-200">Upload Plant Image</p>
                                            <p className="text-[11px] text-slate-400 mt-0.5">Drag & drop or click to browse</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ── Form ─────────────────────────── */}
                            <form onSubmit={handleSimulate} className="space-y-4">
                                {/* Crop Type grid */}
                                <div>
                                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Crop Type</label>
                                    <div className="grid grid-cols-4 gap-1.5">
                                        {cropOptions.map(c => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, cropName: c })}
                                                className={clsx(
                                                    "py-1.5 px-1 rounded-lg text-[11px] font-medium border transition-all duration-150",
                                                    formData.cropName === c
                                                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/30"
                                                        : "bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-indigo-300"
                                                )}
                                            >
                                                {c}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* State + District */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">State</label>
                                        <select
                                            value={formData.state}
                                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                            className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-[13px] text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                                        >
                                            {states.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">District</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Coimbatore"
                                            value={formData.district}
                                            onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                            className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-[13px] text-slate-700 dark:text-slate-200 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                                        />
                                    </div>
                                </div>

                                {/* Soil + Sowing */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Soil Type</label>
                                        <select
                                            value={formData.soilType}
                                            onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                                            className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-[13px] text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                                        >
                                            {soilOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Sowing Date</label>
                                        <input
                                            type="date"
                                            value={formData.sowingDate}
                                            onChange={(e) => setFormData({ ...formData, sowingDate: e.target.value })}
                                            className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-[13px] text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                                        />
                                    </div>
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-10 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500
                                        text-white rounded-xl font-semibold text-[13px] tracking-wide
                                        shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/30
                                        hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200
                                        flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading
                                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Simulating…</>
                                        : <><Zap className="w-4 h-4" /> Run Simulation</>
                                    }
                                </button>
                            </form>
                        </div>
                    </motion.div>

                    {/* ── Right Panel ────────────────────────── */}
                    <div className="lg:col-span-8">
                        <AnimatePresence mode="wait">

                            {/* Results */}
                            {results && (
                                <motion.div
                                    key="results"
                                    initial={{ opacity: 0, x: 16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-4"
                                >
                                    {/* Top Stat Cards */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {/* Status */}
                                        {(() => {
                                            const cfg = statusConfig[results.status] || statusConfig.Diseased;
                                            const Icon = cfg.icon;
                                            return (
                                                <div className={`${cfg.bg} border ${cfg.border} dark:border-slate-700 rounded-xl p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}>
                                                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Diagnostic Status</p>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className={`p-1.5 ${cfg.badge} rounded-lg text-white`}>
                                                            <Icon className="w-4 h-4" />
                                                        </div>
                                                        <span className={`text-[14px] font-bold ${cfg.text}`}>
                                                            {results.status === 'Healthy' ? 'Healthy Crop'
                                                                : results.status === 'Uncertain' ? 'Uncertain'
                                                                : (results.disease || '').replace(/_/g, ' ')}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                                                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`}/>
                                                        {results.status === 'Uncertain' ? 'Low Confidence' : `${results.confidence}% Confidence`}
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        {/* Yield Prediction */}
                                        <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800/40 rounded-xl p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                                            <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider mb-2">Projected Yield</p>
                                            <p className="text-2xl font-bold text-indigo-900 dark:text-white mb-1">{results.yieldPrediction}</p>
                                            <div className="flex items-center gap-1.5 text-[11px] text-indigo-500">
                                                <TrendingUp className="w-3 h-3" />
                                                Based on current trajectory
                                            </div>
                                        </div>

                                        {/* Risk Level */}
                                        {(() => {
                                            const rcfg = riskConfig[results.riskLevel] || riskConfig.Low;
                                            return (
                                                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                                                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Risk Assessment</p>
                                                    <p className={`text-2xl font-bold mb-1 ${rcfg.color}`}>{results.riskLevel}</p>
                                                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                                        <Calendar className="w-3 h-3" />
                                                        Next 90 days forecast
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    {/* Growth Chart */}
                                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
                                        <h4 className="text-[14px] font-semibold text-slate-800 dark:text-white mb-4">Growth Trajectory — 90 Days</h4>
                                        <div style={{ width: '100%', height: 240 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={results.chartData}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 100]} />
                                                    <Tooltip
                                                        contentStyle={{ borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,.08)', fontSize: 12 }}
                                                        cursor={{ stroke: '#6366f1', strokeWidth: 1 }}
                                                    />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="health"
                                                        stroke="#6366f1"
                                                        strokeWidth={2.5}
                                                        dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#6366f1' }}
                                                        activeDot={{ r: 6, strokeWidth: 0, fill: '#6366f1' }}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* AI Advice */}
                                    <div className="bg-gradient-to-br from-slate-50 to-indigo-50/50 dark:from-slate-800 dark:to-slate-800/80 rounded-xl border border-indigo-100 dark:border-slate-700 p-5">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="p-1.5 bg-indigo-500 text-white rounded-lg">
                                                <Zap className="w-3.5 h-3.5" />
                                            </div>
                                            <h4 className="text-[14px] font-semibold text-slate-800 dark:text-white">AI Farming Consultant</h4>
                                        </div>
                                        <div className="prose prose-sm prose-slate dark:prose-invert prose-p:text-[13px] prose-p:leading-relaxed prose-strong:text-indigo-600 max-w-none">
                                            <ReactMarkdown>{results.advice}</ReactMarkdown>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Mismatch State */}
                            {!results && mismatch && (
                                <motion.div
                                    key="mismatch"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="h-full min-h-[380px] flex flex-col items-center justify-center text-center p-8 bg-rose-50 dark:bg-rose-950/20 rounded-xl border-2 border-dashed border-rose-200 dark:border-rose-900/50"
                                >
                                    <div className="w-14 h-14 bg-rose-100 dark:bg-rose-900/50 rounded-xl flex items-center justify-center mb-4 shadow-sm shadow-rose-500/20">
                                        <AlertTriangle className="w-7 h-7 text-rose-500" />
                                    </div>
                                    <h3 className="text-[16px] font-bold text-rose-700 dark:text-rose-400 mb-2">Image Mismatch Detected</h3>
                                    <p className="text-[13px] text-rose-600/80 dark:text-rose-400/80 max-w-sm leading-relaxed">{mismatch}</p>
                                    <button
                                        onClick={() => setMismatch(null)}
                                        className="mt-6 px-5 py-2 bg-rose-500 text-white rounded-lg text-[13px] font-medium hover:bg-rose-600 transition-colors shadow-sm"
                                    >
                                        Try Again
                                    </button>
                                </motion.div>
                            )}

                            {/* Empty / Ready State */}
                            {!results && !mismatch && (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="h-full min-h-[460px] bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col"
                                >
                                    {/* Placeholder header */}
                                    <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-[13px] font-medium text-slate-600 dark:text-slate-300">
                                            <BarChart3 className="w-4 h-4 text-indigo-400" />
                                            Simulation Preview
                                        </div>
                                        <span className="text-[11px] text-slate-300 dark:text-slate-600">Awaiting input</span>
                                    </div>

                                    {/* Steps guide */}
                                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                                        <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-5">
                                            <TrendingUp className="w-8 h-8 text-indigo-400" />
                                        </div>
                                        <h3 className="text-[16px] font-semibold text-slate-500 dark:text-slate-400 mb-2">Ready to Visualize</h3>
                                        <p className="text-[13px] text-slate-400 max-w-xs leading-relaxed mb-8">
                                            Upload your crop image and fill in the parameters to generate a 90-day growth forecast.
                                        </p>

                                        <div className="grid grid-cols-3 gap-3 w-full max-w-sm text-left">
                                            {[
                                                { step: '01', label: 'Upload Image', sub: 'Plant photo' },
                                                { step: '02', label: 'Set Parameters', sub: 'Crop, soil, state' },
                                                { step: '03', label: 'Run Simulation', sub: 'Get AI forecast' },
                                            ].map(s => (
                                                <div key={s.step} className="bg-slate-50 dark:bg-slate-700/40 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
                                                    <p className="text-[10px] font-bold text-indigo-400 mb-1">{s.step}</p>
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
                /* ── History Tab ───────────────────────────────── */
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {history.length === 0 ? (
                        <div className="py-24 flex flex-col items-center justify-center text-center text-slate-400">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl mb-4 border border-slate-100 dark:border-slate-700">
                                <History className="w-8 h-8 text-slate-300" />
                            </div>
                            <p className="text-[14px] font-medium">No History Found</p>
                            <p className="text-[12px] mt-1 text-slate-300">Run a simulation to see it archived here.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {history.map((record) => {
                                const res = JSON.parse(record.simulation_results);
                                const rcfg = riskConfig[res.riskLevel] || riskConfig.Low;
                                return (
                                    <motion.div
                                        key={record.id}
                                        initial={{ opacity: 0, scale: 0.97 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
                                    >
                                        {/* Thumbnail */}
                                        <div className="aspect-video bg-slate-100 dark:bg-slate-700 overflow-hidden">
                                            <img
                                                src={`http://localhost:3001/${record.image_path}`}
                                                alt="Crop"
                                                className="w-full h-full object-cover"
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                        </div>

                                        <div className="p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-[14px] font-semibold text-slate-900 dark:text-white">{record.crop_name}</h4>
                                                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${rcfg.badge}`}>
                                                    {res.riskLevel} Risk
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-slate-400 mb-3 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {format(new Date(record.created_at), 'PP')}
                                            </p>

                                            <div className="grid grid-cols-2 gap-2 mb-3">
                                                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2.5">
                                                    <p className="text-[10px] text-slate-400 mb-0.5">Yield</p>
                                                    <p className="text-[13px] font-bold text-slate-700 dark:text-slate-200">{res.yieldPred || res.yieldPrediction}</p>
                                                </div>
                                                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2.5">
                                                    <p className="text-[10px] text-slate-400 mb-0.5">Health (90d)</p>
                                                    <p className="text-[13px] font-bold text-indigo-600">{res.futureHealth[2]}%</p>
                                                </div>
                                            </div>

                                            <p className="text-[11px] text-slate-400 italic line-clamp-2 border-t border-slate-100 dark:border-slate-700 pt-3">
                                                "{record.explanation?.substring(0, 90)}…"
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
};

export default FutureGrowthSimulator;
