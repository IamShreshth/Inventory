export interface ApiError {
  code: string;
  message: string;
  details?: Array<{
    field: string;
    issue: string;
  }>;
}

export interface ApiErrorResponse {
  error: ApiError;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  q?: string;
}

export type Role = 'super_admin' | 'org_admin' | 'berm_incharge' | 'borrower' | 'auditor';

export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  roles: Role[];
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse extends AuthTokens {
  user: User;
}
