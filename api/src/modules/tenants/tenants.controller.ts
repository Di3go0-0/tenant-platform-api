import { Controller, Post, Get, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { TenantsService } from './tenants.service.js';
import type { TenantEntity } from './types/tenant.types.js';
import { CreateTenantDto } from './dto/create-tenant.dto.js';
import { AuthGuard } from '../auth/index.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

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
}
