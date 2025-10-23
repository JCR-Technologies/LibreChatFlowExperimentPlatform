import React from 'react';
import { AuthContextProvider } from '~/hooks/useAuthContextNoRedirect';
import LandingPage from './LandingPage';

export default function LandingPageWrapper() {
  return (
    <AuthContextProvider>
      <LandingPage />
    </AuthContextProvider>
  );
}
