import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PermissionsRepository } from './repositories/permissions.repository.js';
import { PermissionEntity, CreatePermissionData, RolePermissionData } from './types/permission.types.js';

@Injectable()
export class PermissionsService {
  constructor(private readonly permissionsRepository: PermissionsRepository) {}

  async createPermission(data: CreatePermissionData): Promise<PermissionEntity> {
    const existing = await this.permissionsRepository.findByName(data.name);
    if (existing) {
      throw new ConflictException('Permission already exists');
    }

    return this.permissionsRepository.create(data.name, data.description);
  }

  async getAllPermissions(): Promise<PermissionEntity[]> {
    return this.permissionsRepository.findAll();
  }

  async addPermissionToRole(data: RolePermissionData): Promise<void> {
    await this.permissionsRepository.addToRole(data.roleId, data.permissionId);
  }

  async removePermissionFromRole(data: RolePermissionData): Promise<void> {
    await this.permissionsRepository.removeFromRole(data.roleId, data.permissionId);
  }

  async getRolePermissions(roleId: string): Promise<PermissionEntity[]> {
    return this.permissionsRepository.findByRole(roleId);
  }

  async getUserPermissions(userId: string, tenantId: string): Promise<PermissionEntity[]> {
    return this.permissionsRepository.findUserPermissions(userId, tenantId);
  }

  async deletePermission(id: string): Promise<void> {
    const permission = await this.permissionsRepository.findById(id);
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    await this.permissionsRepository.delete(id);
  }
}
