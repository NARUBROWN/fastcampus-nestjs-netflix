import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { InsertResult, Repository } from 'typeorm';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdInfo = await this.userRepository.createQueryBuilder()
    .insert()
    .into(User)
    .values(createUserDto)
    .execute();

    const user = await this.userRepository.createQueryBuilder('user')
    .where('id = :id', { id : createdInfo.identifiers[0].id })
    .getOne();

    if (!user) {
      throw new NotFoundException('User가 존재하지 않습니다.');
    }

    return user;
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<User | null> {
    const user = await this.userRepository.createQueryBuilder('user')
    .where('id = :id', { id })
    .getOne();

    if (!user) {
      throw new NotFoundException(`존재하지 않는 ID입니다. ${id}`);      
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    await this.userRepository.createQueryBuilder()
    .update(User)
    .set(updateUserDto)
    .where('id = :id', { id })
    .execute();

    const user = await this.userRepository.createQueryBuilder('user')
    .where('id = :id', { id })
    .getOne();

    if (!user) {
      throw new NotFoundException('User가 존재하지 않습니다.');
    }

    return user;
  }

  async remove(id: number): Promise<number> {
    const user = await this.userRepository.createQueryBuilder('user')
    .where('id = :id', { id })
    .getOne();

    if (!user) {
      throw new NotFoundException(`존재하지 않는 ID입니다. ${id}`);
    }
    
    await this.userRepository.createQueryBuilder()
    .delete()
    .from(User, 'user')
    .where('id = :id', { id : user.id })
    .execute();

    return user.id;
  }
}
