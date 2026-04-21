import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { UsersService } from '../users/users.service.js';
import { AuthRepository } from './repositories/auth.repository.js';
import { JwtPayload, AuthTokens, RegisterData, LoginData } from './types/auth.types.js';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly refreshTokenExpiration: string;

  constructor(
    private readonly usersService: UsersService,
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.refreshTokenExpiration =
      this.configService.get<string>('app.jwt.refreshTokenExpiration') || '7d';
  }

  async register(dto: RegisterData): Promise<AuthTokens> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.usersService.create(dto.email, passwordHash);

    return this.generateTokens({ sub: user.id, email: user.email });
  }

  async login(dto: LoginData): Promise<AuthTokens> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.password_hash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens({ sub: user.id, email: user.email });
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const storedToken =
      await this.authRepository.findRefreshToken(refreshToken);
    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (new Date(storedToken.expires_at) < new Date()) {
      await this.authRepository.revokeRefreshToken(refreshToken);
      throw new UnauthorizedException('Refresh token expired');
    }

    await this.authRepository.revokeRefreshToken(refreshToken);

    const user = await this.usersService.findById(storedToken.user_id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.generateTokens({ sub: user.id, email: user.email });
  }

  async logout(refreshToken: string): Promise<void> {
    await this.authRepository.revokeRefreshToken(refreshToken);
  }

  private async generateTokens(payload: JwtPayload): Promise<AuthTokens> {
    const accessToken = this.jwtService.sign(payload);

    const refreshToken = randomUUID();
    const expiresAt = this.calculateExpiration(this.refreshTokenExpiration);

    await this.authRepository.createRefreshToken(
      payload.sub,
      refreshToken,
      expiresAt,
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  private calculateExpiration(duration: string): Date {
    const now = new Date();
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) throw new Error(`Invalid duration format: ${duration}`);

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        now.setSeconds(now.getSeconds() + value);
        break;
      case 'm':
        now.setMinutes(now.getMinutes() + value);
        break;
      case 'h':
        now.setHours(now.getHours() + value);
        break;
      case 'd':
        now.setDate(now.getDate() + value);
        break;
    }
    return now;
  }
}
