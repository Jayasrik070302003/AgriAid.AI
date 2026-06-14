import { useState, useCallback } from 'react';
import apiClient from '../services/apiClient';

const GPS_ERRORS = {
    1: 'Location permission denied. Please enter manually.',
    2: 'Location unavailable. Please enter manually.',
    3: 'Location request timed out. Please enter manually.',
};

const ipFallback = async () => {
    console.log('[GPS] IP fallback started');
    const res = await fetch('https://ipwho.is/');
    if (!res.ok) throw new Error('ipwho.is request failed');
    const data = await res.json();
    if (!data.success) throw new Error('ipwho.is returned failure');
    console.log('[GPS] IP fallback success', data);
    return {
        lat: data.latitude,
        lng: data.longitude,
        city: data.city || '',
        district: data.region || '',
        state: data.region || '',
        country: data.country || '',
        formatted: `${data.city}, ${data.region}, ${data.country}`,
    };
};

const useGPS = () => {
    const [location, setLocation] = useState({
        lat: null, lng: null, city: '', district: '', state: '', country: '', formatted: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const detect = useCallback(() => {
        if (!navigator.geolocation) {
            setError('Geolocation not supported by your browser.');
            return;
        }
        setLoading(true);
        setError(null);
        console.log('[GPS] GPS started');

        navigator.geolocation.getCurrentPosition(
            async ({ coords }) => {
                console.log('[GPS] GPS success', coords.latitude, coords.longitude);
                try {
                    const res = await apiClient.get(`/reverse-geocode?lat=${coords.latitude}&lng=${coords.longitude}`);
                    const d = res.data.data;
                    setLocation({
                        lat: coords.latitude,
                        lng: coords.longitude,
                        city: d.city,
                        district: d.district,
                        state: d.state,
                        country: d.country,
                        formatted: d.formatted
                    });
                } catch {
                    setError('Failed to fetch location details. Please enter manually.');
                } finally {
                    setLoading(false);
                }
            },
            async (err) => {
                console.warn('[GPS] GPS failed — code:', err.code, err.message);
                try {
                    const fallbackLoc = await ipFallback();
                    setLocation(fallbackLoc);
                } catch (ipErr) {
                    console.error('[GPS] IP fallback failed', ipErr);
                    setError(GPS_ERRORS[err.code] || 'Could not detect location. Please enter manually.');
                } finally {
                    setLoading(false);
                }
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    }, []);

    const reset = useCallback(() => {
        setLocation({ lat: null, lng: null, city: '', district: '', state: '', country: '', formatted: '' });
        setError(null);
    }, []);

    return { location, loading, error, detect, reset };
};

export default useGPS;
