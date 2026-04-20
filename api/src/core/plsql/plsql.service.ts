import { Injectable, Inject, OnModuleDestroy, Logger } from '@nestjs/common';
import { Pool, QueryResult, QueryResultRow } from 'pg';
import { DATABASE_POOL } from '../../infrastructure/database/index.js';

@Injectable()
export class PlsqlService implements OnModuleDestroy {
  private readonly logger = new Logger(PlsqlService.name);

  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async executeQuery<T extends QueryResultRow = any>(
    query: string,
    params?: unknown[],
  ): Promise<QueryResult<T>> {
    this.logger.debug(`Executing query: ${query}`);
    try {
      return await this.pool.query<T>(query, params);
    } catch (error) {
      this.logger.error(`Query failed: ${query}`, (error as Error).stack);
      throw error;
    }
  }

  async executeQueryOne<T extends QueryResultRow = any>(
    query: string,
    params?: unknown[],
  ): Promise<T | null> {
    const result = await this.executeQuery<T>(query, params);
    return result.rows[0] ?? null;
  }

  async executeQueryMany<T extends QueryResultRow = any>(
    query: string,
    params?: unknown[],
  ): Promise<T[]> {
    const result = await this.executeQuery<T>(query, params);
    return result.rows;
  }

  async executeTransaction<T>(
    callback: (
      query: (sql: string, params?: unknown[]) => Promise<QueryResult>,
    ) => Promise<T>,
  ): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback((sql, params) => client.query(sql, params));
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error('Transaction rolled back', (error as Error).stack);
      throw error;
    } finally {
      client.release();
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
