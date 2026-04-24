export type RoleEntity = {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

export type CreateRoleData = {
  name: string;
  description?: string;
};

export type AssignRoleData = {
  userId: string;
  roleId: string;
};
