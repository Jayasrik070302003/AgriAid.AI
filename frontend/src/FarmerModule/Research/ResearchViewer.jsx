import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Leaf, Sprout, Cpu, Bug, Sun } from 'lucide-react';

const researchData = {
    'sustainable-soil': {
        title: "Sustainable Soil Management",
        category: "Soil Science",
        icon: Leaf,
        color: "text-emerald-500",
        bg: "bg-emerald-50",
        gradient: "from-emerald-500 to-green-600",
        content: (
            <>
                <p className="text-xl font-medium leading-relaxed text-gray-700 mb-8 dark:text-slate-300">
                    Healthy soil is the foundation of a productive food system. Sustainable management enhances soil quality, improving yield while protecting the environment.
                </p>

                <h3 className="text-2xl font-bold text-gray-900 mb-4 dark:text-white">Key Practices</h3>
                <ul className="space-y-4 mb-8">
                    <li className="flex gap-4 items-start">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-1 dark:bg-emerald-900/30">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white">Cover Cropping</h4>
                            <p className="text-gray-600 dark:text-slate-400">Planting cover crops like clover or rye prevents erosion and fixes nitrogen.</p>
                        </div>
                    </li>
                    <li className="flex gap-4 items-start">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-1 dark:bg-emerald-900/30">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white">Reduced Tillage</h4>
                            <p className="text-gray-600 dark:text-slate-400">Minimizing soil disturbance maintains structure and preserves microbiome.</p>
                        </div>
                    </li>
                    <li className="flex gap-4 items-start">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-1 dark:bg-emerald-900/30">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white">Organic Amendments</h4>
                            <p className="text-gray-600 dark:text-slate-400">Using compost and manure boosts organic carbon levels significantly.</p>
                        </div>
                    </li>
                </ul>

                <h3 className="text-2xl font-bold text-gray-900 mb-4 dark:text-white">Impact</h3>
                <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900/40">
                    <p className="text-emerald-800 font-medium dark:text-emerald-400">
                        "Farms adopting these methods see a 20% reduction in fertilizer costs and a 15% increase in drought resilience within 3 years."
                    </p>
                </div>
            </>
        )
    },
    'ai-agriculture': {
        title: "AI in Agriculture",
        category: "Technology",
        icon: Cpu,
        color: "text-violet-500",
        bg: "bg-violet-50",
        gradient: "from-violet-500 to-purple-600",
        content: (
            <>
                <p className="text-xl font-medium leading-relaxed text-gray-700 mb-8 dark:text-slate-300">
                    Artificial Intelligence is revolutionizing farming by enabling data-driven decisions that were previously impossible, leading to 'Precision Agriculture'.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 dark:bg-slate-800 dark:border-slate-700">
                        <h4 className="font-bold text-xl mb-2 text-violet-700 dark:text-violet-400">Predictive Analytics</h4>
                        <p className="text-gray-600 text-sm dark:text-slate-400">Forecasting yields and prices using historical data.</p>
                    </div>
                    <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 dark:bg-slate-800 dark:border-slate-700">
                        <h4 className="font-bold text-xl mb-2 text-violet-700 dark:text-violet-400">Computer Vision</h4>
                        <p className="text-gray-600 text-sm dark:text-slate-400">Identifying diseases from simple smartphone photos (like AgriAid).</p>
                    </div>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-4 dark:text-white">Future Outlook</h3>
                <p className="text-gray-600 mb-6 italic border-l-4 border-violet-500 pl-4 py-2 bg-violet-50/50 dark:text-slate-400 dark:bg-violet-900/20">
                    Autonomous tractors and drone sprayers are becoming more affordable, allowing small-scale farmers to reduce labor costs and chemical usage by up to 90%.
                </p>
            </>
        )
    },
    'climate-resilient-crops': {
        title: "Climate Resilient Crops",
        category: "Adaptation",
        icon: Sun,
        color: "text-amber-500",
        bg: "bg-amber-50",
        gradient: "from-orange-400 to-amber-500",
        content: (
            <>
                <p className="text-xl font-medium leading-relaxed text-gray-700 mb-8 dark:text-slate-300">
                    Extreme weather patterns necessitate the adoption of robust crop varieties capable of withstanding heat, drought, and salinity.
                </p>

                <h3 className="text-2xl font-bold text-gray-900 mb-6 dark:text-white">Key Varieties</h3>

                <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 dark:bg-slate-800 dark:border-slate-700">
                        <span className="text-3xl">🌾</span>
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white">Drought-Tolerant Maize</h4>
                            <p className="text-sm text-gray-500 dark:text-slate-400">Can survive with 30% less rainfall.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 dark:bg-slate-800 dark:border-slate-700">
                        <span className="text-3xl">🍚</span>
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white">Saline-Resistant Rice</h4>
                            <p className="text-sm text-gray-500 dark:text-slate-400">Thrives in coastal areas affected by saltwater intrusion.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 dark:bg-slate-800 dark:border-slate-700">
                        <span className="text-3xl">🥣</span>
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white">Millets</h4>
                            <p className="text-sm text-gray-500 dark:text-slate-400">Naturally hardy superfoods revisiting modern diets.</p>
                        </div>
                    </div>
                </div>
            </>
        )
    },
    'organic-pest-control': {
        title: "Organic Pest Control",
        category: "Protection",
        icon: Bug,
        color: "text-rose-500",
        bg: "bg-rose-50",
        gradient: "from-rose-500 to-pink-600",
        content: (
            <>
                <p className="text-xl font-medium leading-relaxed text-gray-700 mb-8 dark:text-slate-300">
                    Managing pests without synthetic chemicals preserves biodiversity and prevents resistance build-up in pest populations.
                </p>

                <div className="grid gap-6">
                    <section>
                        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2 dark:text-white">
                            <span className="w-2 h-2 rounded-full bg-rose-500"></span> Biological Control
                        </h3>
                        <p className="text-gray-600 dark:text-slate-400">
                            Introducing natural predators like Ladybugs for aphids or Trichogramma wasps for borers.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2 dark:text-white">
                            <span className="w-2 h-2 rounded-full bg-rose-500"></span> Botanicals
                        </h3>
                        <p className="text-gray-600 dark:text-slate-400">
                            Neem oil and garlic sprays act as powerful repellents without harming pollinators.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2 dark:text-white">
                            <span className="w-2 h-2 rounded-full bg-rose-500"></span> Trap Crops
                        </h3>
                        <p className="text-gray-600 dark:text-slate-400">
                            Planting marigolds or mustard around the main field to lure pests away from high-value crops.
                        </p>
                    </section>
                </div>
            </>
        )
    }
};

const ResearchViewer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const article = researchData[id];

    if (!article) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Article not found.</p>
            </div>
        );
    }

    const Icon = article.icon;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 pb-32">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-8 font-medium group dark:text-slate-400 dark:hover:text-white"
            >
                <div className="p-2 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform dark:bg-slate-800 dark:text-slate-200">
                    <ArrowLeft className="h-4 w-4" />
                </div>
                Back to Dashboard
            </button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Hero Header */}
                <div className={`relative overflow-hidden rounded-[2.5rem] p-10 text-white shadow-2xl mb-12 bg-gradient-to-br ${article.gradient}`}>
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-black/10 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                        <div className={`p-6 bg-white/20 backdrop-blur-md rounded-3xl border border-white/20 shadow-inner`}>
                            <Icon className="h-12 w-12 text-white" />
                        </div>
                        <div>
                            <div className="inline-block px-3 py-1 rounded-full bg-black/20 text-xs font-bold uppercase tracking-widest mb-3 backdrop-blur-sm border border-white/10">
                                {article.category}
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                                {article.title}
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Content Body */}
                <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-white dark:bg-slate-800/80 dark:border-slate-700 dark:shadow-none">
                    <article className="prose prose-lg prose-gray max-w-none dark:prose-invert">
                        {article.content}
                    </article>

                    <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-between text-sm text-gray-400 font-medium dark:border-slate-700 dark:text-slate-500">
                        <span className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" /> 5 min read
                        </span>
                        <span>
                            AgriAid Research • 2024
                        </span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ResearchViewer;
