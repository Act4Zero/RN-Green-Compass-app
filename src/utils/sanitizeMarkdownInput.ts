/**
 * Utility for sanitizing markdown input to prevent XSS and other security issues
 * in community posts and comments
 */

const ALLOWED_PROTOCOLS = ['http:', 'https:', 'mailto:']

// Remove disallowed URLs like javascript: links
function sanitizeLinks(markdown: string): string {
  return markdown.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
    // Check for javascript: and other dangerous protocols
    if (/^javascript:/i.test(url) || 
        /^data:/i.test(url) || 
        /^vbscript:/i.test(url) ||
        /^file:/i.test(url)) {
      return `[${text}](#unsafe-link)`
    }
    
    try {
      // For absolute URLs, validate the protocol
      if (url.includes('://')) {
        const parsed = new URL(url)
        if (ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
          return `[${text}](${url})`
        } else {
          return `[${text}](#unsafe-link)`
        }
      }
      
      // For relative URLs, allow only if they don't contain suspicious patterns
      if (url.startsWith('#') || url.startsWith('/') || !url.includes(':')) {
        return `[${text}](${url})`
      }
      
      return `[${text}](#unsafe-link)`
    } catch {
      // If URL parsing fails but doesn't look suspicious, keep it
      if (!url.includes(':') && !url.includes('script')) {
        return `[${text}](${url})`
      }
      return `[${text}](#invalid-link)`
    }
  })
}

// Remove raw HTML tags like <script>, <iframe>, <img>, etc.
function stripHtmlTags(markdown: string): string {
  // First pass: remove standard HTML tags
  let cleaned = markdown.replace(/<\/?[^>]+(>|$)/g, '');
  
  // Second pass: handle HTML entities and other potential XSS vectors
  cleaned = cleaned
    // Convert HTML entities to prevent rendering
    .replace(/&(lt|gt|nbsp|amp|quot|apos);/g, '&amp;$1;')
    // Remove potential script injections that might bypass the first filter
    .replace(/([\s\S]*?)(\bon\w+\s*=|javascript:|data:text\/html)/gi, (match, p1, p2) => {
      return p1 + p2.replace(/[a-zA-Z]/g, '_');
    });
  
  return cleaned;
}

// Sanitize code blocks to prevent script execution
function sanitizeCodeBlocks(markdown: string): string {
  return markdown.replace(/```([\s\S]*?)```/g, (match, codeContent) => {
    // Escape any potentially dangerous content in code blocks
    const sanitizedCode = codeContent
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return '```' + sanitizedCode + '```';
  });
}

// Trim and limit length
export function sanitizeMarkdownInput(
  input: string,
  type: 'post' | 'comment' = 'post'
): string {
  if (!input) return '';
  
  const limit = type === 'post' ? 2000 : 300;

  // Order matters for sanitization:
  // 1. Trim whitespace
  let clean = input.trim();
  
  // 2. Sanitize code blocks (to preserve them but make them safe)
  clean = sanitizeCodeBlocks(clean);
  
  // 3. Remove HTML tags
  clean = stripHtmlTags(clean);
  
  // 4. Sanitize links
  clean = sanitizeLinks(clean);
  
  // 5. Final cleanup of any remaining dangerous patterns
  clean = clean
    // Replace any remaining script-like content
    .replace(/script/gi, 's_ript')
    // Replace any remaining on* event handlers
    .replace(/\bon\w+\s*=/gi, 'data-disabled-event=')
    // Replace any remaining javascript: mentions
    .replace(/javascript\s*:/gi, 'disabled-js:');
  
  // 6. Apply length limit
  if (clean.length > limit) {
    clean = clean.slice(0, limit);
  }

  return clean;
}

/**
 * Calculates remaining characters and returns status information
 * @param text The current text
 * @param isComment Whether the text is a comment (affects character limit)
 * @returns Object with character count information
 */
export const getCharacterInfo = (text: string, isComment: boolean = false) => {
  const maxLength = isComment ? 300 : 2000;
  const remaining = maxLength - (text?.length || 0);
  
  return {
    remaining,
    isNearLimit: remaining <= (isComment ? 50 : 200),
    isAtLimit: remaining <= 0,
    maxLength
  };
};
