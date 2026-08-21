export type KnowledgeLocale = 'en' | 'bg';
export type KnowledgeContentType =
  | 'article'
  | 'guide'
  | 'video'
  | 'quiz'
  | 'resource'
  | 'diy'
  | 'tour'
  | 'simulation'
  | 'webinar'
  | 'daily_fact'
  | 'daily_quote'
  | 'daily_tip';
export type KnowledgeDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type KnowledgeStatus = 'draft' | 'in_review' | 'scheduled' | 'published' | 'archived';

export interface KnowledgeTopic {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  accent: string;
  visual: KnowledgeVisual;
  order: number;
}

export interface KnowledgePalette {
  primary: string;
  secondary: string;
  foreground: string;
  surface: string;
  darkSurface: string;
}

export interface KnowledgeVisual {
  illustrationKey: string;
  alt: Record<KnowledgeLocale, string>;
  focalPoint: { x: number; y: number };
  dimensions: { width: number; height: number };
  rights: { owner: 'Green Compass'; license: 'Original commissioned artwork'; generatedOn: string };
  palette: KnowledgePalette;
}

export interface KnowledgeSource {
  id: string;
  publisher: string;
  title: string;
  url: string;
  sourceType: 'government' | 'intergovernmental' | 'research' | 'university' | 'ngo';
  publishedOn?: string;
  accessedOn: string;
  license?: string;
}

export type KnowledgeAction =
  | { type: 'habit'; label: string; route: '/habits/log'; category?: string }
  | { type: 'goal'; label: string; route: '/habits/goal'; category?: string }
  | { type: 'map'; label: string; route: '/map'; query?: string }
  | { type: 'community'; label: string; route: '/community/post/new-post' };

export type KnowledgeBlock =
  | { id: string; type: 'heading'; text: string; level: 2 | 3 }
  | { id: string; type: 'paragraph'; text: string }
  | { id: string; type: 'list'; items: string[] }
  | { id: string; type: 'callout'; tone: 'info' | 'success' | 'warning'; title: string; text: string }
  | { id: string; type: 'stat'; value: string; label: string; sourceId: string }
  | { id: string; type: 'checklist'; items: string[] }
  | { id: string; type: 'quote'; text: string; attribution: string; sourceId: string }
  | { id: string; type: 'video'; provider: 'youtube' | 'vimeo'; url: string; title: string; transcript: string; captionsUrl?: string; consentRequired?: boolean }
  | { id: string; type: 'download'; title: string; description: string; sizeLabel: string; uri?: string }
  | { id: string; type: 'action'; title: string; text: string; action: KnowledgeAction };

export interface KnowledgeItemSummary {
  id: string;
  versionId: string;
  slug: string;
  locale: KnowledgeLocale;
  type: KnowledgeContentType;
  title: string;
  summary: string;
  topicSlugs: string[];
  difficulty: KnowledgeDifficulty;
  estimatedMinutes: number;
  publishedAt: string;
  reviewedAt: string;
  nextReviewAt: string;
  downloadable: boolean;
  editorPick?: boolean;
  action?: KnowledgeAction;
  visual?: Partial<KnowledgeVisual>;
  formatLabel?: string;
}

export interface KnowledgeItemDetail extends KnowledgeItemSummary {
  author: string;
  reviewer: string;
  body: KnowledgeBlock[];
  sources: KnowledgeSource[];
  searchText: string;
  version: number;
  checksum: string;
}

export interface KnowledgeProgress {
  itemId: string;
  versionId: string;
  percent: number;
  completed: boolean;
  updatedAt: string;
  eventId: string;
}

export interface KnowledgeBookmark {
  itemId: string;
  createdAt: string;
}

export interface KnowledgeDownload {
  itemId: string;
  versionId: string;
  checksum: string;
  downloadedAt: string;
  manifest: KnowledgeDownloadManifest;
  content: KnowledgeItemDetail;
}

export interface KnowledgeDownloadManifest {
  itemId: string;
  versionId: string;
  checksum: string;
  estimatedBytes: number;
  mediaFiles: { blockId: string; title: string; sizeLabel: string; uri?: string }[];
}

export interface KnowledgeTourStop {
  id: string;
  title: Record<KnowledgeLocale, string>;
  body: Record<KnowledgeLocale, string>;
  fact: Record<KnowledgeLocale, string>;
  icon: string;
}

export interface KnowledgeTour {
  id: string;
  itemId: string;
  durationMinutes: number;
  stops: KnowledgeTourStop[];
}

export type SimulationKind = 'home-energy' | 'food-waste' | 'mobility';
export interface KnowledgeSimulation {
  id: string;
  itemId: string;
  kind: SimulationKind;
  methodologySourceId: string;
}

export interface KnowledgeWebinar {
  id: string;
  itemId: string;
  speaker: string;
  speakerRole: string;
  startsAt: string;
  durationMinutes: number;
  timezone: string;
  provider: 'youtube' | 'zoom' | 'vimeo';
  joinUrl: string;
  replayUrl?: string;
  transcript?: string;
}

export interface KnowledgeWebinarRegistration {
  webinarId: string;
  registeredAt: string;
  reminderEnabled: boolean;
}

export interface KnowledgeLearningPath {
  id: string;
  slug: string;
  locale: KnowledgeLocale;
  title: string;
  summary: string;
  topicSlug: string;
  moduleItemIds: string[];
  requiredQuizItemIds: string[];
  passingScore: number;
}

export interface KnowledgeCertificate extends CertificateVerification {
  downloadUrl?: string;
}

export interface DailyPreference {
  locale: KnowledgeLocale;
  topicSlugs: string[];
  widgetSize: 'small' | 'medium';
}

export interface SimulationInputs {
  primary: number;
  secondary: number;
  tertiary: number;
}

export interface SimulationResult {
  score: number;
  unit: string;
  baseline: number;
  improvementPercent: number;
  summary: string;
}

export interface QuizAnswerOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: QuizAnswerOption[];
  correctOptionId: string;
  explanation: string;
  sourceId: string;
}

export interface KnowledgeQuiz {
  id: string;
  itemId: string;
  passingScore: number;
  questions: QuizQuestion[];
}

export type PublicQuizQuestion = Omit<QuizQuestion, 'correctOptionId'>;

export interface PublicKnowledgeQuiz extends Omit<KnowledgeQuiz, 'questions'> {
  questions: PublicQuizQuestion[];
}

export interface QuizAttemptResult {
  attemptId: string;
  score: number;
  passed: boolean;
  correctAnswers: number;
  totalQuestions: number;
  feedback: { questionId: string; correct: boolean; explanation: string; sourceId: string }[];
}

export interface KnowledgeSearchFilters {
  topic?: string;
  type?: KnowledgeContentType;
  difficulty?: KnowledgeDifficulty;
  maxMinutes?: number;
  downloadable?: boolean;
  sort?: 'relevance' | 'newest' | 'reviewed' | 'shortest';
}

export interface KnowledgeHomeData {
  dailyDose: KnowledgeItemDetail;
  continueLearning: (KnowledgeItemSummary & { progress: number })[];
  recommendations: (KnowledgeItemSummary & { reason: string })[];
  actionItems: KnowledgeItemSummary[];
  newest: KnowledgeItemSummary[];
  interactive: KnowledgeItemSummary[];
  live: KnowledgeItemSummary[];
  paths: KnowledgeLearningPath[];
  editorPicks: KnowledgeItemSummary[];
  topics: KnowledgeTopic[];
}

export interface CertificateVerification {
  code: string;
  status: 'valid' | 'revoked';
  pathTitle: string;
  holderName: string;
  issuedAt: string;
  version: number;
  accreditationClaim: false;
}
