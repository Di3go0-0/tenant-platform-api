import { Controller, Post, Get, Body, UseGuards, UseInterceptors, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
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

@ApiTags('Tenants')
@ApiBearerAuth()
@Controller('tenants')
@UseGuards(AuthGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tenant' })
  @ApiResponse({ status: 201, description: 'Tenant created with default roles' })
  @ApiResponse({ status: 409, description: 'Slug already exists' })
  async create(
    @Body() dto: CreateTenantDto,
    @CurrentUser() user: Express.Request['user'],
  ): Promise<TenantEntity> {
    return this.tenantsService.createTenant(dto, user!.sub);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List tenants for current user' })
  async findAll(
    @CurrentUser() user: Express.Request['user'],
  ): Promise<TenantEntity[]> {
    return this.tenantsService.getUserTenants(user!.sub);
  }

  @Post('users')
  @UseGuards(TenantGuard, RateLimitGuard)
  @UseInterceptors(AuditLogInterceptor)
  @ApiOperation({ summary: 'Add a user to the tenant' })
  @ApiSecurity('tenant-id')
  @ApiResponse({ status: 201, description: 'User added to tenant' })
  @ApiResponse({ status: 403, description: 'User limit reached or no subscription' })
  @ApiResponse({ status: 409, description: 'User already belongs to tenant' })
  async addUser(
    @Body() dto: AddUserDto,
    @Tenant() tenantId: string,
  ): Promise<UserTenantEntity> {
    return this.tenantsService.addUser(tenantId, dto.userId);
  }
}
