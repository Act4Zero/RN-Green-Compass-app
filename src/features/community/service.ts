import supabase from '@/lib/supabase';
import { normalizeInviteCode, validateCommunitySubmission } from './validation';
import type {
  CommunityGoalMetric,
  CommunityGroupKind,
  CommunityGroupDashboard,
  CommunityGroupSummary,
  CommunityOverview,
  CommunityLeaderboardEntry,
  CommunityLeaderboardMetric,
  CommunityLeaderboardScope,
  CommunityLeaderboardPreferences,
  CommunityProject,
  CommunitySubmission,
  CommunitySubmissionStatus,
  CommunitySubmissionType,
} from './types';

const rpc = (name: string, params: Record<string, unknown> = {}) => (supabase as any).rpc(name, params);
const table = (name: string) => (supabase as any).from(name);

function unwrap<T>(value: T | T[]): T {
  return Array.isArray(value) ? value[0] : value;
}

function groupFromRow(row: any): CommunityGroupSummary {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    kind: row.kind || 'team',
    role: row.role || 'member',
    memberCount: Number(row.member_count ?? row.memberCount ?? 0),
    shareSummary: Boolean(row.share_summary ?? row.shareSummary),
    inviteCode: row.invite_code || row.inviteCode || undefined,
    inviteExpiresAt: row.invite_expires_at || row.inviteExpiresAt || undefined,
    createdAt: row.created_at || row.createdAt,
  };
}

function projectFromRow(row: any, currentUserId?: string): CommunityProject {
  const participants = Array.isArray(row.community_project_participants) ? row.community_project_participants : [];
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    description: row.description,
    scope: row.scope,
    location: row.location,
    externalUrl: row.external_url,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    targetParticipants: row.target_participants,
    participantCount: Number(row.participant_count?.[0]?.count ?? row.participant_count ?? participants.length ?? 0),
    isParticipant: Boolean(row.is_participant ?? participants.some((participant: any) => participant.user_id === currentUserId)),
    seasonalTag: row.seasonal_tag,
    eventName: row.event_name,
    featured: Boolean(row.featured),
  };
}

function submissionFromRow(row: any): CommunitySubmission {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    body: row.body,
    url: row.url,
    status: row.status,
    reviewerNotes: row.reviewer_notes,
    featuredOn: row.featured_on,
    createdAt: row.created_at,
    authorName: row.profiles?.display_name || row.author_name || null,
  };
}

export const communityEngagementService = {
  async listGroups(): Promise<CommunityGroupSummary[]> {
    const { data, error } = await rpc('get_my_community_groups');
    if (error) throw new Error(error.message || 'Unable to load your groups.');
    const rows = Array.isArray(data) ? data : data ? [data] : [];
    return rows.map(groupFromRow);
  },

  async createGroup(input: { name: string; description?: string; kind: CommunityGroupKind }): Promise<CommunityGroupSummary> {
    const name = input.name.trim();
    const description = input.description?.trim() || '';
    if (name.length < 3 || name.length > 60) throw new Error('Group name must be between 3 and 60 characters.');
    if (description.length > 280) throw new Error('Group description must be 280 characters or fewer.');
    const { data, error } = await rpc('create_community_group', { p_name: name, p_description: description, p_kind: input.kind });
    if (error) throw new Error(error.message || 'Unable to create the group.');
    return groupFromRow(unwrap(data));
  },

  async joinGroup(inviteCode: string): Promise<string> {
    const code = normalizeInviteCode(inviteCode);
    if (code.length < 6) throw new Error('Enter the complete invite code.');
    const { data, error } = await rpc('join_community_group_by_code', { p_invite_code: code });
    if (error) throw new Error(error.message || 'This invite is invalid or expired.');
    return String(unwrap(data)?.group_id || unwrap(data)?.id || data);
  },

  async rotateInvite(groupId: string): Promise<{ inviteCode: string; inviteExpiresAt: string }> {
    const { data, error } = await rpc('rotate_community_group_invite', { p_group_id: groupId });
    if (error) throw new Error(error.message || 'Unable to refresh the invite code.');
    const row = unwrap(data);
    return { inviteCode: row.invite_code, inviteExpiresAt: row.invite_expires_at };
  },

  async getGroupDashboard(groupId: string): Promise<CommunityGroupDashboard> {
    const { data, error } = await rpc('get_community_group_dashboard', { p_group_id: groupId });
    if (error) throw new Error(error.message || 'Unable to load this group.');
    const value = unwrap(data) as any;
    return {
      group: groupFromRow(value.group),
      members: (value.members || []).map((member: any) => ({
        userId: member.user_id,
        displayName: member.display_name || 'Community member',
        avatarUrl: member.avatar_url,
        isCurrentUser: Boolean(member.is_current_user),
        sharingEnabled: Boolean(member.sharing_enabled),
        totalPoints: member.total_points == null ? undefined : Number(member.total_points),
        loginStreak: member.login_streak == null ? undefined : Number(member.login_streak),
        completedActions: member.completed_actions == null ? undefined : Number(member.completed_actions),
        co2eKgAvoided: member.co2e_kg_avoided == null ? undefined : Number(member.co2e_kg_avoided),
      })),
      goals: (value.goals || []).map((goal: any) => ({
        id: goal.id,
        groupId: goal.group_id,
        title: goal.title,
        description: goal.description || '',
        metric: goal.metric,
        targetValue: Number(goal.target_value),
        currentValue: Number(goal.current_value || 0),
        startsOn: goal.starts_on,
        endsOn: goal.ends_on,
        status: goal.status,
        createdBy: goal.created_by,
        myContribution: Number(goal.my_contribution || 0),
        contributors: (goal.contributors || []).map((contributor: any) => ({ userId: contributor.user_id, displayName: contributor.display_name || 'Community member', value: Number(contributor.value || 0), isCurrentUser: Boolean(contributor.is_current_user) })),
      })),
    };
  },

  async getLeaderboard(input: { scope: CommunityLeaderboardScope; metric: CommunityLeaderboardMetric; groupId?: string; page?: number; pageSize?: number }): Promise<{ entries: CommunityLeaderboardEntry[]; totalEntries: number }> {
    if (input.scope === 'team' && !input.groupId) throw new Error('Choose a team for the team leaderboard.');
    const { data, error } = await rpc('get_scoped_community_leaderboard', {
      p_scope: input.scope,
      p_metric: input.metric,
      p_group_id: input.groupId || null,
      p_page: input.page || 1,
      p_page_size: input.pageSize || 25,
    });
    if (error) throw new Error(error.message || 'Unable to load the leaderboard.');
    const value = unwrap(data) as any;
    return {
      totalEntries: Number(value.total_entries || 0),
      entries: (value.entries || []).map((entry: any) => ({
        userId: entry.user_id,
        displayName: entry.display_name || 'Community member',
        avatarUrl: entry.avatar_url,
        rank: Number(entry.rank),
        value: Number(entry.value || 0),
        isCurrentUser: Boolean(entry.is_current_user),
      })),
    };
  },

  async getLeaderboardPreferences(): Promise<CommunityLeaderboardPreferences> {
    const { data, error } = await rpc('get_community_leaderboard_preferences');
    if (error) throw new Error(error.message || 'Unable to load leaderboard privacy.');
    const value = unwrap(data) as any;
    return { globalEnabled: Boolean(value?.global_enabled) };
  },

  async setGlobalLeaderboardSharing(enabled: boolean): Promise<void> {
    const { error } = await rpc('set_community_global_leaderboard_sharing', { p_enabled: enabled });
    if (error) throw new Error(error.message || 'Unable to update global leaderboard privacy.');
  },

  async setSummarySharing(groupId: string, enabled: boolean): Promise<void> {
    const { error } = await rpc('set_community_group_summary_sharing', { p_group_id: groupId, p_enabled: enabled });
    if (error) throw new Error(error.message || 'Unable to update sharing.');
  },

  async createGoal(input: { groupId: string; title: string; description?: string; metric: CommunityGoalMetric; targetValue: number; startsOn: string; endsOn: string }): Promise<string> {
    const title = input.title.trim();
    if (title.length < 5 || title.length > 100) throw new Error('Goal title must be between 5 and 100 characters.');
    if (!Number.isFinite(input.targetValue) || input.targetValue <= 0) throw new Error('Goal target must be greater than zero.');
    if (input.endsOn < input.startsOn) throw new Error('Goal end date must be after its start date.');
    const { data, error } = await rpc('create_community_group_goal', {
      p_group_id: input.groupId,
      p_title: title,
      p_description: input.description?.trim() || '',
      p_metric: input.metric,
      p_target_value: input.targetValue,
      p_starts_on: input.startsOn,
      p_ends_on: input.endsOn,
    });
    if (error) throw new Error(error.message || 'Unable to create the shared goal.');
    return String(unwrap(data)?.id || data);
  },

  async addGoalContribution(goalId: string, value: number, note = ''): Promise<void> {
    if (!Number.isFinite(value) || value <= 0) throw new Error('Contribution must be greater than zero.');
    if (note.trim().length > 280) throw new Error('Contribution note must be 280 characters or fewer.');
    const { error } = await rpc('add_community_goal_contribution', { p_goal_id: goalId, p_value: value, p_note: note.trim(), p_event_id: randomId() });
    if (error) throw new Error(error.message || 'Unable to add the contribution.');
  },

  async listProjects(currentUserId?: string): Promise<CommunityProject[]> {
    const { data, error } = await table('community_projects')
      .select('*, participant_count:community_project_participants(count), community_project_participants(user_id)')
      .eq('status', 'published')
      .order('featured', { ascending: false })
      .order('starts_at', { ascending: true });
    if (error) throw new Error(error.message || 'Unable to load community projects.');
    return (data || []).map((row: any) => projectFromRow(row, currentUserId));
  },

  async setProjectParticipation(projectId: string, participating: boolean): Promise<void> {
    const { error } = await rpc('set_community_project_participation', { p_project_id: projectId, p_participating: participating });
    if (error) throw new Error(error.message || 'Unable to update project participation.');
  },

  async getFeaturedSubmission(date = new Date().toISOString().slice(0, 10)): Promise<CommunitySubmission | null> {
    const { data, error } = await table('community_submissions')
      .select('*, profiles:user_id(display_name)')
      .eq('status', 'approved')
      .lte('featured_on', date)
      .order('featured_on', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message || 'Unable to load the community spotlight.');
    return data ? submissionFromRow(data) : null;
  },

  async listMySubmissions(userId: string): Promise<CommunitySubmission[]> {
    const { data, error } = await table('community_submissions').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw new Error(error.message || 'Unable to load your submissions.');
    return (data || []).map(submissionFromRow);
  },

  async submitContent(userId: string, input: { type: CommunitySubmissionType; title: string; body: string; url?: string | null }): Promise<CommunitySubmission> {
    const validated = validateCommunitySubmission(input);
    const { data, error } = await table('community_submissions').insert({ user_id: userId, type: validated.type, title: validated.title, body: validated.body, url: validated.url }).select().single();
    if (error) throw new Error(error.message || 'Unable to submit your contribution.');
    return submissionFromRow(data);
  },

  async listReviewQueue(): Promise<CommunitySubmission[]> {
    const { data, error } = await table('community_submissions').select('*, profiles:user_id(display_name)').in('status', ['pending', 'in_review']).order('created_at', { ascending: true });
    if (error) throw new Error(error.message || 'Unable to load the review queue.');
    return (data || []).map(submissionFromRow);
  },

  async reviewSubmission(input: { submissionId: string; status: Extract<CommunitySubmissionStatus, 'approved' | 'rejected'>; notes?: string; featuredOn?: string | null }): Promise<void> {
    const { error } = await rpc('review_community_submission', {
      p_submission_id: input.submissionId,
      p_status: input.status,
      p_reviewer_notes: input.notes?.trim() || '',
      p_featured_on: input.status === 'approved' ? input.featuredOn || new Date().toISOString().slice(0, 10) : null,
    });
    if (error) throw new Error(error.message || 'Unable to review the submission.');
  },

  async reportDiscussion(discussionId: string, reason: 'spam' | 'harassment' | 'misinformation' | 'unsafe' | 'other' = 'other', details = ''): Promise<void> {
    const { error } = await rpc('report_community_discussion', { p_discussion_id: discussionId, p_reason: reason, p_details: details.trim().slice(0, 500) });
    if (error) throw new Error(error.message || 'Unable to submit this report.');
  },

  async listModerationReports(): Promise<any[]> {
    const { data, error } = await table('community_content_reports').select('*, discussions:discussion_id(id,title,content,category,status,user_id)').eq('status', 'open').order('created_at', { ascending: true });
    if (error) throw new Error(error.message || 'Unable to load moderation reports.');
    return data || [];
  },

  async moderateDiscussion(discussionId: string, status: 'published' | 'hidden' | 'removed', pinned = false): Promise<void> {
    const { error } = await rpc('moderate_community_discussion', { p_discussion_id: discussionId, p_status: status, p_pin: pinned });
    if (error) throw new Error(error.message || 'Unable to moderate this discussion.');
  },

  async getOverview(currentUserId?: string): Promise<CommunityOverview> {
    const [groupsResult, projectsResult, submissionResult] = await Promise.allSettled([
      this.listGroups(),
      this.listProjects(currentUserId),
      this.getFeaturedSubmission(),
    ]);
    return {
      groups: groupsResult.status === 'fulfilled' ? groupsResult.value : [],
      featuredProjects: projectsResult.status === 'fulfilled' ? projectsResult.value.filter((project) => project.featured).slice(0, 2) : [],
      featuredSubmission: submissionResult.status === 'fulfilled' ? submissionResult.value : null,
    };
  },
};

function randomId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const random = Math.floor(Math.random() * 16);
    return (character === 'x' ? random : (random & 0x3) | 0x8).toString(16);
  });
}

export default communityEngagementService;
