import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CloudRain, Wind, ThermometerSun, AlertTriangle, Droplets, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../Context/LanguageContext';

const WeatherAlerts = () => {
    const { t } = useLanguage();

    // Mock Data
    const alerts = [
        {
            id: 1,
            type: 'warning',
            title: t('alert_storm_title') || "Heavy Rain Alert",
            description: t('alert_storm_desc') || "Heavy rainfall expected in the next 24 hours. Ensure drainage channels are clear.",
            icon: CloudRain,
            color: "text-blue-500",
            bg: "bg-blue-50 dark:bg-blue-900/20",
            border: "border-blue-100 dark:border-blue-900/30"
        },
        {
            id: 2,
            type: 'caution',
            title: t('alert_wind_title') || "High Wind Warning",
            description: t('alert_wind_desc') || "Strong winds up to 40km/h. Secure loose farm equipment and support young saplings.",
            icon: Wind,
            color: "text-orange-500",
            bg: "bg-orange-50 dark:bg-orange-900/20",
            border: "border-orange-100 dark:border-orange-900/30"
        },
        {
            id: 3,
            type: 'info',
            title: t('alert_temp_title') || "Heat Wave Approaching",
            description: t('alert_temp_desc') || "Temperatures rising above 38°C. Increase irrigation frequency for sensitive crops.",
            icon: ThermometerSun,
            color: "text-red-500",
            bg: "bg-red-50 dark:bg-red-900/20",
            border: "border-red-100 dark:border-red-900/30"
        }
    ];

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

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-8 flex items-center gap-4">
                <Link to="/" className="p-2 rounded-xl bg-white shadow-sm hover:bg-gray-50 transition-colors dark:bg-slate-800 dark:hover:bg-slate-700">
                    <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-slate-300" />
                </Link>
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3 dark:text-white">
                        {t('nav_alerts')} <AlertTriangle className="h-8 w-8 text-farm-green" />
                    </h1>
                    <p className="text-gray-500 mt-1 dark:text-slate-400">{t('alerts_subtitle') || "Stay updated with real-time local weather warnings."}</p>
                </div>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
            >
                {alerts.map((alert) => {
                    const Icon = alert.icon;
                    return (
                        <motion.div
                            key={alert.id}
                            variants={itemVariants}
                            className={`flex flex-col md:flex-row items-start md:items-center gap-4 p-6 rounded-2xl border ${alert.border} ${alert.bg} shadow-sm backdrop-blur-sm relative overflow-hidden`}
                        >
                            <div className={`p-3 rounded-xl bg-white shadow-sm ${alert.color} dark:bg-slate-800/50`}>
                                <Icon className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className={`text-lg font-bold ${alert.color} mb-1`}>{alert.title}</h3>
                                <p className="text-gray-700 font-medium leading-relaxed dark:text-slate-300">{alert.description}</p>
                            </div>
                            <div className="md:border-l md:border-gray-200/50 md:pl-6 pt-2 md:pt-0 dark:border-slate-600/50">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/60 text-gray-500 shadow-sm border border-white/50 dark:bg-slate-800/60 dark:text-slate-400 dark:border-white/10">
                                    {t('alert_active') || "Active Now"}
                                </span>
                            </div>
                        </motion.div>
                    );
                })}

                {/* Additional Info Card */}
                <motion.div
                    variants={itemVariants}
                    className="mt-8 p-8 rounded-3xl bg-gradient-to-br from-farm-green to-emerald-700 text-white text-center shadow-xl shadow-green-500/20"
                >
                    <Droplets className="h-10 w-10 mx-auto mb-4 opacity-80" />
                    <h2 className="text-2xl font-bold mb-2">{t('alert_subscribe_title') || "Get SMS Alerts"}</h2>
                    <p className="text-emerald-100 max-w-lg mx-auto mb-6">
                        {t('alert_subscribe_desc') || "Register your mobile number to receive critical weather updates directly to your phone via SMS."}
                    </p>
                    <button className="px-6 py-3 bg-white text-farm-green rounded-xl font-bold hover:bg-emerald-50 transition-colors shadow-lg">
                        {t('alert_subscribe_btn') || "Subscribe Now"}
                    </button>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default WeatherAlerts;
