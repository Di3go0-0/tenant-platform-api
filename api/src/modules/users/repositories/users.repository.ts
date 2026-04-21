import { Injectable } from '@nestjs/common';
import { PlsqlService } from '../../../core/plsql/index.js';
import { UserQueries } from '../sql/users.sql.js';
import { UserEntity } from '../types/user.entity.js';

@Injectable()
export class UsersRepository {
  constructor(private readonly plsqlService: PlsqlService) {}

  async create(email: string, passwordHash: string): Promise<UserEntity> {
    const user = await this.plsqlService.executeQueryOne<UserEntity>(
      UserQueries.CREATE_USER,
      [email, passwordHash],
    );
    if (!user) throw new Error('Failed to create user');
    return user;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.plsqlService.executeQueryOne<UserEntity>(
      UserQueries.FIND_BY_EMAIL,
      [email],
    );
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.plsqlService.executeQueryOne<UserEntity>(
      UserQueries.FIND_BY_ID,
      [id],
    );
  }
}
