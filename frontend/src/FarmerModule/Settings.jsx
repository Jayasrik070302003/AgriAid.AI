import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Shield, Smartphone, Moon, Save, Check, Sun,
    Monitor, Sprout, ChevronRight, Zap, Settings2, Volume2,
    VolumeX, Mail, MessageSquare, BookOpen, Flag, HelpCircle,
    ExternalLink, AlertCircle, FileText, Clock, Wifi, Eye
} from 'lucide-react';
import { useTheme } from '../Context/ThemeContext';

// ── Primitives ───────────────────────────────────────────────────────────────

const Toggle = ({ checked, onChange }) => (
    <button onClick={() => onChange(!checked)}
        className={`relative w-9 h-5 rounded-full transition-colors duration-200 shrink-0 focus:outline-none ${checked ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
        <motion.div layout transition={{ type: 'spring', stiffness: 700, damping: 30 }}
            className="w-3.5 h-3.5 rounded-full bg-white shadow-sm absolute top-[3px]"
            style={{ left: checked ? 'calc(100% - 17px)' : '3px' }} />
    </button>
);

const SettingRow = ({ icon: Icon, iconBg, iconColor, title, desc, right, last }) => (
    <>
        <div className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
            <div className="flex items-center gap-3 min-w-0">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
                    <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
                </div>
                <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 leading-tight">{title}</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 leading-tight">{desc}</p>
                </div>
            </div>
            <div className="shrink-0 ml-6">{right}</div>
        </div>
        {!last && <div className="h-px bg-slate-100 dark:bg-slate-800 mx-4" />}
    </>
);

const SectionHead = ({ icon: Icon, iconBg, iconColor, title, desc }) => (
    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
            <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
        <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-none">{title}</h2>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{desc}</p>
        </div>
    </div>
);

const InfoNote = ({ children, color = 'blue' }) => {
    const map = {
        blue:   'bg-blue-50/60 border-blue-100 text-blue-700/80 dark:bg-blue-900/10 dark:border-blue-900/20 dark:text-blue-300/70',
        amber:  'bg-amber-50/60 border-amber-100 text-amber-700/80 dark:bg-amber-900/10 dark:border-amber-900/20 dark:text-amber-300/70',
        emerald:'bg-emerald-50/60 border-emerald-100 text-emerald-700/80 dark:bg-emerald-900/10 dark:border-emerald-900/20 dark:text-emerald-300/70',
    };
    return (
        <div className={`mt-4 p-3 border rounded-xl text-[11px] leading-relaxed ${map[color]}`}>{children}</div>
    );
};

const HelpCard = ({ icon: Icon, iconBg, iconColor, title, desc, action, actionLabel }) => (
    <div className="flex items-start gap-3 p-4 bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl hover:border-slate-200 dark:hover:border-slate-700 transition-colors group">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${iconBg}`}>
            <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">{title}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
        </div>
        <button onClick={action}
            className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors mt-0.5">
            {actionLabel} <ExternalLink className="h-2.5 w-2.5" />
        </button>
    </div>
);

// ── Nav config ───────────────────────────────────────────────────────────────

const NAV = [
    { id: 'appearance',    label: 'Appearance',    icon: Sun,         desc: 'Theme & display',            accent: 'text-amber-500',  activeBg: 'bg-amber-50 dark:bg-amber-900/20' },
    { id: 'preferences',   label: 'Preferences',   icon: Settings2,   desc: 'General & personalization',  accent: 'text-purple-500', activeBg: 'bg-purple-50 dark:bg-purple-900/20' },
    { id: 'notifications', label: 'Notifications', icon: Bell,        desc: 'Alerts & reminders',         accent: 'text-rose-500',   activeBg: 'bg-rose-50 dark:bg-rose-900/20' },
    { id: 'help',          label: 'Help & Support', icon: HelpCircle, desc: 'FAQ, contact & guides',      accent: 'text-teal-500',   activeBg: 'bg-teal-50 dark:bg-teal-900/20' },
];

// ── Main ─────────────────────────────────────────────────────────────────────

const Settings = () => {
    const { theme, setTheme, isDarkMode } = useTheme();
    const [active, setActive] = useState('appearance');
    const [saved, setSaved] = useState(false);

    // Preferences state
    const [dataSaver, setDataSaver]     = useState(false);
    const [compactUI, setCompactUI]     = useState(false);
    const [animations, setAnimations]   = useState(true);
    const [autoDetect, setAutoDetect]   = useState(true);

    // Notification state
    const [notifWeather, setNotifWeather]   = useState(true);
    const [notifCrop, setNotifCrop]         = useState(true);
    const [notifMarket, setNotifMarket]     = useState(false);
    const [notifAI, setNotifAI]             = useState(true);
    const [notifEmail, setNotifEmail]       = useState(false);
    const [notifSound, setNotifSound]       = useState(true);

    const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

    const themes = [
        { id: 'light',      label: 'Light',      icon: Sun,     preview: ['#f8fafc', '#ffffff', '#10b981'] },
        { id: 'dark-ai',    label: 'Dark AI',     icon: Moon,    preview: ['#050B14', '#0A1525', '#10b981'] },
        { id: 'green-agri', label: 'Green Agri',  icon: Sprout,  preview: ['#f0fdf4', '#ffffff', '#059669'] },
        { id: 'cyber-neon', label: 'Cyber Neon',  icon: Zap,     preview: ['#030008', '#0c021a', '#ff007f'] },
    ];

    const sections = {

        // ── Appearance ────────────────────────────────────────────────────
        appearance: (
            <div>
                <SectionHead icon={Sun} iconBg="bg-amber-50 dark:bg-amber-900/20" iconColor="text-amber-500"
                    title="Interface Theme" desc="Choose your preferred visual style" />
                
                <div className="space-y-2.5">
                    {themes.map(({ id, label, icon: Icon, preview }) => (
                        <button key={id} onClick={() => setTheme(id)}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all group ${
                                theme === id
                                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10 shadow-sm'
                                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                            }`}>
                            {/* Icon */}
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                                theme === id 
                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                            }`}>
                                <Icon className="h-5 w-5" />
                            </div>
                            
                            {/* Text */}
                            <div className="flex-1 text-left">
                                <p className={`text-sm font-bold mb-0.5 transition-colors ${
                                    theme === id ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'
                                }`}>
                                    {label === 'Dark AI' ? 'DARK AI THEME' : label === 'Light' ? 'LIGHT THEME' : label === 'Green Agri' ? 'GREEN AGRI THEME' : 'CYBER NEON THEME'}
                                </p>
                                <p className={`text-[11px] transition-colors ${
                                    theme === id ? 'text-slate-600 dark:text-slate-400' : 'text-slate-400 dark:text-slate-500'
                                }`}>
                                    {label === 'Dark AI' ? 'Deep tech carbon space' : label === 'Light' ? 'Clean ultra-crisp slate' : label === 'Green Agri' ? 'Eco-friendly natural vibe' : 'Futuristic vibrant synth'}
                                </p>
                            </div>
                            
                            {/* Color Preview */}
                            <div className="flex gap-1.5 shrink-0">
                                {preview.map((color, idx) => (
                                    <div 
                                        key={idx} 
                                        className="w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 shadow-sm"
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                            
                            {/* Check Mark */}
                            {theme === id && (
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shrink-0 shadow-sm"
                                >
                                    <Check className="h-3 w-3 text-white stroke-[3]" />
                                </motion.div>
                            )}
                        </button>
                    ))}
                </div>

                <div className="mt-4 p-4 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">System</p>
                            <p className="text-xs font-semibold text-slate-900 dark:text-white mt-1">Current: {themes.find(t => t.id === theme)?.label}</p>
                        </div>
                        <div className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg">
                            <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">Mode</p>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{isDarkMode ? '🌙 Dark' : '☀️ Light'}</p>
                        </div>
                    </div>
                </div>
            </div>
        ),

        // ── Preferences ───────────────────────────────────────────────────
        preferences: (
            <div>
                <SectionHead icon={Settings2} iconBg="bg-purple-50 dark:bg-purple-900/20" iconColor="text-purple-500"
                    title="App Preferences" desc="General app behavior and personalization options" />

                <div className="space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-wider px-1">Performance</p>
                    <div className="bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
                        <SettingRow icon={Wifi} iconBg="bg-emerald-50 dark:bg-emerald-900/20" iconColor="text-emerald-500"
                            title="Data Saver" desc="Load compressed images and defer non-critical API requests to save mobile data"
                            right={<Toggle checked={dataSaver} onChange={setDataSaver} />} />
                        <SettingRow icon={Zap} iconBg="bg-amber-50 dark:bg-amber-900/20" iconColor="text-amber-500"
                            title="UI Animations" desc="Enable smooth transitions and motion effects across the dashboard"
                            right={<Toggle checked={animations} onChange={setAnimations} />} last />
                    </div>

                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-wider px-1 pt-2">Display</p>
                    <div className="bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
                        <SettingRow icon={Eye} iconBg="bg-blue-50 dark:bg-blue-900/20" iconColor="text-blue-500"
                            title="Compact UI" desc="Reduce card padding and spacing for higher information density"
                            right={<Toggle checked={compactUI} onChange={setCompactUI} />} />
                        <SettingRow icon={Monitor} iconBg="bg-slate-100 dark:bg-slate-800" iconColor="text-slate-500"
                            title="Auto-Detect Location" desc="Automatically detect GPS coordinates on page load for weather and soil context"
                            right={<Toggle checked={autoDetect} onChange={setAutoDetect} />} last />
                    </div>
                </div>

                <InfoNote color="amber">
                    Changes to compact UI and animations take effect immediately. Data saver applies to the next page load.
                </InfoNote>
            </div>
        ),

        // ── Notifications ─────────────────────────────────────────────────
        notifications: (
            <div>
                <SectionHead icon={Bell} iconBg="bg-rose-50 dark:bg-rose-900/20" iconColor="text-rose-500"
                    title="Notifications" desc="Control which alerts and reminders you receive" />

                <div className="space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-wider px-1">Alert Types</p>
                    <div className="bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
                        <SettingRow icon={Zap} iconBg="bg-amber-50 dark:bg-amber-900/20" iconColor="text-amber-500"
                            title="Weather Alerts" desc="Extreme weather, drought risk, rainfall forecasts and climate advisories"
                            right={<Toggle checked={notifWeather} onChange={setNotifWeather} />} />
                        <SettingRow icon={Sprout} iconBg="bg-emerald-50 dark:bg-emerald-900/20" iconColor="text-emerald-500"
                            title="Crop Health Warnings" desc="Disease detection results, pest risk alerts and irrigation reminders"
                            right={<Toggle checked={notifCrop} onChange={setNotifCrop} />} />
                        <SettingRow icon={Monitor} iconBg="bg-blue-50 dark:bg-blue-900/20" iconColor="text-blue-500"
                            title="Market Price Updates" desc="Daily mandi price updates for your selected crops and regions"
                            right={<Toggle checked={notifMarket} onChange={setNotifMarket} />} />
                        <SettingRow icon={MessageSquare} iconBg="bg-purple-50 dark:bg-purple-900/20" iconColor="text-purple-500"
                            title="AI Insights" desc="Personalized recommendations and AI-generated farming tips"
                            right={<Toggle checked={notifAI} onChange={setNotifAI} />} last />
                    </div>

                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-wider px-1 pt-2">Delivery</p>
                    <div className="bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
                        <SettingRow icon={Mail} iconBg="bg-slate-100 dark:bg-slate-800" iconColor="text-slate-500"
                            title="Email Notifications" desc="Receive weekly summaries and critical alerts via email"
                            right={<Toggle checked={notifEmail} onChange={setNotifEmail} />} />
                        <SettingRow icon={notifSound ? Volume2 : VolumeX} iconBg="bg-rose-50 dark:bg-rose-900/20" iconColor="text-rose-500"
                            title="Sound Alerts" desc="Play notification sounds for critical crop and weather warnings"
                            right={<Toggle checked={notifSound} onChange={setNotifSound} />} last />
                    </div>
                </div>

                <InfoNote color="emerald">
                    Notification preferences are stored locally in your browser. Browser push notification permission is required for real-time alerts.
                </InfoNote>
            </div>
        ),

        // ── Help & Support ────────────────────────────────────────────────
        help: (
            <div>
                <SectionHead icon={HelpCircle} iconBg="bg-teal-50 dark:bg-teal-900/20" iconColor="text-teal-500"
                    title="Help & Support" desc="Resources, documentation, and platform information" />

                <div className="space-y-2.5">
                    <HelpCard icon={BookOpen} iconBg="bg-blue-50 dark:bg-blue-900/20" iconColor="text-blue-500"
                        title="User Documentation" desc="Complete guide covering crop diagnosis, AI tools, simulators, and weather features with screenshots and examples."
                        action={() => window.open('https://github.com/yourusername/agriaid-ai/wiki', '_blank')} actionLabel="Open Docs" />
                    <HelpCard icon={FileText} iconBg="bg-purple-50 dark:bg-purple-900/20" iconColor="text-purple-500"
                        title="Frequently Asked Questions" desc="Common questions about AI accuracy, data privacy, offline mode, language support, and troubleshooting."
                        action={() => {}} actionLabel="View FAQ" />
                    <HelpCard icon={Zap} iconBg="bg-amber-50 dark:bg-amber-900/20" iconColor="text-amber-500"
                        title="Video Tutorials" desc="Step-by-step video guides on using crop scanner, interpreting results, and utilizing AI features effectively."
                        action={() => {}} actionLabel="Watch" />
                    <HelpCard icon={MessageSquare} iconBg="bg-emerald-50 dark:bg-emerald-900/20" iconColor="text-emerald-500"
                        title="Community Forum" desc="Connect with other farmers, share experiences, ask questions, and learn best practices from the community."
                        action={() => {}} actionLabel="Join Forum" />
                    <HelpCard icon={Flag} iconBg="bg-rose-50 dark:bg-rose-900/20" iconColor="text-rose-500"
                        title="Report Bug or Issue" desc="Found incorrect AI predictions or technical problems? Submit detailed feedback to help us improve the platform."
                        action={() => {}} actionLabel="Report" />
                    <HelpCard icon={Sprout} iconBg="bg-green-50 dark:bg-green-900/20" iconColor="text-green-600"
                        title="Feature Requests" desc="Suggest new crops, tools, or features you'd like to see. We prioritize based on farmer feedback and demand."
                        action={() => {}} actionLabel="Suggest" />
                </div>

                {/* Platform Stats */}
                <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-2.5">
                    {[
                        { icon: Clock, label: 'Avg Response', value: '< 24h', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                        { icon: Sprout, label: 'Version', value: 'v3.0.0', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
                        { icon: AlertCircle, label: 'Known Issues', value: '0 active', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                        { icon: Eye, label: 'Uptime', value: '99.9%', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                    ].map(({ icon: Icon, label, value, color, bg }) => (
                        <div key={label} className="p-3 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
                            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-2`}>
                                <Icon className={`h-4 w-4 ${color}`} />
                            </div>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">{label}</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{value}</p>
                        </div>
                    ))}
                </div>

                {/* Quick Links */}
                <div className="mt-4 p-4 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-800/50 dark:to-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-lg bg-teal-500/10 flex items-center justify-center">
                            <ExternalLink className="h-3 w-3 text-teal-500" />
                        </div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Quick Links</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {[
                            { label: 'GitHub Repository', url: 'https://github.com' },
                            { label: 'API Documentation', url: '#' },
                            { label: 'Privacy Policy', url: '#' },
                            { label: 'Terms of Service', url: '#' },
                            { label: 'Release Notes', url: '#' },
                            { label: 'System Status', url: '#' },
                        ].map(({ label, url }) => (
                            <button
                                key={label}
                                onClick={() => url !== '#' && window.open(url, '_blank')}
                                className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all"
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <InfoNote color="blue">
                    AgriAid.AI is an open-source project. All AI models, data processing, and features are continuously improved based on real farmer feedback and agricultural research.
                </InfoNote>
            </div>
        ),
    };

    const activeNav = NAV.find(n => n.id === active);

    return (
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-5">

            {/* Top bar */}
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                    <h1 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                        Settings
                    </h1>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        Manage your preferences & app configuration
                    </p>
                </div>
                <motion.button whileTap={{ scale: 0.96 }} onClick={handleSave}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                        saved
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white'
                    }`}>
                    {saved ? <Check className="h-3 w-3" /> : <Save className="h-3 w-3" />}
                    {saved ? 'Saved!' : 'Save Changes'}
                </motion.button>
            </div>

            {/* Two-column */}
            <div className="flex gap-5 items-start">

                {/* ── Sidebar ── */}
                <aside className="w-52 shrink-0 sticky top-20 space-y-1">
                    {NAV.map(({ id, label, icon: Icon, desc, accent, activeBg }) => (
                        <button key={id} onClick={() => setActive(id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group ${
                                active === id
                                    ? `${activeBg} border border-slate-200/60 dark:border-white/5`
                                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent'
                            }`}>
                            <Icon className={`h-3.5 w-3.5 shrink-0 transition-colors ${active === id ? accent : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                            <div className="flex-1 min-w-0">
                                <p className={`text-xs font-semibold leading-none transition-colors ${active === id ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'}`}>
                                    {label}
                                </p>
                                <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-0.5 truncate">{desc}</p>
                            </div>
                            {active === id && <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />}
                        </button>
                    ))}

                    {/* Status card */}
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                                    <Sprout className="h-3 w-3 text-emerald-500" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">AgriAid.AI</p>
                                    <p className="text-[9px] text-slate-400 dark:text-slate-600">v3.0.0 · Production</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                                <span className="text-[9px] text-slate-400 dark:text-slate-600">All systems operational</span>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* ── Content ── */}
                <main className="flex-1 min-w-0">
                    <AnimatePresence mode="wait">
                        <motion.div key={active}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.15 }}
                            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                            {sections[active]}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default Settings;
