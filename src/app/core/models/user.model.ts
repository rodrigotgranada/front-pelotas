import { AddressInput, ContactInput } from './auth.model';
import { RoleCode } from './role.model';

export interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  document: string;
  documentType: string;
  roleId?: string;
  roleCode?: RoleCode;
  photoUrl?: string;
  isActive: boolean;
  status: 'active' | 'pending' | 'blocked' | 'suspended';
  statusReason?: string | null;
  emailVerified: boolean;
  lastLoginAt?: string;
  passwordUpdatedAt?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
  contacts?: UserContact[];
  addresses?: UserAddress[];
}

export interface UserContact {
  type: string;
  value: string;
  isPrimary: boolean;
  verifiedAt?: string;
}

export interface UserAddress {
  type: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isPrimary: boolean;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  document?: string;
  documentType?: string;
  roleId?: string;
  roleCode?: RoleCode;
  photoUrl?: string;
  isActive?: boolean;
  emailVerified?: boolean;
  contacts?: ContactInput[];
  addresses?: AddressInput[];
}

export interface UserContactResponse {
  type: string;
  value: string;
  isPrimary: boolean;
  verifiedAt?: string;
}

export interface UserAddressResponse {
  type: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isPrimary: boolean;
}

export interface UserMeResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  document?: string;
  documentType?: string;
  roleId?: string;
  roleCode?: RoleCode;
  roleName?: string;
  roleSlug?: string;
  role?: {
    name?: string;
    slug?: string;
  };
  photoUrl?: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt?: string;
  passwordUpdatedAt?: string;
  createdAt: string;
  createdBy?: string;
  updatedAt: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
  contacts?: UserContactResponse[];
  addresses?: UserAddressResponse[];
}

export interface ListUsersQuery {
  search?: string;
  role?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedUsersResponse {
  data: UserResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
