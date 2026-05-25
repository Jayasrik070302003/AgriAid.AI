import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FlaskConical, CheckCircle2, AlertTriangle, AlertCircle, Activity, 
    Droplets, Leaf, ArrowRight, RefreshCw, BarChart3, Microscope, 
    XCircle, Info, TrendingUp, Sprout, MapPin, UploadCloud, 
    FileText, ShieldAlert, Check, Calendar, Sun, Wind
} from 'lucide-react';
import apiClient from '../../services/apiClient';
import { useLanguage } from '../../Context/LanguageContext';
import useGPS from '../../hooks/useGPS';

const LANG_CONFIG = {
    EN: {
        title: "Soil Intelligence Lab",
        subtitle: "Analyze soil parameters, scan lab reports, and sync local weather context for advanced agronomic soil assessments.",
        tab_manual: "Manual Parameters",
        tab_scan: "AI Report Scan",
        crop_label: "Target Crop (Optional)",
        crop_placeholder: "e.g. Tomato, Paddy, Maize",
        soil_type_label: "Soil Type",
        soil_type_placeholder: "Select Soil Type",
        ph_label: "Soil pH (Required)",
        n_label: "Nitrogen (N)",
        p_label: "Phosphorus (P)",
        k_label: "Potassium (K)",
        oc_label: "Organic Carbon (OC)",
        scan_title: "Upload Soil Test Report",
        scan_desc: "Drag & drop or click to upload your soil analysis lab report image (PNG, JPG). Our AI OCR will automatically extract pH, NPK, Carbon, and Soil Type.",
        scan_error: "Invalid or unreadable soil report image. Please ensure the parameters are clearly visible.",
        location_btn: "Sync Location & Weather",
        location_syncing: "Syncing Location...",
        location_success: "GPS coordinates and local weather synchronized!",
        btn_analyze: "Assess Soil Health",
        btn_analyzing: "Analyzing Soil...",
        ready_title: "Ready to Analyze Sample",
        ready_desc: "Provide parameters or upload a laboratory report. The AI agronomy engine will calculate fertility grades against crop yield baselines.",
        score_label: "Health Score",
        nutrient_title: "Nutrient Balance Analysis",
        crop_recommendation: "Crop Suitability Index",
        fertility_title: "Precision Action Plan",
        organic_title: "Organic Amendments",
        irrigation_title: "Weather-Aware Irrigation",
        risks_title: "Environmental Soil Risks",
        ideal_label: "Ideal Range",
        status_label: "Status",
        level_label: "Level",
        compatibility_label: "Compatibility",
        risk_warnings: "Critical Alerts",
        ph_gauge_optimal: "Optimal (6.5-7.5)",
        ph_gauge_acidic: "Acidic (<6.5)",
        ph_gauge_alkaline: "Alkaline (>7.5)",
        gps_auth: "GPS Sync Active",
        weather_details: "Weather Context:",
        soil_alluvial: "Alluvial",
        soil_red: "Red Soil",
        soil_black: "Black Soil",
        soil_laterite: "Laterite",
        soil_clay: "Clay",
        soil_sandy: "Sandy",
        soil_loam: "Loam"
    },
    TA: {
        title: "மண் நுண்ணறிவு ஆய்வகம்",
        subtitle: "மேம்பட்ட மண் மதிப்பீடுகளுக்கு மண் அளவுருக்களை பகுப்பாய்வு செய்யவும், ஆய்வக அறிக்கைகளை ஸ்கேன் செய்யவும் மற்றும் உள்ளூர் வானிலை தகவல்களை ஒத்திசைக்கவும்.",
        tab_manual: "கைமுறை அளவுருக்கள்",
        tab_scan: "AI அறிக்கை ஸ்கேன்",
        crop_label: "இலக்கு பயிர் (விருப்பத்தேர்வு)",
        crop_placeholder: "எ.கா. தக்காளி, நெல், மக்காச்சோளம்",
        soil_type_label: "மண் வகை",
        soil_type_placeholder: "மண் வகையைத் தேர்ந்தெடுக்கவும்",
        ph_label: "மண் pH (தேவை)",
        n_label: "நைட்ரஜன் (N)",
        p_label: "பாஸ்பரஸ் (P)",
        k_label: "பொட்டாசியம் (K)",
        oc_label: "கரிம கார்பன் (OC)",
        scan_title: "மண் பரிசோதனை அறிக்கையைப் பதிவேற்றவும்",
        scan_desc: "உங்கள் மண் பகுப்பாய்வு ஆய்வக அறிக்கை படத்தை (PNG, JPG) இழுத்து விடவும் அல்லது கிளிக் செய்யவும். எங்கள் AI OCR தானாகவே pH, NPK, கார்பன் மற்றும் மண் வகையைப் பிரித்தெடுக்கும்.",
        scan_error: "தவறான அல்லது படிக்க முடியாத மண் அறிக்கை படம். அளவுருக்கள் தெளிவாகத் தெரிவதை உறுதிசெய்யவும்.",
        location_btn: "இருப்பிடம் & வானிலை ஒத்திசை",
        location_syncing: "இருப்பிடம் ஒத்திசைக்கிறது...",
        location_success: "GPS ஒருங்கிணைப்புகள் மற்றும் உள்ளூர் வானிலை ஒத்திசைக்கப்பட்டது!",
        btn_analyze: "மண் ஆரோக்கியத்தை மதிப்பிடு",
        btn_analyzing: "மண்ணை பகுப்பாய்வு செய்கிறது...",
        ready_title: "மாதிரியை பகுப்பாய்வு செய்ய தயார்",
        ready_desc: "அளவுருக்களை வழங்கவும் அல்லது ஆய்வக அறிக்கையைப் பதிவேற்றவும். AI வேளாண் இயந்திரம் பயிர் விளைச்சல் அடிப்படையுடன் ஒப்பிட்டு மண் தரத்தைக் கணக்கிடும்.",
        score_label: "ஆரோக்கிய மதிப்பெண்",
        nutrient_title: "ஊட்டச்சத்து சமநிலை பகுப்பாய்வு",
        crop_recommendation: "பயிர் பொருத்தக் குறியீடு",
        fertility_title: "துல்லியமான செயல் திட்டம்",
        organic_title: "கரிம திருத்தங்கள்",
        irrigation_title: "வானிலை விழிப்புணர்வு நீர்ப்பாசனம்",
        risks_title: "சுற்றுச்சூழல் மண் அபாயங்கள்",
        ideal_label: "சிறந்த வரம்பு",
        status_label: "நிலை",
        level_label: "மட்டம்",
        compatibility_label: "பொருத்தம்",
        risk_warnings: "முக்கிய எச்சரிக்கைகள்",
        ph_gauge_optimal: "சிறந்தது (6.5-7.5)",
        ph_gauge_acidic: "அமிலத்தன்மை (<6.5)",
        ph_gauge_alkaline: "காரத்தன்மை (>7.5)",
        gps_auth: "GPS ஒத்திசைவில் உள்ளது",
        weather_details: "வானிலை தகவல்:",
        soil_alluvial: "வண்டல் மண்",
        soil_red: "செம்மண்",
        soil_black: "கரிசல் மண்",
        soil_laterite: "லேட்டரைட் மண்",
        soil_clay: "களிமண்",
        soil_sandy: "மணல் மண்",
        soil_loam: "வண்டல் களிமண்"
    },
    HI: {
        title: "मृदा इंटेलिजेंस लैब",
        subtitle: "उन्नत मृदा मूल्यांकन के लिए मृदा मापदंडों का विश्लेषण करें, लैब रिपोर्ट स्कैन करें और स्थानीय मौसम संदर्भ सिंक करें।",
        tab_manual: "मैनुअल पैरामीटर",
        tab_scan: "AI रिपोर्ट स्कैन",
        crop_label: "लक्ष्य फसल (वैकल्पिक)",
        crop_placeholder: "जैसे टमाटर, धान, मक्का",
        soil_type_label: "मिट्टी का प्रकार",
        soil_type_placeholder: "मिट्टी के प्रकार का चयन करें",
        ph_label: "मृदा pH (आवश्यक)",
        n_label: "नाइट्रोजन (N)",
        p_label: "फास्फोरस (P)",
        k_label: "पोटेशियम (K)",
        oc_label: "ऑर्गेनिक कार्बन (OC)",
        scan_title: "मृदा परीक्षण रिपोर्ट अपलोड करें",
        scan_desc: "अपनी मृदा विश्लेषण लैब रिपोर्ट छवि (PNG, JPG) को खींचें और छोड़ें या अपलोड करने के लिए क्लिक करें। हमारा AI OCR स्वचालित रूप से pH, NPK, कार्बन और मिट्टी के प्रकार को निकाल लेगा।",
        scan_error: "अमान्य या अपठनीय मृदा रिपोर्ट छवि। कृपया सुनिश्चित करें कि मापदंड स्पष्ट रूप से दिखाई दे रहे हैं।",
        location_btn: "स्थान और मौसम सिंक करें",
        location_syncing: "स्थान सिंक हो रहा है...",
        location_success: "GPS निर्देशांक और स्थानीय मौसम सिंक हो गए हैं!",
        btn_analyze: "मृदा स्वास्थ्य का आकलन करें",
        btn_analyzing: "मिट्टी का विश्लेषण...",
        ready_title: "विश्लेषण के लिए तैयार",
        ready_desc: "पैरामीटर प्रदान करें या प्रयोगशाला रिपोर्ट अपलोड करें। AI कृषि इंजन इष्टतम उपज बेसलाइन के साथ तुलना करके मृदा गुणवत्ता स्कोर की गणना करेगा।",
        score_label: "स्वास्थ्य स्कोर",
        nutrient_title: "पोषक तत्व संतुलन विश्लेषण",
        crop_recommendation: "फसल उपयुक्तता सूचकांक",
        fertility_title: "सटीक कार्य योजना",
        organic_title: "जैविक सुधार",
        irrigation_title: "मौसम-जागरूक सिंचाई",
        risks_title: "पर्यावरणीय मृदा जोखिम",
        ideal_label: "आदर्श सीमा",
        status_label: "स्थिति",
        level_label: "स्तर",
        compatibility_label: "अनुकूलता",
        risk_warnings: "महत्वपूर्ण चेतावनियाँ",
        ph_gauge_optimal: "इष्टतम (6.5-7.5)",
        ph_gauge_acidic: "अम्लीय (<6.5)",
        ph_gauge_alkaline: "क्षारीय (>7.5)",
        gps_auth: "GPS सिंक सक्रिय",
        weather_details: "मौसम विवरण:",
        soil_alluvial: "जलोढ़ मिट्टी",
        soil_red: "लाल मिट्टी",
        soil_black: "काली मिट्टी",
        soil_laterite: "लेटराइट मिट्टी",
        soil_clay: "चिकनी मिट्टी",
        soil_sandy: "बलुई मिट्टी",
        soil_loam: "दोमट मिट्टी"
    }
};

const SoilHealthCheck = () => {
    const { language = 'EN' } = useLanguage();
    const t = (key) => LANG_CONFIG[language]?.[key] || LANG_CONFIG.EN[key];

    const [soilData, setSoilData] = useState({
        ph: '',
        nitrogen: '',
        phosphorus: '',
        potassium: '',
        carbon: ''
    });
    const [cropName, setCropName] = useState('');
    const [soilType, setSoilType] = useState('');
    const [activeTab, setActiveTab] = useState('manual');

    const [analyzing, setAnalyzing] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [status, setStatus] = useState(null);
    const [notification, setNotification] = useState(null);

    // GPS & Weather Context
    const { location: gpsLocation, loading: gpsLoading, error: gpsError, detect: detectGPS } = useGPS();
    const [weatherData, setWeatherData] = useState(null);
    const [fetchingWeather, setFetchingWeather] = useState(false);

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 4000);
    };

    // Auto-fetch weather when GPS coords resolve
    useEffect(() => {
        if (gpsLocation.lat && gpsLocation.lng) {
            fetchWeather(gpsLocation.lat, gpsLocation.lng);
        }
    }, [gpsLocation.lat, gpsLocation.lng]);

    const fetchWeather = async (lat, lng) => {
        setFetchingWeather(true);
        try {
            const res = await apiClient.get(`/api/farmer/simulator/weather-live?lat=${lat}&lng=${lng}`);
            setWeatherData(res.data.data);
            showNotification('success', t('location_success'));
        } catch (err) {
            console.error('Weather sync failed:', err);
        } finally {
            setFetchingWeather(false);
        }
    };

    // File scan handler
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setScanning(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await apiClient.post('/api/farmer/tools/parse-soil-report', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const info = res.data.data;
            if (info.isValidReport) {
                setSoilData({
                    ph: info.ph?.toString() || '',
                    nitrogen: info.nitrogen?.toString() || '',
                    phosphorus: info.phosphorus?.toString() || '',
                    potassium: info.potassium?.toString() || '',
                    carbon: info.carbon?.toString() || ''
                });
                if (info.soilType) {
                    setSoilType(info.soilType);
                }
                showNotification('success', 'Soil report scanned and fields populated successfully!');
                setActiveTab('manual');
            } else {
                showNotification('error', t('scan_error'));
            }
        } catch (err) {
            showNotification('error', 'Could not extract soil report data. Try manual input.');
        } finally {
            setScanning(false);
        }
    };

    // Trigger complete soil assessment
    const checkHealth = async () => {
        const phVal = parseFloat(soilData.ph);
        if (!soilData.ph || isNaN(phVal)) {
            showNotification('error', 'Please enter a valid pH value to analyze.');
            return;
        }

        setAnalyzing(true);
        setStatus(null);

        try {
            const res = await apiClient.post('/api/farmer/tools/soil-analysis', {
                ph: phVal,
                nitrogen: soilData.nitrogen ? parseFloat(soilData.nitrogen) : null,
                phosphorus: soilData.phosphorus ? parseFloat(soilData.phosphorus) : null,
                potassium: soilData.potassium ? parseFloat(soilData.potassium) : null,
                carbon: soilData.carbon ? parseFloat(soilData.carbon) : null,
                cropName,
                soilType,
                location: gpsLocation.lat ? { city: gpsLocation.city, state: gpsLocation.state } : null,
                weather: weatherData ? { temp: weatherData.temp, humidity: weatherData.humidity, rainfall: weatherData.precipitation || 0 } : null,
                language
            });
            setStatus(res.data.data);
        } catch (err) {
            showNotification('error', 'Agronomy analysis failed. Please try again.');
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="max-w-[1920px] mx-auto px-4 lg:px-8 py-10 relative overflow-hidden min-h-screen">
            {/* Background dynamic light blots */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-[1400px] pointer-events-none -z-10">
                <div className="absolute top-10 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px]" />
            </div>

            {/* Notification Toast */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -30, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: -30, x: '-50%' }}
                        className={`fixed top-24 left-1/2 z-[100] px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-center gap-3 min-w-[320px] transform -translate-x-1/2 ${
                            notification.type === 'error'
                                ? 'bg-red-500/90 border-red-500/20 text-white shadow-red-500/20'
                                : 'bg-emerald-500/90 border-emerald-500/20 text-white shadow-emerald-500/20'
                        }`}
                    >
                        <div className="p-1 rounded-full bg-white/20 text-white">
                            {notification.type === 'error' ? <AlertCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-white">{notification.type === 'error' ? 'Notification' : 'Success'}</h4>
                            <p className="text-xs opacity-90 font-medium text-white/90">{notification.message}</p>
                        </div>
                        <button onClick={() => setNotification(null)} className="ml-auto opacity-55 hover:opacity-100 text-white transition-opacity">
                            <XCircle className="h-5 w-5" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Top Branding Section */}
            <div className="text-center max-w-3xl mx-auto mb-12 relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full shadow-sm text-emerald-400 font-bold text-xs mb-5 uppercase tracking-wider">
                    <Microscope className="h-4.5 w-4.5 text-emerald-400 animate-pulse" /> {t('title')}
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight mb-4 dark:text-white">
                    {t('title')}
                </h1>
                <p className="text-gray-500 text-base md:text-lg dark:text-slate-400 max-w-2xl mx-auto">
                    {t('subtitle')}
                </p>
            </div>

            {/* Primary Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
                
                {/* Left Section: Inputs & Configuration */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 md:p-8 border border-gray-100 shadow-xl dark:bg-slate-900/80 dark:border-slate-800">
                        
                        {/* Tab Switcher */}
                        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl mb-8">
                            <button
                                onClick={() => setActiveTab('manual')}
                                className={`flex-1 py-3 text-center font-bold text-sm rounded-xl transition-all ${
                                    activeTab === 'manual'
                                        ? 'bg-white text-gray-900 shadow-md dark:bg-slate-700 dark:text-white'
                                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                                }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <FlaskConical className="h-4 w-4" />
                                    {t('tab_manual')}
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('scan')}
                                className={`flex-1 py-3 text-center font-bold text-sm rounded-xl transition-all ${
                                    activeTab === 'scan'
                                        ? 'bg-white text-gray-900 shadow-md dark:bg-slate-700 dark:text-white'
                                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                                }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    {t('tab_scan')}
                                </div>
                            </button>
                        </div>

                        {/* Interactive Manual Form */}
                        {activeTab === 'manual' ? (
                            <div className="space-y-5">
                                {/* Crop & Soil Type */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2 block">
                                            {t('crop_label')}
                                        </label>
                                        <input
                                            type="text"
                                            placeholder={t('crop_placeholder')}
                                            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:focus:ring-emerald-400/20 dark:focus:border-emerald-400"
                                            value={cropName}
                                            onChange={(e) => setCropName(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2 block">
                                            {t('soil_type_label')}
                                        </label>
                                        <select
                                            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:focus:ring-emerald-400/20 dark:focus:border-emerald-400"
                                            value={soilType}
                                            onChange={(e) => setSoilType(e.target.value)}
                                        >
                                            <option value="">{t('soil_type_placeholder')}</option>
                                            <option value="Alluvial">{t('soil_alluvial')}</option>
                                            <option value="Red Soil">{t('soil_red')}</option>
                                            <option value="Black Soil">{t('soil_black')}</option>
                                            <option value="Laterite">{t('soil_laterite')}</option>
                                            <option value="Clay">{t('soil_clay')}</option>
                                            <option value="Sandy">{t('soil_sandy')}</option>
                                            <option value="Loam">{t('soil_loam')}</option>
                                        </select>
                                    </div>
                                </div>

                                {/* pH Balance */}
                                <div>
                                    <label className="flex items-center justify-between text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                                        <span>{t('ph_label')}</span>
                                        <span className="text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded text-[10px] dark:bg-emerald-950/40 dark:text-emerald-400 font-extrabold uppercase">Required</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.1"
                                            placeholder="e.g. 6.8"
                                            className="w-full pl-5 pr-12 py-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:focus:ring-emerald-400/20 dark:focus:border-emerald-400"
                                            value={soilData.ph}
                                            onChange={(e) => setSoilData({ ...soilData, ph: e.target.value })}
                                        />
                                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">pH</span>
                                    </div>
                                </div>

                                {/* N P K Grid */}
                                <div className="grid grid-cols-3 gap-3">
                                    <NutrientFormInput label={t('n_label')} symbol="N" color="indigo" val={soilData.nitrogen} set={(v) => setSoilData({ ...soilData, nitrogen: v })} />
                                    <NutrientFormInput label={t('p_label')} symbol="P" color="amber" val={soilData.phosphorus} set={(v) => setSoilData({ ...soilData, phosphorus: v })} />
                                    <NutrientFormInput label={t('k_label')} symbol="K" color="rose" val={soilData.potassium} set={(v) => setSoilData({ ...soilData, potassium: v })} />
                                </div>

                                {/* Organic Carbon */}
                                <div>
                                    <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2 block">
                                        {t('oc_label')}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.05"
                                            placeholder="e.g. 0.65"
                                            className="w-full pl-5 pr-12 py-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:focus:ring-emerald-400/20 dark:focus:border-emerald-400"
                                            value={soilData.carbon}
                                            onChange={(e) => setSoilData({ ...soilData, carbon: e.target.value })}
                                        />
                                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">%</span>
                                    </div>
                                </div>

                                {/* Location Sync Bar */}
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 mt-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 shrink-0">
                                            <MapPin className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">
                                                {gpsLocation.city ? `${gpsLocation.city}, ${gpsLocation.state}` : t('location_btn')}
                                            </h4>
                                            <p className="text-[10px] text-slate-400 truncate">
                                                {weatherData ? `${weatherData.temp}°C | ${weatherData.humidity}% humidity` : 'Sync for weather-aware schedules'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={detectGPS}
                                        disabled={gpsLoading || fetchingWeather}
                                        className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white rounded-lg text-xs font-black transition-all shrink-0 flex items-center gap-1 disabled:opacity-50"
                                    >
                                        {gpsLoading || fetchingWeather ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                                        {gpsLocation.city ? 'Synced' : 'Sync'}
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={checkHealth}
                                    disabled={analyzing}
                                    className="w-full mt-6 bg-slate-900 text-white font-extrabold text-lg py-4.5 rounded-xl hover:bg-slate-800 active:scale-95 transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3 disabled:opacity-75 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                                >
                                    {analyzing ? (
                                        <>
                                            <RefreshCw className="h-5 w-5 animate-spin" /> {t('btn_analyzing')}
                                        </>
                                    ) : (
                                        <>
                                            {t('btn_analyze')} <ArrowRight className="h-5 w-5" />
                                        </>
                                    )}
                                </button>
                            </div>
                        ) : (
                            /* Scanner Dropzone */
                            <div className="space-y-6">
                                <h3 className="text-lg font-black text-gray-900 dark:text-white">{t('scan_title')}</h3>
                                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-slate-50 transition-all dark:bg-slate-800/20 cursor-pointer relative overflow-hidden group">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        disabled={scanning}
                                    />
                                    {scanning ? (
                                        <div className="flex flex-col items-center py-6">
                                            <RefreshCw className="h-10 w-10 text-emerald-500 animate-spin mb-4" />
                                            <h4 className="font-bold text-gray-900 dark:text-white mb-1">Scanning Document...</h4>
                                            <p className="text-xs text-gray-400">Gemini Vision OCR is analyzing reports parameters...</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center py-6">
                                            <div className="w-16 h-16 bg-white dark:bg-slate-850 rounded-2xl flex items-center justify-center shadow-md mb-4 group-hover:scale-110 transition-transform">
                                                <UploadCloud className="h-8 w-8 text-slate-400 group-hover:text-emerald-400" />
                                            </div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white mb-2">{t('scan_desc')}</p>
                                            <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">Image limit: 5MB</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 flex gap-3">
                                    <Info className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                                    <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80 leading-relaxed font-medium">
                                        Ensure document elements like **pH value**, **Nitrogen (N)**, **Phosphorus (P)**, or **Soil Type** are visible and not blurry. Once scanned, you can fine-tune the parameters in the manual parameter tab.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Section: Assessment Results Dashboard */}
                <div className="lg:col-span-7">
                    <AnimatePresence mode="wait">
                        {status ? (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, y: 25 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 25 }}
                                className="space-y-6"
                            >
                                {/* Score Indicator Banner */}
                                <div className={`relative overflow-hidden rounded-[2rem] p-6 md:p-8 text-white shadow-2xl ${
                                    status.score >= 80 
                                        ? 'bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 shadow-emerald-500/20' 
                                        : status.score >= 60 
                                            ? 'bg-gradient-to-br from-amber-400 via-orange-500 to-amber-500 shadow-orange-500/20' 
                                            : 'bg-gradient-to-br from-rose-500 via-pink-600 to-rose-600 shadow-red-500/20'
                                }`}>
                                    <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                                    <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 md:gap-10">
                                        
                                        {/* Score Circle */}
                                        <div className="relative shrink-0">
                                            <div className="w-28 h-28 rounded-full border-4 border-white/20 flex items-center justify-center">
                                                <div className="absolute inset-0 rounded-full border-4 border-white" style={{ clipPath: `polygon(0 0, 100% 0, 100% ${status.score}%, 0 ${status.score}%)` }} />
                                                <div className="text-center">
                                                    <span className="text-4xl font-black text-white">{status.score}</span>
                                                    <p className="text-[10px] opacity-75 font-bold uppercase tracking-wider">/100</p>
                                                </div>
                                            </div>
                                            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-0.5 bg-white text-slate-800 rounded-full text-[10px] font-black tracking-wide border shadow-sm">
                                                {status.status}
                                            </div>
                                        </div>

                                        {/* Details summary */}
                                        <div className="flex-1 text-center sm:text-left">
                                            <div className="inline-flex items-center gap-1 bg-white/20 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
                                                <Activity className="h-3 w-3" /> Soil Diagnostic Report
                                            </div>
                                            <h3 className="text-2xl md:text-3xl font-black tracking-tight mb-2">
                                                {cropName ? `${cropName} Compatibility` : 'Comprehensive Fertility Result'}
                                            </h3>
                                            <p className="text-sm opacity-90 leading-relaxed font-medium">
                                                {status.summary}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* pH Gauge Analysis */}
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm dark:bg-slate-900 dark:border-slate-800 md:col-span-6 flex flex-col justify-between">
                                        <h3 className="font-extrabold text-sm text-gray-900 mb-6 flex items-center gap-2.5 dark:text-white">
                                            <div className="p-2 rounded-xl bg-sky-50 text-sky-500 dark:bg-sky-950/40 dark:text-sky-400">
                                                <Droplets className="h-4.5 w-4.5" />
                                            </div>
                                            pH Acidity/Alkalinity Balance
                                        </h3>
                                        <div className="relative pt-8 pb-3 px-2">
                                            <div className="h-4.5 bg-gradient-to-r from-rose-400 via-emerald-400 to-indigo-500 rounded-full w-full relative">
                                                <div className="absolute top-0 bottom-0 left-[35%] w-0.5 bg-white/40" />
                                                <div className="absolute top-0 bottom-0 left-[55%] w-0.5 bg-white/40" />
                                            </div>
                                            <div className="flex justify-between text-[9px] font-black text-gray-400 uppercase tracking-widest mt-3">
                                                <span className="text-rose-400">{t('ph_gauge_acidic')}</span>
                                                <span className="text-emerald-500">{t('ph_gauge_optimal')}</span>
                                                <span className="text-indigo-400">{t('ph_gauge_alkaline')}</span>
                                            </div>
                                            {/* Dynamic Indicator Pin */}
                                            <motion.div
                                                initial={{ left: '50%', opacity: 0 }}
                                                animate={{ left: `${(Math.min(Math.max(parseFloat(soilData.ph) || 7, 0), 14) / 14) * 100}%`, opacity: 1 }}
                                                transition={{ type: 'spring', stiffness: 80, delay: 0.1 }}
                                                className="absolute top-0.5 -translate-x-1/2 flex flex-col items-center"
                                            >
                                                <div className="bg-slate-900 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-md dark:bg-white dark:text-slate-900">{soilData.ph} pH</div>
                                                <div className="w-0.5 h-7.5 bg-slate-900 dark:bg-white" />
                                            </motion.div>
                                        </div>
                                        <p className="text-xs font-semibold text-slate-500 mt-4 leading-relaxed dark:text-slate-400">
                                            {status.ph_interpretation}
                                        </p>
                                    </div>

                                    {/* Parameter gauges (NPK Status) */}
                                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm dark:bg-slate-900 dark:border-slate-800 md:col-span-6 space-y-4">
                                        <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2.5 dark:text-white">
                                            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-400">
                                                <BarChart3 className="h-4.5 w-4.5" />
                                            </div>
                                            {t('nutrient_title')}
                                        </h3>
                                        <div className="space-y-3.5">
                                            <NutrientBar label="Nitrogen (N)" value={status.nutrients?.n?.value} status={status.nutrients?.n?.status} ideal={status.nutrients?.n?.ideal} color="bg-indigo-500" />
                                            <NutrientBar label="Phosphorus (P)" value={status.nutrients?.p?.value} status={status.nutrients?.p?.status} ideal={status.nutrients?.p?.ideal} color="bg-amber-500" />
                                            <NutrientBar label="Potassium (K)" value={status.nutrients?.k?.value} status={status.nutrients?.k?.status} ideal={status.nutrients?.k?.ideal} color="bg-rose-500" />
                                            <NutrientBar label="Organic Carbon (OC)" value={status.nutrients?.carbon?.value} status={status.nutrients?.carbon?.status} ideal={status.nutrients?.carbon?.ideal} color="bg-teal-500" suffix="%" />
                                        </div>
                                    </div>
                                </div>

                                {/* Crop Compatibility Carousel & Irrigation Advice */}
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                    {/* Crop index cards */}
                                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm dark:bg-slate-900 dark:border-slate-800 md:col-span-7">
                                        <h3 className="font-extrabold text-sm text-gray-900 mb-4 flex items-center gap-2.5 dark:text-white">
                                            <div className="p-2 rounded-xl bg-teal-50 text-teal-500 dark:bg-teal-950/40 dark:text-teal-400">
                                                <Sprout className="h-4.5 w-4.5" />
                                            </div>
                                            {t('crop_recommendation')}
                                        </h3>
                                        <div className="space-y-3">
                                            {status.suitable_crops?.map((crop, idx) => (
                                                <div key={idx} className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 rounded-xl flex items-center justify-between gap-4">
                                                    <div className="min-w-0">
                                                        <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">{crop.name}</h4>
                                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-normal">{crop.reason}</p>
                                                    </div>
                                                    <div className="shrink-0 flex flex-col items-end">
                                                        <span className="text-emerald-500 dark:text-emerald-400 font-black text-sm">{crop.compatibility_pct}%</span>
                                                        <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wide">Match</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Weather-Aware Irrigation advice */}
                                    <div className="bg-slate-900 text-white p-6 rounded-[2rem] md:col-span-5 flex flex-col justify-between relative overflow-hidden shadow-xl shadow-slate-900/15">
                                        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl" />
                                        <div>
                                            <h3 className="font-extrabold text-sm mb-4 flex items-center gap-2.5">
                                                <div className="p-2 rounded-xl bg-white/10 text-emerald-400">
                                                    <Droplets className="h-4.5 w-4.5" />
                                                </div>
                                                {t('irrigation_title')}
                                            </h3>
                                            <p className="text-xs leading-relaxed opacity-90 font-medium">
                                                {status.irrigation_advice}
                                            </p>
                                        </div>
                                        {weatherData && (
                                            <div className="flex items-center gap-4 mt-6 pt-4 border-t border-white/10 text-[10px] opacity-75 font-black uppercase tracking-wider">
                                                <span className="flex items-center gap-1"><Sun className="h-3 w-3" /> {weatherData.temp}°C</span>
                                                <span className="flex items-center gap-1"><Wind className="h-3 w-3" /> {weatherData.humidity}% RH</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Precision Action Plan Suggestions & Organic Amendments */}
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                    {/* Fertility Action Grid */}
                                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm dark:bg-slate-900 dark:border-slate-800 md:col-span-7">
                                        <h3 className="font-extrabold text-sm text-gray-900 mb-4 flex items-center gap-2.5 dark:text-white">
                                            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-400">
                                                <TrendingUp className="h-4.5 w-4.5" />
                                            </div>
                                            {t('fertility_title')}
                                        </h3>
                                        <div className="space-y-3">
                                            {status.fertility_suggestions?.map((rec, i) => (
                                                <RecActionCard key={i} title={rec.title} desc={rec.desc} type={rec.type} delay={i * 0.15} />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Organic details lists */}
                                    <div className="bg-emerald-50 dark:bg-emerald-950/20 p-6 rounded-[2rem] border border-emerald-100 dark:border-emerald-900/20 md:col-span-5">
                                        <h3 className="font-extrabold text-sm text-emerald-900 dark:text-emerald-400 mb-4 flex items-center gap-2.5">
                                            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                                                <Leaf className="h-4.5 w-4.5" />
                                            </div>
                                            {t('organic_title')}
                                        </h3>
                                        <ul className="space-y-3">
                                            {status.organic_tips?.map((tip, i) => (
                                                <li key={i} className="flex gap-2.5 items-start text-xs font-semibold text-emerald-800 dark:text-emerald-300 leading-relaxed">
                                                    <div className="p-1 rounded-full bg-emerald-500/15 text-emerald-500 shrink-0 mt-0.5">
                                                        <Check className="h-3 w-3" />
                                                    </div>
                                                    {tip}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* Warnings & Environmental Risks */}
                                {status.risks?.length > 0 && (
                                    <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-950/30 rounded-[2rem] p-6">
                                        <h3 className="font-black text-sm text-rose-900 dark:text-rose-400 mb-4 flex items-center gap-2.5">
                                            <ShieldAlert className="h-5 w-5 text-rose-500" /> Environmental Soil Risks
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {status.risks.map((risk, i) => (
                                                <div key={i} className="p-4 bg-white dark:bg-slate-900/60 border border-rose-100/40 dark:border-rose-900/20 rounded-2xl flex gap-3">
                                                    <AlertTriangle className={`h-5 w-5 shrink-0 ${risk.level === 'High' ? 'text-red-500' : 'text-amber-500'}`} />
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">{risk.risk_name}</h4>
                                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                                                risk.level === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                                                            }`}>{risk.level} Risk</span>
                                                        </div>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{risk.description}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            /* Empty State */
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-full min-h-[440px] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50/20 text-center p-8 text-slate-400 dark:border-slate-800"
                            >
                                <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-[2rem] flex items-center justify-center shadow-lg mb-6 group-hover:scale-105 transition-transform duration-300">
                                    <BarChart3 className="h-10 w-10 text-emerald-500 animate-pulse" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 mb-2 dark:text-white">{t('ready_title')}</h3>
                                <p className="max-w-xs mx-auto text-slate-500 text-sm leading-relaxed dark:text-slate-400 font-medium">
                                    {t('ready_desc')}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

// Sub-components
const NutrientFormInput = ({ label, symbol, color, val, set }) => {
    const focusColors = {
        indigo: 'focus:ring-indigo-500/20 focus:border-indigo-500',
        amber: 'focus:ring-amber-500/20 focus:border-amber-500',
        rose: 'focus:ring-rose-500/20 focus:border-rose-500'
    };

    const bgColors = {
        indigo: 'bg-indigo-500',
        amber: 'bg-amber-500',
        rose: 'bg-rose-500'
    };

    return (
        <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block text-center mb-1">{label}</label>
            <div className="relative">
                <input
                    type="number"
                    placeholder="-"
                    className={`w-full p-3 text-center bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-900 focus:ring-2 outline-none transition-all ${focusColors[color]} dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:focus:ring-emerald-400/20 dark:focus:border-emerald-400`}
                    value={val}
                    onChange={(e) => set(e.target.value)}
                />
                <span className={`absolute top-0 right-0 -mt-1.5 -mr-1 px-1.5 py-0.5 rounded text-[8px] font-black text-white shadow-sm uppercase ${bgColors[color]}`}>
                    {symbol}
                </span>
            </div>
        </div>
    );
};

const NutrientBar = ({ label, value, status, ideal, color, suffix = ' kg/ha' }) => {
    // Dynamic status classes
    const statusColors = {
        High: 'bg-red-500/10 text-red-500 dark:bg-red-950/40 dark:text-red-400',
        Medium: 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-400',
        Low: 'bg-amber-500/10 text-amber-500 dark:bg-amber-950/40 dark:text-amber-400',
        Optimal: 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-400'
    };

    // Calculate simulated bar percentage
    let percentage = 40;
    if (status === 'High' || status === 'Optimal') percentage = 90;
    else if (status === 'Medium') percentage = 65;
    else if (status === 'Low') percentage = 30;

    return (
        <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-700 dark:text-slate-300">{label}</span>
                <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-[10px]">Ideal: {ideal}</span>
                    <span className={`px-2 py-0.5 rounded-[6px] text-[9px] font-black uppercase ${statusColors[status] || 'bg-slate-100 text-slate-500'}`}>
                        {status}
                    </span>
                </div>
            </div>
            <div className="h-2 bg-slate-100 rounded-full w-full relative overflow-hidden dark:bg-slate-800">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full ${color}`}
                />
            </div>
            {value !== undefined && (
                <div className="text-[10px] text-gray-400 font-medium">
                    Current value: <strong className="text-slate-600 dark:text-slate-350">{value}{suffix}</strong>
                </div>
            )}
        </div>
    );
};

const RecActionCard = ({ title, desc, type, delay }) => {
    const cardStyles = {
        urgent: 'bg-red-50/70 border-red-100/60 text-red-900 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-200',
        warning: 'bg-amber-50/70 border-amber-100/60 text-amber-900 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-200',
        good: 'bg-emerald-50/70 border-emerald-100/60 text-emerald-900 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-200',
        tip: 'bg-sky-50/70 border-sky-100/60 text-sky-900 dark:bg-sky-950/20 dark:border-sky-900/30 dark:text-sky-200'
    };

    const cardIcons = {
        urgent: <AlertCircle className="h-5 w-5 text-red-500" />,
        warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
        good: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
        tip: <Info className="h-5 w-5 text-sky-500" />
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + delay, duration: 0.4 }}
            className={`p-4 rounded-2xl border ${cardStyles[type]} flex gap-3 items-start bg-white/40 dark:bg-transparent hover:shadow-md transition-shadow`}
        >
            <div className="shrink-0 mt-0.5">{cardIcons[type]}</div>
            <div>
                <h4 className="font-extrabold text-sm mb-0.5">{title}</h4>
                <p className="text-xs opacity-90 leading-relaxed font-semibold">{desc}</p>
            </div>
        </motion.div>
    );
};

export default SoilHealthCheck;
