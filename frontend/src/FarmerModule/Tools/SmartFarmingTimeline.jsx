import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, Sprout, Clock, ArrowRight,
    CheckCircle2, AlertTriangle,
    Zap, Layout, ShieldAlert,
    FlaskConical, MapPin, Gauge, TrendingUp,
    Sun, Droplets, Info
} from 'lucide-react';
import clsx from 'clsx';
import { useLanguage } from '../../Context/LanguageContext';

const SmartFarmingTimeline = () => {
    const { t } = useLanguage();
    const [activeStep, setActiveStep] = useState(1);
    const [formData, setFormData] = useState({
        crop: 'Sugarcane',
        date: '2025-10-21',
        state: 'Tamil Nadu',
        district: 'Chennai'
    });

    const steps = [
        { id: 1, title: 'LAND PREPARATION' },
        { id: 2, title: 'VEGETATIVE PHASE' },
        { id: 3, title: 'REPRODUCTIVE PHASE' },
        { id: 4, title: 'MATURITY & HARVEST' }
    ];

    const crops = ['Sugarcane', 'Rice', 'Wheat', 'Corn', 'Tomato', 'Cotton'];
    const states = ['Tamil Nadu', 'Maharashtra', 'Karnataka', 'Punjab', 'Uttar Pradesh'];
    const districts = ['Chennai', 'Coimbatore', 'Madurai', 'Pune', 'Nagpur', 'Ludhiana'];

    return (
        <div className="w-full max-w-[1600px] mx-auto p-4 md:p-6 pb-24 relative min-h-screen font-sans selection:bg-emerald-500/30">
            
            {/* ── HERO SECTION ─────────────────────────────────── */}
            <div className="text-center mb-10 mt-4">
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800/50 mb-3"
                >
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                        Dynamic Precision Scheduler
                    </span>
                </motion.div>
                
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-3">
                    <span className="text-emerald-500">Smart Farming</span> Timeline
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm max-w-2xl mx-auto">
                    Region-aware, ML-optimized crop lifecycle tracking with real-time advisories.
                </p>
            </div>

            {/* ── MAIN 3-ZONE LAYOUT ───────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* ZONE 1: DEPLOYMENT PARAMS (LEFT) */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-3 space-y-6"
                >
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 dark:border-slate-800 relative overflow-hidden group hover:shadow-xl transition-all duration-500">
                        <div className="flex items-center gap-2 mb-8 px-1">
                            <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                                <Gauge className="w-4 h-4 text-emerald-500" />
                            </div>
                            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                {t('timeline_deployment_params')}
                            </h3>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Select Crop</label>
                                <select 
                                    value={formData.crop}
                                    onChange={(e) => setFormData({...formData, crop: e.target.value})}
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer dark:text-white"
                                >
                                    {crops.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Sowing Date</label>
                                <div className="relative group">
                                    <input 
                                        type="date" 
                                        value={formData.date}
                                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all cursor-pointer dark:text-white"
                                    />
                                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">State</label>
                                    <select 
                                        value={formData.state}
                                        onChange={(e) => setFormData({...formData, state: e.target.value})}
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-3 text-[11px] font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all dark:text-white"
                                    >
                                        {states.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">District</label>
                                    <select 
                                        value={formData.district}
                                        onChange={(e) => setFormData({...formData, district: e.target.value})}
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-3 text-[11px] font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all dark:text-white"
                                    >
                                        {districts.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Left Bottom Stats */}
                    <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl shadow-slate-900/20">
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Yield Confidence</span>
                                <span className="text-xl font-black text-emerald-400">85%</span>
                            </div>
                            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: '85%' }}
                                    className="h-full bg-emerald-500 rounded-full"
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Water Intensity</span>
                                <span className="text-sm font-bold text-blue-400">High</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ZONE 2: CENTER CONTENT (TIMELINE) */}
                <div className="lg:col-span-6 space-y-6">
                    
                    {/* Progress Pills */}
                    <div className="flex flex-wrap md:flex-nowrap gap-2">
                        {steps.map((step) => (
                            <button
                                key={step.id}
                                onClick={() => setActiveStep(step.id)}
                                className={clsx(
                                    "flex-1 flex items-center justify-center gap-3 px-4 py-4 rounded-2xl text-[10px] font-black transition-all duration-300 relative overflow-hidden group",
                                    activeStep === step.id
                                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 ring-1 ring-emerald-400/50"
                                        : "bg-white dark:bg-slate-900 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 border border-slate-100 dark:border-slate-800 hover:border-emerald-500/30"
                                )}
                            >
                                <div className={clsx(
                                    "w-5 h-5 rounded-full flex items-center justify-center text-[8px] border-2 transition-all duration-300",
                                    activeStep === step.id ? "bg-white/20 border-white/40" : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                )}>
                                    {step.id}
                                </div>
                                <span className="whitespace-nowrap tracking-wider">{step.title}</span>
                                {activeStep === step.id && (
                                    <motion.div 
                                        layoutId="active-pill-shimmer"
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Detailed Content Card */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeStep}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-[0_8px_40px_rgba(0,0,0,0.03)] border border-slate-200/50 dark:border-slate-800 relative group"
                        >
                            <div className="flex justify-between items-start mb-10">
                                <div className="space-y-4">
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active Phase</span>
                                    </div>
                                    <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">
                                        {steps[activeStep-1].title.toLowerCase().split(' ').map(s => s.charAt(0).toUpperCase() + s.substring(1)).join(' ')}
                                    </h2>
                                </div>
                                <div className="flex flex-col items-end gap-1 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 tracking-tight">21 OCT — 01 NOV 2025</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* Advisory Block: Weather */}
                                <div className="p-6 bg-orange-50/40 dark:bg-orange-900/10 rounded-[1.8rem] border border-orange-100/50 dark:border-orange-900/20 group/advisory hover:shadow-lg transition-all">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-orange-500 transform group-hover/advisory:rotate-12 transition-transform">
                                            <Sun className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] mb-2">Weather Adjustment</h4>
                                            <p className="text-sm font-semibold text-orange-800/80 dark:text-orange-400 leading-relaxed italic">
                                                "General favorable conditions predicted. Monitor soil moisture daily."
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Advisory Block: Irrigation */}
                                <div className="p-6 bg-blue-50/40 dark:bg-blue-900/10 rounded-[1.8rem] border border-blue-100/50 dark:border-blue-900/20 group/advisory hover:shadow-lg transition-all">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-blue-500 transform group-hover/advisory:rotate-12 transition-transform">
                                            <Droplets className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2">Irrigation Advisory</h4>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-blue-800 dark:text-blue-400">Initial moisture check</span>
                                                <div className="h-1 w-20 bg-blue-200 dark:bg-blue-900 rounded-full" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Center Panel Bottom Action */}
                            <div className="mt-10 flex items-center justify-between p-1 bg-slate-50 dark:bg-slate-800/30 rounded-2xl">
                                <div className="flex items-center gap-3 pl-4">
                                    <Info className="w-4 h-4 text-slate-400" />
                                    <span className="text-[11px] font-bold text-slate-500">Detailed soil report available</span>
                                </div>
                                <button className="px-6 py-3 bg-white dark:bg-slate-800 rounded-xl text-[11px] font-black text-slate-700 dark:text-white shadow-sm hover:shadow-md transition-all active:scale-95 border border-slate-100 dark:border-slate-700">
                                    View Full Guide
                                </button>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* ZONE 3: INSIGHTS & ALERTS (RIGHT) */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-3 space-y-4"
                >
                    {/* Pathogen Alert */}
                    <div className="bg-rose-50 dark:bg-rose-950/20 rounded-[2rem] p-6 border border-rose-100 dark:border-rose-900/30 relative overflow-hidden group hover:shadow-xl hover:shadow-rose-500/10 transition-all duration-500">
                        <div className="flex items-center gap-2 mb-6 text-rose-600">
                            <ShieldAlert className="w-4 h-4" />
                            <h3 className="text-[10px] font-black uppercase tracking-widest">{t('timeline_pathogen_alert')}</h3>
                        </div>
                        <h4 className="text-lg font-black text-rose-900 dark:text-rose-100 mb-6 tracking-tight leading-tight">
                            Critical Risk: Soil treatment
                        </h4>
                        <div className="flex gap-2">
                            <span className="px-3 py-1.5 bg-rose-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest">Low Risk</span>
                            <span className="px-3 py-1.5 bg-white dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-rose-100 dark:border-rose-800">Prevention Mode</span>
                        </div>
                        {/* subtle urgency glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-3xl -z-10 animate-pulse" />
                    </div>

                    {/* Economic Insight */}
                    <div className="bg-emerald-50 rounded-[2rem] p-6 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/30 group hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-500">
                        <div className="p-2.5 bg-white dark:bg-slate-800 rounded-2xl w-fit shadow-sm text-emerald-500 mb-6 transform group-hover:scale-110 transition-transform">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-500 mb-3">{t('timeline_economic_insight')}</h3>
                        <p className="text-base font-black text-slate-800 dark:text-emerald-100 tracking-tight leading-tight">
                            Good tilth prevents root stress.
                        </p>
                    </div>

                    <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                        <p className="text-[11px] font-bold text-slate-400 leading-relaxed italic">
                            System analyzed 4 satellite spectral signals to optimize this week's advisory.
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Footer Attribution */}
            <div className="mt-12 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    © 2026 AgriAid AI Systems. Built for Indian Farmers.
                </p>
            </div>
        </div>
    );
};

export default SmartFarmingTimeline;
