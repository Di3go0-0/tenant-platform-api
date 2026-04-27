import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SubscriptionsService } from '../subscriptions.service.js';
import { SubscriptionsRepository } from '../repositories/subscriptions.repository.js';
import { PlansService } from '../../plans/plans.service.js';

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;
  let repository: jest.Mocked<Partial<SubscriptionsRepository>>;
  let plansService: jest.Mocked<Partial<PlansService>>;

  const mockPlan = {
    id: 'plan-uuid',
    name: 'starter',
    description: 'Starter plan',
    max_users: 10,
    max_requests_per_minute: 100,
    price: 9.99,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
  };

  const mockSubscription = {
    id: 'sub-uuid',
    tenant_id: 'tenant-uuid',
    plan_id: 'plan-uuid',
    status: 'active' as const,
    starts_at: new Date(),
    ends_at: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockSubscriptionWithPlan = {
    ...mockSubscription,
    plan_name: 'starter',
    max_users: 10,
    max_requests_per_minute: 100,
  };

  beforeEach(async () => {
    repository = {
      create: jest.fn().mockResolvedValue(mockSubscription),
      findById: jest.fn(),
      findActiveByTenant: jest.fn(),
      cancelSubscription: jest.fn(),
      cancelActiveByTenant: jest.fn(),
      countTenantUsers: jest.fn(),
    };

    plansService = {
      getPlanById: jest.fn().mockResolvedValue(mockPlan),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        { provide: SubscriptionsRepository, useValue: repository },
        { provide: PlansService, useValue: plansService },
      ],
    }).compile();

    service = module.get<SubscriptionsService>(SubscriptionsService);
  });

  describe('subscribe', () => {
    it('should create a subscription', async () => {
      repository.findActiveByTenant!.mockResolvedValue(null);

      const result = await service.subscribe({ tenantId: 'tenant-uuid', planId: 'plan-uuid' });
      expect(result).toEqual(mockSubscription);
    });

    it('should throw ConflictException if tenant already has active subscription', async () => {
      repository.findActiveByTenant!.mockResolvedValue(mockSubscriptionWithPlan);

      await expect(
        service.subscribe({ tenantId: 'tenant-uuid', planId: 'plan-uuid' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('changePlan', () => {
    it('should cancel old and create new subscription', async () => {
      repository.cancelActiveByTenant!.mockResolvedValue(mockSubscription);

      const result = await service.changePlan('tenant-uuid', 'new-plan-uuid');
      expect(result).toEqual(mockSubscription);
      expect(repository.cancelActiveByTenant).toHaveBeenCalledWith('tenant-uuid');
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel active subscription', async () => {
      repository.findActiveByTenant!.mockResolvedValue(mockSubscriptionWithPlan);
      repository.cancelSubscription!.mockResolvedValue(mockSubscription);

      await expect(service.cancelSubscription('tenant-uuid')).resolves.toBeUndefined();
    });

    it('should throw NotFoundException if no active subscription', async () => {
      repository.findActiveByTenant!.mockResolvedValue(null);

      await expect(service.cancelSubscription('tenant-uuid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('validateUserLimit', () => {
    it('should pass if under limit', async () => {
      repository.findActiveByTenant!.mockResolvedValue(mockSubscriptionWithPlan);
      repository.countTenantUsers!.mockResolvedValue(5);

      await expect(service.validateUserLimit('tenant-uuid')).resolves.toBeUndefined();
    });

    it('should throw ForbiddenException if at limit', async () => {
      repository.findActiveByTenant!.mockResolvedValue(mockSubscriptionWithPlan);
      repository.countTenantUsers!.mockResolvedValue(10);

      await expect(service.validateUserLimit('tenant-uuid')).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if no subscription', async () => {
      repository.findActiveByTenant!.mockResolvedValue(null);

      await expect(service.validateUserLimit('tenant-uuid')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getPlanLimits', () => {
    it('should return limits', async () => {
      repository.findActiveByTenant!.mockResolvedValue(mockSubscriptionWithPlan);

      const result = await service.getPlanLimits('tenant-uuid');
      expect(result).toEqual({ maxUsers: 10, maxRequestsPerMinute: 100 });
    });

    it('should return null if no subscription', async () => {
      repository.findActiveByTenant!.mockResolvedValue(null);

      const result = await service.getPlanLimits('tenant-uuid');
      expect(result).toBeNull();
    });
  });
});
