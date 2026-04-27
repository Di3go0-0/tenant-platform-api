export enum PlanQueries {
  CREATE_PLAN = `
    INSERT INTO plans (name, description, max_users, max_requests_per_minute, price)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `,
  FIND_BY_ID = `
    SELECT * FROM plans
    WHERE id = $1
    AND deleted_at IS NULL
  `,
  FIND_BY_NAME = `
    SELECT * FROM plans
    WHERE name = $1
    AND deleted_at IS NULL
  `,
  FIND_ALL = `
    SELECT * FROM plans
    WHERE deleted_at IS NULL
    ORDER BY price ASC
  `,
  UPDATE_PLAN = `
    UPDATE plans
    SET name = COALESCE($2, name),
        description = COALESCE($3, description),
        max_users = COALESCE($4, max_users),
        max_requests_per_minute = COALESCE($5, max_requests_per_minute),
        price = COALESCE($6, price),
        updated_at = now()
    WHERE id = $1
    AND deleted_at IS NULL
    RETURNING *
  `,
  DELETE_PLAN = `
    UPDATE plans
    SET deleted_at = now()
    WHERE id = $1
    AND deleted_at IS NULL
    RETURNING *
  `,
}
