export interface IdolStatistics {
  matches?: number;
  goals?: number;
  titles?: string[];
}

export interface Idol {
  _id: string;
  name: string;
  photoUrl: string;
  photoStorageKey?: string;
  description: string;
  isAthlete: boolean;
  role?: string;
  statistics?: IdolStatistics;
  isActive: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateIdolPayload {
  name: string;
  photoUrl: string;
  photoStorageKey?: string;
  description: string;
  isAthlete?: boolean;
  role?: string;
  statistics?: IdolStatistics;
  isActive?: boolean;
  order?: number;
}

export type UpdateIdolPayload = Partial<CreateIdolPayload>;
