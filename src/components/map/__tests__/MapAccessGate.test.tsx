import React from 'react';
import renderer, { act } from 'react-test-renderer';
import MapScreen from '../../../../app/map';

let mockUser: { id: string } | null = null;
let mockLoading = false;
const mockReserve = jest.fn();
const mockAuthenticatedMap = jest.fn(() => {
  const { View } = require('react-native');
  return React.createElement(View, { testID: 'authenticated-map' });
});

jest.mock('@/context/AuthContext', () => ({ useAuth: () => ({ user: mockUser, loading: mockLoading }) }));
jest.mock('@/features/sustainability-map', () => ({ reserveMapSession: () => mockReserve() }));
jest.mock('../AuthenticatedMap', () => ({ __esModule: true, default: () => mockAuthenticatedMap() }));
jest.mock('../MapPreview', () => {
  const ReactModule = require('react'); const { View } = require('react-native');
  return { __esModule: true, default: () => ReactModule.createElement(View, { testID: 'public-map-preview' }) };
});
jest.mock('@/theme', () => ({ useAppTheme: () => ({ theme: require('@/theme/tokens').createTheme('light') }) }));
jest.mock('@expo/vector-icons', () => { const ReactModule=require('react'); const {Text}=require('react-native'); return {Ionicons:({name}:{name:string})=>ReactModule.createElement(Text,null,name)}; });

describe('controlled Sustainability Map access', () => {
  beforeEach(() => { mockUser = null; mockLoading = false; mockReserve.mockReset(); mockAuthenticatedMap.mockClear(); });

  it('renders only the zero-cost preview for anonymous visitors', () => {
    let tree!: renderer.ReactTestRenderer;
    act(() => { tree = renderer.create(<MapScreen />); });
    expect(tree.root.findByProps({ testID: 'public-map-preview' })).toBeTruthy();
    expect(mockReserve).not.toHaveBeenCalled();
    expect(mockAuthenticatedMap).not.toHaveBeenCalled();
  });

  it('does not reserve a session or mount the renderer while auth is loading', () => {
    mockLoading = true;
    let tree!: renderer.ReactTestRenderer;
    act(() => { tree = renderer.create(<MapScreen />); });
    expect(tree.root.findByProps({ children: 'Checking your account…' })).toBeTruthy();
    expect(mockReserve).not.toHaveBeenCalled();
    expect(mockAuthenticatedMap).not.toHaveBeenCalled();
  });

  it('keeps the renderer unmounted when the budget reservation is denied', async () => {
    mockUser = { id: 'user-1' }; mockReserve.mockResolvedValue({ allowed: false, reason: 'budget', message: 'Paused' });
    let tree!: renderer.ReactTestRenderer;
    await act(async () => { tree = renderer.create(<MapScreen />); await Promise.resolve(); });
    expect(tree.root.findByProps({ children: 'The globe is safely paused' })).toBeTruthy();
    expect(mockAuthenticatedMap).not.toHaveBeenCalled();
  });

  it('keeps the renderer unmounted when session verification fails', async () => {
    mockUser = { id: 'user-1' }; mockReserve.mockResolvedValue({ allowed: false, reason: 'unavailable', message: 'Could not verify the session' });
    let tree!: renderer.ReactTestRenderer;
    await act(async () => { tree = renderer.create(<MapScreen />); await Promise.resolve(); });
    expect(tree.root.findByProps({ children: 'The globe is safely paused' })).toBeTruthy();
    expect(tree.root.findByProps({ children: 'Try again' })).toBeTruthy();
    expect(mockAuthenticatedMap).not.toHaveBeenCalled();
  });

  it('mounts the interactive map only after an allowed reservation', async () => {
    mockUser = { id: 'user-1' }; mockReserve.mockResolvedValue({ allowed: true, reason: 'reserved' });
    let tree!: renderer.ReactTestRenderer;
    await act(async () => { tree = renderer.create(<MapScreen />); await Promise.resolve(); });
    expect(tree.root.findByProps({ testID: 'authenticated-map' })).toBeTruthy();
    expect(mockReserve).toHaveBeenCalledTimes(1);
  });
});
