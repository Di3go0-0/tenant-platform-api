export type SubscriptionStatus = 'active' | 'canceled' | 'expired';

export type SubscriptionEntity = {
  id: string;
  tenant_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  starts_at: Date;
  ends_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

export type SubscriptionWithPlan = SubscriptionEntity & {
  plan_name: string;
  max_users: number;
  max_requests_per_minute: number;
};

export type CreateSubscriptionData = {
  tenantId: string;
  planId: string;
};
