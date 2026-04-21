export type JwtPayload = {
  sub: string;
  email: string;
};

export type AuthTokens = {
  access_token: string;
  refresh_token: string;
};

export type RefreshTokenEntity = {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  revoked: boolean;
  created_at: Date;
};
