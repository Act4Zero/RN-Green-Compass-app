import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { AuthProvider, useAuth } from '../AuthContext';
import supabase, { ensureValidSession } from '../../lib/supabase';
import analytics from '../../services/analyticsService';

jest.mock('../../lib/supabase', () => ({
  __esModule: true,
  default: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
      signInWithPassword: jest.fn(),
      setSession: jest.fn(),
    },
    from: jest.fn(),
  },
  ensureValidSession: jest.fn(),
}));
jest.mock('../../services/analyticsService', () => ({ __esModule: true, default: { trackLogin: jest.fn(), setUserId: jest.fn() } }));
jest.mock('../updateLoginProfile', () => ({ updateLoginProfile: jest.fn() }));
jest.mock('../../badges/badgeEngine', () => ({ processUserEvent: jest.fn() }));

let auth: ReturnType<typeof useAuth>;
function Probe() { auth = useAuth(); return null; }
const user = { id: 'test-user' };
const session = { user, access_token: 'test-access', refresh_token: 'test-refresh' };

describe('email authentication', () => {
  let tree: renderer.ReactTestRenderer;
  beforeEach(async () => {
    jest.clearAllMocks();
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({ data: { user, session }, error: null });
    // A slow profile service must not keep an authenticated user on the login page.
    const query = { select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), single: jest.fn(() => new Promise(() => {})) };
    (supabase.from as jest.Mock).mockReturnValue(query);
    await act(async () => { tree = renderer.create(<AuthProvider><Probe /></AuthProvider>); });
  });
  afterEach(() => { act(() => tree.unmount()); });

  it('completes sign in while profile rewards are still pending, without storing the session twice', async () => {
    let result: Awaited<ReturnType<typeof auth.signIn>> | undefined;
    await act(async () => {
      void auth.signIn('name@students.example.org', 'valid<password>\\', 'verification-token').then(value => { result = value; });
    });
    expect(result?.data?.session).toEqual(session);
    expect(auth.user).toEqual(user);
    expect(auth.loading).toBe(false);
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({ email: 'name@students.example.org', password: 'valid<password>\\', options: { captchaToken: 'verification-token' } });
    expect(supabase.auth.setSession).not.toHaveBeenCalled();
  });

  it('returns rejected credentials without opening a session or awarding rewards', async () => {
    const error = new Error('Invalid login credentials');
    const log = jest.spyOn(console, 'error').mockImplementation(() => {});
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({ data: { user: null, session: null }, error });
    let result: Awaited<ReturnType<typeof auth.signIn>> | undefined;
    await act(async () => { result = await auth.signIn('name@example.org', 'wrong', 'verification-token'); });
    expect(result?.error).toBe(error);
    expect(auth.user).toBeNull();
    expect(auth.loading).toBe(false);
    expect(supabase.from).not.toHaveBeenCalled();
    log.mockRestore();
  });

  it('keeps successful authentication when analytics fails', async () => {
    const log = jest.spyOn(console, 'error').mockImplementation(() => {});
    (analytics.trackLogin as jest.Mock).mockImplementationOnce(() => { throw new Error('Analytics unavailable'); });
    await act(async () => { await auth.signIn('name@example.org', 'password', 'verification-token'); });
    expect(auth.session).toEqual(session);
    expect(auth.loading).toBe(false);
    log.mockRestore();
  });

  it('does not call other auth methods inside the authentication callback', () => {
    const callback = (supabase.auth.onAuthStateChange as jest.Mock).mock.calls[0][0];
    act(() => callback('SIGNED_IN', session));
    expect(auth.user).toEqual(user);
    expect(ensureValidSession).not.toHaveBeenCalled();
  });
});
