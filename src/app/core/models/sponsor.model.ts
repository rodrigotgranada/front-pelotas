export interface Sponsor {
  _id: string;
  name: string;
  websiteUrl?: string;
  logoUrl: string;
  logoStorageKey?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSponsorDto {
  name: string;
  websiteUrl?: string;
  logoUrl: string;
  logoStorageKey?: string;
  isActive?: boolean;
  order?: number;
}

export interface UpdateSponsorDto extends Partial<CreateSponsorDto> {}
