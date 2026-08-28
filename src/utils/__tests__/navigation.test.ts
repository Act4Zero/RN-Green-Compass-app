import { goBackOrReplace, sanitizeInternalDestination } from '../navigation';

describe('navigation helpers', () => {
  it('keeps supported internal destinations and nested routes', () => {
    expect(sanitizeInternalDestination('/community')).toBe('/community');
    expect(sanitizeInternalDestination('/community/groups/123?tab=members')).toBe('/community/groups/123?tab=members');
  });

  it('rejects external, protocol-relative, auth, and malformed destinations', () => {
    expect(sanitizeInternalDestination('https://example.com')).toBe('/home');
    expect(sanitizeInternalDestination('//example.com')).toBe('/home');
    expect(sanitizeInternalDestination('/auth/signin')).toBe('/home');
    expect(sanitizeInternalDestination('/community\\example.com')).toBe('/home');
  });

  it('uses browser history when available and a safe fallback otherwise', () => {
    const back = jest.fn();
    const replace = jest.fn();

    goBackOrReplace({ back, replace, canGoBack: () => true }, '/ecosystem');
    expect(back).toHaveBeenCalledTimes(1);
    expect(replace).not.toHaveBeenCalled();

    back.mockClear();
    goBackOrReplace({ back, replace, canGoBack: () => false }, '/ecosystem');
    expect(back).not.toHaveBeenCalled();
    expect(replace).toHaveBeenCalledWith('/ecosystem');
  });
});
