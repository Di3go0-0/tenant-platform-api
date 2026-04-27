import { Module } from '@nestjs/common';
import { AuditLogsController } from './audit-logs.controller.js';
import { AuditLogsService } from './audit-logs.service.js';
import { AuditLogsRepository } from './repositories/audit-logs.repository.js';
import { AuditLogInterceptor } from '../../common/interceptors/audit-log.interceptor.js';
import { AuthModule } from '../auth/index.js';
import { TenantsModule } from '../tenants/index.js';

@Module({
  imports: [AuthModule, TenantsModule],
  controllers: [AuditLogsController],
  providers: [AuditLogsService, AuditLogsRepository, AuditLogInterceptor],
  exports: [AuditLogsService, AuditLogInterceptor],
})
export class AuditLogsModule {}
