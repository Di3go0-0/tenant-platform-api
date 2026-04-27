import { Controller, Get, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service.js';
import type { AuditLogEntity } from './types/audit-log.types.js';
import { AuthGuard } from '../auth/index.js';
import { TenantGuard } from '../tenants/index.js';
import { Tenant } from '../../common/decorators/tenant.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@Controller('audit-logs')
@UseGuards(AuthGuard, TenantGuard)
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findByTenant(
    @Tenant() tenantId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<AuditLogEntity[]> {
    return this.auditLogsService.getByTenant(
      tenantId,
      limit ? parseInt(limit, 10) : undefined,
      offset ? parseInt(offset, 10) : undefined,
    );
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async findByUser(
    @CurrentUser() user: Express.Request['user'],
    @Tenant() tenantId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<AuditLogEntity[]> {
    return this.auditLogsService.getByUser(
      user!.sub,
      tenantId,
      limit ? parseInt(limit, 10) : undefined,
      offset ? parseInt(offset, 10) : undefined,
    );
  }
}
