import { Module, forwardRef } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller.js';
import { SubscriptionsService } from './subscriptions.service.js';
import { SubscriptionsRepository } from './repositories/subscriptions.repository.js';
import { AuthModule } from '../auth/index.js';
import { TenantsModule } from '../tenants/index.js';
import { PlansModule } from '../plans/index.js';
import { AuditLogsModule } from '../audit-logs/index.js';

@Module({
  imports: [AuthModule, forwardRef(() => TenantsModule), PlansModule, AuditLogsModule],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, SubscriptionsRepository],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
