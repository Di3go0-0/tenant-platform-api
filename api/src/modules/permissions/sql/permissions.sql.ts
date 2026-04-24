export enum PermissionQueries {
  CREATE_PERMISSION = `
    INSERT INTO permissions (name, description)
    VALUES ($1, $2)
    RETURNING *
  `,
  FIND_BY_ID = `
    SELECT * FROM permissions
    WHERE id = $1
    AND deleted_at IS NULL
  `,
  FIND_BY_NAME = `
    SELECT * FROM permissions
    WHERE name = $1
    AND deleted_at IS NULL
  `,
  FIND_ALL = `
    SELECT * FROM permissions
    WHERE deleted_at IS NULL
    ORDER BY name
  `,
  ADD_PERMISSION_TO_ROLE = `
    INSERT INTO role_permissions (role_id, permission_id)
    VALUES ($1, $2)
    RETURNING *
  `,
  REMOVE_PERMISSION_FROM_ROLE = `
    DELETE FROM role_permissions
    WHERE role_id = $1
    AND permission_id = $2
  `,
  FIND_PERMISSIONS_BY_ROLE = `
    SELECT p.* FROM permissions p
    INNER JOIN role_permissions rp ON rp.permission_id = p.id
    WHERE rp.role_id = $1
    AND p.deleted_at IS NULL
    ORDER BY p.name
  `,
  FIND_USER_PERMISSIONS = `
    SELECT DISTINCT p.* FROM permissions p
    INNER JOIN role_permissions rp ON rp.permission_id = p.id
    INNER JOIN user_tenants ut ON ut.role_id = rp.role_id
    WHERE ut.user_id = $1
    AND ut.tenant_id = $2
    AND p.deleted_at IS NULL
  `,
  DELETE_PERMISSION = `
    UPDATE permissions
    SET deleted_at = now()
    WHERE id = $1
    AND deleted_at IS NULL
    RETURNING *
  `,
}
