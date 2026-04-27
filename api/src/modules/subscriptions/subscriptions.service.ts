import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SubscriptionsRepository } from './repositories/subscriptions.repository.js';
import { PlansService } from '../plans/index.js';
import { SubscriptionEntity, SubscriptionWithPlan, CreateSubscriptionData } from './types/subscription.types.js';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly subscriptionsRepository: SubscriptionsRepository,
    private readonly plansService: PlansService,
  ) {}

  async subscribe(data: CreateSubscriptionData): Promise<SubscriptionEntity> {
    await this.plansService.getPlanById(data.planId);

    const active = await this.subscriptionsRepository.findActiveByTenant(data.tenantId);
    if (active) {
      throw new ConflictException('Tenant already has an active subscription');
    }

    return this.subscriptionsRepository.create(data.tenantId, data.planId);
  }

  async changePlan(tenantId: string, planId: string): Promise<SubscriptionEntity> {
    await this.plansService.getPlanById(planId);

    await this.subscriptionsRepository.cancelActiveByTenant(tenantId);

    return this.subscriptionsRepository.create(tenantId, planId);
  }

  async getActiveSubscription(tenantId: string): Promise<SubscriptionWithPlan | null> {
    return this.subscriptionsRepository.findActiveByTenant(tenantId);
  }

  async cancelSubscription(tenantId: string): Promise<void> {
    const active = await this.subscriptionsRepository.findActiveByTenant(tenantId);
    if (!active) {
      throw new NotFoundException('No active subscription found');
    }

    await this.subscriptionsRepository.cancelSubscription(active.id);
  }

  async validateUserLimit(tenantId: string): Promise<void> {
    const subscription = await this.subscriptionsRepository.findActiveByTenant(tenantId);
    if (!subscription) {
      throw new ForbiddenException('Tenant has no active subscription');
    }

    const userCount = await this.subscriptionsRepository.countTenantUsers(tenantId);
    if (userCount >= subscription.max_users) {
      throw new ForbiddenException(
        `User limit reached. Plan "${subscription.plan_name}" allows ${subscription.max_users} users`,
      );
    }
  }

  async getPlanLimits(tenantId: string): Promise<{ maxUsers: number; maxRequestsPerMinute: number } | null> {
    const subscription = await this.subscriptionsRepository.findActiveByTenant(tenantId);
    if (!subscription) return null;

    return {
      maxUsers: subscription.max_users,
      maxRequestsPerMinute: subscription.max_requests_per_minute,
    };
  }
}
