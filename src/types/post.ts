export interface Post {
  id: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  is_published: boolean;
  published_at: string;
  created_at: string;
  likes_heart: number;
  likes_cheer: number;
  likes_best: number;
  likes_thanks: number;
}

export interface PostSummary {
  id: string;
  title: string;
  excerpt: string | null;
  cover_image: string | null;
  published_at: string;
  created_at: string;
  likes_heart: number;
  likes_cheer: number;
  likes_best: number;
  likes_thanks: number;
}

export interface PostNavItem {
  id: string;
  title: string;
}
