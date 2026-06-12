import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudRain, Wind, ThermometerSun, AlertTriangle, Droplets, ArrowLeft, MapPin, RefreshCw, Zap, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../Context/LanguageContext';
import { toast } from 'react-hot-toast';
import useGPS from '../hooks/useGPS';
import apiClient from '../services/apiClient';

const WeatherAlerts = () => {
    const { t } = useLanguage();
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [weatherData, setWeatherData] = useState(null);
    const { location, loading: gpsLoading, detect: detectGPS } = useGPS();

    useEffect(() => {
        if (location.lat && location.lng) {
            fetchWeatherAlerts(location.lat, location.lng);
        }
    }, [location]);

    const fetchWeatherAlerts = async (lat, lng) => {
        setLoading(true);
        try {
            const res = await apiClient.get(`/simulator/weather-live?lat=${lat}&lng=${lng}`);
            if (res.data.success && res.data.data) {
                const weather = res.data.data;
                setWeatherData(weather);
                generateAlerts(weather);
                toast.success('Weather alerts updated!');
            }
        } catch (error) {
            toast.error('Failed to fetch weather data');
        } finally {
            setLoading(false);
        }
    };

    const generateAlerts = (weather) => {
        const newAlerts = [];
        
        // Temperature alerts
        if (weather.temp > 35) {
            newAlerts.push({
                id: 'heat',
                type: 'critical',
                title: 'Heat Wave Alert',
                description: `High temperature of ${weather.temp}°C detected. Increase irrigation frequency and provide shade for sensitive crops.`,
                icon: ThermometerSun,
                color: 'text-red-500',
                bg: 'bg-red-50 dark:bg-red-900/20',
                border: 'border-red-200 dark:border-red-900/30'
            });
        } else if (weather.temp < 10) {
            newAlerts.push({
                id: 'cold',
                type: 'warning',
                title: 'Cold Temperature Alert',
                description: `Low temperature of ${weather.temp}°C detected. Protect frost-sensitive crops.`,
                icon: ThermometerSun,
                color: 'text-blue-500',
                bg: 'bg-blue-50 dark:bg-blue-900/20',
                border: 'border-blue-200 dark:border-blue-900/30'
            });
        }

        // Wind alerts
        if (weather.windSpeed > 30) {
            newAlerts.push({
                id: 'wind',
                type: 'warning',
                title: 'High Wind Warning',
                description: `Strong winds at ${weather.windSpeed} km/h. Secure loose equipment and support young plants.`,
                icon: Wind,
                color: 'text-orange-500',
                bg: 'bg-orange-50 dark:bg-orange-900/20',
                border: 'border-orange-200 dark:border-orange-900/30'
            });
        }

        // Humidity alerts
        if (weather.humidity > 85) {
            newAlerts.push({
                id: 'humidity',
                type: 'caution',
                title: 'High Humidity Alert',
                description: `Humidity at ${weather.humidity}%. Increased risk of fungal diseases. Monitor crops closely.`,
                icon: Droplets,
                color: 'text-teal-500',
                bg: 'bg-teal-50 dark:bg-teal-900/20',
                border: 'border-teal-200 dark:border-teal-900/30'
            });
        }

        // Rain alerts
        if (weather.precipitation > 20) {
            newAlerts.push({
                id: 'rain',
                type: 'warning',
                title: 'Heavy Rainfall Expected',
                description: `${weather.precipitation}mm rainfall detected. Ensure proper drainage to prevent waterlogging.`,
                icon: CloudRain,
                color: 'text-blue-600',
                bg: 'bg-blue-50 dark:bg-blue-900/20',
                border: 'border-blue-200 dark:border-blue-900/30'
            });
        }

        // If no alerts, add a safe condition message
        if (newAlerts.length === 0) {
            newAlerts.push({
                id: 'safe',
                type: 'info',
                title: 'Favorable Conditions',
                description: 'Weather conditions are currently favorable for farming activities. No alerts at this time.',
                icon: Zap,
                color: 'text-emerald-500',
                bg: 'bg-emerald-50 dark:bg-emerald-900/20',
                border: 'border-emerald-200 dark:border-emerald-900/30'
            });
        }

        setAlerts(newAlerts);
    };

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
        <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link to="/" className="p-2 rounded-lg bg-white shadow-sm hover:bg-gray-50 transition-colors dark:bg-slate-800 dark:hover:bg-slate-700">
                        <ArrowLeft className="h-4 w-4 text-gray-600 dark:text-slate-300" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2 dark:text-white">
                            {t('nav_alerts')} <AlertTriangle className="h-5 w-5 text-farm-green" />
                        </h1>
                        <p className="text-gray-500 text-[11px] mt-0.5 dark:text-slate-400">{t('alerts_subtitle') || "Real-time weather warnings for your location"}</p>
                    </div>
                </div>
                
                <button
                    onClick={detectGPS}
                    disabled={gpsLoading || loading}
                    className="px-4 py-2 bg-farm-green text-white rounded-lg text-xs font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
                >
                    {gpsLoading || loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <MapPin className="h-3.5 w-3.5" />}
                    {gpsLoading || loading ? 'Loading...' : 'Detect Location'}
                </button>
            </div>

            {/* Weather Summary Card */}
            {weatherData && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-4 rounded-xl bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-800 dark:to-slate-800/50 border border-gray-200 dark:border-slate-700 shadow-sm"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Current Weather</p>
                            <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mt-0.5 flex items-center gap-1.5">
                                <MapPin className="h-3 w-3" />
                                {location.district}, {location.state}
                            </p>
                        </div>
                        <div className="flex items-center gap-4 text-[11px] font-semibold">
                            <div className="text-center">
                                <ThermometerSun className="h-4 w-4 text-orange-500 mx-auto mb-1" />
                                <span className="text-gray-700 dark:text-slate-300">{weatherData.temp}°C</span>
                            </div>
                            <div className="text-center">
                                <Droplets className="h-4 w-4 text-blue-500 mx-auto mb-1" />
                                <span className="text-gray-700 dark:text-slate-300">{weatherData.humidity}%</span>
                            </div>
                            <div className="text-center">
                                <Wind className="h-4 w-4 text-teal-500 mx-auto mb-1" />
                                <span className="text-gray-700 dark:text-slate-300">{weatherData.windSpeed}km/h</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-3"
            >
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center justify-center py-12"
                        >
                            <RefreshCw className="h-8 w-8 text-farm-green animate-spin" />
                        </motion.div>
                    ) : alerts.length > 0 ? (
                        alerts.map((alert) => {
                            const Icon = alert.icon;
                            return (
                                <motion.div
                                    key={alert.id}
                                    variants={itemVariants}
                                    className={`flex flex-col md:flex-row items-start md:items-center gap-3 p-4 rounded-xl border ${alert.border} ${alert.bg} shadow-sm backdrop-blur-sm relative overflow-hidden`}
                                >
                                    <div className={`p-2 rounded-lg bg-white shadow-sm ${alert.color} dark:bg-slate-800/50`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={`text-sm font-bold ${alert.color} mb-0.5`}>{alert.title}</h3>
                                        <p className="text-gray-700 text-[12px] font-medium leading-relaxed dark:text-slate-300">{alert.description}</p>
                                    </div>
                                    <div className="md:border-l md:border-gray-200/50 md:pl-4 pt-2 md:pt-0 dark:border-slate-600/50">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/60 text-gray-500 shadow-sm border border-white/50 dark:bg-slate-800/60 dark:text-slate-400 dark:border-white/10">
                                            <Clock className="h-3 w-3" />
                                            {t('alert_active') || "Active"}
                                        </span>
                                    </div>
                                </motion.div>
                            );
                        })
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12 text-gray-500 dark:text-slate-400"
                        >
                            <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p className="text-sm font-medium">Click "Detect Location" to fetch weather alerts</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Additional Info Card */}
                {alerts.length > 0 && (
                    <motion.div
                        variants={itemVariants}
                        className="mt-5 p-5 rounded-2xl bg-gradient-to-br from-farm-green to-emerald-700 text-white text-center shadow-lg shadow-green-500/20"
                    >
                        <Droplets className="h-8 w-8 mx-auto mb-3 opacity-80" />
                        <h2 className="text-base font-bold mb-1.5">{t('alert_subscribe_title') || "Get SMS Alerts"}</h2>
                        <p className="text-emerald-100 text-[11px] max-w-lg mx-auto mb-4 leading-relaxed">
                            {t('alert_subscribe_desc') || "Register your mobile number to receive critical weather updates directly via SMS."}
                        </p>
                        <button className="px-5 py-2 bg-white text-farm-green rounded-lg text-xs font-bold hover:bg-emerald-50 transition-colors shadow-md">
                            {t('alert_subscribe_btn') || "Subscribe Now"}
                        </button>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default WeatherAlerts;
