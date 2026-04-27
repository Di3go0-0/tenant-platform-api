import { Controller, Post, Get, Delete, Body, Param, UseGuards, UseInterceptors, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service.js';
import { CreatePermissionDto } from './dto/create-permission.dto.js';
import { RolePermissionDto } from './dto/role-permission.dto.js';
import type { PermissionEntity } from './types/permission.types.js';
import { AuthGuard } from '../auth/index.js';
import { TenantGuard } from '../../common/guards/tenant.guard.js';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard.js';
import { AuditLogInterceptor } from '../audit-logs/index.js';
import { Tenant } from '../../common/decorators/tenant.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { ParseUUIDPipe } from '../../common/pipes/parse-uuid.pipe.js';

@ApiTags('Permissions')
@ApiBearerAuth()
@ApiSecurity('tenant-id')
@Controller('permissions')
@UseGuards(AuthGuard, TenantGuard, RateLimitGuard)
@UseInterceptors(AuditLogInterceptor)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a global permission' })
  @ApiResponse({ status: 201, description: 'Permission created' })
  @ApiResponse({ status: 409, description: 'Permission name already exists' })
  async create(@Body() dto: CreatePermissionDto): Promise<PermissionEntity> {
    return this.permissionsService.createPermission(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all permissions' })
  async findAll(): Promise<PermissionEntity[]> {
    return this.permissionsService.getAllPermissions();
  }

  @Post('role')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add permission to a role' })
  async addToRole(@Body() dto: RolePermissionDto): Promise<void> {
    return this.permissionsService.addPermissionToRole(dto);
  }

  @Delete('role')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove permission from a role' })
  async removeFromRole(@Body() dto: RolePermissionDto): Promise<void> {
    return this.permissionsService.removePermissionFromRole(dto);
  }

  @Get('role/:roleId')
  @ApiOperation({ summary: 'List permissions of a role' })
  async findByRole(@Param('roleId', ParseUUIDPipe) roleId: string): Promise<PermissionEntity[]> {
    return this.permissionsService.getRolePermissions(roleId);
  }

  @Get('user')
  @ApiOperation({ summary: 'List current user permissions in tenant' })
  async findUserPermissions(
    @CurrentUser() user: Express.Request['user'],
    @Tenant() tenantId: string,
  ): Promise<PermissionEntity[]> {
    return this.permissionsService.getUserPermissions(user!.sub, tenantId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a permission' })
  @ApiResponse({ status: 204, description: 'Permission deleted' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.permissionsService.deletePermission(id);
  }
}
