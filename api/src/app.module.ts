import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule } from './infrastructure/config/index.js';
import { DatabaseModule } from './infrastructure/database/index.js';
import { PlsqlModule } from './core/plsql/index.js';

@Module({
  imports: [ConfigModule, DatabaseModule, PlsqlModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
