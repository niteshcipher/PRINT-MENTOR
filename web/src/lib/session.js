// Session management for anonymous user identity
const SESSION_STORAGE_KEY = 'pixel_mentor_user_id';

/**
 * Generates a RFC4122 version 4 compliant UUID.
 */
export function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Retrieves the persisted user_id from localStorage.
 * If not found, generates a new UUID, stores it, and returns it.
 */
export function getOrCreateUserId() {
  if (typeof window !== 'undefined' && window.location && window.location.search) {
    const params = new URLSearchParams(window.location.search);
    if (params.get('demo') === '1' || params.get('demo') === 'true') {
      const demoId = 'demo_student_01';
      localStorage.setItem(SESSION_STORAGE_KEY, demoId);
      return demoId;
    }
  }

  let userId = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!userId || !userId.trim()) {
    userId = generateUUID();
    localStorage.setItem(SESSION_STORAGE_KEY, userId);
  }
  return userId;
}

/**
 * Clears the session from localStorage (forces new user creation).
 */
export function resetSession() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
  return getOrCreateUserId();
}

