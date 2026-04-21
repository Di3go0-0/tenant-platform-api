export enum UserQueries {
  CREATE_USER = `
    INSERT INTO users (email, password_hash)
    VALUES ($1, $2)
    RETURNING *
  `,
  FIND_BY_EMAIL = `
    SELECT * FROM users
    WHERE email = $1
    AND deleted_at IS NULL
  `,
  FIND_BY_ID = `
    SELECT * FROM users
    WHERE id = $1
    AND deleted_at IS NULL
  `,
}
