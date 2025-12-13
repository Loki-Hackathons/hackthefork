import { useState } from 'react';
import { TinderOnboarding } from './TinderOnboarding';
import { BottomNav } from './BottomNav';
import { FeedScreen } from './FeedScreen';
import { CameraScreen } from './CameraScreen';
import { ShopScreen } from './ShopScreen';
import { ProfileScreen } from './ProfileScreen';
import { ChallengesScreen } from './ChallengesScreen';

interface MainAppProps {
  onboardingComplete: boolean;
  setOnboardingComplete: (value: boolean) => void;
}

export type Screen = 'feed' | 'swipe' | 'camera' | 'shop' | 'profile' | 'challenges';

export function MainApp({ onboardingComplete, setOnboardingComplete }: MainAppProps) {
  const [currentScreen, setCurrentScreen] = useState<Screen>('feed');

  if (!onboardingComplete) {
    return <TinderOnboarding onComplete={() => setOnboardingComplete(true)} />;
  }

  return (
    <div className="h-screen w-screen bg-slate-950 overflow-hidden flex flex-col">
      {/* Main content area */}
      <div className="flex-1 overflow-hidden">
        {currentScreen === 'feed' && <FeedScreen onNavigate={setCurrentScreen} />}
        {currentScreen === 'swipe' && <TinderOnboarding isRevisit={true} onComplete={() => {}} />}
        {currentScreen === 'camera' && <CameraScreen onNavigate={setCurrentScreen} />}
        {currentScreen === 'shop' && <ShopScreen />}
        {currentScreen === 'profile' && <ProfileScreen />}
        {currentScreen === 'challenges' && <ChallengesScreen />}
      </div>

      {/* Bottom Navigation */}
      <BottomNav currentScreen={currentScreen} onNavigate={setCurrentScreen} />
    </div>
  );
}
