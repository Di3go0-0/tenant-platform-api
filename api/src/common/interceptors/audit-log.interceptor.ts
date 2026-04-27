import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request } from 'express';
import { AuditLogsService } from '../../modules/audit-logs/audit-logs.service.js';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, path } = request;

    if (method === 'GET') return next.handle();

    const action = `${method} ${path}`;
    const userId = request.user?.sub;
    const tenantId = request.tenantId;
    const correlationId = request.correlationId;

    return next.handle().pipe(
      tap(() => {
        this.auditLogsService.log({
          tenantId,
          userId,
          action,
          metadata: { body: request.body as Record<string, unknown> },
          correlationId,
        });
      }),
    );
  }
}
