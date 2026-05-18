import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sprout, Loader2, Leaf } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../Context/LanguageContext';
import { useAuth } from '../Context/AuthContext';
import { toast } from 'react-hot-toast';
import Loader from '../SharedComponents/Loader';

const LoginPage = () => {
    const { t } = useLanguage();
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const loginToast = toast.loading(t('login_progress') || 'Securing your session...');

        // Simulate API call for now
        setTimeout(() => {
            setIsLoading(false);
            login({
                name: 'Test Farmer',
                email: formData.email,
            });
            toast.success(t('login_success') || 'Welcome back to AgriAid!', { id: loginToast });
            navigate(from, { replace: true });
        }, 1500);
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gray-900">
            {isLoading && <Loader message={t('login_logging_in') || "Logging in..."} />}

            {/* 1. Dynamic Background */}
            <div className="absolute inset-0 w-full h-full">
                {/* Main Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-no-repeat transform scale-105"
                    style={{
                        backgroundImage: "url('/login_bg_v4.png')",
                        backgroundPosition: "center center"
                    }}
                />

                {/* Dark Overlay Gradient for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-emerald-950/40" />

                {/* Animated Particles/Orbs (Subtle) */}
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-emerald-500/20 rounded-full mix-blend-screen filter blur-[120px] animate-pulse opacity-40" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-teal-600/20 rounded-full mix-blend-screen filter blur-[120px] animate-pulse opacity-40 animation-delay-4000" />
            </div>

            {/* 2. Brand Logo (Top Left) */}
            <div className="absolute top-6 left-6 md:top-8 md:left-8 z-30">
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-2.5 rounded-xl group-hover:bg-emerald-500/20 transition-all duration-300 shadow-2xl shadow-black/20">
                        <Leaf className="h-6 w-6 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-bold tracking-tight text-white leading-none drop-shadow-lg">
                            AgriAid<span className="text-emerald-400">.AI</span>
                        </span>
                        <span className="text-[10px] font-medium text-emerald-200/60 tracking-widest uppercase">SMART FARMING</span>
                    </div>
                </Link>
            </div>

            {/* 3. Glassmorphism Login Card */}
            <div className="w-full max-w-[380px] md:max-w-[480px] px-4 relative z-20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="bg-black/40 backdrop-blur-xl rounded-[24px] shadow-2xl shadow-black/60 p-6 md:p-10 border border-white/10 relative overflow-hidden"
                >
                    {/* Glowing Top Border */}
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

                    <div className="text-center mb-8 mt-2">
                        <motion.div
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex flex-col items-center justify-center"
                        >
                            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 rounded-2xl flex items-center justify-center text-emerald-400 mb-4 shadow-lg border border-emerald-500/20 ring-4 ring-emerald-500/5">
                                <Sprout className="h-8 w-8 drop-shadow-md" />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight drop-shadow-sm">
                                {t('login_welcome')}
                            </h2>
                            <p className="text-emerald-100/60 text-xs md:text-sm mt-2 font-medium">
                                {t('login_subtitle')}
                            </p>
                        </motion.div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold text-emerald-200/70 uppercase tracking-wider ml-1">
                                {t('login_email')}
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-500/50 group-focus-within:text-emerald-400 transition-colors">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="block w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-emerald-100/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300 backdrop-blur-sm sm:text-sm shadow-inner hover:bg-white/10"
                                    placeholder="farmer@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between ml-1">
                                <label className="block text-[10px] font-bold text-emerald-200/70 uppercase tracking-wider">
                                    {t('login_password')}
                                </label>
                                <a href="#" className="text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                                    {t('login_forgot')}
                                </a>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-500/50 group-focus-within:text-emerald-400 transition-colors">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="block w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-emerald-100/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300 backdrop-blur-sm sm:text-sm shadow-inner hover:bg-white/10"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-emerald-500/50 hover:text-emerald-300 transition-colors cursor-pointer"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center py-4 px-4 mt-6 border border-emerald-500/30 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] active:scale-[0.98]"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                    {t('login_logging_in')}
                                </>
                            ) : (
                                <>
                                    {t('login_btn')} <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/10 text-center">
                        <p className="text-sm font-medium text-emerald-100/60">
                            {t('login_no_account')}{' '}
                            <Link to="/register" className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors ml-1 inline-flex items-center group">
                                {t('login_signup')}
                                <ArrowRight className="h-3 w-3 ml-1 transform group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </p>
                    </div>
                </motion.div>

                {/* 4. Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 text-center relative z-20"
                >
                    <p className="text-white/30 text-[10px] font-medium tracking-[0.2em] uppercase">
                        &copy; 2026 AgriAid AI Systems
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default LoginPage;
