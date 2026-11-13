import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findById(id: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  findByKeycloakId(keycloakId: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ keycloakId });
  }

  save(user: Partial<User>): Promise<User> {
    return this.usersRepository.save(user);
  }

  create(
    user: Pick<User, 'fullName' | 'email' | 'passwordHash'>,
  ): Promise<User> {
    return this.usersRepository.save(this.usersRepository.create(user));
  }
}
