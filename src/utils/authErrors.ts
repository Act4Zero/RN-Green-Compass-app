export function signInErrorMessage(error: Error & { code?: string; status?: number }, t: (en: string, bg: string) => string) {
  const message = error.message.toLowerCase();
  if (error.code === 'invalid_credentials' || message.includes('invalid login credentials')) {
    return t('Invalid email or password. Please try again.', 'Невалиден имейл или парола. Опитайте отново.');
  }
  if (error.code === 'email_not_confirmed' || message.includes('email not confirmed')) {
    return t('Please confirm your email address before signing in.', 'Потвърдете имейл адреса си преди вход.');
  }
  if (error.code === 'captcha_failed' || message.includes('captcha')) {
    return t('Security verification failed. Complete the new check and try again.', 'Проверката за сигурност е неуспешна. Завършете новата проверка и опитайте отново.');
  }
  if (error.status === 429 || error.code === 'over_request_rate_limit' || message.includes('rate limit')) {
    return t('Too many attempts. Please wait a few minutes before trying again.', 'Твърде много опити. Изчакайте няколко минути и опитайте отново.');
  }
  if (/network|fetch|connection|timeout|timed out/.test(message)) {
    return t('Could not connect. Check your internet connection and try again.', 'Няма връзка със сървъра. Проверете интернет връзката си и опитайте отново.');
  }
  if (message.includes('invalid api key') || error.code === 'email_provider_disabled') {
    return t('Email sign in is temporarily unavailable. Please try again later.', 'Входът с имейл временно не е достъпен. Опитайте отново по-късно.');
  }
  return t('The sign-in service could not complete your request. Please try again shortly.', 'Услугата за вход не успя да завърши заявката. Опитайте отново след малко.');
}
