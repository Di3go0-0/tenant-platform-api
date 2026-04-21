import { Injectable } from '@nestjs/common';
import { PlsqlService } from '../../../core/plsql/index.js';
import { TenantQueries } from '../sql/tenants.sql.js';
import { TenantEntity, UserTenantEntity } from '../types/tenant.types.js';

@Injectable()
export class TenantsRepository {
  constructor(private readonly plsqlService: PlsqlService) {}

  async create(name: string, slug: string): Promise<TenantEntity> {
    const tenant = await this.plsqlService.executeQueryOne<TenantEntity>(
      TenantQueries.CREATE_TENANT,
      [name, slug],
    );
    if (!tenant) throw new Error('Failed to create tenant');
    return tenant;
  }

  async findById(id: string): Promise<TenantEntity | null> {
    return this.plsqlService.executeQueryOne<TenantEntity>(
      TenantQueries.FIND_BY_ID,
      [id],
    );
  }

  async findBySlug(slug: string): Promise<TenantEntity | null> {
    return this.plsqlService.executeQueryOne<TenantEntity>(
      TenantQueries.FIND_BY_SLUG,
      [slug],
    );
  }

  async addUserToTenant(userId: string, tenantId: string, role: string): Promise<UserTenantEntity> {
    const userTenant =
      await this.plsqlService.executeQueryOne<UserTenantEntity>(
        TenantQueries.ADD_USER_TO_TENANT,
        [userId, tenantId, role],
      );
    if (!userTenant) throw new Error('Failed to add user to tenant');
    return userTenant;
  }

  async findUserTenant(userId: string, tenantId: string): Promise<UserTenantEntity | null> {
    return this.plsqlService.executeQueryOne<UserTenantEntity>(
      TenantQueries.FIND_USER_TENANT,
      [userId, tenantId],
    );
  }

  async findTenantsByUser(userId: string): Promise<TenantEntity[]> {
    return this.plsqlService.executeQueryMany<TenantEntity>(
      TenantQueries.FIND_TENANTS_BY_USER,
      [userId],
    );
  }
}
