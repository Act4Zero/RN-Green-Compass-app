describe('searchBulgarianAddress', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.resetModules();
  });

  it('performs one explicit Bulgaria-only search and normalizes the result', async () => {
    global.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => [{ place_id: 17, display_name: 'София, България', lat: '42.6977', lon: '23.3219' }],
    })) as jest.Mock;
    const { searchBulgarianAddress } = require('../geocodingService');

    await expect(searchBulgarianAddress('  София  ')).resolves.toEqual({
      id: '17', label: 'София, България', lat: 42.6977, lng: 23.3219,
    });
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(String((global.fetch as jest.Mock).mock.calls[0][0])).toContain('countrycodes=bg');
    expect(String((global.fetch as jest.Mock).mock.calls[0][0])).toContain('limit=1');
  });

  it('does not issue a request for an incomplete query', async () => {
    global.fetch = jest.fn() as jest.Mock;
    const { searchBulgarianAddress } = require('../geocodingService');
    await expect(searchBulgarianAddress('С')).resolves.toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
