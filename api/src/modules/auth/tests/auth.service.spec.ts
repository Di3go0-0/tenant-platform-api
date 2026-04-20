import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth.service.js';
import { AuthRepository } from '../repositories/auth.repository.js';
import { UsersService } from '../../users/users.service.js';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<Partial<UsersService>>;
  let authRepository: jest.Mocked<Partial<AuthRepository>>;
  let jwtService: jest.Mocked<Partial<JwtService>>;

  const mockUser = {
    id: 'user-uuid',
    email: 'test@test.com',
    password_hash: 'hashed_password',
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
  };

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    };

    authRepository = {
      createRefreshToken: jest.fn(),
      findRefreshToken: jest.fn(),
      revokeRefreshToken: jest.fn(),
      revokeAllUserTokens: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('access-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: AuthRepository, useValue: authRepository },
        { provide: JwtService, useValue: jwtService },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('7d'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('register', () => {
    it('should register a new user and return tokens', async () => {
      usersService.findByEmail!.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      usersService.create!.mockResolvedValue(mockUser);
      authRepository.createRefreshToken!.mockResolvedValue({
        id: 'token-uuid',
        user_id: mockUser.id,
        token: 'refresh-token',
        expires_at: new Date(),
        revoked: false,
        created_at: new Date(),
      });

      const result = await service.register({
        email: 'test@test.com',
        password: 'password123',
      });

      expect(result.access_token).toBe('access-token');
      expect(result.refresh_token).toBeDefined();
      expect(usersService.create).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
    });

    it('should throw ConflictException if email exists', async () => {
      usersService.findByEmail!.mockResolvedValue(mockUser);

      await expect(
        service.register({ email: 'test@test.com', password: 'password123' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should login and return tokens', async () => {
      usersService.findByEmail!.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      authRepository.createRefreshToken!.mockResolvedValue({
        id: 'token-uuid',
        user_id: mockUser.id,
        token: 'refresh-token',
        expires_at: new Date(),
        revoked: false,
        created_at: new Date(),
      });

      const result = await service.login({
        email: 'test@test.com',
        password: 'password123',
      });

      expect(result.access_token).toBe('access-token');
      expect(result.refresh_token).toBeDefined();
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      usersService.findByEmail!.mockResolvedValue(null);

      await expect(
        service.login({ email: 'wrong@test.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      usersService.findByEmail!.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('should refresh tokens with rotation', async () => {
      const storedToken = {
        id: 'token-uuid',
        user_id: mockUser.id,
        token: 'old-refresh-token',
        expires_at: new Date(Date.now() + 86400000),
        revoked: false,
        created_at: new Date(),
      };

      authRepository.findRefreshToken!.mockResolvedValue(storedToken);
      authRepository.revokeRefreshToken!.mockResolvedValue(undefined);
      usersService.findById!.mockResolvedValue(mockUser);
      authRepository.createRefreshToken!.mockResolvedValue({
        ...storedToken,
        token: 'new-refresh-token',
      });

      const result = await service.refresh('old-refresh-token');

      expect(result.access_token).toBe('access-token');
      expect(authRepository.revokeRefreshToken).toHaveBeenCalledWith(
        'old-refresh-token',
      );
    });

    it('should throw for invalid refresh token', async () => {
      authRepository.findRefreshToken!.mockResolvedValue(null);

      await expect(service.refresh('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw for expired refresh token', async () => {
      authRepository.findRefreshToken!.mockResolvedValue({
        id: 'token-uuid',
        user_id: mockUser.id,
        token: 'expired-token',
        expires_at: new Date(Date.now() - 86400000),
        revoked: false,
        created_at: new Date(),
      });

      await expect(service.refresh('expired-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should revoke the refresh token', async () => {
      authRepository.revokeRefreshToken!.mockResolvedValue(undefined);

      await service.logout('refresh-token');

      expect(authRepository.revokeRefreshToken).toHaveBeenCalledWith(
        'refresh-token',
      );
    });
  });
});
