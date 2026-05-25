import { useState, useCallback } from 'react';
import apiClient from '../services/apiClient';

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

        navigator.geolocation.getCurrentPosition(
            async ({ coords }) => {
                try {
                    const res = await apiClient.get(`/api/farmer/reverse-geocode?lat=${coords.latitude}&lng=${coords.longitude}`);
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
                    setError('Failed to fetch location. Please enter manually.');
                } finally {
                    setLoading(false);
                }
            },
            (err) => {
                setLoading(false);
                if (err.code === 1) setError('Location permission denied. Please enter manually.');
                else if (err.code === 2) setError('Location unavailable. Please enter manually.');
                else setError('Could not detect location. Please enter manually.');
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    }, []);

    const reset = useCallback(() => {
        setLocation({ lat: null, lng: null, city: '', district: '', state: '', country: '', formatted: '' });
        setError(null);
    }, []);

    return { location, loading, error, detect, reset };
};

export default useGPS;
