import { APP_NAV_ITEMS, isNavItemActive } from '../config';

describe('adaptive app navigation', () => {
  it('exposes the five primary destinations in product order', () => {
    expect(APP_NAV_ITEMS.map((item) => item.label)).toEqual([
      'Home',
      'Habits',
      'Map',
      'Community',
      'Profile',
    ]);
  });

  it('keeps nested screens associated with their primary destination', () => {
    const habits = APP_NAV_ITEMS.find((item) => item.label === 'Habits')!;
    const community = APP_NAV_ITEMS.find((item) => item.label === 'Community')!;
    expect(isNavItemActive('/habits/history', habits)).toBe(true);
    expect(isNavItemActive('/community/challenges/42', community)).toBe(true);
    expect(isNavItemActive('/profile', community)).toBe(false);
  });

  it('uses unique accessible labels and URLs', () => {
    expect(new Set(APP_NAV_ITEMS.map((item) => item.label)).size).toBe(APP_NAV_ITEMS.length);
    expect(new Set(APP_NAV_ITEMS.map((item) => item.href)).size).toBe(APP_NAV_ITEMS.length);
  });
});
