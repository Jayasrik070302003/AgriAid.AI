import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, MessageCircle, Phone, FileQuestion, ChevronDown, ArrowLeft, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../Context/LanguageContext';
import FarmingChatBot from './FarmingChatBot';

const HelpSupport = () => {
    const { t } = useLanguage();

    // Mock FAQs
    const faqs = [
        {
            id: 1,
            question: t('faq_q1') || "How do I scan a crop?",
            answer: t('faq_a1') || "Go to the Dashboard, click on 'Crop Analyzer', and upload or take a photo of your crop leaf. The AI will analyze it instantly."
        },
        {
            id: 2,
            question: t('faq_q2') || "Is the fertilizer recommendation accurate?",
            answer: t('faq_a2') || "Our recommendations are based on standard agricultural data and ML models. However, we always recommend consulting a local expert for critical decisions."
        },
        {
            id: 3,
            question: t('faq_q3') || "How can I change the app language?",
            answer: t('faq_a3') || "Go to Settings > Language and select your preferred language (English, Hindi, or Tamil)."
        },
        {
            id: 4,
            question: t('faq_q4') || "What if the app is not loading?",
            answer: t('faq_a4') || "Check your internet connection using the built-in Connection Status tool in Settings. If the issue persists, try clearing your browser cache."
        }
    ];

    const [openFaq, setOpenFaq] = useState(null);

    const toggleFaq = (id) => {
        setOpenFaq(openFaq === id ? null : id);
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
        <div className="max-w-5xl mx-auto px-4 py-8 relative">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-200/20 rounded-full blur-[100px] -z-10 dark:bg-green-900/20" />
            <div className="absolute bottom-40 left-0 w-72 h-72 bg-emerald-200/20 rounded-full blur-[100px] -z-10 dark:bg-emerald-900/20" />

            <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <Link to="/" className="p-3 rounded-2xl bg-white/80 backdrop-blur-md shadow-sm hover:shadow-md border border-white/50 hover:bg-white transition-all duration-300 group dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700">
                        <ArrowLeft className="h-5 w-5 text-gray-600 group-hover:text-farm-green transition-colors dark:text-slate-400 dark:group-hover:text-emerald-400" />
                    </Link>
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-farm-green to-emerald-600">
                                {t('nav_help')}
                            </span>
                            <div className="relative">
                                <div className="absolute inset-0 bg-green-400/30 blur-xl rounded-full"></div>
                                <HelpCircle className="h-8 w-8 text-farm-green relative z-10" />
                            </div>
                        </h1>
                        <p className="text-gray-500 mt-2 font-medium text-lg dark:text-slate-400">{t('help_subtitle') || "We are here to help you with any questions."}</p>
                    </div>
                </div>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-12"
            >
                {/* Contact Options */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="p-8 bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl shadow-green-900/5 border border-white/50 flex flex-col items-center text-center group cursor-pointer relative overflow-hidden dark:bg-slate-800/60 dark:border-slate-700 dark:shadow-none"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 dark:from-green-900/10" />
                        <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-50 text-farm-green rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-emerald-400 dark:shadow-none">
                            <Phone className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 dark:text-white">{t('help_call') || "Call Support"}</h3>
                        <p className="text-gray-500 mb-6 font-medium dark:text-slate-400">{t('help_call_desc') || "Mon-Fri, 9AM - 6PM"}</p>
                        <a href="tel:18001234567" className="px-6 py-3 bg-white rounded-xl text-farm-green font-bold text-lg shadow-sm border border-green-100 group-hover:border-farm-green/30 group-hover:shadow-green-200/50 transition-all duration-300 dark:bg-slate-700 dark:text-emerald-400 dark:border-slate-600 dark:group-hover:border-emerald-500/30 dark:group-hover:shadow-emerald-900/20">
                            1800-123-4567
                        </a>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -5 }}
                        className="p-8 bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl shadow-blue-900/5 border border-white/50 flex flex-col items-center text-center group cursor-pointer relative overflow-hidden dark:bg-slate-800/60 dark:border-slate-700 dark:shadow-none"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 dark:from-blue-900/10" />
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300 dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-400 dark:shadow-none">
                            <Mail className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 dark:text-white">{t('help_email') || "Email Us"}</h3>
                        <p className="text-gray-500 mb-6 font-medium dark:text-slate-400">{t('help_email_desc') || "We reply within 24 hours"}</p>
                        <a href="mailto:support@agriaid.ai" className="px-6 py-3 bg-white rounded-xl text-blue-600 font-bold text-lg shadow-sm border border-blue-100 group-hover:border-blue-200 group-hover:shadow-blue-200/50 transition-all duration-300 dark:bg-slate-700 dark:text-blue-400 dark:border-slate-600 dark:group-hover:border-blue-500/30 dark:group-hover:shadow-blue-900/20">
                            support@agriaid.ai
                        </a>
                    </motion.div>
                </motion.div>

                {/* FAQ Section */}
                <motion.div variants={itemVariants} className="max-w-3xl mx-auto">
                    <div className="flex items-center gap-3 mb-8 justify-center">
                        <div className="p-2 bg-gradient-to-br from-orange-100 to-yellow-50 rounded-lg dark:from-orange-900/30 dark:to-yellow-900/30">
                            <FileQuestion className="h-6 w-6 text-orange-500 dark:text-orange-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight dark:text-white">
                            {t('help_faq_title') || "Frequently Asked Questions"}
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq) => (
                            <motion.div
                                key={faq.id}
                                initial={false}
                                className={`bg-white/80 backdrop-blur-sm rounded-2xl border transition-all duration-300 overflow-hidden dark:bg-slate-800/80 ${openFaq === faq.id ? 'border-farm-green shadow-lg shadow-green-900/5 ring-1 ring-farm-green/20 dark:border-emerald-500/50 dark:shadow-none' : 'border-gray-100 hover:border-gray-200 dark:border-slate-700 dark:hover:border-slate-600'}`}
                            >
                                <button
                                    onClick={() => toggleFaq(faq.id)}
                                    className="w-full flex items-center justify-between p-6 text-left"
                                >
                                    <span className={`font-bold text-lg pr-8 transition-colors ${openFaq === faq.id ? 'text-farm-green dark:text-emerald-400' : 'text-gray-800 dark:text-slate-200'}`}>
                                        {faq.question}
                                    </span>
                                    <div className={`p-1 rounded-full border transition-all duration-300 ${openFaq === faq.id ? 'bg-green-50 border-green-200 rotate-180 dark:bg-emerald-900/30 dark:border-emerald-800' : 'bg-white border-gray-100 dark:bg-slate-700 dark:border-slate-600'}`}>
                                        <ChevronDown
                                            className={`h-5 w-5 transition-colors ${openFaq === faq.id ? 'text-farm-green dark:text-emerald-400' : 'text-gray-400 dark:text-slate-400'}`}
                                        />
                                    </div>
                                </button>
                                <AnimatePresence>
                                    {openFaq === faq.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-6 pt-0">
                                                <div className="h-px w-full bg-gradient-to-r from-transparent via-green-100 to-transparent mb-4 dark:via-emerald-900/50" />
                                                <p className="text-gray-600 leading-relaxed dark:text-slate-400">
                                                    {faq.answer}
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>

            {/* AI Assistant Chatbot */}
            <FarmingChatBot />
        </div>
    );
};

export default HelpSupport;
