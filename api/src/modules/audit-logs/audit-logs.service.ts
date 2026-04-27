import { Injectable } from '@nestjs/common';
import { AuditLogsRepository } from './repositories/audit-logs.repository.js';
import { AuditLogEntity, CreateAuditLogData } from './types/audit-log.types.js';

@Injectable()
export class AuditLogsService {
  constructor(private readonly auditLogsRepository: AuditLogsRepository) {}

  async log(data: CreateAuditLogData): Promise<void> {
    await this.auditLogsRepository.create(
      data.tenantId ?? null,
      data.userId ?? null,
      data.action,
      data.metadata ?? {},
      data.correlationId ?? null,
    );
  }

  async getByTenant(tenantId: string, limit = 50, offset = 0): Promise<AuditLogEntity[]> {
    return this.auditLogsRepository.findByTenant(tenantId, limit, offset);
  }

  async getByUser(userId: string, tenantId: string, limit = 50, offset = 0): Promise<AuditLogEntity[]> {
    return this.auditLogsRepository.findByUser(userId, tenantId, limit, offset);
  }
}
