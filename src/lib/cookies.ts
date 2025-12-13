import Cookies from 'js-cookie';

const USER_ID_COOKIE = 'htf_user_id';
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
  Cookies.set(USER_ID_COOKIE, userId, { 
    expires: COOKIE_EXPIRY_DAYS,
    sameSite: 'lax'
  });
}
