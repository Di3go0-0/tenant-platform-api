import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule } from './infrastructure/config/index.js';
import { DatabaseModule } from './infrastructure/database/index.js';
import { RedisModule } from './infrastructure/redis/index.js';
import { LoggerModule } from './infrastructure/logger/index.js';
import { PlsqlModule } from './core/plsql/index.js';
import { AuthModule } from './modules/auth/index.js';
import { TenantsModule } from './modules/tenants/index.js';
import { RolesModule } from './modules/roles/index.js';
import { PermissionsModule } from './modules/permissions/index.js';
import { PlansModule } from './modules/plans/index.js';
import { SubscriptionsModule } from './modules/subscriptions/index.js';
import { AuditLogsModule } from './modules/audit-logs/index.js';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware.js';

@Module({
  imports: [ConfigModule, DatabaseModule, RedisModule, LoggerModule, PlsqlModule, AuthModule, TenantsModule, RolesModule, PermissionsModule, PlansModule, SubscriptionsModule, AuditLogsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
