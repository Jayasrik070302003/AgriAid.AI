import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sprout, LogIn, LayoutDashboard, History, Menu, X, Globe, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useLanguage } from '../Context/LanguageContext';
import { useAuth } from '../Context/AuthContext';
import { User, LogOut, Settings, HelpCircle, Bell, Wrench, Calendar, Calculator, CloudSun, TrendingUp, FlaskConical, BookOpen, Leaf, Microscope, Bug, MessageSquare, CloudLightning } from 'lucide-react';
import ThemeSwitcher from './ThemeSwitcher';

const Navbar = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const location = useLocation();
    const { language, setLanguage, t } = useLanguage();
    const { user, isAuthenticated, logout } = useAuth();

    const navLinks = [
        { name: t('nav_analyze'), path: '/', icon: Sprout },
        { name: t('nav_history'), path: '/history', icon: History },
    ];

    const tools = [
        { name: t('nav_soil_health') || 'Soil Health Check', path: '/tools/soil-health', icon: FlaskConical, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/30' },
        { name: t('nav_crop_calendar') || 'Crop Calendar', path: '/tools/crop-calendar', icon: Calendar, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/30' },
        { name: 'AI Farming Assistant', path: '/tools/ai-farming-assistant', icon: MessageSquare, color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-900/30' },
    ];

    const simulators = [
        { name: t('nav_impact_sim') || 'Impact Simulator', path: '/tools/impact-simulator', icon: Sprout, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/30' },
        { name: 'Climate Risk Predictor', path: '/tools/climate-risk', icon: CloudLightning, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/30' },
    ];


    return (
        <div className="sticky top-0 left-0 right-0 z-50">
            {/* 
              Modern SaaS Navbar
            */}
            <nav className="backdrop-blur-md bg-white/75 border-b border-gray-200/50 dark:bg-slate-900/80 dark:border-slate-800 transition-colors duration-300">
                <div className="h-[62px] px-4 md:px-6 flex items-center justify-between w-full max-w-7xl mx-auto">
                
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 text-[18px] font-semibold text-gray-900 dark:text-white group select-none">
                    <Sprout className="h-5 w-5 text-farm-green" />
                    <span>AgriAid<span className="text-farm-green">.AI</span></span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex gap-1 items-center bg-transparent shrink-0">
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = location.pathname === link.path;
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={clsx(
                                    "flex items-center gap-1.5 text-[14px] font-medium px-3 py-1.5 rounded-full cursor-pointer transition-colors duration-200 shrink-0",
                                    isActive
                                        ? "bg-green-600/10 text-farm-green dark:bg-green-500/20 dark:text-emerald-400"
                                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-slate-800 dark:hover:text-white"
                                )}
                            >
                                <Icon className="h-4 w-4 shrink-0" />
                                <span className="whitespace-nowrap">{link.name}</span>
                            </Link>
                        );
                    })}

                    {/* Tools Dropdown */}
                    <div className="relative group">
                        <button
                            className={clsx(
                                "flex items-center gap-1.5 text-[14px] font-medium px-3 py-1.5 rounded-full cursor-pointer transition-colors duration-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-slate-800 dark:hover:text-white shrink-0"
                            )}
                        >
                            <Wrench className="h-4 w-4 shrink-0" />
                            <span className="whitespace-nowrap">{t('nav_tools')}</span>
                            <ChevronDown className="h-3 w-3 opacity-60 shrink-0" />
                        </button>

                        <div className="absolute top-full left-0 mt-2 min-w-[14rem] w-max max-w-xs bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-1 dark:bg-slate-800 dark:border-slate-700">
                            <div className="text-[10px] font-bold text-gray-400 px-3 py-1.5 uppercase tracking-wider break-words">
                                {t('nav_farmer_tools')}
                            </div>
                            {tools.map((tool) => (
                                <Link
                                    key={tool.name}
                                    to={tool.path}
                                    className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors flex items-start space-x-2.5 group/item dark:hover:bg-slate-700"
                                >
                                    <tool.icon className={clsx("h-4 w-4 shrink-0 mt-0.5", tool.color)} />
                                    <span className="text-[13px] font-medium text-gray-700 group-hover/item:text-gray-900 transition-colors break-words dark:text-slate-300 dark:group-hover/item:text-white leading-tight">{tool.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Simulators Dropdown */}
                    <div className="relative group">
                        <button
                            className={clsx(
                                "flex items-center gap-1.5 text-[14px] font-medium px-3 py-1.5 rounded-full cursor-pointer transition-colors duration-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-slate-800 dark:hover:text-white shrink-0"
                            )}
                        >
                            <FlaskConical className="h-4 w-4 shrink-0" />
                            <span className="whitespace-nowrap">{t('nav_simulators')}</span>
                            <ChevronDown className="h-3 w-3 opacity-60 shrink-0" />
                        </button>

                        <div className="absolute top-full left-0 mt-2 min-w-[14rem] w-max max-w-xs bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-1 dark:bg-slate-800 dark:border-slate-700">
                            <div className="text-[10px] font-bold text-gray-400 px-3 py-1.5 uppercase tracking-wider break-words">
                                {t('nav_advanced_sims')}
                            </div>
                            {simulators.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors flex items-start space-x-2.5 group/item dark:hover:bg-slate-700"
                                >
                                    <item.icon className={clsx("h-4 w-4 shrink-0 mt-0.5", item.color)} />
                                    <span className="text-[13px] font-medium text-gray-700 group-hover/item:text-gray-900 transition-colors break-words dark:text-slate-300 dark:group-hover/item:text-white leading-tight">{item.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Actions */}
                <div className="hidden md:flex items-center gap-2">

                    {/* Theme Selector */}
                    <ThemeSwitcher />

                    {/* Language Switcher */}
                    <div className="relative group">
                        <button className="h-[34px] px-3 flex items-center gap-1.5 text-[13px] font-medium bg-gray-100/80 text-gray-700 rounded-full hover:bg-gray-200 transition-colors border border-transparent dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 shrink-0">
                            <Globe className="h-[14px] w-[14px] text-gray-500 cursor-pointer shrink-0" />
                            <span className="whitespace-nowrap">{language}</span>
                        </button>

                        <div className="absolute top-full right-0 mt-2 min-w-[8rem] w-max bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-1 dark:bg-slate-800 dark:border-slate-700">
                            {['EN', 'HI', 'TA'].map((l) => (
                                <button
                                    key={l}
                                    onClick={() => setLanguage(l)}
                                    className={clsx(
                                        "w-full text-left px-4 py-2 text-[13px] transition-colors flex items-center justify-between",
                                        language === l ? "text-farm-green font-medium bg-green-50/50 dark:bg-green-900/10 dark:text-emerald-400" : "text-gray-600 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-700"
                                    )}
                                >
                                    <span className="whitespace-nowrap">{l === 'EN' ? 'English' : l === 'HI' ? 'हिंदी' : 'தமிழ்'}</span>
                                    {language === l && <div className="w-1.5 h-1.5 rounded-full bg-farm-green shrink-0 ml-3" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* User Menu or Sign In */}
                    {isAuthenticated ? (
                        <div className="relative group">
                            <button className="h-[36px] pl-1.5 pr-3 flex items-center gap-2 text-[13px] font-medium bg-gray-100/80 text-gray-700 rounded-full hover:bg-gray-200 transition-colors dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 shrink-0">
                                <div className="w-[26px] h-[26px] rounded-full bg-white shadow-sm flex items-center justify-center text-farm-green dark:bg-slate-700 dark:text-emerald-400 shrink-0">
                                    <User className="h-3.5 w-3.5" />
                                </div>
                                <span className="max-w-[120px] truncate">{user?.name}</span>
                            </button>

                            <div className="absolute top-full right-0 mt-2 min-w-[14rem] w-max max-w-xs bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-1 dark:bg-slate-800 dark:border-slate-700">
                                <div className="px-4 py-2 border-b border-gray-50 dark:border-slate-700/50 break-words">
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wide dark:text-slate-400">{t('nav_welcome_user')}</p>
                                    <p className="text-[13px] font-semibold text-gray-900 dark:text-white mt-0.5 leading-tight">{user?.name}</p>
                                </div>
                                <Link to="/" className="w-full text-left px-4 py-2 text-[13px] text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-start gap-2 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white">
                                    <LayoutDashboard className="h-[14px] w-[14px] shrink-0 mt-0.5" />
                                    <span className="break-words leading-tight">{t('nav_dashboard')}</span>
                                </Link>
                                <Link to="/profile" className="w-full text-left px-4 py-2 text-[13px] text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-start gap-2 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white">
                                    <User className="h-[14px] w-[14px] shrink-0 mt-0.5" />
                                    <span className="break-words leading-tight">{t('nav_profile')}</span>
                                </Link>
                                <Link to="/alerts" className="w-full text-left px-4 py-2 text-[13px] text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-start gap-2 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white">
                                    <Bell className="h-[14px] w-[14px] shrink-0 mt-0.5" />
                                    <span className="break-words leading-tight">{t('nav_alerts')}</span>
                                </Link>
                                <Link to="/settings" className="w-full text-left px-4 py-2 text-[13px] text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-start gap-2 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white">
                                    <Settings className="h-[14px] w-[14px] shrink-0 mt-0.5" />
                                    <span className="break-words leading-tight">{t('nav_settings')}</span>
                                </Link>
                                <Link to="/help" className="w-full text-left px-4 py-2 text-[13px] text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-start gap-2 border-b border-gray-50 pb-2 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white dark:border-slate-700/50">
                                    <HelpCircle className="h-[14px] w-[14px] shrink-0 mt-0.5" />
                                    <span className="break-words leading-tight">{t('nav_help')}</span>
                                </Link>
                                <button
                                    onClick={logout}
                                    className="w-full text-left px-4 py-2 text-[13px] text-red-600 hover:bg-red-50 transition-colors flex items-start gap-2 mt-1 dark:text-red-400 dark:hover:bg-red-900/20"
                                >
                                    <LogOut className="h-[14px] w-[14px] shrink-0 mt-0.5" />
                                    <span className="break-words leading-tight">{t('nav_logout')}</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <Link to="/login" className="h-[34px] px-4 flex items-center justify-center gap-2 text-[13px] font-medium bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-all shadow-sm active:scale-95 dark:bg-slate-100 dark:text-gray-900 dark:hover:bg-white shrink-0">
                            <span className="whitespace-nowrap">{t('nav_signin')}</span>
                            <LogIn className="h-[14px] w-[14px] shrink-0" />
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center gap-3">
                    <ThemeSwitcher />

                    <button
                        onClick={() => setLanguage(language === 'EN' ? 'HI' : language === 'HI' ? 'TA' : 'EN')}
                        className="text-[11px] font-bold text-farm-green bg-green-50 px-2 py-1 rounded dark:bg-slate-800 dark:text-emerald-400"
                    >
                        {language}
                    </button>

                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        {isOpen ? <X className="h-[18px] w-[18px]" /> : <Menu className="h-[18px] w-[18px]" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden border-t border-gray-100 overflow-hidden"
                        >
                            <div className="px-1.5 pt-1.5 pb-5 space-y-1.5 w-full max-w-[270px] ml-auto mr-4">
                                {/* Main Nav Links */}
                                <div className="space-y-1">
                                    {navLinks.map((link) => {
                                        const Icon = link.icon;
                                        const isActive = location.pathname === link.path;
                                        return (
                                            <Link
                                                key={link.path}
                                                to={link.path}
                                                onClick={() => setIsOpen(false)}
                                                className={clsx(
                                                    "flex items-center space-x-1.5 px-2 py-0.5 rounded-lg transition-all text-[9px]",
                                                    isActive
                                                        ? "bg-farm-green text-white shadow-sm shadow-green-500/30 font-bold"
                                                        : "text-gray-600 hover:bg-gray-50 font-medium"
                                                )}
                                            >
                                                <Icon className={clsx("h-2.5 w-2.5", isActive ? "stroke-[2.5px]" : "stroke-2")} />
                                                <span>{link.name}</span>
                                            </Link>
                                        );
                                    })}

                                    {/* Mobile Tools (Horizontal Scroll) */}
                                    <div className="pt-4 pb-3">
                                        <div className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{t('nav_farmer_tools')}</div>
                                        <div className="flex gap-3 overflow-x-auto px-4 pb-4 no-scrollbar snap-x">
                                            {tools.map((tool) => (
                                                <Link
                                                    key={tool.name}
                                                    to={tool.path}
                                                    onClick={() => setIsOpen(false)}
                                                    className="snap-start shrink-0 flex flex-col items-center justify-center w-7 p-0.5 rounded-md bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 hover:border-emerald-500/50 active:scale-95 transition-all"
                                                >
                                                    <div className={`p-1 rounded-md mb-0.5 ${tool.bg} ${tool.color} shadow-sm`}>
                                                        <tool.icon className="h-2.5 w-2.5" />
                                                    </div>
                                                    {/* Tool name intentionally hidden for maximum compactness */}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Mobile Simulators (Horizontal Scroll) */}
                                    <div className="pb-3">
                                        <div className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{t('nav_advanced_sims')}</div>
                                        <div className="flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar snap-x">
                                            {simulators.map((item) => (
                                                <Link
                                                    key={item.name}
                                                    to={item.path}
                                                    onClick={() => setIsOpen(false)}
                                                    className="snap-start shrink-0 flex flex-col items-center justify-center p-2 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 hover:border-emerald-500/50 active:scale-95 transition-all text-center min-w-[70px]"
                                                >
                                                    <div className={`p-1.5 rounded-lg mb-1.5 ${item.bg} ${item.color} shadow-sm`}>
                                                        <item.icon className="h-4 w-4" />
                                                    </div>
                                                    <span className="text-[7px] font-bold text-gray-600 dark:text-slate-300 leading-tight">{item.name}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {isAuthenticated ? (
                                    <>
                                        {/* User Profile Card */}
                                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-1 border border-gray-100">
                                            <div className="flex items-center space-x-1.5 mb-10">
                                                <div className="w-4 h-4 rounded-full bg-white shadow-sm flex items-center justify-center text-farm-green border border-gray-100">
                                                    <User className="h-2 w-2" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[8px] font-bold text-gray-900 truncate">{user?.name}</p>
                                                    <p className="text-[6px] text-gray-500 truncate">{user?.email}</p>
                                                </div>
                                            </div>

                                            {/* Action Grid */}
                                            <div className="grid grid-cols-2 gap-1">
                                                <Link to="/profile" onClick={() => setIsOpen(false)} className="flex flex-col items-center justify-center p-0.5 rounded-md bg-white border border-gray-100 shadow-sm active:scale-95 transition-all text-gray-600">
                                                    <User className="h-2.5 w-2.5 mb-0.5 text-emerald-500" />
                                                    <span className="text-[6px] font-medium">{t('nav_profile')}</span>
                                                </Link>
                                                <Link to="/alerts" onClick={() => setIsOpen(false)} className="flex flex-col items-center justify-center p-0.5 rounded-md bg-white border border-gray-100 shadow-sm active:scale-95 transition-all text-gray-600">
                                                    <Bell className="h-2.5 w-2.5 mb-0.5 text-amber-500" />
                                                    <span className="text-[6px] font-medium">{t('nav_alerts')}</span>
                                                </Link>
                                                <Link to="/settings" onClick={() => setIsOpen(false)} className="flex flex-col items-center justify-center p-0.5 rounded-md bg-white border border-gray-100 shadow-sm active:scale-95 transition-all text-gray-600">
                                                    <Settings className="h-2.5 w-2.5 mb-0.5 text-blue-500" />
                                                    <span className="text-[6px] font-medium">{t('nav_settings')}</span>
                                                </Link>
                                                <Link to="/help" onClick={() => setIsOpen(false)} className="flex flex-col items-center justify-center p-0.5 rounded-md bg-white border border-gray-100 shadow-sm active:scale-95 transition-all text-gray-600">
                                                    <HelpCircle className="h-2.5 w-2.5 mb-0.5 text-purple-500" />
                                                    <span className="text-[6px] font-medium">{t('nav_help')}</span>
                                                </Link>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => {
                                                logout();
                                                setIsOpen(false);
                                            }}
                                            className="w-full flex items-center justify-center space-x-1.5 px-3 py-1 rounded-lg border border-red-100 text-red-500 font-bold hover:bg-red-50 transition-colors active:scale-95 text-[9px]"
                                        >
                                            <LogOut className="h-2.5 w-2.5" />
                                            <span>{t('nav_logout')}</span>
                                        </button>
                                    </>
                                ) : (
                                    <Link to="/login" onClick={() => setIsOpen(false)} className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-xl bg-gray-900 text-white font-bold shadow-lg shadow-gray-900/20 active:scale-95 transition-all text-xs">
                                        <LogIn className="h-3.5 w-3.5" />
                                        <span>{t('nav_signin')}</span>
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav >
        </div >
    );
};

export default Navbar;
