import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import ResetPassword from '../../../app/auth/reset-password';
import Input from '../Input';
import { AppButton } from '../ui';
import supabase from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({ __esModule: true, default: { auth: { getSession: jest.fn(), updateUser: jest.fn() } } }));
jest.mock('expo-router', () => ({ useRouter: () => ({ replace: jest.fn() }), useLocalSearchParams: () => ({}) }));
jest.mock('@/context/AppLocaleContext', () => ({ useAppLocale: () => ({ t: (_en: string, bg: string) => bg }) }));
jest.mock('@/theme', () => ({ useAppTheme: () => ({ theme: require('@/theme/tokens').createTheme('light') }) }));
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('../Input', () => ({ __esModule: true, default: () => null }));

describe('password recovery', () => {
  let tree: renderer.ReactTestRenderer;
  beforeEach(() => { jest.clearAllMocks(); });
  afterEach(() => act(() => tree.unmount()));
  async function open(session: object | null) {
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({ data: { session }, error: null });
    await act(async () => { tree = renderer.create(<ResetPassword />); });
  }
  const saveButton = () => tree.root.findAllByType(AppButton).find(button => button.props.label === 'Запази паролата')!;

  it('does not offer a password change without a recovery session', async () => {
    await open(null);
    expect(tree.root.findAllByType(Input)).toHaveLength(0);
    expect(supabase.auth.updateUser).not.toHaveBeenCalled();
    expect(tree.root.findAllByType(AppButton).some(button => button.props.label === 'Поискай нова връзка')).toBe(true);
  });
  it('rejects mismatched passwords before contacting the server', async () => {
    await open({ user: { id: 'test-user' } });
    act(() => {
      const inputs = tree.root.findAllByType(Input);
      inputs[0].props.onChangeText('a-valid-password');
      inputs[1].props.onChangeText('a-different-password');
    });
    await act(async () => saveButton().props.onPress());
    expect(supabase.auth.updateUser).not.toHaveBeenCalled();
    expect(tree.root.findAllByType(Text).some(text => text.props.children === 'Паролите не съвпадат.')).toBe(true);
  });
  it('saves the exact password only after a verified session and matching confirmation', async () => {
    await open({ user: { id: 'test-user' } });
    (supabase.auth.updateUser as jest.Mock).mockResolvedValue({ error: null });
    act(() => tree.root.findAllByType(Input).forEach(input => input.props.onChangeText('new<password>\\')));
    await act(async () => saveButton().props.onPress());
    expect(supabase.auth.updateUser).toHaveBeenCalledWith({ password: 'new<password>\\' });
    expect(tree.root.findAllByType(Text).some(text => text.props.children === 'Паролата е запазена.')).toBe(true);
    expect(tree.root.findAllByType(Input)).toHaveLength(0);
  });
});
