import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, type = 'danger' }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                />

                {/* Modal Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-white/50 dark:border-slate-700 overflow-hidden"
                >
                    <div className="p-6">
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex flex-col items-center text-center">
                            {/* Icon */}
                            <div className={`mb-4 p-4 rounded-2xl ${type === 'danger' ? 'bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400' : 'bg-amber-50 text-amber-500 dark:bg-amber-900/30 dark:text-amber-400'
                                }`}>
                                <AlertTriangle className="w-8 h-8" />
                            </div>

                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                                {title}
                            </h3>
                            <p className="text-gray-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
                                {message}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="mt-8 flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 px-6 py-3.5 rounded-2xl text-sm font-bold text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-200 border border-gray-100 dark:border-slate-600/50"
                            >
                                {cancelText || 'Cancel'}
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className={`flex-1 px-6 py-3.5 rounded-2xl text-sm font-bold text-white shadow-lg shadow-red-500/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${type === 'danger' ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700' : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700'
                                    }`}
                            >
                                {confirmText || 'Confirm'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ConfirmationModal;
