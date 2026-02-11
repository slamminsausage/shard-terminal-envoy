import React from 'react';
import MainframeShell from '@/components/MainframeShell';
import AuthScreen from '@/components/auth/AuthScreen';
import { useCampaign } from '@/contexts/CampaignContext';

const Index = () => {
  const { isAuthenticated } = useCampaign();

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return <MainframeShell />;
};

export default Index;
