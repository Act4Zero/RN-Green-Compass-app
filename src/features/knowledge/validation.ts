import type { KnowledgeBlock, KnowledgeItemDetail, KnowledgeTopic } from './types';

const APPROVED_VIDEO_HOSTS = ['youtube.com', 'www.youtube.com', 'youtu.be', 'vimeo.com', 'www.vimeo.com'];

export interface KnowledgeValidationIssue {
  field: string;
  message: string;
}

export function validateKnowledgeItem(item: KnowledgeItemDetail): KnowledgeValidationIssue[] {
  const issues: KnowledgeValidationIssue[] = [];
  if (!item.title.trim()) issues.push({ field: 'title', message: 'A title is required.' });
  if (!item.summary.trim()) issues.push({ field: 'summary', message: 'A summary is required.' });
  if (item.topicSlugs.length === 0) issues.push({ field: 'topics', message: 'At least one topic is required.' });
  if (item.sources.length === 0) issues.push({ field: 'sources', message: 'Factual content requires at least one source.' });
  if (!item.reviewer.trim()) issues.push({ field: 'reviewer', message: 'A reviewer is required.' });
  if (item.locale !== 'en' && item.locale !== 'bg') issues.push({ field: 'locale', message: 'The launch catalog supports English and Bulgarian.' });
  if (!isIsoDate(item.reviewedAt) || !isIsoDate(item.nextReviewAt)) issues.push({ field: 'reviewDates', message: 'Valid review dates are required.' });
  if (new Date(item.nextReviewAt) <= new Date(item.reviewedAt)) issues.push({ field: 'nextReviewAt', message: 'The next review must follow the current review.' });

  const sourceIds = new Set(item.sources.map((source) => source.id));
  for (const block of item.body) issues.push(...validateBlock(block, sourceIds));
  return issues;
}

function validateBlock(block: KnowledgeBlock, sourceIds: Set<string>): KnowledgeValidationIssue[] {
  const issues: KnowledgeValidationIssue[] = [];
  if (block.type === 'video') {
    try {
      const host = new URL(block.url).hostname;
      if (!APPROVED_VIDEO_HOSTS.includes(host)) issues.push({ field: block.id, message: 'Video provider is not approved.' });
    } catch {
      issues.push({ field: block.id, message: 'Video URL is invalid.' });
    }
    if (!block.transcript.trim()) issues.push({ field: block.id, message: 'Video transcript is required.' });
    if (!block.captionsUrl?.trim()) issues.push({ field: block.id, message: 'Video captions metadata is required.' });
  }
  if ((block.type === 'stat' || block.type === 'quote') && !sourceIds.has(block.sourceId)) {
    issues.push({ field: block.id, message: 'The cited source is missing.' });
  }
  if (block.type === 'infographic') {
    if (!block.textAlternative.trim()) issues.push({ field: block.id, message: 'Infographics require a text alternative.' });
    if (block.dataPoints.length < 2) issues.push({ field: block.id, message: 'Infographics require at least two data points.' });
    if (block.takeaways.length === 0) issues.push({ field: block.id, message: 'Infographics require at least one takeaway.' });
    for (const point of block.dataPoints) {
      if (!Number.isFinite(point.value)) issues.push({ field: `${block.id}.${point.id}`, message: 'Infographic values must be finite numbers.' });
      if (!sourceIds.has(point.sourceId)) issues.push({ field: `${block.id}.${point.id}`, message: 'Every infographic data point requires a published source.' });
    }
  }
  return issues;
}

export function validateKnowledgeTopicVisual(topic: KnowledgeTopic): KnowledgeValidationIssue[] {
  const issues: KnowledgeValidationIssue[] = [];
  const visual = topic.visual;
  if (!visual?.illustrationKey) issues.push({ field: topic.slug, message: 'An illustration mapping is required.' });
  if (!visual?.alt.en.trim() || !visual?.alt.bg.trim()) issues.push({ field: topic.slug, message: 'English and Bulgarian alt text are required.' });
  if (visual?.focalPoint.x < 0 || visual?.focalPoint.x > 1 || visual?.focalPoint.y < 0 || visual?.focalPoint.y > 1) issues.push({ field: topic.slug, message: 'The focal point must be normalized.' });
  if (visual?.dimensions.width <= 0 || visual?.dimensions.height <= 0) issues.push({ field: topic.slug, message: 'Valid illustration dimensions are required.' });
  if (!visual?.rights.owner || !visual?.rights.license) issues.push({ field: topic.slug, message: 'Rights metadata is required.' });
  for (const value of Object.values(visual?.palette || {})) if (!/^#[0-9A-Fa-f]{6}$/.test(value)) issues.push({ field: topic.slug, message: 'Every palette value must be a six-digit hex color.' });
  return issues;
}

function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(value).getTime());
}
