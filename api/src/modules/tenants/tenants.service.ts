import { Injectable, ConflictException } from '@nestjs/common';
import { PlsqlService } from '../../core/plsql/index.js';
import { TenantsRepository } from './repositories/tenants.repository.js';
import { TenantQueries } from './sql/tenants.sql.js';
import { TenantEntity, CreateTenantData } from './types/tenant.types.js';

@Injectable()
export class TenantsService {
  constructor(
    private readonly tenantsRepository: TenantsRepository,
    private readonly plsqlService: PlsqlService,
  ) {}

  async createTenant(data: CreateTenantData, userId: string): Promise<TenantEntity> {
    const existing = await this.tenantsRepository.findBySlug(data.slug);
    if (existing) {
      throw new ConflictException('Tenant slug already exists');
    }

    return this.plsqlService.executeTransaction(async (query) => {
      const result = await query(TenantQueries.CREATE_TENANT, [
        data.name,
        data.slug,
      ]);
      const tenant = result.rows[0] as TenantEntity;

      await query(TenantQueries.ADD_USER_TO_TENANT, [
        userId,
        tenant.id,
        'owner',
      ]);

      return tenant;
    });
  }

  async getUserTenants(userId: string): Promise<TenantEntity[]> {
    return this.tenantsRepository.findTenantsByUser(userId);
  }

  async validateUserTenantAccess(userId: string, tenantId: string): Promise<boolean> {
    const userTenant = await this.tenantsRepository.findUserTenant(
      userId,
      tenantId,
    );
    return !!userTenant;
  }

  async findById(id: string): Promise<TenantEntity | null> {
    return this.tenantsRepository.findById(id);
  }
}
