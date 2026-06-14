// LocationContext.jsx — Provides GPS location state app-wide.
// NO auto-detect on mount. User must click "Use My Location".
import React, { createContext, useContext } from 'react';
import useGPS from '../hooks/useGPS';
import { DISTRICT_COORDS, STATES_DISTRICTS } from '../services/locationService';

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
    const gps = useGPS();
    return (
        <LocationContext.Provider value={{ ...gps, DISTRICT_COORDS, STATES_DISTRICTS }}>
            {children}
        </LocationContext.Provider>
    );
}

export function useLocationContext() {
    const ctx = useContext(LocationContext);
    if (!ctx) throw new Error('useLocationContext must be used inside <LocationProvider>');
    return ctx;
}

export default LocationContext;
