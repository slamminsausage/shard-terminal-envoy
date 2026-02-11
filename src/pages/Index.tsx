import React from 'react';
import MainframeShell from '@/components/MainframeShell';
import AccessCodeEntry from '@/components/auth/AccessCodeEntry';
import { useCampaign } from '@/contexts/CampaignContext';

const Index = () => {
  const { isAuthenticated } = useCampaign();

  if (!isAuthenticated) {
    return <AccessCodeEntry />;
  }

  return <MainframeShell />;
};

export default Index;
