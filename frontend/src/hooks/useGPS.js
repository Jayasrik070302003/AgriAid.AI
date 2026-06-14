// useGPS.js — Browser GPS + manual district fallback. No IP/domain detection.
import { useState, useCallback } from 'react';
import { DISTRICT_COORDS, GPS_ERRORS } from '../services/locationService';

export { DISTRICT_COORDS } from '../services/locationService';
export { STATES_DISTRICTS } from '../services/locationService';

const EMPTY = { lat: null, lon: null, accuracy: null, district: '', state: '', source: '' };

const useGPS = () => {
    const [location, setLocation]       = useState(EMPTY);
    const [loading, setLoading]         = useState(false);
    const [error, setError]             = useState(null);
    const [needsManual, setNeedsManual] = useState(false);

    // ── GPS ──────────────────────────────────────────────────────────────────
    const detect = useCallback(() => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            setNeedsManual(true);
            return;
        }
        setLoading(true);
        setError(null);
        setNeedsManual(false);
        console.log('[GPS] Request Started');

        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                const { latitude: lat, longitude: lon, accuracy } = coords;
                console.log('[GPS] Success', { lat, lon, accuracy });
                setLocation({ lat, lon, accuracy, district: '', state: '', source: 'gps' });
                setLoading(false);
            },
            (err) => {
                const msg = GPS_ERRORS[err.code] || 'Unable to access GPS. Please select your district.';
                console.warn('[GPS] Failed', { code: err.code, message: err.message });
                setLoading(false);
                setError(msg);
                setNeedsManual(true);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    }, []);

    // ── Manual district fallback ─────────────────────────────────────────────
    const selectDistrict = useCallback((district, state) => {
        const coords = DISTRICT_COORDS[district];
        if (!coords) {
            setError(`Coordinates not found for "${district}".`);
            return;
        }
        console.log('[FALLBACK] District Selected', { district, state, ...coords });
        setLocation({ lat: coords.lat, lon: coords.lon, accuracy: null, district, state: state || '', source: 'manual' });
        setError(null);
        setNeedsManual(false);
    }, []);

    const reset = useCallback(() => {
        setLocation(EMPTY);
        setError(null);
        setNeedsManual(false);
    }, []);

    return { location, loading, error, needsManual, detect, selectDistrict, reset };
};

export default useGPS;
