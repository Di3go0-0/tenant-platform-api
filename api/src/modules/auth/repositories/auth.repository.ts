import { Injectable } from '@nestjs/common';
import { PlsqlService } from '../../../core/plsql/index.js';
import { AuthQueries } from '../sql/auth.sql.js';
import { RefreshTokenEntity } from '../interfaces/auth.interfaces.js';

@Injectable()
export class AuthRepository {
  constructor(private readonly plsqlService: PlsqlService) {}

  async createRefreshToken(
    userId: string,
    token: string,
    expiresAt: Date,
  ): Promise<RefreshTokenEntity> {
    const result = await this.plsqlService.executeQueryOne<RefreshTokenEntity>(
      AuthQueries.CREATE_REFRESH_TOKEN,
      [userId, token, expiresAt],
    );
    if (!result) throw new Error('Failed to create refresh token');
    return result;
  }

  async findRefreshToken(token: string): Promise<RefreshTokenEntity | null> {
    return this.plsqlService.executeQueryOne<RefreshTokenEntity>(
      AuthQueries.FIND_REFRESH_TOKEN,
      [token],
    );
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this.plsqlService.executeQuery(AuthQueries.REVOKE_REFRESH_TOKEN, [
      token,
    ]);
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.plsqlService.executeQuery(AuthQueries.REVOKE_ALL_USER_TOKENS, [
      userId,
    ]);
  }
}
