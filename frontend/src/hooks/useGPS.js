import { useState, useCallback } from 'react';

// ── District → coordinates fallback map (Tamil Nadu focus) ──────────────────
export const DISTRICT_COORDS = {
    'Ariyalur':       { lat: 11.140, lon: 79.078 },
    'Chengalpattu':   { lat: 12.692, lon: 79.981 },
    'Chennai':        { lat: 13.082, lon: 80.270 },
    'Coimbatore':     { lat: 11.016, lon: 76.955 },
    'Cuddalore':      { lat: 11.748, lon: 79.771 },
    'Dharmapuri':     { lat: 12.128, lon: 78.158 },
    'Dindigul':       { lat: 10.363, lon: 77.973 },
    'Erode':          { lat: 11.341, lon: 77.717 },
    'Kallakurichi':   { lat: 11.738, lon: 78.961 },
    'Kancheepuram':   { lat: 12.831, lon: 79.705 },
    'Kanyakumari':    { lat: 8.088,  lon: 77.552 },
    'Karur':          { lat: 10.957, lon: 78.080 },
    'Krishnagiri':    { lat: 12.519, lon: 78.213 },
    'Madurai':        { lat: 9.925,  lon: 78.119 },
    'Mayiladuthurai': { lat: 11.103, lon: 79.652 },
    'Nagapattinam':   { lat: 10.765, lon: 79.843 },
    'Namakkal':       { lat: 11.219, lon: 78.167 },
    'Nilgiris':       { lat: 11.490, lon: 76.734 },
    'Perambalur':     { lat: 11.233, lon: 78.880 },
    'Pudukkottai':    { lat: 10.381, lon: 78.820 },
    'Ramanathapuram': { lat: 9.371,  lon: 78.830 },
    'Ranipet':        { lat: 12.922, lon: 79.333 },
    'Salem':          { lat: 11.664, lon: 78.146 },
    'Sivaganga':      { lat: 9.847,  lon: 78.481 },
    'Tenkasi':        { lat: 8.959,  lon: 77.315 },
    'Thanjavur':      { lat: 10.786, lon: 79.137 },
    'Theni':          { lat: 10.010, lon: 77.476 },
    'Thoothukudi':    { lat: 8.791,  lon: 78.133 },
    'Tiruchirappalli':{ lat: 10.790, lon: 78.700 },
    'Tirunelveli':    { lat: 8.711,  lon: 77.757 },
    'Tirupathur':     { lat: 12.493, lon: 78.573 },
    'Tiruppur':       { lat: 11.107, lon: 77.340 },
    'Tiruvallur':     { lat: 13.143, lon: 79.907 },
    'Tiruvannamalai': { lat: 12.226, lon: 79.074 },
    'Tiruvarur':      { lat: 10.773, lon: 79.637 },
    'Vellore':        { lat: 12.916, lon: 79.132 },
    'Viluppuram':     { lat: 11.940, lon: 79.486 },
    'Virudhunagar':   { lat: 9.581,  lon: 77.952 },
    // Other states — key cities
    'Bengaluru':      { lat: 12.971, lon: 77.594 },
    'Mysuru':         { lat: 12.295, lon: 76.639 },
    'Hyderabad':      { lat: 17.385, lon: 78.486 },
    'Pune':           { lat: 18.520, lon: 73.856 },
    'Mumbai':         { lat: 19.076, lon: 72.877 },
    'Delhi':          { lat: 28.613, lon: 77.209 },
    'Kolkata':        { lat: 22.572, lon: 88.363 },
    'Ahmedabad':      { lat: 23.022, lon: 72.571 },
    'Jaipur':         { lat: 26.912, lon: 75.787 },
    'Lucknow':        { lat: 26.846, lon: 80.946 },
};

// ── Strip "District" / "district" suffix and trim ───────────────────────────
function cleanDistrict(raw = '') {
    return raw.replace(/\s*district\s*/gi, '').trim();
}

// ── Nominatim reverse geocode — free, no API key ────────────────────────────
async function nominatimReverse(lat, lon) {
    console.log('[Nominatim] Reverse geocoding started', { lat, lon });
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&accept-language=en`;
    const res = await fetch(url, {
        headers: { 'Accept-Language': 'en', 'User-Agent': 'AgriAid.AI/1.0' }
    });
    if (!res.ok) throw new Error(`Nominatim ${res.status}`);
    const data = await res.json();
    const addr = data.address || {};

    const city     = addr.city || addr.town || addr.village || addr.suburb || '';
    const district = cleanDistrict(addr.county || addr.state_district || addr.city || city);
    const state    = addr.state || '';
    const country  = addr.country || '';

    console.log('[Nominatim] Reverse geocoding success', { city, district, state, country });
    return { city, district, state, country, formatted: data.display_name || '' };
}

// ── Main hook ────────────────────────────────────────────────────────────────
const useGPS = () => {
    const [location, setLocation] = useState({
        lat: null, lon: null, city: '', district: '', state: '', country: '', formatted: '', source: ''
    });
    const [loading, setLoading]       = useState(false);
    const [error, setError]           = useState(null);
    const [needsManual, setNeedsManual] = useState(false);

    // ── GPS attempt ──────────────────────────────────────────────────────────
    const detect = useCallback(() => {
        if (!navigator.geolocation) {
            setError('Geolocation not supported.');
            setNeedsManual(true);
            return;
        }
        setLoading(true);
        setError(null);
        setNeedsManual(false);
        console.log('[GPS] Request Started');

        navigator.geolocation.getCurrentPosition(
            async ({ coords }) => {
                const { latitude: lat, longitude: lon, accuracy } = coords;
                console.log('[GPS] Success', { lat, lon, accuracy });
                try {
                    const geo = await nominatimReverse(lat, lon);
                    setLocation({ lat, lon, ...geo, source: 'gps' });
                } catch (geoErr) {
                    console.warn('[Nominatim] Failed', geoErr.message);
                    // Still set coords — weather can use them even without place names
                    setLocation({ lat, lon, city: '', district: '', state: '', country: '', formatted: '', source: 'gps-coords-only' });
                } finally {
                    setLoading(false);
                }
            },
            (err) => {
                console.warn('[GPS] Failed — code:', err.code, err.message);
                setLoading(false);
                setNeedsManual(true);
                setError('Unable to access GPS location. Please select your district.');
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    }, []);

    // ── Manual district selection fallback ───────────────────────────────────
    const selectDistrict = useCallback((district, state) => {
        const coords = DISTRICT_COORDS[district];
        if (!coords) {
            console.warn('[Fallback] No coords for district:', district);
            setError(`Coordinates not found for "${district}". Please try another.`);
            return;
        }
        console.log('[Fallback] Manual District Selected', { district, state, ...coords });
        setLocation({
            lat: coords.lat, lon: coords.lon,
            city: district, district, state: state || '',
            country: 'India', formatted: `${district}, ${state || 'India'}`,
            source: 'manual'
        });
        setError(null);
        setNeedsManual(false);
    }, []);

    const reset = useCallback(() => {
        setLocation({ lat: null, lon: null, city: '', district: '', state: '', country: '', formatted: '', source: '' });
        setError(null);
        setNeedsManual(false);
    }, []);

    return { location, loading, error, needsManual, detect, selectDistrict, reset };
};

export default useGPS;
