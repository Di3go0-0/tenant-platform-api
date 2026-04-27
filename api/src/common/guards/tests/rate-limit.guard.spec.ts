import { ExecutionContext, HttpException } from '@nestjs/common';
import { RateLimitGuard } from '../rate-limit.guard.js';

describe('RateLimitGuard', () => {
  let guard: RateLimitGuard;
  let redis: { incr: jest.Mock; expire: jest.Mock; ttl: jest.Mock };
  let subscriptionsService: { getPlanLimits: jest.Mock };

  const mockContext = (tenantId?: string): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ tenantId }),
      }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    redis = {
      incr: jest.fn().mockResolvedValue(1),
      expire: jest.fn().mockResolvedValue(1),
      ttl: jest.fn().mockResolvedValue(55),
    };

    subscriptionsService = {
      getPlanLimits: jest.fn(),
    };

    guard = new RateLimitGuard(redis as any, subscriptionsService as any);
  });

  it('should allow request when no tenantId', async () => {
    const result = await guard.canActivate(mockContext());
    expect(result).toBe(true);
  });

  it('should allow request when no plan limits', async () => {
    subscriptionsService.getPlanLimits.mockResolvedValue(null);

    const result = await guard.canActivate(mockContext('tenant-uuid'));
    expect(result).toBe(true);
  });

  it('should allow request under limit', async () => {
    subscriptionsService.getPlanLimits.mockResolvedValue({ maxRequestsPerMinute: 60 });
    redis.incr.mockResolvedValue(1);

    const result = await guard.canActivate(mockContext('tenant-uuid'));
    expect(result).toBe(true);
    expect(redis.expire).toHaveBeenCalledWith('rate_limit:tenant-uuid', 60);
  });

  it('should set expire only on first request', async () => {
    subscriptionsService.getPlanLimits.mockResolvedValue({ maxRequestsPerMinute: 60 });
    redis.incr.mockResolvedValue(5);

    await guard.canActivate(mockContext('tenant-uuid'));
    expect(redis.expire).not.toHaveBeenCalled();
  });

  it('should throw 429 when over limit', async () => {
    subscriptionsService.getPlanLimits.mockResolvedValue({ maxRequestsPerMinute: 60 });
    redis.incr.mockResolvedValue(61);

    await expect(guard.canActivate(mockContext('tenant-uuid'))).rejects.toThrow(HttpException);
  });
});
