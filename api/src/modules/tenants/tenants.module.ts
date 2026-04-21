import { Module } from '@nestjs/common';
import { TenantsController } from './tenants.controller.js';
import { TenantsService } from './tenants.service.js';
import { TenantsRepository } from './repositories/tenants.repository.js';
import { TenantGuard } from '../../common/guards/tenant.guard.js';
import { AuthModule } from '../auth/index.js';

@Module({
  imports: [AuthModule],
  controllers: [TenantsController],
  providers: [TenantsService, TenantsRepository, TenantGuard],
  exports: [TenantsService, TenantGuard],
})
export class TenantsModule {}
