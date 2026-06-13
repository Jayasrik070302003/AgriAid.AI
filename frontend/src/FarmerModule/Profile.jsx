import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, MapPin, Save, Sprout, Activity, AlertTriangle, ShieldCheck, CheckCircle, X, Camera, Edit3, Loader2 } from 'lucide-react';
import { useAuth } from '../Context/AuthContext';
import { supabase } from '../services/supabaseClient';
import { toast } from 'react-hot-toast';

const STATS = [
    { label: 'Total Scans', key: 'total', icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/30' },
    { label: 'Healthy', key: 'healthy', icon: ShieldCheck, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/30' },
    { label: 'Issues', key: 'issues', icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/30' },
];

const Field = ({ icon: Icon, label, name, type = 'text', value, disabled, onChange }) => (
    <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider ml-1">{label}</label>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-slate-500">
                <Icon className="h-4 w-4" />
            </div>
            <input
                type={type}
                name={name}
                value={value}
                disabled={disabled}
                onChange={onChange}
                className="block w-full pl-10 pr-3 py-2.5 text-[13px] rounded-xl border transition-all font-medium
                    bg-gray-50 border-gray-200 text-gray-900
                    dark:bg-slate-700/50 dark:border-slate-600 dark:text-white
                    disabled:opacity-60 disabled:cursor-not-allowed
                    focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-700"
            />
        </div>
    </div>
);

const Profile = () => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [stats, setStats] = useState({ total: '—', healthy: '—', issues: '—' });
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        location: '',
        avatar: null,
    });
    const [preview, setPreview] = useState(null);
    const fileInputRef = React.useRef(null);

    // Load user data + scan stats on mount
    useEffect(() => {
        if (!user) return;
        setFormData(prev => ({
            ...prev,
            name: user.name || '',
            email: user.email || '',
        }));
        loadProfile();
        loadStats();
    }, [user]);

    const loadProfile = async () => {
        if (!user?.email) return;

        // Always load from localStorage first (instant)
        const cached = localStorage.getItem(`agriaid_profile_${user.email}`);
        if (cached) {
            const saved = JSON.parse(cached);
            setFormData(prev => ({ ...prev, ...saved }));
            if (saved.avatar) setPreview(saved.avatar);
        }

        // Then try Supabase to get latest
        if (!supabase) return;
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('name, phone, location, avatar_url')
                .eq('email', user.email)
                .single();
            if (error) {
                // Table missing or no row yet — localStorage already loaded above
                return;
            }
            if (data) {
                const merged = {
                    name: data.name || user.name || '',
                    phone: data.phone || '',
                    location: data.location || '',
                    avatar: data.avatar_url || null,
                };
                setFormData(prev => ({ ...prev, ...merged }));
                if (data.avatar_url) setPreview(data.avatar_url);
                // Sync back to localStorage
                localStorage.setItem(`agriaid_profile_${user.email}`, JSON.stringify(merged));
            }
        } catch (_) {}
    };

    const loadStats = async () => {
        if (!supabase) return;
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (!authUser) return;
            const { data } = await supabase
                .from('crop_scans')
                .select('disease_name')
                .eq('user_id', authUser.id);
            if (data) {
                const total = data.length;
                const healthy = data.filter(d => d.disease_name?.toLowerCase().includes('healthy')).length;
                setStats({ total, healthy, issues: total - healthy });
            }
        } catch (_) {}
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            let avatarUrl = formData.avatar;

            // Upload avatar if new image selected
            if (preview && preview !== formData.avatar && preview.startsWith('data:') && supabase) {
                const base64 = preview.split(',')[1];
                const byteArray = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
                const fileName = `avatar_${user.email}_${Date.now()}.jpg`;
                const { error: uploadError, data: uploadData } = await supabase.storage
                    .from('crop-images')
                    .upload(fileName, byteArray, { contentType: 'image/jpeg', upsert: true });
                if (!uploadError) {
                    const { data: { publicUrl } } = supabase.storage.from('crop-images').getPublicUrl(fileName);
                    avatarUrl = publicUrl;
                } else {
                    // Storage failed — keep base64 preview in localStorage
                    avatarUrl = preview;
                }
            } else if (preview && preview.startsWith('data:')) {
                avatarUrl = preview;
            }

            const profileToSave = {
                name: formData.name,
                phone: formData.phone,
                location: formData.location,
                avatar: avatarUrl,
            };

            // ✅ Always save to localStorage first (works even without Supabase)
            localStorage.setItem(`agriaid_profile_${user.email}`, JSON.stringify(profileToSave));

            // Try Supabase upsert
            if (supabase && user?.email) {
                const { error } = await supabase
                    .from('profiles')
                    .upsert({
                        email: user.email,
                        name: formData.name,
                        phone: formData.phone,
                        location: formData.location,
                        avatar_url: typeof avatarUrl === 'string' && avatarUrl.startsWith('http') ? avatarUrl : null,
                        updated_at: new Date().toISOString(),
                    }, { onConflict: 'email' });
                if (error) {
                    console.warn('Supabase profiles upsert failed (table may not exist):', error.message);
                    // Not throwing — localStorage save already succeeded
                }

                // Update display name in Supabase Auth
                await supabase.auth.updateUser({ data: { name: formData.name } });
            }

            setFormData(prev => ({ ...prev, ...profileToSave }));
            setPreview(avatarUrl);
            setIsEditing(false);
            toast.success('Profile saved!');
        } catch (err) {
            console.error('Save error:', err);
            toast.error('Failed to save. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setPreview(formData.avatar);
        setIsEditing(false);
    };

    const avatarSrc = isEditing ? (preview || formData.avatar) : (formData.avatar || preview);
    const initials = formData.name ? formData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'FA';

    return (
        <div className="max-w-3xl mx-auto pb-24 sm:pb-8 space-y-4 sm:space-y-6 px-0 sm:px-0">

            {/* Hero Card */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xl"
            >
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M0 20L20 0H10L0 10M20 20V10L10 20'/%3E%3C/g%3E%3C/svg%3E\")" }}
                />
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />

                <div className="relative p-5 sm:p-8">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <div
                                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-white/30 shadow-xl overflow-hidden bg-white/20 flex items-center justify-center cursor-pointer"
                                onClick={() => isEditing && fileInputRef.current?.click()}
                            >
                                {avatarSrc ? (
                                    <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-2xl sm:text-3xl font-black text-white">{initials}</span>
                                )}
                                {isEditing && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <Camera className="w-6 h-6 text-white" />
                                    </div>
                                )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-emerald-400 rounded-lg p-1.5 shadow-lg border-2 border-white/30">
                                <Sprout className="w-3 h-3 text-white" />
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </div>

                        {/* Name + location */}
                        <div className="text-center sm:text-left flex-1 min-w-0">
                            <h1 className="text-xl sm:text-2xl font-black text-white truncate">
                                {formData.name || 'Farmer'}
                            </h1>
                            <p className="text-emerald-100 text-xs sm:text-sm mt-1 flex items-center justify-center sm:justify-start gap-1.5">
                                <MapPin className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">{formData.location || 'Location not set'}</span>
                            </p>
                            <p className="text-emerald-200 text-xs mt-0.5">{formData.email}</p>
                        </div>

                        {/* Edit button */}
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-white text-xs font-bold transition-all border border-white/20"
                            >
                                <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                            </button>
                        )}
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-5">
                        {STATS.map((s) => (
                            <div key={s.key} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10 text-center">
                                <s.icon className="w-4 h-4 mx-auto mb-1 text-emerald-200" />
                                <div className="text-lg sm:text-xl font-black text-white">{stats[s.key]}</div>
                                <div className="text-[10px] text-emerald-200 font-semibold">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Form Card */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden"
            >
                {/* Card Header */}
                <div className="px-5 sm:px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between bg-gray-50/50 dark:bg-slate-800/50">
                    <div>
                        <h2 className="text-sm font-bold text-gray-900 dark:text-white">Personal Details</h2>
                        <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
                            {isEditing ? 'Make your changes and save' : 'Your profile information'}
                        </p>
                    </div>
                    <AnimatePresence mode="wait">
                        {isEditing ? (
                            <motion.div key="editing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                                <button
                                    onClick={handleCancel}
                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-all disabled:opacity-60 shadow-lg shadow-emerald-500/20"
                                >
                                    {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </motion.div>
                        ) : (
                            <motion.button
                                key="view"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all"
                            >
                                <Edit3 className="w-3.5 h-3.5" /> Edit
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>

                {/* Fields */}
                <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field icon={User} label="Full Name" name="name" value={formData.name} disabled={!isEditing} onChange={handleChange} />
                    <Field icon={Mail} label="Email Address" name="email" type="email" value={formData.email} disabled onChange={handleChange} />
                    <Field icon={Phone} label="Phone Number" name="phone" type="tel" value={formData.phone} disabled={!isEditing} onChange={handleChange} />
                    <Field icon={MapPin} label="Farm Location" name="location" value={formData.location} disabled={!isEditing} onChange={handleChange} />
                </div>

                {/* Email locked note */}
                <div className="px-5 sm:px-6 pb-5">
                    <p className="text-[11px] text-gray-400 dark:text-slate-500 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-slate-600 inline-block" />
                        Email address cannot be changed. Contact support if needed.
                    </p>
                </div>
            </motion.div>

            {/* Account Info Card */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 p-5 sm:p-6"
            >
                <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Account Info</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                        { label: 'Account Type', value: 'Farmer' },
                        { label: 'Member Since', value: '2025' },
                        { label: 'Status', value: 'Active ✓' },
                    ].map(({ label, value }) => (
                        <div key={label} className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3 border border-gray-100 dark:border-slate-600">
                            <p className="text-[10px] text-gray-400 dark:text-slate-500 font-semibold uppercase tracking-wider mb-1">{label}</p>
                            <p className="text-sm font-bold text-gray-800 dark:text-white">{value}</p>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default Profile;
