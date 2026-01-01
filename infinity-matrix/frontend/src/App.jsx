
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import LandingPage from '@/pages/LandingPage';
import VisionCortexPage from '@/pages/VisionCortexPage';
import PricingPage from '@/pages/PricingPage';
import AuthPage from '@/pages/AuthPage';
import QuantumXPage from '@/pages/QuantumXPage';
import IntelligencePage from '@/pages/IntelligencePage';
import FuturePage from '@/pages/FuturePage';
import TechnologyPage from '@/pages/TechnologyPage';
import AdminPage from '@/pages/AdminPage';
import HostingerPage from '@/pages/HostingerPage';
import CloudAIPage from '@/pages/CloudAIPage';
import { Toaster } from '@/components/ui/toaster';

function App() {
  const handleLogin = () => {
    // Refresh state logic if needed
  };

  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/vision-cortex" element={<VisionCortexPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/quantum-x-builder" element={<QuantumXPage />} />
          <Route path="/intelligence" element={<IntelligencePage />} />
          <Route path="/future" element={<FuturePage />} />
          <Route path="/technology" element={<TechnologyPage />} />
          <Route path="/hostinger" element={<HostingerPage />} />
          <Route path="/cloud-ai" element={<CloudAIPage />} />
        </Route>
        
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/auth" element={<AuthPage onLogin={handleLogin} />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
