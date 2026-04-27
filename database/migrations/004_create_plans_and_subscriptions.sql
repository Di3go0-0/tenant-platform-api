CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    max_users INT NOT NULL DEFAULT 5,
    max_requests_per_minute INT NOT NULL DEFAULT 60,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'expired')),
    starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ends_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant_id ON subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_active_tenant ON subscriptions(tenant_id) WHERE status = 'active';

INSERT INTO plans (name, description, max_users, max_requests_per_minute, price) VALUES
    ('free', 'Free plan with basic limits', 3, 30, 0.00),
    ('starter', 'Starter plan for small teams', 10, 100, 9.99),
    ('pro', 'Pro plan for growing teams', 50, 500, 29.99),
    ('enterprise', 'Enterprise plan with unlimited access', 1000, 5000, 99.99)
ON CONFLICT (name) DO NOTHING;
