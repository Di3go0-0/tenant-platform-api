import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { RolesRepository } from './repositories/roles.repository.js';
import { RoleEntity, CreateRoleData, AssignRoleData } from './types/role.types.js';

@Injectable()
export class RolesService {
  constructor(private readonly rolesRepository: RolesRepository) {}

  async createRole(tenantId: string, data: CreateRoleData): Promise<RoleEntity> {
    const existing = await this.rolesRepository.findByNameAndTenant(data.name, tenantId);
    if (existing) {
      throw new ConflictException('Role already exists in this tenant');
    }

    return this.rolesRepository.create(tenantId, data.name, data.description);
  }

  async getRolesByTenant(tenantId: string): Promise<RoleEntity[]> {
    return this.rolesRepository.findByTenant(tenantId);
  }

  async assignRole(tenantId: string, data: AssignRoleData): Promise<void> {
    const role = await this.rolesRepository.findById(data.roleId);
    if (!role || role.tenant_id !== tenantId) {
      throw new NotFoundException('Role not found in this tenant');
    }

    await this.rolesRepository.assignRoleToUser(data.roleId, data.userId, tenantId);
  }

  async getUserRole(userId: string, tenantId: string): Promise<RoleEntity | null> {
    return this.rolesRepository.findUserRole(userId, tenantId);
  }

  async deleteRole(id: string, tenantId: string): Promise<void> {
    const role = await this.rolesRepository.findById(id);
    if (!role || role.tenant_id !== tenantId) {
      throw new NotFoundException('Role not found in this tenant');
    }

    await this.rolesRepository.delete(id);
  }
}
