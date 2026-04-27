export enum SubscriptionQueries {
  CREATE_SUBSCRIPTION = `
    INSERT INTO subscriptions (tenant_id, plan_id)
    VALUES ($1, $2)
    RETURNING *
  `,
  FIND_BY_ID = `
    SELECT * FROM subscriptions
    WHERE id = $1
  `,
  FIND_ACTIVE_BY_TENANT = `
    SELECT s.*, p.name AS plan_name, p.max_users, p.max_requests_per_minute
    FROM subscriptions s
    INNER JOIN plans p ON p.id = s.plan_id
    WHERE s.tenant_id = $1
    AND s.status = 'active'
    AND p.deleted_at IS NULL
  `,
  CANCEL_SUBSCRIPTION = `
    UPDATE subscriptions
    SET status = 'canceled', updated_at = now()
    WHERE id = $1
    AND status = 'active'
    RETURNING *
  `,
  CANCEL_ACTIVE_BY_TENANT = `
    UPDATE subscriptions
    SET status = 'canceled', updated_at = now()
    WHERE tenant_id = $1
    AND status = 'active'
    RETURNING *
  `,
  COUNT_TENANT_USERS = `
    SELECT COUNT(*)::int AS count
    FROM user_tenants
    WHERE tenant_id = $1
  `,
}
