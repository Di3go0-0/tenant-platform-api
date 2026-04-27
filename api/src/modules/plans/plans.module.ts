import { Module } from '@nestjs/common';
import { PlansController } from './plans.controller.js';
import { PlansService } from './plans.service.js';
import { PlansRepository } from './repositories/plans.repository.js';
import { AuthModule } from '../auth/index.js';

@Module({
  imports: [AuthModule],
  controllers: [PlansController],
  providers: [PlansService, PlansRepository],
  exports: [PlansService],
})
export class PlansModule {}
