'use client';

import { useState, useEffect } from 'react';
import { SplashScreen } from '@/components/SplashScreen';
import { MainApp } from '@/components/MainApp';
import { isOnboardingComplete } from '@/lib/cookies';

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  useEffect(() => {
    // Check if onboarding was already completed (from cookie)
    setOnboardingComplete(isOnboardingComplete());
  }, []);

  if (showSplash) {
    return (
      <SplashScreen 
        onComplete={() => setShowSplash(false)} 
      />
    );
  }

  return (
    <MainApp 
      onboardingComplete={onboardingComplete}
      setOnboardingComplete={setOnboardingComplete}
    />
  );
}
