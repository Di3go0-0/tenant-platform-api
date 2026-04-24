import { Injectable } from '@nestjs/common';
import { PlsqlService } from '../../../core/plsql/index.js';
import { PermissionQueries } from '../sql/permissions.sql.js';
import { PermissionEntity } from '../types/permission.types.js';

@Injectable()
export class PermissionsRepository {
  constructor(private readonly plsqlService: PlsqlService) {}

  async create(name: string, description?: string): Promise<PermissionEntity> {
    const permission = await this.plsqlService.executeQueryOne<PermissionEntity>(
      PermissionQueries.CREATE_PERMISSION,
      [name, description ?? null],
    );
    if (!permission) throw new Error('Failed to create permission');
    return permission;
  }

  async findById(id: string): Promise<PermissionEntity | null> {
    return this.plsqlService.executeQueryOne<PermissionEntity>(
      PermissionQueries.FIND_BY_ID,
      [id],
    );
  }

  async findByName(name: string): Promise<PermissionEntity | null> {
    return this.plsqlService.executeQueryOne<PermissionEntity>(
      PermissionQueries.FIND_BY_NAME,
      [name],
    );
  }

  async findAll(): Promise<PermissionEntity[]> {
    return this.plsqlService.executeQueryMany<PermissionEntity>(
      PermissionQueries.FIND_ALL,
    );
  }

  async addToRole(roleId: string, permissionId: string): Promise<void> {
    await this.plsqlService.executeQueryOne(
      PermissionQueries.ADD_PERMISSION_TO_ROLE,
      [roleId, permissionId],
    );
  }

  async removeFromRole(roleId: string, permissionId: string): Promise<void> {
    await this.plsqlService.executeQueryOne(
      PermissionQueries.REMOVE_PERMISSION_FROM_ROLE,
      [roleId, permissionId],
    );
  }

  async findByRole(roleId: string): Promise<PermissionEntity[]> {
    return this.plsqlService.executeQueryMany<PermissionEntity>(
      PermissionQueries.FIND_PERMISSIONS_BY_ROLE,
      [roleId],
    );
  }

  async findUserPermissions(userId: string, tenantId: string): Promise<PermissionEntity[]> {
    return this.plsqlService.executeQueryMany<PermissionEntity>(
      PermissionQueries.FIND_USER_PERMISSIONS,
      [userId, tenantId],
    );
  }

  async delete(id: string): Promise<PermissionEntity | null> {
    return this.plsqlService.executeQueryOne<PermissionEntity>(
      PermissionQueries.DELETE_PERMISSION,
      [id],
    );
  }
}
