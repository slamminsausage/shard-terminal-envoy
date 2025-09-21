import React from 'react';
import MainframeShell from '@/components/MainframeShell';
import AccessCodeEntry from '@/components/auth/AccessCodeEntry';
import { useCampaign } from '@/contexts/CampaignContext';

const Index = () => {
  const { isAuthenticated, checkAuthentication } = useCampaign();

  const handleAuthSuccess = () => {
    // Force re-check of authentication status
    checkAuthentication();
    // Trigger a re-render by updating the campaign context
    window.location.reload();
  };

  if (!isAuthenticated) {
    return <AccessCodeEntry onSuccess={handleAuthSuccess} />;
  }

  return <MainframeShell />;
};

export default Index;
