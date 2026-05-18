import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const GlobalStateContext = createContext();

export const GlobalStateProvider = ({ children }) => {
    const location = useLocation();
    const [historyData, setHistoryData] = useState([]);
    const [simulatorHistory, setSimulatorHistory] = useState([]);
    const [growthHistory, setGrowthHistory] = useState([]);
    const [spreadHistory, setSpreadHistory] = useState([]);
    const [stats, setStats] = useState({ total: 0, healthy: 0, issues: 0 });
    const [chartData, setChartData] = useState([]);
    const [cropGroups, setCropGroups] = useState({});
    const [loading, setLoading] = useState(true);

    const refreshGlobalData = async () => {
        console.log(`[Global Sync] Path changed to: ${location.pathname}. Syncing data...`);
        try {
            const [historyRes, groupsRes, simRes, growthRes, spreadRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/farmer/history`),
                axios.get(`${API_BASE_URL}/api/farmer/crop-groups`),
                axios.get(`${API_BASE_URL}/api/farmer/simulator/history`),
                axios.get(`${API_BASE_URL}/api/farmer/future-growth/history`),
                axios.get(`${API_BASE_URL}/api/farmer/spread-risk/history`)
            ]);

            const hData = historyRes.data.data || historyRes.data;
            setHistoryData(hData.history || []);
            setStats(hData.stats || { total: 0, healthy: 0, issues: 0 });
            setChartData(hData.chartData || []);
            
            setCropGroups(groupsRes.data.data || groupsRes.data || {});
            
            setSimulatorHistory((simRes.data.data || simRes.data).history || []);
            setGrowthHistory((growthRes.data.data || growthRes.data).history || []);
            setSpreadHistory((spreadRes.data.data || spreadRes.data).history || []);

        } catch (err) {
            console.warn("Global sync failed:", err.message);
        } finally {
            setLoading(false);
        }
    };

    // Trigger on mount and every location change
    useEffect(() => {
        refreshGlobalData();
    }, [location.pathname]);

    return (
        <GlobalStateContext.Provider value={{
            historyData,
            simulatorHistory,
            growthHistory,
            spreadHistory,
            stats,
            chartData,
            cropGroups,
            loading,
            refreshGlobalData
        }}>
            {children}
        </GlobalStateContext.Provider>
    );
};

export const useGlobalState = () => useContext(GlobalStateContext);
