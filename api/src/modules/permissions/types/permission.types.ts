export type PermissionEntity = {
  id: string;
  name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

export type CreatePermissionData = {
  name: string;
  description?: string;
};

export type RolePermissionData = {
  roleId: string;
  permissionId: string;
};
