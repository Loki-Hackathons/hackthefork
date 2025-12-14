'use client';

import Cookies from 'js-cookie';

const USER_ID_COOKIE = 'htf_user_id';
const ONBOARDING_COMPLETE_COOKIE = 'htf_onboarding_complete';
const USER_NAME_COOKIE = 'htf_user_name';
const USER_AVATAR_COOKIE = 'htf_user_avatar';
const USER_AVATAR_IMAGE_COOKIE = 'htf_user_avatar_image'; // Base64 image data
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

export function getUserAvatar(): string {
  if (typeof window === 'undefined') return '';
  return Cookies.get(USER_AVATAR_COOKIE) || '';
}

export function setUserAvatar(avatar: string): void {
  if (typeof window === 'undefined') return;
  
  Cookies.set(USER_AVATAR_COOKIE, avatar, { 
    expires: COOKIE_EXPIRY_DAYS,
    sameSite: 'lax'
  });
}

export function getUserAvatarImage(): string {
  if (typeof window === 'undefined') return '';
  // Check cookie first, then localStorage as fallback
  const cookieImage = Cookies.get(USER_AVATAR_IMAGE_COOKIE);
  if (cookieImage) return cookieImage;
  
  try {
    const localStorageImage = localStorage.getItem(USER_AVATAR_IMAGE_COOKIE);
    return localStorageImage || '';
  } catch (error) {
    return '';
  }
}

export function setUserAvatarImage(imageData: string): void {
  if (typeof window === 'undefined') return;
  
  // Note: Cookies have a 4KB limit, but base64 images can be larger
  // For larger images, we'll use localStorage as a fallback
  try {
    if (imageData.length > 3000) {
      // Use localStorage for larger images
      localStorage.setItem(USER_AVATAR_IMAGE_COOKIE, imageData);
      // Clear cookie if it exists
      Cookies.remove(USER_AVATAR_IMAGE_COOKIE);
    } else {
      // Use cookie for smaller images
      Cookies.set(USER_AVATAR_IMAGE_COOKIE, imageData, { 
        expires: COOKIE_EXPIRY_DAYS,
        sameSite: 'lax'
      });
      // Clear localStorage if it exists
      localStorage.removeItem(USER_AVATAR_IMAGE_COOKIE);
    }
  } catch (error) {
    console.error('Error saving avatar image:', error);
    // Fallback to localStorage if cookie fails
    try {
      localStorage.setItem(USER_AVATAR_IMAGE_COOKIE, imageData);
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }
}

export function removeUserAvatarImage(): void {
  if (typeof window === 'undefined') return;
  Cookies.remove(USER_AVATAR_IMAGE_COOKIE);
  localStorage.removeItem(USER_AVATAR_IMAGE_COOKIE);
}
