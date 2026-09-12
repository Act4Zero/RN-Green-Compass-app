import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Text, TouchableOpacity } from 'react-native';
import SignIn from '../../../app/auth/signin';
import Input from '../Input';
import Button from '../Button';
import Turnstile from '../Turnstile';

const mockSignIn = jest.fn();
const mockReplace = jest.fn();
const mockReset = jest.fn();
jest.mock('@/context/AuthContext', () => ({ useAuth: () => ({ signIn: mockSignIn, signInWithGoogle: jest.fn() }) }));
jest.mock('expo-router', () => ({ useRouter: () => ({ replace: mockReplace }), useLocalSearchParams: () => ({ next: '/ecosystem' }) }));
jest.mock('@/context/AppLocaleContext', () => ({ useAppLocale: () => ({ locale: 'bg', setLocale: jest.fn(), t: (_en: string, bg: string) => bg }) }));
jest.mock('@/theme', () => ({ useAppTheme: () => ({ theme: require('@/theme/tokens').createTheme('light') }) }));
jest.mock('@/lib/supabase', () => ({ isSupabaseConfigured: true }));
jest.mock('@/services/analyticsService', () => ({ __esModule: true, default: { trackScreenView: jest.fn() } }));
jest.mock('../Input', () => ({ __esModule: true, default: () => null }));
jest.mock('../Button', () => ({ __esModule: true, default: () => null }));
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('../Turnstile', () => {
  const ReactModule = require('react');
  return { __esModule: true, isTurnstileConfigured: true, default: ReactModule.forwardRef((_props: unknown, ref: React.Ref<unknown>) => {
    ReactModule.useImperativeHandle(ref, () => ({ reset: mockReset }));
    return null;
  }) };
});

describe('email sign in form', () => {
  let tree: renderer.ReactTestRenderer;
  beforeEach(() => {
    jest.clearAllMocks();
    act(() => { tree = renderer.create(<SignIn />); });
  });
  afterEach(() => act(() => tree.unmount()));
  const prepare = () => act(() => {
    const inputs = tree.root.findAllByType(Input);
    inputs[0].props.onChangeText(' name@students.example.org ');
    inputs[1].props.onChangeText('valid<password>\\');
    tree.root.findByType(Turnstile).props.onVerify('fresh-token');
  });

  it('accepts an email subdomain and preserves the password, then opens the requested screen', async () => {
    mockSignIn.mockResolvedValue({ data: { session: { user: { id: 'test-user' } } }, error: null });
    prepare();
    await act(async () => { await tree.root.findByType(Button).props.onPress(); });
    expect(mockSignIn).toHaveBeenCalledWith('name@students.example.org', 'valid<password>\\', 'fresh-token');
    expect(mockReplace).toHaveBeenCalledWith('/ecosystem');
  });

  it('keeps the invalid-password message when a replacement verification token arrives', async () => {
    mockSignIn.mockResolvedValue({ data: null, error: new Error('Invalid login credentials') });
    prepare();
    await act(async () => { await tree.root.findByType(Button).props.onPress(); });
    expect(mockReset).toHaveBeenCalledTimes(1);
    act(() => tree.root.findByType(Turnstile).props.onVerify('replacement-token'));
    expect(tree.root.findAllByType(Text).some(node => node.props.children === 'Невалиден имейл или парола. Опитайте отново.')).toBe(true);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('disables submission after expiration and offers recovery after a verification failure', () => {
    prepare();
    act(() => tree.root.findByType(Turnstile).props.onExpire());
    expect(tree.root.findByType(Button).props.disabled).toBe(true);
    act(() => tree.root.findByType(Turnstile).props.onError('load-timeout'));
    const retry = tree.root.findAllByType(TouchableOpacity).find(node => node.findAllByType(Text).some(text => text.props.children === 'Повтори проверката'));
    expect(retry).toBeTruthy();
    act(() => retry!.props.onPress());
    expect(mockReset).toHaveBeenCalledTimes(1);
  });
});
