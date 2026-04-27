import { Injectable } from '@nestjs/common';
import { PlsqlService } from '../../../core/plsql/index.js';
import { SubscriptionQueries } from '../sql/subscriptions.sql.js';
import { SubscriptionEntity, SubscriptionWithPlan } from '../types/subscription.types.js';

@Injectable()
export class SubscriptionsRepository {
  constructor(private readonly plsqlService: PlsqlService) {}

  async create(tenantId: string, planId: string): Promise<SubscriptionEntity> {
    const subscription = await this.plsqlService.executeQueryOne<SubscriptionEntity>(
      SubscriptionQueries.CREATE_SUBSCRIPTION,
      [tenantId, planId],
    );
    if (!subscription) throw new Error('Failed to create subscription');
    return subscription;
  }

  async findById(id: string): Promise<SubscriptionEntity | null> {
    return this.plsqlService.executeQueryOne<SubscriptionEntity>(
      SubscriptionQueries.FIND_BY_ID,
      [id],
    );
  }

  async findActiveByTenant(tenantId: string): Promise<SubscriptionWithPlan | null> {
    return this.plsqlService.executeQueryOne<SubscriptionWithPlan>(
      SubscriptionQueries.FIND_ACTIVE_BY_TENANT,
      [tenantId],
    );
  }

  async cancelSubscription(id: string): Promise<SubscriptionEntity | null> {
    return this.plsqlService.executeQueryOne<SubscriptionEntity>(
      SubscriptionQueries.CANCEL_SUBSCRIPTION,
      [id],
    );
  }

  async cancelActiveByTenant(tenantId: string): Promise<SubscriptionEntity | null> {
    return this.plsqlService.executeQueryOne<SubscriptionEntity>(
      SubscriptionQueries.CANCEL_ACTIVE_BY_TENANT,
      [tenantId],
    );
  }

  async countTenantUsers(tenantId: string): Promise<number> {
    const result = await this.plsqlService.executeQueryOne<{ count: number }>(
      SubscriptionQueries.COUNT_TENANT_USERS,
      [tenantId],
    );
    return result?.count ?? 0;
  }
}
