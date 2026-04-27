import { Module, forwardRef } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller.js';
import { SubscriptionsService } from './subscriptions.service.js';
import { SubscriptionsRepository } from './repositories/subscriptions.repository.js';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard.js';
import { AuthModule } from '../auth/index.js';
import { TenantsModule } from '../tenants/index.js';
import { PlansModule } from '../plans/index.js';

@Module({
  imports: [AuthModule, forwardRef(() => TenantsModule), PlansModule],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, SubscriptionsRepository, RateLimitGuard],
  exports: [SubscriptionsService, RateLimitGuard],
})
export class SubscriptionsModule {}
