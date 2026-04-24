import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { RolesService } from '../../modules/roles/roles.service.js';
import { ROLES_KEY } from '../decorators/roles.decorator.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rolesService: RolesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const userId = request.user?.sub;
    const tenantId = request.tenantId;

    if (!userId || !tenantId) {
      throw new ForbiddenException('Missing user or tenant context');
    }

    const userRole = await this.rolesService.getUserRole(userId, tenantId);
    if (!userRole || !requiredRoles.includes(userRole.name)) {
      throw new ForbiddenException('Insufficient role');
    }

    return true;
  }
}
