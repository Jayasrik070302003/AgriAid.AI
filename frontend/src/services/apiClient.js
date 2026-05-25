import axios from 'axios';
import { supabase } from './supabaseClient';
import { API_BASE_URL } from '../config';

const apiClient = axios.create({ baseURL: API_BASE_URL });

// Attach Supabase JWT to every request if available
apiClient.interceptors.request.use(async (config) => {
    if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
            config.headers.Authorization = `Bearer ${session.access_token}`;
        }
    }
    return config;
});

export default apiClient;
