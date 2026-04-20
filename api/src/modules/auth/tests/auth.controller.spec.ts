import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller.js';
import { AuthService } from '../auth.service.js';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<Partial<AuthService>>;

  const mockTokens = {
    access_token: 'access-token',
    refresh_token: 'refresh-token',
  };

  beforeEach(async () => {
    authService = {
      register: jest.fn().mockResolvedValue(mockTokens),
      login: jest.fn().mockResolvedValue(mockTokens),
      refresh: jest.fn().mockResolvedValue(mockTokens),
      logout: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('register', () => {
    it('should return tokens', async () => {
      const result = await controller.register({
        email: 'test@test.com',
        password: 'password123',
      });

      expect(result).toEqual(mockTokens);
      expect(authService.register).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password123',
      });
    });
  });

  describe('login', () => {
    it('should return tokens', async () => {
      const result = await controller.login({
        email: 'test@test.com',
        password: 'password123',
      });

      expect(result).toEqual(mockTokens);
    });
  });

  describe('refresh', () => {
    it('should return new tokens', async () => {
      const result = await controller.refresh({
        refresh_token: 'old-token',
      });

      expect(result).toEqual(mockTokens);
      expect(authService.refresh).toHaveBeenCalledWith('old-token');
    });
  });

  describe('logout', () => {
    it('should return success message', async () => {
      const result = await controller.logout({
        refresh_token: 'token-to-revoke',
      });

      expect(result).toEqual({ message: 'Logged out successfully' });
      expect(authService.logout).toHaveBeenCalledWith('token-to-revoke');
    });
  });
});
