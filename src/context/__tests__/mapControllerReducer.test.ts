import {
  INITIAL_MAP_CONTROLLER_STATE,
  mapControllerReducer,
} from '../mapControllerReducer';

describe('mapControllerReducer', () => {
  it('initializes dynamic categories and toggles them without changing other state', () => {
    const ready = mapControllerReducer(INITIAL_MAP_CONTROLLER_STATE, {
      type: 'categories-ready',
      categories: ['ev_charging'],
    });
    const toggled = mapControllerReducer(ready, {
      type: 'category-toggled',
      category: 'ev_charging',
      enabled: false,
    });

    expect(ready.filters.categories).toEqual({ ev_charging: true });
    expect(toggled.filters.categories).toEqual({ ev_charging: false });
    expect(toggled.camera).toBe(ready.camera);
  });

  it('preserves camera, query, and selected location when style changes', () => {
    const location = {
      id: 'ev-1', name: 'Test', category: 'ev_charging' as const, categories: ['ev_charging' as const], connectors: [], credentials: [], lat: 42.7, lng: 23.3,
      town: 'Sofia', state_or_province: null, address_line_1: null, address_line_2: null,
      postcode: null, country: 'Bulgaria', source: 'Open Charge Map', licence: 'ODbL',
    };
    const camera = { ...INITIAL_MAP_CONTROLLER_STATE.camera, zoom: 9 };
    const state = {
      ...INITIAL_MAP_CONTROLLER_STATE,
      camera,
      query: 'sofia',
      selectedLocation: location,
    };
    const changed = mapControllerReducer(state, { type: 'style-changed', styleId: 'living-planet' });

    expect(changed).toMatchObject({ styleId: 'living-planet', camera, query: 'sofia', selectedLocation: location });
  });

  it('stores typed camera commands and panel transitions', () => {
    const commanded = mapControllerReducer(INITIAL_MAP_CONTROLLER_STATE, {
      type: 'camera-commanded',
      command: { id: 4, center: { lat: 42.7, lng: 23.3 }, zoom: 10, durationMs: 0 },
    });
    const opened = mapControllerReducer(commanded, { type: 'results-visibility-changed', open: true });
    const collapsed = mapControllerReducer(opened, { type: 'results-rail-collapsed-changed', collapsed: true });

    expect(opened.cameraCommand).toMatchObject({ id: 4, zoom: 10, durationMs: 0 });
    expect(opened.isResultsOpen).toBe(true);
    expect(collapsed.isResultsRailCollapsed).toBe(true);
  });
});
