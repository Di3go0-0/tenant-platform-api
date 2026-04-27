import { Module, forwardRef } from '@nestjs/common';
import { TenantsController } from './tenants.controller.js';
import { TenantsService } from './tenants.service.js';
import { TenantsRepository } from './repositories/tenants.repository.js';
import { TenantGuard } from '../../common/guards/tenant.guard.js';
import { AuthModule } from '../auth/index.js';
import { SubscriptionsModule } from '../subscriptions/index.js';
import { RolesRepository } from '../roles/repositories/roles.repository.js';

@Module({
  imports: [AuthModule, forwardRef(() => SubscriptionsModule)],
  controllers: [TenantsController],
  providers: [TenantsService, TenantsRepository, TenantGuard, RolesRepository],
  exports: [TenantsService, TenantGuard],
})
export class TenantsModule {}
