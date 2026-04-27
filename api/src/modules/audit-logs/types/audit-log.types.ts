export type AuditLogEntity = {
  id: string;
  tenant_id: string | null;
  user_id: string | null;
  action: string;
  metadata: Record<string, unknown>;
  correlation_id: string | null;
  created_at: Date;
};

export type CreateAuditLogData = {
  tenantId?: string;
  userId?: string;
  action: string;
  metadata?: Record<string, unknown>;
  correlationId?: string;
};
