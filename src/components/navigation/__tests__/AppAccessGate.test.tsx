import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import { Redirect } from 'expo-router';
import { AppAccessGate } from '../AppAccessGate';

let mockAuth: { user: object | null; session: object | null; loading: boolean };
let mockPathname = '/ecosystem';
jest.mock('@/context/AuthContext', () => ({ useAuth: () => mockAuth }));
jest.mock('@/context/AppLocaleContext', () => ({ useAppLocale: () => ({ t: (_en: string, bg: string) => bg }) }));
jest.mock('@/theme', () => ({ useAppTheme: () => ({ theme: require('@/theme/tokens').createTheme('light') }) }));
jest.mock('expo-router', () => ({ Redirect: () => null, usePathname: () => mockPathname }));

describe('application access', () => {
  beforeEach(() => { mockAuth = { user: null, session: null, loading: false }; mockPathname = '/ecosystem'; });

  it.each(['index', 'home', 'ecosystem/index', 'ecosystem/species/[slug]', 'map/index', 'knowledge/index', 'marketplace', 'profile/index', 'admin/map/index', 'future-screen'])('requires a session before mounting %s', routeName => {
    const mount = jest.fn();
    function ProtectedContent() { mount(); return <Text>Private screen</Text>; }
    let tree!: renderer.ReactTestRenderer;
    act(() => { tree = renderer.create(<AppAccessGate routeName={routeName}><ProtectedContent /></AppAccessGate>); });
    expect(mount).not.toHaveBeenCalled();
    expect(tree.root.findByType(Redirect).props.href).toEqual({ pathname: '/auth/signin', params: { next: '/ecosystem' } });
    act(() => tree.unmount());
  });

  it.each(['auth/signin', 'auth/signup', 'auth/forgot-password', 'auth/reset-password', 'auth/callback', 'auth/confirm-signup', 'auth/signup-success'])('keeps %s available without a session', routeName => {
    let tree!: renderer.ReactTestRenderer;
    act(() => { tree = renderer.create(<AppAccessGate routeName={routeName}><Text>Account access</Text></AppAccessGate>); });
    expect(tree.root.findAllByType(Redirect)).toHaveLength(0);
    expect(tree.root.findByType(Text).props.children).toBe('Account access');
    act(() => tree.unmount());
  });

  it('waits for restored credentials and removes protected content after logout', () => {
    mockAuth.loading = true;
    let tree!: renderer.ReactTestRenderer;
    const view = () => <AppAccessGate routeName="ecosystem/index"><Text>Private screen</Text></AppAccessGate>;
    act(() => { tree = renderer.create(view()); });
    expect(tree.root.findAllByProps({ children: 'Private screen' })).toHaveLength(0);
    expect(tree.root.findAllByType(Redirect)).toHaveLength(0);
    mockAuth = { session: { user: { id: 'test-user' } }, user: { id: 'test-user' }, loading: false };
    act(() => tree.update(view()));
    expect(tree.root.findByType(Text).props.children).toBe('Private screen');
    mockAuth = { session: null, user: null, loading: false };
    act(() => tree.update(view()));
    expect(tree.root.findAllByProps({ children: 'Private screen' })).toHaveLength(0);
    expect(tree.root.findByType(Redirect)).toBeTruthy();
    act(() => tree.unmount());
  });
});
