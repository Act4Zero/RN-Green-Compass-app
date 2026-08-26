import { APP_NAV_ITEMS, MOBILE_NAV_ITEMS, isNavItemActive } from '../config';

describe('adaptive app navigation', () => {
  it('exposes the six desktop destinations in product order', () => {
    expect(APP_NAV_ITEMS.map((item) => item.label)).toEqual([
      'Home',
      'Habits',
      'Map',
      'Hub',
      'Community',
      'Marketplace',
    ]);
  });

  it('keeps mobile navigation to five destinations and groups secondary areas under More', () => {
    expect(MOBILE_NAV_ITEMS.map((item) => item.label)).toEqual(['Home','Habits','Map','Marketplace','More']);
    const more = MOBILE_NAV_ITEMS.find((item) => item.label === 'More')!;
    expect(isNavItemActive('/knowledge/learning', more)).toBe(true);
    expect(isNavItemActive('/community/groups', more)).toBe(true);
  });

  it('keeps nested screens associated with their primary destination', () => {
    const habits = APP_NAV_ITEMS.find((item) => item.label === 'Habits')!;
    const community = APP_NAV_ITEMS.find((item) => item.label === 'Community')!;
    const hub = APP_NAV_ITEMS.find((item) => item.label === 'Hub')!;
    expect(isNavItemActive('/habits/history', habits)).toBe(true);
    expect(isNavItemActive('/community/challenges/42', community)).toBe(true);
    expect(isNavItemActive('/knowledge/content/clean-energy-explained', hub)).toBe(true);
    expect(isNavItemActive('/profile', community)).toBe(false);
    expect(habits.href).toBe('/habits');
  });

  it('uses unique accessible labels and URLs', () => {
    expect(new Set(APP_NAV_ITEMS.map((item) => item.label)).size).toBe(APP_NAV_ITEMS.length);
    expect(new Set(APP_NAV_ITEMS.map((item) => item.href)).size).toBe(APP_NAV_ITEMS.length);
  });
});
