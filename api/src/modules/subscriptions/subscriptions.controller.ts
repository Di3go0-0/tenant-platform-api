import { Controller, Post, Get, Delete, Body, UseGuards, UseInterceptors, HttpCode, HttpStatus } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service.js';
import { CreateSubscriptionDto } from './dto/create-subscription.dto.js';
import type { SubscriptionEntity, SubscriptionWithPlan } from './types/subscription.types.js';
import { AuthGuard } from '../auth/index.js';
import { TenantGuard } from '../../common/guards/tenant.guard.js';
import { AuditLogInterceptor } from '../../common/interceptors/audit-log.interceptor.js';
import { Tenant } from '../../common/decorators/tenant.decorator.js';

@Controller('subscriptions')
@UseGuards(AuthGuard, TenantGuard)
@UseInterceptors(AuditLogInterceptor)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  async subscribe(
    @Body() dto: CreateSubscriptionDto,
    @Tenant() tenantId: string,
  ): Promise<SubscriptionEntity> {
    return this.subscriptionsService.subscribe({ tenantId, planId: dto.planId });
  }

  @Post('change')
  @HttpCode(HttpStatus.OK)
  async changePlan(
    @Body() dto: CreateSubscriptionDto,
    @Tenant() tenantId: string,
  ): Promise<SubscriptionEntity> {
    return this.subscriptionsService.changePlan(tenantId, dto.planId);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getActive(@Tenant() tenantId: string): Promise<SubscriptionWithPlan | null> {
    return this.subscriptionsService.getActiveSubscription(tenantId);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancel(@Tenant() tenantId: string): Promise<void> {
    return this.subscriptionsService.cancelSubscription(tenantId);
  }
}
