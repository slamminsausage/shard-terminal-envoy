import React, { useState } from 'react';
import MainframeShell from '@/components/MainframeShell';
import AuthScreen from '@/components/auth/AuthScreen';
import SiteBootScreen, { hasSiteBooted } from '@/components/SiteBootScreen';
import { useCampaign } from '@/contexts/CampaignContext';
import { Navigate, useLocation } from 'react-router-dom';

const Index = () => {
  const { isAuthenticated } = useCampaign();
  const location = useLocation();
  // Skip boot screen if it already played this browser session
  const [booted, setBooted] = useState(() => hasSiteBooted());

  if (!booted) {
    return <SiteBootScreen onComplete={() => setBooted(true)} />;
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  if (location.pathname === '/') {
    const lastTab = localStorage.getItem('mainframe_active_tab') || 'mission';
    return <Navigate to={`/app/${lastTab}`} replace />;
  }

  return <MainframeShell />;
};

export default Index;
