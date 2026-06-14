import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sprout, LogIn, LayoutDashboard, Menu, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useAuth } from '../Context/AuthContext';
import { User, LogOut, HelpCircle, Wrench, Calendar, Leaf, FileText, TrendingUp } from 'lucide-react';
import ThemeSwitcher from './ThemeSwitcher';
import logoImg from '../assets/agriaid-logo.png';

const Navbar = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const location = useLocation();
    const { user, isAuthenticated, logout } = useAuth();

    const navLinks = [
        { name: 'Analyze Crop', path: '/', icon: Sprout },
    ];

    const tools = [
        { name: 'Crop Calendar',       path: '/tools/crop-calendar',     icon: Calendar,    color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/30' },
        { name: 'Government Schemes',  path: '/tools/government-schemes', icon: FileText,    color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-900/30'   },
        { name: 'Organic Guide',       path: '/tools/organic-guide',      icon: Leaf,        color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-900/30' },
        { name: 'Impact Simulator',    path: '/tools/impact-simulator',   icon: TrendingUp,  color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/30' },
    ];

    return (
        <div className="sticky top-0 left-0 right-0 z-50">
            <nav className="backdrop-blur-md bg-white/75 border-b border-gray-200/50 dark:bg-slate-900/80 dark:border-slate-800 transition-colors duration-300">
                <div className="h-[62px] px-4 md:px-6 flex items-center justify-between w-full max-w-7xl mx-auto">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 text-[18px] font-semibold text-gray-900 dark:text-white group select-none">
                        <img src={logoImg} alt="AgriAid.AI Logo" className="h-6 w-auto object-contain" />
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
                                        'flex items-center gap-1.5 text-[14px] font-medium px-3 py-1.5 rounded-full cursor-pointer transition-colors duration-200 shrink-0',
                                        isActive
                                            ? 'bg-green-600/10 text-farm-green dark:bg-green-500/20 dark:text-emerald-400'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-slate-800 dark:hover:text-white'
                                    )}
                                >
                                    <Icon className="h-4 w-4 shrink-0" />
                                    <span className="whitespace-nowrap">{link.name}</span>
                                </Link>
                            );
                        })}

                        {/* Tools Dropdown */}
                        <div className="relative group">
                            <button className="flex items-center gap-1.5 text-[14px] font-medium px-3 py-1.5 rounded-full cursor-pointer transition-colors duration-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-slate-800 dark:hover:text-white shrink-0">
                                <Wrench className="h-4 w-4 shrink-0" />
                                <span className="whitespace-nowrap">Tools</span>
                                <ChevronDown className="h-3 w-3 opacity-60 shrink-0" />
                            </button>
                            <div className="absolute top-full left-0 mt-2 min-w-[14rem] w-max max-w-xs bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-1 dark:bg-slate-800 dark:border-slate-700">
                                <div className="text-[10px] font-bold text-gray-400 px-3 py-1.5 uppercase tracking-wider">
                                    Farmer Tools
                                </div>
                                {tools.map((tool) => (
                                    <Link
                                        key={tool.name}
                                        to={tool.path}
                                        className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors flex items-center space-x-2.5 group/item dark:hover:bg-slate-700"
                                    >
                                        <tool.icon className={clsx('h-4 w-4 shrink-0', tool.color)} />
                                        <span className="text-[13px] font-medium text-gray-700 group-hover/item:text-gray-900 transition-colors dark:text-slate-300 dark:group-hover/item:text-white leading-tight">{tool.name}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Actions */}
                    <div className="hidden md:flex items-center gap-2">
                        <ThemeSwitcher />

                        {isAuthenticated ? (
                            <div className="relative group">
                                <button className="h-[36px] pl-1.5 pr-3 flex items-center gap-2 text-[13px] font-medium bg-gray-100/80 text-gray-700 rounded-full hover:bg-gray-200 transition-colors dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 shrink-0">
                                    <div className="w-[26px] h-[26px] rounded-full bg-white shadow-sm flex items-center justify-center text-farm-green dark:bg-slate-700 dark:text-emerald-400 shrink-0">
                                        <User className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="max-w-[120px] truncate">{user?.name}</span>
                                </button>
                                <div className="absolute top-full right-0 mt-2 min-w-[14rem] w-max max-w-xs bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-1 dark:bg-slate-800 dark:border-slate-700">
                                    <div className="px-4 py-2 border-b border-gray-50 dark:border-slate-700/50">
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wide dark:text-slate-400">Hello,</p>
                                        <p className="text-[13px] font-semibold text-gray-900 dark:text-white mt-0.5 leading-tight">{user?.name}</p>
                                    </div>
                                    <Link to="/" className="w-full text-left px-4 py-2 text-[13px] text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center gap-2 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white">
                                        <LayoutDashboard className="h-[14px] w-[14px] shrink-0" />
                                        <span>Dashboard</span>
                                    </Link>
                                    <Link to="/profile" className="w-full text-left px-4 py-2 text-[13px] text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center gap-2 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white">
                                        <User className="h-[14px] w-[14px] shrink-0" />
                                        <span>My Profile</span>
                                    </Link>
                                    <Link to="/help" className="w-full text-left px-4 py-2 text-[13px] text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center gap-2 border-b border-gray-50 pb-2 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white dark:border-slate-700/50">
                                        <HelpCircle className="h-[14px] w-[14px] shrink-0" />
                                        <span>Help & Support</span>
                                    </Link>
                                    <button onClick={logout} className="w-full text-left px-4 py-2 text-[13px] text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 mt-1 dark:text-red-400 dark:hover:bg-red-900/20">
                                        <LogOut className="h-[14px] w-[14px] shrink-0" />
                                        <span>Log Out</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Link to="/login" className="h-[34px] px-4 flex items-center justify-center gap-2 text-[13px] font-medium bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-all shadow-sm active:scale-95 dark:bg-slate-100 dark:text-gray-900 dark:hover:bg-white shrink-0">
                                <span className="whitespace-nowrap">Sign In</span>
                                <LogIn className="h-[14px] w-[14px] shrink-0" />
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-3">
                        <ThemeSwitcher />
                        <button onClick={() => setIsOpen(!isOpen)} className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                            {isOpen ? <X className="h-[18px] w-[18px]" /> : <Menu className="h-[18px] w-[18px]" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="md:hidden absolute top-[calc(100%+8px)] right-4 w-[280px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-gray-200/60 dark:border-slate-700/60 rounded-2xl shadow-2xl origin-top-right overflow-hidden z-50"
                        >
                            <div className="px-3 py-4 space-y-5 max-h-[80vh] overflow-y-auto no-scrollbar">

                                {/* Main links */}
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
                                                    'flex items-center space-x-2.5 px-3 py-2 rounded-xl transition-all text-[14px]',
                                                    isActive
                                                        ? 'bg-green-50 text-farm-green dark:bg-emerald-500/10 dark:text-emerald-400 font-bold'
                                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 font-medium'
                                                )}
                                            >
                                                <Icon className={clsx('h-4 w-4', isActive ? 'stroke-[2.5px]' : 'stroke-2')} />
                                                <span>{link.name}</span>
                                            </Link>
                                        );
                                    })}
                                </div>

                                {/* Mobile Tools */}
                                <div>
                                    <div className="px-2 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Farmer Tools</div>
                                    <div className="grid grid-cols-1 gap-1.5">
                                        {tools.map((tool) => (
                                            <Link
                                                key={tool.name}
                                                to={tool.path}
                                                onClick={() => setIsOpen(false)}
                                                className="flex items-center space-x-2.5 p-2 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 hover:border-emerald-500/50 active:scale-95 transition-all"
                                            >
                                                <div className={`p-1.5 rounded-lg ${tool.bg} ${tool.color} shadow-sm shrink-0`}>
                                                    <tool.icon className="h-3.5 w-3.5" />
                                                </div>
                                                <span className="text-[13px] font-semibold text-gray-700 dark:text-slate-200">{tool.name}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                {/* User section */}
                                {isAuthenticated ? (
                                    <div className="pt-2 border-t border-gray-100 dark:border-slate-800">
                                        <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-3 border border-gray-100 dark:border-slate-700 mb-2">
                                            <div className="flex items-center space-x-2.5 mb-3">
                                                <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center text-farm-green dark:text-emerald-400 border border-gray-200 dark:border-slate-600 shrink-0">
                                                    <User className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[13px] font-bold text-gray-900 dark:text-white truncate">{user?.name}</p>
                                                    <p className="text-[10px] text-gray-500 dark:text-slate-400 truncate">{user?.email}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-1.5">
                                                <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center space-x-1.5 p-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-sm active:scale-95 transition-all text-gray-600 dark:text-slate-300">
                                                    <User className="h-3.5 w-3.5 text-emerald-500" />
                                                    <span className="text-[10px] font-semibold">Profile</span>
                                                </Link>
                                                <Link to="/help" onClick={() => setIsOpen(false)} className="flex items-center space-x-1.5 p-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-sm active:scale-95 transition-all text-gray-600 dark:text-slate-300">
                                                    <HelpCircle className="h-3.5 w-3.5 text-purple-500" />
                                                    <span className="text-[10px] font-semibold">Help</span>
                                                </Link>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => { logout(); setIsOpen(false); }}
                                            className="w-full flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-bold hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors active:scale-95 text-[12px]"
                                        >
                                            <LogOut className="h-3.5 w-3.5" />
                                            <span>Log Out</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="pt-2 border-t border-gray-100 dark:border-slate-800">
                                        <Link to="/login" onClick={() => setIsOpen(false)} className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl bg-gray-900 dark:bg-slate-100 text-white dark:text-gray-900 font-bold shadow-lg shadow-gray-900/20 active:scale-95 transition-all text-[12px]">
                                            <LogIn className="h-3.5 w-3.5" />
                                            <span>Sign In</span>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </div>
    );
};

export default Navbar;
