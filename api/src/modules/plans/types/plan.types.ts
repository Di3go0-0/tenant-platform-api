export type PlanEntity = {
  id: string;
  name: string;
  description: string | null;
  max_users: number;
  max_requests_per_minute: number;
  price: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

export type CreatePlanData = {
  name: string;
  description?: string;
  maxUsers: number;
  maxRequestsPerMinute: number;
  price: number;
};

export type UpdatePlanData = {
  name?: string;
  description?: string;
  maxUsers?: number;
  maxRequestsPerMinute?: number;
  price?: number;
};
