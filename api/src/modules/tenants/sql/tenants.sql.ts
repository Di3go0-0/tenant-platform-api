export enum TenantQueries {
  CREATE_TENANT = `
    INSERT INTO tenants (name, slug)
    VALUES ($1, $2)
    RETURNING *
  `,
  FIND_BY_ID = `
    SELECT * FROM tenants
    WHERE id = $1
    AND deleted_at IS NULL
  `,
  FIND_BY_SLUG = `
    SELECT * FROM tenants
    WHERE slug = $1
    AND deleted_at IS NULL
  `,
  ADD_USER_TO_TENANT = `
    INSERT INTO user_tenants (user_id, tenant_id, role_id)
    VALUES ($1, $2, $3)
    RETURNING *
  `,
  FIND_USER_TENANT = `
    SELECT * FROM user_tenants
    WHERE user_id = $1
    AND tenant_id = $2
  `,
  FIND_TENANTS_BY_USER = `
    SELECT t.* FROM tenants t
    INNER JOIN user_tenants ut ON ut.tenant_id = t.id
    WHERE ut.user_id = $1
    AND t.deleted_at IS NULL
  `,
}
