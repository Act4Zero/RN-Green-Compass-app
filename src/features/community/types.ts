export type CommunityGroupRole = 'owner' | 'member';
export type CommunityGroupKind = 'friends' | 'team' | 'local';
export type CommunityGoalMetric = 'points' | 'actions' | 'co2e_kg';
export type CommunityProjectScope = 'local' | 'global';
export type CommunitySubmissionType = 'story' | 'tip' | 'article' | 'video' | 'project_idea';
export type CommunitySubmissionStatus = 'pending' | 'in_review' | 'approved' | 'rejected';

export interface CommunityGroupSummary {
  id: string;
  name: string;
  description: string;
  kind: CommunityGroupKind;
  role: CommunityGroupRole;
  memberCount: number;
  shareSummary: boolean;
  inviteCode?: string;
  inviteExpiresAt?: string;
  createdAt: string;
}

export interface CommunityMemberComparison {
  userId: string;
  displayName: string;
  avatarUrl?: string | null;
  isCurrentUser: boolean;
  sharingEnabled: boolean;
  totalPoints?: number;
  loginStreak?: number;
  completedActions?: number;
  co2eKgAvoided?: number;
}

export interface CommunityGoal {
  id: string;
  groupId: string;
  title: string;
  description: string;
  metric: CommunityGoalMetric;
  targetValue: number;
  currentValue: number;
  startsOn: string;
  endsOn: string;
  status: 'active' | 'completed' | 'archived';
  createdBy: string;
  myContribution: number;
  contributors: { userId: string; displayName: string; value: number; isCurrentUser: boolean }[];
}

export interface CommunityGroupDashboard {
  group: CommunityGroupSummary;
  members: CommunityMemberComparison[];
  goals: CommunityGoal[];
}

export interface CommunityProject {
  id: string;
  title: string;
  summary: string;
  description: string;
  scope: CommunityProjectScope;
  location?: string | null;
  externalUrl?: string | null;
  startsAt: string;
  endsAt: string;
  targetParticipants?: number | null;
  participantCount: number;
  isParticipant: boolean;
  seasonalTag?: string | null;
  eventName?: string | null;
  featured: boolean;
}

export interface CommunitySubmission {
  id: string;
  userId: string;
  type: CommunitySubmissionType;
  title: string;
  body: string;
  url?: string | null;
  status: CommunitySubmissionStatus;
  reviewerNotes?: string | null;
  featuredOn?: string | null;
  createdAt: string;
  authorName?: string | null;
}

export interface CommunityOverview {
  groups: CommunityGroupSummary[];
  featuredProjects: CommunityProject[];
  featuredSubmission: CommunitySubmission | null;
}

export type CommunityLeaderboardScope = 'friends' | 'local' | 'team' | 'global';
export type CommunityLeaderboardMetric = 'points' | 'streak';

export interface CommunityLeaderboardEntry {
  userId: string;
  displayName: string;
  avatarUrl?: string | null;
  rank: number;
  value: number;
  isCurrentUser: boolean;
}

export interface CommunityLeaderboardPreferences {
  globalEnabled: boolean;
}

export interface CommunityRewardTier {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  icon: 'leaf-outline' | 'ribbon-outline' | 'earth-outline' | 'sparkles-outline';
}
