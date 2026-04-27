import { Controller, Post, Get, Delete, Body, Param, UseGuards, UseInterceptors, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { RolesService } from './roles.service.js';
import { CreateRoleDto } from './dto/create-role.dto.js';
import { AssignRoleDto } from './dto/assign-role.dto.js';
import type { RoleEntity } from './types/role.types.js';
import { AuthGuard } from '../auth/index.js';
import { TenantGuard } from '../../common/guards/tenant.guard.js';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard.js';
import { AuditLogInterceptor } from '../audit-logs/index.js';
import { Tenant } from '../../common/decorators/tenant.decorator.js';
import { ParseUUIDPipe } from '../../common/pipes/parse-uuid.pipe.js';

@ApiTags('Roles')
@ApiBearerAuth()
@ApiSecurity('tenant-id')
@Controller('roles')
@UseGuards(AuthGuard, TenantGuard, RateLimitGuard)
@UseInterceptors(AuditLogInterceptor)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a role in the tenant' })
  @ApiResponse({ status: 201, description: 'Role created' })
  @ApiResponse({ status: 409, description: 'Role already exists in tenant' })
  async create(
    @Body() dto: CreateRoleDto,
    @Tenant() tenantId: string,
  ): Promise<RoleEntity> {
    return this.rolesService.createRole(tenantId, dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all roles in the tenant' })
  async findAll(@Tenant() tenantId: string): Promise<RoleEntity[]> {
    return this.rolesService.getRolesByTenant(tenantId);
  }

  @Post('assign')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Assign a role to a user' })
  @ApiResponse({ status: 200, description: 'Role assigned' })
  @ApiResponse({ status: 404, description: 'Role not found in tenant' })
  async assign(
    @Body() dto: AssignRoleDto,
    @Tenant() tenantId: string,
  ): Promise<void> {
    return this.rolesService.assignRole(tenantId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a role' })
  @ApiResponse({ status: 204, description: 'Role deleted' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Tenant() tenantId: string,
  ): Promise<void> {
    return this.rolesService.deleteRole(id, tenantId);
  }
}
