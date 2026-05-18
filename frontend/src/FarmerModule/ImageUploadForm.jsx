import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, Sprout, MapPin, RefreshCw, Camera, X, CloudSun, IndianRupee, ThermometerSun, Mic, Beaker, ChevronDown, ChevronUp, Volume2, VolumeX, Check, Clock, Calendar, ScanLine, Tractor, ArrowRight, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import clsx from 'clsx';
import { Select, MenuItem, FormControl, InputLabel, TextField } from '@mui/material';
import { useLanguage } from '../Context/LanguageContext';
import { useTheme } from '../Context/ThemeContext';
import { toast } from 'react-hot-toast';
import Loader from '../SharedComponents/Loader';
import { useGlobalState } from '../Context/GlobalStateContext';
import { API_BASE_URL } from '../config';

const CROP_DATA = {
    horticulture: ['Banana', 'Cashew', 'Tomato', 'Chilli', 'Brinjal', 'Spinach', 'Coriander', 'Mint', 'Capsicum'],
    field: ['Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Maize', 'Groundnut']
};
// const CROPS = ['Tomato', 'Potato', 'Rice', 'Corn', 'Wheat', 'Grape', 'Cotton', 'Sugarcane', 'Soybean'];
const STATES = ['Maharashtra', 'Punjab', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh', 'Kerala'];

const STATE_DISTRICTS = {
    'Maharashtra': [
        'Ahmednagar', 'Akola', 'Amravati', 'Aurangabad', 'Beed', 'Bhandara', 'Buldhana', 'Chandrapur', 'Dhule', 'Gadchiroli',
        'Gondia', 'Hingoli', 'Jalgaon', 'Jalna', 'Kolhapur', 'Latur', 'Mumbai City', 'Mumbai Suburban', 'Nagpur', 'Nanded',
        'Nandurbar', 'Nashik', 'Osmanabad', 'Palghar', 'Parbhani', 'Pune', 'Raigad', 'Ratnagiri', 'Sangli', 'Satara',
        'Sindhudurg', 'Solapur', 'Thane', 'Wardha', 'Washim', 'Yavatmal'
    ],
    'Punjab': [
        'Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib', 'Fazilka', 'Ferozepur', 'Gurdaspur', 'Hoshiarpur',
        'Jalandhar', 'Kapurthala', 'Ludhiana', 'Mansa', 'Moga', 'Mohali (SAS Nagar)', 'Muktsar', 'Nawanshahr (SBS Nagar)',
        'Pathankot', 'Patiala', 'Ropar (Rupnagar)', 'Sangrur', 'Tarn Taran'
    ],
    'Karnataka': [
        'Bagalkot', 'Bangalore Rural', 'Bangalore Urban', 'Belgaum', 'Bellary', 'Bidar', 'Chamarajanagar', 'Chikkaballapur',
        'Chikkamagaluru', 'Chitradurga', 'Dakshina Kannada', 'Davangere', 'Dharwad', 'Gadag', 'Gulbarga', 'Hassan', 'Haveri',
        'Kodagu', 'Kolar', 'Koppal', 'Mandya', 'Mysore', 'Raichur', 'Ramanagara', 'Shimoga', 'Tumkur', 'Udupi', 'Uttara Kannada',
        'Vijayapura', 'Yadgir'
    ],
    'Tamil Nadu': [
        'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi',
        'Kancheepuram', 'Kanniyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai', 'Nagapattinam', 'Namakkal',
        'Nilgiris', 'Perambalur', 'Pudukkottai', 'Ramanathapuram', 'Ranipet', 'Salem', 'Sivagangai', 'Tenkasi', 'Thanjavur',
        'Theni', 'Thiruvallur', 'Thiruvarur', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli', 'Tirupathur', 'Tiruppur',
        'Tiruvannamalai', 'Vellore', 'Viluppuram', 'Virudhunagar'
    ],
    'Uttar Pradesh': [
        'Agra', 'Aligarh', 'Ambedkar Nagar', 'Amethi', 'Amroha', 'Auraiya', 'Ayodhya', 'Azamgarh', 'Baghpat', 'Bahraich',
        'Ballia', 'Balrampur', 'Banda', 'Barabanki', 'Bareilly', 'Basti', 'Bhadohi', 'Bijnor', 'Budaun', 'Bulandshahr',
        'Chandauli', 'Chitrakoot', 'Deoria', 'Etah', 'Etawah', 'Farrukhabad', 'Fatehpur', 'Firozabad', 'Gautam Buddha Nagar (Noida)',
        'Ghaziabad', 'Ghazipur', 'Gonda', 'Gorakhpur', 'Hamirpur', 'Hapur', 'Hardoi', 'Hathras', 'Jalaun', 'Jaunpur', 'Jhansi',
        'Kannauj', 'Kanpur Dehat', 'Kanpur Nagar', 'Kasganj', 'Kaushambi', 'Kheri', 'Kushinagar', 'Lalitpur', 'Lucknow',
        'Maharajganj', 'Mahoba', 'Mainpuri', 'Mathura', 'Mau', 'Meerut', 'Mirzapur', 'Moradabad', 'Muzaffarnagar', 'Pilibhit',
        'Pratapgarh', 'Prayagraj (Allahabad)', 'Raebareli', 'Rampur', 'Saharanpur', 'Sambhal', 'Sant Kabir Nagar', 'Shahjahanpur',
        'Shamli', 'Shravasti', 'Siddharthnagar', 'Sitapur', 'Sonbhadra', 'Sultanpur', 'Unnao', 'Varanasi'
    ],
    'Kerala': [
        'Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod', 'Kollam', 'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad',
        'Pathanamthitta', 'Thiruvananthapuram', 'Thrissur', 'Wayanad'
    ]
};

const ScanningOverlay = () => (
    <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-3xl">
        {/* Fututistic Laser Scan */}
        <motion.div
            className="w-full h-[3px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_20px_rgba(52,211,153,0.8)] z-30"
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ position: 'absolute' }}
        />

        {/* Tech Grain & Overlay */}
        <div className="absolute inset-0 bg-emerald-500/5 backdrop-blur-[1px] mix-blend-overlay" />

        {/* HUD Corners - Sharp Clinic Style */}
        <div className="absolute top-6 left-6 border-t-2 border-l-2 border-emerald-500/50 w-6 h-6 rounded-tl-sm shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
        <div className="absolute top-6 right-6 border-t-2 border-r-2 border-emerald-500/50 w-6 h-6 rounded-tr-sm shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
        <div className="absolute bottom-6 left-6 border-b-2 border-l-2 border-emerald-500/50 w-6 h-6 rounded-bl-sm shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
        <div className="absolute bottom-6 right-6 border-b-2 border-r-2 border-emerald-500/50 w-6 h-6 rounded-br-sm shadow-[0_0_10px_rgba(16,185,129,0.3)]" />

        {/* Center Diagnostic Badge */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-4"
            >
                <div className="relative">
                    <div className="w-16 h-16 rounded-full border-2 border-emerald-500/20 flex items-center justify-center animate-[spin_4s_linear_infinite]">
                        <div className="w-12 h-12 rounded-full border-2 border-dashed border-emerald-500/40" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
                    </div>
                </div>
                <div className="bg-emerald-500/90 backdrop-blur-md text-white text-[9px] font-bold px-4 py-2 rounded-xl shadow-2xl border border-white/20 tracking-wider uppercase flex items-center gap-2">
                    <ScanLine className="w-3 h-3 animate-pulse" />
                    Analysing Specimen...
                </div>
            </motion.div>
        </div>

        {/* Binary/Data Feed Mockup Overlay */}
        <div className="absolute top-10 left-10 opacity-20 hidden md:block">
            <div className="flex flex-col gap-1">
                {[1, 2, 3].map(i => <div key={i} className="w-12 h-0.5 bg-emerald-500 rounded-full" />)}
            </div>
        </div>
    </div>
);

const ImageUploadForm = () => {
    const { t } = useLanguage();
    const { isDarkMode } = useTheme();
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    // Menu Props for custom styling of dropdowns
    const menuProps = {
        PaperProps: {
            style: {
                maxHeight: 300,
            },
            sx: {
                borderRadius: 3,
                bgcolor: isDarkMode ? '#1e293b' : 'background.paper',
                color: isDarkMode ? '#f1f5f9' : 'text.primary',
                border: isDarkMode ? '1px solid #334155' : 'none',
                '& .MuiMenuItem-root': {
                    '&:hover': {
                        bgcolor: isDarkMode ? '#334155' : 'rgba(0, 0, 0, 0.04)',
                    },
                    '&.Mui-selected': {
                        bgcolor: isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.08)',
                        '&:hover': {
                            bgcolor: isDarkMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.12)',
                        }
                    }
                },
                // Hide Scrollbar
                '&::-webkit-scrollbar': { display: 'none' },
                scrollbarWidth: 'none',
                '-ms-overflow-style': 'none',
            }
        }
    };

    // Camera State
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // Form Inputs
    const [cropType, setCropType] = useState('');
    const [farmingType, setFarmingType] = useState('field'); // 'horticulture' | 'field'
    const [district, setDistrict] = useState('');
    const [state, setState] = useState('');
    const [soilData, setSoilData] = useState({ n: 140, p: 40, k: 50 });
    const [showSoilAdvanced, setShowSoilAdvanced] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isLocating, setIsLocating] = useState(false);

    // Reset crop when farming type changes
    useEffect(() => {
        setCropType('');
    }, [farmingType]);

    // Scroll to results on mobile when analysis is complete
    const resultRef = useRef(null);
    useEffect(() => {
        if (result && resultRef.current && window.innerWidth < 768) {
            // Small delay to ensure rendering
            setTimeout(() => {
                resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);
        }
    }, [result]);

    const fileInputRef = useRef(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        validateAndPreview(file);
    };

    const validateAndPreview = (file) => {
        if (!file) return;

        if (!file.type.match('image.*')) {
            setError('Please select a valid image file (JPG, PNG)');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('File size should be less than 5MB');
            return;
        }

        setError(null);
        setSelectedImage(file);
        setPreviewUrl(URL.createObjectURL(file));
        setResult(null);
        toast.success(t('image_selected') || 'Image selected successfully!');
    };

    // Camera Functions
    const startCamera = async () => {
        setIsCameraOpen(true);
        setError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' } // Prefer back camera on mobile
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Camera Error:", err);
            setError("Could not access camera. Please allow permissions.");
            setIsCameraOpen(false);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setIsCameraOpen(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            // Set canvas size to match video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Draw video frame to canvas
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Convert to Blob/File
            canvas.toBlob((blob) => {
                const file = new File([blob], "captured_image.jpg", { type: "image/jpeg" });
                validateAndPreview(file);
                stopCamera();
            }, 'image/jpeg', 0.95);
        }
    };

    const handleAutoLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        setIsLocating(true);
        const locToast = toast.loading("Detecting your location...");

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                    const data = await res.json();

                    // Map State
                    const detectedState = data.principalSubdivision;
                    const detectedCity = data.city || data.locality;
                    const adminLevels = data.localityInfo?.administrative || [];

                    // Match with our local data
                    const matchedState = STATES.find(s =>
                        detectedState.toLowerCase().includes(s.toLowerCase()) ||
                        s.toLowerCase().includes(detectedState.toLowerCase())
                    );

                    if (matchedState) {
                        setState(matchedState);
                        const districts = STATE_DISTRICTS[matchedState];

                        // 1. Try matching against the main city/locality
                        let matchedDist = districts.find(d =>
                            detectedCity.toLowerCase().includes(d.toLowerCase()) ||
                            d.toLowerCase().includes(detectedCity.toLowerCase())
                        );

                        // 2. If no match, search through all administrative levels (more accurate for Districts)
                        if (!matchedDist) {
                            for (const level of adminLevels) {
                                const found = districts.find(d =>
                                    level.name.toLowerCase().includes(d.toLowerCase()) ||
                                    d.toLowerCase().includes(level.name.toLowerCase())
                                );
                                if (found) {
                                    matchedDist = found;
                                    break;
                                }
                            }
                        }

                        if (matchedDist) {
                            setDistrict(matchedDist);
                            toast.success(`Located: ${matchedDist}, ${matchedState}`, { id: locToast });
                        } else {
                            setDistrict(districts[0]);
                            toast.success(`Located: ${matchedState} (District estimated)`, { id: locToast });
                        }
                    } else {
                        toast.error("Could not match your region to our supported states.", { id: locToast });
                    }
                } catch (err) {
                    toast.error("Failed to resolve location name.", { id: locToast });
                } finally {
                    setIsLocating(false);
                }
            },
            (err) => {
                toast.error("Permission denied or location unavailable.", { id: locToast });
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 5000 }
        );
    };

    // Cleanup camera on unmount
    useEffect(() => {
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }
        };
    }, []);

    const { refreshGlobalData } = useGlobalState();

    const handleAnalyze = async () => {
        if (!selectedImage) return;

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('image', selectedImage);
        formData.append('cropType', cropType);
        formData.append('farmingType', farmingType);
        formData.append('district', district);
        formData.append('state', state);

        const analyzeToast = toast.loading(t('analyzing_toast') || 'Analyzing your crop...');

        try {
            const response = await axios.post(`${API_BASE_URL}/api/farmer/analyze`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Reduced artificial delay for better UX
            setTimeout(() => {
                setResult(response.data);
                setLoading(false);
                toast.success(t('analysis_success') || 'Crop analysis complete!', { id: analyzeToast });
                refreshGlobalData(); // Sync history instantly
            }, 200);

        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data?.details || 'Failed to analyze image. Please try again.';
            toast.error(errorMsg, { id: analyzeToast });
            setLoading(false);
        }
    };

    const resetForm = () => {
        setSelectedImage(null);
        setPreviewUrl(null);
        setResult(null);
        setError(null);
    };

    const [isSpeaking, setIsSpeaking] = useState(false);

    // Text-to-Speech Function
    const speakResult = (text) => {
        if (!window.speechSynthesis) return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-IN'; // Indian English
        utterance.rate = 0.9; // Slightly slower for clarity
        utterance.pitch = 1;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    };

    const stopSpeaking = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    };

    // Cleanup speech on unmount
    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);



    // Voice Command Handler
    const handleVoiceInput = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toast.error("Voice input is not supported in this browser. Try Chrome/Edge.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-IN'; // Optimized for Indian accents/context
        recognition.interimResults = false;
        recognition.continuous = false; // Stop after one command

        recognition.onstart = () => {
            setIsListening(true);
            toast.loading("Listening... Say crop name, state, or district", { id: 'voice-toast' });
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.toLowerCase();
            console.log("Voice Command:", transcript);
            toast.success(`Heard: "${transcript}"`, { id: 'voice-toast' });

            let matched = false;

            // Simple Keyword Matching logic
            // 1. Detect Crop
            // 1. Detect Crop (Search all categories)
            const allCrops = [...CROP_DATA.horticulture, ...CROP_DATA.field];
            const detectedCrop = allCrops.find(crop => transcript.includes(crop.toLowerCase()));
            if (detectedCrop) {
                setCropType(detectedCrop);
                matched = true;
            }

            // 2. Detect State
            const detectedState = STATES.find(s => transcript.includes(s.toLowerCase()));
            if (detectedState) {
                setState(detectedState);
                // Reset/Assign first district of new state
                if (STATE_DISTRICTS[detectedState]) {
                    setDistrict(STATE_DISTRICTS[detectedState][0]);
                }
                matched = true;
            }

            // 3. Detect District (Search across all states if state not found, or in current state)
            const allDistricts = Object.values(STATE_DISTRICTS).flat();
            const detectedDist = allDistricts.find(d => transcript.includes(d.toLowerCase()));
            if (detectedDist) {
                // If we found a district, find its state too
                for (const [s, districts] of Object.entries(STATE_DISTRICTS)) {
                    if (districts.includes(detectedDist)) {
                        setState(s);
                        setDistrict(detectedDist);
                        break;
                    }
                }
                matched = true;
            }

            if (!matched) {
                toast("Could not match any crop or location. Please try again.", { icon: '🤔', id: 'voice-toast' });
            } else {
                toast.success("Details updated from voice!", { id: 'voice-toast' });
            }

            setIsListening(false);
        };

        recognition.onerror = (event) => {
            console.error("Voice Error:", event.error);
            setIsListening(false);

            if (event.error === 'no-speech') {
                toast.error("No speech detected. Please try again.", { id: 'voice-toast' });
            } else if (event.error === 'not-allowed') {
                toast.error("Microphone access denied. Please allow permissions in browser settings.", { id: 'voice-toast' });
            } else if (event.error === 'audio-capture') {
                toast.error("No microphone found. Please check your audio settings.", { id: 'voice-toast' });
            } else {
                toast.error(`Voice Error: ${event.error}`, { id: 'voice-toast' });
            }
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    // Helper to determine status color
    const getStatusColor = (disease, isLowConf) => {
        if (isLowConf) return 'yellow';
        if (disease.toLowerCase().includes('healthy')) return 'green';
        return 'red';
    };

    const getTranslatedResult = () => {
        if (!result) return null;
        const disease = result.diseaseAnalysis?.disease || 'Unknown';
        const diseaseKey = disease.toLowerCase().replace(/ /g, '_');

        const getText = (key, fallback) => {
            const val = t(key);
            return (val && val !== key) ? val : fallback;
        };

        const translatedCrop = t(`crop_${cropType.toLowerCase()}`) || cropType;
        const contextString = district ? `${t('rec_for') || 'For'} ${translatedCrop} ${t('rec_in') || 'in'} ${district}: ` : '';
        const baseInstruction = getText(`rec_${diseaseKey}_inst`, result.recommendation?.instructions || result.recommendation?.farmerNote || '');

        return {
            diseaseName: getText(`disease_${diseaseKey}`, disease.replace(/_/g, ' ')),
            fertilizer: getText(`rec_${diseaseKey}_fert`, result.recommendation?.fertilizer || 'Consult agronomist'),
            dosage: getText(`rec_${diseaseKey}_dose`, result.recommendation?.quantity || 'As advised'),
            instructions: `${contextString}${baseInstruction}`,
            isLowConfidence: (result.diseaseAnalysis?.confidence || 0) < 60,
            confidence: result.diseaseAnalysis?.confidence || 0,
            weather: result.weatherNote || null,
            message: result.recommendation?.farmerNote || null,
            topPredictions: []
        };
    };

    const translatedResult = getTranslatedResult();

    return (
        <div className="w-full max-w-[1800px] mx-auto flex flex-col md:flex-row gap-5 md:gap-8 items-start p-3 md:p-6 pb-20 md:pb-6">

            {/* LEFT COLUMN: INPUT SECTION */}
            <div className={`w-full md:w-[440px] lg:w-[460px] shrink-0 transition-all duration-700 ${translatedResult ? 'opacity-100' : ''}`}>
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 md:p-6 shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-slate-200/70 dark:border-slate-700/70 relative overflow-hidden">

                    {/* Subtle top accent */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-400 rounded-t-2xl" />
                    <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-emerald-400/6 to-transparent rounded-bl-full pointer-events-none" />

                    <div className="relative z-10">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg shadow-emerald-500/25">
                                        <ScanLine className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
                                </div>
                                <div className="flex flex-col">
                                    <h2 className="text-base font-bold text-gray-900 dark:text-white leading-tight tracking-tight">
                                        Diagnostic Input
                                    </h2>
                                    <span className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">Configure Parameters</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleVoiceInput}
                                    className={clsx(
                                        "p-2.5 rounded-xl border transition-all relative overflow-hidden group",
                                        isListening ? "bg-red-500 text-white border-red-400" : "bg-white dark:bg-slate-800 text-gray-400 border-gray-100 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-500 hover:shadow-lg"
                                    )}
                                >
                                    <Mic className={clsx("w-4 h-4", isListening && "animate-pulse")} />
                                    {isListening && <motion.div className="absolute inset-0 bg-white/20" animate={{ x: ['100%', '-100%'] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-5">
                            {/* Crop Category Toggle */}
                            <div className="space-y-2">
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Crop Category</label>
                                <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center relative border border-slate-200/50 dark:border-slate-700/50">
                                    <motion.div
                                        layout
                                        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg shadow-sm transition-all duration-300 ${farmingType === 'horticulture' ? 'left-1 bg-white dark:bg-slate-700' : 'left-[calc(50%+3px)] bg-white dark:bg-slate-700'}`}
                                    />
                                    <button
                                        onClick={() => setFarmingType('horticulture')}
                                        className={`flex-1 relative z-10 py-2.5 rounded-lg text-[13px] font-semibold transition-all duration-200 ${farmingType === 'horticulture' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'}`}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <Sprout className={clsx("w-3.5 h-3.5", farmingType === 'horticulture' ? "text-emerald-500" : "text-slate-300")} />
                                            <span>Horticulture</span>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => setFarmingType('field')}
                                        className={`flex-1 relative z-10 py-2.5 rounded-lg text-[13px] font-semibold transition-all duration-200 ${farmingType === 'field' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'}`}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <Tractor className={clsx("w-3.5 h-3.5", farmingType === 'field' ? "text-blue-500" : "text-slate-300")} />
                                            <span>Field Crops</span>
                                        </div>
                                    </button>
                                </div>
                            </div>


                            {/* Crop Selector Container */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                    {/* Crop Selector */}
                                    <div className="relative group/input">
                                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Target Crop Species</label>
                                        <FormControl fullWidth variant="standard">
                                            <Select
                                                value={cropType}
                                                onChange={(e) => setCropType(e.target.value)}
                                                displayEmpty
                                                disableUnderline
                                                sx={{
                                                    backgroundColor: 'rgba(255,255,255,0.8)',
                                                    backdropFilter: 'blur(12px)',
                                                    borderRadius: '0.75rem',
                                                    padding: { xs: '0.4rem 0.8rem', md: '0.6rem 1rem' },
                                                    border: '1px solid',
                                                    borderColor: '#e2e8f0',
                                                    fontSize: '0.9rem',
                                                    fontWeight: 500,
                                                    color: '#334155',
                                                    transition: 'all 0.2s',
                                                    '.dark &': {
                                                        backgroundColor: 'rgba(30, 41, 59, 0.6)',
                                                        borderColor: '#334155',
                                                        color: '#f1f5f9'
                                                    },
                                                    '&:hover': {
                                                        borderColor: '#10b981',
                                                        backgroundColor: '#fff',
                                                    },
                                                    '&.Mui-focused': {
                                                        borderColor: '#10b981',
                                                        backgroundColor: '#fff',
                                                        boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)'
                                                    },
                                                    '& .MuiSelect-select': {
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.75rem',
                                                        paddingRight: '2.5rem !important'
                                                    }
                                                }}
                                                MenuProps={{
                                                    PaperProps: {
                                                        sx: {
                                                            borderRadius: '1.25rem',
                                                            marginTop: '0.75rem',
                                                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                                                            border: '1px solid rgba(0,0,0,0.05)',
                                                            maxHeight: { xs: 200, md: 350 },
                                                            backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                                            backdropFilter: 'blur(20px)',
                                                            '&::-webkit-scrollbar': { width: '4px' },
                                                            '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: '10px' },
                                                            '.dark &': {
                                                                backgroundColor: 'rgba(15, 23, 42, 0.98)',
                                                                border: '1px solid rgba(255,255,255,0.1)',
                                                                color: '#f1f5f9',
                                                                '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(255,255,255,0.1)' }
                                                            }
                                                        }
                                                    }
                                                }}
                                                renderValue={(selected) => {
                                                    if (!selected) {
                                                        return <span className="text-gray-400 font-medium italic text-sm">Select Crop</span>;
                                                    }
                                                    return (
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                                                            <span className="text-gray-800 dark:text-gray-100">{t(`crop_${selected.toLowerCase()}`) || selected}</span>
                                                        </div>
                                                    );
                                                }}
                                            >
                                                <MenuItem disabled value="">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2">Available Species</span>
                                                </MenuItem>
                                                {CROP_DATA[farmingType].map(c => (
                                                    <MenuItem key={c} value={c} sx={{
                                                        borderRadius: '0.5rem',
                                                        margin: { xs: '0.1rem 0.25rem', md: '0.2rem 0.5rem' },
                                                        fontWeight: 600,
                                                        fontSize: { xs: '0.75rem', md: '0.9rem' },
                                                        minHeight: { xs: 'auto', md: '48px' },
                                                        color: '#1f2937',
                                                        '.dark &': { color: '#f8fafc' },
                                                        '&:hover': { backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' },
                                                        '&.Mui-selected': { backgroundColor: 'rgba(16, 185, 129, 0.15) !important', color: '#10b981' }
                                                    }}>
                                                        {t(`crop_${c.toLowerCase()}`) || c}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </div>

                                    {/* Location Header with Auto-Detect */}
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Cultivation Region</label>
                                        <button
                                            type="button"
                                            onClick={handleAutoLocation}
                                            disabled={isLocating}
                                            className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 px-2.5 py-1 rounded-lg transition-all border border-emerald-200/50 dark:border-emerald-500/20"
                                        >
                                            {isLocating ? (
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                            ) : (
                                                <MapPin className="w-3 h-3" />
                                            )}
                                            {isLocating ? 'Detecting...' : 'Auto-Detect'}
                                        </button>
                                    </div>

                                    {/* Location Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* State Selector */}
                                        <div className="space-y-2">
                                            <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">{t('state')}</label>
                                            <FormControl fullWidth variant="standard">
                                                <Select
                                                    value={state}
                                                    onChange={(e) => {
                                                        const newState = e.target.value;
                                                        setState(newState);
                                                        if (STATE_DISTRICTS[newState] && STATE_DISTRICTS[newState].length > 0) {
                                                            setDistrict(STATE_DISTRICTS[newState][0]);
                                                        } else {
                                                            setDistrict('');
                                                        }
                                                    }}
                                                    displayEmpty
                                                    disableUnderline
                                                    sx={{
                                                        backgroundColor: 'rgba(255,255,255,0.8)',
                                                        backdropFilter: 'blur(12px)',
                                                        borderRadius: '0.75rem',
                                                        padding: { xs: '0.4rem 0.8rem', md: '0.6rem 1rem' },
                                                        border: '1px solid',
                                                        borderColor: '#e2e8f0',
                                                        fontSize: '0.9rem',
                                                        fontWeight: 500,
                                                        color: '#334155',
                                                        transition: 'all 0.2s',
                                                        '.dark &': {
                                                            backgroundColor: 'rgba(30, 41, 59, 0.6)',
                                                            borderColor: '#334155',
                                                            color: '#f1f5f9'
                                                        },
                                                        '&:hover': {
                                                            borderColor: '#10b981',
                                                            backgroundColor: '#fff',
                                                        },
                                                        '&.Mui-focused': {
                                                            borderColor: '#10b981',
                                                            backgroundColor: '#fff',
                                                            boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)'
                                                        },
                                                        '& .MuiSelect-select': {
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.5rem',
                                                        }
                                                    }}
                                                    MenuProps={{
                                                        PaperProps: {
                                                            sx: {
                                                                borderRadius: '1.25rem',
                                                                marginTop: '0.5rem',
                                                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                                                                border: '1px solid rgba(0,0,0,0.05)',
                                                                maxHeight: { xs: 200, md: 300 },
                                                                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                                                backdropFilter: 'blur(20px)',
                                                                '.dark &': {
                                                                    backgroundColor: 'rgba(15, 23, 42, 0.98)',
                                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                                    color: '#f1f5f9'
                                                                }
                                                            }
                                                        }
                                                    }}
                                                    renderValue={(selected) => selected ? <span className="truncate">{selected}</span> : <span className="text-gray-400 font-medium italic text-sm">Select State</span>}
                                                >
                                                    <MenuItem disabled value="">
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2">Available States</span>
                                                    </MenuItem>
                                                    {STATES.map(s => {
                                                        let key = `state_${s.toLowerCase().replace(/ /g, '_')}`;
                                                        if (s === "Tamil Nadu") key = "state_tn";
                                                        if (s === "Uttar Pradesh") key = "state_up";
                                                        if (s === "Maharashtra") key = "state_mh";
                                                        if (s === "Punjab") key = "state_pb";
                                                        if (s === "Karnataka") key = "state_ka";
                                                        if (s === "Kerala") key = "state_kl";
                                                        return (
                                                            <MenuItem key={s} value={s} sx={{
                                                                borderRadius: '0.75rem',
                                                                margin: { xs: '0.1rem 0.25rem', md: '0.2rem 0.5rem' },
                                                                fontWeight: 600,
                                                                fontSize: { xs: '0.75rem', md: '0.85rem' },
                                                                minHeight: { xs: 'auto', md: '48px' },
                                                                color: '#1f2937',
                                                                '.dark &': { color: '#f8fafc' },
                                                                '&:hover': { backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' },
                                                                '&.Mui-selected': { backgroundColor: 'rgba(16, 185, 129, 0.15) !important', color: '#10b981' }
                                                            }}>
                                                                {t(key) || s}
                                                            </MenuItem>
                                                        );
                                                    })}
                                                </Select>
                                            </FormControl>
                                        </div>

                                        {/* District Selector */}
                                        <div className="space-y-2">
                                            <label className="block text-[13px] font-medium text-slate-500 dark:text-slate-400 pl-1">{t('district')}</label>
                                            <FormControl fullWidth variant="standard">
                                                <Select
                                                    value={district}
                                                    onChange={(e) => setDistrict(e.target.value)}
                                                    displayEmpty
                                                    disableUnderline
                                                    sx={{
                                                        backgroundColor: 'rgba(255,255,255,0.8)',
                                                        backdropFilter: 'blur(12px)',
                                                        borderRadius: '0.75rem',
                                                        padding: { xs: '0.4rem 0.8rem', md: '0.6rem 1rem' },
                                                        border: '1px solid',
                                                        borderColor: '#e2e8f0',
                                                        fontSize: '0.9rem',
                                                        fontWeight: 500,
                                                        color: '#334155',
                                                        transition: 'all 0.2s',
                                                        '.dark &': {
                                                            backgroundColor: 'rgba(30, 41, 59, 0.6)',
                                                            borderColor: '#334155',
                                                            color: '#f1f5f9'
                                                        },
                                                        '&:hover': {
                                                            borderColor: '#10b981',
                                                            backgroundColor: '#fff',
                                                        },
                                                        '&.Mui-focused': {
                                                            borderColor: '#10b981',
                                                            backgroundColor: '#fff',
                                                            boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)'
                                                        },
                                                        '& .MuiSelect-select': {
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.5rem',
                                                        }
                                                    }}
                                                    MenuProps={{
                                                        PaperProps: {
                                                            sx: {
                                                                borderRadius: '1.25rem',
                                                                marginTop: '0.5rem',
                                                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                                                                border: '1px solid rgba(0,0,0,0.05)',
                                                                maxHeight: { xs: 200, md: 300 },
                                                                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                                                backdropFilter: 'blur(20px)',
                                                                '.dark &': {
                                                                    backgroundColor: 'rgba(15, 23, 42, 0.98)',
                                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                                    color: '#f1f5f9'
                                                                }
                                                            }
                                                        }
                                                    }}
                                                    renderValue={(selected) => selected ? <span className="truncate">{selected}</span> : <span className="text-gray-400 font-medium italic text-sm">Select District</span>}
                                                >
                                                    <MenuItem disabled value="">
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2">Available Districts</span>
                                                    </MenuItem>
                                                    {(STATE_DISTRICTS[state] || []).map((d) => (
                                                        <MenuItem key={d} value={d} sx={{
                                                            borderRadius: '0.75rem',
                                                            margin: { xs: '0.1rem 0.25rem', md: '0.25rem 0.5rem' },
                                                            fontWeight: 600,
                                                            fontSize: { xs: '0.75rem', md: '0.9rem' },
                                                            minHeight: { xs: 'auto', md: '48px' },
                                                            color: '#1f2937',
                                                            '.dark &': { color: '#f8fafc' },
                                                            '&:hover': { backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' },
                                                            '&.Mui-selected': { backgroundColor: 'rgba(16, 185, 129, 0.15) !important', color: '#10b981' }
                                                        }}>
                                                            {t(`dist_${d.toLowerCase().replace(/ /g, '_').replace(/[()]/g, '')}`) || d}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </div>
                                    </div>

                                    {/* Soil Health: Advanced Toggle & Grid */}
                                    <div className="space-y-3">
                                        <button
                                            onClick={() => setShowSoilAdvanced(!showSoilAdvanced)}
                                            className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/70 dark:border-slate-700/60 hover:border-emerald-400/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all duration-200 group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500 transition-colors duration-200">
                                                    <Beaker className="w-4 h-4 text-emerald-500 group-hover:text-white" />
                                                </div>
                                                <div className="flex flex-col text-left">
                                                    <span className="text-[13px] font-semibold text-gray-800 dark:text-white leading-none">Soil Health Data</span>
                                                    <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{showSoilAdvanced ? 'Collapse metrics' : 'Expand nutrient analysis'}</span>
                                                </div>
                                            </div>
                                            {showSoilAdvanced ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                        </button>

                                        <AnimatePresence>
                                            {showSoilAdvanced && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="grid grid-cols-3 gap-4 pb-2">
                                                        {[
                                                            { key: 'n', sym: 'N', label: 'Nitrogen', max: 300, unit: 'kg/ha' },
                                                            { key: 'p', sym: 'P', label: 'Phospho', max: 150, unit: 'kg/ha' },
                                                            { key: 'k', sym: 'K', label: 'Potass', max: 150, unit: 'kg/ha' }
                                                        ].map((item) => {
                                                            const percentage = (soilData[item.key] / item.max) * 100;
                                                            const intensityColor = percentage < 33 ? 'orange' : percentage < 66 ? 'amber' : 'emerald';

                                                            return (
                                                                <div key={item.key} className="relative group/npk bg-white dark:bg-slate-900/40 p-3 md:p-4 rounded-3xl border border-gray-100 dark:border-slate-800 hover:border-emerald-500/30 transition-all shadow-sm hover:shadow-2xl hover:shadow-emerald-500/5">
                                                                    <div className="flex flex-col gap-3">
                                                                        <div className="flex justify-between items-start">
                                                                            <div className={`w-9 h-9 rounded-2xl bg-${intensityColor}-500/10 dark:bg-${intensityColor}-500/20 flex items-center justify-center border border-${intensityColor}-500/20 shadow-inner transition-colors duration-500`}>
                                                                                <span className={`text-[12px] font-bold text-${intensityColor}-600 dark:text-${intensityColor}-400`}>{item.sym}</span>
                                                                            </div>
                                                                            <div className="text-right">
                                                                                <motion.span
                                                                                    key={soilData[item.key]}
                                                                                    initial={{ opacity: 0, y: -5 }}
                                                                                    animate={{ opacity: 1, y: 0 }}
                                                                                    className="text-lg font-bold text-gray-900 dark:text-white block leading-none tracking-tighter"
                                                                                >
                                                                                    {soilData[item.key]}
                                                                                </motion.span>
                                                                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{item.unit}</span>
                                                                            </div>
                                                                        </div>

                                                                        <div className="space-y-2.5">
                                                                            <div className="flex justify-between items-center text-[8px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                                                                                <span>{item.label}</span>
                                                                                <span className="opacity-0 group-hover/npk:opacity-100 transition-opacity">Trace Active</span>
                                                                            </div>
                                                                            <div className="h-2 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden relative shadow-inner">
                                                                                <motion.div
                                                                                    className={`absolute inset-y-0 left-0 bg-gradient-to-r from-${intensityColor}-400 to-${intensityColor}-600 z-10`}
                                                                                    initial={{ width: 0 }}
                                                                                    animate={{ width: `${percentage}%` }}
                                                                                    transition={{ type: "spring", stiffness: 80, damping: 15 }}
                                                                                />
                                                                                <motion.div
                                                                                    className="absolute inset-y-0 w-8 bg-white/40 blur-sm z-20"
                                                                                    animate={{ left: ['-10%', '110%'] }}
                                                                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <input
                                                                        type="range"
                                                                        min="0"
                                                                        max={item.max}
                                                                        value={soilData[item.key]}
                                                                        onChange={(e) => setSoilData({ ...soilData, [item.key]: parseInt(e.target.value) })}
                                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
                                                                    />
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Upload & Analysis Suite */}
                                    <div className="mt-5 space-y-4">
                                        <div className="relative group/diagnostic">
                                            {!isCameraOpen ? (
                                                <div
                                                    onClick={() => !result && fileInputRef.current.click()}
                                                    className={clsx(
                                                        "relative rounded-2xl border-2 border-dashed h-[180px] flex flex-col items-center justify-center overflow-hidden transition-all duration-300",
                                                        result ? "border-transparent bg-emerald-50/10" : "cursor-pointer",
                                                        previewUrl
                                                            ? "border-emerald-400 bg-emerald-50/20 dark:border-emerald-500/40 dark:bg-emerald-950/10"
                                                            : "border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-800/40 hover:border-emerald-400 hover:bg-emerald-50/40 dark:hover:border-emerald-500/50 dark:hover:bg-emerald-950/20 hover:shadow-lg hover:shadow-emerald-500/5",
                                                    )}
                                                >
                                                    <input
                                                        type="file"
                                                        ref={fileInputRef}
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={handleImageChange}
                                                        disabled={!!result}
                                                    />

                                                    <AnimatePresence mode='wait'>
                                                        {previewUrl ? (
                                                            <motion.div
                                                                key="preview"
                                                                initial={{ opacity: 0, scale: 0.95 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                className="relative w-full h-full p-2"
                                                            >
                                                                <img
                                                                    src={previewUrl}
                                                                    alt="Sample"
                                                                    className="w-full h-full object-cover rounded-xl shadow-sm"
                                                                />
                                                                {loading && <ScanningOverlay />}
                                                                {!result && !loading && (
                                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/diagnostic:opacity-100 flex items-center justify-center transition-opacity rounded-xl m-2 backdrop-blur-[2px]">
                                                                        <p className="text-white font-semibold text-xs flex items-center gap-2 bg-emerald-500/90 px-4 py-2 rounded-full shadow-lg">
                                                                            <UploadCloud className="w-3.5 h-3.5" /> Change Image
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </motion.div>
                                                        ) : (
                                                            <motion.div
                                                                key="placeholder"
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                className="text-center flex flex-col items-center gap-3 px-6"
                                                            >
                                                                <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-md border border-slate-100 dark:border-slate-700 group-hover/diagnostic:scale-110 group-hover/diagnostic:bg-emerald-500 transition-all duration-500">
                                                                    <UploadCloud className="w-6 h-6 text-emerald-500 group-hover/diagnostic:text-white transition-colors duration-300" />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <p className="text-sm font-semibold text-gray-700 dark:text-slate-200">Upload Leaf Image</p>
                                                                    <p className="text-xs text-slate-400 dark:text-slate-500">Drag & drop or click to browse</p>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>

                                                    {!result && !isCameraOpen && !previewUrl && (
                                                        <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); startCamera(); }}
                                                                className="pointer-events-auto flex items-center gap-1.5 px-4 py-1.5 bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 rounded-full text-slate-500 dark:text-slate-400 font-semibold text-xs hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all duration-200"
                                                            >
                                                                <Camera className="w-3.5 h-3.5" /> Use Camera
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="relative bg-black rounded-xl h-40 overflow-hidden flex items-center justify-center shadow-inner group">
                                                    <video
                                                        ref={videoRef}
                                                        autoPlay
                                                        playsInline
                                                        className="w-full h-full object-cover opacity-80"
                                                    />
                                                    <canvas ref={canvasRef} className="hidden" />

                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); stopCamera(); }}
                                                        className="absolute top-3 right-3 p-1.5 bg-black/50 text-white rounded-full hover:bg-red-500 backdrop-blur-md transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); capturePhoto(); }}
                                                        className="absolute bottom-4 left-1/2 -translate-x-1/2 w-11 h-11 bg-white/20 rounded-full border-2 border-white flex items-center justify-center hover:scale-110 transition-all backdrop-blur-sm"
                                                    >
                                                        <div className="w-8 h-8 bg-white rounded-full shadow-lg" />
                                                    </button>

                                                    {/* Camera Scanner Line */}
                                                    <motion.div
                                                        className="absolute left-0 right-0 h-0.5 bg-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.8)] z-10"
                                                        animate={{ top: ['0%', '100%'] }}
                                                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {!result && !isCameraOpen && (
                                            <button
                                                onClick={handleAnalyze}
                                                disabled={!selectedImage || !cropType || !state || !district || loading}
                                                className={clsx(
                                                    "w-full py-3.5 rounded-xl font-semibold text-[14px] flex items-center justify-center gap-2.5 transition-all duration-300 group relative overflow-hidden",
                                                    (!selectedImage || !cropType || !state || !district)
                                                        ? "bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-600"
                                                        : loading
                                                            ? "bg-emerald-500 text-white cursor-wait"
                                                            : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/25 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]"
                                                )}
                                            >
                                                {loading ? (
                                                    <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
                                                ) : (
                                                    <>
                                                        <Sprout className={clsx("w-4 h-4", (!selectedImage || !cropType || !state || !district) ? "opacity-40" : "opacity-100")} />
                                                        <span>Analyze Disease</span>
                                                        {(!selectedImage || !cropType || !state || !district) ? null : (
                                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                        )}
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* IMAGE PREVIEW CARD (Visible after result) */}
                            {result && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="mt-6 flex flex-col gap-6"
                                >
                                    <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-xl border-4 border-white dark:border-slate-700 aspect-[4/3]">
                                        <img
                                            src={previewUrl}
                                            alt="Analyzed Crop"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    <button
                                        onClick={resetForm}
                                        className="w-full py-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-gray-100 dark:border-slate-700 rounded-2xl font-bold text-gray-600 dark:text-gray-300 flex items-center justify-center gap-2 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm"
                                    >
                                        <RefreshCw className="w-5 h-5" />
                                        {t('analyze_another') || "Analyze Another Crop"}
                                    </button>
                                </motion.div>
                            )}


                            {/* Global Loader Wrapper */}
                            <AnimatePresence>
                                {loading && <Loader message={t('analyzing') || "Analyzing Crop..."} />}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: RESULT SECTION */}
            <div ref={resultRef} className="flex-1 w-full min-w-0 scroll-mt-28">
                <AnimatePresence mode='wait'>
                    {translatedResult ? (
                        <div className="flex flex-col gap-6 w-full mx-auto">
                            {/* TOP: Detection Card (Dynamic Condition Identity) */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={clsx(
                                    "w-full mx-auto rounded-2xl md:rounded-2xl p-5 md:p-7 shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6 border border-white/20",
                                    translatedResult.isLowConfidence
                                        ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-500/20"
                                        : translatedResult.diseaseName.toLowerCase().includes('healthy')
                                            ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/20"
                                            : "bg-gradient-to-br from-rose-500 to-red-700 text-white shadow-red-500/20"
                                )}
                            >
                                {/* Pattern Overlay */}
                                <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.3)_1px,transparent_0)] bg-[size:24px_24px]" />

                                <div className="relative z-10 flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <div className="px-3 py-0.5 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                                            <p className="text-[9px] font-bold tracking-wide text-white">
                                                {translatedResult.isLowConfidence ? "Preliminary Diagnostic" : "Confirmed Analysis"}
                                            </p>
                                        </div>
                                        {translatedResult.isLowConfidence && (
                                            <span className="px-3 py-0.5 bg-white text-amber-600 text-[8px] font-bold rounded-full uppercase tracking-tighter flex items-center gap-1 shadow-lg">
                                                <AlertCircle className="w-2.5 h-2.5" /> Manual Verification Advised
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-xl sm:text-3xl md:text-5xl font-bold leading-tight tracking-tighter drop-shadow-md">
                                        {translatedResult.diseaseName}
                                    </h3>
                                </div>
                                <div className="text-center md:text-right relative z-10 shrink-0 bg-white/10 backdrop-blur-xl p-4 md:p-5 rounded-xl border border-white/20 min-w-[140px] md:min-w-[160px]">
                                    <div className="text-3xl md:text-6xl font-bold leading-none mb-1 tracking-tighter">
                                        {Number(translatedResult.confidence || 0).toFixed(2)}<span className="text-lg md:text-xl ml-0.5 opacity-60">%</span>
                                    </div>
                                    <p className="text-[8px] md:text-[9px] font-bold tracking-wider uppercase opacity-80">Confidence Index</p>
                                </div>
                                {/* Decorative Orbs */}
                                <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-white/20 rounded-full blur-3xl" />
                                <div className="absolute -right-10 -top-10 w-48 h-48 bg-black/10 rounded-full blur-3xl" />
                            </motion.div>

                            {/* BOTTOM: Smart Recommendation Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white dark:bg-slate-900/80 backdrop-blur-2xl rounded-2xl md:rounded-2xl p-4 md:p-10 shadow-2xl border border-gray-100 dark:border-white/5 relative overflow-hidden"
                            >
                                {/* Subtle Background Glass Pattern */}
                                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] -mr-48 -mt-48" />

                                {/* NEW: Systematic Feedback Box */}
                                {translatedResult.message && translatedResult.message !== 'Success' && (
                                    <div className={clsx(
                                        "mb-6 md:mb-10 p-4 md:p-6 rounded-2xl md:rounded-3xl border-2 flex gap-4 md:gap-5 items-center backdrop-blur-md shadow-inner",
                                        translatedResult.isLowConfidence
                                            ? "bg-amber-500/10 border-amber-500/20 text-amber-900 dark:text-amber-100"
                                            : "bg-emerald-500/10 border-emerald-500/20 text-emerald-900 dark:text-emerald-100"
                                    )}>
                                        <div className={clsx("p-3 rounded-2xl", translatedResult.isLowConfidence ? "bg-amber-500 text-white" : "bg-emerald-500 text-white")}>
                                            <AlertCircle className="w-6 h-6 shrink-0" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-[10px] font-bold tracking-wider uppercase opacity-60">Sequence Diagnostic Note</h4>
                                            <p className="text-base font-bold leading-relaxed">{translatedResult.message}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 md:mb-12 gap-4 md:gap-6 relative z-10">
                                    <div className="flex items-center gap-4 md:gap-5">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-emerald-500 rounded-3xl blur-lg opacity-20 animate-pulse" />
                                            <div className="p-3 md:p-4 bg-emerald-500 text-white rounded-2xl md:rounded-3xl relative z-10 shadow-xl shadow-emerald-500/20">
                                                <Sprout className="w-6 h-6 md:w-8 md:h-8" />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight leading-none mb-1">Cure Protocol</h3>
                                            <p className="text-[12px] font-medium text-slate-400">Precision Recommendation AI</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => isSpeaking ? stopSpeaking() : speakResult(`${translatedResult.diseaseName}. ${translatedResult.instructions}`)}
                                        className={clsx(
                                            "group flex items-center gap-3 px-5 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-bold text-[10px] md:text-[11px] uppercase tracking-widest transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98]",
                                            isSpeaking
                                                ? "bg-rose-500 text-white shadow-rose-500/25 animate-pulse"
                                                : "bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 hover:shadow-emerald-500/10"
                                        )}
                                    >
                                        <div className={clsx("p-1.5 rounded-lg", isSpeaking ? "bg-white/20" : "bg-emerald-500")}>
                                            {isSpeaking ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
                                        </div>
                                        {isSpeaking ? "Speaking" : "Listen"}
                                    </button>
                                </div>

                                {/* NEW: Top Predictions Breakdown (If low confidence) */}
                                {translatedResult.isLowConfidence && translatedResult.topPredictions && (
                                    <div className="mb-8 md:mb-12 p-5 md:p-8 bg-gray-50/50 dark:bg-white/5 rounded-3xl md:rounded-2xl border border-gray-100 dark:border-white/10 shadow-inner">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 tracking-wider uppercase">Genetic Possibility Matrix</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {translatedResult.topPredictions.slice(0, 3).map((pred, idx) => (
                                                <div key={idx} className="space-y-3 p-5 bg-white dark:bg-slate-900/50 rounded-2xl border border-gray-200/50 dark:border-white/5 shadow-sm">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[12px] font-bold text-gray-900 dark:text-white uppercase tracking-tight truncate pr-2">{pred.disease.replace(/_/g, ' ')}</span>
                                                        <span className="text-[12px] font-bold text-amber-500">{pred.confidence}%</span>
                                                    </div>
                                                    <div className="h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${pred.confidence}%` }}
                                                            className={clsx(
                                                                "h-full rounded-full transition-all duration-1000",
                                                                idx === 0 ? "bg-amber-500" : "bg-gray-400"
                                                            )}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-8 md:mb-12">
                                    <div className="relative group overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent dark:from-emerald-500/10 pointer-events-none" />
                                        <div className="relative p-5 md:p-8 bg-white dark:bg-slate-800 border-2 border-emerald-500/20 dark:border-emerald-500/30 rounded-2xl md:rounded-2xl shadow-xl group-hover:border-emerald-500/50 transition-colors">
                                            <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4">
                                                <Beaker className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" />
                                            </div>
                                            <p className="text-[9px] md:text-[10px] font-bold text-emerald-600/60 dark:text-emerald-400/60 tracking-wider uppercase mb-2 font-bold">Treatment Sequence</p>
                                            <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                                                {translatedResult.fertilizer}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="relative group overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent dark:from-blue-500/10 pointer-events-none" />
                                        <div className="relative p-5 md:p-8 bg-white dark:bg-slate-800 border-2 border-blue-500/20 dark:border-blue-500/30 rounded-2xl md:rounded-2xl shadow-xl group-hover:border-blue-500/50 transition-colors">
                                            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4">
                                                <Tractor className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
                                            </div>
                                            <p className="text-[9px] md:text-[10px] font-bold text-blue-600/60 dark:text-blue-400/60 tracking-wider uppercase mb-2 font-bold">Volume Metric</p>
                                            <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                                                {translatedResult.dosage}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* TREATMENT ROADMAP */}
                                <div className="relative">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-purple-500/10 rounded-xl">
                                                <ScanLine className="w-5 h-5 text-purple-500" />
                                            </div>
                                            <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">Biological Recovery Timeline</span>
                                        </div>
                                        <div className="h-[1px] flex-1 mx-6 bg-gradient-to-r from-gray-100 to-transparent dark:from-white/10" />
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 relative">
                                        {[
                                            { day: 'Day 1', label: 'PHASE 01: INITIAL INTERVENTION', color: 'emerald', text: translatedResult.fertilizer + ' application precisely at ' + translatedResult.dosage, desc: 'Stabilize leaf tissue and neutralize pathogens.' },
                                            { day: 'Day 3', label: 'PHASE 02: RECOVERY MONITORING', color: 'blue', text: 'Monitor for yellowing or systemic spread. Verify hydration.', desc: 'Check if new growth shows signs of health.' },
                                            { day: 'Day 7', label: 'PHASE 03: DIAGNOSTIC RE-SCAN', color: 'purple', text: 'Initiate a secondary scan to verify recovery vector.', desc: 'Final validation before clearing the crop.' }
                                        ].map((step, idx) => (
                                            <motion.div
                                                key={idx}
                                                whileHover={{ x: 10 }}
                                                className="relative group bg-gray-50/50 dark:bg-white/5 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 dark:border-white/5 flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center hover:bg-white dark:hover:bg-white/10 transition-all shadow-sm group"
                                            >
                                                <div className={clsx(
                                                    "shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-2xl flex flex-col items-center justify-center shadow-lg",
                                                    idx === 0 ? "bg-emerald-500 text-white shadow-emerald-500/20" : idx === 1 ? "bg-blue-500 text-white shadow-blue-500/20" : "bg-purple-500 text-white shadow-purple-500/20"
                                                )}>
                                                    <span className="text-[10px] md:text-xs font-bold tracking-tighter uppercase">{step.day.split(' ')[0]}</span>
                                                    <span className="text-lg md:text-xl font-bold leading-none">{step.day.split(' ')[1]}</span>
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-center gap-3">
                                                        <span className={clsx(
                                                            "text-[9px] md:text-[10px] font-bold tracking-widest",
                                                            idx === 0 ? "text-emerald-600" : idx === 1 ? "text-blue-600" : "text-purple-600"
                                                        )}>{step.label}</span>
                                                        <div className="h-1 flex-1 bg-gray-100 dark:bg-slate-800 rounded-full" />
                                                    </div>
                                                    <p className="text-xs md:text-sm font-bold text-gray-900 dark:text-white leading-tight">{step.text}</p>
                                                    <p className="text-[10px] md:text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase italic">{step.desc}</p>
                                                </div>
                                                <div className="hidden md:block opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className={clsx(
                                                        "p-2 rounded-xl bg-white dark:bg-slate-800 shadow-xl",
                                                        idx === 0 ? "text-emerald-500" : idx === 1 ? "text-blue-500" : "text-purple-500"
                                                    )}>
                                                        <Check className="w-5 h-5" />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-6 md:mt-12 p-5 md:p-8 bg-emerald-500 text-white rounded-2xl md:rounded-2xl shadow-2xl shadow-emerald-500/20 relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[size:250%_250%] animate-[shimmer_3s_infinite_linear]" />
                                    <div className="relative z-10 flex gap-4 items-start">
                                        <div className="p-2 bg-white/20 rounded-xl">
                                            <Activity className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-[10px] md:text-[11px] font-bold tracking-wider uppercase opacity-80 mb-2">Expert Clinical Commentary</h4>
                                            <p className="text-base md:text-lg font-bold leading-snug italic">"{translatedResult.instructions}"</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Mobile Only: Quick Reset Action */}
                                <div className="md:hidden mt-6">
                                    <button
                                        onClick={() => {
                                            resetForm();
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="w-full py-4 bg-white dark:bg-slate-800 rounded-2xl font-bold text-gray-600 dark:text-gray-300 flex items-center justify-center gap-2 shadow-lg border border-gray-100 dark:border-slate-700 active:scale-95 transition-all"
                                    >
                                        <RefreshCw className="w-5 h-5" />
                                        {t('analyze_another') || "Analyze Another Crop"}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    ) : (
                        // Empty State / Placeholder with Features
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="h-full w-full mx-auto bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-200/70 dark:border-slate-700/70 shadow-[0_2px_20px_rgba(0,0,0,0.05)] relative overflow-hidden"
                        >
                            {/* Subtle top gradient accent */}
                            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-400 rounded-t-2xl" />
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-400/5 rounded-full blur-3xl pointer-events-none" />
                            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-400/5 rounded-full blur-3xl pointer-events-none" />

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex items-center justify-between mb-7">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                        <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-xl shadow-lg shadow-emerald-500/25">
                                            <ThermometerSun className="w-5 h-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="leading-tight">{t('insight_title')}</span>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                                                <span className="text-[11px] font-semibold text-emerald-500">Live System Active</span>
                                            </div>
                                        </div>
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5 mb-6">
                                    {/* WEATHER WIDGET */}
                                    <motion.div
                                        whileHover={{ y: -3, boxShadow: '0 12px 24px -8px rgba(59,130,246,0.15)' }}
                                        className="relative bg-white dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm overflow-hidden transition-all duration-200"
                                    >
                                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-sky-400 rounded-t-2xl" />
                                        <div className="flex justify-between items-start mb-5">
                                            <div>
                                                <p className="text-xs font-semibold text-blue-500 tracking-wide uppercase mb-1">{t('weather')}</p>
                                                <h4 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">28°C</h4>
                                            </div>
                                            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                                                <CloudSun className="w-7 h-7 text-blue-500" />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 mb-5">
                                            <div className="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Spray Optimal</span>
                                            </div>
                                            <span className="text-xs font-medium text-slate-400">Partly Cloudy</span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                                            <div className="flex items-center gap-2.5">
                                                <div className="p-1.5 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                                    <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Humidity</p>
                                                    <p className="text-sm font-bold text-gray-700 dark:text-slate-200">64%</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2.5">
                                                <div className="p-1.5 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                                    <CloudSun className="w-3.5 h-3.5 text-orange-400" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Wind</p>
                                                    <p className="text-sm font-bold text-gray-700 dark:text-slate-200">12 km/h</p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* MARKET WIDGET */}
                                    <motion.div
                                        whileHover={{ y: -3, boxShadow: '0 12px 24px -8px rgba(16,185,129,0.15)' }}
                                        className="relative bg-white dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm overflow-hidden transition-all duration-200"
                                    >
                                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-t-2xl" />
                                        <div className="flex justify-between items-start mb-5">
                                            <div>
                                                <p className="text-xs font-semibold text-emerald-500 tracking-wide uppercase mb-1">Market Price</p>
                                                <h4 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">₹2,450</h4>
                                            </div>
                                            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl">
                                                <IndianRupee className="w-7 h-7 text-emerald-500" />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 mb-5">
                                            <div className="flex items-center gap-1.5 bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-[11px] font-semibold shadow-sm">
                                                <span>▲</span> +4.2%
                                            </div>
                                            <span className="text-xs font-medium text-slate-400">{t('insight_per_quintal')}</span>
                                        </div>

                                        {/* Sparkline */}
                                        <div className="absolute bottom-0 left-0 right-0 h-14 opacity-15 pointer-events-none">
                                            <svg className="w-full h-full" preserveAspectRatio="none">
                                                <path
                                                    d="M0 60 Q 50 10, 100 40 T 200 20 T 300 50 T 400 30"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="3"
                                                    className="text-emerald-500"
                                                />
                                            </svg>
                                        </div>
                                    </motion.div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="group/feat flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 hover:bg-white hover:border-emerald-200 dark:hover:bg-slate-800 dark:hover:border-emerald-500/30 hover:shadow-md transition-all duration-200 cursor-default">
                                        <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl group-hover/feat:scale-110 group-hover/feat:bg-emerald-500 transition-all duration-200">
                                            <Camera className="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover/feat:text-white transition-colors" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">Visual ID</h4>
                                            <p className="text-[11px] font-medium text-slate-400">Instant analysis for 15+ crop diseases</p>
                                        </div>
                                    </div>

                                    <div className="group/feat flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 hover:bg-white hover:border-blue-200 dark:hover:bg-slate-800 dark:hover:border-blue-500/30 hover:shadow-md transition-all duration-200 cursor-default">
                                        <div className="p-2.5 bg-blue-100 dark:bg-blue-900/40 rounded-xl group-hover/feat:scale-110 group-hover/feat:bg-blue-500 transition-all duration-200">
                                            <Sprout className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover/feat:text-white transition-colors" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">Remedy Bot</h4>
                                            <p className="text-[11px] font-medium text-slate-400">Curated organic & chemical treatments</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div >
    );
};

export default ImageUploadForm;
