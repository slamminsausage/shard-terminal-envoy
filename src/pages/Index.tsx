import React, { useState } from 'react';
import MainframeShell from '@/components/MainframeShell';
import AuthScreen from '@/components/auth/AuthScreen';
import SiteBootScreen, { hasSiteBooted } from '@/components/SiteBootScreen';
import { useCampaign } from '@/contexts/CampaignContext';

const Index = () => {
  const { isAuthenticated } = useCampaign();
  // Skip boot screen if it already played this browser session
  const [booted, setBooted] = useState(() => hasSiteBooted());

  if (!booted) {
    return <SiteBootScreen onComplete={() => setBooted(true)} />;
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return <MainframeShell />;
};

export default Index;
