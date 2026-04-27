export enum AuditLogQueries {
  CREATE_LOG = `
    INSERT INTO audit_logs (tenant_id, user_id, action, metadata, correlation_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `,
  FIND_BY_TENANT = `
    SELECT * FROM audit_logs
    WHERE tenant_id = $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3
  `,
  FIND_BY_USER = `
    SELECT * FROM audit_logs
    WHERE user_id = $1
    AND tenant_id = $2
    ORDER BY created_at DESC
    LIMIT $3 OFFSET $4
  `,
}
