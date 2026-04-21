import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { TenantsService } from '../../modules/tenants/tenants.service.js';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly tenantsService: TenantsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const tenantId = request.headers['x-tenant-id'] as string | undefined;

    if (!tenantId) {
      throw new BadRequestException('X-Tenant-ID header is required');
    }

    const userId = request.user?.sub;
    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    const hasAccess = await this.tenantsService.validateUserTenantAccess(
      userId,
      tenantId,
    );

    if (!hasAccess) {
      throw new ForbiddenException('User does not belong to this tenant');
    }

    request.tenantId = tenantId;
    return true;
  }
}
