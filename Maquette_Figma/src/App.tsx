import { useState } from 'react';
import { SplashScreen } from './components/SplashScreen';
import { MainApp } from './components/MainApp';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

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
