import { UserResponse } from './user.model';
import { RoleCode } from './role.model';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  document: string;
  documentType: string;
  photoUrl?: string;
  isActive?: boolean;
  emailVerified?: boolean;
  contacts?: ContactInput[];
  addresses?: AddressInput[];
}

export interface ContactInput {
  type: string;
  value: string;
  isPrimary?: boolean;
}

export interface AddressInput {
  type: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isPrimary?: boolean;
}

export interface AuthResponse {
  accessToken?: string;
  roleCode?: RoleCode;
  user: UserResponse;
  requiresEmailVerification?: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UpdateOwnUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  currentPassword?: string;
  password?: string;
  document?: string;
  documentType?: string;
  photoUrl?: string;
  contacts?: Array<{
    type: string;
    value: string;
    isPrimary?: boolean;
    verifiedAt?: string;
  }>;
  addresses?: Array<{
    type: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isPrimary?: boolean;
  }>;
}

export interface VerifyEmailPayload {
  email: string;
  code: string;
}

export interface ResendVerificationCodePayload {
  email: string;
}

export interface RequestEmailChangePayload {
  newEmail: string;
}

export interface ConfirmEmailChangePayload {
  code: string;
}

export interface RequestPhoneVerificationPayload {
  phone: string;
  channel: 'sms' | 'whatsapp';
}

export interface ConfirmPhoneVerificationPayload {
  code: string;
}

export interface RequestPasswordResetPayload {
  email: string;
}

export interface ConfirmPasswordResetPayload {
  email: string;
  code: string;
  newPassword: string;
}
