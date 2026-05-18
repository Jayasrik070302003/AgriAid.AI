import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './SharedComponents/Navbar';
import ImageUploadForm from './FarmerModule/ImageUploadForm';
import History from './FarmerModule/History';
import Profile from './FarmerModule/Profile';
import WeatherAlerts from './FarmerModule/WeatherAlerts';
import Settings from './FarmerModule/Settings';
import HelpSupport from './FarmerModule/HelpSupport';
import LoginPage from './AuthModule/LoginPage';
import SignupPage from './AuthModule/SignupPage';
import ProtectedRoute from './AuthModule/ProtectedRoute';
import { LanguageProvider, useLanguage } from './Context/LanguageContext';
import CropCalendar from './FarmerModule/Tools/CropCalendar';
import FertilizerCalculator from './FarmerModule/Tools/FertilizerCalculator';
import WeatherForecastTool from './FarmerModule/Tools/WeatherForecastTool';
import MarketPrices from './FarmerModule/Tools/MarketPrices';
import SoilHealthCheck from './FarmerModule/Tools/SoilHealthCheck';
import ImpactSimulator from './FarmerModule/Tools/ImpactSimulator';
import FutureGrowthSimulator from './FarmerModule/Tools/FutureGrowthSimulator';
import DiseaseSpreadSimulator from './FarmerModule/Tools/DiseaseSpreadSimulator';
import SmartFarmingTimeline from './FarmerModule/Tools/SmartFarmingTimeline';
import ResearchViewer from './FarmerModule/Research/ResearchViewer';

import FarmingChatBot from './FarmerModule/FarmingChatBot';

function AppContent() {
  const { t } = useLanguage();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 farm-gradient-bg relative selection:bg-farm-green/30 dark:bg-slate-900 dark:selection:bg-emerald-500/30">
      {/* Background Container for Blobs (Fixed to prevent scroll issues) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-200/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] bg-emerald-200/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-teal-200/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      {location.pathname !== '/login' && location.pathname !== '/register' && <Navbar />}

      <main className={`relative z-10 ${location.pathname === '/login' || location.pathname === '/register' ? '' : 'pt-3 pb-8 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-[1920px] mx-auto'}`}>
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <>
                <ImageUploadForm />
              </>
            </ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<SignupPage />} />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/alerts" element={
            <ProtectedRoute>
              <WeatherAlerts />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/help" element={
            <ProtectedRoute>
              <HelpSupport />
            </ProtectedRoute>
          } />
          <Route path="/tools/crop-calendar" element={
            <ProtectedRoute>
              <CropCalendar />
            </ProtectedRoute>
          } />
          <Route path="/tools/fertilizer-calc" element={
            <ProtectedRoute>
              <FertilizerCalculator />
            </ProtectedRoute>
          } />
          <Route path="/tools/weather-forecast" element={
            <ProtectedRoute>
              <WeatherForecastTool />
            </ProtectedRoute>
          } />
          <Route path="/tools/market-prices" element={
            <ProtectedRoute>
              <MarketPrices />
            </ProtectedRoute>
          } />
          <Route path="/tools/soil-health" element={
            <ProtectedRoute>
              <SoilHealthCheck />
            </ProtectedRoute>
          } />
          <Route path="/tools/impact-simulator" element={
            <ProtectedRoute>
              <ImpactSimulator />
            </ProtectedRoute>
          } />
          <Route path="/chat" element={
            <ProtectedRoute>
              <FarmingChatBot />
            </ProtectedRoute>
          } />
          <Route path="/tools/future-growth" element={
            <ProtectedRoute>
              <FutureGrowthSimulator />
            </ProtectedRoute>
          } />
          <Route path="/tools/disease-spread" element={
            <ProtectedRoute>
              <DiseaseSpreadSimulator />
            </ProtectedRoute>
          } />
          <Route path="/tools/farming-timeline" element={
            <ProtectedRoute>
              <SmartFarmingTimeline />
            </ProtectedRoute>
          } />
          <Route path="/research/:id" element={
            <ProtectedRoute>
              <ResearchViewer />
            </ProtectedRoute>
          } />
        </Routes>
      </main>

      {location.pathname !== '/login' && location.pathname !== '/register' && (
        <footer className="relative md:fixed bottom-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-t border-gray-100 dark:bg-slate-900/70 dark:border-slate-800">
          <div className="max-w-[1920px] mx-auto py-4 px-4 text-center">
            <p className="text-sm text-gray-400 font-bold tracking-tight dark:text-slate-500">{t('footer')}</p>
          </div>
        </footer>
      )}
    </div>
  );
}

import { AuthProvider } from './Context/AuthContext';
import { ThemeProvider } from './Context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import { GlobalStateProvider } from './Context/GlobalStateContext';

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <GlobalStateProvider>
            <AppContent />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#ffffff',
                  color: '#1e293b',
                  borderRadius: '16px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  border: '1px solid #f1f5f9',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '600'
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                }
              }}
            />
          </GlobalStateProvider>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
