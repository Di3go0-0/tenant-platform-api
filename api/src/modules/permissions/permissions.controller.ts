import { Controller, Post, Get, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { PermissionsService } from './permissions.service.js';
import { CreatePermissionDto } from './dto/create-permission.dto.js';
import { RolePermissionDto } from './dto/role-permission.dto.js';
import type { PermissionEntity } from './types/permission.types.js';
import { AuthGuard } from '../auth/index.js';
import { TenantGuard } from '../tenants/index.js';
import { RateLimitGuard } from '../subscriptions/index.js';
import { Tenant } from '../../common/decorators/tenant.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@Controller('permissions')
@UseGuards(AuthGuard, TenantGuard, RateLimitGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  async create(@Body() dto: CreatePermissionDto): Promise<PermissionEntity> {
    return this.permissionsService.createPermission(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<PermissionEntity[]> {
    return this.permissionsService.getAllPermissions();
  }

  @Post('role')
  @HttpCode(HttpStatus.OK)
  async addToRole(@Body() dto: RolePermissionDto): Promise<void> {
    return this.permissionsService.addPermissionToRole(dto);
  }

  @Delete('role')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeFromRole(@Body() dto: RolePermissionDto): Promise<void> {
    return this.permissionsService.removePermissionFromRole(dto);
  }

  @Get('role/:roleId')
  async findByRole(@Param('roleId') roleId: string): Promise<PermissionEntity[]> {
    return this.permissionsService.getRolePermissions(roleId);
  }

  @Get('user')
  async findUserPermissions(
    @CurrentUser() user: Express.Request['user'],
    @Tenant() tenantId: string,
  ): Promise<PermissionEntity[]> {
    return this.permissionsService.getUserPermissions(user!.sub, tenantId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.permissionsService.deletePermission(id);
  }
}
