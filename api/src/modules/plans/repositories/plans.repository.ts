import { Injectable } from '@nestjs/common';
import { PlsqlService } from '../../../core/plsql/index.js';
import { PlanQueries } from '../sql/plans.sql.js';
import { PlanEntity } from '../types/plan.types.js';

@Injectable()
export class PlansRepository {
  constructor(private readonly plsqlService: PlsqlService) {}

  async create(
    name: string,
    description: string | null,
    maxUsers: number,
    maxRequestsPerMinute: number,
    price: number,
  ): Promise<PlanEntity> {
    const plan = await this.plsqlService.executeQueryOne<PlanEntity>(
      PlanQueries.CREATE_PLAN,
      [name, description, maxUsers, maxRequestsPerMinute, price],
    );
    if (!plan) throw new Error('Failed to create plan');
    return plan;
  }

  async findById(id: string): Promise<PlanEntity | null> {
    return this.plsqlService.executeQueryOne<PlanEntity>(
      PlanQueries.FIND_BY_ID,
      [id],
    );
  }

  async findByName(name: string): Promise<PlanEntity | null> {
    return this.plsqlService.executeQueryOne<PlanEntity>(
      PlanQueries.FIND_BY_NAME,
      [name],
    );
  }

  async findAll(): Promise<PlanEntity[]> {
    return this.plsqlService.executeQueryMany<PlanEntity>(
      PlanQueries.FIND_ALL,
    );
  }

  async update(
    id: string,
    name: string | null,
    description: string | null,
    maxUsers: number | null,
    maxRequestsPerMinute: number | null,
    price: number | null,
  ): Promise<PlanEntity | null> {
    return this.plsqlService.executeQueryOne<PlanEntity>(
      PlanQueries.UPDATE_PLAN,
      [id, name, description, maxUsers, maxRequestsPerMinute, price],
    );
  }

  async delete(id: string): Promise<PlanEntity | null> {
    return this.plsqlService.executeQueryOne<PlanEntity>(
      PlanQueries.DELETE_PLAN,
      [id],
    );
  }
}
