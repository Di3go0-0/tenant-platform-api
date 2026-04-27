import { Controller, Post, Get, Delete, Body, UseGuards, UseInterceptors, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service.js';
import { CreateSubscriptionDto } from './dto/create-subscription.dto.js';
import type { SubscriptionEntity, SubscriptionWithPlan } from './types/subscription.types.js';
import { AuthGuard } from '../auth/index.js';
import { TenantGuard } from '../../common/guards/tenant.guard.js';
import { AuditLogInterceptor } from '../../common/interceptors/audit-log.interceptor.js';
import { Tenant } from '../../common/decorators/tenant.decorator.js';

@ApiTags('Subscriptions')
@ApiBearerAuth()
@ApiSecurity('tenant-id')
@Controller('subscriptions')
@UseGuards(AuthGuard, TenantGuard)
@UseInterceptors(AuditLogInterceptor)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @ApiOperation({ summary: 'Subscribe tenant to a plan' })
  @ApiResponse({ status: 201, description: 'Subscription created' })
  @ApiResponse({ status: 409, description: 'Tenant already has an active subscription' })
  async subscribe(
    @Body() dto: CreateSubscriptionDto,
    @Tenant() tenantId: string,
  ): Promise<SubscriptionEntity> {
    return this.subscriptionsService.subscribe({ tenantId, planId: dto.planId });
  }

  @Post('change')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change tenant plan' })
  @ApiResponse({ status: 200, description: 'Plan changed (old canceled, new created)' })
  async changePlan(
    @Body() dto: CreateSubscriptionDto,
    @Tenant() tenantId: string,
  ): Promise<SubscriptionEntity> {
    return this.subscriptionsService.changePlan(tenantId, dto.planId);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get active subscription' })
  @ApiResponse({ status: 200, description: 'Active subscription with plan details' })
  async getActive(@Tenant() tenantId: string): Promise<SubscriptionWithPlan | null> {
    return this.subscriptionsService.getActiveSubscription(tenantId);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancel active subscription' })
  @ApiResponse({ status: 204, description: 'Subscription canceled' })
  @ApiResponse({ status: 404, description: 'No active subscription' })
  async cancel(@Tenant() tenantId: string): Promise<void> {
    return this.subscriptionsService.cancelSubscription(tenantId);
  }
}
