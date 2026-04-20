export interface JwtPayload {
  sub: string;
  email: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface RefreshTokenEntity {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  revoked: boolean;
  created_at: Date;
}
