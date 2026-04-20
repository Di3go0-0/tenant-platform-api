import { Injectable } from '@nestjs/common';
import { UsersRepository } from './repositories/users.repository.js';
import { UserEntity } from './interfaces/user.entity.js';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(email: string, passwordHash: string): Promise<UserEntity> {
    return this.usersRepository.create(email, passwordHash);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.usersRepository.findByEmail(email);
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.usersRepository.findById(id);
  }
}
