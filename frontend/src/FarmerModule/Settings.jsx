import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Shield, Smartphone, Globe, Moon, Save, ArrowLeft, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../Context/LanguageContext';
import { useTheme } from '../Context/ThemeContext';

const Settings = () => {
    const { t, language, setLanguage } = useLanguage();
    const { isDarkMode, toggleTheme } = useTheme();
    const [notifications, setNotifications] = useState(true);
    const [dataSaver, setDataSaver] = useState(false);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    const Toggle = ({ checked, onChange }) => (
        <button
            onClick={() => onChange(!checked)}
            className={`cursor-pointer w-14 h-7 flex items-center rounded-full p-1 transition-all duration-300 ease-in-out border ${checked ? 'bg-gradient-to-r from-emerald-500 to-green-400 border-transparent shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-slate-100 border-slate-200 dark:bg-slate-700 dark:border-slate-600'}`}
        >
            <motion.div
                layout
                transition={{ type: "spring", stiffness: 700, damping: 30 }}
                className="w-5 h-5 rounded-full bg-white shadow-sm"
                style={{ marginLeft: checked ? 'auto' : '0' }}
            />
        </button>
    );

    return (
        <div className="min-h-screen relative overflow-hidden pb-32">
            {/* Decorative Background Elements - Fixed Gradient */}
            <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-green-50/80 via-emerald-50/50 to-transparent dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 pointer-events-none" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-100/40 rounded-full blur-[100px] mix-blend-multiply animate-blob animation-delay-2000 dark:bg-emerald-900/10 pointer-events-none" />
            <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] bg-blue-100/40 rounded-full blur-[100px] mix-blend-multiply animate-blob dark:bg-blue-900/10 pointer-events-none" />

            <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 relative z-10 pt-4">
                {/* Added 'pt-4' to push content down slightly more if needed, though surrounding layout usually handles it */}

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10 flex items-center gap-5 mt-4"
                >
                    <Link to="/" className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:scale-105 transition-all group dark:bg-slate-800 dark:border-slate-700">
                        <ArrowLeft className="h-6 w-6 text-slate-500 group-hover:text-emerald-600 transition-colors dark:text-slate-400" />
                    </Link>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight dark:text-white">
                            {t('nav_settings')}
                        </h1>
                        <p className="text-slate-500 font-medium text-lg dark:text-slate-400 mt-1">{t('settings_subtitle') || "Manage your preferences & app configuration"}</p>
                    </div>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-8"
                >
                    {/* Language Section - Cleaner Card */}
                    <motion.div variants={itemVariants} className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40 dark:bg-slate-800 dark:border-slate-700 dark:shadow-none relative overflow-visible ring-1 ring-slate-100 dark:ring-slate-700">
                        {/* Subtle decoration inside card */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-50 to-transparent rounded-tr-[2rem] rounded-bl-[4rem] pointer-events-none opacity-60" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl dark:bg-blue-900/30 dark:text-blue-400">
                                    <Globe className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">{t('settings_language') || "Language & Region"}</h2>
                                    <p className="text-slate-500 font-medium dark:text-slate-400">Select your preferred language interface.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                {[
                                    { code: 'EN', name: 'English', native: 'English', flag: '🇬🇧' },
                                    { code: 'HI', name: 'Hindi', native: 'हिंदी', flag: '🇮🇳' },
                                    { code: 'TA', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' }
                                ].map((lang) => (
                                    <motion.button
                                        key={lang.code}
                                        whileHover={{ scale: 1.03, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setLanguage(lang.code)}
                                        className={`relative group flex flex-col items-start justify-center p-5 rounded-2xl border-2 transition-all duration-200 ${language === lang.code
                                            ? 'border-emerald-500 bg-emerald-50/50 shadow-lg shadow-emerald-500/10 dark:bg-emerald-900/20 dark:border-emerald-500'
                                            : 'border-slate-100 bg-slate-50/50 hover:bg-white hover:border-emerald-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between w-full mb-3">
                                            <span className="text-3xl filter drop-shadow-sm">{lang.flag}</span>
                                            {language === lang.code && (
                                                <div className="bg-emerald-500 text-white p-1 rounded-full shadow-sm">
                                                    <Check className="h-3.5 w-3.5 stroke-[3px]" />
                                                </div>
                                            )}
                                        </div>
                                        <span className={`font-black text-lg mb-0.5 ${language === lang.code ? 'text-emerald-800 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200'}`}>
                                            {lang.native}
                                        </span>
                                        <span className={`text-sm font-semibold ${language === lang.code ? 'text-emerald-600/80 dark:text-emerald-500/80' : 'text-slate-400'}`}>
                                            {lang.name}
                                        </span>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Preferences Section - Cleaner Card */}
                    <motion.div variants={itemVariants} className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40 dark:bg-slate-800 dark:border-slate-700 dark:shadow-none relative overflow-hidden ring-1 ring-slate-100 dark:ring-slate-700">

                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3.5 bg-purple-50 text-purple-600 rounded-2xl dark:bg-purple-900/30 dark:text-purple-400">
                                    <Shield className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">{t('settings_general') || "App Preferences"}</h2>
                                    <p className="text-slate-500 font-medium dark:text-slate-400">Customize your app experience.</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* Notification Toggle */}
                                <div className="group flex items-center justify-between p-5 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:border-purple-200 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300 dark:bg-slate-800/50 dark:border-slate-700 dark:hover:border-slate-600">
                                    <div className="flex items-center gap-5">
                                        <div className="p-3 bg-white text-purple-600 rounded-2xl shadow-sm border border-slate-100 group-hover:scale-105 transition-transform dark:bg-slate-700 dark:border-slate-600 dark:text-purple-400">
                                            <Bell className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-purple-700 transition-colors">{t('settings_notifications') || "Push Notifications"}</h3>
                                            <p className="text-sm font-medium text-slate-400 dark:text-slate-500">{t('settings_notifications_desc') || "Stay updated on weather & crop health."}</p>
                                        </div>
                                    </div>
                                    <Toggle checked={notifications} onChange={setNotifications} />
                                </div>

                                {/* Dark Mode Toggle */}
                                <div className="group flex items-center justify-between p-5 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 dark:bg-slate-800/50 dark:border-slate-700 dark:hover:border-slate-600">
                                    <div className="flex items-center gap-5">
                                        <div className="p-3 bg-white text-slate-600 rounded-2xl shadow-sm border border-slate-100 group-hover:scale-105 transition-transform dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300">
                                            <Moon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-blue-700 transition-colors">{t('settings_darkmode') || "Dark Mode"}</h3>
                                            <p className="text-sm font-medium text-slate-400 dark:text-slate-500">{t('settings_darkmode_desc') || "Reduce eye strain at night."}</p>
                                        </div>
                                    </div>
                                    <Toggle checked={isDarkMode} onChange={toggleTheme} />
                                </div>

                                {/* Data Saver Toggle */}
                                <div className="group flex items-center justify-between p-5 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 dark:bg-slate-800/50 dark:border-slate-700 dark:hover:border-slate-600">
                                    <div className="flex items-center gap-5">
                                        <div className="p-3 bg-white text-emerald-600 rounded-2xl shadow-sm border border-slate-100 group-hover:scale-105 transition-transform dark:bg-slate-700 dark:border-slate-600 dark:text-emerald-400">
                                            <Smartphone className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-emerald-700 transition-colors">{t('settings_datasaver') || "Data Saver"}</h3>
                                            <p className="text-sm font-medium text-slate-400 dark:text-slate-500">{t('settings_datasaver_desc') || "Load compressed images to save data."}</p>
                                        </div>
                                    </div>
                                    <Toggle checked={dataSaver} onChange={setDataSaver} />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Save Button (Mock) */}
                    <motion.div variants={itemVariants} className="flex justify-end pt-4">
                        <button className="flex items-center gap-2 px-10 py-4 bg-gray-900 text-white font-bold rounded-2xl shadow-xl shadow-gray-900/20 hover:bg-gray-800 hover:shadow-2xl hover:shadow-gray-900/30 hover:-translate-y-1 transition-all">
                            <Save className="h-5 w-5" />
                            {t('profile_save') || "Save Changes"}
                        </button>
                    </motion.div>

                </motion.div>
            </div>
        </div>
    );
};

export default Settings;
