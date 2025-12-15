export interface JwtPayload {
  userId: number;
  email?: string;
}

export interface User {
  id: number;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshResult {
  accessToken: string;
  refreshToken: string;
}
