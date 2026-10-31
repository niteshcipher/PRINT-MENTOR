import React, { useEffect } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useGameStore } from './store/useGameStore';

// Top-level Pages
import LandingPage from './pages/LandingPage';
import OnboardingPage from './pages/OnboardingPage';
import Styleguide from './pages/Styleguide';
import DashboardShell from './pages/DashboardShell';
import PixelTownMap from './components/pixel/PixelTownMap';

// Nested Dashboard Tabs
import OverviewTab from './components/tabs/OverviewTab';
import BudgetTab from './components/tabs/BudgetTab';
import GoalsTab from './components/tabs/GoalsTab';
import CoachTab from './components/tabs/CoachTab';
import GamesTab from './components/tabs/GamesTab';
import LearnTab from './components/tabs/LearnTab';
import ScamShieldTab from './components/tabs/ScamShieldTab';
import NewsTab from './components/tabs/NewsTab';

export default function App() {
  const { fetchProfile, fetchCoins, checkHealth } = useGameStore();

  useEffect(() => {
    checkHealth();
    fetchProfile();
    fetchCoins();
  }, []);

  return (
    <div className="scanlines" style={{ minHeight: '100vh' }}>
      <Routes>
        {/* Part 5: Landing Page at route / */}
        <Route path="/" element={<LandingPage />} />

        {/* Part 6: Onboarding and Personality Quiz */}
        <Route path="/onboarding" element={<OnboardingPage />} />

        {/* Legacy redirect to Help in Dashboard */}
        <Route path="/styleguide" element={<Navigate to="/dashboard/help" replace />} />

        {/* Part 7: Dashboard Shell with Normal Dashboard as Default + Game Mode Map Option */}
        <Route path="/dashboard" element={<DashboardShell />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="map" element={<PixelTownMap />} />
          <Route path="overview" element={<OverviewTab />} />
          <Route path="budget" element={<BudgetTab />} />
          <Route path="goals" element={<GoalsTab />} />
          <Route path="coach" element={<CoachTab />} />
          <Route path="games" element={<GamesTab />} />
          <Route path="learn" element={<LearnTab />} />
          <Route path="scam" element={<ScamShieldTab />} />
          <Route path="news" element={<NewsTab />} />
          <Route path="help" element={<Styleguide />} />
        </Route>

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
