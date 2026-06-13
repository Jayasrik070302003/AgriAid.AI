import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HelpCircle, Phone, Mail, ChevronDown, ChevronRight,
    Sprout, Leaf, FlaskConical, CloudSun, TrendingUp,
    Calendar, FileText, BookOpen, Bug, Zap, Search, MessageCircle
} from 'lucide-react';

// ── Feature Guides ─────────────────────────────────────────────────────────
const FEATURES = [
    {
        icon: Sprout,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        border: 'border-emerald-100 dark:border-emerald-800/30',
        title: 'Crop Disease Analyzer',
        path: '/',
        steps: [
            'Click "Analyze Crop" in the navbar',
            'Enter your District & State location',
            'Upload a clear photo of the affected leaf',
            'Click "Analyze Disease" button',
            'Get instant AI diagnosis with treatment plan',
            'Use "Listen Advice" to hear recommendations',
        ]
    },
    {
        icon: Calendar,
        color: 'text-orange-500',
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        border: 'border-orange-100 dark:border-orange-800/30',
        title: 'Crop Calendar',
        path: '/tools/crop-calendar',
        steps: [
            'Go to Tools → Crop Calendar',
            'Search for your crop (e.g. Rice, Tomato)',
            'Select the sowing date',
            'Allow location detection or enter manually',
            'Click "Generate AI Calendar"',
            'View phase-wise schedule with irrigation & fertilizer tips',
        ]
    },
    {
        icon: FileText,
        color: 'text-blue-600',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-100 dark:border-blue-800/30',
        title: 'Government Schemes Finder',
        path: '/tools/government-schemes',
        steps: [
            'Go to Tools → Government Schemes',
            'Select your State from the dropdown',
            'Choose your primary crop',
            'Enter your farm size in acres',
            'Select farmer category (Small/Marginal/Large)',
            'Click "Find Schemes" to see eligible schemes + AI-detected new ones',
        ]
    },
    {
        icon: Leaf,
        color: 'text-green-600',
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-100 dark:border-green-800/30',
        title: 'Organic Farming Guide',
        path: '/tools/organic-guide',
        steps: [
            'Go to Tools → Organic Guide',
            'Select your crop and problem type (Pest/Disease/Soil/Growth)',
            'Choose severity level (Mild/Moderate/Severe)',
            'Click "Get Organic Solutions"',
            'Browse homemade recipes tab for zero-cost solutions',
            'Switch to AI Solution tab for custom advice',
        ]
    },
    {
        icon: FlaskConical,
        color: 'text-purple-600',
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        border: 'border-purple-100 dark:border-purple-800/30',
        title: 'Impact Simulator',
        path: '/tools/impact-simulator',
        steps: [
            'Go to Simulators → Impact Simulator',
            'Set Base Environment (crop, soil, weather, area)',
            'Configure Scenario A (e.g. Organic + Drip)',
            'Configure Scenario B (e.g. Chemical + Flood)',
            'Click "Compare Scenarios"',
            'AI will compare yield, soil, water, and cost impact',
        ]
    },
    {
        icon: CloudSun,
        color: 'text-sky-500',
        bg: 'bg-sky-50 dark:bg-sky-900/20',
        border: 'border-sky-100 dark:border-sky-800/30',
        title: 'Weather Intelligence',
        path: '/alerts',
        steps: [
            'Click "Weather Alerts" in user menu',
            'Allow location access or enter city name',
            'View live temperature, humidity, wind speed',
            'Read AI farming advisory for today',
            'Check 7-day forecast for planning',
            'Get alerts for extreme weather conditions',
        ]
    },
    {
        icon: TrendingUp,
        color: 'text-teal-600',
        bg: 'bg-teal-50 dark:bg-teal-900/20',
        border: 'border-teal-100 dark:border-teal-800/30',
        title: 'Future Growth Simulator',
        path: '/tools/future-growth',
        steps: [
            'Go to Simulators → Future Growth Sim',
            'Select crop type and farm size',
            'Enter current farming method',
            'Choose time horizon (30/60/90 days)',
            'Run simulation to see yield projection',
            'Compare multiple farming strategies',
        ]
    },
    {
        icon: Bug,
        color: 'text-rose-500',
        bg: 'bg-rose-50 dark:bg-rose-900/20',
        border: 'border-rose-100 dark:border-rose-800/30',
        title: 'Disease Spread Radar',
        path: '/tools/disease-spread',
        steps: [
            'Go to Simulators → Disease Spread',
            'Select crop and disease type',
            'Set initial infection area on the grid',
            'Configure weather and spread factors',
            'Run cellular automata simulation',
            'View predicted outbreak spread over time',
        ]
    },
];

// ── FAQs ────────────────────────────────────────────────────────────────────
const FAQS = [
    {
        q: 'How accurate is the crop disease detection?',
        a: 'Our AI uses Groq Vision + Gemini models with 85–95% accuracy. For best results, upload a clear, well-lit photo of a single affected leaf. Always consult your local agriculture officer for critical decisions.'
    },
    {
        q: 'My image upload failed. What should I do?',
        a: 'Ensure the image is under 10MB and in JPG/PNG format. Check your internet connection. If using mobile, try refreshing the page. The app works best on Chrome or Edge browsers.'
    },
    {
        q: 'Why is the AI response slow sometimes?',
        a: 'AgriAid.AI uses multiple AI engines (Groq → OpenRouter → Gemini) with automatic fallback. Slow response usually means the primary AI is busy — the system automatically switches to backup. This takes 10–30 seconds.'
    },
    {
        q: 'Is my farm data and images saved securely?',
        a: 'Yes. All images are stored in Supabase Storage (encrypted). Scan history is linked to your account and only visible to you. We do not share your data with third parties.'
    },
    {
        q: 'Can I use AgriAid.AI without internet?',
        a: 'No, AgriAid.AI requires internet connection for AI analysis, weather data, and market prices. We recommend using it when you have a stable 4G/WiFi connection.'
    },
    {
        q: 'How do Government Schemes stay up to date?',
        a: 'AgriAid.AI uses a hybrid approach — a static database of major schemes (PM-KISAN, PMFBY, KCC, etc.) is always available instantly. AI additionally detects recently announced 2024-2025 schemes based on your state and crop.'
    },
    {
        q: 'The chatbot is not responding. What should I do?',
        a: 'The floating chatbot uses the same AI engine as crop analysis. If it\'s not responding, wait 30 seconds and try again. Ensure your backend server is running on port 3001.'
    },
];

// ── Sub-components ──────────────────────────────────────────────────────────
function FeatureCard({ feature }) {
    const [open, setOpen] = useState(false);
    const Icon = feature.icon;
    return (
        <div className={`rounded-xl border ${feature.border} bg-white dark:bg-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow`}>
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
            >
                <div className={`p-2 rounded-lg ${feature.bg} shrink-0`}>
                    <Icon className={`w-4 h-4 ${feature.color}`} />
                </div>
                <span className="flex-1 text-sm font-semibold text-gray-800 dark:text-white">{feature.title}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 border-t border-gray-100 dark:border-slate-700 pt-3">
                            <ol className="space-y-2">
                                {feature.steps.map((step, i) => (
                                    <li key={i} className="flex gap-2.5 text-xs text-gray-600 dark:text-gray-300">
                                        <span className={`shrink-0 w-5 h-5 rounded-full ${feature.bg} ${feature.color} flex items-center justify-center font-bold text-[10px]`}>
                                            {i + 1}
                                        </span>
                                        {step}
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function FaqItem({ faq, index }) {
    const [open, setOpen] = useState(false);
    return (
        <div className={`rounded-xl border overflow-hidden transition-all ${open ? 'border-emerald-300 dark:border-emerald-700 shadow-md' : 'border-gray-100 dark:border-slate-700'} bg-white dark:bg-slate-800`}>
            <button onClick={() => setOpen(!open)} className="w-full flex items-start gap-3 p-4 text-left">
                <span className="shrink-0 w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-black mt-0.5">
                    {index + 1}
                </span>
                <span className={`flex-1 text-sm font-semibold pr-2 ${open ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-800 dark:text-white'}`}>
                    {faq.q}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform mt-0.5 ${open ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 pt-0 border-t border-gray-100 dark:border-slate-700">
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300 leading-relaxed pt-3">{faq.a}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ── Main Component ──────────────────────────────────────────────────────────
const HelpSupport = () => {
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('features');

    const filteredFeatures = FEATURES.filter(f =>
        f.title.toLowerCase().includes(search.toLowerCase())
    );
    const filteredFaqs = FAQS.filter(f =>
        f.q.toLowerCase().includes(search.toLowerCase()) ||
        f.a.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-4xl mx-auto pb-24 sm:pb-8 space-y-5 sm:space-y-6">

            {/* Header Banner */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-5 sm:p-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M0 20L20 0H10L0 10M20 20V10L10 20'/%3E%3C/g%3E%3C/svg%3E\")" }} />
                <div className="relative">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                            <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black">Help & Support</h1>
                    </div>
                    <p className="text-emerald-100 text-xs sm:text-sm mb-4">
                        Learn how to use every feature of AgriAid.AI
                    </p>

                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-300" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search features or questions..."
                            className="w-full pl-9 pr-4 py-2.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-emerald-200 text-sm focus:outline-none focus:bg-white/30 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Contact Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <a href="tel:18001234567"
                    className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-700 transition-all group">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl group-hover:scale-110 transition-transform shrink-0">
                        <Phone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-800 dark:text-white">Call Support</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">Mon–Fri, 9AM – 6PM</p>
                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">1800-123-4567</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 ml-auto shrink-0" />
                </a>

                <a href="mailto:support@agriaid.ai"
                    className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700 transition-all group">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl group-hover:scale-110 transition-transform shrink-0">
                        <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-800 dark:text-white">Email Us</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">We reply within 24 hours</p>
                        <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-0.5">support@agriaid.ai</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 ml-auto shrink-0" />
                </a>
            </div>

            {/* Floating Chatbot Hint */}
            <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg shrink-0">
                    <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Ask AI Assistant</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">Click the floating green button at the bottom-right corner to chat with our AI farming assistant in English, Tamil, or Hindi.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                {[
                    { id: 'features', label: 'How to Use Features', icon: BookOpen },
                    { id: 'faq', label: 'FAQ', icon: HelpCircle },
                ].map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${activeTab === tab.id
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-500/20'
                                : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:border-emerald-300'
                                }`}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'features' && (
                    <motion.div
                        key="features"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="space-y-3"
                    >
                        <p className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-emerald-500" />
                            Click any feature to see step-by-step guide
                        </p>
                        {(search ? filteredFeatures : FEATURES).map((feature, i) => (
                            <FeatureCard key={i} feature={feature} />
                        ))}
                        {search && filteredFeatures.length === 0 && (
                            <p className="text-center text-sm text-gray-400 py-8">No features found for "{search}"</p>
                        )}
                    </motion.div>
                )}

                {activeTab === 'faq' && (
                    <motion.div
                        key="faq"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="space-y-3"
                    >
                        {(search ? filteredFaqs : FAQS).map((faq, i) => (
                            <FaqItem key={i} faq={faq} index={i} />
                        ))}
                        {search && filteredFaqs.length === 0 && (
                            <p className="text-center text-sm text-gray-400 py-8">No FAQs found for "{search}"</p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HelpSupport;
