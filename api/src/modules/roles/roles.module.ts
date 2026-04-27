import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller.js';
import { RolesService } from './roles.service.js';
import { RolesRepository } from './repositories/roles.repository.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { AuthModule } from '../auth/index.js';
import { TenantsModule } from '../tenants/index.js';
import { SubscriptionsModule } from '../subscriptions/index.js';
import { AuditLogsModule } from '../audit-logs/index.js';

@Module({
  imports: [AuthModule, TenantsModule, SubscriptionsModule, AuditLogsModule],
  controllers: [RolesController],
  providers: [RolesService, RolesRepository, RolesGuard],
  exports: [RolesService, RolesGuard],
})
export class RolesModule {}
