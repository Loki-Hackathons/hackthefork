'use client';

import Cookies from 'js-cookie';

const USER_ID_COOKIE = 'htf_user_id';
const ONBOARDING_COMPLETE_COOKIE = 'htf_onboarding_complete';
const USER_NAME_COOKIE = 'htf_user_name';
const COOKIE_EXPIRY_DAYS = 365;

function generateUserId(): string {
  // Use crypto.randomUUID if available, otherwise fallback
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function getUserId(): string {
  if (typeof window === 'undefined') return '';
  
  let userId = Cookies.get(USER_ID_COOKIE);
  
  if (!userId) {
    userId = generateUserId();
    Cookies.set(USER_ID_COOKIE, userId, { 
      expires: COOKIE_EXPIRY_DAYS,
      sameSite: 'lax'
    });
  }
  
  return userId;
}

export function setUserId(userId: string): void {
  if (typeof window === 'undefined') return;
  
  Cookies.set(USER_ID_COOKIE, userId, { 
    expires: COOKIE_EXPIRY_DAYS,
    sameSite: 'lax'
  });
}

export function isOnboardingComplete(): boolean {
  if (typeof window === 'undefined') return false;
  return Cookies.get(ONBOARDING_COMPLETE_COOKIE) === 'true';
}

export function setOnboardingComplete(complete: boolean): void {
  if (typeof window === 'undefined') return;
  
  Cookies.set(ONBOARDING_COMPLETE_COOKIE, complete ? 'true' : 'false', { 
    expires: COOKIE_EXPIRY_DAYS,
    sameSite: 'lax'
  });
}

export function getUserName(): string {
  if (typeof window === 'undefined') return '';
  return Cookies.get(USER_NAME_COOKIE) || '';
}

export function setUserName(name: string): void {
  if (typeof window === 'undefined') return;
  
  Cookies.set(USER_NAME_COOKIE, name, { 
    expires: COOKIE_EXPIRY_DAYS,
    sameSite: 'lax'
  });
}
