import type { AppLocale } from '@/context/AppLocaleContext';
import type { Challenge } from '@/types/community/challenge';

const CHALLENGE_BG: Record<string, { title: string; description: string }> = {
  'The Green Leap Challenge: Innovating for a Sustainable Future': {
    title: 'Зелен скок: иновации за устойчиво бъдеще',
    description: 'Готови ли сте да постигнете осезаема промяна в света? Предизвикателството „Зелен скок“ кани новатори, създатели и хора, които решават проблеми, да преосмислят устойчивостта и да предприемат смели действия за по-зелено и устойчиво бъдеще. Участниците могат самостоятелно или в екип да разработят практични решения с реално въздействие.',
  },
};

export function localizeCommunityChallenge(challenge: Challenge, locale: AppLocale): Challenge {
  if (locale !== 'bg') return challenge;
  const copy = CHALLENGE_BG[challenge.title];
  return copy ? { ...challenge, ...copy } : challenge;
}
