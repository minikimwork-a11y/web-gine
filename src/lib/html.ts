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
