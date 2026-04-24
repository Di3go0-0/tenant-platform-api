import { Injectable } from '@nestjs/common';
import { PlsqlService } from '../../../core/plsql/index.js';
import { RoleQueries } from '../sql/roles.sql.js';
import { RoleEntity } from '../types/role.types.js';
import { UserTenantEntity } from '../../tenants/types/tenant.types.js';

@Injectable()
export class RolesRepository {
  constructor(private readonly plsqlService: PlsqlService) {}

  async create(tenantId: string, name: string, description?: string): Promise<RoleEntity> {
    const role = await this.plsqlService.executeQueryOne<RoleEntity>(
      RoleQueries.CREATE_ROLE,
      [tenantId, name, description ?? null],
    );
    if (!role) throw new Error('Failed to create role');
    return role;
  }

  async findById(id: string): Promise<RoleEntity | null> {
    return this.plsqlService.executeQueryOne<RoleEntity>(
      RoleQueries.FIND_BY_ID,
      [id],
    );
  }

  async findByTenant(tenantId: string): Promise<RoleEntity[]> {
    return this.plsqlService.executeQueryMany<RoleEntity>(
      RoleQueries.FIND_BY_TENANT,
      [tenantId],
    );
  }

  async findByNameAndTenant(name: string, tenantId: string): Promise<RoleEntity | null> {
    return this.plsqlService.executeQueryOne<RoleEntity>(
      RoleQueries.FIND_BY_NAME_AND_TENANT,
      [name, tenantId],
    );
  }

  async assignRoleToUser(roleId: string, userId: string, tenantId: string): Promise<UserTenantEntity> {
    const result = await this.plsqlService.executeQueryOne<UserTenantEntity>(
      RoleQueries.ASSIGN_ROLE_TO_USER,
      [roleId, userId, tenantId],
    );
    if (!result) throw new Error('Failed to assign role');
    return result;
  }

  async findUserRole(userId: string, tenantId: string): Promise<RoleEntity | null> {
    return this.plsqlService.executeQueryOne<RoleEntity>(
      RoleQueries.FIND_USER_ROLE,
      [userId, tenantId],
    );
  }

  async delete(id: string): Promise<RoleEntity | null> {
    return this.plsqlService.executeQueryOne<RoleEntity>(
      RoleQueries.DELETE_ROLE,
      [id],
    );
  }
}
