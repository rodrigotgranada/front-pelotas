import { UserMeResponse } from '../models/user.model';
import { RoleCode } from '../models/role.model';

export type AppRole = RoleCode;

const KNOWN_ROLES: readonly AppRole[] = ['owner', 'admin', 'editor', 'socio', 'user'];

const ROLE_ALIASES: Record<AppRole, readonly string[]> = {
  owner: ['owner', 'proprietario', 'proprietary'],
  admin: ['admin', 'administrador', 'administrator'],
  editor: ['editor'],
  socio: ['socio', 'associado', 'associate', 'member'],
  user: ['user', 'usuario', 'usuário'],
};

const ROLE_ID_MAP: Record<string, AppRole> = {
  '1': 'owner',
  '2': 'admin',
  '3': 'editor',
  '4': 'socio',
  '5': 'user',
};

function isAppRole(value: string): value is AppRole {
  return KNOWN_ROLES.includes(value as AppRole);
}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function getRoleFromUnknownCandidate(candidate: unknown): AppRole | null {
  if (typeof candidate === 'number' && Number.isFinite(candidate)) {
    return normalizeRoleId(String(candidate));
  }

  if (typeof candidate === 'string') {
    return normalizeRole(candidate) ?? normalizeRoleId(candidate);
  }

  return null;
}

function normalizeRole(rawRole: string | undefined | null): AppRole | null {
  if (!rawRole) {
    return null;
  }

  const role = normalizeText(rawRole);

  if (isAppRole(role)) {
    return role;
  }

  for (const knownRole of KNOWN_ROLES) {
    if (ROLE_ALIASES[knownRole].some((alias) => role.includes(alias))) {
      return knownRole;
    }
  }

  return null;
}

function normalizeRoleId(rawRoleId: string | undefined | null): AppRole | null {
  if (!rawRoleId) {
    return null;
  }

  const normalized = normalizeText(rawRoleId);
  if (ROLE_ID_MAP[normalized]) {
    return ROLE_ID_MAP[normalized];
  }

  return normalizeRole(normalized);
}

function readJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length < 2) {
    return null;
  }

  try {
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), '=');
    const decoded = atob(padded);
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function getRoleFromToken(token: string | null): AppRole | null {
  if (!token) {
    return null;
  }

  const payload = readJwtPayload(token);
  if (!payload) {
    return null;
  }

  const roleCandidates = [
    payload['role'],
    payload['roles'],
    payload['roleName'],
    payload['roleSlug'],
    payload['permissions'],
    payload['authorities'],
  ];

  for (const candidate of roleCandidates) {
    const directRole = getRoleFromUnknownCandidate(candidate);
    if (directRole) {
      return directRole;
    }

    if (Array.isArray(candidate)) {
      for (const item of candidate) {
        const normalized = getRoleFromUnknownCandidate(item);
        if (normalized) {
          return normalized;
        }
      }
    }
  }

  return null;
}

export function getUserRole(profile: UserMeResponse | null): AppRole | null {
  if (!profile) {
    return null;
  }

  const profileData = profile as UserMeResponse & {
    roleCode?: RoleCode;
    role?: string | { name?: string; slug?: string; id?: string; code?: string; key?: string | number };
    roles?: Array<string | number | { name?: string; slug?: string; id?: string | number; code?: string; key?: string }>;
    permissions?: Array<string | number>;
  };

  if (profileData.roleCode) {
    return profileData.roleCode;
  }

  const stringCandidates: Array<string | number | undefined> = [profile.roleName, profile.roleSlug, profile.roleId];

  if (typeof profileData.role === 'string') {
    stringCandidates.push(profileData.role);
  }

  for (const candidate of stringCandidates) {
    const role = getRoleFromUnknownCandidate(candidate);
    if (role) {
      return role;
    }
  }

  const roleObject = typeof profileData.role === 'object' && profileData.role ? profileData.role : undefined;
  const objectCandidates: Array<string | number | undefined> = [
    profile.role?.name,
    profile.role?.slug,
    roleObject?.id,
    roleObject?.code,
    roleObject?.key,
  ];

  for (const roleItem of profileData.roles ?? []) {
    if (typeof roleItem === 'string' || typeof roleItem === 'number') {
      objectCandidates.push(roleItem);
      continue;
    }

    objectCandidates.push(roleItem.name, roleItem.slug, roleItem.id, roleItem.code, roleItem.key);
  }

  for (const permission of profileData.permissions ?? []) {
    objectCandidates.push(permission);
  }

  for (const candidate of objectCandidates) {
    const role = getRoleFromUnknownCandidate(candidate);
    if (role) {
      return role;
    }
  }

  const rawRoleId = profile.roleId ?? roleObject?.id;
  return normalizeRoleId(rawRoleId);

}

export function resolveRole(profile: UserMeResponse | null, token?: string | null): AppRole | null {
  return getUserRole(profile) ?? getRoleFromToken(token ?? null);
}

export interface RoleDebugInfo {
  resolvedRole: AppRole | null;
  storedRoleCode: RoleCode | null;
  profileHints: {
    roleId?: string;
    roleCode?: RoleCode;
    roleName?: string;
    roleSlug?: string;
    role?: unknown;
    roles?: unknown;
    permissions?: unknown;
  };
  tokenHints: {
    role?: unknown;
    roles?: unknown;
    roleName?: unknown;
    roleSlug?: unknown;
    permissions?: unknown;
    authorities?: unknown;
  } | null;
}

export function getRoleDebugInfo(
  profile: UserMeResponse | null,
  token?: string | null,
  storedRoleCode: RoleCode | null = null,
): RoleDebugInfo {
  const payload = token ? readJwtPayload(token) : null;

  const profileData = (profile ?? {}) as UserMeResponse & {
    role?: unknown;
    roles?: unknown;
    permissions?: unknown;
  };

  return {
    resolvedRole: storedRoleCode ?? resolveRole(profile, token),
    storedRoleCode,
    profileHints: {
      roleId: profile?.roleId,
      roleCode: profile?.roleCode,
      roleName: profile?.roleName,
      roleSlug: profile?.roleSlug,
      role: profileData.role,
      roles: profileData.roles,
      permissions: profileData.permissions,
    },
    tokenHints: payload
      ? {
          role: payload['role'],
          roles: payload['roles'],
          roleName: payload['roleName'],
          roleSlug: payload['roleSlug'],
          permissions: payload['permissions'],
          authorities: payload['authorities'],
        }
      : null,
  };
}

export function hasAnyRole(profile: UserMeResponse | null, allowedRoles: readonly AppRole[], token?: string | null): boolean {
  const role = resolveRole(profile, token ?? null);
  return !!role && allowedRoles.includes(role);
}

export function resolveRoleWithStoredCode(
  profile: UserMeResponse | null,
  token: string | null | undefined,
  storedRoleCode: RoleCode | null,
): AppRole | null {
  return storedRoleCode ?? resolveRole(profile, token ?? null);
}
