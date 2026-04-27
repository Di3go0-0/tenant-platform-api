import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PlansRepository } from './repositories/plans.repository.js';
import { PlanEntity, CreatePlanData, UpdatePlanData } from './types/plan.types.js';

@Injectable()
export class PlansService {
  constructor(private readonly plansRepository: PlansRepository) {}

  async createPlan(data: CreatePlanData): Promise<PlanEntity> {
    const existing = await this.plansRepository.findByName(data.name);
    if (existing) {
      throw new ConflictException('Plan name already exists');
    }

    return this.plansRepository.create(
      data.name,
      data.description ?? null,
      data.maxUsers,
      data.maxRequestsPerMinute,
      data.price,
    );
  }

  async getAllPlans(): Promise<PlanEntity[]> {
    return this.plansRepository.findAll();
  }

  async getPlanById(id: string): Promise<PlanEntity> {
    const plan = await this.plansRepository.findById(id);
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }
    return plan;
  }

  async updatePlan(id: string, data: UpdatePlanData): Promise<PlanEntity> {
    const plan = await this.plansRepository.findById(id);
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    if (data.name && data.name !== plan.name) {
      const existing = await this.plansRepository.findByName(data.name);
      if (existing) {
        throw new ConflictException('Plan name already exists');
      }
    }

    const updated = await this.plansRepository.update(
      id,
      data.name ?? null,
      data.description ?? null,
      data.maxUsers ?? null,
      data.maxRequestsPerMinute ?? null,
      data.price ?? null,
    );
    if (!updated) {
      throw new NotFoundException('Plan not found');
    }
    return updated;
  }

  async deletePlan(id: string): Promise<void> {
    const plan = await this.plansRepository.findById(id);
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    await this.plansRepository.delete(id);
  }
}
