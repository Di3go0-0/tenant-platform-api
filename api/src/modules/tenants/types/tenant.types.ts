export type TenantEntity = {
  id: string;
  name: string;
  slug: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

export type UserTenantEntity = {
  id: string;
  user_id: string;
  tenant_id: string;
  role: string;
  created_at: Date;
};

export type CreateTenantData = {
  name: string;
  slug: string;
};
