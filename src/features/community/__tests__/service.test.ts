import { communityEngagementService } from '../service';

const mockRpc = jest.fn();

jest.mock('@/lib/supabase', () => ({
  __esModule: true,
  default: {
    rpc: (...args: unknown[]) => mockRpc(...args),
    from: jest.fn(),
  },
}));

describe('community engagement service RPC contracts', () => {
  beforeEach(() => jest.clearAllMocks());

  it('creates a typed privacy-first group', async () => {
    mockRpc.mockResolvedValueOnce({ data: [{ id: 'group-1', name: 'Repair Team', description: 'Fix together', kind: 'team', role: 'owner', member_count: 1, share_summary: false, invite_code: 'ABC12345', invite_expires_at: '2026-09-01T00:00:00Z', created_at: '2026-08-26T00:00:00Z' }], error: null });
    const group = await communityEngagementService.createGroup({ name: ' Repair Team ', description: ' Fix together ', kind: 'team' });
    expect(mockRpc).toHaveBeenCalledWith('create_community_group', { p_name: 'Repair Team', p_description: 'Fix together', p_kind: 'team' });
    expect(group).toMatchObject({ id: 'group-1', kind: 'team', role: 'owner', shareSummary: false });
  });

  it('normalizes invite codes before joining', async () => {
    mockRpc.mockResolvedValueOnce({ data: [{ group_id: 'group-2' }], error: null });
    await expect(communityEngagementService.joinGroup(' ab-12cd34 ')).resolves.toBe('group-2');
    expect(mockRpc).toHaveBeenCalledWith('join_community_group_by_code', { p_invite_code: 'AB12CD34' });
  });

  it('maps scoped leaderboard values and current-user state', async () => {
    mockRpc.mockResolvedValueOnce({ data: { total_entries: 2, entries: [{ user_id: 'user-1', display_name: 'Alex', rank: 1, value: 540, is_current_user: true }] }, error: null });
    const result = await communityEngagementService.getLeaderboard({ scope: 'global', metric: 'points' });
    expect(result.totalEntries).toBe(2);
    expect(result.entries[0]).toEqual(expect.objectContaining({ userId: 'user-1', rank: 1, value: 540, isCurrentUser: true }));
  });

  it('requires a selected private team for team rankings', async () => {
    await expect(communityEngagementService.getLeaderboard({ scope: 'team', metric: 'streak' })).rejects.toThrow(/Choose a team/);
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it('keeps global leaderboard participation opt-in', async () => {
    mockRpc.mockResolvedValueOnce({ data: [{ global_enabled: false }], error: null });
    await expect(communityEngagementService.getLeaderboardPreferences()).resolves.toEqual({ globalEnabled: false });
    mockRpc.mockResolvedValueOnce({ data: null, error: null });
    await communityEngagementService.setGlobalLeaderboardSharing(true);
    expect(mockRpc).toHaveBeenLastCalledWith('set_community_global_leaderboard_sharing', { p_enabled: true });
  });
});
