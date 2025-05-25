import { User } from '@/modules/users/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { usersSeed } from '../data';

@Injectable()
export class SeedService {
  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}

  async createData() {
    try {
      this.userRepository.save(usersSeed);
    } catch (error) {
      console.log(error);
    }

    return 'Datos insertados en BD.';
  }
}
