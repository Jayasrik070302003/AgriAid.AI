
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Search, Filter, Bell, ArrowUpRight, ArrowDownRight, RefreshCw, ChevronDown, IndianRupee, Share2, Info, Activity, MapPin, BarChart3, Clock } from 'lucide-react';
import clsx from 'clsx';

const MarketPrices = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('All');
    const [selectedCrop, setSelectedCrop] = useState(null);
    const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
    const [isSentimentOpen, setIsSentimentOpen] = useState(false);

    const categories = ['All', 'Vegetables', 'Fruits', 'Grains', 'Pulses', 'Commercial'];

    const marketData = [
        { crop: 'Tomato', price: 2500, previous: 2350, unit: 'Quintal', category: 'Vegetables', location: 'Pune APMC', history: [2200, 2300, 2250, 2400, 2380, 2500] },
        { crop: 'Onion', price: 1800, previous: 1850, unit: 'Quintal', category: 'Vegetables', location: 'Nashik APMC', history: [1900, 1880, 1850, 1820, 1810, 1800] },
        { crop: 'Potato', price: 1200, previous: 1180, unit: 'Quintal', category: 'Vegetables', location: 'Mumbai', history: [1100, 1120, 1150, 1140, 1180, 1200] },
        { crop: 'Wheat', price: 2100, previous: 2100, unit: 'Quintal', category: 'Grains', location: 'Delhi', history: [2080, 2090, 2100, 2100, 2100, 2100] },
        { crop: 'Rice (Basmati)', price: 4500, previous: 4100, unit: 'Quintal', category: 'Grains', location: 'Karnal', history: [4000, 4100, 4200, 4300, 4400, 4500] },
        { crop: 'Cotton', price: 6200, previous: 6300, unit: 'Quintal', category: 'Commercial', location: 'Nagpur', history: [6400, 6350, 6300, 6250, 6220, 6200] },
        { crop: 'Soybean', price: 3800, previous: 3650, unit: 'Quintal', category: 'Pulses', location: 'Indore', history: [3500, 3600, 3550, 3650, 3700, 3800] },
        { crop: 'Apple', price: 8500, previous: 8200, unit: 'Quintal', category: 'Fruits', location: 'Shimla', history: [8000, 8100, 8200, 8300, 8400, 8500] },
    ];

    const getTrend = (current, previous) => {
        if (!previous) return { value: '0.0%', direction: 'neutral', diff: 0 };
        const diff = ((current - previous) / previous) * 100;
        return {
            value: Math.abs(diff).toFixed(1) + '%',
            direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral',
            diff: diff
        };
    };

    const filteredData = marketData.filter(item => {
        const matchesSearch = item.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTab = activeTab === 'All' || item.category === activeTab;
        return matchesSearch && matchesTab;
    });

    const handleViewAnalysis = (item) => {
        setSelectedCrop(item);
        setIsAnalysisOpen(true);
    };

    // Generate Smoother Curved Sparkline Path
    const getSparklinePath = (data, width = 140, height = 60, fill = false) => {
        if (!data || data.length < 2) return "";
        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = (max - min) || 1;

        const points = data.map((val, i) => ({
            x: (i / (data.length - 1)) * width,
            y: height - ((val - min) / range) * (height - 10) - 5
        }));

        let d = `M ${points[0].x} ${points[0].y}`;

        for (let i = 0; i < points.length - 1; i++) {
            const curr = points[i];
            const next = points[i + 1];
            const mx = (curr.x + next.x) / 2;
            const my = (curr.y + next.y) / 2;
            d += ` Q ${curr.x} ${curr.y} ${mx} ${my}`;
        }

        d += ` L ${points[points.length - 1].x} ${points[points.length - 1].y}`;

        if (fill) {
            d += ` L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;
        }

        return d;
    };

    return (
        <div className="max-w-[1500px] mx-auto px-6 py-12 relative min-h-screen">
            {/* Background Decorative Matrix */}
            <div className="fixed inset-0 pointer-events-none -z-10 bg-slate-50/50 dark:bg-[#0a0f18]">
                <div className="absolute top-[10%] right-[-5%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] dark:bg-emerald-500/5 animate-pulse" />
                <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] dark:bg-blue-500/5" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] dark:opacity-[0.05]" />
            </div>

            {/* Premium Header */}
            <header className="mb-14 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-1"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-4 bg-emerald-500 text-white rounded-[1.5rem] shadow-2xl shadow-emerald-500/20">
                            <TrendingUp className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter dark:text-white flex items-center gap-3 text-left">
                                Market Pulse
                                <span className="text-xs font-black uppercase tracking-[0.3em] bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full dark:bg-emerald-900/40 dark:text-emerald-400">Live</span>
                            </h1>
                            <p className="text-slate-500 text-lg font-bold mt-1 dark:text-slate-400 flex items-center gap-2">
                                <Activity className="h-4 w-4 text-emerald-500" />
                                Synchronized Mandi Intelligence: <span className="text-slate-900 dark:text-slate-200">500+ Markets</span>
                            </p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-wrap items-center gap-4"
                >
                    <button className="flex items-center gap-3 px-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-black text-[11px] uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 shadow-sm transition-all active:scale-95 group">
                        <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-700" /> Refresh Stream
                    </button>
                    <button className="flex items-center gap-3 px-8 py-4 bg-slate-900 dark:bg-emerald-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-[1.05] transition-all shadow-2xl shadow-slate-900/20 active:scale-95">
                        <Bell className="h-4 w-4 animate-bounce" /> Optimization Alerts
                    </button>
                </motion.div>
            </header>

            {/* Dashboard Insight Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                {/* TOP GAINER - Premium Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="relative group h-full"
                >
                    <div className="absolute inset-0 bg-emerald-500 rounded-[2.5rem] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
                    <div className="relative h-full bg-gradient-to-br from-emerald-500 to-teal-700 rounded-[2.5rem] p-8 text-white shadow-2xl overflow-hidden">
                        <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="flex flex-col h-full">
                            <div className="flex justify-between items-start mb-10">
                                <div className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/20">Sector Alpha</div>
                                <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl">
                                    <ArrowUpRight className="h-6 w-6" />
                                </div>
                            </div>
                            <h3 className="text-4xl font-black tracking-tighter mb-2">Rice (Basmati)</h3>
                            <div className="flex items-center gap-2 text-emerald-100/80 font-bold mb-auto">
                                <MapPin className="w-4 h-4" /> Karnal APMC Region
                            </div>
                            <div className="mt-8 flex items-end justify-between">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Momentum Index</p>
                                    <span className="text-5xl font-black">+8.0<span className="text-xl ml-0.5 opacity-60">%</span></span>
                                </div>
                                <div className="h-16 w-32 flex items-end">
                                    <svg viewBox="0 0 140 60" className="w-full h-full overflow-visible">
                                        <path d={getSparklinePath([4000, 4100, 4200, 4300, 4400, 4500])} stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* TOP LOSER - Premium Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="relative group h-full"
                >
                    <div className="absolute inset-0 bg-rose-500 rounded-[2.5rem] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
                    <div className="relative h-full bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-xl border border-white dark:border-slate-700 overflow-hidden">
                        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-rose-500/5 rounded-full blur-[100px]" />
                        <div className="flex flex-col h-full">
                            <div className="flex justify-between items-start mb-10">
                                <div className="px-4 py-1.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-100 dark:border-rose-800">Deficit Vector</div>
                                <div className="p-3 bg-rose-50 dark:bg-rose-900/30 text-rose-500 rounded-2xl">
                                    <ArrowDownRight className="h-6 w-6" />
                                </div>
                            </div>
                            <h3 className="text-4xl font-black tracking-tighter mb-2 text-slate-900 dark:text-white">Onion</h3>
                            <div className="flex items-center gap-2 text-slate-400 font-bold mb-auto">
                                <MapPin className="w-4 h-4" /> Nashik APMC Region
                            </div>
                            <div className="mt-8 flex items-end justify-between">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Momentum Index</p>
                                    <span className="text-5xl font-black text-rose-500">-2.1<span className="text-xl ml-0.5 opacity-60">%</span></span>
                                </div>
                                <div className="h-16 w-32 flex items-end">
                                    <svg viewBox="0 0 140 60" className="w-full h-full overflow-visible">
                                        <path d={getSparklinePath([1900, 1880, 1850, 1820, 1810, 1800])} stroke="#f43f5e" strokeWidth="4" fill="none" strokeLinecap="round" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* MARKET SENTIMENT - Mission Control Style */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="relative group h-full"
                >
                    <div className="h-full bg-slate-900 dark:bg-slate-800/40 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden border border-white/5 flex flex-col justify-between">
                        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_0%,rgba(16,185,129,0.1),transparent)]" />

                        <div>
                            <div className="flex items-center gap-2 mb-6 text-left">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">AI Market Sentiment</span>
                            </div>
                            <div className="flex items-baseline gap-4 mb-4">
                                <h4 className="text-5xl font-black text-white tracking-widest">BULLISH</h4>
                                <BarChart3 className="w-6 h-6 text-emerald-500" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                                <div className="flex items-center gap-3 mb-2">
                                    <Info className="w-4 h-4 text-emerald-400" />
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Protocol Advisory</span>
                                </div>
                                <p className="text-sm text-slate-300 font-bold leading-relaxed text-left">
                                    Vegetable indices expected to escalate 15% due to sub-optimal harvest cycles...
                                </p>
                            </div>
                            <button
                                onClick={() => setIsSentimentOpen(true)}
                                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                            >
                                Expand Full Analysis
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Intelligent Filtering Bar */}
            <div className="sticky top-24 z-30 mb-12 bg-white/60 dark:bg-slate-800/60 backdrop-blur-3xl p-4 rounded-3xl border border-white dark:border-slate-700/50 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar custom-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveTab(cat)}
                            className={clsx(
                                "px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap outline-none",
                                activeTab === cat
                                    ? "bg-slate-900 dark:bg-emerald-500 text-white shadow-xl shadow-slate-900/20 scale-105"
                                    : "bg-white/50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-[400px] flex items-center gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Locate commodities or mandis..."
                            className="w-full pl-12 pr-4 py-4 bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all group-hover:bg-white dark:group-hover:bg-white/5 font-bold text-sm text-slate-700 dark:text-white placeholder:text-slate-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-500 transition-colors shadow-sm hover:text-emerald-500">
                        <Filter className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Data Pipeline Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                <AnimatePresence mode='popLayout'>
                    {filteredData.map((item, index) => {
                        const trend = getTrend(item.price, item.previous);
                        const isUp = trend.direction === 'up';
                        const isDown = trend.direction === 'down';

                        return (
                            <motion.div
                                key={item.crop + index}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.4, delay: index * 0.05 }}
                                className="group relative bg-white dark:bg-slate-800/80 backdrop-blur-3xl rounded-[2.5rem] p-6 border border-white dark:border-white/5 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden"
                            >
                                {/* Glow Effect */}
                                <div className={clsx(
                                    "absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-10 transition-opacity group-hover:opacity-20",
                                    isUp ? "bg-emerald-500" : isDown ? "bg-rose-500" : "bg-slate-500"
                                )} />

                                <div className="flex justify-between items-start mb-6">
                                    <div className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 rounded-lg">
                                        {item.category}
                                    </div>
                                    <button className="p-2 bg-slate-50 dark:bg-slate-700 text-slate-400 hover:text-emerald-500 rounded-xl transition-colors">
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors truncate text-left">
                                        {item.crop}
                                    </h3>
                                    <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mt-1 text-left">
                                        <MapPin className="w-3.5 h-3.5 text-rose-500" /> {item.location}
                                    </p>
                                </div>

                                <div className="flex items-end justify-between mb-8">
                                    <div className="text-left">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Mandi Rate</p>
                                        <div className="flex items-center gap-1">
                                            <IndianRupee className="w-4 h-4 font-black text-slate-900 dark:text-white" />
                                            <span className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">
                                                {item.price.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className={clsx(
                                        "px-2.5 py-1.5 rounded-xl font-black text-xs flex items-center gap-1",
                                        isUp ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" :
                                            isDown ? "bg-rose-50 dark:bg-rose-900/30 text-rose-500 dark:text-rose-400" :
                                                "bg-slate-50 dark:bg-slate-800 text-slate-400"
                                    )}>
                                        {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : isDown ? <TrendingDown className="h-3.5 w-3.5" /> : null}
                                        {trend.value}
                                    </div>
                                </div>

                                {/* Graph and Metrics */}
                                <div className="space-y-6">
                                    <div className="h-20 w-full relative">
                                        <svg viewBox="0 0 140 60" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                            <defs>
                                                <linearGradient id={`fill-${index}`} x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor={isUp ? "#10b981" : isDown ? "#f43f5e" : "#94a3b8"} stopOpacity="0.2" />
                                                    <stop offset="100%" stopColor={isUp ? "#10b981" : isDown ? "#f43f5e" : "#94a3b8"} stopOpacity="0" />
                                                </linearGradient>
                                            </defs>
                                            <path
                                                d={getSparklinePath(item.history, 140, 60, true)}
                                                fill={`url(#fill-${index})`}
                                            />
                                            <path
                                                d={getSparklinePath(item.history, 140, 60)}
                                                fill="none"
                                                stroke={isUp ? "#10b981" : isDown ? "#f43f5e" : "#94a3b8"}
                                                strokeWidth="2.5"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                    </div>

                                    <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-white/5">
                                        <div className="flex flex-col text-left">
                                            <span className="text-[7px] font-black uppercase tracking-widest text-slate-400">Unit</span>
                                            <span className="text-[10px] font-black text-slate-900 dark:text-white">{item.unit}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[7px] font-black uppercase tracking-widest text-slate-400">Status</span>
                                            <div className="flex items-center gap-1">
                                                <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                                                <span className="text-[10px] font-black text-emerald-500">Live</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleViewAnalysis(item)}
                                        className="w-full py-3.5 bg-slate-900 dark:bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-slate-900/10 active:scale-95 flex items-center justify-center gap-2 group/btn"
                                    >
                                        View Mandi Analysis
                                        <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Mandi Analysis Modal */}
            <AnimatePresence>
                {isAnalysisOpen && selectedCrop && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAnalysisOpen(false)}
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border border-white dark:border-slate-800"
                        >
                            <div className="flex flex-col md:flex-row h-full">
                                {/* Analysis Sidebar */}
                                <div className="w-full md:w-80 bg-slate-50 dark:bg-slate-800/50 p-8 border-r border-slate-100 dark:border-slate-800">
                                    <div className="flex flex-col h-full">
                                        <div className="mb-10">
                                            <div className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest inline-block mb-3">
                                                Active Report
                                            </div>
                                            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-1">{selectedCrop.crop}</h2>
                                            <p className="text-slate-500 dark:text-slate-400 font-bold flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-rose-500" /> {selectedCrop.location}
                                            </p>
                                        </div>

                                        <div className="space-y-6 flex-1">
                                            <div className="p-5 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Confidence Level</span>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-3xl font-black text-emerald-500">98.2%</div>
                                                    <div className="h-2 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '98%' }} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-5 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Market Stability</span>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                                                    <span className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">High (Optimized)</span>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setIsAnalysisOpen(false)}
                                            className="mt-8 w-full py-4 bg-slate-900 dark:bg-slate-700 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all"
                                        >
                                            Dismiss Report
                                        </button>
                                    </div>
                                </div>

                                {/* Deep Intelligence Grid */}
                                <div className="flex-1 p-8 md:p-12 overflow-y-auto max-h-[80vh] custom-scrollbar">
                                    <div className="flex items-center gap-3 mb-10">
                                        <div className="p-3 bg-emerald-500 text-white rounded-2xl">
                                            <Activity className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Market Intelligence Brief</h3>
                                            <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Forecasting & Tactical Advice</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                                        <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                                            <div className="flex items-center gap-3 mb-4">
                                                <TrendingUp className="w-5 h-5 text-emerald-500" />
                                                <span className="text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">Price Prediction (7D)</span>
                                            </div>
                                            <div className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                                                ₹{(selectedCrop.price * 1.05).toFixed(0).toLocaleString()}<span className="text-sm ml-1 text-emerald-500 font-bold">+5% Est.</span>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                                                Market signals indicate rising demand in urban sectors, expect gradual escalation.
                                            </p>
                                        </div>

                                        <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                                            <div className="flex items-center gap-3 mb-4">
                                                <Info className="w-5 h-5 text-blue-500" />
                                                <span className="text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">Tactical Strategy</span>
                                            </div>
                                            <div className="text-lg font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tighter">HOLD SHIPMENT</div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                                                Wait for 3-4 days to capitalize on the projected price surge at {selectedCrop.location}.
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-6 flex items-center gap-3">
                                            <ChevronDown className="w-4 h-4" /> Historical Volatility Map
                                        </h4>
                                        <div className="h-48 w-full bg-slate-100/50 dark:bg-slate-900 rounded-[2.5rem] p-8 border border-white dark:border-slate-800 relative">
                                            <svg viewBox="0 0 140 60" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                                <path
                                                    d={getSparklinePath(selectedCrop.history, 140, 60, true)}
                                                    fill="rgba(16, 185, 129, 0.1)"
                                                />
                                                <path
                                                    d={getSparklinePath(selectedCrop.history, 140, 60)}
                                                    fill="none"
                                                    stroke="#10b981"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Sentiment Analysis Modal */}
            <AnimatePresence>
                {isSentimentOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSentimentOpen(false)}
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border border-white dark:border-slate-800"
                        >
                            <div className="flex flex-col lg:flex-row h-full">
                                {/* Side Protocol Information */}
                                <div className="w-full lg:w-96 bg-slate-50 dark:bg-slate-800/80 p-10 border-r border-slate-100 dark:border-slate-800">
                                    <div className="flex flex-col h-full">
                                        <div className="mb-12">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="p-3 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20">
                                                    <Activity className="w-6 h-6 text-white" />
                                                </div>
                                                <span className="text-xs font-black uppercase tracking-[0.3em] text-emerald-500">Live AI Matrix</span>
                                            </div>
                                            <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-widest leading-none mb-4">BULLISH</h2>
                                            <p className="text-slate-500 dark:text-slate-400 font-bold">The market is currently exhibiting strong upward momentum across Tier-1 and Tier-2 Mandis.</p>
                                        </div>

                                        <div className="space-y-6 flex-1">
                                            <div className="p-6 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-white/5 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-3">
                                                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Overall Volume</span>
                                                <div className="text-3xl font-black text-slate-900 dark:text-white">+12.4%</div>
                                                <div className="text-[10px] font-bold text-slate-400 mt-1">vs. Last 30 Days</div>
                                            </div>

                                            <div className="p-6 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-white/5 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-3 text-emerald-500">
                                                    <Activity className="w-4 h-4 animate-pulse" />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Market Volatility</span>
                                                <div className="text-3xl font-black text-slate-900 dark:text-white">LOW</div>
                                                <div className="text-[10px] font-bold text-slate-400 mt-1">Stable Trading Flow</div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setIsSentimentOpen(false)}
                                            className="mt-10 w-full py-4 bg-slate-900 dark:bg-slate-700 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all shadow-xl shadow-slate-900/10"
                                        >
                                            Dismiss Dashboard
                                        </button>
                                    </div>
                                </div>

                                {/* Macro Analytics Grid */}
                                <div className="flex-1 p-10 lg:p-14 overflow-y-auto max-h-[85vh] custom-scrollbar">
                                    <div className="mb-12">
                                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Sector Distribution</h3>
                                        <p className="text-slate-500 dark:text-slate-400 font-bold">AI-Driven probability analysis of price movements per sector for the next 14 cycles.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                                        {[
                                            { sector: 'Vegetables', performance: '+15.2%', trend: 'Bullish', color: 'emerald' },
                                            { sector: 'Grains', performance: '+2.1%', trend: 'Neutral', color: 'blue' },
                                            { sector: 'Fruits', performance: '+8.4%', trend: 'Bullish', color: 'teal' },
                                            { sector: 'Pulses', performance: '-1.2%', trend: 'Bearish', color: 'rose' }
                                        ].map((item, i) => (
                                            <div key={i} className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-[2.5rem] border border-slate-100 dark:border-white/5 group hover:bg-white dark:hover:bg-slate-800 transition-all cursor-default">
                                                <div className="flex justify-between items-start mb-4">
                                                    <h4 className="text-lg font-black text-slate-900 dark:text-white">{item.sector}</h4>
                                                    <div className={clsx(
                                                        "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                                                        item.color === 'emerald' ? "bg-emerald-500/10 text-emerald-500" :
                                                            item.color === 'blue' ? "bg-blue-500/10 text-blue-500" :
                                                                item.color === 'teal' ? "bg-teal-500/10 text-teal-500" :
                                                                    "bg-rose-500/10 text-rose-500"
                                                    )}>
                                                        {item.trend}
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">{item.performance}</div>
                                                    <div className="w-24 h-8">
                                                        <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible">
                                                            <path
                                                                d={item.color === 'rose' ? "M 0 5 Q 25 10 50 15 Q 75 25 100 30" : "M 0 25 Q 25 15 50 10 Q 75 5 100 0"}
                                                                fill="none"
                                                                stroke={item.color === 'rose' ? '#f43f5e' : '#10b981'}
                                                                strokeWidth="3"
                                                                strokeLinecap="round"
                                                            />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="p-8 bg-slate-900 rounded-[3rem] relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]" />
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-3 mb-6">
                                                <Activity className="w-5 h-5 text-emerald-500" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">Global Factor Analysis</span>
                                            </div>
                                            <p className="text-lg font-bold text-slate-300 leading-relaxed mb-8">
                                                "Current fuel price stabilization and favorable monsoon indicators suggest a 92% probability of sustained price appreciation in Commercial crops."
                                            </p>
                                            <div className="flex items-center gap-6">
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Fuel Index</span>
                                                    <span className="text-white font-black">STABLE</span>
                                                </div>
                                                <div className="w-px h-8 bg-white/10" />
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Demand Vector</span>
                                                    <span className="text-emerald-500 font-black">SURGING</span>
                                                </div>
                                                <div className="w-px h-8 bg-white/10" />
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Stock Levels</span>
                                                    <span className="text-white font-black">NOMINAL</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {filteredData.length === 0 && (
                <div className="text-center py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 dark:bg-slate-700">
                        <Filter className="h-10 w-10 text-slate-300 dark:text-slate-500" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2 dark:text-white">No crops found</h3>
                    <p className="text-slate-500 font-medium max-w-xs mx-auto mb-6 dark:text-slate-400">We couldn't find any crops matching "{searchTerm}"</p>
                    <button
                        onClick={() => { setSearchTerm(''); setActiveTab('All'); }}
                        className="px-6 py-2.5 bg-emerald-50 text-emerald-600 font-bold rounded-xl hover:bg-emerald-100 transition-colors dark:bg-slate-700 dark:text-emerald-400 dark:hover:bg-slate-600"
                    >
                        Clear all filters
                    </button>
                </div>
            )}
        </div>
    );
};

export default MarketPrices;
