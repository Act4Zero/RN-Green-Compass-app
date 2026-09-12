import { signInErrorMessage } from '../authErrors';
const t = (_en: string, bg: string) => bg;

it.each([
  ['invalid_credentials', 'Невалиден имейл или парола'],
  ['email_not_confirmed', 'Потвърдете имейл'],
  ['captcha_failed', 'Проверката за сигурност е неуспешна'],
  ['over_request_rate_limit', 'Твърде много опити'],
  ['email_provider_disabled', 'Входът с имейл временно не е достъпен'],
])('explains %s without depending on the server message wording', (code, explanation) => {
  expect(signInErrorMessage(Object.assign(new Error('Authentication failed'), { code }), t)).toContain(explanation);
});
it('explains network failures', () => {
  expect(signInErrorMessage(new TypeError('Failed to fetch'), t)).toContain('Няма връзка със сървъра');
});
it('does not expose an unknown server message to the user', () => {
  expect(signInErrorMessage(new Error('Internal database diagnostic'), t)).not.toContain('Internal database');
});
