import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Sprout, Leaf, ArrowRight, RefreshCw, Beaker, Info, CheckCircle2, IndianRupee, ShoppingBag, ChevronDown, Check, Clock, AlertTriangle, Droplets } from 'lucide-react';
import apiClient from '../../services/apiClient';

const FertilizerCalculator = () => {
    const [area, setArea] = useState('');
    const [unit, setUnit] = useState('Acres');
    const [crop, setCrop] = useState('');
    const [result, setResult] = useState(null);
    const [calculating, setCalculating] = useState(false);
    const [advisory, setAdvisory] = useState(null);

    const crops = [
        { name: 'Paddy (Rice)', n: 40, p: 20, k: 20 },
        { name: 'Wheat', n: 50, p: 25, k: 20 },
        { name: 'Corn (Maize)', n: 50, p: 25, k: 20 },
        { name: 'Sugarcane', n: 100, p: 40, k: 40 },
        { name: 'Cotton', n: 40, p: 20, k: 20 },
        { name: 'Potato', n: 60, p: 30, k: 40 },
        { name: 'Tomato', n: 45, p: 20, k: 25 },
        { name: 'Onion', n: 45, p: 20, k: 30 }
    ];

    const calculate = async () => {
        if (!area || isNaN(area)) {
            alert('Please enter a valid land area.');
            return;
        }
        setCalculating(true);
        setResult(null);
        setAdvisory(null);

        const selectedCrop = crops.find(c => c.name === crop) || crops[0];
        const areaNum = parseFloat(area);
        const multiplier = unit === 'Acres' ? 1 : 2.471;
        const reqN = selectedCrop.n * areaNum * multiplier;
        const reqP = selectedCrop.p * areaNum * multiplier;
        const reqK = selectedCrop.k * areaNum * multiplier;
        const dap = Math.ceil(reqP / 0.46);
        const nSuppliedByDap = dap * 0.18;
        const remainingN = reqN - nSuppliedByDap;
        const urea = remainingN > 0 ? Math.ceil(remainingN / 0.46) : 0;
        const mop = Math.ceil(reqK / 0.60);
        const cost = Math.round((urea * 6) + (dap * 27) + (mop * 34));

        const calcResult = {
            urea, dap, mop,
            total: urea + dap + mop,
            bags: Math.ceil((urea + dap + mop) / 50),
            cost: cost.toLocaleString('en-IN')
        };
        setResult(calcResult);

        // Groq AI advisory
        try {
            const res = await apiClient.post('/api/farmer/tools/fertilizer-advisory', {
                crop, area, unit, urea, dap, mop
            });
            setAdvisory(res.data.data);
        } catch (e) {
            console.warn('Advisory fetch failed:', e.message);
        } finally {
            setCalculating(false);
        }
    };

    return (
        <div className="max-w-[1920px] mx-auto px-4 py-12 relative overflow-hidden min-h-screen">
            {/* Background Decoration */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-[1400px] pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-green-200/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200/20 rounded-full blur-[100px]" />
            </div>

            {/* Header */}
            <div className="text-center max-w-4xl mx-auto mb-12 relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-green-100 rounded-full shadow-sm text-green-700 font-bold text-xs mb-6 tracking-wide uppercase dark:bg-slate-800 dark:border-green-900/30 dark:text-green-400">
                    <Leaf className="h-3 w-3" /> Smart Precision Farming
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4 dark:text-white">
                    Fertilizer Estimator
                </h1>
                <p className="text-gray-500 text-lg leading-relaxed dark:text-slate-400">
                    Optimize your input costs. Calculate exact Urea, DAP, and MOP quantities based on your crop and land area.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">

                {/* Left Panel: Inputs */}
                <div className="lg:col-span-4 bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white shadow-xl shadow-green-900/5 dark:bg-slate-800/80 dark:border-slate-700 dark:shadow-none">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3 dark:text-white">
                        <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            <Sprout className="h-5 w-5" />
                        </span>
                        Crop Details
                    </h2>

                    <div className="space-y-6">
                        {/* Custom Crop Dropdown */}
                        <CustomDropdown
                            label="Select Crop"
                            value={crop}
                            options={crops.map(c => c.name)}
                            onChange={setCrop}
                            icon={<Sprout className="h-4 w-4" />}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Area</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:focus:ring-green-400/20 dark:focus:border-green-400"
                                    value={area}
                                    onChange={(e) => setArea(e.target.value)}
                                />
                            </div>

                            {/* Custom Unit Dropdown */}
                            <CustomDropdown
                                label="Unit"
                                value={unit}
                                options={['Acres', 'Hectares']}
                                onChange={setUnit}
                            />
                        </div>
                    </div>

                    <button
                        onClick={calculate}
                        disabled={calculating || !area || !crop || isNaN(area) || parseFloat(area) <= 0}
                        className="w-full mt-8 bg-gray-900 text-white font-bold text-lg py-5 rounded-2xl hover:bg-gray-800 active:scale-95 transition-all shadow-xl shadow-gray-900/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden dark:bg-emerald-600 dark:hover:bg-emerald-500"
                    >
                        {calculating ? (
                            <>
                                <RefreshCw className="h-5 w-5 animate-spin" /> Calculating...
                            </>
                        ) : (
                            <>
                                <span className="relative z-10 flex items-center gap-2">Calculate Amount <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" /></span>
                            </>
                        )}
                    </button>
                </div>

                {/* Right Panel: Results */}
                <div className="lg:col-span-8">
                    <AnimatePresence mode="wait">
                        {result ? (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                {/* Cost Estimation Banner */}
                                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-[2rem] p-8 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 text-emerald-100 font-bold mb-1">
                                            <IndianRupee className="h-4 w-4" /> Estimated Cost
                                        </div>
                                        <h3 className="text-5xl font-black">₹ {result.cost}</h3>
                                        <p className="opacity-80 text-sm mt-2 max-w-sm">
                                            Approximate market cost based on Urea (₹266/bag), DAP (₹1350/bag), and MOP (₹1700/bag).
                                        </p>
                                    </div>
                                    <div className="relative z-10 flex gap-4">
                                        <div className="text-center bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 min-w-[100px]">
                                            <ShoppingBag className="h-6 w-6 mx-auto mb-2 opacity-80" />
                                            <p className="text-2xl font-bold">{result.bags}</p>
                                            <p className="text-xs font-medium opacity-70">Total Bags</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Detailed Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <NutrientResultCard
                                        name="Urea"
                                        type="Nitrogen"
                                        value={result.urea}
                                        color="blue"
                                        delay={0.1}
                                        icon="N"
                                    />
                                    <NutrientResultCard
                                        name="DAP"
                                        type="Phosphorus"
                                        value={result.dap}
                                        color="amber"
                                        delay={0.2}
                                        icon="P"
                                    />
                                    <NutrientResultCard
                                        name="MOP"
                                        type="Potassium"
                                        value={result.mop}
                                        color="rose"
                                        delay={0.3}
                                        icon="K"
                                    />
                                </div>

                                {/* AI Advisory */}
                                {advisory ? (
                                    <div className="space-y-4">
                                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm dark:bg-slate-800 dark:border-slate-700">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="p-3 bg-blue-50 rounded-xl text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"><Info className="h-5 w-5" /></div>
                                                <h4 className="font-bold text-gray-900 dark:text-white">AI Application Schedule</h4>
                                            </div>
                                            <div className="space-y-3">
                                                {advisory.application_schedule?.map((s, i) => (
                                                    <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                                        <span className="w-6 h-6 shrink-0 bg-emerald-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">{i+1}</span>
                                                        <div>
                                                            <p className="text-xs font-black text-slate-800 dark:text-white">{s.stage} — Urea {s.urea_pct}% · DAP {s.dap_pct}% · MOP {s.mop_pct}%</p>
                                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{s.timing} · {s.method}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        {advisory.crop_specific_tips?.length > 0 && (
                                            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl p-6 border border-emerald-100 dark:border-emerald-900/30">
                                                <h4 className="font-bold text-emerald-900 dark:text-emerald-300 mb-3 flex items-center gap-2"><Sprout className="h-4 w-4" /> Crop-Specific Tips</h4>
                                                <ul className="space-y-2">
                                                    {advisory.crop_specific_tips.map((tip, i) => (
                                                        <li key={i} className="text-xs text-emerald-800 dark:text-emerald-200 font-medium flex items-start gap-2">
                                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />{tip}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {advisory.caution && (
                                            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-3xl p-5 border border-amber-100 dark:border-amber-900/30 flex gap-3">
                                                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                                                <p className="text-xs text-amber-800 dark:text-amber-200 font-medium">{advisory.caution}</p>
                                            </div>
                                        )}
                                    </div>
                                ) : result && (
                                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-center gap-3 dark:bg-slate-800 dark:border-slate-700">
                                        <RefreshCw className="h-4 w-4 animate-spin text-emerald-500" />
                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Loading AI advisory...</p>
                                    </div>
                                )}

                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-[2.5rem] bg-gray-50/50 text-center p-8 text-gray-400 group hover:border-green-200 transition-colors dark:bg-slate-800/50 dark:border-slate-700 dark:hover:border-green-800"
                            >
                                <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform duration-500 dark:bg-slate-700">
                                    <Beaker className="h-10 w-10 text-gray-300 group-hover:text-green-500 transition-colors dark:text-gray-500 dark:group-hover:text-green-400" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-2 dark:text-white">Ready to Estimate</h3>
                                <p className="max-w-xs mx-auto text-gray-500 dark:text-slate-400">
                                    Enter your specific land measurements to get a precise, cost-optimized fertilizer schedule.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

// --- Custom MUI-like Dropdown Component ---
const CustomDropdown = ({ label, value, options, onChange, icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative space-y-2" ref={dropdownRef}>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">{label}</label>
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 flex items-center justify-between outline-none transition-all dark:bg-slate-700 dark:border-slate-600 dark:text-white ${isOpen ? 'ring-2 ring-green-500/20 border-green-500 dark:border-green-400 dark:ring-green-400/20' : 'hover:bg-gray-100 dark:hover:bg-slate-600'
                        }`}
                >
                    <span className="flex items-center gap-2">
                        {icon && <span className="text-green-600">{icon}</span>}
                        {value || <span className="text-gray-400 font-medium">Choose...</span>}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.98 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden max-h-64 overflow-y-auto no-scrollbar dark:bg-slate-800 dark:border-slate-700"
                        >
                            {options.map((opt) => (
                                <div
                                    key={opt}
                                    onClick={() => {
                                        onChange(opt);
                                        setIsOpen(false);
                                    }}
                                    className={`px-5 py-3.5 cursor-pointer font-bold text-sm transition-colors flex items-center justify-between ${value === opt ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white'
                                        }`}
                                >
                                    {opt}
                                    {value === opt && <Check className="h-4 w-4 text-green-600" />}
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const NutrientResultCard = ({ name, type, value, color, delay, icon }) => {
    const theme = {
        blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-900 dark:text-blue-100', sub: 'text-blue-600 dark:text-blue-300', border: 'border-blue-100 dark:border-blue-800', iconBg: 'bg-blue-500 dark:bg-blue-600' },
        amber: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-900 dark:text-amber-100', sub: 'text-amber-600 dark:text-amber-300', border: 'border-amber-100 dark:border-amber-800', iconBg: 'bg-amber-500 dark:bg-amber-600' },
        rose: { bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-900 dark:text-rose-100', sub: 'text-rose-600 dark:text-rose-300', border: 'border-rose-100 dark:border-rose-800', iconBg: 'bg-rose-500 dark:bg-rose-600' },
    };

    const t = theme[color];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay }}
            className={`p-6 rounded-[2rem] border ${t.border} ${t.bg} relative overflow-hidden group hover:shadow-lg transition-all`}
        >
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full ${t.iconBg} opacity-10 group-hover:scale-150 transition-transform duration-700`} />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${t.sub} mb-1 block`}>{type}</span>
                        <h3 className={`text-2xl font-black ${t.text}`}>{name}</h3>
                    </div>
                    <div className={`w-10 h-10 rounded-xl ${t.iconBg} text-white flex items-center justify-center font-bold shadow-lg shadow-black/5`}>
                        {icon}
                    </div>
                </div>

                <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-black ${t.text}`}>{value}</span>
                    <span className={`text-sm font-bold ${t.sub} opacity-70`}>kg</span>
                </div>
            </div>
        </motion.div>
    );
};

export default FertilizerCalculator;
