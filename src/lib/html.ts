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

