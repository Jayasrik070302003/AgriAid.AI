import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, MapPin, Save, Sprout, Activity, AlertTriangle, ShieldCheck, CheckCircle, X, Camera } from 'lucide-react';
import { useLanguage } from '../Context/LanguageContext';
import { useAuth } from '../Context/AuthContext';

const Profile = () => {
    const { t } = useLanguage();
    const { user } = useAuth();

    // Placeholder stats - in a real app, these would come from the backend
    const stats = [
        { label: 'profile_stat_scans', value: '124', icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/30' },
        { label: 'profile_stat_healthy', value: '86', icon: ShieldCheck, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/30' },
        { label: 'profile_stat_issues', value: '38', icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/30' },
    ];

    const [isEditing, setIsEditing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || 'Test Farmer',
        email: user?.email || 'farmer@example.com',
        phone: '+91 98765 43210',
        location: 'Pune, Maharashtra',
        avatar: user?.avatar || null
    });

    const fileInputRef = React.useRef(null);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    avatar: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = () => {
        setIsEditing(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 relative">
            {/* Success Notification */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: -50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: -50, x: '-50%' }}
                        className="fixed top-24 left-1/2 z-50 flex items-center gap-3 bg-white px-6 py-4 rounded-2xl shadow-2xl shadow-green-500/20 border border-green-100 dark:bg-slate-800 dark:border-green-900/30 dark:shadow-none"
                    >
                        <div className="bg-green-100 p-2 rounded-full dark:bg-green-900/30">
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Success</h4>
                            <p className="text-xs text-gray-500 dark:text-slate-400">Profile updated successfully!</p>
                        </div>
                        <button
                            onClick={() => setShowSuccess(false)}
                            className="ml-4 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors dark:hover:bg-slate-700 dark:text-slate-500 dark:hover:text-white"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header / Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 relative overflow-hidden dark:bg-slate-800 dark:border-slate-700"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-farm-green/5 rounded-bl-full -mr-16 -mt-16 z-0" />

                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
                    {/* Avatar */}
                    <div className="relative group cursor-pointer" onClick={() => isEditing && fileInputRef.current.click()}>
                        <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden relative">
                            {formData.avatar ? (
                                <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User className="h-16 w-16 text-gray-400" />
                            )}

                            {/* Overlay for Edit Mode */}
                            {isEditing && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="h-8 w-8 text-white" />
                                </div>
                            )}
                        </div>

                        {/* Status Icon (Sprout) */}
                        <div className="absolute bottom-1 right-1 bg-farm-green text-white p-2 rounded-full shadow-lg border-2 border-white pointer-events-none">
                            <Sprout className="h-4 w-4" />
                        </div>

                        {/* Hidden File Input */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
                    </div>

                    {/* Info */}
                    <div className="text-center md:text-left flex-1">
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight dark:text-white">{formData.name}</h1>
                        <p className="text-gray-500 mt-1 flex items-center justify-center md:justify-start gap-2 dark:text-slate-400">
                            <MapPin className="h-4 w-4" /> {formData.location}
                        </p>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-4 mt-8">
                            {stats.map((stat, idx) => (
                                <div key={idx} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 dark:bg-slate-700 dark:border-slate-600">
                                    <div className={`${stat.bg} w-10 h-10 rounded-xl flex items-center justify-center mb-3 mx-auto md:mx-0`}>
                                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide dark:text-slate-400">{t(stat.label)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Details Form */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden dark:bg-slate-800 dark:border-slate-700"
            >
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('profile_details')}</h2>
                    <button
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${isEditing
                            ? 'bg-farm-green text-white hover:bg-emerald-600 shadow-green-200 dark:hover:bg-emerald-500'
                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:hover:bg-slate-600'
                            }`}
                    >
                        {isEditing ? t('profile_save') : 'Edit Profile'}
                    </button>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1 dark:text-slate-300">{t('profile_name')}</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                <User className="h-5 w-5" />
                            </div>
                            <input
                                type="text"
                                name="name"
                                disabled={!isEditing}
                                value={formData.name}
                                onChange={handleChange}
                                className="block w-full pl-11 pr-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:border-farm-green focus:ring-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed font-medium text-gray-900 dark:bg-slate-700 dark:text-white dark:focus:bg-slate-800"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1 dark:text-slate-300">{t('profile_email')}</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                <Mail className="h-5 w-5" />
                            </div>
                            <input
                                type="email"
                                name="email"
                                disabled={!isEditing}
                                value={formData.email}
                                onChange={handleChange}
                                className="block w-full pl-11 pr-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:border-farm-green focus:ring-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed font-medium text-gray-900 dark:bg-slate-700 dark:text-white dark:focus:bg-slate-800"
                            />
                        </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1 dark:text-slate-300">{t('profile_phone')}</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                <Phone className="h-5 w-5" />
                            </div>
                            <input
                                type="tel"
                                name="phone"
                                disabled={!isEditing}
                                value={formData.phone}
                                onChange={handleChange}
                                className="block w-full pl-11 pr-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:border-farm-green focus:ring-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed font-medium text-gray-900 dark:bg-slate-700 dark:text-white dark:focus:bg-slate-800"
                            />
                        </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1 dark:text-slate-300">{t('profile_location')}</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                <MapPin className="h-5 w-5" />
                            </div>
                            <input
                                type="text"
                                name="location"
                                disabled={!isEditing}
                                value={formData.location}
                                onChange={handleChange}
                                className="block w-full pl-11 pr-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:border-farm-green focus:ring-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed font-medium text-gray-900 dark:bg-slate-700 dark:text-white dark:focus:bg-slate-800"
                            />
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Profile;
