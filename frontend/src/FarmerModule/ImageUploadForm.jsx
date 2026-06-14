import React, { useState, useRef, useEffect } from 'react';
import {
    UploadCloud, CheckCircle2, AlertCircle, Loader2, Sprout, MapPin, RefreshCw,
    Camera, X, CloudSun, Beaker, ChevronDown,
    Volume2, VolumeX, ScanLine, Tractor, Activity,
    ShieldCheck, Leaf, Compass, Search, HelpCircle, AlertTriangle, ChevronRight,
    Droplets, Thermometer, Wind, FileText, Landmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../services/apiClient';
import clsx from 'clsx';
import { useLanguage } from '../Context/LanguageContext';
import { useTheme } from '../Context/ThemeContext';
import { toast } from 'react-hot-toast';
import { useGlobalState } from '../Context/GlobalStateContext';
import {
    LAND_HIERARCHY, VILLAGE_COORDS,
    LAND_TYPES, SOIL_TYPES, WATER_SOURCES,
    IRRIGATION_LEVELS, CURRENT_CROPS, PREVIOUS_CROPS, SIZE_UNITS
} from '../services/landData';

const PIPELINE_STAGES = [
    { id: 1, text: 'Running Stage 1 Botanical Validation...' },
    { id: 2, text: 'Identifying plant species & taxonomy...' },
    { id: 3, text: 'Connecting Groq vision neural engines...' },
    { id: 4, text: 'Invoking Gemini treatment matrices...' },
    { id: 5, text: 'Compiling agronomic report...' },
];

// ── Cascading Select ──────────────────────────────────────────────────────────
const Field = ({ label, value, onChange, options, placeholder = 'Select', disabled = false }) => (
    <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</label>
        <div className="relative">
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                disabled={disabled}
                className={clsx(
                    'w-full appearance-none border rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all',
                    'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-white/10 text-slate-800 dark:text-white',
                    disabled && 'opacity-40 cursor-not-allowed'
                )}
            >
                <option value="">{placeholder}</option>
                {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        </div>
    </div>
);

// ── Patta/Chitta Location Selector ───────────────────────────────────────────
const PattaLocationSelector = ({ onLocationChange }) => {
    const states   = Object.keys(LAND_HIERARCHY);
    const [selState,    setSelState]    = useState('Tamil Nadu');
    const [selDistrict, setSelDistrict] = useState('');
    const [selTaluk,    setSelTaluk]    = useState('');
    const [selVillage,  setSelVillage]  = useState('');

    const districts = selState   ? Object.keys(LAND_HIERARCHY[selState] || {})          : [];
    const taluks    = selDistrict? Object.keys((LAND_HIERARCHY[selState] || {})[selDistrict] || {}) : [];
    const villages  = selTaluk   ? ((LAND_HIERARCHY[selState] || {})[selDistrict] || {})[selTaluk] || [] : [];

    const handleState = (v) => {
        setSelState(v); setSelDistrict(''); setSelTaluk(''); setSelVillage('');
        onLocationChange({ state: v, district: '', taluk: '', village: '', coords: null });
    };
    const handleDistrict = (v) => {
        setSelDistrict(v); setSelTaluk(''); setSelVillage('');
        onLocationChange({ state: selState, district: v, taluk: '', village: '', coords: null });
    };
    const handleTaluk = (v) => {
        setSelTaluk(v); setSelVillage('');
        onLocationChange({ state: selState, district: selDistrict, taluk: v, village: '', coords: null });
    };
    const handleVillage = (v) => {
        setSelVillage(v);
        const coords = VILLAGE_COORDS[v] || null;
        onLocationChange({ state: selState, district: selDistrict, taluk: selTaluk, village: v, coords });
    };

    const isComplete = selState && selDistrict && selTaluk && selVillage;
    const coords = selVillage ? VILLAGE_COORDS[selVillage] : null;

    return (
        <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl p-4 space-y-3">
            {/* Header */}
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-white/5">
                <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                    <Landmark className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-white">Land Location</h3>
                    <p className="text-[9px] text-slate-400 uppercase tracking-wider">Patta / Chitta Record Style</p>
                </div>
            </div>

            {/* Step breadcrumb */}
            <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider flex-wrap">
                {['State', 'District', 'Taluk', 'Village'].map((step, i) => (
                    <React.Fragment key={step}>
                        <span className={clsx(
                            'px-2 py-0.5 rounded-full',
                            i === 0 && selState   ? 'bg-emerald-500/15 text-emerald-500' :
                            i === 1 && selDistrict? 'bg-emerald-500/15 text-emerald-500' :
                            i === 2 && selTaluk   ? 'bg-emerald-500/15 text-emerald-500' :
                            i === 3 && selVillage ? 'bg-emerald-500/15 text-emerald-500' :
                                                    'bg-slate-100 dark:bg-white/5 text-slate-400'
                        )}>{step}</span>
                        {i < 3 && <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600 shrink-0" />}
                    </React.Fragment>
                ))}
            </div>

            {/* Cascading dropdowns */}
            <div className="grid grid-cols-2 gap-2.5">
                <Field label="State" value={selState} onChange={handleState} options={states} />
                <Field label="District" value={selDistrict} onChange={handleDistrict} options={districts} disabled={!selState} placeholder="Select District" />
                <Field label="Taluk" value={selTaluk} onChange={handleTaluk} options={taluks} disabled={!selDistrict} placeholder="Select Taluk" />
                <Field label="Village / Town" value={selVillage} onChange={handleVillage} options={villages} disabled={!selTaluk} placeholder="Select Village" />
            </div>

            {/* Location confirmed badge */}
            {isComplete && (
                <div className={clsx(
                    'rounded-xl p-2.5 text-[10px] font-semibold flex items-start gap-2',
                    coords
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                        : 'bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400'
                )}>
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <div>
                        <div className="font-bold">{selVillage}, {selTaluk}</div>
                        <div className="opacity-80">{selDistrict} Dist · {selState}</div>
                        {coords
                            ? <div className="opacity-60 mt-0.5">Lat: {coords.lat} · Lon: {coords.lon}</div>
                            : <div className="text-amber-500 mt-0.5">Coordinates not mapped — weather unavailable</div>
                        }
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Land Profile Form ─────────────────────────────────────────────────────────
const LandProfileForm = ({ profile, onChange }) => {
    const set = (key) => (val) => onChange({ ...profile, [key]: val });
    return (
        <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-white/5">
                <div className="p-1.5 bg-teal-500/10 rounded-lg">
                    <FileText className="w-4 h-4 text-teal-500" />
                </div>
                <div>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-white">Land Profile</h3>
                    <p className="text-[9px] text-slate-400 uppercase tracking-wider">Soil · Water · Crop Details</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
                <Field label="Land Type" value={profile.landType} onChange={set('landType')} options={LAND_TYPES} placeholder="Land Type" />
                <Field label="Soil Type" value={profile.soilType} onChange={set('soilType')} options={SOIL_TYPES} placeholder="Soil Type" />
                <Field label="Water Source" value={profile.waterSource} onChange={set('waterSource')} options={WATER_SOURCES} placeholder="Water Source" />
                <Field label="Irrigation" value={profile.irrigationLevel} onChange={set('irrigationLevel')} options={IRRIGATION_LEVELS} placeholder="Irrigation" />
                <Field label="Current Crop" value={profile.currentCrop} onChange={set('currentCrop')} options={CURRENT_CROPS} placeholder="Current Crop" />
                <Field label="Previous Crop" value={profile.previousCrop} onChange={set('previousCrop')} options={PREVIOUS_CROPS} placeholder="Previous Crop" />
            </div>

            {/* Farm size */}
            <div className="flex gap-2">
                <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Farm Size</label>
                    <input
                        type="number"
                        min="0.1" step="0.1"
                        value={profile.farmSize}
                        onChange={e => set('farmSize')(e.target.value)}
                        placeholder="e.g. 2.5"
                        className="w-full bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                </div>
                <div className="w-24">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Unit</label>
                    <div className="relative">
                        <select
                            value={profile.sizeUnit}
                            onChange={e => set('sizeUnit')(e.target.value)}
                            className="w-full appearance-none bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
                        >
                            {SIZE_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Weather Mini Card ─────────────────────────────────────────────────────────
const WeatherCard = ({ weather, locationLabel }) => {
    if (!weather) return null;
    return (
        <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800/40 rounded-2xl p-3 flex items-center gap-4">
            <div className="p-2 bg-sky-100 dark:bg-sky-800/40 rounded-xl">
                <CloudSun className="w-5 h-5 text-sky-500" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-sky-500 uppercase tracking-wider truncate">{locationLabel}</p>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-200">
                        <Thermometer className="w-3 h-3 text-orange-400" />{weather.temp}°C
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-200">
                        <Droplets className="w-3 h-3 text-blue-400" />{weather.humidity}%
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-200">
                        <Wind className="w-3 h-3 text-teal-400" />{weather.wind}km/h
                    </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 capitalize">{weather.condition}</p>
            </div>
            {weather.humidity > 75 && (
                <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-full shrink-0">
                    ⚠ High Humidity
                </span>
            )}
        </div>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────
const ImageUploadForm = () => {
    const { t, language }     = useLanguage();
    const { isDarkMode }      = useTheme();
    const { refreshGlobalData } = useGlobalState();

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    useEffect(() => {
        const h = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', h);
        return () => window.removeEventListener('resize', h);
    }, []);
    const isLargeScreen = windowWidth >= 1024;

    // Image / analysis
    const [selectedImage, setSelectedImage]   = useState(null);
    const [previewUrl, setPreviewUrl]         = useState(null);
    const [loading, setLoading]               = useState(false);
    const [pipelineStage, setPipelineStage]   = useState(0);
    const [result, setResult]                 = useState(null);
    const [error, setError]                   = useState(null);
    const [pendingAnalysis, setPendingAnalysis] = useState(null);
    const [confidenceMode, setConfidenceMode] = useState('none');
    const [isCameraOpen, setIsCameraOpen]     = useState(false);
    const [isSpeaking, setIsSpeaking]         = useState(false);

    // Crop search
    const [searchQuery, setSearchQuery]       = useState('');
    const [cropType, setCropType]             = useState('');
    const [scientificName, setScientificName] = useState('');
    const [farmingType, setFarmingType]       = useState('field');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions]       = useState([]);
    const [isSuggesting, setIsSuggesting]     = useState(false);
    const [isWaitingToSearch, setIsWaitingToSearch] = useState(false);
    const searchTimeoutRef = useRef(null);
    const pendingQueryRef  = useRef('');
    const isSelectingRef   = useRef(false);

    // ── Patta/Chitta location state ──────────────────────────────────────────
    const [locationData, setLocationData] = useState({
        state: 'Tamil Nadu', district: '', taluk: '', village: '', coords: null
    });

    // ── Land profile state ───────────────────────────────────────────────────
    const [landProfile, setLandProfile] = useState({
        landType: '', soilType: '', waterSource: '', irrigationLevel: '',
        currentCrop: '', previousCrop: 'None', farmSize: '', sizeUnit: 'Acres'
    });

    // ── Weather state ────────────────────────────────────────────────────────
    const [liveWeather, setLiveWeather]   = useState(null);
    const [weatherLoading, setWeatherLoading] = useState(false);
    const [estimatedSoil, setEstimatedSoil] = useState(null);
    const [soilData, setSoilData]         = useState({ n: 140, p: 45, k: 55 });

    const videoRef    = useRef(null);
    const canvasRef   = useRef(null);
    const fileInputRef= useRef(null);
    const resultRef   = useRef(null);

    // Fetch weather when village coords are set
    useEffect(() => {
        if (locationData.coords) {
            fetchWeather(locationData.coords.lat, locationData.coords.lon);
            fetchAISoilProfile();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [locationData.coords]);

    useEffect(() => {
        if (result && resultRef.current) {
            setTimeout(() => resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
        }
    }, [result]);

    // ── Weather (coords-based, never city name) ──────────────────────────────
    const fetchWeather = async (lat, lon) => {
        setWeatherLoading(true);
        console.log('[WEATHER] Fetch Started', { lat, lon });
        try {
            const res = await apiClient.get(`/weather/by-coords?lat=${lat}&lon=${lon}`);
            if (res.data.success) {
                const w = res.data.data;
                console.log('[WEATHER] Success', { temp: w.temp });
                setLiveWeather({ temp: w.temp, humidity: w.humidity, wind: w.wind, condition: w.condition });
            }
        } catch (e) {
            console.warn('[WEATHER] Failed', e.message);
        } finally {
            setWeatherLoading(false);
        }
    };

    // ── AI Soil Profile ──────────────────────────────────────────────────────
    const fetchAISoilProfile = async () => {
        if (!locationData.state || !locationData.district) return;
        try {
            const res = await apiClient.post('/soil-profile', {
                state:    locationData.state,
                district: locationData.district,
                taluk:    locationData.taluk,
                village:  locationData.village,
                latitude:  locationData.coords?.lat?.toString() || '',
                longitude: locationData.coords?.lon?.toString() || '',
            });
            if (res.data?.success && res.data.data) setEstimatedSoil(res.data.data);
        } catch (e) {
            console.warn('Soil profile fetch failed:', e.message);
        }
    };

    // ── Crop search ──────────────────────────────────────────────────────────
    const triggerSearch = async (query) => {
        if (!query || query.trim().length < 2) return;
        setIsWaitingToSearch(false);
        setIsSuggesting(true);
        try {
            const res = await apiClient.get(`/crop-suggestions?q=${encodeURIComponent(query.trim())}`);
            if (res.data?.success) { setSuggestions(res.data.data || []); setShowSuggestions(true); }
        } catch { /* silent */ } finally { setIsSuggesting(false); }
    };

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        pendingQueryRef.current = query;
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        if (!query.trim() || query.length < 2) { setSuggestions([]); setShowSuggestions(false); setIsWaitingToSearch(false); return; }
        setIsWaitingToSearch(true);
        searchTimeoutRef.current = setTimeout(() => triggerSearch(pendingQueryRef.current), 2000);
    };
    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); triggerSearch(pendingQueryRef.current); }
    };
    const handleSearchBlur = () => {
        if (isSelectingRef.current) return;
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        setIsWaitingToSearch(false);
        if (pendingQueryRef.current.trim().length >= 2) triggerSearch(pendingQueryRef.current);
    };
    const selectSuggestion = (crop) => {
        isSelectingRef.current = false;
        setSearchQuery(crop.name); setCropType(crop.name); setScientificName(crop.scientific);
        setFarmingType(crop.category); setShowSuggestions(false); setSuggestions([]);
    };

    // ── Camera ───────────────────────────────────────────────────────────────
    const startCamera = async () => {
        setIsCameraOpen(true); setError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            if (videoRef.current) videoRef.current.srcObject = stream;
        } catch { setError('Could not access camera.'); setIsCameraOpen(false); }
    };
    const stopCamera = () => {
        if (videoRef.current?.srcObject) { videoRef.current.srcObject.getTracks().forEach(t => t.stop()); videoRef.current.srcObject = null; }
        setIsCameraOpen(false);
    };
    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const v = videoRef.current, c = canvasRef.current;
            c.width = v.videoWidth; c.height = v.videoHeight;
            c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
            c.toBlob(blob => {
                const file = new File([blob], 'snapshot.jpg', { type: 'image/jpeg' });
                if (previewUrl) URL.revokeObjectURL(previewUrl);
                setSelectedImage(file); setPreviewUrl(URL.createObjectURL(file));
                stopCamera(); autoUploadAndRunDiagnostics(file);
            }, 'image/jpeg', 0.95);
        }
    };
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setSelectedImage(file); setPreviewUrl(URL.createObjectURL(file));
            autoUploadAndRunDiagnostics(file);
        }
    };

    // Build the full farm profile object for API
    const buildFarmProfile = () => ({
        state:          locationData.state,
        district:       locationData.district,
        taluk:          locationData.taluk,
        village:        locationData.village,
        latitude:       locationData.coords?.lat?.toString() || '',
        longitude:      locationData.coords?.lon?.toString() || '',
        landType:       landProfile.landType,
        soilType:       landProfile.soilType,
        waterSource:    landProfile.waterSource,
        irrigationLevel:landProfile.irrigationLevel,
        currentCrop:    landProfile.currentCrop,
        previousCrop:   landProfile.previousCrop,
        farmSize:       `${landProfile.farmSize} ${landProfile.sizeUnit}`,
    });

    // ── Analysis ─────────────────────────────────────────────────────────────
    const autoUploadAndRunDiagnostics = async (file) => {
        if (!file) return;
        setLoading(true); setError(null); setResult(null);
        setPendingAnalysis(null); setConfidenceMode('none'); setPipelineStage(1);
        const interval = setInterval(() => setPipelineStage(p => p < PIPELINE_STAGES.length ? p + 1 : p), 1500);
        const farm = buildFarmProfile();
        const formData = new FormData();
        formData.append('image', file);
        Object.entries(farm).forEach(([k, v]) => formData.append(k, v || ''));
        // backward-compat fields
        formData.append('country', 'India');
        formData.append('pincode', '');
        formData.append('elevation', '');
        try {
            const res = await apiClient.post('/analyze', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            clearInterval(interval);
            const data = res.data;
            if (data.isValidPlant === false) {
                toast.error('Please upload a valid crop or plant image.', { duration: 5000 });
                setError('Please upload a valid crop or plant image.');
                setSelectedImage(null); setPreviewUrl(null); setLoading(false); return;
            }
            const confidence = data.diseaseAnalysis?.confidence || 85;
            const detectedCrop = data.diseaseAnalysis?.crop || 'Rice';
            const detectedSci  = data.diseaseAnalysis?.scientificName || '';
            const detectedCat  = data.diseaseAnalysis?.category || 'field';
            if (confidence > 85) {
                setCropType(detectedCrop); setSearchQuery(detectedCrop);
                setScientificName(detectedSci); setFarmingType(detectedCat);
                setResult(data); setConfidenceMode('none');
                toast.success(`🌱 Auto-Detected: ${detectedCrop} (${confidence.toFixed(0)}%)`);
            } else if (confidence >= 60) {
                setPendingAnalysis(data); setConfidenceMode('confirm');
                toast('AI confidence moderate. Verification required.', { icon: '🤔' });
            } else {
                setPendingAnalysis(data); setConfidenceMode('low_confidence');
                toast.error('Unable to identify crop. Select manually.', { duration: 5000 });
            }
        } catch (err) {
            clearInterval(interval);
            const msg = err.response?.data?.message || 'Botanical verification failed.';
            toast.error(msg); setError(msg); setSelectedImage(null); setPreviewUrl(null);
        } finally { setLoading(false); }
    };

    const acceptPendingResult = () => {
        if (!pendingAnalysis) return;
        const { crop, scientificName: sci, category } = pendingAnalysis.diseaseAnalysis;
        setCropType(crop); setSearchQuery(crop); setScientificName(sci); setFarmingType(category);
        setResult(pendingAnalysis); setConfidenceMode('none'); setPendingAnalysis(null);
        toast.success(`Confirmed: ${crop}`);
    };
    const rejectPendingResult = () => { setCropType(''); setSearchQuery(''); setScientificName(''); setConfidenceMode('low_confidence'); };

    const triggerManualDiagnostics = async () => {
        if (!selectedImage || !cropType) return;
        setLoading(true); setError(null); setResult(null); setConfidenceMode('none'); setPipelineStage(3);
        const farm = buildFarmProfile();
        const formData = new FormData();
        formData.append('image', selectedImage); formData.append('cropType', cropType);
        Object.entries(farm).forEach(([k, v]) => formData.append(k, v || ''));
        formData.append('country', 'India'); formData.append('pincode', ''); formData.append('elevation', '');
        try {
            const res = await apiClient.post('/analyze', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setResult(res.data); toast.success('Crop report compiled!'); refreshGlobalData();
        } catch (err) {
            const msg = err.response?.data?.message || 'Analysis failed.';
            toast.error(msg); setError(msg);
        } finally { setLoading(false); }
    };

    const resetForm = () => {
        setResult(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setSelectedImage(null); setPreviewUrl(null);
        setCropType(''); setSearchQuery(''); setScientificName('');
        setConfidenceMode('none'); setPendingAnalysis(null);
    };

    const speakAdvice = (text) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-IN'; u.rate = 0.95;
        u.onstart = () => setIsSpeaking(true);
        u.onend = () => setIsSpeaking(false);
        u.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(u);
    };
    const stopSpeaking = () => { window.speechSynthesis.cancel(); setIsSpeaking(false); };

    const getSeverityPct = (s) => {
        if (!s) return 40;
        const n = parseInt(s.replace(/\D/g, ''));
        if (!isNaN(n)) return n;
        const l = s.toLowerCase();
        return l.includes('high') || l.includes('severe') ? 80 : l.includes('medium') || l.includes('moderate') ? 45 : 20;
    };

    const txResult = (() => {
        if (!result) return null;
        const disease = result.diseaseAnalysis?.disease || 'Unknown';
        const sevPct  = getSeverityPct(result.diseaseAnalysis?.severity);
        const isHealthy = disease.toLowerCase().includes('healthy');
        return {
            diseaseName:    result.recommendation?.diseaseName || disease,
            isHealthy, severityPercentage: sevPct,
            fertilizer:     result.recommendation?.fertilizer || '',
            dosage:         result.recommendation?.quantity || 'As prescribed',
            instructions:   result.recommendation?.instructions || result.recommendation?.farmerNote || '',
            organicAlternative: result.recommendation?.organicAlternative || '',
            prevention:     result.recommendation?.prevention || '',
            confidence:     result.diseaseAnalysis?.confidence || 85,
            weather:        result.weatherNote || '',
            isHighSpreadRisk: sevPct > 60 && !isHealthy,
            healthScore:    isHealthy ? 98 : Math.max(10, 100 - sevPct),
            affectedAreas:  result.recommendation?.affectedAreas || '',
            cureMethods:    result.recommendation?.cureMethods || '',
            organicSolutions: result.recommendation?.organicSolutions || '',
            fertilizerSuggestions: result.recommendation?.fertilizerSuggestions || '',
            irrigationAdvice: result.recommendation?.irrigationAdvice || '',
            weatherRisks:   result.recommendation?.weatherRisks || '',
            preventionTips: result.recommendation?.preventionTips || '',
            yieldProtectionAdvice: result.recommendation?.yieldProtectionAdvice || '',
            soilRecommendations: result.recommendation?.soilRecommendations || '',
            recoveryTimeline: result.recommendation?.recoveryTimeline || [],
            marketInsights: result.recommendation?.marketInsights || '',
            chatSuggestions: result.recommendation?.chatSuggestions || [],
        };
    })();

    const locationLabel = locationData.village
        ? `${locationData.village}, ${locationData.taluk}`
        : locationData.district || 'Select location';

    return (
        <div className="w-full min-h-screen bg-slate-50 dark:bg-[#030914] text-slate-800 dark:text-[#F8FAFC] p-3 lg:p-4 flex flex-col lg:flex-row gap-4">

            {/* ══════════ SIDEBAR ══════════ */}
            <div className="w-full lg:w-[clamp(280px,23vw,370px)] shrink-0 flex flex-col gap-3 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">

                {/* Header */}
                <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="shrink-0 p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg shadow-emerald-500/20">
                            <ScanLine className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-slate-800 dark:text-white leading-tight">AI Plant Doctor</h2>
                            <span className="text-[10px] text-teal-400 font-semibold uppercase tracking-widest">Crop Diagnosis</span>
                        </div>
                    </div>
                </div>

                {/* ── Patta/Chitta Location Selector ── */}
                <PattaLocationSelector onLocationChange={setLocationData} />

                {/* ── Land Profile Form ── */}
                <LandProfileForm profile={landProfile} onChange={setLandProfile} />

                {/* ── Live Weather (coords-based) ── */}
                {weatherLoading ? (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800/40 text-xs text-sky-500">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Fetching live weather...
                    </div>
                ) : (
                    <WeatherCard weather={liveWeather} locationLabel={locationLabel} />
                )}

                {/* ── Soil Profile (AI estimated) ── */}
                {estimatedSoil && (
                    <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl p-4 space-y-2">
                        <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-white/5">
                            <div className="p-1.5 bg-amber-500/10 rounded-lg"><Beaker className="w-3.5 h-3.5 text-amber-500" /></div>
                            <span className="text-xs font-bold text-slate-800 dark:text-white">Soil Profile</span>
                        </div>
                        {Object.entries(estimatedSoil).map(([key, val]) => (
                            <div key={key} className="flex items-start gap-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider w-24 shrink-0 pt-0.5">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                                <span className="text-[10px] text-slate-600 dark:text-slate-300 font-medium leading-snug">{val}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Crop Search ── */}
                <div className="space-y-2 relative">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Search Crop Species</span>
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400" title="Fuzzy AI Search" />
                    </div>
                    <div className="relative">
                        <input
                            type="text" value={searchQuery} onChange={handleSearchChange}
                            onKeyDown={handleSearchKeyDown} onBlur={handleSearchBlur}
                            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                            placeholder="Type species (e.g. Tomato, Rice)..."
                            className="w-full bg-slate-50 dark:bg-[#030914] border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-3 py-3 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-teal-500 transition-all"
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    </div>
                    {searchQuery.length >= 2 && (isWaitingToSearch || isSuggesting || showSuggestions) && (
                        <div className="absolute z-20 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl mt-1 shadow-2xl max-h-[180px] overflow-y-auto">
                            {isWaitingToSearch ? (
                                <div className="p-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />Press Enter or pause to search...
                                </div>
                            ) : isSuggesting ? (
                                <div className="p-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-400" />AI searching...
                                </div>
                            ) : suggestions.length > 0 ? suggestions.map((crop, i) => (
                                <div key={i} onMouseDown={() => { isSelectingRef.current = true; }} onClick={() => selectSuggestion(crop)}
                                    className="px-4 py-2.5 hover:bg-teal-50 dark:hover:bg-teal-500/10 cursor-pointer flex justify-between items-center border-b border-slate-100 dark:border-white/5 last:border-0">
                                    <div>
                                        <p className="text-xs font-bold text-slate-800 dark:text-white">{crop.name}</p>
                                        <p className="text-[10px] text-slate-400 italic">{crop.scientific}</p>
                                    </div>
                                    <span className="text-[8px] bg-teal-500/10 text-teal-400 border border-teal-500/20 px-1.5 py-0.5 rounded font-bold uppercase">{crop.category}</span>
                                </div>
                            )) : (
                                <div className="p-4 text-xs text-slate-400 text-center">No suggestions found.</div>
                            )}
                        </div>
                    )}
                    {cropType && (
                        <div className="bg-slate-50 dark:bg-[#050C16] border border-white/5 rounded-xl p-3 flex justify-between items-center">
                            <div>
                                <span className="text-[9px] font-extrabold text-teal-400 uppercase tracking-widest block">Active Target</span>
                                <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                                    {cropType} <span className="text-[10px] text-slate-400 italic">({scientificName || 'Custom'})</span>
                                </h4>
                            </div>
                            <button onClick={() => { setCropType(''); setSearchQuery(''); setScientificName(''); }}>
                                <X className="w-3.5 h-3.5 text-slate-400 hover:text-white" />
                            </button>
                        </div>
                    )}
                </div>

                {/* ── Upload Gateway ── */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Specimen Upload Gateway</label>
                    {!isCameraOpen ? (
                        <div className="space-y-3">
                            <div
                                onClick={() => !loading && fileInputRef.current.click()}
                                className="relative border-2 border-dashed rounded-3xl h-[160px] border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#030914] hover:bg-slate-100 dark:hover:bg-slate-800/20 hover:border-teal-500/50 flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden"
                            >
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                                <AnimatePresence mode="wait">
                                    {previewUrl ? (
                                        <div className="relative w-full h-full p-2">
                                            <img src={previewUrl} className="w-full h-full object-cover rounded-2xl" alt="Preview" />
                                            {loading && (
                                                <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center gap-3 p-4 text-center">
                                                    <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
                                                    <p className="text-xs font-bold text-teal-400 uppercase tracking-wider animate-pulse">Running Neural Analysis...</p>
                                                    <p className="text-[10px] text-slate-400">{PIPELINE_STAGES[pipelineStage - 1]?.text || ''}</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center p-6 space-y-3 flex flex-col items-center">
                                            <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10">
                                                <UploadCloud className="w-6 h-6 text-teal-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-800 dark:text-white">Upload Crop Leaf Image</p>
                                                <p className="text-[10px] text-slate-500 mt-1">Tap to browse files</p>
                                            </div>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                            {!previewUrl && (
                                <button type="button" onClick={startCamera}
                                    className="w-full bg-slate-100 dark:bg-[#0A1628] hover:bg-slate-200 dark:hover:bg-slate-800/40 border border-slate-200 dark:border-white/10 rounded-2xl py-3 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2 transition-all">
                                    <Camera className="w-4 h-4 text-teal-400" />Open Live Camera Scanner
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="relative rounded-3xl h-[210px] bg-black overflow-hidden flex items-center justify-center">
                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                            <canvas ref={canvasRef} className="hidden" />
                            <button type="button" onClick={stopCamera} className="absolute top-3 right-3 p-2 bg-black/70 rounded-full text-white hover:bg-red-500 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                            <button type="button" onClick={capturePhoto} className="absolute bottom-4 w-12 h-12 bg-white/20 rounded-full border-2 border-white flex items-center justify-center">
                                <div className="w-9 h-9 bg-white rounded-full" />
                            </button>
                            <motion.div className="absolute left-0 right-0 h-0.5 bg-teal-400 shadow-[0_0_12px_rgba(20,184,166,0.8)]"
                                animate={{ top: ['0%', '100%'] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} />
                        </div>
                    )}
                </div>

                {confidenceMode === 'low_confidence' && cropType && (
                    <button type="button" onClick={triggerManualDiagnostics} disabled={loading}
                        className="w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-widest bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-lg active:scale-95 flex items-center justify-center gap-2">
                        <Sprout className="w-4 h-4" />Run Diagnostics Manually
                    </button>
                )}
            </div>

            {/* ══════════ MAIN CONTENT ══════════ */}
            <div className="flex-1 flex flex-col gap-6">
                <AnimatePresence mode="wait">

                    {/* Confidence confirm */}
                    {confidenceMode === 'confirm' && pendingAnalysis && (
                        <motion.div key="confirm" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                            className="bg-white/80 dark:bg-[#0B1528]/80 backdrop-blur-lg border border-slate-200 dark:border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center text-center gap-6 shadow-2xl flex-1">
                            <div className="p-4 bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20">
                                <HelpCircle className="w-10 h-10 animate-bounce" />
                            </div>
                            <div className="space-y-2">
                                <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full">Species Verification Required</span>
                                <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mt-2">Is this a {pendingAnalysis.diseaseAnalysis.crop}?</h3>
                                <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                                    AI detected {pendingAnalysis.diseaseAnalysis.crop} with {pendingAnalysis.diseaseAnalysis.confidence}% confidence. Please confirm to unlock advisory.
                                </p>
                            </div>
                            <div className="flex gap-4 w-full max-w-xs">
                                <button onClick={acceptPendingResult} className="flex-1 py-3 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all">Yes, Correct</button>
                                <button onClick={rejectPendingResult} className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold rounded-xl text-xs uppercase tracking-wider transition-all">No, Search</button>
                            </div>
                        </motion.div>
                    )}

                    {/* Low confidence */}
                    {confidenceMode === 'low_confidence' && (
                        <motion.div key="lowconf" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                            className="bg-white/80 dark:bg-[#0B1528]/80 backdrop-blur-lg border border-slate-200 dark:border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center text-center gap-6 shadow-2xl flex-1">
                            <div className="p-4 bg-red-500/10 text-red-400 rounded-full border border-red-500/20">
                                <AlertCircle className="w-10 h-10 animate-pulse" />
                            </div>
                            <div className="space-y-2">
                                <span className="text-[10px] font-extrabold text-red-400 uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-full">Unable to identify crop</span>
                                <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mt-2">Species Auto-Fill Failed</h3>
                                <p className="text-xs text-slate-400 max-w-md leading-relaxed">Use the search bar in the sidebar to manually specify the crop name, then click "Run Diagnostics Manually".</p>
                            </div>
                        </motion.div>
                    )}

                    {/* Results */}
                    {txResult && confidenceMode === 'none' ? (
                        <div ref={resultRef} className="w-full flex flex-col gap-6">

                            {/* Disease banner */}
                            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                                className={clsx('rounded-3xl p-6 border relative overflow-hidden flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 shadow-xl',
                                    txResult.isHealthy ? 'bg-gradient-to-r from-[#06241a] to-[#0c3c2e] border-emerald-500/30 text-emerald-400'
                                    : txResult.severityPercentage > 60 ? 'bg-gradient-to-r from-[#340b13] to-[#54121b] border-red-500/30 text-rose-400'
                                    : 'bg-gradient-to-r from-[#2c1305] to-[#421b06] border-orange-500/30 text-amber-400')}>
                                <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.2)_1px,transparent_0)] bg-[size:16px_16px] pointer-events-none" />
                                <div className="space-y-2 relative z-10 flex-1">
                                    <div className="flex gap-2 items-center flex-wrap">
                                        <span className="px-3 py-0.5 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/10">
                                            {txResult.isHealthy ? 'Verified Healthy' : 'Infection Spotted'}
                                        </span>
                                        <span className="px-2.5 py-0.5 bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded-full text-[9px] font-bold uppercase">
                                            {result.diseaseAnalysis?.crop} ({result.diseaseAnalysis?.scientificName})
                                        </span>
                                        {/* Farm profile badge */}
                                        {locationData.village && (
                                            <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-[9px] font-bold flex items-center gap-1">
                                                <MapPin className="w-2.5 h-2.5" />{locationData.village}, {locationData.district}
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold leading-tight tracking-tight text-white">{txResult.diseaseName}</h2>
                                    <div className="w-full space-y-1.5 pt-2 max-w-lg">
                                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                                            <span className="opacity-70">Damage Spread Severity</span>
                                            <span>{txResult.isHealthy ? '0%' : `${txResult.severityPercentage}%`}</span>
                                        </div>
                                        <div className="h-2 w-full bg-black/45 rounded-full overflow-hidden p-[1px] border border-white/5">
                                            <motion.div initial={{ width: 0 }} animate={{ width: txResult.isHealthy ? '0%' : `${txResult.severityPercentage}%`}}
                                                transition={{ duration: 1.5, ease: 'easeOut' }}
                                                className={clsx('h-full rounded-full bg-gradient-to-r', txResult.isHealthy ? 'from-emerald-400 to-teal-400' : txResult.severityPercentage > 60 ? 'from-rose-500 to-red-500' : 'from-amber-400 to-orange-500')} />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1 items-end relative z-10 shrink-0 bg-black/35 backdrop-blur-md p-4 rounded-2xl border border-white/10 min-w-[130px] text-right">
                                    <span className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-none">
                                        {Number(txResult.confidence).toFixed(2)}<span className="text-xs font-semibold opacity-60 ml-0.5">%</span>
                                    </span>
                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Confidence Score</span>
                                </div>
                            </motion.div>

                            {/* Recommendations grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { icon: Activity, color: 'text-teal-400', bg: 'bg-teal-500/10', title: 'Cure Methods', sub: 'Chemical / Technical', body: txResult.cureMethods },
                                    { icon: Leaf, color: 'text-emerald-400', bg: 'bg-emerald-500/10', title: 'Organic Solutions', sub: 'Biological & Natural', body: txResult.organicSolutions },
                                    { icon: ShieldCheck, color: 'text-amber-400', bg: 'bg-amber-500/10', title: 'Yield Protection', sub: 'Mitigate Crop Losses', body: txResult.yieldProtectionAdvice },
                                ].map(({ icon: Icon, color, bg, title, sub, body }) => (
                                    <div key={title} className="bg-slate-50 dark:bg-[#050C16] border border-slate-200 dark:border-white/10 p-5 rounded-3xl flex flex-col gap-4 shadow-lg">
                                        <div className="flex items-center gap-2">
                                            <div className={`p-2 ${bg} rounded-xl ${color}`}><Icon className="w-5 h-5" /></div>
                                            <div><h3 className="text-sm font-bold text-slate-800 dark:text-white">{title}</h3><span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-500">{sub}</span></div>
                                        </div>
                                        <hr className="border-slate-100 dark:border-white/5" />
                                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium flex-1">{body}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Soil / Fertilizer / Irrigation */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { icon: Beaker, color: 'text-blue-400', bg: 'bg-blue-500/10', title: 'Soil Intelligence', sub: 'Structure & Conditioning', body: txResult.soilRecommendations },
                                    { icon: Tractor, color: 'text-purple-400', bg: 'bg-purple-500/10', title: 'Fertilizer Guidance', sub: 'Mineral & NPK Balance', body: txResult.fertilizerSuggestions, extra: `Active dosage: ${txResult.dosage} of ${txResult.fertilizer}` },
                                    { icon: Droplets, color: 'text-cyan-400', bg: 'bg-cyan-500/10', title: 'Irrigation Advice', sub: 'Hydration & Spore Control', body: txResult.irrigationAdvice },
                                ].map(({ icon: Icon, color, bg, title, sub, body, extra }) => (
                                    <div key={title} className="bg-slate-50 dark:bg-[#050C16] border border-slate-200 dark:border-white/10 p-5 rounded-3xl flex flex-col gap-4 shadow-lg">
                                        <div className="flex items-center gap-2">
                                            <div className={`p-2 ${bg} rounded-xl ${color}`}><Icon className="w-5 h-5" /></div>
                                            <div><h3 className="text-sm font-bold text-slate-800 dark:text-white">{title}</h3><span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-500">{sub}</span></div>
                                        </div>
                                        <hr className="border-slate-100 dark:border-white/5" />
                                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium flex-1">{body}</p>
                                        {extra && <div className="bg-black/10 dark:bg-black/35 border border-white/5 rounded-xl p-2.5 text-[10px] text-slate-400">{extra}</div>}
                                    </div>
                                ))}
                            </div>

                            {/* Risk + Weather */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-slate-50 dark:bg-[#050C16] border border-slate-200 dark:border-white/10 p-5 rounded-3xl flex flex-col gap-4 shadow-lg">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-rose-500/10 rounded-xl text-rose-400"><AlertTriangle className="w-5 h-5" /></div>
                                        <div><h3 className="text-sm font-bold text-slate-800 dark:text-white">Risk Meter</h3><span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-500">Disease Spread Vector</span></div>
                                    </div>
                                    <hr className="border-slate-100 dark:border-white/5" />
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="space-y-1.5 flex-1">
                                            <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Sporulation Risk</span>
                                            <span className={clsx('text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider inline-block',
                                                txResult.isHighSpreadRisk ? 'bg-red-500/20 border border-red-500/30 text-rose-400' : 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400')}>
                                                {txResult.isHighSpreadRisk ? '⚠️ High Risk' : '✓ Low Risk'}
                                            </span>
                                            <p className="text-[10px] text-slate-400 mt-2">Spore growth accelerates in high-moisture conditions.</p>
                                        </div>
                                        <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                                            <svg className="w-full h-full transform -rotate-90">
                                                <circle cx="40" cy="40" r="32" className="stroke-slate-800" strokeWidth="6" fill="transparent" />
                                                <circle cx="40" cy="40" r="32" className={txResult.isHealthy ? 'stroke-emerald-400' : 'stroke-amber-400'} strokeWidth="6" fill="transparent"
                                                    strokeDasharray={200} strokeDashoffset={200 - (200 * txResult.healthScore) / 100} />
                                            </svg>
                                            <span className="absolute text-sm font-black text-white">{txResult.healthScore}%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 dark:bg-[#050C16] border border-slate-200 dark:border-white/10 p-5 rounded-3xl flex flex-col gap-4 shadow-lg">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-sky-500/10 rounded-xl text-sky-400"><CloudSun className="w-5 h-5" /></div>
                                        <div><h3 className="text-sm font-bold text-slate-800 dark:text-white">Weather Insights</h3><span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-500">Localized Microclimate</span></div>
                                    </div>
                                    <hr className="border-slate-100 dark:border-white/5" />
                                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{txResult.weatherRisks}</p>
                                    {liveWeather && (
                                        <div className="bg-black/10 dark:bg-black/35 border border-white/5 rounded-xl p-2.5 text-[10px] text-slate-400 flex justify-between">
                                            <span>Live weather ({locationLabel}):</span>
                                            <strong className="text-white">{liveWeather.temp}°C · {liveWeather.humidity}% humidity</strong>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Recovery Timeline */}
                            <div className="bg-slate-50 dark:bg-[#050C16] border border-slate-200 dark:border-white/10 p-5 rounded-3xl shadow-lg flex flex-col gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-violet-500/10 rounded-xl text-violet-400"><Compass className="w-5 h-5" /></div>
                                    <div><h3 className="text-sm font-bold text-slate-800 dark:text-white">Recovery Timeline</h3><span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-500">Recovery Milestones Tracker</span></div>
                                </div>
                                <hr className="border-slate-100 dark:border-white/5" />
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {(txResult.recoveryTimeline?.length ? txResult.recoveryTimeline : [
                                        { day: 'Day 1: Intervention', milestone: 'Apply target treatment according to expert dosages.' },
                                        { day: 'Day 3: Arrest',       milestone: 'Lesions halt expansion. Inspect leaf boundaries.' },
                                        { day: 'Day 7: Re-Scan',      milestone: 'Execute secondary scan. Confirm foliar regeneration.' },
                                    ]).map((item, idx) => (
                                        <div key={idx} className="relative pl-6 border-l border-white/10">
                                            <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(20,184,166,0.8)]" />
                                            <h4 className="text-[10px] font-extrabold text-teal-400 uppercase tracking-widest">{item.day}</h4>
                                            <p className="text-[11px] text-slate-300 font-bold leading-normal mt-1">{item.milestone}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Expert note footer */}
                            <div className="bg-slate-50 dark:bg-[#050C16] border border-slate-200 dark:border-white/10 p-5 md:p-6 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-20 sm:mb-6">
                                <div className="flex gap-4 items-start flex-1">
                                    <div className="p-3 bg-slate-100 dark:bg-[#0A1628] rounded-2xl border border-white/5 text-teal-400 shrink-0">
                                        <Activity className="w-5 h-5 animate-pulse" />
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Expert Agronomist Note</h4>
                                        <p className="text-sm font-semibold leading-relaxed text-slate-800 dark:text-white italic">"{txResult.instructions}"</p>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row items-stretch gap-2 w-full md:w-auto">
                                    <button type="button" onClick={() => isSpeaking ? stopSpeaking() : speakAdvice(`${txResult.diseaseName}. ${txResult.instructions}`)}
                                        className={clsx('py-2.5 px-4 rounded-xl text-[10px] uppercase font-bold tracking-widest flex items-center justify-center gap-2 border transition-all',
                                            isSpeaking ? 'bg-rose-500 border-rose-400 text-white animate-pulse' : 'bg-slate-100 dark:bg-[#0A1628]/60 border-white/10 text-slate-300 hover:bg-slate-800/40')}>
                                        {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}{isSpeaking ? 'Pause' : 'Listen'}
                                    </button>
                                    <button type="button" onClick={resetForm}
                                        className="py-2.5 px-4 rounded-xl text-[10px] uppercase font-bold tracking-widest bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all flex items-center gap-2 justify-center">
                                        <RefreshCw className="w-4 h-4" /><span>Scan Another</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                    ) : (
                        /* Idle state */
                        <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="flex-1 flex flex-col items-center justify-center gap-6 bg-white/60 dark:bg-slate-900/20 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-3xl p-8 relative overflow-hidden">
                            <div className="absolute -top-32 -right-32 w-80 h-80 bg-teal-500/5 rounded-full blur-[80px] pointer-events-none" />
                            <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />

                            {/* Live weather strip */}
                            {liveWeather && (
                                <div className="flex items-center gap-3 bg-slate-50 dark:bg-[#050C16] border border-white/10 rounded-2xl px-4 py-2.5 text-xs">
                                    <CloudSun className="w-4 h-4 text-sky-400 shrink-0" />
                                    <span className="text-slate-600 dark:text-slate-300 font-medium">
                                        {liveWeather.temp}°C · {liveWeather.condition} · Humidity {liveWeather.humidity}%
                                        {locationData.village && <span className="text-slate-400 ml-1">({locationData.village})</span>}
                                    </span>
                                    {liveWeather.humidity > 75 && (
                                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">⚠ Disease Risk</span>
                                    )}
                                </div>
                            )}

                            <div className="text-center space-y-3 relative z-10">
                                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-teal-500/20 to-emerald-500/10 border border-teal-500/30 rounded-3xl flex items-center justify-center">
                                    <ScanLine className="w-9 h-9 text-teal-400" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white">AI Plant Doctor</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                                    Select your land location using the Patta/Chitta style dropdowns, fill in your land details, then upload a crop leaf photo.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 w-full max-w-xl relative z-10">
                                {[
                                    { icon: Landmark,    label: 'Select Location',    color: 'text-emerald-400', sub: 'State → Village' },
                                    { icon: FileText,    label: 'Fill Land Profile',  color: 'text-teal-400',    sub: 'Soil · Water · Crop' },
                                    { icon: UploadCloud, label: 'Upload Leaf Photo',  color: 'text-blue-400',    sub: 'or use camera' },
                                    { icon: ShieldCheck, label: 'Get Treatment Plan', color: 'text-violet-400',  sub: 'AI powered' },
                                ].map(({ icon: Icon, label, color, sub }, i) => (
                                    <div key={i} className="bg-slate-50 dark:bg-[#050C16] border border-slate-100 dark:border-white/5 rounded-2xl p-4 flex flex-col items-center gap-2 text-center">
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                            <span className="text-[9px] font-bold text-slate-400">0{i + 1}</span>
                                            <Icon className={clsx('w-4 h-4', color)} />
                                        </div>
                                        <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 leading-tight">{label}</span>
                                        <span className="text-[9px] text-slate-400">{sub}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ImageUploadForm;
