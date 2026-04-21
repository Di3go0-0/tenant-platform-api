import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule } from './infrastructure/config/index.js';
import { DatabaseModule } from './infrastructure/database/index.js';
import { PlsqlModule } from './core/plsql/index.js';
import { AuthModule } from './modules/auth/index.js';
import { TenantsModule } from './modules/tenants/index.js';

@Module({
  imports: [ConfigModule, DatabaseModule, PlsqlModule, AuthModule, TenantsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
