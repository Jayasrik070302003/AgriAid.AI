import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sprout, Scan, Cpu, Activity, ShieldCheck } from 'lucide-react';

const Loader = ({ message = "Analyzing Sample..." }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl overflow-hidden"
        >
            {/* BACKGROUND TECH GRID EFFECT */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98118_1px,transparent_1px),linear-gradient(to_bottom,#10b98118_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
            </div>

            {/* SCANNING LINE */}
            <motion.div
                animate={{ top: ['-10%', '110%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent shadow-[0_0_15px_rgba(16,185,129,0.5)] z-10"
            />

            <div className="relative z-20 flex flex-col items-center">

                {/* ADVANCED DIAGNOSTIC RING SYSTEM */}
                <div className="relative w-48 h-48 flex items-center justify-center">

                    {/* Outer Pulse Ring */}
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 rounded-full border border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.1)]"
                    />

                    {/* Secondary Rotating Ring (Dashed) */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-4 rounded-full border-2 border-dashed border-emerald-400/20"
                    />

                    {/* Fast Rotating Activity Ring */}
                    <svg className="absolute w-full h-full -rotate-90">
                        <motion.circle
                            cx="50%" cy="50%" r="44%"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeDasharray="20 180"
                            strokeLinecap="round"
                            className="text-emerald-500 shadow-lg"
                            animate={{ strokeDashoffset: [0, -400] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        />
                    </svg>

                    {/* Main Processing Core */}
                    <div className="relative w-28 h-28 bg-white/5 dark:bg-emerald-500/5 rounded-3xl border border-white/10 dark:border-emerald-500/20 shadow-2xl backdrop-blur-md flex items-center justify-center overflow-hidden group">

                        {/* Core Glow */}
                        <div className="absolute inset-0 bg-emerald-500/10 blur-xl group-hover:bg-emerald-500/20 transition-all duration-700" />

                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="relative z-10"
                        >
                            <div className="relative">
                                <Sprout className="w-12 h-12 text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                                <motion.div
                                    animate={{ opacity: [0, 1, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="absolute -top-1 -right-1"
                                >
                                    <Activity className="w-4 h-4 text-emerald-400" />
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* Tech Corners */}
                        <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-emerald-500/40" />
                        <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-emerald-500/40" />
                        <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-emerald-500/40" />
                        <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-emerald-500/40" />
                    </div>
                </div>

                {/* STATUS CARDS (ANALYTIC LABELS) */}
                <div className="mt-16 flex flex-col items-center gap-6">

                    {/* Main Badge */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-emerald-500 text-white px-8 py-3 rounded-2xl shadow-[0_15px_30px_-10px_rgba(16,185,129,0.5)] border border-emerald-400/30 flex items-center gap-4 relative overflow-hidden group"
                    >
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            animate={{ x: ['-200%', '200%'] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />
                        <div className="flex items-center gap-3 relative z-10">
                            <div className="p-1 bg-white/20 rounded-lg">
                                <Scan className="w-4 h-4 animate-pulse" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-[0.4em] drop-shadow-sm">{message}</span>
                        </div>
                    </motion.div>

                    {/* Real-time Processing Metrics (Mock) */}
                    <div className="flex gap-4">
                        {[
                            { icon: Cpu, label: 'ML CORE' },
                            { icon: ShieldCheck, label: 'VALIDATING' },
                            { icon: Activity, label: 'SEQUENCING' }
                        ].map((tech, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + (i * 0.1) }}
                                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm"
                            >
                                <tech.icon className="w-3 h-3 text-emerald-500/60" />
                                <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">{tech.label}</span>
                            </motion.div>
                        ))}
                    </div>

                    {/* Bottom Progress Hint */}
                    <motion.p
                        animate={{ opacity: [0.4, 0.7, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-[9px] font-bold text-emerald-500/60 uppercase tracking-[0.2em]"
                    >
                        Initializing Neural Weights • 100% Synthetic Precision
                    </motion.p>
                </div>
            </div>
        </motion.div>
    );
};

export default Loader;
