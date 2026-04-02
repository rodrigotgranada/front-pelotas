export interface NewsCategory {
  id?: string;
  name: string;
  slug: string;
  isActive: boolean;
  description?: string;
}

export interface News {
  id: string;
  title: string;
  slug: string;
  subtitle?: string | null;
  authorDisplayName?: string | null;
  categories: string[];
  tags: string[];
  content: any;
  format: 'HTML' | 'BLOCKS';
  allowComments: boolean;
  allowLikes: boolean;
  likesCount: number;
  coverImageUrl?: string | null;
  isFeatured: boolean;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt?: string | null;
  author?: { id: string; name: string };
  lastEditor?: { id: string; name: string };
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedNews {
  items: News[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
