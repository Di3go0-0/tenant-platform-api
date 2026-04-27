import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { PlansService } from '../plans.service.js';
import { PlansRepository } from '../repositories/plans.repository.js';

describe('PlansService', () => {
  let service: PlansService;
  let repository: jest.Mocked<Partial<PlansRepository>>;

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

  beforeEach(async () => {
    repository = {
      create: jest.fn().mockResolvedValue(mockPlan),
      findById: jest.fn(),
      findByName: jest.fn(),
      findAll: jest.fn().mockResolvedValue([mockPlan]),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlansService,
        { provide: PlansRepository, useValue: repository },
      ],
    }).compile();

    service = module.get<PlansService>(PlansService);
  });

  describe('createPlan', () => {
    it('should create a plan', async () => {
      repository.findByName!.mockResolvedValue(null);

      const result = await service.createPlan({
        name: 'starter',
        description: 'Starter plan',
        maxUsers: 10,
        maxRequestsPerMinute: 100,
        price: 9.99,
      });

      expect(result).toEqual(mockPlan);
      expect(repository.create).toHaveBeenCalledWith('starter', 'Starter plan', 10, 100, 9.99);
    });

    it('should throw ConflictException if name exists', async () => {
      repository.findByName!.mockResolvedValue(mockPlan);

      await expect(
        service.createPlan({ name: 'starter', maxUsers: 10, maxRequestsPerMinute: 100, price: 9.99 }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('getPlanById', () => {
    it('should return a plan', async () => {
      repository.findById!.mockResolvedValue(mockPlan);

      const result = await service.getPlanById('plan-uuid');
      expect(result).toEqual(mockPlan);
    });

    it('should throw NotFoundException if not found', async () => {
      repository.findById!.mockResolvedValue(null);

      await expect(service.getPlanById('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllPlans', () => {
    it('should return all plans', async () => {
      const result = await service.getAllPlans();
      expect(result).toEqual([mockPlan]);
    });
  });

  describe('updatePlan', () => {
    it('should update a plan', async () => {
      repository.findById!.mockResolvedValue(mockPlan);
      repository.update!.mockResolvedValue({ ...mockPlan, name: 'pro' });

      const result = await service.updatePlan('plan-uuid', { name: 'pro' });
      expect(result.name).toBe('pro');
    });

    it('should throw NotFoundException if plan not found', async () => {
      repository.findById!.mockResolvedValue(null);

      await expect(service.updatePlan('missing', { name: 'pro' })).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if new name already exists', async () => {
      repository.findById!.mockResolvedValue(mockPlan);
      repository.findByName!.mockResolvedValue({ ...mockPlan, id: 'other-uuid', name: 'pro' });

      await expect(service.updatePlan('plan-uuid', { name: 'pro' })).rejects.toThrow(ConflictException);
    });
  });

  describe('deletePlan', () => {
    it('should delete a plan', async () => {
      repository.findById!.mockResolvedValue(mockPlan);
      repository.delete!.mockResolvedValue(mockPlan);

      await expect(service.deletePlan('plan-uuid')).resolves.toBeUndefined();
    });

    it('should throw NotFoundException if plan not found', async () => {
      repository.findById!.mockResolvedValue(null);

      await expect(service.deletePlan('missing')).rejects.toThrow(NotFoundException);
    });
  });
});
