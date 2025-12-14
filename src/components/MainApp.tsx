'use client';

import { useState, useEffect } from 'react';
import { TinderOnboarding } from './TinderOnboarding';
import { PreferencesOnboarding } from './PreferencesOnboarding';
import { BottomNav } from './BottomNav';
import { FeedScreen } from './FeedScreen';
import { CameraScreen } from './CameraScreen';
import { ShopScreen } from './ShopScreen';
import { ProfileScreen } from './ProfileScreen';
import { ChallengesScreen } from './ChallengesScreen';
import { MessagesScreen } from './MessagesScreen';
import { getUserId, arePreferencesComplete } from '@/lib/cookies';

interface MainAppProps {
  onboardingComplete: boolean;
  setOnboardingComplete: (value: boolean) => void;
}

export type Screen = 'feed' | 'swipe' | 'camera' | 'shop' | 'profile' | 'challenges' | 'messages';

export function MainApp({ onboardingComplete, setOnboardingComplete }: MainAppProps) {
  const [currentScreen, setCurrentScreen] = useState<Screen>('feed');
  const [selectedPostId, setSelectedPostId] = useState<string | undefined>(undefined);
  const [selectedPostImageUrl, setSelectedPostImageUrl] = useState<string | undefined>(undefined);
  const [preferencesComplete, setPreferencesComplete] = useState(false);

  const handleNavigateWithPost = (screen: Screen, postId?: string, postImageUrl?: string) => {
    setSelectedPostId(postId);
    setSelectedPostImageUrl(postImageUrl);
    setCurrentScreen(screen);
  };

  // Initialize user_id cookie on mount and check preferences
  useEffect(() => {
    getUserId(); // This will create the cookie if it doesn't exist
    setPreferencesComplete(arePreferencesComplete());
  }, []);

  // Show preferences onboarding first if not complete
  if (!preferencesComplete) {
    return (
      <div className="h-screen w-screen bg-black overflow-hidden">
        <PreferencesOnboarding onComplete={() => setPreferencesComplete(true)} />
      </div>
    );
  }

  // Then show Tinder onboarding if not complete
  if (!onboardingComplete) {
    return (
      <div className="h-screen w-screen bg-black overflow-hidden">
        <TinderOnboarding onComplete={() => setOnboardingComplete(true)} />
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-screen bg-black overflow-hidden flex flex-col">
      {/* Main content area */}
      <div className="flex-1 w-full overflow-hidden relative">
        {currentScreen === 'feed' && <FeedScreen onNavigate={handleNavigateWithPost} />}
        {currentScreen === 'swipe' && <TinderOnboarding isRevisit={true} onComplete={() => {}} />}
        {currentScreen === 'camera' && <CameraScreen onNavigate={setCurrentScreen} />}
        {currentScreen === 'shop' && (
          <ShopScreen 
            onNavigate={setCurrentScreen} 
            postId={selectedPostId}
            postImageUrl={selectedPostImageUrl}
          />
        )}
        {currentScreen === 'profile' && <ProfileScreen onNavigate={setCurrentScreen} />}
        {currentScreen === 'challenges' && <ChallengesScreen />}
        {currentScreen === 'messages' && <MessagesScreen onNavigate={setCurrentScreen} />}
      </div>

      {/* Bottom Navigation */}
      {!['shop', 'messages'].includes(currentScreen) && (
        <div className="w-full z-50">
          <BottomNav currentScreen={currentScreen} onNavigate={setCurrentScreen} />
        </div>
      )}
    </div>
  );
}
