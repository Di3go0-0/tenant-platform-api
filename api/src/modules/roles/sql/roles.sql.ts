export enum RoleQueries {
  CREATE_ROLE = `
    INSERT INTO roles (tenant_id, name, description)
    VALUES ($1, $2, $3)
    RETURNING *
  `,
  FIND_BY_ID = `
    SELECT * FROM roles
    WHERE id = $1
    AND deleted_at IS NULL
  `,
  FIND_BY_TENANT = `
    SELECT * FROM roles
    WHERE tenant_id = $1
    AND deleted_at IS NULL
    ORDER BY name
  `,
  FIND_BY_NAME_AND_TENANT = `
    SELECT * FROM roles
    WHERE name = $1
    AND tenant_id = $2
    AND deleted_at IS NULL
  `,
  ASSIGN_ROLE_TO_USER = `
    UPDATE user_tenants
    SET role_id = $1
    WHERE user_id = $2
    AND tenant_id = $3
    RETURNING *
  `,
  FIND_USER_ROLE = `
    SELECT r.* FROM roles r
    INNER JOIN user_tenants ut ON ut.role_id = r.id
    WHERE ut.user_id = $1
    AND ut.tenant_id = $2
    AND r.deleted_at IS NULL
  `,
  DELETE_ROLE = `
    UPDATE roles
    SET deleted_at = now()
    WHERE id = $1
    AND deleted_at IS NULL
    RETURNING *
  `,
}
