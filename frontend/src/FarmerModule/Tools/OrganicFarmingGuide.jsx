import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Leaf, FlaskConical, BookOpen, Award, Search, ChevronDown, ChevronUp, Loader2, Sparkles, AlertTriangle, Clock, Droplets, Bug, Sprout, Shield } from 'lucide-react';
import axios from 'axios';
import clsx from 'clsx';
import { API_BASE_URL as BASE_URL } from '../../config';

const API_BASE_URL = `${BASE_URL}/api/farmer`;

const CROPS = ['Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Tomato', 'Potato', 'Onion', 'Brinjal', 'Chilli', 'Maize', 'Groundnut', 'Soybean', 'Banana', 'Mango', 'Coconut', 'Turmeric', 'Ginger', 'Vegetables'];

const PROBLEMS = [
  { value: 'pest', label: 'Pest Attack', icon: Bug, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
  { value: 'disease', label: 'Disease / Fungal', icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  { value: 'soil', label: 'Soil Fertility', icon: Sprout, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
  { value: 'growth', label: 'Poor Growth', icon: Leaf, color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-900/20' },
];

const SEVERITIES = ['Mild', 'Moderate', 'Severe'];

// Static organic recipes database
const ORGANIC_DB = {
  pest: [
    {
      name: 'Neem Oil Spray',
      icon: '🌿',
      ingredients: ['Neem oil – 10ml', 'Liquid soap – 5ml', 'Water – 1 litre'],
      steps: ['Mix neem oil and soap in warm water', 'Shake well until combined', 'Spray on affected leaves (both sides)', 'Repeat every 7 days'],
      bestTime: 'Early morning or evening',
      warning: 'Do not spray in direct sunlight',
      cost: '₹15–20 per litre',
      crops: 'all'
    },
    {
      name: 'Garlic-Chilli Spray',
      icon: '🌶️',
      ingredients: ['Garlic – 100g', 'Green chilli – 50g', 'Water – 1 litre'],
      steps: ['Crush garlic and chilli together', 'Soak overnight in water', 'Filter and dilute 1:10 with water', 'Spray on plants weekly'],
      bestTime: 'Morning',
      warning: 'Wear gloves while preparing',
      cost: '₹5–10 per litre',
      crops: 'all'
    },
    {
      name: 'Wood Ash Spray',
      icon: '🪵',
      ingredients: ['Wood ash – 200g', 'Water – 1 litre', 'Soap – few drops'],
      steps: ['Mix ash in water', 'Let settle for 30 minutes', 'Filter and add soap', 'Spray on soil and plant base'],
      bestTime: 'Any time',
      warning: 'Avoid on acidic-loving plants',
      cost: '₹0–5 (kitchen waste)',
      crops: 'all'
    },
  ],
  disease: [
    {
      name: 'Buttermilk (மோர்) Spray',
      icon: '🥛',
      ingredients: ['Sour buttermilk – 200ml', 'Water – 800ml'],
      steps: ['Dilute buttermilk in water (1:4)', 'Stir well', 'Spray on leaves covering both sides', 'Apply twice a week'],
      bestTime: 'Morning',
      warning: 'Use fresh sour buttermilk only',
      cost: '₹2–5 per litre',
      crops: 'all'
    },
    {
      name: 'Turmeric + Lime Paste',
      icon: '🟡',
      ingredients: ['Turmeric powder – 2 tbsp', 'Lime (calcium hydroxide) – 1 tbsp', 'Water – 500ml'],
      steps: ['Mix turmeric and lime in water', 'Make a thin paste', 'Apply on infected stem/trunk area', 'Repeat every 10 days'],
      bestTime: 'Any time',
      warning: 'Avoid contact with eyes',
      cost: '₹5–8 per application',
      crops: 'all'
    },
    {
      name: 'Cow Urine (கோமியம்) Spray',
      icon: '🐄',
      ingredients: ['Cow urine – 500ml', 'Water – 4.5 litres'],
      steps: ['Dilute cow urine 1:9 with water', 'Keep for 3 days (fermented is better)', 'Filter and spray on plants', 'Apply every 15 days'],
      bestTime: 'Morning',
      warning: 'Use only healthy cow urine',
      cost: '₹0 (farm waste reuse)',
      crops: 'all'
    },
  ],
  soil: [
    {
      name: 'Vermicompost Preparation',
      icon: '🪱',
      ingredients: ['Kitchen waste – 10 kg', 'Earthworms – 500g', 'Dry leaves – 5 kg', 'Cow dung – 2 kg'],
      steps: ['Layer dry leaves at bottom of pit', 'Add kitchen waste and cow dung', 'Add earthworms on top', 'Water lightly, cover with jute bag', 'Ready in 45–60 days'],
      bestTime: 'Apply before sowing',
      warning: 'Avoid oily/meat waste',
      cost: '₹0 (kitchen + farm waste)',
      crops: 'all'
    },
    {
      name: 'Green Manure (பசுந்தாள்)',
      icon: '🌱',
      ingredients: ['Sesbania seeds – 5kg/acre', 'Dhaincha / Sunhemp seeds'],
      steps: ['Sow seeds 45 days before main crop', 'Allow to grow 40–45 cm tall', 'Plough into soil while still green', 'Wait 2 weeks before transplanting main crop'],
      bestTime: '45 days before main crop sowing',
      warning: 'Do not let it flower before ploughing',
      cost: '₹200–400 per acre',
      crops: 'all'
    },
    {
      name: 'Jeevamrutham (ஜீவாமிர்தம்)',
      icon: '💧',
      ingredients: ['Cow dung – 10 kg', 'Cow urine – 10 litres', 'Jaggery – 1 kg', 'Gram flour – 1 kg', 'Water – 200 litres'],
      steps: ['Mix all ingredients in water', 'Stir daily for 48 hours in shade', 'Filter the mixture', 'Dilute 1:10 and drip irrigate or spray', 'Apply every 15 days'],
      bestTime: 'Early morning drip/spray',
      warning: 'Use within 7 days of preparation',
      cost: '₹50–80 per 200 litres',
      crops: 'all'
    },
  ],
  growth: [
    {
      name: 'Banana Stem Extract',
      icon: '🍌',
      ingredients: ['Banana stem – 2 kg', 'Water – 10 litres'],
      steps: ['Chop banana stem finely', 'Soak in water for 24 hours', 'Filter and dilute 1:5', 'Spray on leaves or use for root drenching'],
      bestTime: 'Evening',
      warning: 'Use fresh stem only',
      cost: '₹0 (farm waste reuse)',
      crops: 'all'
    },
    {
      name: 'Panchagavya (பஞ்சகாவ்யா)',
      icon: '🐄',
      ingredients: ['Cow dung – 1 kg', 'Cow urine – 1 litre', 'Cow milk – 1 litre', 'Curd – 500ml', 'Ghee – 200ml'],
      steps: ['Mix all in earthen pot', 'Stir twice daily for 7 days in shade', 'Filter after 7 days', 'Dilute 3% (30ml per 1 litre water)', 'Spray fortnightly on crops'],
      bestTime: 'Early morning',
      warning: 'Prepare in earthen/wooden vessel only',
      cost: '₹100–150 for full batch',
      crops: 'all'
    },
  ]
};

const CERTIFICATION_STEPS = [
  { step: '1', title: 'Register with PGS-India', desc: 'Join local farmer group (min 5 farmers). Free registration at local Krishi Vigyan Kendra.' },
  { step: '2', title: 'Chemical-Free Period', desc: 'Your land must be chemical-free for 3 years. Document all activities in a farm diary.' },
  { step: '3', title: 'Peer Inspection', desc: 'Fellow farmers in your group inspect your farm. Mutual trust-based certification.' },
  { step: '4', title: 'Get Certificate', desc: 'Receive PGS-India Green / Organic certificate. Valid for 1 year, renewable.' },
  { step: '5', title: 'Premium Markets', desc: 'Sell at Uzhavar Sandhai, organic stores, or directly. Get 20–30% premium price.' },
];

function RecipeCard({ recipe }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
      >
        <span className="text-2xl shrink-0">{recipe.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-800 dark:text-white">{recipe.name}</p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">{recipe.cost}</p>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-gray-100 dark:border-slate-700 pt-3">
              {/* Ingredients */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Ingredients</p>
                <div className="flex flex-wrap gap-1.5">
                  {recipe.ingredients.map((ing, i) => (
                    <span key={i} className="px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-xs border border-green-100 dark:border-green-800/30">
                      {ing}
                    </span>
                  ))}
                </div>
              </div>

              {/* Steps */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Preparation</p>
                <ol className="space-y-1.5">
                  {recipe.steps.map((step, i) => (
                    <li key={i} className="flex gap-2 text-xs text-gray-600 dark:text-gray-300">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 flex items-center justify-center font-bold text-[10px]">{i + 1}</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
                  <Clock className="w-3 h-3 text-blue-500 shrink-0" />
                  <span className="text-xs text-blue-700 dark:text-blue-300">{recipe.bestTime}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg p-2">
                  <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" />
                  <span className="text-xs text-red-700 dark:text-red-300 line-clamp-2">{recipe.warning}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function OrganicFarmingGuide() {
  const [formData, setFormData] = useState({ crop: '', problem: '', severity: 'Mild' });
  const [activeTab, setActiveTab] = useState('recipes');
  const [aiSolution, setAiSolution] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const selectedRecipes = searched ? (ORGANIC_DB[formData.problem] || []) : [];

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearched(true);
    setActiveTab('recipes');
    setAiSolution('');

    // Auto-fetch AI solution
    fetchAISolution();
  };

  const fetchAISolution = async () => {
    setAiLoading(true);
    try {
      const prompt = `You are an expert in organic/natural farming in India. A farmer needs help:

Crop: ${formData.crop}
Problem: ${formData.problem} (${PROBLEMS.find(p => p.value === formData.problem)?.label})
Severity: ${formData.severity}

Give a detailed organic solution with:
1. **Immediate Action** (what to do today)
2. **Homemade Organic Recipe** specific to this crop+problem
3. **Application Schedule** (how often, how much)
4. **Prevention Tips** for next season
5. **Cost Estimate** in Indian Rupees

Keep it practical, simple, and suitable for small Indian farmers. Use bullet points.`;

      const res = await axios.post(`${API_BASE_URL}/chat`, { message: prompt, language: 'EN' });
      if (res.data.success) setAiSolution(res.data.reply);
    } catch (err) {
      setAiSolution('Unable to fetch AI solution. Please check your connection.');
    }
    setAiLoading(false);
  };

  const TABS = [
    { id: 'recipes', label: 'Recipes', icon: FlaskConical },
    { id: 'ai', label: 'AI Solution', icon: Sparkles },
    { id: 'compost', label: 'Composting', icon: Leaf },
    { id: 'certify', label: 'Certification', icon: Award },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 pb-24 sm:pb-8">

      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-4 sm:px-6 py-4 sm:py-5 border-b border-emerald-700/50 shadow-sm">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-2.5 bg-white/15 rounded-xl backdrop-blur-md shrink-0 border border-white/10 shadow-sm">
              <Leaf className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-50" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black tracking-tight leading-tight">Organic Farming Guide</h1>
              <p className="text-[11px] sm:text-xs text-emerald-100 mt-0.5">Homemade recipes + AI solutions</p>
            </div>
          </div>
          
          {/* Stats Row */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mt-1 md:mt-0 shrink-0">
            {[
              { label: 'Recipes', value: '10+', icon: '🌿' },
              { label: 'Zero Cost', value: 'Options', icon: '💰' },
              { label: 'AI Powered', value: 'Custom', icon: '🤖' },
            ].map((s) => (
              <div key={s.label} className="shrink-0 flex items-center gap-1.5 sm:gap-2 bg-black/10 hover:bg-black/20 transition-colors backdrop-blur-md rounded-lg px-2.5 sm:px-3 py-1.5 border border-white/10">
                <span className="text-sm sm:text-base">{s.icon}</span>
                <div className="leading-none text-left">
                  <p className="text-[10px] sm:text-xs font-bold text-white mb-0.5">{s.value}</p>
                  <p className="text-[8px] sm:text-[9px] font-semibold uppercase tracking-wider text-emerald-100">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-7 space-y-5">

        {/* Search Form */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-4 sm:p-6">
          <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
            <Search className="w-4 h-4 text-green-600" /> Find Organic Solution
          </h2>
          <form onSubmit={handleSearch} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Crop */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Crop</label>
                <select
                  value={formData.crop}
                  onChange={e => setFormData({ ...formData, crop: e.target.value })}
                  required
                  className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select Crop</option>
                  {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Severity */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Severity</label>
                <div className="flex gap-2">
                  {SEVERITIES.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormData({ ...formData, severity: s })}
                      className={clsx(
                        'flex-1 py-2.5 rounded-lg text-xs font-bold border transition-all',
                        formData.severity === s
                          ? s === 'Mild' ? 'bg-green-500 border-green-500 text-white'
                            : s === 'Moderate' ? 'bg-orange-500 border-orange-500 text-white'
                            : 'bg-red-500 border-red-500 text-white'
                          : 'bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300'
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Problem Type */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Problem Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PROBLEMS.map(p => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, problem: p.value })}
                      className={clsx(
                        'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center',
                        formData.problem === p.value
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                          : 'border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-gray-200'
                      )}
                    >
                      <div className={clsx('p-1.5 rounded-lg', p.bg)}>
                        <Icon className={clsx('w-4 h-4', p.color)} />
                      </div>
                      <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-200 leading-tight">{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={!formData.crop || !formData.problem}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-bold text-sm hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
            >
              <Leaf className="w-4 h-4" /> Get Organic Solutions
            </button>
          </form>
        </div>

        {/* Tabs + Results */}
        {searched && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {TABS.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={clsx(
                      'shrink-0 flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border',
                      activeTab === tab.id
                        ? 'bg-green-600 text-white border-green-600 shadow-lg shadow-green-500/20'
                        : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:border-green-300'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                    {tab.id === 'ai' && aiLoading && <Loader2 className="w-3 h-3 animate-spin ml-1" />}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {/* Recipes Tab */}
              {activeTab === 'recipes' && (
                <motion.div key="recipes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-green-500" />
                    {selectedRecipes.length} homemade recipes for {formData.crop} — {PROBLEMS.find(p => p.value === formData.problem)?.label}
                  </p>
                  {selectedRecipes.map((recipe, i) => (
                    <RecipeCard key={i} recipe={recipe} />
                  ))}
                </motion.div>
              )}

              {/* AI Solution Tab */}
              {activeTab === 'ai' && (
                <motion.div key="ai" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-xl">
                    <div className="h-1 bg-gradient-to-r from-green-400 to-emerald-500" />
                    <div className="p-4 sm:p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 bg-green-500/20 rounded-lg">
                          <Sparkles className="w-4 h-4 text-green-400" />
                        </div>
                        <h3 className="text-sm font-bold text-white">AI Custom Solution</h3>
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-[10px] font-bold border border-green-500/20">
                          {formData.crop} • {formData.severity}
                        </span>
                      </div>
                      {aiLoading ? (
                        <div className="flex items-center gap-3 py-8 justify-center">
                          <Loader2 className="w-5 h-5 text-green-400 animate-spin" />
                          <span className="text-sm text-slate-400">Generating organic solution...</span>
                        </div>
                      ) : (
                        <div className="prose prose-sm prose-invert max-w-none text-slate-300 prose-p:text-[13px] prose-p:leading-relaxed prose-strong:text-green-400 prose-li:text-[13px]">
                          <ReactMarkdown>{aiSolution}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Composting Tab */}
              {activeTab === 'compost' && (
                <motion.div key="compost" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                  {ORGANIC_DB.soil.map((recipe, i) => (
                    <RecipeCard key={i} recipe={recipe} />
                  ))}
                </motion.div>
              )}

              {/* Certification Tab */}
              {activeTab === 'certify' && (
                <motion.div key="certify" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 sm:p-5">
                      <div className="flex items-center gap-3">
                        <Award className="w-6 h-6 text-white shrink-0" />
                        <div>
                          <h3 className="font-bold text-white text-sm sm:text-base">PGS-India Organic Certification</h3>
                          <p className="text-xs text-amber-100 mt-0.5">Get certified and sell at 20–30% premium price</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 sm:p-5 space-y-3">
                      {CERTIFICATION_STEPS.map((s) => (
                        <div key={s.step} className="flex gap-3">
                          <div className="shrink-0 w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
                            {s.step}
                          </div>
                          <div className="flex-1 pb-3 border-b border-gray-100 dark:border-slate-700 last:border-0">
                            <p className="text-sm font-semibold text-gray-800 dark:text-white">{s.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{s.desc}</p>
                          </div>
                        </div>
                      ))}

                      {/* Benefits */}
                      <div className="mt-4 bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                        <p className="text-xs font-bold text-green-700 dark:text-green-400 mb-2 flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5" /> Benefits of Going Organic
                        </p>
                        <ul className="space-y-1.5">
                          {['20–30% premium price at organic markets', 'Lower input costs (no chemicals)', 'Better soil health for future seasons', 'Export opportunities to Europe/USA', 'Access to Uzhavar Sandhai organic section'].map((b, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-xs text-green-800 dark:text-green-300">
                              <span className="text-green-500 mt-0.5">✓</span> {b}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Empty State */}
        {!searched && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-8 text-center border border-gray-100 dark:border-slate-700">
            <div className="w-16 h-16 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-1">Select crop & problem above</h3>
            <p className="text-sm text-gray-400 dark:text-gray-500">Get instant homemade organic recipes + AI solutions</p>
          </div>
        )}
      </div>
    </div>
  );
}
