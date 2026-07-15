import DOMPurify from "isomorphic-dompurify";

/**
 * Decode HTML entities commonly produced by CMS or WYSIWYG editors.
 */
export const decodeHtml = (html: string | null): string => {
  if (!html) return "";
  return html
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
};

/**
 * Parse cover_image field which may be a JSON array string or a single URL.
 * Returns an array of image URLs.
 */
export const getImages = (coverImage: string | null): string[] => {
  if (!coverImage) return [];
  if (coverImage.startsWith("[")) {
    try {
      return JSON.parse(coverImage);
    } catch {
      return [coverImage];
    }
  }
  return [coverImage];
};

/**
 * Get the first cover image URL from the cover_image field.
 */
export const getCoverImageUrl = (coverImage: string | null): string => {
  const images = getImages(coverImage);
  return images[0] || "";
};

/**
 * Sanitize HTML string to prevent XSS attacks.
 */
export const sanitizeHtml = (html: string | null): string => {
  if (!html) return "";
  return DOMPurify.sanitize(html);
};

/**
 * Format HTML/Plain text content by converting newlines to <br /> tags,
 * while preserving formatting around block-level HTML tags.
 */
export const formatHtmlContent = (html: string | null): string => {
  if (!html) return "";
  
  // First sanitize
  const sanitized = sanitizeHtml(html);
  
  // If it doesn't contain any HTML tags, convert all newlines to <br />
  if (!/<[a-z/][^>]*>/i.test(sanitized)) {
    return sanitized.replace(/\n/g, "<br />");
  }
  
  // Split HTML into tags and text segments
  const parts = sanitized.split(/(<[^>]+>)/g);
  let result = "";
  
  // Block level HTML tags list
  const blockTags = /<\/?(ul|ol|li|h[1-6]|p|div|blockquote|table|tr|td|th|thead|tbody|option|select|pre|section|article|header|footer)/i;
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part.startsWith("<") && part.endsWith(">")) {
      result += part;
    } else {
      let text = part;
      
      const prevTag = i > 0 ? parts[i - 1] : "";
      const nextTag = i < parts.length - 1 ? parts[i + 1] : "";
      
      const isPrevBlock = blockTags.test(prevTag);
      const isNextBlock = blockTags.test(nextTag);
      
      if (isPrevBlock || isNextBlock) {
        // If it's purely whitespace and adjacent to block tags, keep it as is
        if (/^\s*$/.test(text)) {
          result += text;
          continue;
        }
      }
      
      // Strip exactly one leading newline if the previous tag is block level
      if (isPrevBlock && text.startsWith("\n")) {
        text = text.substring(1);
      }
      
      // Strip exactly one trailing newline if the next tag is block level
      if (isNextBlock && text.endsWith("\n")) {
        text = text.substring(0, text.length - 1);
      }
      
      // Convert remaining newlines to <br />
      result += text.replace(/\n/g, "<br />");
    }
  }
  
  return result;
};


/**
 * Mask resident registration number (주민등록번호).
 * Format: 000000-0000000 -> 000000-0******
 */
export const maskJumin = (jumin: string | null): string => {
  if (!jumin) return "";
  const cleaned = jumin.trim();
  if (cleaned.includes("-")) {
    const parts = cleaned.split("-");
    if (parts[0] && parts[1]) {
      return `${parts[0]}-${parts[1].charAt(0)}******`;
    }
  }
  if (cleaned.length >= 7) {
    return `${cleaned.slice(0, 6)}-${cleaned.charAt(6)}******`;
  }
  return cleaned;
};

/**
 * Mask bank account number.
 * Keeps the first 3 digits and the last 2 digits, masking the middle.
 */
export const maskBankAccount = (account: string | null): string => {
  if (!account) return "";
  const cleaned = account.trim();
  if (cleaned.length <= 6) {
    return cleaned.replace(/./g, "*");
  }
  const start = cleaned.slice(0, 3);
  const end = cleaned.slice(-2);
  const middle = cleaned.slice(3, -2).replace(/./g, "*");
  return `${start}-${middle}-${end}`;
};

