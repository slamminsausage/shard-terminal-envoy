import React from 'react';
import MainframeShell from '@/components/MainframeShell';
import AccessCodeEntry from '@/components/auth/AccessCodeEntry';
import { usePlayer } from '@/contexts/PlayerContext';

const Index = () => {
  const { isAuthenticated } = usePlayer();

  if (!isAuthenticated) {
    return <AccessCodeEntry />;
  }

  return <MainframeShell />;
};

export default Index;
