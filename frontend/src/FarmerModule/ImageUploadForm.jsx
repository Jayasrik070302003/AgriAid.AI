import React, { useState, useRef, useEffect } from 'react';
import { 
    UploadCloud, CheckCircle2, AlertCircle, Loader2, Sprout, MapPin, RefreshCw, 
    Camera, X, CloudSun, ThermometerSun, Beaker, ChevronDown, 
    ChevronUp, Volume2, VolumeX, Check, ScanLine, Tractor, ArrowRight, Activity, 
    Lock, Unlock, ShieldCheck, Leaf, Compass, CheckCircle, Search, HelpCircle, AlertTriangle, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../services/apiClient';
import clsx from 'clsx';
import { useLanguage } from '../Context/LanguageContext';
import { useTheme } from '../Context/ThemeContext';
import { toast } from 'react-hot-toast';
import { useGlobalState } from '../Context/GlobalStateContext';

const PIPELINE_STAGES = [
    { id: 1, text: "Acquiring precision GPS boundaries..." },
    { id: 2, text: "Running Stage 1 Botanical Validation..." },
    { id: 3, text: "Identifying plant species & taxonomy..." },
    { id: 4, text: "Connecting Groq vision neural engines..." },
    { id: 5, text: "Invoking Gemini treatment matrices..." }
];

const ImageUploadForm = () => {
    const { t, language } = useLanguage();
    const { isDarkMode } = useTheme();
    const { refreshGlobalData } = useGlobalState();

    // Responsive dimensions
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const isLargeScreen = windowWidth >= 1024;

    // Component core states
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [pipelineStage, setPipelineStage] = useState(0);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    // AI Crop Search States (Fuzzy Input)
    const [searchQuery, setSearchQuery] = useState('');
    const [cropType, setCropType] = useState('');
    const [scientificName, setScientificName] = useState('');
    const [farmingType, setFarmingType] = useState('field');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [isWaitingToSearch, setIsWaitingToSearch] = useState(false);
    const searchTimeoutRef = useRef(null);
    const pendingQueryRef = useRef('');
    const isSelectingRef = useRef(false); // prevents blur from firing when clicking a suggestion

    // Geolocation & Precision Location States
    const [isLocating, setIsLocating] = useState(false);
    const [isLocationLocked, setIsLocationLocked] = useState(true);
    const [isEditingLocation, setIsEditingLocation] = useState(false);
    const [isFetchingSoil, setIsFetchingSoil] = useState(false);
    
    const [country, setCountry] = useState('India');
    const [state, setState] = useState('Tamil Nadu');
    const [district, setDistrict] = useState('Viluppuram');
    const [taluk, setTaluk] = useState('Tindivanam');
    const [village, setVillage] = useState('Avarapakkam');
    const [latitude, setLatitude] = useState('12.223412');
    const [longitude, setLongitude] = useState('79.645524');
    const [pincode, setPincode] = useState('604001');
    const [elevation, setElevation] = useState('42');
    const [locationConfidenceLow, setLocationConfidenceLow] = useState(false);

    // Soil Profile Estimation State (AI-Driven)
    const [estimatedSoil, setEstimatedSoil] = useState({
        soilType: "Red Sandy Loam / Clay Loam",
        rainfallZone: "North-Eastern Agro-Climatic Zone (Semi-Arid, 950mm average)",
        landClassification: "Dryland & Canal-Irrigated Deltaic Plain",
        organicMatter: "0.48% (Low to Medium)",
        phLevel: "6.2 - 7.5 (Slightly Acidic to Neutral)",
        suitability: "Excellent for Paddy (Rice), Chilli, Groundnut, Sugarcane, and Cashew",
        moistureRange: "18% - 24% (Moderate)"
    });

    // Soil Nutrients (N-P-K) sliders
    const [soilData, setSoilData] = useState({ n: 140, p: 45, k: 55 });

    // AI Confidence Logic Confirmation Blocks
    const [pendingAnalysis, setPendingAnalysis] = useState(null);
    const [confidenceMode, setConfidenceMode] = useState('none'); // 'none' | 'confirm' | 'low_confidence'

    // UI Interactive States
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);
    const resultRef = useRef(null);

    // Dynamic Spacing Dimensions
    const sidebarStyle = isLargeScreen ? {
        width: 'calc(23rem + 1.5vw)',
        minHeight: 'calc(100vh - 40px)',
        overflowY: 'auto',
    } : {
        width: '100%'
    };

    const mainContentStyle = isLargeScreen ? {
        width: 'calc(100% - (23rem + 1.5vw))',
        minHeight: 'calc(100vh - 40px)',
    } : {
        width: '100%'
    };

    // Live weather state
    const [liveWeather, setLiveWeather] = useState(null);

    const fetchLiveWeather = async (lat, lon) => {
        try {
            const res = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`
            );
            const data = await res.json();
            if (data?.current) {
                const WMO = { 0:'Clear Sky',1:'Mainly Clear',2:'Partly Cloudy',3:'Overcast',45:'Foggy',51:'Light Drizzle',61:'Light Rain',63:'Rain',65:'Heavy Rain',80:'Showers',95:'Thunderstorm' };
                setLiveWeather({
                    temp: Math.round(data.current.temperature_2m),
                    humidity: data.current.relative_humidity_2m,
                    wind: Math.round(data.current.wind_speed_10m),
                    condition: WMO[data.current.weather_code] || 'Clear'
                });
            }
        } catch (e) {
            console.warn('Live weather fetch failed:', e);
        }
    };

    // Auto-detect geolocation immediately when page loads
    useEffect(() => {
        triggerGeolocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Scroll to analysis results on update
    useEffect(() => {
        if (result && resultRef.current) {
            setTimeout(() => {
                resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);
        }
    }, [result]);

    // Fetch AI Soil Profile based on location context
    const fetchAISoilProfile = async (locData) => {
        setIsFetchingSoil(true);
        try {
            const response = await apiClient.post(`/soil-profile`, locData);
            if (response.data && response.data.success && response.data.data) {
                setEstimatedSoil(response.data.data);
            }
        } catch (e) {
            console.warn("Failed to fetch AI soil profile:", e);
        } finally {
            setIsFetchingSoil(false);
        }
    };

    const forwardGeocodeAddress = async (updatedFields = {}) => {
        const activeState = updatedFields.state !== undefined ? updatedFields.state : state;
        const activeDistrict = updatedFields.district !== undefined ? updatedFields.district : district;
        const activeTaluk = updatedFields.taluk !== undefined ? updatedFields.taluk : taluk;
        const activeVillage = updatedFields.village !== undefined ? updatedFields.village : village;
        const activePincode = updatedFields.pincode !== undefined ? updatedFields.pincode : pincode;

        if (!activeState && !activeDistrict) return;

        const searchQueryString = `${activeVillage ? activeVillage + ', ' : ''}${activeTaluk ? activeTaluk + ', ' : ''}${activeDistrict}, ${activeState}, India`;
        setIsLocating(true);
        try {
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQueryString)}&limit=1`;
            const res = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'AgriAid.AI-Precision-Agriculture'
                }
            });
            const data = await res.json();
            if (data && data.length > 0) {
                const matched = data[0];
                const newLat = parseFloat(matched.lat).toFixed(6);
                const newLon = parseFloat(matched.lon).toFixed(6);
                setLatitude(newLat);
                setLongitude(newLon);

                // Fetch new elevation
                let newElevation = elevation;
                try {
                    const elRes = await fetch(`https://api.open-meteo.com/v1/elevation?latitude=${newLat}&longitude=${newLon}`);
                    const elData = await elRes.json();
                    if (elData && elData.elevation && elData.elevation[0] !== undefined) {
                        newElevation = Math.round(elData.elevation[0]).toString();
                        setElevation(newElevation);
                    }
                } catch (e) {
                    console.warn("Elevation fetch failed:", e);
                }

                // Fetch new soil profile
                fetchAISoilProfile({
                    state: activeState,
                    district: activeDistrict,
                    country,
                    taluk: activeTaluk,
                    village: activeVillage,
                    latitude: newLat,
                    longitude: newLon,
                    pincode: activePincode,
                    elevation: newElevation
                });

                toast.success(`📍 Map coordinates aligned to ${activeVillage || activeDistrict}!`);
            } else {
                fetchAISoilProfile({
                    state: activeState,
                    district: activeDistrict,
                    country,
                    taluk: activeTaluk,
                    village: activeVillage,
                    latitude,
                    longitude,
                    pincode: activePincode,
                    elevation
                });
            }
        } catch (e) {
            console.warn("Forward geocoding failed:", e);
            fetchAISoilProfile({
                state: activeState,
                district: activeDistrict,
                country,
                taluk: activeTaluk,
                village: activeVillage,
                latitude,
                longitude,
                pincode: activePincode,
                elevation
            });
        } finally {
            setIsLocating(false);
        }
    };

    // Alias for onBlur on lat/lon fields — re-fetches soil profile
    const triggerSoilEstimate = () => {
        fetchAISoilProfile({ state, district, country, taluk, village, latitude, longitude, pincode, elevation });
    };

    // Handle Precision Geolocation with elevation & full reverse geocoding
    const triggerGeolocation = () => {
        setIsLocating(true);
        setLocationConfidenceLow(false);

        if (!navigator.geolocation) {
            toast.error("Browser does not support geolocation. Falling back to regional values.");
            fallbackIPLocation();
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude: lat, longitude: lon } = position.coords;
                setLatitude(lat.toFixed(6));
                setLongitude(lon.toFixed(6));
                fetchLiveWeather(lat, lon);

                // 1. Fetch Elevation from Open-Meteo API
                try {
                    const elRes = await fetch(`https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lon}`);
                    const elData = await elRes.json();
                    if (elData && elData.elevation && elData.elevation[0] !== undefined) {
                        setElevation(Math.round(elData.elevation[0]).toString());
                    }
                } catch (e) {
                    console.warn("Elevation fetch failed:", e);
                }

                // 2. Fetch reverse geocoding details from OpenStreetMap Nominatim
                try {
                    const osmUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
                    const res = await fetch(osmUrl, {
                        headers: {
                            'Accept': 'application/json',
                            'User-Agent': 'AgriAid.AI-Precision-Agriculture'
                        }
                    });
                    const data = await res.json();
                    
                    if (data && data.address) {
                        const addr = data.address;
                        const detectedCountry = addr.country || "India";
                        const detectedState = addr.state || "";
                        const detectedDistrict = addr.state_district || addr.district || addr.county || "";
                        const detectedTaluk = addr.county || addr.subdistrict || "";
                        const detectedVillage = addr.village || addr.town || addr.suburb || addr.city || addr.neighbourhood || addr.hamlet || "";
                        const detectedPostcode = addr.postcode || "";

                        setCountry(detectedCountry);
                        setState(detectedState);
                        setDistrict(detectedDistrict.replace(" District", "").replace(" Division", ""));
                        setTaluk(detectedTaluk.replace(" Taluk", "").replace(" Sub-district", "").replace(" Tehsil", ""));
                        setVillage(detectedVillage || addr.road || "Farming Locality");
                        setPincode(detectedPostcode);
                        setIsLocationLocked(true);
                        
                        if (!detectedState || !detectedDistrict) {
                            setLocationConfidenceLow(true);
                        }

                        // Retrieve AI-driven soil profile for coordinates
                        fetchAISoilProfile({
                            state: detectedState,
                            district: detectedDistrict.replace(" District", ""),
                            country: detectedCountry,
                            taluk: detectedTaluk.replace(" Taluk", ""),
                            village: detectedVillage || "Farming Locality",
                            latitude: lat.toString(),
                            longitude: lon.toString(),
                            pincode: detectedPostcode,
                            elevation: elevation
                        });

                        toast.success(`📍 Located: ${detectedVillage || 'Micro-region'}, ${detectedDistrict}`);
                        return;
                    }
                    throw new Error("OSM address empty");
                } catch (err) {
                    console.warn("OSM Nominatim failed, trying fallback BigDataCloud:", err);
                    
                    // 3. Fallback: BigDataCloud Geocoding
                    try {
                        const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
                        const res = await fetch(bdcUrl);
                        const data = await res.json();
                        
                        if (data) {
                            const detectedCountry = data.countryName || "India";
                            const detectedState = data.principalSubdivision || "";
                            
                            let foundDistrict = "";
                            let foundTaluk = "";
                            if (data.localityInfo && data.localityInfo.administrative) {
                                const admins = data.localityInfo.administrative;
                                const districtObj = admins.find(a => a.adminLevel === 6 || a.name.toLowerCase().includes('district') || a.description.toLowerCase().includes('district'));
                                const talukObj = admins.find(a => a.adminLevel === 7 || a.name.toLowerCase().includes('taluk') || a.name.toLowerCase().includes('tehsil'));
                                if (districtObj) foundDistrict = districtObj.name.replace(" District", "");
                                if (talukObj) foundTaluk = talukObj.name.replace(" Taluk", "").replace(" Tehsil", "");
                            }

                            setCountry(detectedCountry);
                            setState(detectedState);
                            setDistrict(foundDistrict || data.locality || "");
                            setTaluk(foundTaluk || "");
                            setVillage(data.locality || "Farming Village");
                            setPincode(data.postcode || "");
                            setIsLocationLocked(true);

                            if (!data.principalSubdivision) {
                                setLocationConfidenceLow(true);
                            }

                            fetchAISoilProfile({
                                state: detectedState,
                                district: foundDistrict || data.locality || "",
                                country: detectedCountry,
                                taluk: foundTaluk,
                                village: data.locality || "Farming Village",
                                latitude: lat.toString(),
                                longitude: lon.toString(),
                                pincode: data.postcode || "",
                                elevation: elevation
                            });
                            return;
                        }
                    } catch (bdcErr) {
                        console.warn("BigDataCloud failed:", bdcErr);
                    }
                }

                setLocationConfidenceLow(true);
            },
            (err) => {
                console.warn("GPS lookup failed:", err);
                fallbackIPLocation();
            },
            { enableHighAccuracy: true, timeout: 8000 }
        );
        // NOTE: do NOT call setIsLocating(false) here — the async callback handles it
    };

    const fallbackIPLocation = async () => {
        try {
            const res = await fetch('http://ipwho.is/');
            const data = await res.json();
            
            if (data && data.success) {
                const lat = data.latitude;
                const lon = data.longitude;
                setLatitude(lat.toString());
                setLongitude(lon.toString());
                setPincode(data.postal || "");
                setCountry(data.country || "India");
                setState(data.region || "Tamil Nadu");
                fetchLiveWeather(lat, lon);

                // Reverse geocode IP-derived coordinates for precise village / district details
                try {
                    const osmUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
                    const osmRes = await fetch(osmUrl, {
                        headers: {
                            'Accept': 'application/json',
                            'User-Agent': 'AgriAid.AI-Precision-Agriculture'
                        }
                    });
                    const osmData = await osmRes.json();
                    if (osmData && osmData.address) {
                        const addr = osmData.address;
                        const detectedDistrict = addr.state_district || addr.district || addr.county || "";
                        const detectedTaluk = addr.county || addr.subdistrict || "";
                        const detectedVillage = addr.village || addr.town || addr.suburb || addr.city || addr.neighbourhood || addr.hamlet || "";

                        setDistrict(detectedDistrict.replace(" District", "").replace(" Division", ""));
                        setTaluk(detectedTaluk.replace(" Taluk", "").replace(" Sub-district", "").replace(" Tehsil", ""));
                        setVillage(detectedVillage || addr.road || "Farming Locality");
                        setIsLocationLocked(true);

                        fetchAISoilProfile({
                            state: data.region || "Tamil Nadu",
                            district: detectedDistrict.replace(" District", ""),
                            country: data.country || "India",
                            taluk: detectedTaluk.replace(" Taluk", ""),
                            village: detectedVillage || "Farming Locality",
                            latitude: lat.toString(),
                            longitude: lon.toString(),
                            pincode: data.postal || "",
                            elevation: elevation
                        });
                        return;
                    }
                } catch (e) {
                    console.warn("Nominatim geocoding on fallback coordinates failed:", e);
                }

                setDistrict(data.city || "Viluppuram");
                setTaluk("Tindivanam");
                setVillage("Avarapakkam");
                setIsLocationLocked(true);

                fetchAISoilProfile({
                    state: data.region || "Tamil Nadu",
                    district: data.city || "Viluppuram",
                    country: data.country || "India",
                    taluk: "Tindivanam",
                    village: "Avarapakkam",
                    latitude: lat.toString(),
                    longitude: lon.toString(),
                    pincode: data.postal || "",
                    elevation: elevation
                });
            } else {
                throw new Error("ipwho.is unsuccessful");
            }
        } catch (e) {
            console.warn("Fallback IP geolocator failed:", e);
            // Secure fallback coordinates pointing to Madurai
            setCountry("India");
            setState("Tamil Nadu");
            setDistrict("Madurai");
            setTaluk("Madurai North");
            setVillage("Athikulam");
            setLatitude("9.953487");
            setLongitude("78.156281");
            setPincode("625020");
            setElevation("101");
            setIsLocationLocked(true);
            setLocationConfidenceLow(true);

            fetchAISoilProfile({
                state: "Tamil Nadu",
                district: "Madurai",
                country: "India",
                taluk: "Madurai North",
                village: "Athikulam",
                latitude: "9.953487",
                longitude: "78.156281",
                pincode: "625020",
                elevation: "101"
            });
        } finally {
            setIsLocating(false);
        }
    };

    // Debounced AI search — fires only after 2s pause, Enter, or blur
    const triggerSearch = async (query) => {
        if (!query || query.trim().length < 2) return;
        setIsWaitingToSearch(false);
        setIsSuggesting(true);
        try {
            const res = await apiClient.get(`/crop-suggestions?q=${encodeURIComponent(query.trim())}`);
            if (res.data && res.data.success) {
                setSuggestions(res.data.data || []);
                setShowSuggestions(true);
            }
        } catch (err) {
            console.warn('Suggestions fetch failed:', err);
        } finally {
            setIsSuggesting(false);
        }
    };

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        pendingQueryRef.current = query;

        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

        if (!query.trim() || query.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            setIsWaitingToSearch(false);
            return;
        }

        // Show "waiting" indicator — no API call yet
        setIsWaitingToSearch(true);
        setIsSuggesting(false);

        // Fire after 2s of inactivity
        searchTimeoutRef.current = setTimeout(() => {
            triggerSearch(pendingQueryRef.current);
        }, 2000);
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
            triggerSearch(pendingQueryRef.current);
        }
    };

    const handleSearchBlur = () => {
        // Skip if user is clicking a suggestion item
        if (isSelectingRef.current) return;
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        setIsWaitingToSearch(false);
        if (pendingQueryRef.current.trim().length >= 2) {
            triggerSearch(pendingQueryRef.current);
        }
    };

    const selectSuggestion = (crop) => {
        isSelectingRef.current = false;
        setSearchQuery(crop.name);
        setCropType(crop.name);
        setScientificName(crop.scientific);
        setFarmingType(crop.category);
        setShowSuggestions(false);
        setSuggestions([]);
    };

    // Camera triggers
    const startCamera = async () => {
        setIsCameraOpen(true);
        setError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (err) {
            console.error("Camera failed:", err);
            setError("Could not access camera. Verify device permissions.");
            setIsCameraOpen(false);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setIsCameraOpen(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
                const file = new File([blob], "camera_snapshot.jpg", { type: "image/jpeg" });
                if (previewUrl) URL.revokeObjectURL(previewUrl);
                setSelectedImage(file);
                setPreviewUrl(URL.createObjectURL(file));
                stopCamera();
                autoUploadAndRunDiagnostics(file);
            }, 'image/jpeg', 0.95);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            autoUploadAndRunDiagnostics(file);
        }
    };

    // Auto Diagnostics with Full Location details
    const autoUploadAndRunDiagnostics = async (file) => {
        if (!file) return;
        setLoading(true);
        setError(null);
        setResult(null);
        setPendingAnalysis(null);
        setConfidenceMode('none');
        setPipelineStage(1);

        const stageInterval = setInterval(() => {
            setPipelineStage(prev => (prev < PIPELINE_STAGES.length ? prev + 1 : prev));
        }, 1500);

        const formData = new FormData();
        formData.append('image', file);
        formData.append('country', country || 'India');
        formData.append('state', state || 'Tamil Nadu');
        formData.append('district', district || 'Viluppuram');
        formData.append('taluk', taluk || '');
        formData.append('village', village || '');
        formData.append('latitude', latitude || '');
        formData.append('longitude', longitude || '');
        formData.append('pincode', pincode || '');
        formData.append('elevation', elevation || '');

        try {
            const response = await apiClient.post(`/analyze`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            clearInterval(stageInterval);
            const data = response.data;

            if (data.isValidPlant === false) {
                toast.error("Please upload a valid crop or plant image.", {
                    duration: 5000,
                    style: { background: '#340b13', color: '#fca5a5', border: '1px solid #f87171' }
                });
                setError("Please upload a valid crop or plant image.");
                setSelectedImage(null);
                setPreviewUrl(null);
                setLoading(false);
                return;
            }

            const confidence = data.diseaseAnalysis?.confidence || 85.00;
            const detectedCropName = data.diseaseAnalysis?.crop || 'Rice';
            const detectedSciName = data.diseaseAnalysis?.scientificName || 'Oryza sativa';
            const detectedCat = data.diseaseAnalysis?.category || 'field';

            if (confidence > 85) {
                setCropType(detectedCropName);
                setSearchQuery(detectedCropName);
                setScientificName(detectedSciName);
                setFarmingType(detectedCat);
                setResult(data);
                setConfidenceMode('none');
                toast.success(`🌱 Auto-Detected: ${detectedCropName} (${confidence.toFixed(0)}% Confidence)`);
            } else if (confidence >= 60 && confidence <= 85) {
                setPendingAnalysis(data);
                setConfidenceMode('confirm');
                toast("AI crop recognition confidence is moderate. Verification required.", { icon: '🤔' });
            } else {
                setPendingAnalysis(data);
                setConfidenceMode('low_confidence');
                toast.error("Unable to confidently identify crop. Select crop manually.", { duration: 5000 });
            }

        } catch (err) {
            clearInterval(stageInterval);
            const errorMsg = err.response?.data?.message || 'Botanical verification failed. Please try again.';
            toast.error(errorMsg);
            setError(errorMsg);
            setSelectedImage(null);
            setPreviewUrl(null);
        } finally {
            setLoading(false);
        }
    };

    const acceptPendingResult = () => {
        if (!pendingAnalysis) return;
        const crop = pendingAnalysis.diseaseAnalysis.crop;
        const scientific = pendingAnalysis.diseaseAnalysis.scientificName;
        const category = pendingAnalysis.diseaseAnalysis.category;

        setCropType(crop);
        setSearchQuery(crop);
        setScientificName(scientific);
        setFarmingType(category);
        setResult(pendingAnalysis);
        setConfidenceMode('none');
        setPendingAnalysis(null);
        toast.success(`Confirmed Species: ${crop}`);
    };

    const rejectPendingResult = () => {
        setCropType('');
        setSearchQuery('');
        setScientificName('');
        setConfidenceMode('low_confidence');
    };

    const triggerManualDiagnostics = async () => {
        if (!selectedImage || !cropType) return;
        setLoading(true);
        setError(null);
        setResult(null);
        setConfidenceMode('none');
        setPipelineStage(3);

        const formData = new FormData();
        formData.append('image', selectedImage);
        formData.append('cropType', cropType);
        formData.append('country', country || 'India');
        formData.append('state', state || 'Tamil Nadu');
        formData.append('district', district || 'Viluppuram');
        formData.append('taluk', taluk || '');
        formData.append('village', village || '');
        formData.append('latitude', latitude || '');
        formData.append('longitude', longitude || '');
        formData.append('pincode', pincode || '');
        formData.append('elevation', elevation || '');

        try {
            const response = await apiClient.post(`/analyze`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setResult(response.data);
            toast.success("Crop report successfully compiled!");
            refreshGlobalData();
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Analysis failed.';
            toast.error(errorMsg);
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setResult(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setSelectedImage(null);
        setPreviewUrl(null);
        setCropType('');
        setSearchQuery('');
        setScientificName('');
        setConfidenceMode('none');
        setPendingAnalysis(null);
    };



    const speakAdvice = (text) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-IN';
        utterance.rate = 0.95;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    };

    const stopSpeaking = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    };

    const getSeverityPercentage = (sevStr) => {
        if (!sevStr) return 40;
        const num = parseInt(sevStr.replace(/\D/g, ''));
        if (!isNaN(num)) return num;
        const low = sevStr.toLowerCase();
        if (low.includes('high') || low.includes('severe')) return 80;
        if (low.includes('medium') || low.includes('moderate')) return 45;
        return 20;
    };

    const getTranslatedResult = () => {
        if (!result) return null;
        const disease = result.diseaseAnalysis?.disease || 'Unknown';
        const severityPct = getSeverityPercentage(result.diseaseAnalysis?.severity);
        const isHealthy = disease.toLowerCase().includes('healthy');

        return {
            diseaseName: result.recommendation?.diseaseName || disease,
            isHealthy,
            severityPercentage: severityPct,
            fertilizer: result.recommendation?.fertilizer || 'Phytosanitary treatment.',
            dosage: result.recommendation?.quantity || 'As prescribed',
            instructions: result.recommendation?.instructions || result.recommendation?.farmerNote || 'Monitor plant boundaries.',
            organicAlternative: result.recommendation?.organicAlternative || 'Biological control alternative.',
            prevention: result.recommendation?.prevention || 'Clear residues from borders.',
            confidence: result.diseaseAnalysis?.confidence || 85.00,
            weather: result.weatherNote || 'Temperature 28°C, Humidity 64%.',
            isHighSpreadRisk: severityPct > 60 && !isHealthy,
            healthScore: isHealthy ? 98 : Math.max(10, 100 - severityPct),

            affectedAreas: result.recommendation?.affectedAreas || 'Leaves and surrounding stems.',
            cureMethods: result.recommendation?.cureMethods || 'Apply standard treatment.',
            organicSolutions: result.recommendation?.organicSolutions || 'Neem oil or biological control.',
            fertilizerSuggestions: result.recommendation?.fertilizerSuggestions || 'Balance dynamic nutrients.',
            irrigationAdvice: result.recommendation?.irrigationAdvice || 'Drip irrigate at regular intervals.',
            weatherRisks: result.recommendation?.weatherRisks || 'High humidity acts as a mycelial trigger.',
            preventionTips: result.recommendation?.preventionTips || 'Sanitize agricultural equipment.',
            yieldProtectionAdvice: result.recommendation?.yieldProtectionAdvice || 'Preserve foliage to secure yield.',
            soilRecommendations: result.recommendation?.soilRecommendations || 'Adjust top-soil properties.',
            recoveryTimeline: result.recommendation?.recoveryTimeline || [],
            marketInsights: result.recommendation?.marketInsights || 'Pricing indicates stable market trends.',
            chatSuggestions: result.recommendation?.chatSuggestions || []
        };
    };

    const txResult = getTranslatedResult();
    const soilGuidanceText = txResult ? getNutrientGuidance(soilData.n, soilData.p, soilData.k, txResult.diseaseName) : '';

    return (
        <div className="w-full min-h-screen bg-slate-50 dark:bg-[#030914] text-slate-800 dark:text-[#F8FAFC] p-3 lg:p-4 flex flex-col lg:flex-row gap-4">

            {/* ==================== SIDEBAR ==================== */}
            <div className="w-full lg:w-[clamp(280px,22vw,360px)] shrink-0 flex flex-col gap-3 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
                {/* ── Header ── */}
                <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-200 dark:border-white/10 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="shrink-0 p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg shadow-emerald-500/20">
                            <ScanLine className="w-4 h-4 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-sm font-bold text-slate-800 dark:text-white leading-tight truncate">AI Plant Doctor</h2>
                            <span className="text-[10px] text-teal-400 font-semibold uppercase tracking-widest">Crop Diagnosis</span>
                        </div>
                    </div>
                </div>

                {/* ── Location Panel ── */}
                <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-200 dark:border-white/10 rounded-2xl p-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Your Location</span>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={triggerGeolocation}
                                disabled={isLocating}
                                className="p-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-slate-200 dark:border-white/10 rounded-lg hover:border-teal-500 hover:text-teal-600 dark:hover:text-white text-slate-500 dark:text-slate-400 transition-all disabled:opacity-50"
                                title="Re-Sync GPS"
                            >
                                <RefreshCw className={clsx("w-3 h-3", isLocating && "animate-spin text-teal-400")} />
                            </button>
                            {isLocationLocked
                                ? <Lock className="w-3 h-3 text-amber-500" />
                                : <Unlock className="w-3 h-3 text-teal-400" />
                            }
                        </div>
                    </div>

                    {locationConfidenceLow && (
                        <div className="bg-red-500/10 border border-red-500/20 text-rose-400 px-3 py-2 rounded-xl text-[10px] flex items-start gap-1.5 leading-normal">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span>Unable to accurately determine region automatically. Please review and adjust the fields manually.</span>
                        </div>
                    )}

                    {isLocating ? (
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Loader2 className="w-3 h-3 animate-spin text-teal-400" />
                            <span>Resolving GPS boundaries...</span>
                        </div>
                    ) : (
                        <div className="bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 text-teal-700 dark:text-teal-400 px-3 py-2 rounded-xl text-xs flex flex-col gap-1 leading-normal">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                                <span className="font-bold">{village || "Avarapakkam"}{taluk ? `, ${taluk}` : ''}</span>
                            </div>
                            <div className="text-[10px] text-teal-600 dark:text-teal-400/80 pl-3.5">
                                {district}, {state} ({country}) - {pincode}
                            </div>
                            <div className="text-[9px] text-slate-500 dark:text-slate-400 pl-3.5 pt-0.5">
                                Lat: {latitude}°, Lon: {longitude}° | Elevation: {elevation}m
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between items-center">
                        <button
                            type="button"
                            onClick={() => setIsEditingLocation(!isEditingLocation)}
                            className="text-[10px] font-bold text-teal-400 hover:text-teal-300 underline"
                        >
                            {isEditingLocation ? "Hide Manual Fields" : "Edit Region Details"}
                        </button>
                    </div>

                    {isEditingLocation && (
                        <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-100 dark:border-white/5">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-semibold text-slate-500 uppercase">State</span>
                                    <input
                                        type="text"
                                        value={state}
                                        onChange={(e) => { setState(e.target.value); setIsLocationLocked(false); }}
                                        onBlur={(e) => forwardGeocodeAddress({ state: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-[#030914] border border-slate-200 dark:border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-[11px] text-slate-800 dark:text-white focus:outline-none focus:border-teal-500"
                                        placeholder="e.g. Tamil Nadu"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-semibold text-slate-500 uppercase">District</span>
                                    <input
                                        type="text"
                                        value={district}
                                        onChange={(e) => { setDistrict(e.target.value); setIsLocationLocked(false); }}
                                        onBlur={(e) => forwardGeocodeAddress({ district: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-[#030914] border border-slate-200 dark:border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-[11px] text-slate-800 dark:text-white focus:outline-none focus:border-teal-500"
                                        placeholder="e.g. Viluppuram"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-semibold text-slate-500 uppercase">Taluk / Sub-District</span>
                                    <input
                                        type="text"
                                        value={taluk}
                                        onChange={(e) => { setTaluk(e.target.value); setIsLocationLocked(false); }}
                                        onBlur={(e) => forwardGeocodeAddress({ taluk: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-[#030914] border border-slate-200 dark:border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-[11px] text-slate-800 dark:text-white focus:outline-none focus:border-teal-500"
                                        placeholder="e.g. Tindivanam"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-semibold text-slate-500 uppercase">Village / City</span>
                                    <input
                                        type="text"
                                        value={village}
                                        onChange={(e) => { setVillage(e.target.value); setIsLocationLocked(false); }}
                                        onBlur={(e) => forwardGeocodeAddress({ village: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-[#030914] border border-slate-200 dark:border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-[11px] text-slate-800 dark:text-white focus:outline-none focus:border-teal-500"
                                        placeholder="e.g. Avarapakkam"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <div className="space-y-1">
                                    <span className="text-[9px] font-semibold text-slate-500 uppercase">Pincode</span>
                                    <input
                                        type="text"
                                        value={pincode}
                                        onChange={(e) => { setPincode(e.target.value); setIsLocationLocked(false); }}
                                        onBlur={(e) => forwardGeocodeAddress({ pincode: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-[#030914] border border-slate-200 dark:border-slate-200 dark:border-white/10 rounded-xl px-2 py-2 text-[11px] text-slate-800 dark:text-white focus:outline-none focus:border-teal-500"
                                        placeholder="604001"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[9px] font-semibold text-slate-500 uppercase">Latitude</span>
                                    <input
                                        type="text"
                                        value={latitude}
                                        onChange={(e) => { setLatitude(e.target.value); setIsLocationLocked(false); }}
                                        onBlur={triggerSoilEstimate}
                                        className="w-full bg-slate-50 dark:bg-[#030914] border border-slate-200 dark:border-slate-200 dark:border-white/10 rounded-xl px-2 py-2 text-[11px] text-slate-800 dark:text-white focus:outline-none focus:border-teal-500"
                                        placeholder="12.2234"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[9px] font-semibold text-slate-500 uppercase">Longitude</span>
                                    <input
                                        type="text"
                                        value={longitude}
                                        onChange={(e) => { setLongitude(e.target.value); setIsLocationLocked(false); }}
                                        onBlur={triggerSoilEstimate}
                                        className="w-full bg-slate-50 dark:bg-[#030914] border border-slate-200 dark:border-slate-200 dark:border-white/10 rounded-xl px-2 py-2 text-[11px] text-slate-800 dark:text-white focus:outline-none focus:border-teal-500"
                                        placeholder="79.6455"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* AI Searchable Target Crop Field */}
                <div className="space-y-2 relative">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Search Crop Species</span>
                        <HelpCircle className="w-3.5 h-3.5 text-slate-500 cursor-help" title="Fuzzy AI Search. Types queries, corrects spelling, and retrieves species classification from Gemini APIs." />
                    </div>

                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onKeyDown={handleSearchKeyDown}
                            onBlur={handleSearchBlur}
                            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                            placeholder="Type species (e.g. Tomato, Rice)..."
                            className="w-full bg-slate-50 dark:bg-[#030914] border border-slate-200 dark:border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-3 py-3 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-teal-500 transition-all"
                        />
                        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                    </div>

                    {searchQuery.length >= 2 && (isWaitingToSearch || isSuggesting || showSuggestions) && (
                        <div className="absolute z-20 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-200 dark:border-white/10 rounded-xl mt-1 shadow-2xl max-h-[180px] overflow-y-auto">
                            {isWaitingToSearch ? (
                                <div className="p-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                                    <span>Press Enter or pause to search...</span>
                                </div>
                            ) : isSuggesting ? (
                                <div className="p-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-400" />
                                    <span>AI correcting crop name...</span>
                                </div>
                            ) : suggestions.length > 0 ? (
                                suggestions.map((crop, index) => (
                                    <div
                                        key={index}
                                        onMouseDown={() => { isSelectingRef.current = true; }}
                                        onClick={() => selectSuggestion(crop)}
                                        className="px-4 py-2.5 hover:bg-teal-50 dark:hover:bg-teal-500/10 cursor-pointer flex justify-between items-center border-b border-slate-100 dark:border-slate-100 dark:border-white/5 last:border-b-0"
                                    >
                                        <div>
                                            <p className="text-xs font-bold text-slate-800 dark:text-white">{crop.name}</p>
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">{crop.scientific}</p>
                                        </div>
                                        <span className="text-[8px] bg-teal-500/10 text-teal-400 border border-teal-500/20 px-1.5 py-0.5 rounded font-bold uppercase">
                                            {crop.category}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 text-xs text-slate-500 text-center">No AI suggestions found for query.</div>
                            )}
                        </div>
                    )}

                    {cropType && (
                        <div className="bg-slate-50 dark:bg-slate-50 dark:bg-[#050C16] border border-slate-200 dark:border-slate-100 dark:border-white/5 rounded-xl p-3 mt-2 flex justify-between items-center">
                            <div>
                                <span className="text-[9px] font-extrabold text-teal-400 uppercase tracking-widest block">Active Target</span>
                                <h4 className="text-xs font-bold text-slate-800 dark:text-white">{cropType} <span className="text-[10px] text-slate-500 dark:text-slate-400 italic">({scientificName || 'Custom'})</span></h4>
                            </div>
                            <button onClick={() => { setCropType(''); setSearchQuery(''); setScientificName(''); }} className="text-slate-400 hover:text-white">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}
                </div>



                {/* Gateway Upload Box */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Specimen Upload Gateway</label>
                    
                    {!isCameraOpen ? (
                        <div className="space-y-3">
                            <div 
                                onClick={() => !loading && fileInputRef.current.click()}
                                className="relative border-2 border-dashed rounded-3xl h-[160px] border-slate-200 dark:border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#030914] hover:bg-slate-100 dark:hover:bg-slate-800/20 hover:border-teal-500/50 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden"
                            >
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />

                                <AnimatePresence mode="wait">
                                    {previewUrl ? (
                                        <div className="relative w-full h-full p-2">
                                            <img src={previewUrl} className="w-full h-full object-cover rounded-2xl" alt="Preview" />
                                            {loading && (
                                                <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center gap-3 p-4 text-center">
                                                    <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
                                                    <p className="text-xs font-bold text-teal-400 uppercase tracking-wider animate-pulse">Running Neural Analysis...</p>
                                                    <p className="text-[10px] text-slate-400">{PIPELINE_STAGES[pipelineStage - 1]?.text || 'Processing specimen data...'}</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center p-6 space-y-3 flex flex-col items-center">
                                            <div className="p-3.5 bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
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
                                <button
                                    type="button"
                                    onClick={startCamera}
                                    className="w-full bg-slate-100 dark:bg-slate-100 dark:bg-[#0A1628] hover:bg-slate-200 dark:hover:bg-slate-800/40 border border-slate-200 dark:border-slate-200 dark:border-white/10 rounded-2xl py-3 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2 transition-all"
                                >
                                    <Camera className="w-4 h-4 text-teal-400" />
                                    Open Live Camera Scanner
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="relative rounded-3xl h-[210px] bg-black overflow-hidden flex items-center justify-center">
                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                            <canvas ref={canvasRef} className="hidden" />

                            <button
                                type="button"
                                onClick={stopCamera}
                                className="absolute top-3 right-3 p-2 bg-black/70 rounded-full text-white hover:bg-red-500 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            <button
                                type="button"
                                onClick={capturePhoto}
                                className="absolute bottom-4 w-12 h-12 bg-white/20 rounded-full border-2 border-white flex items-center justify-center"
                            >
                                <div className="w-9 h-9 bg-white rounded-full" />
                            </button>

                            <motion.div
                                className="absolute left-0 right-0 h-0.5 bg-teal-400 shadow-[0_0_12px_rgba(20,184,166,0.8)]"
                                animate={{ top: ['0%', '100%'] }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            />
                        </div>
                    )}
                </div>

                {confidenceMode === 'low_confidence' && cropType && (
                    <button
                        type="button"
                        onClick={triggerManualDiagnostics}
                        disabled={loading}
                        className="w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-widest bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-lg active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Sprout className="w-4 h-4" />
                        Run Diagnostics manually
                    </button>
                )}
            </div>

            {/* ==================== 2. MAIN CONTENT CANVAS ==================== */}
            <div 
                style={mainContentStyle} 
                className="flex-1 flex flex-col gap-6"
            >
                <AnimatePresence mode="wait">
                    
                    {/* A. Dynamic Moderate Confidence Verification Interface */}
                    {confidenceMode === 'confirm' && pendingAnalysis && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="bg-white/80 dark:bg-[#0B1528]/80 backdrop-blur-lg border border-slate-200 dark:border-slate-200 dark:border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center text-center gap-6 shadow-2xl flex-1"
                        >
                            <div className="p-4 bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20">
                                <HelpCircle className="w-10 h-10 animate-bounce" />
                            </div>
                            <div className="space-y-2">
                                <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full">Species Verification Required</span>
                                <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mt-2">Is this specimen a {pendingAnalysis.diseaseAnalysis.crop}?</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
                                    AI detected {pendingAnalysis.diseaseAnalysis.crop} ({pendingAnalysis.diseaseAnalysis.scientificName}) with {pendingAnalysis.diseaseAnalysis.confidence}% confidence. Please confirm to unlock advisory rules.
                                </p>
                            </div>
                            <div className="flex gap-4 w-full max-w-xs">
                                <button
                                    onClick={acceptPendingResult}
                                    className="flex-1 py-3 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all"
                                >
                                    Yes, Correct
                                </button>
                                <button
                                    onClick={rejectPendingResult}
                                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-300 font-bold rounded-xl text-xs uppercase tracking-wider transition-all"
                                >
                                    No, Let me Search
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* B. Low Confidence Fallback Selector Interface */}
                    {confidenceMode === 'low_confidence' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white/80 dark:bg-[#0B1528]/80 backdrop-blur-lg border border-slate-200 dark:border-slate-200 dark:border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center text-center gap-6 shadow-2xl flex-1"
                        >
                            <div className="p-4 bg-red-500/10 text-red-400 rounded-full border border-red-500/20">
                                <AlertCircle className="w-10 h-10 animate-pulse" />
                            </div>
                            <div className="space-y-2">
                                <span className="text-[10px] font-extrabold text-red-400 uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-full">Unable to confidently identify crop</span>
                                <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mt-2">Species Auto-Fill Failed</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
                                    Our vision filters detected botanical tissue but cannot determine the exact crop clearly. Please use the search bar in the left sidebar to manually specify the target crop name.
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* C. Complete Diagnostic Results Output */}
                    {txResult && confidenceMode === 'none' ? (
                        <div ref={resultRef} className="w-full flex flex-col gap-6">
                            
                            {/* 1. Crop Overview & Disease Analysis (Premium Banner Header) */}
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={clsx(
                                    "rounded-3xl p-6 border relative overflow-hidden flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 shadow-xl",
                                    txResult.isHealthy
                                        ? "bg-gradient-to-r from-[#06241a] to-[#0c3c2e] border-emerald-500/30 text-emerald-400"
                                        : txResult.severityPercentage > 60
                                            ? "bg-gradient-to-r from-[#340b13] to-[#54121b] border-red-500/30 text-rose-400"
                                            : "bg-gradient-to-r from-[#2c1305] to-[#421b06] border-orange-500/30 text-amber-400"
                                )}
                            >
                                <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.2)_1px,transparent_0)] bg-[size:16px_16px]" />
                                
                                <div className="space-y-2 relative z-10 flex-1 w-full">
                                    <div className="flex gap-2 items-center flex-wrap">
                                        <span className="px-3 py-0.5 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider border border-slate-200 dark:border-white/10">
                                            {txResult.isHealthy ? "Verified Healthy" : "Infection Spotted"}
                                        </span>
                                        <span className="px-2.5 py-0.5 bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded-full text-[9px] font-bold uppercase">
                                            {result.diseaseAnalysis?.crop} ({result.diseaseAnalysis?.scientificName})
                                        </span>
                                        <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[9px] font-extrabold uppercase">
                                            {result.diseaseAnalysis?.category}
                                        </span>
                                    </div>
                                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold leading-tight tracking-tight text-white animate-fade-in">
                                        {txResult.diseaseName}
                                    </h2>
                                    
                                    <div className="w-full space-y-1.5 pt-2 max-w-lg">
                                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                                            <span className="opacity-70">Damage Spread Severity</span>
                                            <span>{txResult.isHealthy ? "0%" : `${txResult.severityPercentage}%`}</span>
                                        </div>
                                        <div className="h-2 w-full bg-black/45 rounded-full overflow-hidden p-[1px] border border-slate-100 dark:border-white/5">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: txResult.isHealthy ? "0%" : `${txResult.severityPercentage}%` }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                                className={clsx(
                                                    "h-full rounded-full bg-gradient-to-r",
                                                    txResult.isHealthy 
                                                        ? "from-emerald-400 to-teal-400" 
                                                        : txResult.severityPercentage > 60 
                                                            ? "from-rose-500 to-red-500" 
                                                            : "from-amber-400 to-orange-500"
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1 items-end relative z-10 shrink-0 bg-slate-100 dark:bg-black/35 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-white/10 min-w-[130px] text-right">
                                    <span className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-none">
                                        {Number(txResult.confidence).toFixed(2)}<span className="text-xs font-semibold opacity-60 ml-0.5">%</span>
                                    </span>
                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Confidence Score</span>
                                </div>
                            </motion.div>

                            {/* 2. AI recommendations & Prescriptions (Cure Methods, Organic Alternatives, Yield Protection) */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-slate-50 dark:bg-[#050C16] border border-slate-200 dark:border-white/10 p-5 rounded-3xl flex flex-col gap-4 shadow-lg">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-teal-500/10 rounded-xl text-teal-400">
                                            <Activity className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Cure Methods</h3>
                                            <span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-500">Chemical / Technical</span>
                                        </div>
                                    </div>
                                    <hr className="border-slate-100 dark:border-white/5" />
                                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium flex-1">
                                        {txResult.cureMethods}
                                    </p>
                                </div>

                                <div className="bg-slate-50 dark:bg-[#050C16] border border-slate-200 dark:border-white/10 p-5 rounded-3xl flex flex-col gap-4 shadow-lg">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                                            <Leaf className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Organic Solutions</h3>
                                            <span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-500">Biological & Natural</span>
                                        </div>
                                    </div>
                                    <hr className="border-slate-100 dark:border-white/5" />
                                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium flex-1">
                                        {txResult.organicSolutions}
                                    </p>
                                </div>

                                <div className="bg-slate-50 dark:bg-[#050C16] border border-slate-200 dark:border-white/10 p-5 rounded-3xl flex flex-col gap-4 shadow-lg">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Yield Protection Advice</h3>
                                            <span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-500">Mitigate Crop Losses</span>
                                        </div>
                                    </div>
                                    <hr className="border-slate-100 dark:border-white/5" />
                                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium flex-1">
                                        {txResult.yieldProtectionAdvice}
                                    </p>
                                </div>
                            </div>

                            {/* 3. Soil Intelligence, Fertilizer Guidance & Irrigation Advice */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-slate-50 dark:bg-[#050C16] border border-slate-200 dark:border-white/10 p-5 rounded-3xl flex flex-col gap-4 shadow-lg">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
                                            <Beaker className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Soil Intelligence</h3>
                                            <span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-500">Structure & Conditioning</span>
                                        </div>
                                    </div>
                                    <hr className="border-slate-100 dark:border-white/5" />
                                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium flex-1">
                                        {txResult.soilRecommendations}
                                    </p>
                                </div>

                                <div className="bg-slate-50 dark:bg-[#050C16] border border-slate-200 dark:border-white/10 p-5 rounded-3xl flex flex-col gap-4 shadow-lg">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400">
                                            <Tractor className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Fertilizer Guidance</h3>
                                            <span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-500">Mineral & NPK Balance</span>
                                        </div>
                                    </div>
                                    <hr className="border-slate-100 dark:border-white/5" />
                                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium flex-1">
                                        {txResult.fertilizerSuggestions}
                                    </p>
                                    <div className="bg-slate-100 dark:bg-black/35 border border-slate-100 dark:border-white/5 rounded-xl p-2.5 text-[10px] text-slate-400">
                                        Active chemical dosage: <strong>{txResult.dosage}</strong> of <strong>{txResult.fertilizer}</strong>
                                    </div>
                                </div>

                                <div className="bg-slate-50 dark:bg-[#050C16] border border-slate-200 dark:border-white/10 p-5 rounded-3xl flex flex-col gap-4 shadow-lg">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400">
                                            <Compass className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Irrigation Advice</h3>
                                            <span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-500">Hydration & Spore Control</span>
                                        </div>
                                    </div>
                                    <hr className="border-slate-100 dark:border-white/5" />
                                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium flex-1">
                                        {txResult.irrigationAdvice}
                                    </p>
                                </div>
                            </div>

                            {/* 4. Environmental Risk Meter & Weather Insights */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-slate-50 dark:bg-[#050C16] border border-slate-200 dark:border-white/10 p-5 rounded-3xl flex flex-col gap-4 shadow-lg relative overflow-hidden">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-rose-500/10 rounded-xl text-rose-400">
                                            <AlertTriangle className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Risk Meter & Spread Risk</h3>
                                            <span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-500">Disease Spread Vector</span>
                                        </div>
                                    </div>
                                    <hr className="border-slate-100 dark:border-white/5" />
                                    
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="space-y-1.5 flex-1">
                                            <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Sporulation Risk Level</span>
                                            <span className={clsx(
                                                "text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider inline-block",
                                                txResult.isHighSpreadRisk ? "bg-red-500/20 border border-red-500/30 text-rose-400" : "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
                                            )}>
                                                {txResult.isHighSpreadRisk ? "⚠️ High Risk" : "✓ Low Risk"}
                                            </span>
                                            <p className="text-[10px] text-slate-400 mt-2">
                                                Based on localized weather humidity matrix. Spore growth accelerates exponentially in high-moisture air.
                                            </p>
                                        </div>

                                        <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                                            <svg className="w-full h-full transform -rotate-90">
                                                <circle cx="40" cy="40" r="32" className="stroke-slate-800" strokeWidth="6" fill="transparent" />
                                                <circle cx="40" cy="40" r="32" 
                                                    className={txResult.isHealthy ? "stroke-emerald-400" : "stroke-amber-400"} 
                                                    strokeWidth="6" fill="transparent" 
                                                    strokeDasharray={200} 
                                                    strokeDashoffset={200 - (200 * txResult.healthScore) / 100} 
                                                />
                                            </svg>
                                            <span className="absolute text-sm font-black text-white">{txResult.healthScore}%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 dark:bg-[#050C16] border border-slate-200 dark:border-white/10 p-5 rounded-3xl flex flex-col gap-4 shadow-lg">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-sky-500/10 rounded-xl text-sky-400">
                                            <CloudSun className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Weather Insights</h3>
                                            <span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-500">Localized Microclimate</span>
                                        </div>
                                    </div>
                                    <hr className="border-slate-100 dark:border-white/5" />
                                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                        {txResult.weatherRisks}
                                    </p>
                                    <div className="bg-slate-100 dark:bg-black/35 border border-slate-100 dark:border-white/5 rounded-xl p-2.5 text-[10px] text-slate-500 dark:text-slate-400 flex justify-between items-center">
                                        <span>Current weather parameters:</span>
                                        <strong className="text-white">{txResult.weather}</strong>
                                    </div>
                                </div>
                            </div>

                            {/* 5. Biological Recovery Timeline */}
                            <div className="bg-slate-50 dark:bg-[#050C16] border border-slate-200 dark:border-white/10 p-5 rounded-3xl shadow-lg flex flex-col gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-violet-500/10 rounded-xl text-violet-400">
                                        <Compass className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800 dark:text-white">Recovery Timeline</h3>
                                        <span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-500">Recovery Milestones Tracker</span>
                                    </div>
                                </div>
                                <hr className="border-slate-100 dark:border-white/5" />

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative pl-4 md:pl-0">
                                    {txResult.recoveryTimeline && txResult.recoveryTimeline.length > 0 ? (
                                        txResult.recoveryTimeline.map((item, idx) => (
                                            <div key={idx} className="relative pl-6 md:pl-4 border-l border-slate-200 dark:border-white/10 md:border-l-0 md:border-t md:pt-4 md:mt-2">
                                                <div className="absolute -left-[5px] top-1 md:-top-[5px] md:left-2 w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(20,184,166,0.8)]" />
                                                <h4 className="text-[10px] font-extrabold text-teal-400 uppercase tracking-widest">{item.day}</h4>
                                                <p className="text-[11px] text-slate-300 font-bold leading-normal mt-1">{item.milestone}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <>
                                            <div className="relative pl-6 md:pl-4 border-l border-slate-200 dark:border-white/10 md:border-l-0 md:border-t md:pt-4 md:mt-2">
                                                <div className="absolute -left-[5px] top-1 md:-top-[5px] md:left-2 w-2 h-2 rounded-full bg-teal-400" />
                                                <h4 className="text-[10px] font-extrabold text-teal-400 uppercase tracking-widest">Day 1: Intervention</h4>
                                                <p className="text-[11px] text-slate-300 font-bold leading-normal mt-1">Apply target treatment according to expert dosages.</p>
                                            </div>
                                            <div className="relative pl-6 md:pl-4 border-l border-slate-200 dark:border-white/10 md:border-l-0 md:border-t md:pt-4 md:mt-2">
                                                <div className="absolute -left-[5px] top-1 md:-top-[5px] md:left-2 w-2 h-2 rounded-full bg-blue-400" />
                                                <h4 className="text-[10px] font-extrabold text-blue-400 uppercase tracking-widest">Day 3: Arrest</h4>
                                                <p className="text-[11px] text-slate-300 font-bold leading-normal mt-1">Lesions halt expansion. Inspect leaf boundaries.</p>
                                            </div>
                                            <div className="relative pl-6 md:pl-4 border-l border-slate-200 dark:border-white/10 md:border-l-0 md:border-t md:pt-4 md:mt-2">
                                                <div className="absolute -left-[5px] top-1 md:-top-[5px] md:left-2 w-2 h-2 rounded-full bg-purple-400" />
                                                <h4 className="text-[10px] font-extrabold text-purple-400 uppercase tracking-widest">Day 7: Re-Scan</h4>
                                                <p className="text-[11px] text-slate-300 font-bold leading-normal mt-1">Execute secondary scan check. Confirm foliar regeneration.</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Expert Clinical Commentary footer */}
                            <div className="bg-slate-50 dark:bg-[#050C16] border border-slate-200 dark:border-white/10 p-5 md:p-6 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-20 sm:mb-6">
                                <div className="flex gap-4 items-start flex-1">
                                    <div className="p-3 bg-slate-100 dark:bg-[#0A1628] rounded-2xl border border-slate-100 dark:border-white/5 text-teal-400 shrink-0">
                                        <Activity className="w-5 h-5 animate-pulse" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-[10px] font-bold tracking-wider uppercase text-slate-400 font-extrabold font-bold">Expert Agronomist Note</h4>
                                        <p className="text-sm font-semibold leading-relaxed text-slate-800 dark:text-white italic">
                                            "{txResult.instructions}"
                                        </p>
                                    </div>
                                </div>

                                <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full md:w-auto">
                                    <button
                                        type="button"
                                        onClick={() => isSpeaking ? stopSpeaking() : speakAdvice(`${txResult.diseaseName}. ${txResult.instructions}`)}
                                        className={clsx(
                                            "py-2.5 sm:py-3 px-4 sm:px-5 rounded-xl text-[9px] sm:text-[10px] uppercase font-bold tracking-wide sm:tracking-widest flex items-center justify-center gap-2 border transition-all",
                                            isSpeaking 
                                                ? "bg-rose-500 border-rose-400 text-white animate-pulse" 
                                                : "bg-slate-100 dark:bg-[#0A1628]/60 border-slate-200 dark:border-white/10 text-slate-300 hover:bg-slate-800/40"
                                        )}
                                    >
                                        {isSpeaking ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                                        {isSpeaking ? "Pause" : "Listen"}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="py-2.5 sm:py-3 px-4 sm:px-5 rounded-xl text-[9px] sm:text-[10px] uppercase font-bold tracking-wide sm:tracking-widest bg-white/5 hover:bg-white/10 border border-slate-200 dark:border-white/10 text-white transition-all flex items-center gap-2 justify-center"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        <span className="hidden sm:inline">Scan Another</span>
                                        <span className="sm:hidden">Scan</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // ==================== IDLE STATE: Upload prompt ====================
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex-1 flex flex-col items-center justify-center gap-6 bg-white/60 dark:bg-slate-900/20 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-3xl p-8 relative overflow-hidden"
                        >
                            <div className="absolute -top-32 -right-32 w-80 h-80 bg-teal-500/5 rounded-full blur-[80px] pointer-events-none" />
                            <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />

                            {/* Weather strip — useful context, not decorative */}
                            {liveWeather && (
                                <div className="flex items-center gap-3 bg-slate-50 dark:bg-[#050C16] border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-2.5 text-xs">
                                    <CloudSun className="w-4 h-4 text-sky-400 shrink-0" />
                                    <span className="text-slate-600 dark:text-slate-300 font-medium">
                                        {liveWeather.temp}°C · {liveWeather.condition} · Humidity {liveWeather.humidity}%
                                    </span>
                                    {liveWeather.humidity > 75 && (
                                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                                            ⚠ High Humidity — Disease Risk
                                        </span>
                                    )}
                                </div>
                            )}

                            <div className="text-center space-y-3 relative z-10">
                                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-teal-500/20 to-emerald-500/10 border border-teal-500/30 rounded-3xl flex items-center justify-center">
                                    <ScanLine className="w-9 h-9 text-teal-400" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white">AI Plant Doctor</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                                    Upload a photo of your crop leaf. The AI will instantly detect the plant species, identify any disease, and give you a full treatment plan.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg relative z-10">
                                {[
                                    { icon: UploadCloud, label: 'Upload Leaf Photo', color: 'text-teal-400' },
                                    { icon: Sprout,      label: 'AI Detects Crop & Disease', color: 'text-emerald-400' },
                                    { icon: ShieldCheck, label: 'Get Treatment Plan', color: 'text-violet-400' },
                                ].map(({ icon: Icon, label, color }, i) => (
                                    <div key={i} className="bg-slate-50 dark:bg-[#050C16] border border-slate-100 dark:border-white/5 rounded-2xl p-4 flex flex-col items-center gap-2 text-center">
                                        <Icon className={clsx('w-5 h-5', color)} />
                                        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 leading-tight">{label}</span>
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

// ── Explain Result AI Assistant Component ──
const ExplainResultAssistant = ({ result, language }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = React.useRef(null);

    const langName = language === 'TA' ? 'Tamil' : language === 'HI' ? 'Hindi' : 'English';

    const placeholder = language === 'TA'
        ? 'இந்த முடிவில் உள்ள வார்த்தைகளை கேளுங்கள்...'
        : language === 'HI'
            ? 'इस रिपोर्ट के बारे में कोई भी शब्द पूछें...'
            : 'Ask about any word or term in this result...';

    const greeting = language === 'TA'
        ? `வணக்கம்! இந்த பயிர் பகுப்பாய்வு முடிவில் உள்ள எந்த வார்த்தையையும் எளிய மொழியில் விளக்குகிறேன். கேளுங்கள்!`
        : language === 'HI'
            ? `नमस्ते! इस फसल विश्लेषण रिपोर्ट में किसी भी शब्द, रोग नाम, उपाय, या सिफारिश के बारे में सरल भाषा में समझाता हूँ।`
            : `Hi! I can explain any word, disease name, confidence score, fertilizer, or recommendation from this analysis in simple language. What would you like to know?`;

    const quickQuestions = language === 'TA'
        ? [
            `"${result?.diseaseName}" என்றால் என்ன?`,
            'நம்பிக்கை மதிப்பெண் என்றால் என்ன?',
            'கரிம தீர்வு எப்படி பயன்படுத்துவது?',
            'உரம் எந்த அளவு போட வேண்டும்?',
        ]
        : language === 'HI'
            ? [
                `"${result?.diseaseName}" का मतलब क्या है?`,
                'कॉन्फिडेंस स्कोर क्या होता है?',
                'जैविक उपाय कैसे उपयोग करें?',
                'उर्वरक की मात्रा कितनी डालें?',
            ]
            : [
                `What is "${result?.diseaseName}"?`,
                'What does confidence score mean?',
                'How do I use organic solutions?',
                `What dosage is safe for ${result?.fertilizer}?`,
            ];

    React.useEffect(() => {
        setMessages([{ role: 'bot', text: greeting }]);
    }, [language]);

    React.useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const ask = async (question) => {
        if (!question.trim() || loading) return;
        const userMsg = { role: 'user', text: question };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        const context = result ? {
            diseaseName: result.diseaseName,
            confidence: result.confidence,
            cureMethods: result.cureMethods,
            organicSolutions: result.organicSolutions,
            fertilizerSuggestions: result.fertilizerSuggestions,
            irrigationAdvice: result.irrigationAdvice,
            yieldProtectionAdvice: result.yieldProtectionAdvice,
        } : {};

        try {
            const res = await apiClient.post('/assistant/explain-result', {
                question,
                language: language === 'TA' ? 'TA' : language === 'HI' ? 'HI' : 'EN',
                context,
            });
            setMessages(prev => [...prev, { role: 'bot', text: res.data.reply }]);
        } catch {
            const fallback = language === 'TA'
                ? 'மன்னிக்கவும், இப்போது பதில் சொல்ல முடியவில்லை.'
                : language === 'HI'
                    ? 'माफ़ करें, अभी उत्तर नहीं दे पा रहा।'
                    : 'Sorry, could not get an answer right now. Please try again.';
            setMessages(prev => [...prev, { role: 'bot', text: fallback }]);
        } finally {
            setLoading(false);
        }
    };

    const title = language === 'TA' ? 'முடிவை விளக்கு' : language === 'HI' ? 'परिणाम समझें' : 'Explain Result';
    const askLabel = language === 'TA' ? 'கேளுங்கள்' : language === 'HI' ? 'पूछें' : 'Ask';

    return (
        <div className="bg-slate-50 dark:bg-[#050C16] border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-lg">
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-200 dark:border-white/5 bg-white/60 dark:bg-black/20">
                <div className="p-1.5 bg-teal-500/10 rounded-lg">
                    <HelpCircle className="w-4 h-4 text-teal-400" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white leading-none">{title}</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                        {language === 'TA' ? 'இந்த முடிவில் உள்ள எந்த வார்த்தையையும் கேளுங்கள்'
                            : language === 'HI' ? 'रिपोर्ट के किसी भी शब्द के बारे में पूछें'
                            : 'Ask about any term or recommendation in simple language'}
                    </p>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                    <span className="text-[9px] font-bold text-teal-400 uppercase tracking-widest">AI</span>
                </div>
            </div>

            {/* Quick questions */}
            <div className="flex flex-wrap gap-2 px-5 pt-3 pb-1">
                {quickQuestions.map((q, i) => (
                    <button key={i} onClick={() => ask(q)} disabled={loading}
                        className="text-[10px] font-semibold px-3 py-1.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full text-slate-600 dark:text-slate-300 hover:border-teal-500/40 hover:text-teal-600 dark:hover:text-teal-400 transition-all disabled:opacity-50">
                        {q}
                    </button>
                ))}
            </div>

            {/* Messages */}
            <div className="px-5 py-3 space-y-3 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-white text-[10px] font-bold ${
                            msg.role === 'user' ? 'bg-teal-500' : 'bg-slate-700 dark:bg-slate-800'
                        }`}>
                            {msg.role === 'user' ? '👤' : '🌾'}
                        </div>
                        <div className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                            msg.role === 'user'
                                ? 'bg-teal-500 text-white rounded-tr-sm'
                                : 'bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-white/5 text-slate-700 dark:text-slate-200 rounded-tl-sm'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px]">🌾</div>
                        <div className="bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-white/5 rounded-2xl rounded-tl-sm px-4 py-2.5 flex gap-1.5 items-center">
                            {[0,1,2].map(i => (
                                <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-teal-400"
                                    animate={{ y: [0, -4, 0] }} transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }} />
                            ))}
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-5 py-3 border-t border-slate-200 dark:border-white/5 flex gap-2">
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && ask(input)}
                    placeholder={placeholder}
                    disabled={loading}
                    className="flex-1 bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-teal-500 transition-all"
                />
                <button onClick={() => ask(input)} disabled={loading || !input.trim()}
                    className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all shrink-0">
                    {askLabel}
                </button>
            </div>
        </div>
    );
};

// Nutrient threshold calculator
const getNutrientGuidance = (n, p, k, diseaseName) => {
    const isHealthy = diseaseName.toLowerCase().includes('healthy');
    if (isHealthy) {
        return "✓ Soil Nutrient Balance: N-P-K concentrations match baseline growth indicators. Maintain organic compost dressing and normal irrigation cycles.";
    }

    if (n > 120) {
        return `⚠️ CRITICAL: Nitrogen (N) is excessively high (${n} kg/ha). STOP all Urea/Nitrogen applications for 10 days immediately. Pathogens and fungi thrive inside nitrogen-heavy vegetative growth. Action: Drain excess water from paddy ridges.`;
    }

    if (p < 40) {
        return `💡 Phosphorus Deficient: P level is low (${p} kg/ha). Drench with rock phosphate or Single Super Phosphate (SSP) to stimulate root defense layers.`;
    }

    if (k < 50) {
        return `💡 Potash Deficient: K level is low (${k} kg/ha). Apply Muriate of Potash (MOP @ 20kg/acre) to build structural cell walls against fungal spore attacks.`;
    }

    return "✓ Soil Metrics Normal: Nitrogen, Phosphorus, and Potash are within normal range. Proceed with the targeted treatments listed below.";
};

export default ImageUploadForm;
