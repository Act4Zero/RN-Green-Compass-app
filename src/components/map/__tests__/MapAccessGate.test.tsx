import React from 'react';
import renderer, { act } from 'react-test-renderer';
import MapScreen from '../../../../app/map';

let mockUser: { id: string } | null = null;
const mockPublicMap = jest.fn(() => {
  const { View } = require('react-native');
  return React.createElement(View, { testID: 'public-living-planet' });
});

jest.mock('@/context/AuthContext', () => ({ useAuth: () => ({ user: mockUser, loading: false }) }));
jest.mock('../PublicMap', () => ({ __esModule: true, default: () => mockPublicMap() }));

describe('public Living Planet access', () => {
  beforeEach(() => { mockUser = null; mockPublicMap.mockClear(); });

  it('mounts the same browse experience for anonymous visitors', () => {
    let tree!: renderer.ReactTestRenderer;
    act(() => { tree = renderer.create(<MapScreen />); });
    expect(tree.root.findByProps({ testID: 'public-living-planet' })).toBeTruthy();
    expect(mockPublicMap).toHaveBeenCalledTimes(1);
  });

  it('does not require an account or paid-map reservation', () => {
    mockUser = { id: 'user-1' };
    let tree!: renderer.ReactTestRenderer;
    act(() => { tree = renderer.create(<MapScreen />); });
    expect(tree.root.findByProps({ testID: 'public-living-planet' })).toBeTruthy();
  });
});
