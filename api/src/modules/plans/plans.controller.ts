import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PlansService } from './plans.service.js';
import { CreatePlanDto } from './dto/create-plan.dto.js';
import { UpdatePlanDto } from './dto/update-plan.dto.js';
import type { PlanEntity } from './types/plan.types.js';
import { AuthGuard } from '../auth/index.js';
import { ParseUUIDPipe } from '../../common/pipes/parse-uuid.pipe.js';

@ApiTags('Plans')
@ApiBearerAuth()
@Controller('plans')
@UseGuards(AuthGuard)
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post()
  @ApiOperation({ summary: 'Create a plan' })
  @ApiResponse({ status: 201, description: 'Plan created' })
  @ApiResponse({ status: 409, description: 'Plan name already exists' })
  async create(@Body() dto: CreatePlanDto): Promise<PlanEntity> {
    return this.plansService.createPlan(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all plans' })
  async findAll(): Promise<PlanEntity[]> {
    return this.plansService.getAllPlans();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a plan by ID' })
  @ApiResponse({ status: 200, description: 'Plan found' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<PlanEntity> {
    return this.plansService.getPlanById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a plan' })
  @ApiResponse({ status: 200, description: 'Plan updated' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePlanDto,
  ): Promise<PlanEntity> {
    return this.plansService.updatePlan(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a plan' })
  @ApiResponse({ status: 204, description: 'Plan deleted' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.plansService.deletePlan(id);
  }
}
