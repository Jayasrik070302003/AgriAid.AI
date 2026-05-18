import React, { useState } from 'react';
import { 
    History as HistoryIcon, 
    Calendar, 
    Sprout, 
    AlertCircle, 
    TrendingUp, 
    BarChart3, 
    CheckCircle2, 
    Trash2, 
    Activity, 
    Search, 
    Filter,
    Layers,
    Zap,
    ArrowRightLeft,
    Info,
    Leaf,
    FlaskConical,
    ChevronRight,
    Shield
} from 'lucide-react';
import clsx from 'clsx';
import { useLanguage } from '../Context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Loader from '../SharedComponents/Loader';
import toast from 'react-hot-toast';
import ConfirmationModal from '../SharedComponents/ConfirmationModal';
import { useGlobalState } from '../Context/GlobalStateContext';

const History = () => {
    const { t, language } = useLanguage();
    const { 
        historyData = [], 
        simulatorHistory = [], 
        growthHistory = [], 
        spreadHistory = [],
        stats = { total: 0, healthy: 0, issues: 0 }, 
        chartData = [], 
        loading, 
        refreshGlobalData 
    } = useGlobalState();

    const [activeTab, setActiveTab] = useState('scans');
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, type: 'scan' });

    const tabs = [
        { id: 'scans', label: 'AI Scans', icon: HistoryIcon, count: historyData?.length || 0, color: 'emerald' },
        { id: 'impact', label: 'Impact Sim', icon: ArrowRightLeft, count: simulatorHistory?.length || 0, color: 'teal' },
        { id: 'growth', label: 'Growth Plan', icon: TrendingUp, count: growthHistory?.length || 0, color: 'blue' },
        { id: 'spread', label: 'Spread Risk', icon: Activity, count: spreadHistory?.length || 0, color: 'rose' },
    ];

    const summaryStats = [
        { label: 'Total Analyses', value: stats.total || 0, icon: BarChart3, color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-100', iconColor: 'text-slate-500' },
        { label: 'Healthy Crops', value: stats.healthy || 0, icon: Leaf, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100', iconColor: 'text-emerald-500' },
        { label: 'Issues Found', value: stats.issues || 0, icon: AlertCircle, color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-100', iconColor: 'text-rose-500' },
        { label: 'Simulations', value: (simulatorHistory?.length || 0) + (growthHistory?.length || 0), icon: FlaskConical, color: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-100', iconColor: 'text-violet-500' },
    ];

    const handleDelete = (id, type, e) => {
        e.stopPropagation();
        setDeleteModal({ isOpen: true, id, type });
    };

    const confirmDelete = async () => {
        const { id, type } = deleteModal;
        const loadingToast = toast.loading("Deleting record...");
        try {
            let endpoint = '';
            if (type === 'scan') endpoint = `/api/farmer/history/${id}`;
            if (endpoint) {
                await axios.delete(`http://localhost:3001${endpoint}`);
                toast.success("Record deleted successfully", { id: loadingToast });
                refreshGlobalData();
            } else {
                toast.error("Deletion not implemented for this type yet.", { id: loadingToast });
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Failed to delete record";
            toast.error(errorMessage, { id: loadingToast });
        } finally {
            setDeleteModal({ isOpen: false, id: null, type: 'scan' });
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        let locale = 'en-US';
        if (language === 'HI') locale = 'hi-IN';
        if (language === 'TA') locale = 'ta-IN';
        try { return new Date(dateString).toLocaleDateString(locale, options); }
        catch (e) { return dateString; }
    };

    if (loading) return <Loader message={t('loading_history') || "Fetching Activity Lab..."} />;

    /* ── Scan card ─────────────────────────────────────────────────────── */
    const renderScanItem = (item, i) => (
        <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
            className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 mb-3"
        >
            {/* Thumbnail */}
            <div className="h-14 w-14 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 flex-shrink-0 relative border border-slate-100 dark:border-slate-600">
                <img
                    src={`http://localhost:3001/${item.image_path}`}
                    alt={item.crop_name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-700 -z-10">
                    <Sprout className="w-5 h-5 text-slate-300" />
                </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-[14px] text-slate-900 dark:text-white truncate">
                        {t(`crop_${item.crop_name?.toLowerCase()}`) || item.crop_name}
                    </h4>
                    <span className={clsx(
                        "shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium",
                        item.disease_detected === 'Healthy'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400'
                    )}>
                        {item.disease_detected === 'Healthy'
                            ? <CheckCircle2 className="w-3 h-3" />
                            : <AlertCircle className="w-3 h-3" />}
                        {item.disease_detected?.replace(/_/g, ' ')}
                    </span>
                </div>
                <div className="flex items-center gap-3 text-[12px] text-slate-400">
                    <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(item.created_at)}
                    </span>
                    {item.location_district && (
                        <span className="truncate max-w-[120px]">{item.location_district}</span>
                    )}
                </div>
                {/* Confidence bar */}
                <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${item.confidence}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, ease: "circOut" }}
                            className={clsx("h-full rounded-full", item.confidence > 80 ? "bg-emerald-500" : "bg-amber-400")}
                        />
                    </div>
                    <span className={clsx("text-[11px] font-semibold shrink-0", item.confidence > 80 ? "text-emerald-600" : "text-amber-500")}>
                        {item.confidence}%
                    </span>
                </div>
            </div>

            {/* Delete */}
            <button
                onClick={(e) => handleDelete(item.id, 'scan', e)}
                className="shrink-0 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </motion.div>
    );

    /* ── Simulator card ──────────────────────────────────────────────────── */
    const renderSimulatorItem = (item, i) => (
        <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
            className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 mb-3"
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-teal-50 dark:bg-teal-900/30 rounded-lg text-teal-600 dark:text-teal-400">
                        <Layers className="w-4 h-4" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-[14px] text-slate-900 dark:text-white">{item.crop} Simulation</h4>
                        <p className="text-[11px] text-slate-400">{item.soil_type} · {item.area} Ac · {item.duration_months} Months</p>
                    </div>
                </div>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.created_at).toLocaleDateString()}
                </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                    { label: 'Org Profit', val: `₹${parseInt(item.organic_profit).toLocaleString()}`, accent: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
                    { label: 'Chem Profit', val: `₹${parseInt(item.chemical_profit).toLocaleString()}`, accent: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/30' },
                    { label: 'Org Yield', val: `${item.organic_yield}kg`, accent: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
                    { label: 'Chem Yield', val: `${item.chemical_yield}kg`, accent: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/30' },
                ].map(stat => (
                    <div key={stat.label} className={`${stat.bg} rounded-lg p-2.5`}>
                        <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide mb-0.5">{stat.label}</p>
                        <p className={`text-[13px] font-bold ${stat.accent}`}>{stat.val}</p>
                    </div>
                ))}
            </div>
        </motion.div>
    );

    /* ── Growth card ─────────────────────────────────────────────────────── */
    const renderGrowthItem = (item, i) => {
        const results = JSON.parse(item.simulation_results || '{}');
        const riskColors = { High: 'bg-rose-100 text-rose-700', Medium: 'bg-amber-100 text-amber-700', Low: 'bg-emerald-100 text-emerald-700' };
        return (
            <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 mb-3"
            >
                <div className="flex items-center gap-3 mb-3">
                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 flex-shrink-0 border border-slate-100 dark:border-slate-600">
                        <img src={`http://localhost:3001/${item.image_path}`} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-[14px] text-slate-900 dark:text-white">{item.crop_name}</h4>
                            <span className={clsx("text-[11px] font-medium px-2 py-0.5 rounded-full", riskColors[results.riskLevel] || 'bg-slate-100 text-slate-600')}>
                                {results.riskLevel} Risk
                            </span>
                        </div>
                        <p className="text-[12px] text-slate-400 mt-0.5">Yield Forecast: <span className="text-blue-600 font-medium">{results.yieldPred}</span></p>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { label: '30d Health', val: results.futureHealth?.[0] },
                        { label: '60d Health', val: results.futureHealth?.[1] },
                        { label: '90d Health', val: results.futureHealth?.[2] }
                    ].map(step => (
                        <div key={step.label} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2.5 text-center">
                            <p className="text-[10px] text-slate-400 mb-0.5">{step.label}</p>
                            <p className="text-[13px] font-bold text-slate-900 dark:text-white">{step.val ?? '—'}%</p>
                        </div>
                    ))}
                </div>
            </motion.div>
        );
    };

    /* ── Spread card ─────────────────────────────────────────────────────── */
    const renderSpreadItem = (item, i) => (
        <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
            className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 mb-3 border-l-4 border-l-rose-400"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg text-rose-500">
                        <Activity className="w-4 h-4" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-[14px] text-slate-900 dark:text-white">{item.disease_name}</h4>
                        <p className="text-[11px] text-slate-400">{item.crop_name} · {item.location}</p>
                    </div>
                </div>
                <div className="text-right shrink-0">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">7d Spread</p>
                    <p className="text-xl font-bold text-rose-500">{item.risk_7_days}%</p>
                </div>
            </div>
            <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-700/50 px-3 py-1.5 rounded-full">
                    <Zap className="w-3 h-3 text-amber-500" />
                    Mutation: {item.mutation_risk_score}/100
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-700/50 px-3 py-1.5 rounded-full">
                    <Calendar className="w-3 h-3 text-blue-400" />
                    {new Date(item.created_at).toLocaleDateString()}
                </div>
            </div>
        </motion.div>
    );

    /* ── Empty state ──────────────────────────────────────────────────────── */
    const EmptyState = ({ icon: Icon, message }) => (
        <div className="py-20 flex flex-col items-center justify-center text-center text-slate-400">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl mb-4 border border-slate-100 dark:border-slate-700">
                <Icon className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-[13px] font-medium">{message}</p>
            <p className="text-[12px] mt-1 text-slate-300">Records will appear here once generated.</p>
        </div>
    );

    const activeData = {
        scans: historyData,
        impact: simulatorHistory,
        growth: growthHistory,
        spread: spreadHistory,
    }[activeTab] || [];

    return (
        <div className="max-w-6xl mx-auto px-4 pb-16 min-h-screen">

            {/* ── Hero Header ──────────────────────────────────────────── */}
            <div className="relative overflow-hidden rounded-2xl mt-4 mb-6 px-6 py-8
                bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=40 height=40 viewBox=0 0 40 40 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=none fill-rule=evenodd%3E%3Cg fill=%23ffffff opacity=0.04%3E%3Cpath d=M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41zM0 1.4l2.83 2.83 1.41-1.41L1.41 0H0v1.41zM38.59 40l-2.83-2.83 1.41-1.41L40 38.59V40h-1.41zM40 1.41l-2.83 2.83-1.41-1.41L38.59 0H40v1.41z/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"/>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                            <HistoryIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">My Activity Lab</h1>
                            <p className="text-[12px] text-white/70 mt-0.5">AI diagnostics, simulations & genomic analyses</p>
                        </div>
                    </div>
                    {/* Search inside hero */}
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/50" />
                            <input
                                type="text"
                                placeholder="Search records..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-lg text-[13px] text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 w-52 transition-all"
                            />
                        </div>
                        <button className="p-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-lg text-white/70 hover:text-white hover:bg-white/25 transition-all">
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Summary Stat Cards ────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {summaryStats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className={`${stat.bg} dark:bg-slate-800 border ${stat.border} dark:border-slate-700 rounded-xl p-4 flex items-center gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
                    >
                        <div className={`p-2 bg-white dark:bg-slate-700/50 rounded-lg shadow-sm`}>
                            <stat.icon className={`w-4 h-4 ${stat.iconColor}`} />
                        </div>
                        <div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">{stat.label}</p>
                            <p className={`text-xl font-bold ${stat.color} dark:text-white`}>{stat.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* ── Pill Tabs ─────────────────────────────────────────────── */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl w-fit border border-slate-200/60 dark:border-slate-700/60 mb-6 overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={clsx(
                            "flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 whitespace-nowrap",
                            activeTab === tab.id
                                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-700/40"
                        )}
                    >
                        <tab.icon className={clsx("w-3.5 h-3.5", activeTab === tab.id ? "text-emerald-500" : "text-slate-400")} />
                        {tab.label}
                        {tab.count > 0 && (
                            <span className={clsx(
                                "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold",
                                activeTab === tab.id
                                    ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400"
                                    : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                            )}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* ── Main Grid ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

                {/* Records List */}
                <div className="xl:col-span-3">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.15 }}
                        >
                            {activeTab === 'scans' && (
                                activeData.length > 0
                                    ? activeData.map((item, i) => renderScanItem(item, i))
                                    : <EmptyState icon={Sprout} message="No diagnostic scans found" />
                            )}
                            {activeTab === 'impact' && (
                                activeData.length > 0
                                    ? activeData.map((item, i) => renderSimulatorItem(item, i))
                                    : <EmptyState icon={ArrowRightLeft} message="No impact simulations recorded" />
                            )}
                            {activeTab === 'growth' && (
                                activeData.length > 0
                                    ? activeData.map((item, i) => renderGrowthItem(item, i))
                                    : <EmptyState icon={TrendingUp} message="No growth forecasts found" />
                            )}
                            {activeTab === 'spread' && (
                                activeData.length > 0
                                    ? activeData.map((item, i) => renderSpreadItem(item, i))
                                    : <EmptyState icon={Activity} message="No genomic spread analyses found" />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Sidebar */}
                <aside className="space-y-4">
                    {/* Stats panel (scan tab) */}
                    {activeTab === 'scans' && historyData.length > 0 && (
                        <div className="sticky top-4 space-y-4">
                            <div className="bg-slate-900 dark:bg-slate-800 text-white rounded-xl p-5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-2xl rounded-full" />
                                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 mb-4 flex items-center gap-1.5">
                                    <BarChart3 className="w-3.5 h-3.5" /> Lab Overview
                                </h4>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Total Analyses', val: stats.total || 0, pct: 100, color: 'bg-slate-600' },
                                        { label: 'Healthy', val: stats.healthy || 0, pct: Math.round(((stats.healthy || 0) / Math.max(stats.total || 1, 1)) * 100), color: 'bg-emerald-500' },
                                        { label: 'Issues', val: stats.issues || 0, pct: Math.round(((stats.issues || 0) / Math.max(stats.total || 1, 1)) * 100), color: 'bg-rose-500' },
                                    ].map(s => (
                                        <div key={s.label}>
                                            <div className="flex justify-between items-center mb-1.5">
                                                <span className="text-[11px] text-slate-400">{s.label}</span>
                                                <span className="text-[13px] font-bold text-white">{s.val}</span>
                                            </div>
                                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                <div className={`h-full ${s.color} rounded-full`} style={{ width: `${s.pct}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Pathogen distribution */}
                            {chartData.length > 0 && (
                                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-5">
                                    <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-4">Disease Distribution</h4>
                                    <div className="space-y-3">
                                        {chartData.map((item, idx) => (
                                            <div key={idx}>
                                                <div className="flex justify-between text-[11px] mb-1">
                                                    <span className="text-slate-600 dark:text-slate-300 truncate max-w-[120px]">{item.name}</span>
                                                    <span className="text-emerald-600 font-medium">{Math.round((item.value / Math.max(stats.total || 1, 1)) * 100)}%</span>
                                                </div>
                                                <div className="h-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${(item.value / Math.max(stats.total || 1, 1)) * 100}%` }}
                                                        transition={{ duration: 0.7, delay: idx * 0.1 }}
                                                        className="h-full bg-emerald-500 rounded-full"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Info note (non-scan tabs) */}
                    {activeTab !== 'scans' && (
                        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/40 rounded-xl p-5">
                            <div className="flex items-center gap-2 mb-2">
                                <Shield className="w-4 h-4 text-emerald-600" />
                                <h5 className="text-[12px] font-semibold text-emerald-700 dark:text-emerald-400">Data Integrity</h5>
                            </div>
                            <p className="text-[11px] text-emerald-700/60 dark:text-emerald-400/60 leading-relaxed">
                                Simulations are archived with full environmental context for longitudinal study and comparative analysis.
                            </p>
                        </div>
                    )}
                </aside>
            </div>

            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null, type: 'scan' })}
                onConfirm={confirmDelete}
                title="Erase Record Permanently"
                message="Are you sure you want to remove this diagnostic record from your lab archives? This action is irreversible."
                confirmText="Erase Forever"
                type="danger"
            />
        </div>
    );
};

export default History;
