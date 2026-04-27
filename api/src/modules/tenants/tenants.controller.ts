import { Controller, Post, Get, Body, UseGuards, UseInterceptors, HttpCode, HttpStatus } from '@nestjs/common';
import { TenantsService } from './tenants.service.js';
import type { TenantEntity, UserTenantEntity } from './types/tenant.types.js';
import { CreateTenantDto } from './dto/create-tenant.dto.js';
import { AddUserDto } from './dto/add-user.dto.js';
import { AuthGuard } from '../auth/index.js';
import { TenantGuard } from '../../common/guards/tenant.guard.js';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard.js';
import { AuditLogInterceptor } from '../../common/interceptors/audit-log.interceptor.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Tenant } from '../../common/decorators/tenant.decorator.js';

@Controller('tenants')
@UseGuards(AuthGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  async create(
    @Body() dto: CreateTenantDto,
    @CurrentUser() user: Express.Request['user'],
  ): Promise<TenantEntity> {
    return this.tenantsService.createTenant(dto, user!.sub);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @CurrentUser() user: Express.Request['user'],
  ): Promise<TenantEntity[]> {
    return this.tenantsService.getUserTenants(user!.sub);
  }

  @Post('users')
  @UseGuards(TenantGuard, RateLimitGuard)
  @UseInterceptors(AuditLogInterceptor)
  async addUser(
    @Body() dto: AddUserDto,
    @Tenant() tenantId: string,
  ): Promise<UserTenantEntity> {
    return this.tenantsService.addUser(tenantId, dto.userId);
  }
}
