import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PermissionsService } from '../../modules/permissions/permissions.service.js';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator.js';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionsService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const userId = request.user?.sub;
    const tenantId = request.tenantId;

    if (!userId || !tenantId) {
      throw new ForbiddenException('Missing user or tenant context');
    }

    const userPermissions = await this.permissionsService.getUserPermissions(
      userId,
      tenantId,
    );
    const userPermissionNames = userPermissions.map((p) => p.name);

    const hasAll = requiredPermissions.every((p) =>
      userPermissionNames.includes(p),
    );

    if (!hasAll) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
