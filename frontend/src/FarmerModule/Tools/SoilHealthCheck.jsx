import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlaskConical, CheckCircle2, AlertTriangle, AlertCircle, Activity, Droplets, Leaf, ArrowRight, RefreshCw, BarChart3, Microscope, XCircle, Info, TrendingUp } from 'lucide-react';

const SoilHealthCheck = () => {
    const [soilData, setSoilData] = useState({
        ph: '',
        nitrogen: '',
        phosphorus: '',
        potassium: '',
        carbon: ''
    });

    const [status, setStatus] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [notification, setNotification] = useState(null);

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const checkHealth = () => {
        const ph = parseFloat(soilData.ph);
        if (!soilData.ph || isNaN(ph)) {
            showNotification('error', "Please enter at least the pH level to proceed.");
            return;
        }

        setAnalyzing(true);
        setStatus(null);

        // Simulate AI Analysis
        setTimeout(() => {
            let healthStatus = 'Optimal';
            let score = 85;
            let message = 'Your soil ecosystem is balanced and conducive for most crops.';
            let recommendations = [];

            // Simple Logic for Demo
            if (ph < 5.5) {
                healthStatus = 'Acidic';
                score = 60;
                message = 'Soil is highly acidic. Nutrient availability (N, P, K) is likely reduced.';
                recommendations.push({ title: 'Apply Agricultural Lime', desc: 'Add limestone (calcium carbonate) to neutralize acidity.', type: 'urgent' });
            } else if (ph > 7.5) {
                healthStatus = 'Alkaline';
                score = 65;
                message = 'Soil is alkaline. Micronutrients like Iron and Zinc may be locked out.';
                recommendations.push({ title: 'Apply Elemental Sulfur', desc: 'Sulfur oxidation produces acid to lower pH over time.', type: 'warning' });
            }

            if (parseFloat(soilData.carbon) < 0.5) {
                score -= 10;
                recommendations.push({ title: 'Boost Organic Matter', desc: 'Incorporate compost or cover crops to improve structure.', type: 'tip' });
            }

            setStatus({
                status: healthStatus,
                message: message,
                score: score,
                recommendations: recommendations.length > 0 ? recommendations : [{ title: 'Maintain Current Practices', desc: 'Continue with your current fertilization schedule.', type: 'good' }]
            });
            setAnalyzing(false);
        }, 1500);
    };

    return (
        <div className="max-w-[1920px] mx-auto px-4 py-12 relative overflow-hidden min-h-screen">

            {/* Custom Notification Toast */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: -20, x: '-50%' }}
                        className={`fixed top-24 left-1/2 z-[100] px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-center gap-3 min-w-[320px] transform -translate-x-1/2 ${notification.type === 'error'
                            ? 'bg-red-500/90 border-red-500/20 text-white shadow-red-500/20'
                            : 'bg-green-500/90 border-green-500/20 text-white shadow-green-500/20'
                            }`}
                    >
                        <div className="p-1 rounded-full bg-white/20 text-white">
                            {notification.type === 'error' ? <AlertCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-white">{notification.type === 'error' ? 'Action Required' : 'Success'}</h4>
                            <p className="text-xs opacity-90 font-medium text-white/90">{notification.message}</p>
                        </div>
                        <button onClick={() => setNotification(null)} className="ml-auto opacity-50 hover:opacity-100 text-white transition-opacity">
                            <XCircle className="h-5 w-5" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Background Decoration */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-[1400px] pointer-events-none">
                <div className="absolute top-20 left-10 w-96 h-96 bg-purple-200/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-20 right-10 w-80 h-80 bg-pink-200/20 rounded-full blur-[100px]" />
            </div>

            {/* Header */}
            <div className="text-center max-w-2xl mx-auto mb-16 relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-purple-100 rounded-full shadow-sm text-purple-700 font-bold text-xs mb-6 tracking-wide uppercase dark:bg-slate-800 dark:border-purple-900/30 dark:text-purple-400">
                    <Microscope className="h-3 w-3" /> Soil Intelligence
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4 dark:text-white">
                    Soil Health Lab
                </h1>
                <p className="text-gray-500 text-lg leading-relaxed dark:text-slate-400">
                    Input your soil test parameters to generate an instant, AI-driven health report and actionable amendment plan.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">

                {/* Visual Side (Left on Desktop) */}
                <div className="lg:col-span-4 order-2 lg:order-1">
                    <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white shadow-xl shadow-purple-900/5 dark:bg-slate-800/80 dark:border-slate-700 dark:shadow-none">
                        <div className="flex items-center gap-3 mb-8">
                            <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                <FlaskConical className="h-5 w-5" />
                            </span>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Lab Parameters</h2>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                    <span>Soil pH</span>
                                    <span className="text-purple-600 bg-purple-50 px-2 py-0.5 rounded text-[10px] dark:bg-purple-900/30 dark:text-purple-400">Required</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        placeholder="e.g. 6.5"
                                        className="w-full pl-5 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all placeholder:text-gray-300 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:focus:ring-purple-400/20 dark:focus:border-purple-400 dark:placeholder:text-slate-500"
                                        value={soilData.ph}
                                        onChange={(e) => setSoilData({ ...soilData, ph: e.target.value })}
                                        step="0.1"
                                    />
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">pH</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <NutrientInput label="Nitrogen" symbol="N" color="blue" val={soilData.nitrogen} set={(v) => setSoilData({ ...soilData, nitrogen: v })} />
                                <NutrientInput label="Phosphorus" symbol="P" color="amber" val={soilData.phosphorus} set={(v) => setSoilData({ ...soilData, phosphorus: v })} />
                                <NutrientInput label="Potassium" symbol="K" color="rose" val={soilData.potassium} set={(v) => setSoilData({ ...soilData, potassium: v })} />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Organic Carbon</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        placeholder="0.5"
                                        className="w-full pl-5 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all placeholder:text-gray-300 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:focus:ring-purple-400/20 dark:focus:border-purple-400 dark:placeholder:text-slate-500"
                                        value={soilData.carbon}
                                        onChange={(e) => setSoilData({ ...soilData, carbon: e.target.value })}
                                    />
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">%</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={checkHealth}
                                disabled={analyzing}
                                className="w-full mt-6 bg-gray-900 text-white font-bold text-lg py-5 rounded-2xl hover:bg-gray-800 active:scale-95 transition-all shadow-xl shadow-gray-900/20 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden dark:bg-emerald-600 dark:hover:bg-emerald-500"
                            >
                                {analyzing ? (
                                    <>
                                        <RefreshCw className="h-5 w-5 animate-spin" /> Analyzing...
                                    </>
                                ) : (
                                    <>
                                        Analyze Sample <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-8 order-1 lg:order-2">
                    <AnimatePresence mode="wait">
                        {status ? (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="space-y-6"
                            >
                                {/* Score Banner */}
                                <div className={`relative overflow-hidden rounded-[2.5rem] p-8 text-white shadow-xl ${status.score >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/30' : status.score >= 50 ? 'bg-gradient-to-r from-amber-400 to-orange-500 shadow-orange-500/30' : 'bg-gradient-to-r from-rose-500 to-pink-600 shadow-red-500/30'}`}>
                                    <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

                                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">

                                        <div className="relative">
                                            {/* Circular Progress (CSS Simulated) */}
                                            <div className="w-32 h-32 rounded-full border-4 border-white/20 flex items-center justify-center relative">
                                                <div className="absolute inset-0 rounded-full border-4 border-white/90" style={{ clipPath: `polygon(0 0, 100% 0, 100% ${status.score}%, 0 ${status.score}%)` }}></div>
                                                <div className="text-center">
                                                    <h2 className="text-5xl font-black tracking-tighter text-white">{status.score}</h2>
                                                </div>
                                            </div>
                                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold border border-white/30 text-white">
                                                Health Score
                                            </div>
                                        </div>

                                        <div className="flex-1 text-center md:text-left text-white">
                                            <div className="inline-flex items-center gap-1.5 mb-2 opacity-90 font-bold uppercase tracking-wider text-xs">
                                                <Activity className="h-4 w-4" /> Comprehensive Analysis
                                            </div>
                                            <h3 className="text-2xl md:text-3xl font-bold leading-tight mb-2">
                                                Your soil condition is <span className="underline decoration-white/30 decoration-2 underline-offset-4">{status.status}</span>.
                                            </h3>
                                            <p className="opacity-90 leading-relaxed max-w-lg">
                                                {status.message}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Visual pH Gauge */}
                                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden flex flex-col justify-center dark:bg-slate-800 dark:border-slate-700">
                                        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 dark:text-white">
                                            <div className="p-2 rounded-xl bg-blue-50 text-blue-500 dark:bg-blue-900/30 dark:text-blue-400">
                                                <Droplets className="h-5 w-5" />
                                            </div>
                                            pH Balance Analysis
                                        </h3>

                                        <div className="relative pt-6 pb-2 px-2">
                                            {/* Bar */}
                                            <div className="h-6 bg-gradient-to-r from-red-400 via-green-400 to-blue-500 rounded-full w-full relative">
                                                {/* Ticks */}
                                                <div className="absolute top-0 bottom-0 left-[39%] w-0.5 bg-white/50"></div> {/* 5.5 */}
                                                <div className="absolute top-0 bottom-0 left-[53%] w-0.5 bg-white/50"></div> {/* 7.5 */}
                                            </div>

                                            {/* Labels */}
                                            <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest mt-3">
                                                <span className="text-red-400">Acidic (0)</span>
                                                <span className="text-green-500 text-center transform -translate-x-4">Optimal (6.5-7.5)</span>
                                                <span className="text-blue-500">Alkaline (14)</span>
                                            </div>

                                            {/* Pointer */}
                                            <motion.div
                                                initial={{ left: '50%', opacity: 0 }}
                                                animate={{ left: `${(Math.min(Math.max(parseFloat(soilData.ph) || 7, 0), 14) / 14) * 100}%`, opacity: 1 }}
                                                transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
                                                className="absolute top-0 -translate-x-1/2 flex flex-col items-center"
                                            >
                                                <div className="bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded-lg mb-1 shadow-xl dark:bg-white dark:text-slate-900">
                                                    {soilData.ph} pH
                                                </div>
                                                <div className="w-0.5 h-8 bg-gray-900 dark:bg-white"></div>
                                            </motion.div>
                                        </div>
                                    </div>

                                    {/* Recommendations List */}
                                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm dark:bg-slate-800 dark:border-slate-700">
                                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 dark:text-white">
                                            <div className="p-2 rounded-xl bg-green-50 text-green-500 dark:bg-green-900/30 dark:text-green-400">
                                                <TrendingUp className="h-5 w-5" />
                                            </div>
                                            Recommended Actions
                                        </h3>
                                        <div className="space-y-3">
                                            {status.recommendations.map((rec, i) => (
                                                <RecCard key={i} title={rec.title} desc={rec.desc} type={rec.type} delay={i * 0.1} />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-[2.5rem] bg-gray-50/50 text-center p-8 text-gray-400 lg:mt-0 mt-8 dark:bg-slate-800/50 dark:border-slate-700"
                            >
                                <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform duration-500 dark:bg-slate-700">
                                    <BarChart3 className="h-10 w-10 text-gray-300 dark:text-gray-500" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-2 dark:text-white">Ready to Analyze</h3>
                                <p className="max-w-xs mx-auto text-gray-500 dark:text-slate-400">
                                    Samples are processed using our agronomy engine to compare against optimal yield baselines.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

// Helper Components
// Using static class maps to ensure Tailwind JIT picks up the colors
const NutrientInput = ({ label, symbol, color, val, set }) => {
    const focusRing = {
        blue: 'focus:ring-blue-500/20 focus:border-blue-500',
        amber: 'focus:ring-amber-500/20 focus:border-amber-500',
        rose: 'focus:ring-rose-500/20 focus:border-rose-500'
    };

    const badgeColor = {
        blue: 'bg-blue-500',
        amber: 'bg-amber-500',
        rose: 'bg-rose-500'
    };

    return (
        <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block text-center mb-1">{label}</label>
            <div className="relative group">
                <input
                    type="number"
                    placeholder="-"
                    className={`w-full p-3 text-center bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-900 focus:ring-2 outline-none transition-all ${focusRing[color]} dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:focus:ring-purple-400/20 dark:focus:border-purple-400`}
                    value={val}
                    onChange={(e) => set(e.target.value)}
                />
                <span className={`absolute top-0 right-0 -mt-2 -mr-1 px-1.5 py-0.5 rounded-md text-[9px] font-black text-white shadow-sm ${badgeColor[color]}`}>
                    {symbol}
                </span>
            </div>
        </div>
    );
};

const RecCard = ({ title, desc, type, delay }) => {
    const styles = {
        urgent: 'bg-red-50 border-red-100 text-red-900 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
        warning: 'bg-amber-50 border-amber-100 text-amber-900 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-200',
        good: 'bg-green-50 border-green-100 text-green-900 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
        tip: 'bg-blue-50 border-blue-100 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
    };

    const icons = {
        urgent: <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />,
        warning: <AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-400" />,
        good: <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400" />,
        tip: <Info className="h-5 w-5 text-blue-500 dark:text-blue-400" />
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + delay }}
            className={`p-4 rounded-xl border ${styles[type]} flex gap-3 items-start hover:shadow-md transition-shadow bg-white dark:bg-transparent`}
        >
            <div className="shrink-0 mt-0.5">{icons[type]}</div>
            <div>
                <h4 className="font-bold text-sm mb-0.5">{title}</h4>
                <p className="text-xs opacity-80 leading-relaxed font-medium">{desc}</p>
            </div>
        </motion.div>
    );
};

export default SoilHealthCheck;
