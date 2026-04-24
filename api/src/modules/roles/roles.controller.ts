import { Controller, Post, Get, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { RolesService } from './roles.service.js';
import { CreateRoleDto } from './dto/create-role.dto.js';
import { AssignRoleDto } from './dto/assign-role.dto.js';
import type { RoleEntity } from './types/role.types.js';
import { AuthGuard } from '../auth/index.js';
import { TenantGuard } from '../tenants/index.js';
import { Tenant } from '../../common/decorators/tenant.decorator.js';

@Controller('roles')
@UseGuards(AuthGuard, TenantGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  async create(
    @Body() dto: CreateRoleDto,
    @Tenant() tenantId: string,
  ): Promise<RoleEntity> {
    return this.rolesService.createRole(tenantId, dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Tenant() tenantId: string): Promise<RoleEntity[]> {
    return this.rolesService.getRolesByTenant(tenantId);
  }

  @Post('assign')
  @HttpCode(HttpStatus.OK)
  async assign(
    @Body() dto: AssignRoleDto,
    @Tenant() tenantId: string,
  ): Promise<void> {
    return this.rolesService.assignRole(tenantId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @Tenant() tenantId: string,
  ): Promise<void> {
    return this.rolesService.deleteRole(id, tenantId);
  }
}
