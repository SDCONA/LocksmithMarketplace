/**
 * Guest ID Management for Transponder Master Game
 * Generates and persists a unique ID for guest users
 */

const GUEST_ID_KEY = 'transponder_game_guest_id';

/**
 * Get or create a guest ID
 * @returns string - Unique guest identifier
 */
export function getGuestId(): string {
  // Check if guest ID already exists in localStorage
  let guestId = localStorage.getItem(GUEST_ID_KEY);
  
  if (!guestId) {
    // Generate new guest ID
    guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(GUEST_ID_KEY, guestId);
    console.log(`🆔 Generated new guest ID: ${guestId}`);
  } else {
    console.log(`🆔 Using existing guest ID: ${guestId}`);
  }
  
  return guestId;
}

/**
 * Clear guest ID (e.g., when user logs in)
 */
export function clearGuestId(): void {
  localStorage.removeItem(GUEST_ID_KEY);
  console.log('🗑️ Guest ID cleared');
}

/**
 * Check if current user is a guest
 * @param user - Supabase auth user object (null if not logged in)
 * @returns boolean - True if guest, false if authenticated
 */
export function isGuest(user: any): boolean {
  return !user || !user.id;
}
