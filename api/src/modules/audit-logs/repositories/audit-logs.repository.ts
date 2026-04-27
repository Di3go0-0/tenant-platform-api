import { Injectable } from '@nestjs/common';
import { PlsqlService } from '../../../core/plsql/index.js';
import { AuditLogQueries } from '../sql/audit-logs.sql.js';
import { AuditLogEntity } from '../types/audit-log.types.js';

@Injectable()
export class AuditLogsRepository {
  constructor(private readonly plsqlService: PlsqlService) {}

  async create(
    tenantId: string | null,
    userId: string | null,
    action: string,
    metadata: Record<string, unknown>,
    correlationId: string | null,
  ): Promise<AuditLogEntity> {
    const log = await this.plsqlService.executeQueryOne<AuditLogEntity>(
      AuditLogQueries.CREATE_LOG,
      [tenantId, userId, action, JSON.stringify(metadata), correlationId],
    );
    if (!log) throw new Error('Failed to create audit log');
    return log;
  }

  async findByTenant(tenantId: string, limit: number, offset: number): Promise<AuditLogEntity[]> {
    return this.plsqlService.executeQueryMany<AuditLogEntity>(
      AuditLogQueries.FIND_BY_TENANT,
      [tenantId, limit, offset],
    );
  }

  async findByUser(userId: string, tenantId: string, limit: number, offset: number): Promise<AuditLogEntity[]> {
    return this.plsqlService.executeQueryMany<AuditLogEntity>(
      AuditLogQueries.FIND_BY_USER,
      [userId, tenantId, limit, offset],
    );
  }
}
