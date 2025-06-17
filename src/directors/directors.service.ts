import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Director } from './entites/director.entity';
import { Repository } from 'typeorm';
import { CreateDirectorDto } from './dto/create-director.dto';
import { UpdateDirectorDto } from './dto/update-director.dto';

@Injectable()
export class DirectorsService {
    constructor(
        @InjectRepository(Director)
        private readonly directorRepository: Repository<Director>
    ) {}

    async create(createDireactor: CreateDirectorDto) {
        return await this.directorRepository.save(createDireactor);
    }

    async findAll() {
        return await this.directorRepository.find();
    }

    async findOne(id: number) {
        return await this.directorRepository.findOne({
            where: {
                id
            }
        });
    }

    async update(id: number, updateDirectorDto: UpdateDirectorDto) {
        const director = await this.directorRepository.findOne({
            where: {
                id
            }
        });

        if (!director) {
            throw new NotFoundException('존재하지 않는 ID의 감독입니다.');
        }
        
        await this.directorRepository.update(
            {id}, updateDirectorDto
        );

        const newDirector = await this.directorRepository.findOne({
            where: {
                id
            }
        });

        return newDirector;
    }

    async remove(id: number) {
        const director = await this.directorRepository.findOne({
            where: {
                id
            }
        });

        if (!director) {
            throw new NotFoundException('존재하지 않는 ID의 감독입니다.');
        }

        await this.directorRepository.delete(id);
        
        return id;
    }
}
