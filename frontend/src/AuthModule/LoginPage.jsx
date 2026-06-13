import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sprout, Loader2, Leaf } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { toast } from 'react-hot-toast';
import Loader from '../SharedComponents/Loader';

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
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
        setIsLoading(true);
        setError('');
        const loginToast = toast.loading('Securing your session...');
        try {
            await login({ email: formData.email, password: formData.password });
            toast.success('Welcome back to AgriAid!', { id: loginToast });
            navigate(from, { replace: true });
        } catch (err) {
            const msg = err.message || 'Login failed. Check your credentials.';
            setError(msg);
            toast.dismiss(loginToast);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen w-full flex bg-[#0B1120] font-sans overflow-hidden">
            {isLoading && <Loader message="Logging in..." />}

            {/* Left Panel - Image / Brand Showcase (Hidden on Mobile) */}
            {/* Left Panel - Image / Brand Showcase (Hidden on Mobile) */}
            <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-black">
                {/* Background Image */}
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-80"
                    style={{ backgroundImage: "url('/farmer_working_bg.png')" }}
                />
                
                {/* Top: Logo */}
                <Link to="/" className="relative z-10 flex items-center gap-3 w-fit bg-black/30 p-2 pr-4 rounded-2xl backdrop-blur-sm border border-white/10">
                    <img src="/agriaid_logo.png" alt="AgriAid Logo" className="w-10 h-10 rounded-xl object-cover shadow-lg border border-emerald-500/20" />
                    <span className="text-2xl font-bold !text-white tracking-tight drop-shadow-md">
                        AgriAid<span className="text-emerald-400">.AI</span>
                    </span>
                </Link>
            </div>

            {/* Right Panel - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-4 sm:p-12 relative min-h-screen">
                {/* Mobile Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none lg:hidden">
                    <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-emerald-900/20 blur-[100px]" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-teal-900/20 blur-[100px]" />
                </div>

                <div className="w-full max-w-[400px] relative z-10 flex flex-col">

                    {/* Mobile Logo Header */}
                    <div className="flex flex-col items-center mb-4 sm:mb-8 lg:hidden">
                        <img src="/agriaid_logo.png" alt="AgriAid Logo" className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl shadow-lg shadow-emerald-500/20 mb-2 sm:mb-3 border border-emerald-500/20" />
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-0.5"
                            style={{ textShadow: '0 0 20px rgba(16,185,129,0.4)' }}>
                            <span className="!text-white drop-shadow-lg">AgriAid</span>
                            <span className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]">.AI</span>
                        </h1>
                        <p className="text-slate-400 text-xs mt-1 font-medium">Sign in to your farm dashboard</p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full bg-[#111827]/60 backdrop-blur-2xl rounded-2xl p-5 sm:p-8 shadow-2xl border border-white/5"
                    >
                        {/* Desktop Header */}
                        <div className="hidden lg:block mb-8">
                            <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                            <p className="text-slate-400 text-sm font-medium">Sign in to your account to continue</p>
                        </div>
                        {/* Mobile Header */}
                        <h2 className="text-lg sm:text-xl font-bold text-white mb-4 text-center lg:hidden">Welcome Back</h2>

                        {error && (
                            <div className="mb-3 flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                                <span className="text-red-400 text-base">⚠️</span>
                                <p className="text-red-400 text-xs font-medium">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-5">
                            {/* Email Field */}
                            <div className="space-y-1">
                                <label className="block text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                                        <Mail className="h-4 w-4" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="block w-full pl-9 pr-4 py-2.5 sm:py-3.5 bg-[#0B1120]/50 border border-slate-700/50 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                                        placeholder="farmer@example.com"
                                        style={{ WebkitBoxShadow: '0 0 0px 1000px #080c17 inset', WebkitTextFillColor: 'white' }}
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-1">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="block text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider">Password</label>
                                    <button
                                        type="button"
                                        onClick={() => toast('Password reset: contact support.', { icon: 'ℹ️' })}
                                        className="text-[10px] sm:text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                                        <Lock className="h-4 w-4" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="block w-full pl-9 pr-10 py-2.5 sm:py-3.5 bg-[#0B1120]/50 border border-slate-700/50 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                                        placeholder="••••••••"
                                        style={{ WebkitBoxShadow: '0 0 0px 1000px #080c17 inset', WebkitTextFillColor: 'white' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-emerald-400 transition-colors cursor-pointer"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center items-center py-2.5 sm:py-4 px-4 mt-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-sm font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <Loader2 className="animate-spin h-4 w-4" />
                                ) : (
                                    <>
                                        Sign In <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Sign Up Link */}
                        <div className="mt-4 sm:mt-8 pt-3 sm:pt-6 border-t border-white/5 text-center">
                            <p className="text-xs sm:text-sm text-slate-400 font-medium">
                                Don't have an account?{' '}
                                <Link to="/register" className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors ml-1">
                                    Sign Up
                                </Link>
                            </p>
                        </div>
                    </motion.div>

                    <div className="mt-3 text-center lg:hidden">
                        <p className="text-slate-600 text-[10px] uppercase tracking-widest font-semibold">
                            &copy; 2026 AgriAid AI Systems
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
