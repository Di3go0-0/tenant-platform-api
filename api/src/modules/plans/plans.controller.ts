import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { PlansService } from './plans.service.js';
import { CreatePlanDto } from './dto/create-plan.dto.js';
import { UpdatePlanDto } from './dto/update-plan.dto.js';
import type { PlanEntity } from './types/plan.types.js';
import { AuthGuard } from '../auth/index.js';

@Controller('plans')
@UseGuards(AuthGuard)
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post()
  async create(@Body() dto: CreatePlanDto): Promise<PlanEntity> {
    return this.plansService.createPlan(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<PlanEntity[]> {
    return this.plansService.getAllPlans();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<PlanEntity> {
    return this.plansService.getPlanById(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePlanDto,
  ): Promise<PlanEntity> {
    return this.plansService.updatePlan(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.plansService.deletePlan(id);
  }
}
