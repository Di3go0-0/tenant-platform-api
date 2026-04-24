export enum AuthQueries {
  CREATE_REFRESH_TOKEN = `
    INSERT INTO refresh_tokens (user_id, token, expires_at)
    VALUES ($1, $2, $3)
    RETURNING *
  `,
  FIND_REFRESH_TOKEN = `
    SELECT * FROM refresh_tokens
    WHERE token = $1
    AND revoked = false
  `,
  REVOKE_REFRESH_TOKEN = `
    UPDATE refresh_tokens
    SET revoked = true
    WHERE token = $1
  `,
  REVOKE_ALL_USER_TOKENS = `
    UPDATE refresh_tokens
    SET revoked = true
    WHERE user_id = $1
    AND revoked = false
  `,
}
