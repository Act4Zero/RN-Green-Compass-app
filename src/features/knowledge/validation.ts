import type { KnowledgeBlock, KnowledgeItemDetail } from './types';

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
  }
  if ((block.type === 'stat' || block.type === 'quote') && !sourceIds.has(block.sourceId)) {
    issues.push({ field: block.id, message: 'The cited source is missing.' });
  }
  return issues;
}

function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(value).getTime());
}
