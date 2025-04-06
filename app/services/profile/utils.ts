import { Profile } from './types';

/**
 * Generate a random alias for anonymous users
 */
export function generateRandomAlias(): string {
  const adjectives = ['Green', 'Blue', 'Eco', 'Solar', 'Wind', 'Ocean', 'Forest', 'Earth'];
  const nouns = ['Explorer', 'Guardian', 'Protector', 'Advocate', 'Champion', 'Pioneer', 'Ranger'];
  
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNum = Math.floor(Math.random() * 1000);
  
  return `${randomAdjective}${randomNoun}${randomNum}`;
}

/**
 * Get display name or alias based on anonymity setting
 */
export function getDisplayIdentifier(profile: Profile): string {
  if (profile.is_anonymous) {
    return profile.display_name || 'Anonymous User';
  }
  return profile.display_name || profile.email.split('@')[0];
}
