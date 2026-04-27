import { Module } from '@nestjs/common';
import { PermissionsController } from './permissions.controller.js';
import { PermissionsService } from './permissions.service.js';
import { PermissionsRepository } from './repositories/permissions.repository.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { AuthModule } from '../auth/index.js';
import { TenantsModule } from '../tenants/index.js';
import { SubscriptionsModule } from '../subscriptions/index.js';
import { AuditLogsModule } from '../audit-logs/index.js';

@Module({
  imports: [AuthModule, TenantsModule, SubscriptionsModule, AuditLogsModule],
  controllers: [PermissionsController],
  providers: [PermissionsService, PermissionsRepository, PermissionsGuard],
  exports: [PermissionsService, PermissionsGuard],
})
export class PermissionsModule {}
