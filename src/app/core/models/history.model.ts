export interface History {
  id: string;
  _id?: string;
  title: string;
  year?: string;
  slug: string;
  content: any;
  format: 'HTML' | 'BLOCKS';
  coverImageUrl?: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHistoryPayload {
  title: string;
  year?: string;
  slug?: string;
  content: any;
  format?: 'HTML' | 'BLOCKS';
  coverImageUrl?: string | null;
  order?: number;
  isActive?: boolean;
}

export type UpdateHistoryPayload = Partial<CreateHistoryPayload>;
