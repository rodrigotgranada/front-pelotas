export type RoleCode = 'owner' | 'admin' | 'editor' | 'socio' | 'user';

export interface RoleResponse {
  id: string;
  code: RoleCode;
  name: string;
  level: number;
}
